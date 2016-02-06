/*
 * Copyright 2012 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Aria = require("../../Aria");
var ariaUtilsJson = require("../../utils/Json");
var ariaWidgetsFramesFrameFactory = require("../frames/FrameFactory");
var ariaWidgetsContainerTabPanelStyle = require("./TabPanelStyle.tpl.css");
var ariaWidgetsContainerContainer = require("./Container");


/**
 * TabPanel widget
 */
module.exports = Aria.classDefinition({
    $classpath : "aria.widgets.container.TabPanel",
    $extends : ariaWidgetsContainerContainer,
    $css : [ariaWidgetsContainerTabPanelStyle],
    /**
     * TabPanel constructor
     * @param {aria.widgets.CfgBeans:TabPanelCfg} cfg the widget configuration
     * @param {aria.templates.TemplateCtxt} ctxt template context
     */
    $constructor : function (cfg, ctxt) {
        this.$Container.constructor.apply(this, arguments);
        this._setSkinObj(this._skinnableClass);

        this._frame = ariaWidgetsFramesFrameFactory.createFrame({
            height : cfg.height,
            state : "normal",
            width : cfg.width,
            sclass : cfg.sclass,
            skinnableClass : this._skinnableClass,
            printOptions : cfg.printOptions,
            block : cfg.block
        });

        this._defaultMargin = 0;

        // ---------------------------------------------------------------------

        this._spanStyle = "top:-1.5px;";

        this._tabIndex = '0';
        this._ariaRole = 'tabpanel';

        // ---------------------------------------------------------------------

        // aria-controls (Tab) -------------------------------------------------

        this._updateControlledTabPanelId();

        // aria-labelledby (TabPanel) ------------------------------------------

        // set listener
        this._removeLabelIdListener = this._listenToLabelId();

        // use it if already available
        var id = this._getLabelId();
        if (id != null) {
            this._ariaLabelledBy = id; // used by base classes to generate markup
        }
    },
    /**
     * TabPanel destructor
     */
    $destructor : function () {
        if (this._frame) {
            this._frame.$dispose();
            this._frame = null;
        }

        this._removeLabelIdListener();

        this.$Container.$destructor.call(this);
    },

    $prototype : {
        /**
         * Skinnable class to use for this widget.
         * @protected
         * @type String
         */
        _skinnableClass : "TabPanel",

        /**
         * Called when a new instance is initialized
         * @private
         */
        _init : function () {
            var frameDom = aria.utils.Dom.getDomElementChild(this.getDom(), 0);

            if (frameDom) {
                this._frame.linkToDom(frameDom);
            }

            this.$Container._init.call(this);
        },

        /**
         * Internal method called when one of the model properties that the widget is bound to has changed Must be
         * overridden by sub-classes defining bindable properties
         * @param {String} propertyName the property name
         * @param {Object} newValue the new value
         * @param {Object} oldValue the old property value
         */
        _onBoundPropertyChange : function (propertyName, newValue, oldValue) {
            if (propertyName == "selectedTab") {
                this._context.$refresh({
                    section : this._getSectionId()
                });

            } else {
                this.$Container._onBoundPropertyChange.call(this, propertyName, newValue, oldValue);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        // Tab & TabPanel communication
        ////////////////////////////////////////////////////////////////////////

        _getConfigurationOfCommonBinding : function () {
            return this._cfg.bind.selectedTab;
        },

        _getCommonBindingMetaDataPropertyName : function (name) {
            // --------------------------------------------------- destructuring

            var configurationOfCommonBinding = this._getConfigurationOfCommonBinding();
            var to = configurationOfCommonBinding.to;

            // ------------------------------------------------------ processing

            var property = 'aria:' + to + '_' + name;

            // ---------------------------------------------------------- return

            return property;
        },



        ////////////////////////////////////////////////////////////////////////
        // Tab controls id management (from TabPanel to Tab)
        ////////////////////////////////////////////////////////////////////////

        _getControlledTabPanelIdPropertyName : function () {
            return this._getCommonBindingMetaDataPropertyName('controlledTabPanelId');
        },

        _updateControlledTabPanelId : function () {
            // --------------------------------------------------- destructuring

            var binding = this._getConfigurationOfCommonBinding();
            var inside = binding.inside;

            var property = this._getControlledTabPanelIdPropertyName();

            var id = this._domId;

            // ------------------------------------------------------ processing

            ariaUtilsJson.setValue(inside, property, id);
        },



        ////////////////////////////////////////////////////////////////////////
        // Label id management (from TabPanel to Tab)
        ////////////////////////////////////////////////////////////////////////

        _getLabelIdPropertyName : function () {
            return this._getCommonBindingMetaDataPropertyName('labelId');
        },

        _getLabelId : function () {
            // --------------------------------------------------- destructuring

            var configurationOfCommonBinding = this._getConfigurationOfCommonBinding();

            var inside = configurationOfCommonBinding.inside;
            var property = this._getLabelIdPropertyName();

            // ------------------------------------------------------ processing

            var id = inside[property];

            // ---------------------------------------------------------- return

            return id;
        },

        _listenToLabelId : function () {
            // --------------------------------------------------- destructuring

            var configurationOfCommonBinding = this._getConfigurationOfCommonBinding();

            var inside = configurationOfCommonBinding.inside;
            var property = this._getLabelIdPropertyName();

            // ------------------------------------------------------ processing

            var args = [inside, property, {
                fn: this._onLabelIdChange,
                scope: this
            }];

            ariaUtilsJson.addListener.apply(ariaUtilsJson, args);

            var removeListener = function () {
                ariaUtilsJson.removeListener.apply(ariaUtilsJson, args);
            };

            // ---------------------------------------------------------- return

            return removeListener;
        },

        _onLabelIdChange : function (arg) {
            var id = arg.newValue;
            this._reactToLabelIdChange(id);
        },

        _reactToLabelIdChange : function (id) {
            // --------------------------------------------------- destructuring

            var element = this._domElt;

            // ---------------------------------------------------- facilitation

            if (id == null) {
                id = this._getLabelId();
            }

            // ------------------------------------------------------ processing

            if (element == null) {
                this._ariaLabelledBy = id; // XXX useless, too late apparently...
            } else {
                element.setAttribute('aria-labelledby', id);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _getSectionId : function () {
            return "__tabPanel_" + this._domId;
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        /**
         * Internal function to generate the internal widget markup
         * @param {aria.templates.MarkupWriter} out
         * @protected
         */
        _widgetMarkup : function (out) {
            var cfg = this._cfg;

            this._frame.writeMarkupBegin(out);
            out.beginSection({
                id : this._getSectionId(),
                macro : cfg.macro
            });
            out.endSection();
            this._frame.writeMarkupEnd(out);
        },

        /**
         * @param {aria.templates.MarkupWriter} out
         */
        writeMarkupBegin : function (out) {
            out.skipContent = true;
            this.$logError(this.INVALID_USAGE_AS_CONTAINER, ["TabPanel"]);
        },

        /**
         * @param {aria.templates.MarkupWriter} out
         */
        writeMarkupEnd : Aria.empty,

        /**
         * A protected method to set this objects skin object
         * @param {String} widgetName
         * @protected
         */
        _setSkinObj : function (widgetName) {
            this._skinObj = aria.widgets.AriaSkinInterface.getSkinObject(widgetName, this._cfg.sclass);
        }

    }
});
