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

var ariaUtilsJson = require('ariatemplates/utils/Json');
var ariaUtilsString = require('ariatemplates/utils/String');

var ariaUtilsDom = require('ariatemplates/utils/Dom');

var ariaPopupsPopupManager = require('ariatemplates/popups/PopupManager');



////////////////////////////////////////////////////////////////////////////////
// Model: Dialog
////////////////////////////////////////////////////////////////////////////////

function Dialog(options) {
    // -------------------------------------------------------------- properties

    if (options == null) {
        options = {};
    }

    var wai = options.wai;
    if (wai == null) {
        wai = false;
    }
    this.wai = wai;

    var fullyEmpty = options.fullyEmpty;
    if (fullyEmpty == null) {
        fullyEmpty = false;
    }
    this.fullyEmpty = fullyEmpty;

    var displayInContainer = options.displayInContainer;
    if (displayInContainer == null) {
        displayInContainer = false;
    }
    this.displayInContainer = displayInContainer;

    var titlePart = '';
    if (wai) {
        titlePart += ' (wai)';
    }
    if (fullyEmpty) {
        titlePart += ' (fully empty)';
    }
    if (displayInContainer) {
        titlePart += ' (in container)';
    }

    var buttonLabel = options.buttonLabel;
    if (buttonLabel == null) {
        buttonLabel = 'Open dialog' + titlePart;
    }
    this.buttonLabel = buttonLabel;

    // -------------------------------------------------------------- attributes

    var id = 'dialog';
    if (wai) {
        id += '_wai';
    }
    if (fullyEmpty) {
        id += '_fullyEmpty';
    }
    if (displayInContainer) {
        id += '_displayInContainer';
    }
    this.id = id;

    var buttonId = id + '_button';
    this.buttonId = buttonId;

    var elementBeforeId = 'before_' + buttonId;
    this.elementBeforeId = elementBeforeId;

    var title = 'Dialog' + titlePart;
    this.title = title;

    var visible = false;
    this.visible = visible;

    var visibleBinding = {
        inside: this,
        to: 'visible'
    };
    this.visibleBinding = visibleBinding;

    var configuration = {
        id: id,
        waiAria: wai,

        closable: !fullyEmpty,
        closeLabel: 'close me',
        maximizable: !fullyEmpty,
        maximizeLabel: 'maximize me',
        modal: true,
        width: 400,
        maxHeight: 500,

        title: title,

        macro: 'dialogContent',

        bind: {
            'visible': visibleBinding
        }
    };
    if (displayInContainer) {
        configuration.container = 'container';
    }
    this.configuration = configuration;
}

Dialog.prototype.open = function () {
    var visibleBinding = this.visibleBinding;
    ariaUtilsJson.setValue(visibleBinding.inside, visibleBinding.to, true);
};



////////////////////////////////////////////////////////////////////////////////
// Model: Test
////////////////////////////////////////////////////////////////////////////////

module.exports = Aria.classDefinition({
    $classpath : 'test.aria.widgets.wai.popup.dialog.modal.ModalDialogTest',
    $extends : require('test/EnhancedRobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$EnhancedRobotTestCase.constructor.call(this);

        // ---------------------------------------------------------- processing

        var dialogs = [];
        dialogs.push(new Dialog({
            wai: false
        }));

        dialogs.push(new Dialog({
            wai: true
        }));
        dialogs.push(new Dialog({
            wai: true,
            fullyEmpty: true
        }));
        dialogs.push(new Dialog({
            wai: true,
            displayInContainer: true
        }));

        var data = {
            dialogs: dialogs
        };

        this.setTestEnv({
            data: data
        });
    },

    $prototype : {
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
            this._localAsyncSequence(function (add) {
                // attributes --------------------------------------------------

                add('_testLabel', dialog);
                add('_testElementsHiding', dialog);

                // behavior ----------------------------------------------------

                add('_testAutomaticFocus', dialog);
                add('_testFocusRestoration', dialog);
                add('_testFocusCycling', dialog);

                add('_testIcons', dialog);
            }, callback);
        },



        ////////////////////////////////////////////////////////////////////////
        // Tests: attributes
        ////////////////////////////////////////////////////////////////////////

        _testLabel : function (callback, dialog) {
            // --------------------------------------------------- configuration

            var attributeName = 'aria-labelledby';

            // --------------------------------------------------- destructuring

            var wai = dialog.wai;
            var id = dialog.id;
            var title = dialog.title;

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);
                add(this._createAsyncWrapper(check));
                add('_closeDialog', dialog);
            }, callback);

            // ------------------------------------------------- local functions

            function check() {
                var dialogInstance = this.getWidgetInstance(id);
                var dialogContainer = dialogInstance._popup.domElement;

                var labelId = dialogContainer.getAttribute(attributeName);

                if (!wai) {
                    this.assertTrue(
                        labelId == null,
                        'Dialog should not have a label.'
                    );
                } else {
                    var labelElement = ariaUtilsDom.getElementById(labelId);

                    this.assertTrue(
                        labelElement != null,
                        ariaUtilsString.substitute(
                            'Label element should exist, id: %1', [
                            labelId
                        ])
                    );

                    var actual = labelElement.textContent;
                    var expected = title;

                    this.assertTrue(
                        actual === expected,
                        ariaUtilsString.substitute(
                            'Label content is not the expected one: "%1" instead of "%2"', [
                            actual,
                            expected
                        ])
                    );
                }
            }
        },

        _testElementsHiding : function (callback, dialog) {
            // --------------------------------------------------- configuration

            var attributeName = 'aria-hidden';
            var expectedValue = 'true';

            // --------------------------------------------------- destructuring

            var id = dialog.id;
            var wai = dialog.wai;

            // --------------------------------------------------- local globals

            var widgetDom;
            var children;

            function getChildrenElements() {
                widgetDom = this._getWidgetDom(id);

                var parentElement = widgetDom.parentElement;
                children = parentElement.children;
            }

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);
                add(this._createAsyncWrapper(getChildrenElements));
                add(this._createAsyncWrapper(checkWhenOpen));

                add('_closeDialog', dialog);
                add(this._createAsyncWrapper(checkWhenClosed));
            }, callback);

            // ------------------------------------------------- local functions

            function checkWhenOpen() {
                checkChildren.call(this, function (element) {
                    return wai && element !== widgetDom;
                });
            }

            function checkWhenClosed() {
                checkChildren.call(this, function (element) {
                    return false;
                });
            }

            function checkChildren(checkIfShouldBeHidden) {
                for (var index = 0, length = children.length; index < length; index++) {
                    var child = children[index];

                    var shouldBeHidden = checkIfShouldBeHidden.call(this, child);
                    checkElement.call(this, child, shouldBeHidden);
                }
            }

            function checkElement(element, shouldBeHidden) {
                if (shouldBeHidden == null) {
                    shouldBeHidden = true;
                }

                var actualValue = element.getAttribute(attributeName);

                var condition;
                var message;

                if (shouldBeHidden) {
                    condition = actualValue === expectedValue;
                    message = 'Element should be hidden.';
                } else {
                    condition = !actualValue;
                    message = 'Element should not be hidden.';
                }

                this.assertTrue(condition, message);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        // Tests: behavior
        ////////////////////////////////////////////////////////////////////////

        _testIcons : function (callback, dialog) {
            var wai = dialog.wai;
            var fullyEmpty = dialog.fullyEmpty;

            var isOpened = this._createIsDialogOpenedPredicate(dialog.id);

            this._localAsyncSequence(function (add) {
                if (wai) {
                    if (!fullyEmpty) {
                        add('_testMaximizeIcon', dialog);
                        add('_testCloseIcon', dialog);
                    } else {
                        add('_openDialog', dialog);
                        add('_closeDialog', dialog);
                        add(isOpened.waitForFalse);
                    }
                } else {
                    add('_openDialog', dialog);

                    add('_pressEnter');
                    add(isOpened.waitForTrue);

                    add('_closeDialog', dialog);
                }
            }, callback);
        },

        _testMaximizeIcon : function (callback, dialog) {
            var isMaximized = this._createPredicate(function () {
                var dialogInstance = this.getWidgetInstance(dialog.id);
                return dialogInstance._cfg.maximized;
            }, function (shouldBeTrue) {
                return ariaUtilsString.substitute('Dialog with id "%1" should%2be maximized.', [
                    dialog.id,
                    shouldBeTrue ? ' ' : ' not '
                ]);
            });

            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);
                add('_navigateForward');

                add('_pressEnter');
                add(isMaximized.waitForTrue);

                add('_pressEnter');
                add(isMaximized.waitForFalse);

                add('_closeDialog', dialog);
            }, callback);
        },

        _testCloseIcon : function (callback, dialog) {
            var isOpened = this._createIsDialogOpenedPredicate(dialog.id);

            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);

                add('_pressEnter');
                add(isOpened.waitForFalse);
            }, callback);
        },

        _testAutomaticFocus : function (callback, dialog) {
            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);

                add('_checkWidgetIsFocused', dialog.id);

                add('_closeDialog', dialog);
            }, callback);
        },

        _testFocusRestoration : function (callback, dialog) {
            // --------------------------------------------------- local globals

            var openingElement;

            function getOpeningElement(next) {
                this._localAsyncSequence(function (add) {
                    add('_focusWidget', dialog.buttonId);
                    add(this._createAsyncWrapper(function () {
                        openingElement = this._getActiveElement();
                    }));
                }, next);
            }

            // ------------------------------------------------------ processing

            var isOpeningElementFocused = this._createPredicate(function () {
                return this._getActiveElement() === openingElement;
            }, function () {
                return 'Focus was not restored properly on the button after closing the dialog.';
            });

            this._localAsyncSequence(function (add) {
                add(getOpeningElement);

                add('_openDialog', dialog);
                add('_closeDialog', dialog);

                add(isOpeningElementFocused.waitForTrue);
            }, callback);

        },

        _testFocusCycling : function (callback, dialog) {
            callback();
        },



        ////////////////////////////////////////////////////////////////////////
        // Local library: dialog management
        ////////////////////////////////////////////////////////////////////////

        _openDialog : function (callback, dialog) {
            var isOpened = this._createIsDialogOpenedPredicate(dialog.id);

            this._localAsyncSequence(function (add) {
                add('_focusWidget', dialog.buttonId);
                add('_pressEnter');
                add(isOpened.waitForTrue);
            }, callback);
        },

        _closeDialog : function (callback, dialog) {
            var isOpened = this._createIsDialogOpenedPredicate(dialog.id);

            this._localAsyncSequence(function (add) {
                add('_pressEscape');
                add(isOpened.waitForFalse);
            }, callback);
        }
    }
});
