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
    $classpath : "test.aria.widgets.form.autocomplete.multiautocomplete.navigation.tab.TabTestCase",
    $extends : "test.aria.widgets.form.autocomplete.multiautocomplete.navigation.BaseTestCase",

    $prototype : {
        runTemplateTest : function() {
            this.sequencer.run({tasks: [
                {
                    name: 'Focus input field',
                    method: 'focusInputField'
                },
                {
                    name: 'Insert text to be in a usual use case (this text has some matches)',
                    method: 'insertText',
                    args: ['a']
                },
                {
                    name: 'Insert options',
                    method: 'selectSuggestions',
                    args: [['a']]
                },
                {
                    name: 'Select first option with navigation',
                    method: 'pressLeftArrow',
                    args: [2]
                },

                {
                    name: 'Tab behavior in highlighted mode',
                    children: '__inHighlightedMode'
                },
                {
                    name: 'Tab behavior in input field',
                    children: '__inInputField'
                }
            ]});
        },

        __inHighlightedMode : function() {
            return [
                {
                    name: 'Check that input field actually does not have focus',
                    method: 'shouldInputFieldBeFocused',
                    args: [false]
                },
                {
                    name: 'Press tab while in highlighted mode',
                    method: 'pressTab'
                },
                {
                    name: 'Check focus went back to the input field',
                    method: 'shouldInputFieldBeFocused',
                    args: [true]
                }
            ];
        },

        __inInputField : function(task) {
            return [
                {
                    name: 'Press tab while in input field',
                    method: 'pressTab'
                },
                {
                    name: 'Check that input field lost focus',
                    method: 'shouldInputFieldBeFocused',
                    args: [false]
                }
            ];
        }
    }
});
