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

{Template {
    $classpath : "test.aria.widgets.wai.popup.dialog.modal.ModalDialogTestTpl",
    $hasScript : true
}}

    {macro main()}
        {foreach dialog inArray this.data.dialogs}
            <div>{call displayDialog(dialog) /}</div>
        {/foreach}
    {/macro}

    {macro displayDialog(dialog)}
        <a href='#' {id dialog.elementBeforeId /}>Element before</a>

        {@aria:Button {
            id: dialog.buttonId,

            label: dialog.buttonLabel,
            onclick: {
                scope: dialog,
                fn: dialog.open
            }
        }/}

        {@aria:Dialog {
            id : dialog.id,
            waiAria: dialog.wai,

            closable: true,
            resizable: true,
            modal : true,
            width : 400,
            maxHeight : 500,

            title : dialog.title,

            macro : 'dialogContent',

            bind : {
                'visible' : dialog.visibleBinding
            }
        }/}
    {/macro}

    {macro dialogContent()}
    {/macro}

{/Template}
