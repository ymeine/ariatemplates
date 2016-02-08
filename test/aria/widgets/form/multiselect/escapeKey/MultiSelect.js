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

    $extends : require('test/EnhancedRobotTestCase'),

    $constructor : function () {
        this.$EnhancedRobotTestCase.constructor.call(this);

        this.setTestEnv({
            data: {
                id: 'multiSelect'
            }
        });
    },

    $prototype: {
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
