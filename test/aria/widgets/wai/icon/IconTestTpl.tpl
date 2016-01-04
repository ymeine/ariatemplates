/*
 * Copyright 2015 Amadeus s.a.s.
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
    $classpath : 'test.aria.widgets.wai.icon.IconTestTpl',
    $hasScript: true
}}
    {macro main()}
        <div style='margin:10px;font-size:+3;font-weight:bold;'>Icon accessibility sample</div>

        <div style='margin:10px;'>
            <p>
                With accessibility enabled: <br/>
                {call widget('waiEnabled', true) /}
            </p>

            <p>
                With accessibility disabled: <br/>
                {call widget('waiDisabled', false) /}
            </p>

            <p>
                {section {
                    id: 'sectionCalledCounter',
                    macro: 'displayCalledCounter',
                    bindRefreshTo: [{inside: this.data, to: 'calledCounter'}]
                }/}
            </p>
        </div>
    {/macro}

    {macro widget(id, waiAria)}
        {var tooltipId = id + 'testTooltip' /}

        <a href='#' {id 'before_' + id /}>Element before</a>

        {@aria:Icon {
            id: id,
            waiAria: waiAria,

            icon: 'std:info',
            onclick: 'incrementCalledCounter',

            label: this.data.label,
            tooltipId: tooltipId
        }/}

        {@aria:Tooltip {
            id: tooltipId,
            macro: 'tooltipContent'
        }/}
    {/macro}

    {macro tooltipContent()}
        Tooltip content
    {/macro}

    {macro displayCalledCounter()}
        {var counter = this.data.calledCounter /}
        Action called: ${counter} time(s)
    {/macro}
{/Template}
