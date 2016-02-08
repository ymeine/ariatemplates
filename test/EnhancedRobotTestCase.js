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

var ariaJsunitRobotTestCase = require('ariatemplates/jsunit/RobotTestCase');



////////////////////////////////////////////////////////////////////////////////
// Model: Test
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

    $prototype : {
        ////////////////////////////////////////////////////////////////////////
        // DOM
        ////////////////////////////////////////////////////////////////////////

        _getActiveElement : function () {
        	// ------------------------------------------------------ processing

            var activeElement = Aria.$global.window.document.activeElement;

            // ---------------------------------------------------------- return

            return activeElement;
        },

        _getWidgetDom : function (id) {
        	// ------------------------------------------------------ processing

            var widgetInstance = this.getWidgetInstance(id);
            var element = widgetInstance.getDom();

            // ---------------------------------------------------------- return

            return element;
        },



        ////////////////////////////////////////////////////////////////////////
        // Widgets
        ////////////////////////////////////////////////////////////////////////

        _getWidgetId : function (id) {
            // ------------------------------------------------------ processing

            var widgetDom = this._getWidgetDom(id);

            var actualId = widgetDom.id;

            // ---------------------------------------------------------- return

            return actualId;
        },



        ////////////////////////////////////////////////////////////////////////
		// Data
		////////////////////////////////////////////////////////////////////////

        _readBinding : function (binding) {
            // --------------------------------------------------- destructuring

            var inside = binding.inside;
            var to = binding.to;

            // ------------------------------------------------------ processing

            var value = inside[to];

            // ---------------------------------------------------------- return

            return value;
        },

        _setBindingValue : function (binding, value) {
            // --------------------------------------------------- destructuring

            var inside = binding.inside;
            var to = binding.to;

            // ------------------------------------------------------ processing

            ariaUtilsJson.setValue(inside, to, value);

            // ---------------------------------------------------------- return

            return value;
        },



        ////////////////////////////////////////////////////////////////////////
        // Asynchronous processing
        ////////////////////////////////////////////////////////////////////////

        _asyncIterate : function (array, callback, onend, thisArg) {
            // -------------------------------------- input arguments processing

            if (thisArg === undefined) {
                thisArg = this;
            }

            // ------------------------------------------------------ processing

            var index = 0;

            iterate();

            // ------------------------------------------------- local functions

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
        	// ------------------------------------------------------ processing

            this._asyncIterate(functions, callFunction, callback, thisArg);

            // ------------------------------------------------- local functions

            function callFunction(next, fn) {
            	return fn.call(this, next);
            }
        },

        _localAsyncSequence : function (creator, callback) {
            // ------------------------------------------------------ processing

            var self = this;
            var sequence = [];

            creator.call(this, add);

            // ------------------------------------------------------ delegation

            return this._asyncSequence(sequence, callback, this);

            // ------------------------------------------------- local functions

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
        },

        _partializeAsynchronousFunction : function (fn, boundArguments) {
        	// ------------------------------------------------------ processing

            partial = function(next) {
            	// -------------------------------------------------- processing

            	// -------------------------------------------------------------

                var additionalArguments = Array.prototype.slice.call(arguments, 1);

                var allArguments = [];
                allArguments.push(next);
                allArguments.push.apply(allArguments, boundArguments);
                allArguments.push.apply(allArguments, additionalArguments);

            	// -------------------------------------------------------------

                var result = fn.apply(this, allArguments);

                // ------------------------------------------------------ return

                return result;
            };

            // ---------------------------------------------------------- return

            return partial;
        },



        ////////////////////////////////////////////////////////////////////////
        // Robot: wait & check
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

            var self = this;

            this.waitFor({
                scope: thisArg,
                condition: condition,
                callback: callback
            });

            // ------------------------------------------------- local functions

            function condition() {
                return self._isFocused(element, strict);
            }
        },

        _isFocused : function (element, strict) {
        	// ------------------------------------------------------ processing

            var activeElement = this._getActiveElement();

            var result;
            if (strict) {
                result = activeElement === element;
            } else {
                result = ariaUtilsDom.isAncestor(activeElement, element);
            }

            // ---------------------------------------------------------- return

            return result;
        },

        _waitAndCheck : function (callback, condition, message, thisArg) {
            // -------------------------------------- input arguments processing

            if (thisArg === undefined) {
                thisArg = this;
            }

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
            	add(wait);
            	add(check);
            }, callback);

            // ------------------------------------------------- local functions

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



        ////////////////////////////////////////////////////////////////////////
        // Robot: User actions
        ////////////////////////////////////////////////////////////////////////

        // keyboard ------------------------------------------------------------

        _type : function (callback, sequence) {
            this.synEvent.type(null, sequence, callback);
        },

        // keyboard > keys -----------------------------------------------------

        _pushKey : function (callback, key) {
            this._type(callback, '[<' + key + '>]');
        },

        _releaseKey : function (callback, key) {
            this._type(callback, '[>' + key + '<]');
        },

        _pressKey : function (callback, key) {
            this._type(callback, '[' + key + ']');
        },

        // keyboard > shift ----------------------------------------------------

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

        // keyboard > keys instances -------------------------------------------

        _pressTab : function (callback) {
            this._pressKey(callback, 'tab');
        },

        _pressSpace : function (callback) {
            this._pressKey(callback, 'space');
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
            this._pressKey(callback, 'enter');
        },

        _pressEscape : function (callback) {
            this._pressKey(callback, 'escape');
        },

        // mouse ---------------------------------------------------------------

        _leftClick : function (callback) {
            this.synEvent.click(null, callback);
        },



        ////////////////////////////////////////////////////////////////////////
        // Robot: navigation
        ////////////////////////////////////////////////////////////////////////

        _focusElement : function (callback, id) {
        	// ------------------------------------------------------ processing

            var element = this.getElementById(id);
            element.focus();
            this._waitForElementFocus(callback, id);
        },

        _focusWidget : function (callback, id) {
            // ------------------------------------------------------ processing

            var elementBeforeId = 'before_' + id;

            this._localAsyncSequence(function (add) {
                add('_focusElement', elementBeforeId);
                add('_pressTab');
                add('_waitForWidgetFocus', id);
            }, callback);
        },

        _waitForElementFocus : function (callback, id) {
        	// ------------------------------------------------------ processing

            var element = this.getElementById(id);

            // ------------------------------------------------------ delegation

            this._waitForFocus(callback, element);
        },

        _waitForWidgetFocus : function (callback, id) {
            // ------------------------------------------------------ processing

            var widgetDom = this._getWidgetDom(id);

            // ------------------------------------------------------ delegation

            this._waitForFocus(callback, widgetDom, false);
        },

        _waitForFocusChange : function (callback, previouslyActiveElement) {
        	// ------------------------------------------------------ processing

            this.waitFor({
                scope: this,
                condition: condition,
                callback: callback
            });

            // ------------------------------------------------- local functions

            function condition() {
                return this._getActiveElement() !== previouslyActiveElement;
            }
        },

        _navigate : function (callback, action) {
        	// ------------------------------------------------------ processing

            var activeElement = this._getActiveElement();

            this._localAsyncSequence(function (add) {
                add(action);
                add('_waitForFocusChange', activeElement);
            }, callback);
        },

        _navigateForward : function (callback) {
        	// ------------------------------------------------------ processing

            this._navigate(callback, this._pressTab);
        },

        _navigateBackward : function (callback) {
        	// ------------------------------------------------------ processing

            this._navigate(callback, this._pressShiftTab);
        },



        ////////////////////////////////////////////////////////////////////////
        // Assertions: DOM
        ////////////////////////////////////////////////////////////////////////

        _checkAttribute : function (id, element, attributeName, expected) {
            // ------------------------------------------------------ processing

            // actual value ----------------------------------------------------

            var attribute = element.getAttribute(attributeName);

            // condition -------------------------------------------------------

            var condition = attribute === expected;

            // message ---------------------------------------------------------

            var message = 'Widget "%1" should have attribute "%2" set to "%3", is has value "%4" instead';
            message = ariaUtilsString.substitute(message, [
                id,
                attributeName,
                expected,
                attribute
            ]);

            // check -----------------------------------------------------------

            this.assertTrue(condition, message);
        },

        _checkWidgetAttribute : function (id, attributeName, expected) {
            // ------------------------------------------- information retrieval

            var element = this._getWidgetDom(id);

            // ------------------------------------------------------ delegation

            this._checkAttribute(id, element, attributeName, expected);
        },

        _checkElementAttribute : function (id, attributeName, expected) {
            // ------------------------------------------- information retrieval

            var element = this.getElementById(id);

            // ------------------------------------------------------ delegation

            this._checkAttribute(id, element, attributeName, expected);
        },



        ////////////////////////////////////////////////////////////////////////
        // Assertions: Focus
        ////////////////////////////////////////////////////////////////////////

		_checkElementIsFocused : function (callback, id) {
            // ------------------------------------------- information retrieval

            var element = this.getElementById(id);

            // ------------------------------------------------------ processing

            var message = 'Element with id "%1" should be focused.';
            message = ariaUtilsString.substitute(message, [id]);

            this._waitAndCheck(callback, condition, message, this);

            // ------------------------------------------------- local functions

            function condition() {
                return this._isFocused(element);
            }
        },

        _checkWidgetIsFocused : function (callback, id) {
            // ------------------------------------------- information retrieval

            var widgetDom = this._getWidgetDom(id);

            // ------------------------------------------------------ processing

            var message = 'Widget with id "%1" should be focused.';
            message = ariaUtilsString.substitute(message, [id]);

            this._waitAndCheck(callback, condition, message, this);

            // ------------------------------------------------- local functions

            function condition() {
                return this._isFocused(widgetDom, false);
            }
        }
    }
});
