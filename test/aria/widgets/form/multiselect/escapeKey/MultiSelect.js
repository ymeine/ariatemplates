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

var ariaUtilsType = require('ariatemplates/utils/Type');



module.exports = Aria.classDefinition({
    $classpath : 'test.aria.widgets.form.multiselect.escapeKey.MultiSelect',

    $extends : require('ariatemplates/jsunit/RobotTestCase'),

    $constructor : function () {
        this.$RobotTestCase.constructor.call(this);

        this.setTestEnv({
            data: {
                id: 'multiSelect'
            }
        });
    },

    $prototype: {
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

            var id = this.templateCtxt.data.id;

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                add('_focusWidget', id);

                add('_pressShiftF10');
                add('_checkWidgetDropdownIsOpen', id, true);

                add('_pressEscape');
                add('_checkWidgetDropdownIsOpen', id, false);
            }, this.end);
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _checkWidgetDropdownIsOpen : function (callback, id, shouldBeOpen) {
            // -------------------------------------- input arguments processing

            if (shouldBeOpen == null) {
                shouldBeOpen = true;
            }

            // ------------------------------------------------------ processing

            var message = ariaUtilsString.substitute(
                'Widget "%0" should have its dropdown %2',
                [id, shouldBeOpen ? 'open' : 'closed']
            );

            this._waitAndCheck(callback, condition, message, this);

            // -----------------------------------------------------------------

            function condition() {
                var isOpen = this.getWidgetDropDownPopup(id) != null;
                return isOpen === shouldBeOpen;
            }
        }
    }
});
