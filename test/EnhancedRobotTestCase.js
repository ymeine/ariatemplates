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
var ariaUtilsArray = require('ariatemplates/utils/Array');
var ariaUtilsString = require('ariatemplates/utils/String');
var ariaUtilsType = require('ariatemplates/utils/Type');
var ariaUtilsDom = require('ariatemplates/utils/Dom');

var ariaPopupsPopupManager = require('ariatemplates/popups/PopupManager');

var ariaJsunitRobotTestCase = require('ariatemplates/jsunit/RobotTestCase');



////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

function _string_capitalize(string) {
    // -------------------------------------------------------------- processing

    var characters = string.split('');

    var first = characters.shift();
    first = first.toUpperCase();

    var output = [];
    output.push(first);
    output = output.concat(characters);

    output = output.join('');

    // ------------------------------------------------------------------ return

    return output;
}

function createAsyncWrapper(fn) {
    // -------------------------------------------------------------- processing

    function wrapper(callback) {
        var args = Array.prototype.slice.call(arguments, 1);
        var result = fn.apply(this, args);
        callback(result);
    }

    fn.async = wrapper;

    // ------------------------------------------------------------------ return

    return wrapper;
}



////////////////////////////////////////////////////////////////////////////////
// Model: Test
////////////////////////////////////////////////////////////////////////////////

var prototype = {
    ////////////////////////////////////////////////////////////////////////////
    // DOM
    ////////////////////////////////////////////////////////////////////////////

    _getActiveElement : function () {
        // ---------------------------------------------------------- processing

        var activeElement = Aria.$global.window.document.activeElement;

        // -------------------------------------------------------------- return

        return activeElement;
    },

    _getWidgetDom : function (id) {
        // ---------------------------------------------------------- processing

        var widgetInstance = this.getWidgetInstance(id);
        var element = widgetInstance.getDom();

        // -------------------------------------------------------------- return

        return element;
    },



    ////////////////////////////////////////////////////////////////////////////
    // Template
    ////////////////////////////////////////////////////////////////////////////

    _refresh : function () {
        this.templateCtxt.$refresh();
    },



    ////////////////////////////////////////////////////////////////////////////
    // Widgets
    ////////////////////////////////////////////////////////////////////////////

    _getWidgetId : function (id) {
        // ---------------------------------------------------------- processing

        var widgetDom = this._getWidgetDom(id);

        var actualId = widgetDom.id;

        // -------------------------------------------------------------- return

        return actualId;
    },

    _getDialogInstance : function (dialog) {
        // ---------------------------------------------------------- processing

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

        // -------------------------------------------------------------- return

        return dialogInstance;
    },



    ////////////////////////////////////////////////////////////////////////////
    // Data
    ////////////////////////////////////////////////////////////////////////////

    _getData : function () {
        // ------------------------------------------------- processing & return

        return this.templateCtxt.data;
    },

    _readBinding : function (binding) {
        // ------------------------------------------------------- destructuring

        var inside = binding.inside;
        var to = binding.to;

        // ---------------------------------------------------------- processing

        var value = inside[to];

        // -------------------------------------------------------------- return

        return value;
    },

    _setBindingValue : function (binding, value) {
        // ------------------------------------------------------- destructuring

        var inside = binding.inside;
        var to = binding.to;

        // ---------------------------------------------------------- processing

        ariaUtilsJson.setValue(inside, to, value);

        // -------------------------------------------------------------- return

        return value;
    },



    ////////////////////////////////////////////////////////////////////////////
    // Asynchronous processing
    ////////////////////////////////////////////////////////////////////////////

    _asyncIterate : function (array, callback, onend, thisArg) {
        // ------------------------------------------ input arguments processing

        if (thisArg === undefined) {
            thisArg = this;
        }

        // ---------------------------------------------------------- processing

        var index = 0;

        iterate();

        // ----------------------------------------------------- local functions

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
    },

    _asyncSequence : function (functions, callback, thisArg) {
        // ---------------------------------------------------------- processing

        this._asyncIterate(functions, callFunction, callback, thisArg);

        // ----------------------------------------------------- local functions

        function callFunction(next, fn) {
            return fn.call(this, next);
        }
    },

    _localAsyncSequence : function (creator, callback) {
        // ---------------------------------------------------------- processing

        var self = this;
        var sequence = [];

        creator.call(this, add);

        // ---------------------------------------------------------- delegation

        return this._asyncSequence(sequence, callback, this);

        // ----------------------------------------------------- local functions

        function add(fnOrName) {
            var fn;
            if (ariaUtilsType.isString(fnOrName)) {
                fn = self[fnOrName];
            } else {
                fn = fnOrName;
            }

            if (ariaUtilsType.isFunction(fn.async)) {
                fn = fn.async;
            }

            if (arguments.length > 1) {
                var boundArguments = Array.prototype.slice.call(arguments, 1);
                fn = self._partializeAsynchronousFunction(fn, boundArguments);
            }

            sequence.push(fn);
        }
    },

    _partializeAsynchronousFunction : function (fn, boundArguments) {
        // ---------------------------------------------------------- processing

        var partial = function(next) {
            // ------------------------------------------------------ processing

            // -----------------------------------------------------------------

            var additionalArguments = Array.prototype.slice.call(arguments, 1);

            var allArguments = [];
            allArguments.push(next);
            allArguments.push.apply(allArguments, boundArguments);
            allArguments.push.apply(allArguments, additionalArguments);

            // -----------------------------------------------------------------

            var result = fn.apply(this, allArguments);

            // ---------------------------------------------------------- return

            return result;
        };

        // -------------------------------------------------------------- return

        return partial;
    },

    _createAsyncWrapper : function () {
        return createAsyncWrapper.apply(null, arguments);
    },

    _delay : function (callback, delay) {
        // ------------------------------------------ input arguments processing

        if (delay == null) {
            delay = 500;
        }

        // ---------------------------------------------------------- processing

        setTimeout(callback, delay);
    },



    ////////////////////////////////////////////////////////////////////////////
    // Robot: wait & check
    ////////////////////////////////////////////////////////////////////////////

    _waitForFocus : function (callback, element, strict, thisArg) {
        // ------------------------------------------ input arguments processing

        if (strict == null) {
            strict = true;
        }

        if (thisArg === undefined) {
            thisArg = this;
        }

        // ---------------------------------------------------------- processing

        var self = this;

        this.waitFor({
            scope: thisArg,
            condition: condition,
            callback: callback
        });

        // ----------------------------------------------------- local functions

        function condition() {
            return self._isFocused(element, strict);
        }
    },

    _isFocused : function (element, strict) {
        // ---------------------------------------------------------- processing

        var activeElement = this._getActiveElement();

        var result;
        if (strict) {
            result = activeElement === element;
        } else {
            result = ariaUtilsDom.isAncestor(activeElement, element);
        }

        // -------------------------------------------------------------- return

        return result;
    },

    _isWidgetFocused : function (id) {
        var element = this._getWidgetDom(id);
        return this._isFocused(element, false);
    },

    _waitAndCheck : function (callback, condition, message, thisArg) {
        // ------------------------------------------ input arguments processing

        if (thisArg === undefined) {
            thisArg = this;
        }

        // ---------------------------------------------------------- processing

        this._localAsyncSequence(function (add) {
            add(wait);
            add(check);
        }, callback);

        // ----------------------------------------------------- local functions

        function wait(next) {
            this.waitFor({
                scope: thisArg,
                condition: condition,
                callback: next
            });
        }

        function check(next) {
            this.assertTrue(condition.call(thisArg), message);
            next();
        }
    },



    ////////////////////////////////////////////////////////////////////////////
    // Robot: User actions
    ////////////////////////////////////////////////////////////////////////////

    // keyboard ----------------------------------------------------------------

    _type : function (callback, sequence) {
        this.synEvent.type(null, sequence, callback);
    },

    // keyboard > keys ---------------------------------------------------------

    _pushKey : function (callback, key) {
        this._type(callback, '[<' + key + '>]');
    },

    _releaseKey : function (callback, key) {
        this._type(callback, '[>' + key + '<]');
    },

    _pressKey : function (callback, key) {
        this._type(callback, '[' + key + ']');
    },

    // keyboard > shift --------------------------------------------------------

    _pressWithShift : function (callback, key) {
        this._type(callback, '[<shift>]' + ('[' + key + ']') + '[>shift<]');
    },

    // mouse -------------------------------------------------------------------

    _leftClick : function (callback) {
        this.synEvent.click(null, callback);
    },



    ////////////////////////////////////////////////////////////////////////////
    // Robot: navigation
    ////////////////////////////////////////////////////////////////////////////

    _focusElement : function (callback, id) {
        // ---------------------------------------------------------- processing

        var element = this.getElementById(id);
        element.focus();
        this._waitForElementFocus(callback, id);
    },

    _focusWidget : function (callback, id) {
        // ---------------------------------------------------------- processing

        var elementBeforeId = 'before_' + id;

        this._localAsyncSequence(function (add) {
            add('_focusElement', elementBeforeId);
            add('_pressTab');
            add('_waitForWidgetFocus', id);
        }, callback);
    },

    _waitForElementFocus : function (callback, id) {
        // ---------------------------------------------------------- processing

        var element = this.getElementById(id);

        // ---------------------------------------------------------- delegation

        this._waitForFocus(callback, element);
    },

    _waitForWidgetFocus : function (callback, id) {
        // ---------------------------------------------------------- processing

        var widgetDom = this._getWidgetDom(id);

        // ---------------------------------------------------------- delegation

        this._waitForFocus(callback, widgetDom, false);
    },

    _waitForFocusChange : function (callback, previouslyActiveElement) {
        // ---------------------------------------------------------- processing

        this.waitFor({
            scope: this,
            condition: condition,
            callback: callback
        });

        // ----------------------------------------------------- local functions

        function condition() {
            return this._getActiveElement() !== previouslyActiveElement;
        }
    },

    _navigate : function (callback, action) {
        // ---------------------------------------------------------- processing

        var activeElement = this._getActiveElement();

        this._localAsyncSequence(function (add) {
            add(action);
            add('_waitForFocusChange', activeElement);
        }, callback);
    },

    _navigateForward : function (callback) {
        // ---------------------------------------------------------- processing

        this._navigate(callback, this._pressTab);
    },

    _navigateBackward : function (callback) {
        // ---------------------------------------------------------- processing

        this._navigate(callback, this._pressShiftTab);
    },



    ////////////////////////////////////////////////////////////////////////////
    // Assertions: DOM
    ////////////////////////////////////////////////////////////////////////////

    _checkAttribute : function (id, element, attributeName, expected) {
        // ---------------------------------------------------------- processing

        // actual value --------------------------------------------------------

        var attribute = element.getAttribute(attributeName);

        // condition -----------------------------------------------------------

        var condition = attribute === expected;

        // message -------------------------------------------------------------

        var message = 'Widget "%1" should have attribute "%2" set to "%3", it has value "%4" instead';
        message = ariaUtilsString.substitute(message, [
            id,
            attributeName,
            expected,
            attribute
        ]);

        // check ---------------------------------------------------------------

        this.assertTrue(condition, message);
    },

    _checkWidgetAttribute : function (id, attributeName, expected) {
        // ----------------------------------------------- information retrieval

        var element = this._getWidgetDom(id);

        // ---------------------------------------------------------- delegation

        this._checkAttribute(id, element, attributeName, expected);
    },

    _checkElementAttribute : function (id, attributeName, expected) {
        // ----------------------------------------------- information retrieval

        var element = this.getElementById(id);

        // ---------------------------------------------------------- delegation

        this._checkAttribute(id, element, attributeName, expected);
    },



    ////////////////////////////////////////////////////////////////////////////
    // Assertions: Focus
    ////////////////////////////////////////////////////////////////////////////

    _checkElementIsFocused : function (callback, id) {
        // ----------------------------------------------- information retrieval

        var element = this.getElementById(id);

        // ---------------------------------------------------------- processing

        var message = 'Element with id "%1" should be focused.';
        message = ariaUtilsString.substitute(message, [id]);

        this._waitAndCheck(callback, condition, message, this);

        // ----------------------------------------------------- local functions

        function condition() {
            return this._isFocused(element);
        }
    },

    _checkWidgetIsFocused : function (callback, id) {
        // ---------------------------------------------------------- processing

        var message = 'Widget with id "%1" should be focused.';
        message = ariaUtilsString.substitute(message, [id]);

        this._waitAndCheck(callback, condition, message, this);

        // ----------------------------------------------------- local functions

        function condition() {
            return this._isWidgetFocused(id);
        }
    },



    ////////////////////////////////////////////////////////////////////////////
    // Widgets: dropdown
    ////////////////////////////////////////////////////////////////////////////

    _isWidgetDropdownPopupOpen : function (id) {
        // ---------------------------------------------------------- processing

        var widgetInstance = this.getWidgetInstance(id);
        var controller = widgetInstance.controller;

        var popupWidget;
        if (controller) {
            if (controller.getListWidget) {
                popupWidget = controller.getListWidget();
            } else if (controller.getCalendar) {
                popupWidget = controller.getCalendar();
            }
        }

        var isOpen = !!(popupWidget && popupWidget._subTplCtxt);

        // -------------------------------------------------------------- return

        return isOpen;
    },



    ////////////////////////////////////////////////////////////////////////////
    // Advanced utilities
    ////////////////////////////////////////////////////////////////////////////

    _createPredicate : function (predicate, buildMessage, thisArg) {
        // ------------------------------------------ input arguments processing

        if (thisArg === undefined) {
            thisArg = this;
        }

        // ---------------------------------------------------------- processing

        var self = this;

        // ---------------------------------------------------------------------

        function isTrue() {
            var result = predicate.apply(thisArg, arguments);
            return result;
        }
        this._createAsyncWrapper(isTrue);

        function isFalse() {
            return !isTrue.apply(thisArg, arguments);
        }
        this._createAsyncWrapper(isFalse);

        // ---------------------------------------------------------------------

        function _waitFor(callback, predicate, args) {
            args = Array.prototype.slice.call(args, 1);

            self.waitFor({
                scope: thisArg,
                condition: {
                    fn: predicate,
                    args: args
                },
                callback: callback
            });
        }

        function waitForTrue(callback) {
            _waitFor(callback, isTrue, arguments);
        }

        function waitForFalse(callback) {
            _waitFor(callback, isFalse, arguments);
        }

        // ---------------------------------------------------------------------

        function assertTrue() {
            var result = isTrue.apply(thisArg, arguments);
            var message = buildMessage.call(thisArg, true, arguments, result, 'assertTrue');

            self.assertTrue(result, message);
        }
        this._createAsyncWrapper(assertTrue);

        function assertFalse(callback) {
            var result = isFalse.apply(thisArg, arguments);
            var message = buildMessage.call(thisArg, false, arguments, result, 'assertFalse');

            self.assertTrue(result, message);
        }
        this._createAsyncWrapper(assertFalse);

        // ---------------------------------------------------------------------

        function waitAndAssertTrue(callback) {
            var args = Array.prototype.slice.call(arguments, 1);

            self._localAsyncSequence(function (add) {
                add.apply(null, [waitForTrue].concat(args));
                add.apply(null, [assertTrue.async].concat(args));
            }, callback);
        }

        function waitAndAssertFalse(callback) {
            var args = Array.prototype.slice.call(arguments, 1);

            self._localAsyncSequence(function (add) {
                add.apply(null, [waitForFalse].concat(args));
                add.apply(null, [assertFalse.async].concat(args));
            }, callback);
        }

        // -------------------------------------------------------------- return

        return {
            // -----------------------------------------------------------------

            predicate: predicate,
            buildMessage: buildMessage,

            // -----------------------------------------------------------------

            isTrue: isTrue,
            isFalse: isFalse,
            check: isTrue,

            // -----------------------------------------------------------------

            waitForTrue: waitForTrue,
            waitForFalse: waitForFalse,
            wait: waitForTrue,

            // -----------------------------------------------------------------

            assertTrue: assertTrue,
            assertFalse: assertFalse,
            assert: assertTrue,

            // -----------------------------------------------------------------

            waitAndAssertTrue: waitAndAssertTrue,
            waitAndAssertFalse: waitAndAssertFalse,
            waitAndAssert: waitAndAssertTrue
        };
    }
};



////////////////////////////////////////////////////////////////////////////////
// Sync to async
////////////////////////////////////////////////////////////////////////////////

createAsyncWrapper(prototype._refresh);

createAsyncWrapper(prototype._checkAttribute);
createAsyncWrapper(prototype._checkWidgetAttribute);
createAsyncWrapper(prototype._checkElementAttribute);



////////////////////////////////////////////////////////////////////////////////
// Robot: User actions | Keyboard > specific keys
////////////////////////////////////////////////////////////////////////////////

var commonKeys = [
    {name: 'shift', granular: true},

    {name: 'tab', shift: true},
    {name: 'F10', shift: true},

    'space',
    {name: 'enter', granular: true},
    'escape',
    'backspace',

    'down'
];

ariaUtilsArray.forEach(commonKeys, function (keySpec) {
    // ---------------------------------------------- input arguments processing

    if (ariaUtilsType.isString(keySpec)) {
        keySpec = {name: keySpec};
    }

    var name = keySpec.name;

    var shift = keySpec.shift;
    if (shift == null) {
        shift = false;
    }

    var granular = keySpec.granular;
    if (granular == null) {
        granular = false;
    }

    // -------------------------------------------------------------- processing

    // -------------------------------------------------------------------------

    var capitalizedName = _string_capitalize(name);

    // -------------------------------------------------------------------------

    function addMethod(baseName, method) {
        var methodName = '_' + baseName + capitalizedName;
        prototype[methodName] = method;
    }

    addMethod('press', function (callback) {
        this._pressKey(callback, name);
    });

    if (granular) {
        addMethod('push', function (callback) {
            this._pushKey(callback, name);
        });

        addMethod('release', function (callback) {
            this._releaseKey(callback, name);
        });
    }

    if (shift) {
        addMethod('pressShift', function (callback) {
            this._pressWithShift(callback, name);
        });
    }
});



////////////////////////////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////////////////////////////

module.exports = Aria.classDefinition({
    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////

    $classpath : 'test.EnhancedRobotTestCase',
    $extends : ariaJsunitRobotTestCase,



    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$RobotTestCase.constructor.call(this);

        // ------------------------------------------------- internal attributes

        // ---------------------------------------------------------------------

        var disposableObjects = [];
        this._disposableObjects = disposableObjects;
    },

    $destructor : function () {
        this.$RobotTestCase.$destructor.call(this);

        ariaUtilsArray.forEach(this._disposableObjects, function (object) {
            object.$dispose();
        });
    },

    $prototype : prototype
});
