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
var EnhancedJawsBase = require('test/EnhancedJawsBase');
var PopupNavigationManager = require('ariatemplates/popups/PopupNavigationManager');

var ariaUtilsFunction = require('ariatemplates/utils/Function');



module.exports = Aria.classDefinition({
    $classpath : 'test.aria.popups.popupNavigationManager.PopupNavigationManagerJawsTestCase',
    $extends : EnhancedJawsBase,

    $constructor : function () {
        this.$EnhancedJawsBase.constructor.call(this);

        this.setTestEnv({
            template : 'test.aria.popups.popupNavigationManager.Tpl',
            data: {}
        });
    },



    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////

    $prototype : {
        ////////////////////////////////////////////////////////////////////////
        // Tests
        ////////////////////////////////////////////////////////////////////////

        skipRemoveDuplicates: true,

        runTemplateTest : function () {
            var regexps = [];
            regexps.push(this._createLineRegExp('AT tests*'));

            this._filter = ariaUtilsFunction.bind(this._applyRegExps, this, regexps);

            this._localAsyncSequence(function (add) {
                add('_testHide');
                add('_testShowBack');
                add('_checkHistory');
            }, this.end);
        },

        _testHide : function (callback) {
            // -----------------------------------------------------------------

            var node = this._getReferenceNode();

            PopupNavigationManager.hidingManager.hideOthers(node);
            node.className += ' isolated';

            var target = this._getNodeNameElement(node);

            this._executeStepsAndWriteHistory(callback, function (api) {
                // ----------------------------------------------- destructuring

                var step = api.step;
                var says = api.says;

                var click = api.click;
                var up = api.up;
                var down = api.down;

                // -------------------------------------------------- processing

                click(target);
                says('1.1');

                up(); // goes on the page's title
                // page's title is filtered from the output
                down();
                says('1.1');

                down();
                says('1.1.1');

                down();
                says('1.1.2');

                down();
                says('1.1.3');

                down();
                says('1.1.3');
            });
        },

        _testShowBack : function (callback) {
            // -----------------------------------------------------------------

            var node = this._getReferenceNode();

            PopupNavigationManager.hidingManager.showOthers(node);
            node.className = 'node';

            var target = this._getNodeNameElement(this.getElementById('1.1.3'));

            this._executeStepsAndWriteHistory(callback, function (api) {
                // ----------------------------------------------- destructuring

                var step = api.step;
                var says = api.says;

                var click = api.click;
                var up = api.up;
                var down = api.down;

                // -------------------------------------------------- processing

                click(target);
                says('1.1.3');

                down();
                says('1.2');

                up();
                says('1.1.3');

                up();
                says('1.1.2');

                up();
                says('1.1.1');

                up();
                says('1.1');

                up();
                says('1');
            });
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _getReferenceNode : function () {
            return this.getElementById('1.1');
        },

        _getNodeNameElement : function (node) {
            return node.getElementsByClassName('node_name')[0];
        }
    }
});
