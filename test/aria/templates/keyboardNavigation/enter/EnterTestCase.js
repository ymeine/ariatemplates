/*
 * Copyright 2013 Amadeus s.a.s.
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

var ariaUtilsArray = require('ariatemplates/utils/Array');



/**
 * Test a complete table navigation
 */
module.exports = Aria.classDefinition({
    $classpath : 'test.aria.templates.keyboardNavigation.enter.EnterTestCase',
    $extends : require('test/EnhancedRobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$EnhancedRobotTestCase.constructor.call(this);

        // ------------------------------------------------- internal attributes

        this._elementsKeys = [
            'button',
            'link',
            'firstAnchor',
            'secondAnchor'
        ];

        this._elementToIdMap = {
            button: 'myButton',
            link: 'myLink',
            firstAnchor: 'anchor1',
            secondAnchor: 'anchor2'
        };

        this._useCases = this._getUseCases();

        // ---------------------------------------------------------- attributes

        this.data = {
            logs : []
        };

        // ---------------------------------------------------------- processing

        this.setTestEnv({
            template : 'test.aria.templates.keyboardNavigation.enter.TestTemplate',
            data : this.data
        });
    },

    $prototype : {
        ////////////////////////////////////////////////////////////////////////
        // Tests
        ////////////////////////////////////////////////////////////////////////

        runTemplateTest : function () {
            // -----------------------------------------------------------------

            // clean what was before
            this._disposeTestTemplate();

            // -----------------------------------------------------------------

            // add globalKeyMap
            aria.templates.NavigationManager.addGlobalKeyMap({
                key : 'enter',
                event : 'keyup',
                callback : {
                    fn : function () {
                        aria.utils.Json.add(this.data.logs, 'global');
                    },
                    scope : this
                }
            });

            // -----------------------------------------------------------------

            this._loadTestTemplate({
                fn : this._executeSteps,
                scope : this
            });
        },

        _executeSteps : function () {
            // --------------------------------------------------- destructuring

            var useCases = this._useCases;

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                add(focusStartingPoint);
                add(checkUseCases);
            }, this.end);

            // ------------------------------------------------- local functions

            function focusStartingPoint(next) {
                var startingPointElement = this.getElementById('startingPoint');
                startingPointElement.focus();
                this._waitForFocus(next, startingPointElement);
            }

            function checkUseCases(next) {
                this._asyncIterate(useCases, function (next, useCase, useCaseIndex) {
                    this._checkUseCase(next, useCaseIndex);
                }, next, this);
            }
        },

        _checkUseCase: function (callback, useCaseIndex) {
            // --------------------------------------------------- destructuring

            var elementsKeys = this._elementsKeys;

            // ------------------------------------------------------ processing

            this._asyncIterate(elementsKeys, function (next, element, elementIndex) {
                this._checkElement(next, useCaseIndex, elementIndex);
            }, callback, this);
        },

        _checkElement: function (callback, useCaseIndex, elementIndex) {
            // --------------------------------------------------- destructuring

            var useCases = this._useCases;
            var elementToIdMap = this._elementToIdMap;
            var elementsKeys = this._elementsKeys;

            var element = elementsKeys[elementIndex];

            var useCase = useCases[useCaseIndex];
            var expectedLogs = useCase[element];

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                add(performAction);
                add(check);
            }, callback);

            // ------------------------------------------------- local functions

            function performAction(next) {
                var elementId = elementToIdMap[element] + (useCaseIndex + 1);

                var args = {
                    id: elementId,
                    cb: next
                };

                if (element === 'link') {
                    args.getter = 'getLink';
                }

                this._goToAndPressEnterOn(args, expectedLogs);
            }

            function check(next) {
                var actualLogs = this.data.logs;
                useCase[element] = {
                    expected: expectedLogs,
                    actual: actualLogs
                };

                this._checkLogs(expectedLogs, useCaseIndex, element);

                next();
            }
        },

        _checkLogs : function (expectedItems, useCaseIndex, element) {
            // --------------------------------------------------- destructuring

            var data = this.data;
            var logs = data.logs;

            // ------------------------------------------------------ processing

            // logging helper --------------------------------------------------

            function buildMessage(base) {
                var message = base;

                if (useCaseIndex != null) {
                    message += ' (use case index: ' + useCaseIndex + ')';
                }

                if (element != null) {
                    message += ' (element: ' + element + ')';
                }

                return message;
            }

            // check number of items -------------------------------------------

            var expectedLength = expectedItems.length;
            var actualLength = logs.length;

            this.assertTrue(
                actualLength == expectedLength,
                buildMessage('Logs don\'t contain the expected number of messages: ' + actualLength + ' instead of ' + expectedLength + '.')
            );

            // check each item -------------------------------------------------

            ariaUtilsArray.forEach(expectedItems, function (expectedItem, index) {
                var actualItem = logs[index];

                this.assertTrue(
                    actualItem == expectedItem,
                    buildMessage('Log item is not the expected one: "' + actualItem + '" instead of "' + expectedItem + '" (index: ' + index + ').')
                );
            }, this);

            // clear logs ------------------------------------------------------

            aria.utils.Json.setValue(data, 'logs', []);
        },



        ////////////////////////////////////////////////////////////////////////
        // Actions
        ////////////////////////////////////////////////////////////////////////

        _goToAndPressEnterOn : function (args, expectedLogs) {
            // -------------------------------------- input arguments processing

            var id = args.id;

            var getter = args.getter;
            if (getter == null) {
                getter = 'getElementById';
            }

            // --------------------------------------------------- destructuring

            var data = this.data;
            var logs = data.logs;

            // ------------------------------------------------------ processing

            var widgetElement = this[getter](id);

            this._localAsyncSequence(function (add) {
                add('_pressTab');
                add('_waitForFocus', widgetElement, false);
                add('_pressEnter');
                add(waitForLogs);
            }, function () {
                this.$callback(args.cb);
            });

            // ------------------------------------------------- local functions

            function waitForLogs(next) {
                this.waitFor({
                    condition: function () {
                        var newLogs = data.logs;
                        var logsArrived = newLogs.length === expectedLogs.length;

                        return logsArrived;
                    },

                    callback: next
                });
            }
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _getUseCases : function () {
            // ------------------------------------------------------ processing

            var useCases = [];

            // 1 ---------------------------------------------------------------

            useCases.push({
                button: [
                    'button',
                    'section',
                    'global'
                ],
                link: [
                    'link',
                    'section',
                    'global'
                ],
                firstAnchor: [
                    'anchorOne',
                    'section',
                    'global'
                ],
                secondAnchor: [
                    'anchorTwoOnEnter',
                    'anchorTwo',
                    'section',
                    'global'
                ]
            });

            // 2 ---------------------------------------------------------------

            useCases.push({
                button: [
                    'button',
                    'section'
                ],
                link: [
                    'link',
                    'section'
                ],
                firstAnchor: [
                    'anchorOne',
                    'section'
                ],
                secondAnchor: [
                    'anchorTwoOnEnter',
                    'anchorTwo',
                    'section'
                ]
            });

            // 3 ---------------------------------------------------------------

            useCases.push({
                button: [
                    'button'
                ],
                link: [
                    'link'
                ],
                firstAnchor: [
                    'anchorOne',
                    'section'
                ],
                secondAnchor: [
                    'anchorTwo',
                    'anchorTwoOnEnter'
                ]
            });

            // 4 ---------------------------------------------------------------

            useCases.push({
                button: [
                    'button',
                    'global'
                ],
                link: [
                    'link',
                    'global'
                ],
                firstAnchor: [
                    'section',
                    'anchorOne',
                    'global'
                ],
                secondAnchor: [
                    'anchorTwoOnEnter',
                    'section',
                    'anchorTwo',
                    'global'
                ]
            });

            // ---------------------------------------------------------- return

            return useCases;
        }
    }
});
