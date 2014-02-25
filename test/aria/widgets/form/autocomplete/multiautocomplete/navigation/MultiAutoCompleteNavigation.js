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

Aria.classDefinition({
    $classpath : "test.aria.widgets.form.autocomplete.multiautocomplete.navigation.MultiAutoCompleteNavigation",

    $extends : "test.aria.widgets.form.autocomplete.multiautocomplete.BaseMultiAutoCompleteTestCase",

    $dependencies: [
        "test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Sequencer",
        "aria.utils.Type",
        "aria.utils.Caret",
        "aria.utils.Array",

        "test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Helpers"
    ],

    $constructor : function() {
        this.$BaseMultiAutoCompleteTestCase.constructor.call(this);
        this.HELPERS = test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Helpers;

        this.sequencer = new test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Sequencer({
            scope: this,
            asynchronous: true,
            trace: {
                enable: true,
                collapsed: false,
                logTask: false,
                color: 'blue'
            }
        });
    },

    $prototype : {
        /***********************************************************************
         * Actions
         *
         * User actions: keyboard, clicks.
         **********************************************************************/

        /**
         * Enter given sequence of text.
         *
         * @param[in] {Object|test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Task} taskOrCb A classical callback definition or the task context in which this method is being called.
         * @param[in] {String|Array{String}} textSequence An array of input or a simple string (corresponding to a sequence with one item)
         * @param[in] {Number} delay An integer corresponding to the time to wait between each input of the given text sequence.
         */
        __type : function(taskOrCb, textSequence, delay) {
            // Input arguments processing --------------------------------------

            // -------------------------------------------------------------- cb

            var cb;
            if (aria.utils.Type.isInstanceOf(taskOrCb, "test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Task")) {
                cb = {
                    fn: taskOrCb.end,
                    scope: taskOrCb
                };
            } else {
                cb = taskOrCb;
            }

            // ---------------------------------------------------- textSequence

            if (aria.utils.Type.isString(textSequence)) {
                textSequence = [textSequence];
            } else if (!aria.utils.Type.isArray(textSequence)) {
                throw new Error('Invalid given textSequence. Should be an array or a string, got: ' + textSequence);
            }

            // ----------------------------------------------------------- delay

            if (delay == null) {
                delay = 100;
            }

            // Processing ------------------------------------------------------

            this.type(null, {
                text: textSequence,
                cb: cb,
                delay: delay
            });
        },

        /**
         * Presses the key corresponding to the given name.
         *
         * @param[in] task The task context in which this method is being called.
         * @param[in] {String} keyName The name of the key to press.
         * @param[in] {Number} times The number of times to press the key. Defaults to 1.
         */
        __pressKey : function(task, keyName, times) {
            // Input arguments processing --------------------------------------

            // ----------------------------------------------------------- times

            if (times == null) {
                times = 1;
            }

            // Processing ------------------------------------------------------

            var keySequence = this.HELPERS.repeat("[" + keyName + "]", times);

            this.__type(task, keySequence);
        },


        /**
         * Presses the left arrow key.
         *
         * @see __pressKey
         */
        __pressLeftArrow : function() {
            this.__pressKey.apply(this, this.HELPERS.insertInArray(arguments, 'left', 1));
        },
        /**
         * Presses the right arrow key.
         *
         * @see __pressKey
         */
        __pressRightArrow : function() {
            this.__pressKey.apply(this, this.HELPERS.insertInArray(arguments, 'right', 1));
        },
        /**
         * Presses the tab key.
         *
         * @see __pressKey
         */
        __pressTab : function() {
            this.__pressKey.apply(this, this.HELPERS.insertInArray(arguments, 'tab', 1));
        },



        /***********************************************************************
         * Specific actions
         *
         * User actions which interact specifically with components of the widget.
         **********************************************************************/

        /**
         * Focuses the input field.
         *
         * @param[in] task The task context in which this method is being called.
         */
        __focusInputField : function(task) {
            this.synEvent.click(this._getField(), {
                fn: task.end,
                scope: task
            });
        },

        /**
         * Inserts text into the input field.
         *
         * @param[in] task The task context in which this method is being called.
         * @param[in] {String} text The text to enter in the input
         */
        __insertText : function(task, text) {
            this.__type(task, text);
        },

        /**
         * Executes all the necessary events in order to select a suggestion from the dropdown list and insert it into the widget.
         *
         * @param[in] task The task context in which this method is being called.
         * @param[in] {Array{String}} inputs A list of text input values to use to match available suggestions. Only the first matching selection gets inserted.
         */
        __selectSuggestions : function(task, inputs) {
            // Backup field state ----------------------------------------------

            var field = this._getField();
            var backup = {
                value:  field.value,
                caret: aria.utils.Caret.getPosition(field)
            };

            // Insert options --------------------------------------------------

            field.value = "";

            var text = [];
            aria.utils.Array.forEach(inputs, function(input) {
                text.push(input);
                text.push("[down]");
                text.push("[enter]");
            });

            this.__type({
                fn: function() {
                    // Restore field state -------------------------------------
                    field.value = backup.value;
                    aria.utils.Caret.setPosition(field, backup.caret);

                    task.end();
                },
                scope: this
            }, text);
        },



        /***********************************************************************
         * States tests
         **********************************************************************/

        // Helpers -------------------------------------------------------------

        /**
         * Tells whether the input field is focused or not.
         *
         * @see aria.widgets.form.MultiAutoComplete.isInputFieldFocused
         */
        __isInputFieldFocused : function() {
            return this._getWidgetInstance().isInputFieldFocused();
        },

        /**
         * Tells whether the widget is in highlighted mode or not.
         *
         * @see aria.widgets.form.MultiAutoComplete.isInHighlightedMode
         */
        __isInHighlightedMode : function() {
            return this._getWidgetInstance().isInHighlightedMode();
        },

        /**
         * Returns the number of currently inserted options.
         *
         * @see aria.widgets.form.MultiAutoComplete.insertedOptionsCount
         */
        __getInsertedOptionsCount : function() {
            return this._getWidgetInstance().insertedOptionsCount();
        },


        // Tasks ---------------------------------------------------------------

        // ---------------------------------------------------- Selected options

        /**
         * Checks the number of inserted options.
         *
         * @param[in] task The task context in which this method is being called.
         * @param[in] {Number} count The expected number of inserted options.
         *
         * @see __getInsertedOptionsCount
         */
        __checkInsertedOptionsCount : function(task, count) {
            var actualCount = this.__getInsertedOptionsCount();

            this.assertEquals(count, actualCount, "The number of selected options is not as expected: " + actualCount + " instead of " + count);
        },

        // -------------------------------------------------------- Highlighting

        /**
         * Checks if the widget highlighted mode is in proper state.
         *
         * @param[in] task The task context in which this method is being called.
         * @param[in] {Boolean} should <code>true</code> if it should be in highlighted mode, <code>false</code> otherwise.
         *
         * @see __isInHighlightedMode
         */
        __shouldBeInHighlightedMode : function(task, should) {
            var isInHighlightedMode = this.__isInHighlightedMode();
            if (should) {
                this.assertTrue(isInHighlightedMode, "Widget is not in highlighted mode");
            } else {
                this.assertFalse(isInHighlightedMode, "Widget should not be in highlighted mode");
            }
        },
        /**
         * Check that the inserted option at the given index is the only one currently highlighted.
         *
         * @param[in] task The task context in which this method is being called.
         * @param[in] {Number} index Corresponds to the index of the getHighlight method (1-based)
         */
        __checkHighlightedOption : function(task, index) {
            this.checkHighlightedElementsIndices([index]);
        },


        // --------------------------------------------------------- Input field

        /**
         * Checks if the input field focus is in proper state.
         *
         * @param[in] task The task context in which this method is being called.
         * @param[in] {Boolean} should <code>true</code> if it should be focused, <code>false</code> otherwise.
         *
         * @see __isInputFieldFocused
         */
        __shouldInputFieldBeFocused : function(task, should) {
            var isFocused = this.__isInputFieldFocused();
            if (should) {
                this.assertTrue(isFocused, "Input field is not focused");
            } else {
                this.assertFalse(isFocused, "Input field should not be focused");
            }
        },

        /**
         * Checks the position of the caret in the input field, and also that the latter is focused.
         *
         * @param[in] task The task context in which this method is being called.
         * @param[in] {Number} expectedPosition The expected position of the caret. Only the start index. 0-based.
         *
         * @see __shouldInputFieldBeFocused
         */
        __checkCaretAndFocus : function(task, expectedPosition) {
            this.__shouldInputFieldBeFocused(null, true);

            var position = aria.utils.Caret.getPosition(this._getField()).start;
            this.assertEquals(position, expectedPosition, "Actual caret position: " + position + ". Expected: " + expectedPosition);
        },





        /***********************************************************************
         * Main test
         **********************************************************************/

        runTemplateTest : function() {
            this.sequencer.run({
                onend: {
                    fn: this.end,
                    scope: this
                },

                tasks: [
                    {
                        name : 'Navigation',
                        children : [
                            {
                                name: 'Navigation in input field',
                                children: [
                                    {
                                        name: 'Focus input field',
                                        method: '__focusInputField'
                                    },
                                    {
                                        name: 'Left navigation in input field',
                                        children: '_testLeftNavigationInInputField'
                                    }
                                ]
                            },
                            {
                                name: 'Navigation in highlighted mode',
                                children: [
                                    {
                                        name: 'Left navigation in highlighted mode',
                                        children: '_testLeftNavigationInHighlightedMode'
                                    },
                                    {
                                        name: 'Right navigation in highlighted mode',
                                        children: '_testRightNavigationInHighlightedMode'
                                    }
                                ]
                            }
                        ]
                    },
                    // ---------------------------------------------------------
                    {
                        name : 'Tab behavior',
                        children : [
                            {
                                name: 'Tab behavior in highlighted mode',
                                children: '_testTabBehaviorInHighlightedMode'
                            },
                            {
                                name: 'Tab behavior in input field',
                                children: '_testTabBehaviorInInputField'
                            }
                        ]
                    }
                ]
            });
        },





        /***********************************************************************
         * Navigation
         **********************************************************************/

        // Input field ---------------------------------------------------------

        // ---------------------------------------------------------------- Left
        _testLeftNavigationInInputField : [
                {
                    name: 'Insert text to be in a usual use case (this text has some matches)',
                    method: '__insertText',
                    args: ['a']
                },
                // Left in text and no selected option -------------------------
                {
                    name: 'Navigate left from within the text when there is no selected option',
                    method: '__pressLeftArrow'
                },
                {
                    name: 'Check caret went back to 0',
                    method: '__checkCaretAndFocus',
                    args: [0],
                    asynchronous: false
                },
                // Left on the edge and no selected option ---------------------
                {
                    name: 'Navigate left from the left edge of the input, without any selected option',
                    method: '__pressLeftArrow'
                },
                {
                    name: 'Check caret remained at position 0',
                    method: '__checkCaretAndFocus',
                    args: [0],
                    asynchronous: false
                },
                // Insert options & go back to right
                {
                    name: 'Insert two options',
                    method: '__selectSuggestions',
                    args: [['a', 'a']]
                },
                {
                    name: 'Navigate right to be within the text again',
                    method: '__pressRightArrow'
                },
                // Left in text and selected options present -------------------
                {
                    name: 'Navigate left from within the text when there are selected options',
                    method: '__pressLeftArrow'
                },
                {
                    name: 'Check caret went back to 0',
                    method: '__checkCaretAndFocus',
                    args: [0],
                    asynchronous: false
                },
                // Left on the edge and selected options present ---------------
                {
                    name: 'Navigate left from the left edge of the input, now that there are options to highlight',
                    method: '__pressLeftArrow'
                },
                {
                    name: 'Check that the index of the highlighted option is corresponding to the one that was the last',
                    method: '__checkHighlightedOption',
                    args: [2],
                    asynchronous: false
                },
                {
                    name: 'Also check that in free text mode the current text is added',
                    method: '__checkInsertedOptionsCount',
                    args: [3],
                    asynchronous: false
                }
        ],

        // Highlighted mode ----------------------------------------------------

        // ---------------------------------------------------------------- Left
        _testLeftNavigationInHighlightedMode : [
            {
                name: 'Navigate left while in highlighted mode',
                method: '__pressLeftArrow'
            },
            {
                name: 'Check that the previous option has been highlighted (exclusively)',
                method: '__checkHighlightedOption',
                args: [1],
                asynchronous: false
            },
            {
                name: 'Navigate left while on the left edge of the selected options container',
                method: '__pressLeftArrow'
            },
            {
                name: 'Check that nothing changed',
                method: '__checkHighlightedOption',
                args: [1],
                asynchronous: false
            }
        ],

        // --------------------------------------------------------------- Right
        _testRightNavigationInHighlightedMode : function() {
            return [
                {
                    name: 'Navigate right while in highlighted mode',
                    method: '__pressRightArrow'
                },
                {
                    name: 'Check that the next option has been highlighted (exclusively)',
                    method: '__checkHighlightedOption',
                    args: [2],
                    asynchronous: false
                },
                {
                    name: 'Navigate right beyond the right edge of the list of selected options',
                    method: '__pressRightArrow',
                    args: [2]
                },
                {
                    name: 'Check that the highlighted mode is off',
                    method: '__shouldBeInHighlightedMode',
                    args: [false],
                    asynchronous: false
                },
                {
                    name: 'Also check that the input field has focus and the caret is at its beginning',
                    method: '__checkCaretAndFocus',
                    args: [0],
                    asynchronous: false
                }
            ];
        },





        /***********************************************************************
         * Tab behavior
         **********************************************************************/

        // Highlighted mode ----------------------------------------------------

        _testTabBehaviorInHighlightedMode : function() {
            return [
                {
                    name: 'Go back to highlighted mode, with one of the first options highlighted',
                    method: '__pressLeftArrow',
                    args: [2]
                },
                {
                    name: 'Check that input field does not have focus anymore',
                    method: '__shouldInputFieldBeFocused',
                    args: [false],
                    asynchronous: false
                },
                {
                    name: 'Press tab while in highlighted mode',
                    method: '__pressTab'
                },
                {
                    name: 'Check focus went back to the input field and the caret is at its beginning',
                    method: '__checkCaretAndFocus',
                    args: [0],
                    asynchronous: false
                }
            ];
        },

        // Input field ---------------------------------------------------------

        _testTabBehaviorInInputField : function(task) {
            return [
                {
                    name: 'Press tab while in input field',
                    method: '__pressTab'
                },
                {
                    name: 'Check that input field lost focus',
                    method: '__shouldInputFieldBeFocused',
                    args: [false],
                    asynchronous: false
                }
            ];
        }
    }
});
