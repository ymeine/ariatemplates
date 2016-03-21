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

var ariaUtilsArray = require('ariatemplates/utils/Array');

var EnhancedRobotTestCase = require('test/EnhancedRobotTestCase');
var ModalDialogJawsTest = require('test/aria/widgets/wai/popup/dialog/modal/ModalDialogJawsTest');
var ariaJsunitJawsTestCase = require('ariatemplates/jsunit/JawsTestCase');

var Model = require('./Model');



module.exports = Aria.classDefinition({
    $classpath : 'test.aria.widgets.wai.tabs.TabsJawsTest',
    $extends : ariaJsunitJawsTestCase,

    $constructor : function () {
        this.$JawsTestCase.constructor.call(this);

        this._history = [];

        var data = Model.buildData();
        var groups = data.groups;
        groups = [groups[2]];
        data.groups = groups;

        this.setTestEnv({
            template : 'test.aria.widgets.wai.tabs.Tpl',
            data : data
        });
    },



    ////////////////////////////////////////////////////////////////////////////
    // Duplicate
    ////////////////////////////////////////////////////////////////////////////

    $prototype : {
        $init : function (prototype) {
            var source = EnhancedRobotTestCase.prototype;

            for (var key in source) {
                if (source.hasOwnProperty(key) && !prototype.hasOwnProperty(key)) {
                    prototype[key] = source[key];
                }
            }

            source = ModalDialogJawsTest.prototype;

            ariaUtilsArray.forEach([
                '_checkHistory',
                '_executeStepsAndWriteHistory'
            ], function (key) {
                if (source.hasOwnProperty(key) && !prototype.hasOwnProperty(key)) {
                    prototype[key] = source[key];
                }
            });
        },



        ////////////////////////////////////////////////////////////////////////
        // Tests
        ////////////////////////////////////////////////////////////////////////

        runTemplateTest : function () {
            this._localAsyncSequence(function (add) {
                add('_testGroups');
                add('_checkHistory');
            }, this.end);
        },



        ////////////////////////////////////////////////////////////////////////
        //
        ////////////////////////////////////////////////////////////////////////

        _testGroups : function (callback) {
            var groups = this._getData().groups;

            this._asyncIterate(
                groups,
                this._testGroup,
                callback,
                this
            );
        },

        _testGroup : function (callback, group) {
            // ----------------------------------------------- early termination

            if (!group.waiAria || group.tabsUnder) {
                callback();
                return;
            }

            // --------------------------------------------------- destructuring

            var tabs = group.tabs;

            // ------------------------------------------------------ processing

            // TODO Test when selecting one tab
            this._executeStepsAndWriteHistory(callback, function (step, entry) {
                step(['click', this.getElementById(group.elementBeforeId)]);
                entry('Element before ' + group.id + ' Link'); // TODO clear history instead
                step(['type', null, '[enter]']);

                ariaUtilsArray.forEach(tabs, function (tab) {
                    step(['type', null, '[down]']);

                    entry(tab.label);

                    var description = [];
                    description.push('Tab');
                    if (tab.disabled) {
                        description.push('Unavailable');
                    }
                    if (tab.isSelected()) {
                        description.push('open', 'expanded');
                    } else {
                        description.push('closed', 'collapsed');
                    }
                    entry(description.join(' '));
                });

                step(['type', null, '[down]']);
                var description = 'tab panel start';
                var selectedTab = group.getSelectedTab();
                if (selectedTab != null) {
                    description += ' ' + selectedTab.label;
                }
                entry(description);

                step(['type', null, '[down]']);
                entry('WaiAria activated: true');
                step(['type', null, '[down]']);
                step(['type', null, '[down]']);
                entry('Edit');

                step(['type', null, '[down]']);
                entry('tab panel end');
            });
        }
    }
});
