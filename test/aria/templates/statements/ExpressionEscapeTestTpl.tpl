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
    ${data.inputs["automatic"]}
</div>



/*******************************************************************************
 * Explicit final escaping
 ******************************************************************************/

// ------------------------------------------------------------------ Escape all

<div {id "all-implicit"/}>
    ${data.inputs["all-implicit"]|escapeForHTML}
</div>

<div {id "all-boolean"/}>
    ${data.inputs["all-boolean"]|escapeforHTML:true}
</div>

<div {id "all-object"/}>
    ${data.inputs["all-object"]|escapeForhtml:{text: true, attr: true}}
</div>

// -------------------------------------------------------------- Escape nothing

<div {id "nothing-boolean"/}>
    ${data.inputs["nothing-boolean"]|escapeForHtml:false}
</div>

<div {id "nothing-object"/}>
    ${data.inputs["nothing-object"]|escapeforHtml:{text: false, attr: false}}
</div>

// ------------------------------------------------ Escape for specific contexts

<div {id "attr"/}>
    ${data.inputs["attr"]|escapeforhtml:{attr: true}}
</div>

<div {id "text"/}>
    ${data.inputs["text"]|ESCAPEFORHTML:{text: true}}
</div>


<div {id "attr-special"/}>
    <div data-quot="${'"quot"'|escapeForHTML:{attr:true}}" data-apos='${"'apos'"|escapeForHTML:{attr:true}}'></div>
</div>



/*******************************************************************************
 * Other modifiers behavior
 ******************************************************************************/

// --------------------------------------------------------------------- default

{var id = "automatic-modifier_default" /}
<div {id id /}>
    {var useCase = data.useCases[id] /}
    ${useCase.input|default:'<div></div>'}
</div>

{var id = "nothing-modifier_default-before" /}
<div {id id /}>
    {var useCase = data.useCases[id] /}
    ${useCase.input|escapeForHTML:false|default:'<div></div>'}
</div>

{var id = "nothing-modifier_default-after" /}
<div {id id /}>
    {var useCase = data.useCases[id] /}
    ${useCase.input|default:'<div></div>'|escapeForHTML:false}
</div>

{var id = "all-modifier_default-before" /}
<div {id id /}>
    {var useCase = data.useCases[id] /}
    ${useCase.input|escapeForHTML:true|default:'<div></div>'}
</div>

{var id = "all-modifier_default-after" /}
<div {id id /}>
    {var useCase = data.useCases[id] /}
    ${useCase.input|default:'<div></div>'|escapeForHTML:true}
</div>

// ----------------------------------------------------------------------- empty

<div {id "automatic-modifier_empty"/}>
    ${data.inputs["automatic-modifier_empty"]|empty:'<div></div>'}
</div>

<div {id "nothing-modifier_empty-before"/}>
    ${data.inputs["nothing-modifier_empty-before"]|escapeForHTML:false|empty:'<div></div>'}
</div>

<div {id "nothing-modifier_empty-after"/}>
    ${data.inputs["nothing-modifier_empty-after"]|empty:'<div></div>'|escapeForHTML:false}
</div>

<div {id "all-modifier_empty-before"/}>
    ${data.inputs["all-modifier_empty-before"]|escapeForHTML:true|empty:'<div></div>'}
</div>

<div {id "all-modifier_empty-after"/}>
    ${data.inputs["all-modifier_empty-after"]|empty:'<div></div>'|escapeForHTML:true}
</div>

// ------------------------------------------------------------------- highlight

<div {id "automatic-modifier_highlight"/}>
    ${data.inputs["automatic-modifier_highlight"]|highlight:'middle'}
</div>

<div {id "nothing-modifier_highlight-before"/}>
    ${data.inputs["nothing-modifier_highlight-before"]|escapeForHTML:false|highlight:'middle'}
</div>

<div {id "nothing-modifier_highlight-after"/}>
    ${data.inputs["nothing-modifier_highlight-after"]|highlight:'middle'|escapeForHTML:false}
</div>

<div {id "all-modifier_highlight-before"/}>
    ${data.inputs["all-modifier_highlight-before"]|escapeForHTML:true|highlight:'middle'}
</div>

<div {id "all-modifier_highlight-after"/}>
    ${data.inputs["all-modifier_highlight-after"]|highlight:'middle'|escapeForHTML:true}
</div>

// ------------------------------------------------------------------ dateformat

<div {id "automatic-modifier_dateformat"/}>
    ${data.inputs["automatic-modifier_dateformat"]|dateformat:data.dateformat}
</div>

<div {id "nothing-modifier_dateformat-before"/}>
    ${data.inputs["nothing-modifier_dateformat-before"]|escapeForHTML:false|dateformat:data.dateformat}
</div>

<div {id "nothing-modifier_dateformat-after"/}>
    ${data.inputs["nothing-modifier_dateformat-after"]|dateformat:data.dateformat|escapeForHTML:false}
</div>

// This one should fail
// <div {id "all-modifier_dateformat-before"/}>
//     ${data.inputs["all-modifier_dateformat-before"]|escapeForHTML:true|dateformat:data.dateformat}
// </div>
// ----

<div {id "all-modifier_dateformat-after"/}>
    ${data.inputs["all-modifier_dateformat-after"]|dateformat:data.dateformat|escapeForHTML:true}
</div>


{/macro}

{/Template}
