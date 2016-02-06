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
var ariaWidgetsContainerTabStyle = require("./TabStyle.tpl.css");
var ariaWidgetsContainerContainer = require("./Container");


/**
 * Tab widget
 */
module.exports = Aria.classDefinition({
    $classpath : "aria.widgets.container.Tab",
    $extends : ariaWidgetsContainerContainer,
    $css : [ariaWidgetsContainerTabStyle],

    /**
     * Tab constructor
     * @param {aria.widgets.CfgBeans:TabCfg} cfg the widget configuration
     * @param {aria.templates.TemplateCtxt} ctxt template context
     */
    $constructor : function (cfg, ctxt) {
        this.$Container.constructor.apply(this, arguments);
        this._setSkinObj(this._skinnableClass);

        /**
         * Whether the mouse is over the Tab or not
         * @type Boolean
         * @protected
         */
        this._mouseOver = false;

        /**
         * Whether the Tab is focused or not
         * @type Boolean
         * @protected
         */
        this._hasFocus = false;

        this._updateState(true);

        /**
         * Frame instance. Actual instance depends on the skin
         * @type aria.widgets.frames.Frame
         * @protected
         */
        this._frame = ariaWidgetsFramesFrameFactory.createFrame({
            height : cfg.height,
            state : this._state,
            width : cfg.width,
            sclass : cfg.sclass,
            skinnableClass : this._skinnableClass,
            printOptions : cfg.printOptions,
            id : Aria.testMode || cfg.waiAria ? this._getFrameId() : undefined
        });

        /**
         * Override default widget's span style
         * @type String
         * @protected
         * @override
         */
        this._spanStyle = "z-index:100;vertical-align:top;";

        // ---------------------------------------------------------------------

        this._tabIndex = '0'; // used by base classes to generate markup
        this._ariaRole = 'tab'; // used by base classes to generate markup

        // aria-labelledby (TabPanel) ------------------------------------------

        this._updateTabPanelLabelId();

        // aria-controls (Tab) -------------------------------------------------

        // set listener
        this._removeControlledTabPanelIdListener = this._listenToControlledTabPanelId();

        // use it if already available
        var id = this._getControlledTabPanelId();
        if (id != null) {
            this._ariaControls = id; // used by base classes to generate markup
        }
    },

    $destructor : function () {
        if (this._frame) {
            this._frame.$dispose();
            this._frame = null;
        }

        this._removeControlledTabPanelIdListener();

        this.$Container.$destructor.call(this);
    },

    $prototype : {
        /**
         * Skinnable class to use for this widget.
         * @protected
         * @type String
         */
        _skinnableClass : "Tab",

        /**
         * Called when a new instance is initialized
         * @protected
         */
        _init : function () {
            var domElt = this.getDom();
            var actingDom = aria.utils.Dom.getDomElementChild(domElt, 0);

            if (actingDom) {
                this._frame.linkToDom(actingDom);
            }

            aria.widgets.container.Tab.superclass._init.call(this);
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
        // TabPanel label id management (from Tab to TabPanel)
        ////////////////////////////////////////////////////////////////////////

        _getTabPanelLabelIdPropertyName : function () {
            return this._getCommonBindingMetaDataPropertyName('labelId');
        },

        _getFrameId : function () {
            return this._domId + "_" + this._cfg.tabId;
        },

        _updateTabPanelLabelId : function (selectedTab) {
            // --------------------------------------------------- destructuring

            var cfg = this._cfg;

            var tabId = cfg.tabId;

            var binding = this._getConfigurationOfCommonBinding();
            var inside = binding.inside;
            var to = binding.to;

            // ---------------------------------------------------- facilitation

            if (selectedTab == null) {
                selectedTab = inside[to];
            }

            // ------------------------------------------------------ processing

            var isSelected = selectedTab === tabId;

            if (isSelected) {
                var id = this._getFrameId();
                var property = this._getTabPanelLabelIdPropertyName();

                ariaUtilsJson.setValue(inside, property, id);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        // Tab controls id management (from TabPanel to Tab)
        ////////////////////////////////////////////////////////////////////////

        _getControlledTabPanelIdPropertyName : function () {
            return this._getCommonBindingMetaDataPropertyName('controlledTabPanelId');
        },

        _getControlledTabPanelId : function () {
            // --------------------------------------------------- destructuring

            var configurationOfCommonBinding = this._getConfigurationOfCommonBinding();

            var inside = configurationOfCommonBinding.inside;
            var property = this._getControlledTabPanelIdPropertyName();

            // ------------------------------------------------------ processing

            var id = inside[property];

            // ---------------------------------------------------------- return

            return id;
        },

        _listenToControlledTabPanelId : function () {
            // --------------------------------------------------- destructuring

            var configurationOfCommonBinding = this._getConfigurationOfCommonBinding();

            var inside = configurationOfCommonBinding.inside;
            var property = this._getControlledTabPanelIdPropertyName();

            // ------------------------------------------------------ processing

            var args = [inside, property, {
                fn: this._onControlledTabPanelIdChange,
                scope: this
            }];

            ariaUtilsJson.addListener.apply(ariaUtilsJson, args);

            var removeListener = function () {
                ariaUtilsJson.removeListener.apply(ariaUtilsJson, args);
            };

            // ---------------------------------------------------------- return

            return removeListener;
        },

        _onControlledTabPanelIdChange : function (arg) {
            var id = arg.newValue;
            this._reactToControlledTabPanelIdChange(id);
        },

        _reactToControlledTabPanelIdChange : function (id) {
            // --------------------------------------------------- destructuring

            var element = this._domElt;

            // ---------------------------------------------------- facilitation

            if (id == null) {
                id = this._getControlledTabPanelId();
            }

            // ------------------------------------------------------ processing

            if (element == null) {
                this._ariaControls = id; // XXX useless, too late apparently...
            } else {
                element.setAttribute('aria-controls', id);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        /**
         * Give focus to the element representing the focus for this widget
         */
        _focus : function () {
            try {
                this.getDom().focus();
            } catch (ex) {
                // FIXME: fix for IE7, investigate why it may fail, actually, why should this work???
            }
        },

        /**
         * Internal method called when one of the model properties that the widget is bound to has changed Must be
         * overridden by sub-classes defining bindable properties
         * @param {String} propertyName the property name
         * @param {Object} newValue the new value
         * @param {Object} oldValue the old property value
         * @protected
         */
        _onBoundPropertyChange : function (propertyName, newValue, oldValue) {
            // --------------------------------------------------- destructuring

            var cfg = this._cfg;
            var tabId = cfg.tabId;

            // ------------------------------------------------------ processing

            var changedState = false;
            if (propertyName === "selectedTab") {
                var isSelected = newValue === tabId;
                var wasSelected = oldValue === tabId;

                if (isSelected || wasSelected) {
                    changedState = true;
                }
            } else {
                this.$Container._onBoundPropertyChange.call(this, propertyName, newValue, oldValue);
            }

            if (changedState) {
                cfg[propertyName] = newValue;
                this._updateState();

                if (cfg.waiAria) {
                    var element = this.getDom();

                    if (isSelected) {
                        element.setAttribute('aria-selected', 'true');
                        // element.setAttribute('tabindex', '0');
                    } else if (wasSelected) {
                        element.removeAttribute('aria-selected');
                        // element.removeAttribute('tabindex');
                    }

                    this._updateTabPanelLabelId(newValue);
                }
            }
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        /**
         * Internal function to generate the internal widget markup
         * @param {aria.templates.MarkupWriter} out
         * @protected
         */
        _widgetMarkupBegin : function (out) {
            this._frame.writeMarkupBegin(out);
        },

        /**
         * Internal function to generate the internal widget markup
         * @param {aria.templates.MarkupWriter} out
         * @protected
         */
        _widgetMarkupEnd : function (out) {
            this._frame.writeMarkupEnd(out);
        },

        /**
         * A private method to set this objects skin object
         * @param {String} widgetName
         * @protected
         */
        _setSkinObj : function (widgetName) {
            this._skinObj = aria.widgets.AriaSkinInterface.getSkinObject(widgetName, this._cfg.sclass);
        },

        /**
         * Internal method to update the state of the tab, from the config and the mouse over variable
         * @param {Boolean} skipChangeState - If true we don't update the state in the frame as the frame may not be
         * initialized
         * @protected
         */
        _updateState : function (skipChangeState) {
            var state = "normal";
            var cfg = this._cfg;

            if (cfg.disabled) {
                state = "disabled";
            } else if (cfg.tabId === cfg.selectedTab) {
                state = "selected";
            } else {
                if (this._mouseOver) {
                    state = "msover";
                }
            }

            if (this._hasFocus) {
                state += "Focused";
            }
            this._state = state;

            if (!skipChangeState) {
                // force widget - DOM mapping
                this.getDom();
                this._frame.changeState(this._state);
            }
        },

        /**
         * Set the current tab as selected
         * @protected
         */
        _selectTab : function () {
            this.changeProperty("selectedTab", this._cfg.tabId);
        },

        /**
         * The method called when the markup is clicked
         * @param {aria.DomEvent} domEvt
         * @protected
         */
        _dom_onclick : function (domEvt) {
            this._selectTab();
            if (this._cfg && !this._hasFocus) {
                this._focus();
            }
        },

        /**
         * Internal method to handle the mouse over event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onmouseover : function (domEvt) {
            this.$Container._dom_onmouseover.call(this, domEvt);
            this._mouseOver = true;
            this._updateState();

        },

        /**
         * Internal method to handle the mouse out event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onmouseout : function (domEvt) {
            this.$Container._dom_onmouseout.call(this, domEvt);
            this._mouseOver = false;
            this._updateState();

        },

        /**
         * Internal method to handle focus event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onfocus : function (domEvt) {
            this._hasFocus = true;
            this._updateState();
        },

        /**
         * Internal method to handle blur event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onblur : function (domEvt) {
            this._hasFocus = false;
            this._updateState();
        },

        /**
         * Internal method to handle keyboard event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onkeyup : function (domEvt) {
            return false;
        },

        /**
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onkeydown : function (domEvt) {
            if (domEvt.keyCode == aria.DomEvent.KC_SPACE || domEvt.keyCode == aria.DomEvent.KC_ENTER) {
                this._selectTab();
            }
        }

    }
});
