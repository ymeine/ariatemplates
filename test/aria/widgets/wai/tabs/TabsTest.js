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
var ariaUtilsString = require('ariatemplates/utils/String');



////////////////////////////////////////////////////////////////////////////////
// Models: Group (TabPanel + tabs), TabPanel, Tab
////////////////////////////////////////////////////////////////////////////////

function Group(waiAria, id, bindingContainer, macro, tabsUnder) {
    // -------------------------------------------------------------- properties

    this.waiAria = waiAria;
    this.id = id;

    if (tabsUnder == null) {
        tabsUnder = false;
    }
    this.tabsUnder = tabsUnder;

    // -------------------------------------------------------------- attributes

    var binding = {
        inside: bindingContainer,
        to: id
    };
    this.binding = binding;

    var tabPanel = new TabPanel(waiAria, id, binding, macro);
    this.tabPanel = tabPanel;

    var tabs = [];
    this.tabs = tabs;

    for (var index = 0, length = 2; index < length; index++) {
        var label = 'Tab ' + index;
        var tabId = id + '_tab_' + index;

        var tab = new Tab(waiAria, tabId, binding, label);

        tabs.push(tab);
    }
}

function TabPanel(waiAria, id, binding, macro) {
    // -------------------------------------------------------------- properties

    this.waiAria = waiAria;
    this.id = id;

    // -------------------------------------------------------------- attributes

    this.configuration = {
        id: id,
        bind: {
            selectedTab: binding
        },
        macro: {
            name: macro,
            args: [this]
        },
        waiAria: waiAria
    };
}

function Tab(waiAria, tabId, binding, label) {
    // -------------------------------------------------------------- properties

    this.waiAria = waiAria;
    this.tabId = tabId;
    this.label = label;

    // -------------------------------------------------------------- attributes

    this.configuration = {
        id: tabId,
        tabId: tabId,
        bind: {
            selectedTab: binding
        },
        waiAria: waiAria
    };
}



////////////////////////////////////////////////////////////////////////////////
// Model: Test
////////////////////////////////////////////////////////////////////////////////

module.exports = Aria.classDefinition({
    $classpath : 'test.aria.widgets.wai.tabs.TabsTest',
    $extends : require('test/EnhancedRobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$EnhancedRobotTestCase.constructor.call(this);

        // ---------------------------------------------------------- processing

        var macro = 'displayTabPanel';
        var bindingContainer = {};

        var groups = [];

        // ---------------------------------------------------------------------

        ariaUtilsArray.forEach([
            {
                id: 'up',
                waiAria: false,
                tabsUnder: false
            },
            {
                id: 'down',
                waiAria: false,
                tabsUnder: true
            },
            {
                id: 'up_waiAria',
                waiAria: true,
                tabsUnder: false
            },
            {
                id: 'down_waiAria',
                waiAria: true,
                tabsUnder: true
            }
        ], function (spec) {
            groups.push(new Group(
                spec.waiAria,
                spec.id,
                bindingContainer,
                macro,
                spec.tabsUnder
            ));
        });

        // ---------------------------------------------------------------------

        var data = {
            bindingContainer: bindingContainer,
            groups: groups,

            readBinding: this._readBinding
        };

        this.setTestEnv({
            data: data
        });
    },

    $prototype : {
        ////////////////////////////////////////////////////////////////////////
        // Tests: global
        ////////////////////////////////////////////////////////////////////////

        runTemplateTest : function () {
            this._localAsyncSequence(function (add) {
                add('_testNavigation');
                add('_testAttributes');
            }, this.end);
        },

        _runTestOnGroups : function (callback, test) {
            var groups = this._getData().groups;
            this._asyncIterate(groups, test, callback, this);
        },



        ////////////////////////////////////////////////////////////////////////
        // Tests: navigation
        ////////////////////////////////////////////////////////////////////////

        _testNavigation : function (callback) {
            this._localAsyncSequence(function (add) {
                add('_testTabNavigation');
                add('_testKeyboardSelection');
            }, callback);
        },

        _testTabNavigation : function (callback) {
            this._runTestOnGroups(callback, this._testTabNavigationForGroup);
        },

        _testKeyboardSelection : function (callback) {
            this._runTestOnGroups(callback, this._testKeyboardSelectionForGroup);
        },

        _testTabNavigationForGroup : function (callback, group) {
            // --------------------------------------------------- destructuring

            var tabsUnder = group.tabsUnder;
            var tabPanelId = group.tabPanel.id;
            var tabs = group.tabs;

            var firstTabId = tabs[0].tabId;
            var secondTabId = tabs[1].tabId;

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                add('_focusElementBefore', group.id);
                add('_pressTab');

                if (tabsUnder) {
                    add('_checkWidgetIsFocused', tabPanelId);

                    add('_pressTab');
                    add('_checkElementIsFocused', 'inside_' + tabPanelId);

                    add('_pressTab');
                    add('_checkWidgetIsFocused', firstTabId);

                    add('_pressTab');
                    add('_checkWidgetIsFocused', secondTabId);
                } else {
                    add('_checkWidgetIsFocused', firstTabId);

                    add('_pressTab');
                    add('_checkWidgetIsFocused', secondTabId);

                    add('_pressTab');
                    add('_checkWidgetIsFocused', tabPanelId);

                    add('_pressTab');
                    add('_checkElementIsFocused', 'inside_' + tabPanelId);
                }
            }, callback);
        },

        _testKeyboardSelectionForGroup : function (callback, group) {
            // --------------------------------------------------- destructuring

            var tabsUnder = group.tabsUnder;
            var tabPanelId = group.tabPanel.id;
            var tabs = group.tabs;

            var firstTab = tabs[0];
            var secondTab = tabs[1];

            // ------------------------------------------------------ processing

            var isNoTabSelected = this._createTabSelectedPredicate(group, null);
            var isFirstTabSelected = this._createTabSelectedPredicate(group, firstTab);
            var isSecondTabSelected = this._createTabSelectedPredicate(group, secondTab);

            this._localAsyncSequence(function (add) {
                add('_focusFirstTab', group);
                add(isNoTabSelected.waitForTrue);

                add('_pressEnter');
                add(isFirstTabSelected.waitForTrue);

                add('_navigateForward');
                add('_pressSpace');
                add(isSecondTabSelected.waitForTrue);

                add('_navigateBackward');
                add('_pressSpace');
                add(isFirstTabSelected.waitForTrue);
            }, callback);
        },



        ////////////////////////////////////////////////////////////////////////
        // Tests: attributes
        ////////////////////////////////////////////////////////////////////////

        _testAttributes : function (callback) {
            this._localAsyncSequence(function (add) {
                add('_testStaticAttributes');
                add('_testDynamicAttributes');
            }, callback);
        },

        _testStaticAttributes : function (callback) {
            this._runTestOnGroups(callback, this._testStaticAttributesForGroup);
        },

        _testDynamicAttributes : function (callback) {
            this._runTestOnGroups(callback, this._testDynamicAttributesForGroup);
        },

        _testStaticAttributesForGroup : function (callback, group) {
            var tabs = group.tabs;
            var tabPanel = group.tabPanel;

            this._localAsyncSequence(function (add) {
                add(this._createAsyncWrapper(function checkRoles() {
                    ariaUtilsArray.forEach(tabs, this._checkTabRole, this);
                    this._checkTabPanelRole(tabPanel);
                }));
                add('_checkWidgetAttribute', tabPanel.id, 'tabindex', '0');
            }, callback);
        },

        _checkTabRole : function (tab) {
            var expected = tab.waiAria ? 'tab' : null;
            this._checkWidgetRole(tab.tabId, expected);
        },

        _checkTabPanelRole : function (tabPanel) {
            var expected = tabPanel.waiAria ? 'tabpanel' : null;
            this._checkWidgetRole(tabPanel.id, expected);
        },

        _checkWidgetRole : function (id, expected) {
            this._checkWidgetAttribute(id, 'role', expected);
        },

        _testDynamicAttributesForGroup : function (callback, group) {
            var tabs = group.tabs;

            this._localAsyncSequence(function (add) {
                var tabIndex;

                add(unSelectTab, group);
                add('_testDynamicAttributesForGroupWhenNoTabSelected', group);

                add('_focusFirstTab', group);
                tabIndex = 0;
                add(selectTab, tabs[tabIndex]);
                add('_testDynamicAttributesForGroupWhenTabSelected', group, tabIndex);

                add('_navigateForward');
                tabIndex = 1;
                add(selectTab, tabs[tabIndex]);
                add('_testDynamicAttributesForGroupWhenTabSelected', group, tabIndex);

                add('_navigateBackward');
                tabIndex = 0;
                add(selectTab, tabs[tabIndex]);
                add('_testDynamicAttributesForGroupWhenTabSelected', group, tabIndex);
            }, callback);

            function unSelectTab(callback, group) {
                this._setBindingValue(group.binding, null);
                callback();
            }

            function selectTab(next, tab) {
                this._localAsyncSequence(function (add) {
                    add('_pressEnter');
                    add('_waitForWidgetFocus', tab.tabId);
                }, next);
            }
        },

        _testDynamicAttributesForGroupWhenNoTabSelected : function (callback, group) {
            // --------------------------------------------------- destructuring

            var tabs = group.tabs;
            var tabPanel = group.tabPanel;

            var tabPanelId = tabPanel.id;

            // ------------------------------------------------------ processing

            this._checkWidgetAttribute(tabPanelId, 'aria-labelledby', null);

            ariaUtilsArray.forEach(tabs, function (tab) {
                var tabId = tab.tabId;

                var expected;
                if (tab.waiAria && tabPanel.waiAria) {
                    expected = this._getWidgetId(tabPanelId);
                } else {
                    expected = null;
                }

                this._checkWidgetAttribute(tabId, 'aria-selected', null);

                this._checkWidgetAttribute(tabId, 'aria-controls', expected); // This is not dependent on the selection, so this check is not repeated inside the cases when a tab is selected
            }, this);

            // ---------------------------------------------------------- return

            callback();
        },

        _testDynamicAttributesForGroupWhenTabSelected : function (callback, group, tabIndex) {
            // --------------------------------------------------- destructuring

            var waiAria = group.waiAria;

            var tabs = group.tabs;
            var selectedTab = tabs[tabIndex];
            var nonSelectedTab = tabs[tabIndex === 1 ? 0 : 1];

            // ------------------------------------------------------ processing

            this._checkWidgetAttribute(selectedTab.tabId, 'aria-selected', selectedTab.waiAria ? 'true' : null);
            this._checkWidgetAttribute(nonSelectedTab.tabId, 'aria-selected', null);

            this._checkAriaLabelledBy(group, tabIndex);

            // ---------------------------------------------------------- return

            callback();
        },

        _checkAriaLabelledBy : function (group, tabIndex) {
            // --------------------------------------------------- destructuring

            var tabs = group.tabs;
            var tab = tabs[tabIndex];

            var tabPanel = group.tabPanel;
            var tabPanelId = tabPanel.id;

            // ------------------------------------------------------ processing

            var expected;
            if (tab.waiAria && tabPanel.waiAria) {
                var tabWidget = this.getWidgetInstance(tab.tabId);
                expected = tabWidget._getFrameId();
            } else {
                expected = null;
            }

            this._checkWidgetAttribute(tabPanelId, 'aria-labelledby', expected);
        },



        ////////////////////////////////////////////////////////////////////////
        // Local library
        ////////////////////////////////////////////////////////////////////////

        _createTabSelectedPredicate : function (group, tab) {
            var id = (tab != null) ? tab.tabId : null;

            return this._createPredicate(function () {
                var selectedTab = this._readBinding(group.binding);

                var result;

                if (id == null) {
                    result = selectedTab == null;
                } else {
                    result = selectedTab === id;
                }

                return result;
            }, function (shouldBeTrue, args) {
                var selectedTab = this._readBinding(group.binding);

                var message;
                if (id == null) {
                    message = 'No tab should be selected, instead "%1" is.';
                } else {
                    message = 'The wrong tab is selected: "%1" instead of "%2".';
                }

                return ariaUtilsString.substitute(message, [selectedTab, id]);
            });
        },

        _focusFirstTab : function (callback, group) {
            this._localAsyncSequence(function (add) {
                add('_focusElementBefore', group.id);
                add('_navigateForward'); // from anchor to following element
                if (group.tabsUnder) {
                    add('_navigateForward'); // from panel to element inside
                    add('_navigateForward'); // from element to first tab
                }
                add('_waitForWidgetFocus', group.tabs[0].tabId);
            }, callback);
        }
    }
});
