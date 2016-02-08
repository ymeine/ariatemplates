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
var ariaUtilsArray = require('ariatemplates/utils/Array');
var ariaUtilsString = require('ariatemplates/utils/String');
var ariaUtilsType = require('ariatemplates/utils/Type');

var ariaUtilsDom = require('ariatemplates/utils/Dom');



////////////////////////////////////////////////////////////////////////////////
// Models: Group (TabPanel + tabs), TabPanel, Tab
////////////////////////////////////////////////////////////////////////////////

function Group(waiAria, id, bindingContainer, macro, tabsUnder) {
    // -------------------------------------------------------------- properties

    // -------------------------------------------------------------------------

    this.waiAria = waiAria;
    this.id = id;

    // tabsUnder ---------------------------------------------------------------

    if (tabsUnder == null) {
        tabsUnder = false;
    }
    this.tabsUnder = tabsUnder;

    // -------------------------------------------------------------- attributes

    // binding -----------------------------------------------------------------

    var binding = {
        inside: bindingContainer,
        to: id
    };

    this.binding = binding;

    // tabPanel ----------------------------------------------------------------

    var tabPanel = new TabPanel(waiAria, id, binding, macro);
    this.tabPanel = tabPanel;

    // tabs --------------------------------------------------------------------

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
    $classpath : "test.aria.widgets.wai.tabs.TabsTest",
    $extends : require('test/EnhancedRobotTestCase'),

    $constructor : function () {
        // ------------------------------------------------------ initialization

        this.$EnhancedRobotTestCase.constructor.call(this);

        // ---------------------------------------------------------- processing

        var macro = 'displayTabPanel';
        var bindingContainer = {};

        var groups = [];
        var groupsIndex = {};

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
            var id = spec.id;

            var group = new Group(spec.waiAria, id, bindingContainer, macro, spec.tabsUnder);

            groups.push(group);
            groupsIndex[id] = group;
        });

        // ---------------------------------------------------------------------

        var data = {
            bindingContainer: bindingContainer,
            groups: groups,
            groupsIndex: groupsIndex
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
            var groups = this.templateCtxt.data.groups;
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
            var tabsUnder = group.tabsUnder;
            var tabPanelId = group.tabPanel.id;
            var tabs = group.tabs;

            this._localAsyncSequence(function (add) {
                add('_focusElementBeforeGroup', group);
                add('_pressTab');

                if (tabsUnder) {
                    add('_checkWidgetIsFocused', tabPanelId);

                    add('_pressTab');
                    add('_checkElementIsFocused', 'inside_' + tabPanelId);

                    add('_pressTab');
                    add('_checkWidgetIsFocused', tabs[0].tabId);

                    add('_pressTab');
                    add('_checkWidgetIsFocused', tabs[1].tabId);
                } else {
                    add('_checkWidgetIsFocused', tabs[0].tabId);

                    add('_pressTab');
                    add('_checkWidgetIsFocused', tabs[1].tabId);

                    add('_pressTab');
                    add('_checkWidgetIsFocused', tabPanelId);

                    add('_pressTab');
                    add('_checkElementIsFocused', 'inside_' + tabPanelId);
                }
            }, callback);
        },

        _testKeyboardSelectionForGroup : function (callback, group) {
            var tabsUnder = group.tabsUnder;
            var tabPanelId = group.tabPanel.id;
            var tabs = group.tabs;

            this._localAsyncSequence(function (add) {
                add('_focusFirstTab', group);
                add('_checkSelectedTab', group, null);

                add('_pressEnter');
                add('_checkSelectedTab', group, tabs[0]);

                add('_navigateForward');
                add('_pressSpace');
                add('_checkSelectedTab', group, tabs[1]);

                add('_navigateBackward');
                add('_pressSpace');
                add('_checkSelectedTab', group, tabs[0]);
            }, callback);
        },

        _checkSelectedTab : function (callback, group, tab) {
            // ------------------------------------------- information retrieval

            var selectedTab = this._readBinding(group.binding);
            var id = (tab != null) ? tab.tabId : null;

            // ------------------------------------------------------ processing

            var message;
            if (id == null) {
                message = 'No tab should be selected, instead "%1" is.';
            } else {
                message = 'The wrong tab is selected: "%1" instead of "%2".';
            }

            message = ariaUtilsString.substitute(message, [selectedTab, id]);

            this._waitAndCheck(callback, condition, message, this);

            // -----------------------------------------------------------------

            function condition () {
                return this._isTabSelected(group, tab);
            }
        },

        _isTabSelected : function (group, tab) {
            // ------------------------------------------- information retrieval

            var selectedTab = this._readBinding(group.binding);
            var id = (tab != null) ? tab.tabId : null;

            // ------------------------------------------------------ processing

            var result;

            if (id == null) {
                result = selectedTab == null;
            } else {
                result = selectedTab === id;
            }

            // ---------------------------------------------------------- return

            return result;
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
            // --------------------------------------------------- destructuring

            var tabs = group.tabs;
            var tabPanel = group.tabPanel;

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                add(checkRoles);
                add(checkTabindex);
            }, callback);

            // -----------------------------------------------------------------

            function checkRoles(next) {
                ariaUtilsArray.forEach(tabs, this._checkTabRole, this);
                this._checkTabPanelRole(tabPanel);
                next();
            }

            function checkTabindex(next) {
                this._checkWidgetAttribute(tabPanel.id, 'tabindex', '0');
                next();
            }
        },

        _checkTabRole : function (tab) {
            // --------------------------------------------------- destructuring

            var tabId = tab.tabId;
            var waiAria = tab.waiAria;

            // ------------------------------------------------------ processing

            var expected = waiAria ? 'tab' : null;

            this._checkWidgetRole(tabId, expected);
        },

        _checkTabPanelRole : function (tabPanel) {
            // --------------------------------------------------- destructuring

            var id = tabPanel.id;
            var waiAria = tabPanel.waiAria;

            // ------------------------------------------------------ processing

            var expected = waiAria ? 'tabpanel' : null;

            this._checkWidgetRole(id, expected);
        },

        _checkWidgetRole : function (id, expected) {
            // ------------------------------------------------------ delegation

            this._checkWidgetAttribute(id, 'role', expected);
        },

        _testDynamicAttributesForGroup : function (callback, group) {
            // --------------------------------------------------- destructuring

            var tabs = group.tabs;

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                // -------------------------------------------------------------

                add('_unSelectTab', group);
                add('_testDynamicAttributesForGroupWhenNoTabSelected', group);

                // -------------------------------------------------------------

                add('_focusFirstTab', group);
                add(selectTab, tabs[0]);
                add('_testDynamicAttributesForGroupWhenFirstTabSelected', group);

                // -------------------------------------------------------------

                add('_navigateForward');
                add(selectTab, tabs[1]);
                add('_testDynamicAttributesForGroupWhenSecondTabSelected', group);

                // -------------------------------------------------------------

                add('_navigateBackward');
                add(selectTab, tabs[0]);
                add('_testDynamicAttributesForGroupWhenFirstTabSelected', group);
            }, callback);

            // -----------------------------------------------------------------

            function selectTab(next, tab) {
                this._localAsyncSequence(function (add) {
                    add('_pressEnter');
                    add('_waitForTabFocus', tab);
                }, next);
            }
        },

        _testDynamicAttributesForGroupWhenNoTabSelected : function (callback, group) {
            // --------------------------------------------------- destructuring

            var tabs = group.tabs;
            var tabPanel = group.tabPanel;

            var tabPanelId = tabPanel.id;

            // ------------------------------------------------------ processing

            // -----------------------------------------------------------------

            this._checkWidgetAttribute(tabPanelId, 'aria-labelledby', null);

            // -----------------------------------------------------------------

            ariaUtilsArray.forEach(tabs, function (tab) {
                var tabId = tab.tabId;

                var expected;
                if (tab.waiAria && tabPanel.waiAria) {
                    expected = this._getWidgetId(tabPanelId);
                } else {
                    expected = null;
                }

                this._checkWidgetAttribute(tabId, 'aria-controls', expected);
            }, this);

            // ---------------------------------------------------------- return

            callback();
        },

        _testDynamicAttributesForGroupWhenFirstTabSelected : function (callback, group) {
            this._checkAriaLabelledBy(group, 0);
            callback();
        },

        _testDynamicAttributesForGroupWhenSecondTabSelected : function (callback, group) {
            this._checkAriaLabelledBy(group, 1);
            callback();
        },

        _checkAriaLabelledBy : function (group, tabIndex) {
            // --------------------------------------------------- destructuring

            var tabs = group.tabs;
            var tabPanel = group.tabPanel;

            var tabPanelId = tabPanel.id;

            // ------------------------------------------------------ processing

            var tab = tabs[tabIndex];

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

        _focusElementBeforeGroup : function (callback, group) {
            // --------------------------------------------------- destructuring

            var id = group.id;

            // ------------------------------------------------------ processing

            this._focusElement(callback, 'before_' + id);
        },

        _focusFirstTab : function (callback, group) {
            // --------------------------------------------------- destructuring

            var tabsUnder = group.tabsUnder;

            // ------------------------------------------------------ processing

            this._localAsyncSequence(function (add) {
                add('_focusElementBeforeGroup', group);
                add('_navigateForward'); // from anchor to following element
                if (tabsUnder) {
                    add('_navigateForward'); // from panel to element inside
                    add('_navigateForward'); // from element to first tab
                }
                add('_waitForTabFocus', group.tabs[0]);
            }, callback);
        },

        _unSelectTab : function (callback, group) {
            this._setBindingValue(group.binding, null);
            callback();
        },

        _waitForTabFocus : function (callback, tab) {
            this._waitForWidgetFocus(callback, tab.tabId);
        }
    }
});
