/*
 * Copyright 2012 Amadeus s.a.s.
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
    $classpath: 'test.aria.templates.statements.ExpressionEscapeTestTpl'
}}

{macro main()}



/*******************************************************************************
 * Automatic escaping
 ******************************************************************************/

<div {id "automatic"/}>
    ${"<div class='output' style=\"color:blue\">&amp;</div>"}
</div>



/*******************************************************************************
 * Explicit final escaping
 ******************************************************************************/

// ------------------------------------------------------------------ Escape all

<div {id "all-implicit"/}>
    ${"<div class='output' style=\"color:blue\">&amp;</div>"|escapeForHTML}
</div>

<div {id "all-boolean"/}>
    ${"<div class='output' style=\"color:blue\">&amp;</div>"|escapeforHTML:true}
</div>

<div {id "all-object"/}>
    ${"<div class='output' style=\"color:blue\">&amp;</div>"|escapeForhtml:{text: true, attr: true}}
</div>

// -------------------------------------------------------------- Escape nothing

<div {id "nothing-boolean"/}>
    ${"<div class='output' style=\"color:blue\">&amp;</div>"|escapeForHtml:false}
</div>

<div {id "nothing-object"/}>
    ${"<div class='output' style=\"color:blue\">&amp;</div>"|escapeforHtml:{text: false, attr: false}}
</div>

// ------------------------------------------------ Escape for specific contexts

<div {id "attr"/}>
    ${"<div class='output' style=\"color:blue\">&amp;</div>"|escapeforhtml:{attr: true}}
</div>

<div {id "text"/}>
    ${"<div class='output' style=\"color:blue\">&amp;</div>"|ESCAPEFORHTML:{text: true}}
</div>


<div {id "attr-special"/}>
    <div data-quot="${'"quot"'|escapeForHTML:{attr:true}}" data-apos='${"'apos'"|escapeForHTML:{attr:true}}'></div>
</div>



/*******************************************************************************
 * Other modifiers behavior
 ******************************************************************************/

// --------------------------------------------------------------------- default

<div {id "automatic-modifier_default"/}>
    ${undefined|default:'<div></div>'}
</div>

<div {id "nothing-modifier_default-before"/}>
    ${undefined|escapeForHTML:false|default:'<div></div>'}
</div>

<div {id "nothing-modifier_default-after"/}>
    ${undefined|default:'<div></div>'|escapeForHTML:false}
</div>

<div {id "all-modifier_default-before"/}>
    ${undefined|escapeForHTML:true|default:'<div></div>'}
</div>

<div {id "all-modifier_default-after"/}>
    ${undefined|default:'<div></div>'|escapeForHTML:true}
</div>

// ----------------------------------------------------------------------- empty

<div {id "automatic-modifier_empty"/}>
    ${''|empty:'<div></div>'}
</div>

<div {id "nothing-modifier_empty-before"/}>
    ${''|escapeForHTML:false|empty:'<div></div>'}
</div>

<div {id "nothing-modifier_empty-after"/}>
    ${''|empty:'<div></div>'|escapeForHTML:false}
</div>

<div {id "all-modifier_empty-before"/}>
    ${''|escapeForHTML:true|empty:'<div></div>'}
</div>

<div {id "all-modifier_empty-after"/}>
    ${''|empty:'<div></div>'|escapeForHTML:true}
</div>

// ------------------------------------------------------------------- highlight

<div {id "automatic-modifier_highlight"/}>
    ${'start-middle-end'|highlight:'middle'}
</div>

<div {id "nothing-modifier_highlight-before"/}>
    ${'start-middle-end'|escapeForHTML:false|highlight:'middle'}
</div>

<div {id "nothing-modifier_highlight-after"/}>
    ${'start-middle-end'|highlight:'middle'|escapeForHTML:false}
</div>

<div {id "all-modifier_highlight-before"/}>
    ${'start-middle-end'|escapeForHTML:true|highlight:'middle'}
</div>

<div {id "all-modifier_highlight-after"/}>
    ${'start-middle-end'|highlight:'middle'|escapeForHTML:true}
</div>

// ------------------------------------------------------------------ dateformat

<div {id "automatic-modifier_dateformat"/}>
    ${this.DATE|dateformat:this.DATE_FORMAT}
</div>

<div {id "nothing-modifier_dateformat-before"/}>
    ${this.DATE|escapeForHTML:false|dateformat:this.DATE_FORMAT}
</div>

<div {id "nothing-modifier_dateformat-after"/}>
    ${this.DATE|dateformat:this.DATE_FORMAT|escapeForHTML:false}
</div>

// This one should fail
// <div {id "all-modifier_dateformat-before"/}>
//     ${this.DATE|escapeForHTML:true|dateformat:this.DATE_FORMAT}
// </div>
// ----

<div {id "all-modifier_dateformat-after"/}>
    ${this.DATE|dateformat:this.DATE_FORMAT|escapeForHTML:true}
</div>


{/macro}

{/Template}
