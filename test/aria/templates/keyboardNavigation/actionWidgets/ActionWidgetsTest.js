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
var ariaUtilsJson = require('ariatemplates/utils/Json');
var ariaUtilsArray = require('ariatemplates/utils/Array');
var ariaUtilsType = require('ariatemplates/utils/Type');



/**
 * Test a complete table navigation
 */
module.exports = Aria.classDefinition({
    $classpath : 'test.aria.templates.keyboardNavigation.actionWidgets.ActionWidgetsTest',

    $extends : require('ariatemplates/jsunit/RobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$RobotTestCase.constructor.call(this);

        // ---------------------------------------------------------- processing

        var data = {
            countersIds: [
                'button',
                'link'
            ],
            counters: {
                button: 0,
                link: 0
            },
            logs: []
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

        _pressShiftTab : function (callback) {
            this._pressWithShift(callback, this._pressTab);
        },



        _pushEnter : function (callback) {
            this._pushKey(callback, 'enter');
        },

        _releaseEnter : function (callback) {
            this._releaseKey(callback, 'enter');
        },

        _pressEnter : function (callback) {
            this._pressKey(callback, 'enter');
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
            // -----------------------------------------------------------------

            function checkCounters(next, expectedCounts) {
                this._checkCounters(expectedCounts);
                next();
            }

            this._localAsyncSequence(function (add) {
                // -------------------------------------------------------------

                add('_focusWidget', 'button');

                add('_pushEnter');
                add('_goToLink');
                add('_releaseEnter');
                add(checkCounters, {
                    button: 0,
                    link: 0
                });

                add('_actionWidget');
                add(checkCounters, {
                    button: 0,
                    link: 1
                });

                // -------------------------------------------------------------

                // focus link: done already

                add('_pushEnter');
                add('_goToButton');
                add('_releaseEnter');
                add(checkCounters, {
                    button: 0,
                    link: 0
                });

                add('_actionWidget');
                add(checkCounters, {
                    button: 1,
                    link: 0
                });

                // -------------------------------------------------------------

                // focus button: done already

                add('_pushEnter');
                add('_goToLink');
                add('_goToButton');
                add('_releaseEnter');
                add(checkCounters, {
                    button: 0,
                    link: 0
                });

                // -------------------------------------------------------------

                add('_goToLink');

                add('_pushEnter');
                add('_goToButton');
                add('_goToLink');
                add('_releaseEnter');
                add(checkCounters, {
                    button: 0,
                    link: 0
                });
            }, this.end);
        },



        ////////////////////////////////////////////////////////////////////////
        // Local library
        ////////////////////////////////////////////////////////////////////////

        _waitForAction : function (callback) {
            var data = this.templateCtxt.data;

            this._localAsyncSequence(function (add) {
                add(function (next) {
                    this.waitFor({
                        scope: this,
                        condition: function () {
                            return data.actionDone;
                        },
                        callback: next
                    });
                });
                add(function (next) {
                    ariaUtilsJson.setValue(data, 'actionDone', false);
                    next();
                });
            }, callback);
        },

        _actionWidget : function (callback) {
            this._localAsyncSequence(function (add) {
                add('_pressEnter');
                add('_waitForAction');
            }, callback);
        },

        _goToButton : function (callback) {
            this._goToActionWidget(callback, 'button', true);
        },

        _goToLink : function (callback) {
            this._goToActionWidget(callback, 'link');
        },

        _goToActionWidget : function (callback, id, reverseDirection) {
            // -------------------------------------- input arguments processing

            if (reverseDirection == null) {
                reverseDirection = false;
            }

            // ------------------------------------------------------ processing

            var widgetDom = this.getWidgetDom(id);

            this._localAsyncSequence(function (add) {
                if (reverseDirection) {
                    add('_pressShiftTab');
                } else {
                    add('_pressTab');
                }

                add('_waitForFocus', widgetDom, false);
            }, callback);
        },



        ////////////////////////////////////////////////////////////////////////
        // Assertions
        ////////////////////////////////////////////////////////////////////////

        _checkCounters : function (expectedCounts) {
            // --------------------------------------------------- destructuring

            var data = this.templateCtxt.data;

            var countersIds = data.countersIds;

            // ------------------------------------------------------ processing

            ariaUtilsArray.forEach(countersIds, function (id) {
                var expectedCount = expectedCounts[id];

                this._checkCounter(id, expectedCount);
            }, this);

            this._resetCounters();
        },

        _checkCounter : function (id, expected) {
            var count = this.templateCtxt.data.counters[id];

            var condition = count === expected;

            var message = ariaUtilsString.substitute(
                'Widget "%1" has not be actioned the expected number of times: %2 instead of %3',
                [id, count, expected]
            );

            this.assertTrue(condition, message);
        },

        _resetCounters : function () {
            // --------------------------------------------------- destructuring

            var data = this.templateCtxt.data;

            var counters = data.counters;
            var countersIds = data.countersIds;

            // ------------------------------------------------------ processing

            ariaUtilsArray.forEach(countersIds, function (id) {
                ariaUtilsJson.setValue(counters, id, 0);
            });
        }
   }
});
