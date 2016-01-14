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
var ariaUtilsType = require('ariatemplates/utils/Type');

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
    $extends : require('ariatemplates/jsunit/RobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$RobotTestCase.constructor.call(this);

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
        // Library: helpers
        ////////////////////////////////////////////////////////////////////////

        getActiveElement : function () {
            return Aria.$global.window.document.activeElement;
        },

        getWidgetDom : function (id) {
            var widgetInstance = this.getWidgetInstance(id);
            return widgetInstance.getDom();
        },



        ////////////////////////////////////////////////////////////////////////
        // Library: asynchronous processing
        ////////////////////////////////////////////////////////////////////////

        _asyncIterate : function (array, callback, onend, thisArg) {
            // -------------------------------------- input arguments processing

            if (thisArg === undefined) {
                thisArg = this;
            }

            // ------------------------------------------------------ processing

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

        _localAsyncSequence : function (create, callback) {
            // ------------------------------------------------------ processing

            var self = this;

            var sequence = [];

            function add(fn) {
                if (ariaUtilsType.isString(fn)) {
                    fn = self[fn];
                }

                if (arguments.length > 1) {
                    var boundArguments = Array.prototype.slice.call(arguments, 1);
                    fn = self._partializeAsynchronousFunction(fn, boundArguments);
                }

                sequence.push(fn);
            }

            create.call(this, add);

            // ------------------------------------------------------ delegation

            return this._asyncSequence(sequence, callback, this);
        },

        _partializeAsynchronousFunction : function (fn, boundArguments) {
            return function (next) {
                var additionalArguments = Array.prototype.slice.call(arguments, 1);

                var allArguments = [];
                allArguments.push(next);
                allArguments.push.apply(allArguments, boundArguments);
                allArguments.push.apply(allArguments, additionalArguments);

                return fn.apply(this, allArguments);
            };
        },



        ////////////////////////////////////////////////////////////////////////
        // Library: Wait & check
        ////////////////////////////////////////////////////////////////////////

        _waitForFocus : function (callback, element, strict, thisArg) {
            // -------------------------------------- input arguments processing

            if (strict == null) {
                strict = true;
            }

            if (thisArg === undefined) {
                thisArg = this;
            }

            // ------------------------------------------------------ processing

            this.waitFor({
                scope: thisArg,
                condition: condition,
                callback: callback
            });

            // -----------------------------------------------------------------

            function condition() {
                var activeElement = this.getActiveElement();

                var result;
                if (strict) {
                    result = activeElement === element;
                } else {
                    result = ariaUtilsDom.isAncestor(activeElement, element);
                }

                return result;
            }
        },

        _waitAndCheck : function (callback, condition, message, thisArg) {
            // -------------------------------------- input arguments processing

            if (thisArg === undefined) {
                thisArg = this;
            }

            // ------------------------------------------------------ processing

            this.waitFor({
                scope: thisArg,
                condition: condition,
                callback: check
            });

            function check() {
                this.assertTrue(condition.call(thisArg), message);
                callback();
            }
        },

        ////////////////////////////////////////////////////////////////////////
        // Library: User actions
        ////////////////////////////////////////////////////////////////////////

        _type : function (callback, sequence) {
            this.synEvent.type(null, sequence, callback);
        },



        _pushKey : function (callback, key) {
            this._type(callback, '[<' + key + '>]');
        },

        _releaseKey : function (callback, key) {
            this._type(callback, '[>' + key + '<]');
        },

        _pressKey : function (callback, key) {
            this._type(callback, '[' + key + ']');
        },



        _pushShift : function (callback) {
            this._pushKey(callback, 'shift');
        },

        _releaseShift : function (callback) {
            this._releaseKey(callback, 'shift');
        },

        _pressWithShift : function (callback, press) {
            this._localAsyncSequence(function (add) {
                add('_pushShift');
                add(press);
                add('_releaseShift');
            }, callback);
        },



        _pressTab : function (callback) {
            this._pressKey(callback, 'tab');
        },

        _pressF10 : function (callback) {
            this._pressKey(callback, 'F10');
        },

        _pressShiftF10 : function (callback) {
            this._pressWithShift(callback, this._pressF10);
        },

        _pressShiftTab : function (callback) {
            this._pressWithShift(callback, this._pressTab);
        },

        _pressEnter : function (callback) {
            this.synEvent.type(null, '[enter]', callback);
        },

        _pressEscape : function (callback) {
            this.synEvent.type(null, '[escape]', callback);
        },



        _leftClick : function (callback) {
            this.synEvent.click(null, callback);
        },



        ////////////////////////////////////////////////////////////////////////
        // Library: manual navigation
        ////////////////////////////////////////////////////////////////////////

        _focusWidget : function (callback, id) {
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
                var widgetDom = this.getWidgetDom(id);
                this._waitForFocus(next, widgetDom, false);
            }
        },

        _navigate : function (callback, action) {
            // -----------------------------------------------------------------

            var activeElement = this.getActiveElement();

            this._asyncSequence([
                action,

                function (next) {
                    this.waitFor({
                        scope: this,
                        condition: condition,
                        callback: next
                    });
                }
            ], callback, this);

            // -----------------------------------------------------------------

            function condition() {
                return this.getActiveElement() !== activeElement;
            }
        },

        _navigateForward : function (callback) {
            this._navigate(callback, this._pressTab);
        },

        _navigateBackward : function (callback) {
            this._navigate(callback, this._pressShiftTab);
        },



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
                widgetDom = this.getWidgetDom(id);

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
                var activeElement = this.getActiveElement();
                var widgetDom = this.getWidgetDom(dialog.id);

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
                var activeElement = this.getActiveElement();

                this._localAsyncSequence(function (add) {
                    add('_focusWidget', dialog.buttonId);
                    add(function (next) {
                        var openingElement = this.getActiveElement();

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
