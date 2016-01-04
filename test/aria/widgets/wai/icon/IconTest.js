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

var ariaUtilsString = require('ariatemplates/utils/String');
var ariaUtilsJson = require('ariatemplates/utils/Json');



module.exports = Aria.classDefinition({
    $classpath : 'test.aria.widgets.wai.icon.IconTest',
    $extends : require('test/EnhancedRobotTestCase'),

    $constructor : function () {
        this.$EnhancedRobotTestCase.constructor.call(this);

        this._useCases = [
            {
                id: 'waiEnabled',
                waiAria: true
            },
            {
                id: 'waiDisabled',
                waiAria: false
            }
        ];

        this.setTestEnv({
            data: {
                calledCounter: 0,
                label: 'waiLabel'
            }
        });
    },

    $prototype: {
        ////////////////////////////////////////////////////////////////////////
        // Tests
        ////////////////////////////////////////////////////////////////////////

        runTemplateTest : function () {
            this._asyncIterate(
                this._useCases,
                this._testUseCase,
                this.end,
                this
            );
        },



        ////////////////////////////////////////////////////////////////////////
        // Tests: specific
        ////////////////////////////////////////////////////////////////////////

        _testUseCase : function (callback, useCase) {
            this._localAsyncSequence(function (add) {
                add('_testLabel', useCase);
                add('_testTabFocus', useCase);
                if (useCase.waiAria) {
                    add('_testActionOnKeyDown', useCase);
                }
            }, callback);
        },

        _testLabel : function (callback, useCase) {
            // --------------------------------------------------- destructuring

            var data = this._getData();
            var waiAria = useCase.waiAria;
            var widgetDom = this._getWidgetDom(useCase.id);

            // ------------------------------------------------------ processing

            var condition;
            var message;

            var attributeValue = widgetDom.getAttribute('aria-label');
            if (waiAria) {
                var expectedValue = data.label;

                condition = attributeValue === expectedValue;
                message = ariaUtilsString.substitute(
                    'The icon should have a label with value "%1", instead it has the value "%2"',
                    [expectedValue, attributeValue]
                );
            } else {
                condition = !attributeValue;
                message = ariaUtilsString.substitute(
                    'The icon should not have a label value, instead it has the value "%1"',
                    [attributeValue]
                );
            }

            this.assertTrue(condition, message);

            // ---------------------------------------------------------- return

            callback();
        },

        _testTabFocus : function (callback, useCase) {
            // --------------------------------------------------- destructuring

            var id = useCase.id;
            var waiAria = useCase.waiAria;

            // ------------------------------------------------------ processing

            var isIconFocused = this._createPredicate(function () {
                return this._isWidgetFocused(id);
            }, function (shouldBeTrue) {
                return ariaUtilsString.substitute('Icon should%1be focused.', [
                    shouldBeTrue ? ' ' : ' not '
                ]);
            });

            this._localAsyncSequence(function (add) {
                add('_focusElementBefore', id);
                add('_pressTab');
                add('_waitForFocusChange');

                if (waiAria) {
                    add(isIconFocused.assertTrue);
                } else {
                    add(isIconFocused.assertFalse);
                }
            }, callback);
        },

        _testActionOnKeyDown : function (callback, useCase) {
            // --------------------------------------------------- destructuring

            var data = this._getData();
            var id = useCase.id;

            // ------------------------------------------------------ processing

            function check(next) {
                this.assertTrue(
                    data.calledCounter === 1,
                    'Icon action was not properly triggered when pressing action key while focused.'
                );

                ariaUtilsJson.setValue(data, 'calledCounter', 0);
            }
            this._createAsyncWrapper(check);

            this._localAsyncSequence(function (add) {
                add('_focusWidget', id);

                add('_pressEnter');
                add(check);

                add('_pressSpace');
                add(check);
            }, callback);
        }
    }
});
