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
var ariaUtilsString = require('ariatemplates/utils/String');
var ariaUtilsArray = require('ariatemplates/utils/Array');
var ariaUtilsType = require('ariatemplates/utils/Type');

var ariaPopupsPopupManager = require('ariatemplates/popups/PopupManager');

var ariaResourcesHandlersLCResourcesHandler = require('ariatemplates/resources/handlers/LCResourcesHandler');
var ariaResourcesHandlersLCRangeResourceHandler = require('ariatemplates/resources/handlers/LCRangeResourceHandler');



module.exports = Aria.classDefinition({
    $classpath : "test.aria.templates.keyboardNavigation.dialog.escape.Base",
    $extends : require('ariatemplates/jsunit/RobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$RobotTestCase.constructor.call(this);

        // ---------------------------------------------------------- processing

        var disposableObjects = [];
        this._disposableObjects = disposableObjects;

        // ---------------------------------------------------------- processing

        function createResourcesHandler(cls) {
            var handler = new cls();
            var suggestions = [
                {label: 'zero', code: '0'},
                {label: 'one', code: '1'}
            ];

            handler.setSuggestions(suggestions);
            disposableObjects.push(handler);

            return handler;
        }

        function createSelectOptions() {
            return [
                {value: '0', label: '0'},
                {value: '1', label: '1'}
            ];
        }

        var data = {
            dialogId: 'dialog',
            openDialogButtonId: 'openDialog',

            widgetsIds: [
                'autoComplete',
                'datePicker',
                'multiAutoComplete',
                'multiSelect',
                'select',
                'selectBox'
            ],

            widgetsConfigurations: {
                autoComplete: {
                    id: 'autoComplete',
                    label: 'AutoComplete: ',
                    expandButton: true,
                    resourcesHandler: createResourcesHandler(ariaResourcesHandlersLCResourcesHandler)
                },

                datePicker: {
                    id: 'datePicker',
                    label: 'DatePicker: '
                },

                multiAutoComplete: {
                    id: 'multiAutoComplete',
                    label: 'MultiAutoComplete: ',
                    expandButton: true,
                    resourcesHandler: createResourcesHandler(ariaResourcesHandlersLCRangeResourceHandler)
                },

                multiSelect: {
                    id: 'multiSelect',
                    label: 'MultiSelect: ',

                    fieldDisplay: 'label',
                    fieldSeparator: '/',
                    displayOptions: {},

                    items: createSelectOptions()
                },

                select: {
                    id: 'select',
                    label: 'Select: ',
                    options: createSelectOptions()
                },

                selectBox: {
                    id: 'selectBox',
                    label: 'SelectBox: ',
                    options: createSelectOptions()
                }
            }
        };

        this.setTestEnv({
            data: data,
            template: 'test.aria.templates.keyboardNavigation.dialog.escape.Tpl'
        });
    },

    $destructor : function () {
        this.$RobotTestCase.$destructor.call(this);

        ariaUtilsArray.forEach(this._disposableObjects, function (object) {
            object.$dispose();
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

        _pushKey : function (callback, key) {
            this.synEvent.type(null, '[<' + key + '>]', callback);
        },

        _releaseKey : function (callback, key) {
            this.synEvent.type(null, '[>' + key + '<]', callback);
        },

        _pressKey : function (callback, key) {
            this.synEvent.type(null, '[' + key + ']', callback);
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

        _pressEnter : function (callback) {
            this._pressKey(callback, 'enter');
        },

        _pressEscape : function (callback) {
            this._pressKey(callback, 'escape');
        },

        _pressF10 : function (callback) {
            this._pressKey(callback, 'F10');
        },

        _pressShiftF10 : function (callback) {
            this._pressWithShift(callback, this._pressF10);
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



        ////////////////////////////////////////////////////////////////////////
        // Tests
        ////////////////////////////////////////////////////////////////////////

        runTemplateTest : function () {
            // --------------------------------------------------- destructuring

            var idOfWidgetToTest = this.idOfWidgetToTest;
            var widgetsIds = this.templateCtxt.data.widgetsIds;

            // ------------------------------------------------------ processing

            // -----------------------------------------------------------------

            var ids;
            if (idOfWidgetToTest != null) {
                ids = [idOfWidgetToTest];
            } else {
                ids = widgetsIds;
            }

            // -----------------------------------------------------------------

            this._asyncIterate(ids, this._testWidget, this.end);
        },

        _testWidget : function (callback, id) {
            var dialogId = this.templateCtxt.data.dialogId;

            this._localAsyncSequence(function (add) {
                add('_openDialog');
                add('_openDropdown', id);
                add('_pressEscape');
                add('_checkDialogIsOpened', dialogId);
                add('_pressEscape');
                add('_checkDialogIsClosed', dialogId);
            }, callback);
        },



        ////////////////////////////////////////////////////////////////////////
        // Library: dialog management
        ////////////////////////////////////////////////////////////////////////

        _openDialog : function (callback) {
            var data = this.templateCtxt.data;

            var dialogId = data.dialogId;
            var openDialogButtonId = data.openDialogButtonId;

            this._localAsyncSequence(function (add) {
                add('_focusWidget', openDialogButtonId);
                add('_pressEnter');
                add('_waitForDialogOpened', dialogId);
            }, callback);
        },

        _checkDialogIsOpened : function (callback, dialog) {
            // -----------------------------------------------------------------

            var message = 'Dialog with id "%1" should be opened.';
            message = ariaUtilsString.substitute(message, [
                dialog
            ]);
            this._waitAndCheck(callback, condition, message);

            // -----------------------------------------------------------------

            function condition() {
                return this._isDialogOpened(dialog);
            }
        },

        _checkDialogIsClosed : function (callback, dialog) {
            // -----------------------------------------------------------------

            var message = 'Dialog with id "%1" should be closed.';
            message = ariaUtilsString.substitute(message, [
                dialog
            ]);
            this._waitAndCheck(callback, condition, message);

            // -----------------------------------------------------------------

            function condition() {
                return this._isDialogClosed(dialog);
            }
        },

        _isDialogOpened : function (dialog) {
            return this._getDialogInstance(dialog) != null;
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
        // Library: dropdown
        ////////////////////////////////////////////////////////////////////////

        _openDropdown : function (callback, id) {
            // -----------------------------------------------------------------

            this._localAsyncSequence(function (add) {
                add('_focusWidget', id);
                add('_pressShiftF10');
                add(wait);
            }, callback);

            // -----------------------------------------------------------------

            function wait(next) {
                this.waitForDropDownPopup(id, next);
            }
        }
    }
});
