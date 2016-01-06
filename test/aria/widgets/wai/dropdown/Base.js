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
var ariaUtilsType = require('ariatemplates/utils/Type');
var ariaUtilsArray = require('ariatemplates/utils/Array');

var AppEnvironment = require('ariatemplates/core/AppEnvironment');

var ariaResourcesHandlersLCResourcesHandler = require('ariatemplates/resources/handlers/LCResourcesHandler');
var ariaResourcesHandlersLCRangeResourceHandler = require('ariatemplates/resources/handlers/LCRangeResourceHandler');



module.exports = Aria.classDefinition({
    $classpath : 'test.aria.widgets.wai.dropdown.Base',

    $extends : require('ariatemplates/jsunit/RobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$RobotTestCase.constructor.call(this);

        // ---------------------------------------------------------- attributes

        this._waiAria = null;

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

        var widgetsIds = [
            'autoComplete',
            'expandableAutoComplete',

            'multiAutoComplete',
            'expandableMultiAutoComplete',

            'datePicker',

            'multiSelect',
            'select',
            'selectBox'
        ];

        var widgets = {
            autoComplete: {
                configuration: {
                    id: 'autoComplete',
                    label: 'AutoComplete: ',
                    expandButton: false,
                    resourcesHandler: createResourcesHandler(ariaResourcesHandlersLCResourcesHandler)
                },
                expectations: {
                    canBeOpened: false
                }
            },

            expandableAutoComplete: {
                configuration: {
                    id: 'expandableAutoComplete',
                    label: 'Expandable AutoComplete: ',
                    resourcesHandler: createResourcesHandler(ariaResourcesHandlersLCResourcesHandler),
                    expandButton: true
                }
            },



            multiAutoComplete: {
                configuration: {
                    id: 'multiAutoComplete',
                    label: 'MultiAutoComplete: ',
                    expandButton: false,
                    resourcesHandler: createResourcesHandler(ariaResourcesHandlersLCRangeResourceHandler)
                },
                expectations: {
                    canBeOpened: false
                }
            },

            expandableMultiAutoComplete: {
                configuration: {
                    id: 'expandableMultiAutoComplete',
                    label: 'Expandable MultiAutoComplete: ',
                    expandButton: true,
                    resourcesHandler: createResourcesHandler(ariaResourcesHandlersLCRangeResourceHandler)
                }
            },



            datePicker: {
                configuration: {
                    id: 'datePicker',
                    label: 'DatePicker: '
                }
            },



            multiSelect: {
                configuration: {
                    id: 'multiSelect',
                    label: 'MultiSelect: ',

                    fieldDisplay: 'label',
                    fieldSeparator: '/',
                    displayOptions: {},

                    items: createSelectOptions()
                }
            },

            select: {
                configuration: {
                    id: 'select',
                    label: 'Select: ',
                    options: createSelectOptions()
                },
                expectations: {
                    canBeOpenedOnDownArrow: false
                }
            },

            selectBox: {
                configuration: {
                    id: 'selectBox',
                    label: 'SelectBox: ',
                    options: createSelectOptions()
                }
            }
        };

        ariaUtilsArray.forEach(widgetsIds, function (id) {
            var widget = widgets[id];

            var expectations = widget.expectations;
            if (expectations == null) {
                expectations = {};
            }
            widget.expectations = expectations;

            var canBeOpened = expectations.canBeOpened;
            if (canBeOpened == null) {
                canBeOpened = true;
            }
            expectations.canBeOpened = canBeOpened;

            var canBeOpenedOnDownArrow = expectations.canBeOpenedOnDownArrow;
            if (canBeOpenedOnDownArrow == null) {
                canBeOpenedOnDownArrow = true;
            }
            expectations.canBeOpenedOnDownArrow = canBeOpenedOnDownArrow;
        });

        var data = {
            widgetsIds: widgetsIds,

            widgets: widgets
        };

        this.setTestEnv({
            data: data,
            template: 'test.aria.widgets.wai.dropdown.Tpl'
        });
    },

    $destructor : function () {
        // ---------------------------------------------------------------------

        this.$RobotTestCase.$destructor.call(this);

        // ---------------------------------------------------------------------

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

        _pressDownArrow : function (callback) {
            this._pressKey(callback, 'down');
        },

        _pressF10 : function (callback) {
            this._pressKey(callback, 'F10');
        },

        _pressShiftF10 : function (callback) {
            this._pressWithShift(callback, this._pressF10);
        },

        _pressBackspace : function (callback) {
            this._pressKey(callback, 'backspace');
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

            this._waiAria = false;

            this._asyncSequence([
                testWidgets,

                testWaiAriaWidgets,
                turnWaiAriaOn,
                refresh,
                testWaiAriaWidgets
            ], this.end, this);

            // ------------------------------------------------------- functions

            function _testWidgets(next, testFunction) {
                this._asyncIterate(
                    ids,
                    function (next, id) {
                        testFunction.call(this, next, id);
                    },
                    next,
                    this
                );
            }

            function testWidgets(next) {
                _testWidgets.call(this, next, this._testWidget);
            }

            function testWaiAriaWidgets(next) {
                _testWidgets.call(this, next, this._testWaiAriaWidget);
            }

            function turnWaiAriaOn(next) {
                this._waiAria = true;

                var widgets = this.templateCtxt.data.widgets;
                for (var widgetId in widgets) {
                    widgets[widgetId].configuration.waiAria = true;
                }

                next();
            }

            function refresh(next) {
                this.templateCtxt.$refresh();
                next();
            }
        },

        _testWaiAriaWidget : function (callback, id) {
            // --------------------------------------------------- destructuring

            var data = this.templateCtxt.data;
            var waiAria = this._waiAria;

            var expectations = data.widgets[id].expectations;
            var canBeOpened = expectations.canBeOpened;
            var canBeOpenedOnDownArrow = expectations.canBeOpenedOnDownArrow;

            // ------------------------------------------------------ processing

            var shouldBeOpenOnDownArrow = !waiAria && canBeOpened && canBeOpenedOnDownArrow;

            this._localAsyncSequence(function (add) {
                add('_focusWidget', id);

                add('_pressDownArrow');
                if (shouldBeOpenOnDownArrow) {
                    add('_checkWidgetDropdown', id, true);
                    add('_pressShiftF10');
                }
                add('_checkWidgetDropdown', id, false);
            }, callback);
        },

        _testWidget : function (callback, id) {
            // --------------------------------------------------- destructuring

            var data = this.templateCtxt.data;
            var waiAria = this._waiAria;

            var expectations = data.widgets[id].expectations;
            var canBeOpened = expectations.canBeOpened;

            // ------------------------------------------------------ processing

            var shouldBeOpenOnShiftF10 = canBeOpened;

            this._localAsyncSequence(function (add) {
                add('_focusWidget', id);

                add('_pressShiftF10');

                if (shouldBeOpenOnShiftF10) {
                    add('_checkWidgetDropdown', id, true);
                    add('_pressShiftF10');
                } else {
                    add('_type', 'o'); // to display the suggestion 'one'; moreover, 'o' doesn't change from QWERTY to AZERTY
                    add('_checkWidgetDropdown', id, true);
                    add('_pressShiftF10');
                }

                if (!shouldBeOpenOnShiftF10) {
                    add('_pressBackspace'); // to erase the previously entered character and reset a proper state for testing
                }
            }, callback);
        },



        ////////////////////////////////////////////////////////////////////////
        // Library: dropdown
        ////////////////////////////////////////////////////////////////////////

        _checkWidgetDropdownState : function (id, shouldBeOpen) {
            // -------------------------------------- input arguments processing

            if (shouldBeOpen == null) {
                shouldBeOpen = true;
            }

            // ------------------------------------------------------ processing

            var isOpen = this.getWidgetDropDownPopup(id) != null;
            var result = isOpen === shouldBeOpen;

            // ---------------------------------------------------------- return

            return result;
        },

        _waitForWidgetDropdown : function (callback, id, shouldBeOpen) {
            this.waitFor({
                scope: this,
                condition: function condition() {
                    return this._checkWidgetDropdownState(id, shouldBeOpen);
                },
                callback: callback
            });
        },

        _checkWidgetDropdown : function (callback, id, shouldBeOpen) {
            // ------------------------------------------------------ processing

            var message = ariaUtilsString.substitute(
                'Widget "%1" should have its dropdown %2',
                [id, shouldBeOpen ? 'open' : 'closed']
            );

            this._waitAndCheck(callback, condition, message, this);

            function condition() {
                return this._checkWidgetDropdownState(id, shouldBeOpen);
            }
        }
   }
});
