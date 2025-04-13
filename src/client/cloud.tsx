import $ from 'jquery';
import {turnstileScript} from "@/atom/client/components/cloudflare/turnstile";
import {useBrowserConfig} from "@/client/config/browser";

import './cloud.scss'

function pwaSetup() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: '/'});
    }
}

function cfTurnstileSetup() {
    const overlayEl = $('<div/>', {id: 'cfTurnstileOverlay'});
    const overlayBodyEl = $('<div/>', {class: 'overlayBody'}).appendTo(overlayEl);
    $('<div/>', {class: 'turnstileTip'}).text('请点击验证').appendTo(overlayBodyEl);
    $('<div/>', {id: 'turnstile-body', class: 'turnstileBody'}).appendTo(overlayBodyEl);
    overlayEl.appendTo('body');
    const browserConfig = useBrowserConfig()
    turnstileScript(browserConfig.PUBLIC_TURNSTILE);
}

function setupAll() {
    // 暂时不启用PWA功能
    //pwaSetup();
    if (window.turnstile) {
        cfTurnstileSetup();
    }
}

$(document).ready(() => {
    setupAll();
});
