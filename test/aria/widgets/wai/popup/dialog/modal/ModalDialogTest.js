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

function Dialog(wai, fullyEmpty, displayInContainer) {
    // -------------------------------------------------------------- properties

    if (wai == null) {
        wai = false;
    }
    this.wai = wai;

    if (fullyEmpty == null) {
        fullyEmpty = false;
    }
    this.fullyEmpty = fullyEmpty;

    if (displayInContainer == null) {
        displayInContainer = false;
    }
    this.displayInContainer = displayInContainer;

    // -------------------------------------------------------------- attributes

    var id = 'dialogWai' + (wai ? 'Enabled' : 'Disabled');
    this.id = id;

    var buttonId = id + '_button';
    this.buttonId = buttonId;

    var elementBeforeId = 'before_' + buttonId;
    this.elementBeforeId = elementBeforeId;

    this.buttonLabel = 'Open dialog' + (wai ? ' (wai)' : '');
    var title = 'Dialog' + (wai ? ' (wai)' : '');
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
    // ----------------------------------------------------------- destructuring

    var visibleBinding = this.visibleBinding;

    // -------------------------------------------------------------- processing

    ariaUtilsJson.setValue(visibleBinding.inside, visibleBinding.to, true);
};



////////////////////////////////////////////////////////////////////////////////
// Model: Test
////////////////////////////////////////////////////////////////////////////////

module.exports = Aria.classDefinition({
    $classpath : "test.aria.widgets.wai.popup.dialog.modal.ModalDialogTest",
    $extends : require('test/EnhancedRobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$EnhancedRobotTestCase.constructor.call(this);

        // ---------------------------------------------------------- processing

        var dialogs = [];
        dialogs.push(new Dialog(true));
        dialogs.push(new Dialog(false));

        var data = {
            dialogs: dialogs
        };

        this.setTestEnv({
            data: data
        });
    },

    $prototype : {
        ////////////////////////////////////////////////////////////////////////
        // Library: Dialog management
        ////////////////////////////////////////////////////////////////////////

        _getDialogInstance : function (dialog) {
            // ------------------------------------------------------ processing

            var dialogInstance = null;

            var popups = ariaPopupsPopupManager.openedPopups;

            for (var index = 0, length = popups.length; index < length; index++) {
                var popup = popups[index];

                var currentDialog = popup._parentDialog;
                var config = currentDialog._cfg;

                if (config.id === dialog) {
                    dialogInstance = currentDialog;
                }
            }

            // ---------------------------------------------------------- return

            return dialogInstance;
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
            this._localAsyncSequence(function (add) {
                // attributes --------------------------------------------------

                add('_testLabel', dialog);
                add('_testElementsHiding', dialog);

                // behavior ----------------------------------------------------

                add('_testAutomaticFocus', dialog);
                // add('_testFocusCycling', dialog);
                add('_testFocusRestoration', dialog);

                add('_testIcons', dialog);
            }, callback);
        },



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
                add(check);
                add('_closeDialog', dialog);
            }, callback);

            // -----------------------------------------------------------------

            function check(next) {
                var dialogInstance = this._getDialogInstance(id);
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

                next();
            }
        },

        _testElementsHiding : function (callback, dialog) {
            // --------------------------------------------------- configuration

            var attributeName = 'aria-hidden';
            var expectedValue = 'true';

            // --------------------------------------------------- destructuring

            var id = dialog.id;
            var wai = dialog.wai;

            // ------------------------------------------------------ processing

            var widgetDom;
            var children;

            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);
                add(getChildrenElements);
                add(checkWhenOpen);
                add('_closeDialog', dialog);
                add(checkWhenClosed);
            }, callback);

            // -----------------------------------------------------------------

            function getChildrenElements(next) {
                widgetDom = this._getWidgetDom(id);

                var parentElement = widgetDom.parentElement;
                children = parentElement.children;

                next();
            }

            function checkWhenOpen(next) {
                checkChildren.call(this, function (element) {
                    return wai && element !== widgetDom;
                });
                next();
            }

            function checkWhenClosed(next) {
                checkChildren.call(this, function (element) {
                    return false;
                });
                next();
            }

            // -----------------------------------------------------------------

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

        _testIcons : function (callback, dialog) {
            // --------------------------------------------------- destructuring

            var wai = dialog.wai;

            // ------------------------------------------------------ processing


            this._localAsyncSequence(function (add) {
                if (wai) {
                    add('_testMaximizeIcon', dialog);
                    add('_testCloseIcon', dialog);
                } else {
                    add('_openDialog', dialog);
                    add('_pressEnter');

                    add(function (next) {
                        var message = 'Dialog with id "%1" should be opened, since no icon should have been focused.';
                        message = ariaUtilsString.substitute(message, [
                            dialog.id
                        ]);
                        this._waitAndCheck(next, condition, message);

                        function condition() {
                            return this._isDialogOpened(dialog);
                        }
                    });

                    add('_closeDialog', dialog);
                }
            }, callback);
        },

        _testMaximizeIcon : function (callback, dialog) {
            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);
                add('_navigateForward');
                add('_pressEnter');
                add('_checkDialogIsMaximized', dialog, true);
                add('_pressEnter');
                add('_checkDialogIsMaximized', dialog, false);
                add('_closeDialog', dialog);
            }, callback);
        },

        _testCloseIcon : function (callback, dialog) {
            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);
                add('_pressEnter');
                add('_checkDialogIsClosed', dialog);
            }, callback);
        },

        _testAutomaticFocus : function (callback, dialog) {
            // -----------------------------------------------------------------

            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);
                add(check);
                add('_closeDialog', dialog);
            }, callback);

            // -----------------------------------------------------------------

            function check(next) {
                var activeElement = this._getActiveElement();
                var widgetDom = this._getWidgetDom(dialog.id);

                this.assertTrue(ariaUtilsDom.isAncestor(activeElement, widgetDom), 'Focus should be inside the dialog.');

                next();
            }
        },

        _testFocusCycling : function (callback, dialog) {
            // this._asyncSequence([
            //     function (next) {
            //         this._openDialog(next, dialog);
            //     },
            //     this._closeDialog
            // ], callback, this);

            callback();
        },

        _testFocusRestoration : function (callback, dialog) {
            // -----------------------------------------------------------------

            this._localAsyncSequence(function (add) {
                add('_openDialog', dialog);
                add('_closeDialog', dialog);
                add(check);
            }, callback);

            // -----------------------------------------------------------------

            function check(next) {
                var activeElement = this._getActiveElement();

                this._localAsyncSequence(function (add) {
                    add('_focusWidget', dialog.buttonId);
                    add(function (next) {
                        var openingElement = this._getActiveElement();

                        this.assertTrue(activeElement === openingElement, 'Focus was not restored properly on the button after closing the dialog.');
                        next();
                    });
                }, next);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        // Assertions
        ////////////////////////////////////////////////////////////////////////

        _checkDialogIsMaximized : function (callback, dialog, shouldBeMaximized) {
            // -------------------------------------- input arguments processing

            if (shouldBeMaximized == null) {
                shouldBeMaximized = true;
            }

            // ------------------------------------------------------ processing

            var dialogInstance = this._getDialogInstance(dialog.id);

            var message = 'Dialog with id "%1" should%2be maximized.';
            message = ariaUtilsString.substitute(message, [
                dialog.id,
                shouldBeMaximized ? ' ' : ' not '
            ]);

            this._waitAndCheck(callback, condition, message);

            // -----------------------------------------------------------------

            function condition() {
                return dialogInstance._cfg.maximized === shouldBeMaximized;
            }
        },

        _checkDialogIsClosed : function (callback, dialog) {
            // -----------------------------------------------------------------

            var message = 'Dialog with id "%1" should be closed.';
            message = ariaUtilsString.substitute(message, [
                dialog.id
            ]);
            this._waitAndCheck(callback, condition, message);

            // -----------------------------------------------------------------

            function condition() {
                return this._isDialogClosed(dialog);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        // Local library: dialog management
        ////////////////////////////////////////////////////////////////////////

        _openDialog : function (callback, dialog) {
            this._localAsyncSequence(function (add) {
                add('_focusWidget', dialog.buttonId);
                add('_pressEnter');
                add('_waitForDialogOpened', dialog);
            }, callback);
        },

        _closeDialog : function (callback, dialog) {
            this._localAsyncSequence(function (add) {
                add('_pressEscape');
                add('_waitForDialogClosed', dialog);
            }, callback);
        },



        _isDialogOpened : function (dialog) {
            return this._getDialogInstance(dialog.id) != null;
        },

        _isDialogClosed : function (dialog) {
            return !this._isDialogOpened(dialog);
        },

        _waitForDialogOpened : function (callback, dialog) {
            // -----------------------------------------------------------------

            this.waitFor({
                scope: this,
                condition: condition,
                callback: callback
            });

            // -----------------------------------------------------------------

            function condition() {
                return this._isDialogOpened(dialog);
            }
        },

        _waitForDialogClosed : function (callback, dialog) {
            // -----------------------------------------------------------------

            this.waitFor({
                scope: this,
                condition: condition,
                callback: callback
            });

            // -----------------------------------------------------------------

            function condition() {
                return this._isDialogClosed(dialog);
            }
        }
    }
});
