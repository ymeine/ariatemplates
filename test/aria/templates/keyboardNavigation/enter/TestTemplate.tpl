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

{Template {
  $classpath: "test.aria.templates.keyboardNavigation.enter.TestTemplate",
  $hasScript: true
}}

    {macro main ()}
        <a href="#" {id "startingPoint" /}>Element before</a>

        {section {
            id : "mySectionOne",
            macro : {
              name : "sectionMacro",
              args : ["1"]
            },
            type : "DIV",
            "keyMap" : [{
                key: "enter",
                event : "keyup",
                callback: {
                    fn: "updateLogs",
                    scope: this,
                    args: {
                      log : "section"
                    }
                }
            }]
        } /}

        {section {
            id : "mySectionTwo",
            macro : {
              name : "sectionMacro",
              args : ["2"]
            },
            type : "DIV",
            "keyMap" : [{
                key: "enter",
                event : "keyup",
                callback: {
                    fn: "updateLogs",
                    scope: this,
                    args: {
                      log : "section",
                      stopEvent : true
                    }
                }
            }]
        } /}

        {section {
            id : "mySectionThree",
            macro : {
              name : "sectionMacro",
              args : ["3", true, true]
            },
            type : "DIV",
            "keyMap" : [{
                key: "enter",
                event : "keyup",
                callback: {
                    fn: "updateLogs",
                    scope: this,
                    args: {
                      log : "section",
                      stopEvent : true
                    }
                }
            }]
        } /}
        {section {
            id : "mySectionFour",
            macro : {
              name : "sectionMacro",
              args : ["4"]
            },
            type : "DIV",
            "keyMap" : [{
                key: "enter",
                callback: {
                    fn: "updateLogs",
                    scope: this,
                    args: {
                      log : "section"
                    }
                }
            }]
        } /}

      {section {
          id : "logs",
          macro : "displayLogs",
          type : "DIV",
          bindRefreshTo: [{
              to : "logs",
              inside : data
          }]
      } /}

    {/macro}



    {macro sectionMacro (wId, stopEvent, keyUp)}
        {var doStopEvent = stopEvent != null ? stopEvent : false /}
        {var onKeyUp = keyUp != null ? keyUp : false /}

        {@aria:Button {
           id : "myButton" + wId,
           label: "Button",
           onclick: {
             fn: "updateLogs",
                 scope: this,
                 args: {
                 log : "button",
                 stopEvent : doStopEvent
             }
           }
        } /}

        {@aria:Link {
           id : "myLink" + wId,
           label: "Link",
           onclick: {
             fn: "updateLogs",
                 scope: this,
                 args: {
                    log : "link",
                    stopEvent : doStopEvent
                 }
           }
        } /}

        <a href="#" {id "anchor1" + wId/}{on click {fn : "updateLogs", scope : this, args: {log : "anchorOne", preventDefault : true, stopEvent : doStopEvent}} /}>first anchor</a>

        {var anchorTwoOnKeyConfiguration = {fn : "updateLogsOnEnter", scope : this, args: {log : "anchorTwoOnEnter", stopEvent : doStopEvent}} /}
        <a href="#"
            {id "anchor2" + wId/}
            {if onKeyUp}
              {on keyup anchorTwoOnKeyConfiguration /}
            {else/}
              {on keydown anchorTwoOnKeyConfiguration /}
            {/if}
            {on click {fn : "updateLogs", scope : this, args: {log : "anchorTwo", preventDefault : true, stopEvent : doStopEvent}} /}
        >second anchor</a>

    {/macro}

    {macro displayLogs ()}
        {foreach entry inArray data.logs}
            {separator}<br />{/separator}
            ${entry}
        {/foreach}
    {/macro}

{/Template}
