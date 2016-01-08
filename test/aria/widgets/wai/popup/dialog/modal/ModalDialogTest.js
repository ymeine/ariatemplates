/*
 * Copyright 2016 Amadeus s.a.s.
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

var Aria = require('ariatemplates/Aria');

var ariaUtilsDom = require('ariatemplates/utils/Dom');
var ariaUtilsJson = require('ariatemplates/utils/Json');

var ariaPopupsPopupManager = require('ariatemplates/popups/PopupManager');



function Dialog(wai) {
    // -------------------------------------------------------------- properties

    this.wai = wai;

    // -------------------------------------------------------------- attributes

    var id = 'dialogWai' + (wai ? 'Enabled' : 'Disabled');
    this.id = id;

    var buttonId = id + '_button';
    this.buttonId = buttonId;

    var elementBeforeId = 'before_' + buttonId;
    this.elementBeforeId = elementBeforeId;

    this.buttonLabel = 'Open dialog' + (wai ? ' (wai)' : '');
    this.title = 'Dialog' + (wai ? ' (wai)' : '');

    this.visible = false;
    this.visibleBinding = {
        inside: this,
        to: 'visible'
    };
}

Dialog.prototype.open = function () {
    var visibleBinding = this.visibleBinding;

    ariaUtilsJson.setValue(visibleBinding.inside, visibleBinding.to, true);
};



module.exports = Aria.classDefinition({
    $classpath : "test.aria.widgets.wai.popup.dialog.modal.ModalDialogTest",
    $extends : require('ariatemplates/jsunit/RobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$RobotTestCase.constructor.call(this);

        // ---------------------------------------------------------- processing

        var dialogs = [new Dialog(true), new Dialog(false)];

        var data = {
            dialogs: dialogs
        };

        this.setTestEnv({
            data: data
        });
    },

    $prototype : {
        ////////////////////////////////////////////////////////////////////////
        // Library
        ////////////////////////////////////////////////////////////////////////

        _asyncIterate : function (array, callback, onend, thisArg) {
            var index = 0;

            function iterate () {
                var currentIndex = index;

                if (currentIndex >= array.length) {
                    onend.call(thisArg, array);
                } else {
                    index++;

                    var item = array[currentIndex];
                    callback.call(thisArg, iterate, item, currentIndex, array);
                }
            }

            iterate();
        },

        _asyncSequence : function (functions, callback, thisArg) {
            this._asyncIterate(functions, function (next, fn) {
                fn.call(this, next);
            }, callback, thisArg);
        },

        _waitForFocus : function (callback, element, strict) {
            if (strict == null) {
                strict = true;
            }

            this.waitFor({
                condition: function () {
                    var activeElement = Aria.$global.window.document.activeElement;

                    var result;
                    if (strict) {
                        result = activeElement === element;
                    } else {
                        result = ariaUtilsDom.isAncestor(activeElement, element);
                    }

                    return result;
                },

                callback: callback
            });
        },



        ////////////////////////////////////////////////////////////////////////
        // Tests
        ////////////////////////////////////////////////////////////////////////

        runTemplateTest : function () {
            this._asyncIterate(
                this.templateCtxt.data.dialogs,
                this._testDialog,
                this.end,
                this
            );
        },

        _testDialog : function (callback, dialog) {
            // -----------------------------------------------------------------

            var sequence = [];
            function add(callback) {
                sequence.push(callback);
            }

            // -----------------------------------------------------------------

            add(function (next) {
                this._openDialog(next, dialog);
            });

            add(function (next) {
                this._testLabel(next, dialog);
            });

            add(function (next) {
                this._testIcons(next, dialog);
            });

            add(function (next) {
                this._testAutomaticFocus(next, dialog);
            });

            add(function (next) {
                this._testFocusRestoration(next, dialog);
            });

            add(function (next) {
                this._testFocusCycling(next, dialog);
            });

            add(function (next) {
                this._testElementsHiding(next, dialog);
            });

            add(this._closeDialog);

            // -----------------------------------------------------------------

            this._asyncSequence(sequence, callback, this);
        },

        _testLabel : function (callback, dialog) {
            var wai = dialog.wai;

            var dialogInstance = this._getDialogInstance(dialog);
            var dialogContainer = dialogInstance._popup.domElement;

            var labelId = dialogContainer.getAttribute('aria-labelledby');

            if (!wai) {
                this.assertTrue(
                    labelId == null,
                    'Dialog should not have a label.'
                );
            } else {
                var labelElement = ariaUtilsDom.getElementById(labelId);

                this.assertTrue(
                    labelElement != null,
                    'Label element should exist, id: ' + labelId
                );

                var actual = labelElement.textContent;
                var expected = dialog.title;

                this.assertTrue(
                    actual === expected,
                    'Label content is not the expected one: "' + actual + '" instead of "' + expected + '".'
                );
            }

            callback();
        },

        _testIcons : function (callback, dialog) {
            console.log('_testIcons');
            callback();
        },

        _testAutomaticFocus : function (callback, dialog) {
            console.log('_testAutomaticFocus');
            callback();
        },

        _testFocusRestoration : function (callback, dialog) {
            console.log('_testFocusRestoration');
            callback();
        },

        _testFocusCycling : function (callback, dialog) {
            console.log('_testFocusCycling');
            callback();
        },

        _testElementsHiding : function (callback, dialog) {
            console.log('_testElementsHiding');
            callback();
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _openDialog : function (callback, dialog) {
            this._asyncSequence([
                function (next) {
                    this._goToWidget(next, dialog.buttonId);
                },
                this._pressEnter,
                function (next) {
                    this._waitForDialogOpen(next, dialog);
                }
            ], callback, this);
        },

        _waitForDialogOpen : function (callback, dialog) {
            // -----------------------------------------------------------------

            var id = dialog.id;

            var widgetInstance = this.getWidgetInstance(id);

            this.waitFor({
                scope: this,
                condition: function () {
                    return this._getDialogInstance(dialog) != null;
                },
                callback: callback
            });
        },

        _closeDialog : function (callback) {
            this._pressEscape(callback);
        },

        _closeDialogWithIcon : function (callback) {
            callback();
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _goToWidget : function (callback, id) {
            // -----------------------------------------------------------------

            this._asyncSequence([
                focusElementBefore,
                this._pressTab,
                wait
            ], callback, this);

            // -----------------------------------------------------------------

            function focusElementBefore(next) {
                var elementBefore = this.getElementById('before_' + id);
                elementBefore.focus();
                this._waitForFocus(next, elementBefore);
            }

            function wait(next) {
                var widgetInstance = this.getWidgetInstance(id);
                var widgetDom = widgetInstance.getDom();
                this._waitForFocus(next, widgetDom, false);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _leftClick : function (callback) {
            this.synEvent.click(null, callback);
        },

        _pressTab : function (callback) {
            this.synEvent.type(null, '[tab]', callback);
        },

        _pressEnter : function (callback) {
            this.synEvent.type(null, '[enter]', callback);
        },

        _pressEscape : function (callback) {
            this.synEvent.type(null, '[escape]', callback);
        },

        _pressShiftF10 : function (callback) {
            this.synEvent.type(null, '[<shift>][F10][>shift<]', callback);
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _getDialogInstance : function (dialog) {
            // ------------------------------------------------------ processing

            var dialogInstance = null;

            var popups = ariaPopupsPopupManager.openedPopups;

            for (var index = 0, length = popups.length; index < length; index++) {
                var popup = popups[index];

                var currentDialog = popup._parentDialog;
                if (currentDialog._cfg.title === dialog.title) {
                    dialogInstance = currentDialog;
                }
            }

            // ---------------------------------------------------------- return

            return dialogInstance;
        }
    }
});
