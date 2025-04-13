import {attr, css, ExecutionContext, FASTElement, html, ref} from "@microsoft/fast-element";

let defaultContent = ''


export class EditorElement extends FASTElement {
    @attr
    content: string | undefined = defaultContent;

    valueChanged(context: ExecutionContext) {
        this.content = (context.event.target as HTMLTextAreaElement).value;
    }
}

const template = html<EditorElement>`
    <div class="editorContainer">
    <textarea placeholder="输入代码"
              @change="${(x, v: ExecutionContext) => x.valueChanged(v)}">${defaultContent}</textarea>
    </div>
`

const styles = css`
    .editorContainer {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
    }

    textarea {
        font-family: monospace;
        font-size: 0.9rem;
        background-color: #ffffff;
        border: 0;
        flex-grow: 1;
        width: calc(100% - 2rem);
        padding: 1rem;
        overflow: auto;
        scrollbar-width: thin;
    }
`


EditorElement.define({
    name: "calieo-editor",
    template,
    styles
});


