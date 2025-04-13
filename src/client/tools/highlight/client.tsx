'use client'

import {attr, css, FASTElement, html, ref} from "@microsoft/fast-element";
import {
    ButtonDefinition,
    TextInputDefinition,
    TextAreaDefinition,
    FluentDesignSystem
} from '@fluentui/web-components';

import {setTheme} from '@fluentui/web-components';
import {webLightTheme} from '@fluentui/tokens';
import {highlightCode} from "./highlight";
import './selector'
import './editor'
import {SelectorElement} from "./selector";
import {EditorElement} from "./editor";
import domToImage from 'dom-to-image-more';
import {globalStylesUrl, prismjsThemeUrl} from "./style";
import * as React from "react";
import {HTMLAttributes} from "react";

setTheme(webLightTheme);

ButtonDefinition.define(FluentDesignSystem.registry);
TextInputDefinition.define(FluentDesignSystem.registry);
TextAreaDefinition.define(FluentDesignSystem.registry);

class AppElement extends FASTElement {
    @attr
    name: string | undefined;

    @attr
    darkTheme: boolean = false;

    codeBlock: EditorElement | undefined;
    previewBlock: HTMLDivElement | undefined;
    selectorElement: SelectorElement | undefined;

    formatCode() {
        console.log('formatCode');
        if (!this.codeBlock) {
            return
        }
        const codeText = this.codeBlock.content || '';
        const lang = this.selectorElement?.selectedValue || 'javascript';
        if (!this.previewBlock || !codeText) {
            return;
        }
        const theme = this.selectorElement?.selectedTheme;
        this.darkTheme = theme?.style === 'dark';

        const html = highlightCode(codeText, lang);
        this.previewBlock.innerHTML = `
    <link rel="stylesheet" href="${prismjsThemeUrl(theme ? theme.value : 'prism')}">
<pre><code class="language-${lang}">${html}</code></pre>
`;
    }

    isDarkTheme() {
        return this.selectorElement?.selectedTheme?.style === 'dark';
    }

    exportImage() {
        const node = this.previewBlock;

        if (!node || !node.innerHTML) {
            return
        }
        domToImage
            .toPng(node)
            .then(function (dataUrl: string) {
                // var img = new Image();
                // img.src = dataUrl;
                // document.body.appendChild(img);
                const link = document.createElement('a');
                link.download = 'my-image-name.jpeg';
                link.href = dataUrl;
                link.click();
            })
            .catch(function (error: Error) {
                console.error('oops, something went wrong!', error);
            });
    }

}

const template = html<AppElement>`
    <link rel="stylesheet" href="${globalStylesUrl}">
    <div class="codeBlockContainer">
        <calieo-editor ${ref('codeBlock')}></calieo-editor>
    </div>
    <div class="selectorContainer">
        <calieo-selector ${ref('selectorElement')}></calieo-selector>
    </div>
    <div class="actionContainer">
        <fluent-button appearance="accent" @click="${(x) => x.formatCode()}">格式化</fluent-button>
        <fluent-button appearance="accent" @click="${(x) => x.exportImage()}">导出图像</fluent-button>
    </div>
    <div class="previewContainer">
        <div ${ref('previewBlock')} class="previewBlock ${x => x.darkTheme ? 'dark' : ''}"></div>
    </div>
`

const styles = css`
    .codeBlockContainer {
        font-family: monospace;
        font-size: 0.9rem;
        padding: 1rem;
        background-color: #f8f8f8;
        height: 200px;

        fluent-textarea {
            width: 100%;
            height: 100%;
        }
    }

    .selectorContainer {
        padding: 0 1rem;
        width: 100%;
        margin-bottom: 1rem;
    }

    .actionContainer {
        padding: 0 1rem;
        width: 100%;
        margin-bottom: 1rem;
    }

    .previewContainer {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .previewBlock {
        padding: 1rem;
        background-color: #ffffff;
        width: calc(100% - 4rem);
        min-height: 16rem;
        max-height: 32rem;
        overflow: auto;
        scrollbar-width: thin;

        &.dark {
            background-color: #333;
        }

        pre {
            padding: 0;
            margin: 0;
            display: block;
            width: 100%;

            code {
                display: block;
                width: 100%;
            }
        }
    }
`

export interface LightningHighlightAttributes extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    children?: React.ReactNode;
    title?: string
}


AppElement.define({
    name: "lightning-highlight",
    template,
    styles
});


