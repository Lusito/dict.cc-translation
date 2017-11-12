/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file is used to run translations as the user configured it

import * as browser from 'webextension-polyfill';
import { settings } from "../lib/settings";
import * as request from "../lib/request";
import { synPopupVisualizer } from "./visualizers/synPopupVisualizer";
import { pocketPopupVisualizer } from "./visualizers/pocketPopupVisualizer";
import { tabVisualizer } from "./visualizers/tabVisualizer";
import { inpageVisualizer } from "./visualizers/inpageVisualizer";
import { DCCResultLink, RunConfig, DCCResult } from './translatorShared';

export let visualizers = [
    synPopupVisualizer,
    pocketPopupVisualizer,
    tabVisualizer,
    inpageVisualizer
];

export function runDCC(text: string, languagePair: string | null, callback: (result: DCCResult) => void) {
    if (!languagePair)
        languagePair = settings.getFirstLanguagePair();
    if (!languagePair)
        return;
    let params = settings.createParams(text, languagePair);
    let url = settings.getProtocol() + 'www.dict.cc/dcc-gadget.php' + params;

    request.getHTML(url, (doc: Document | null) => {
        if (!doc) {
            callback({
                error: browser.i18n.getMessage("resultFailed")
            });
            return;
        }
        let elements = doc.getElementsByTagName("a");
        let links: DCCResultLink[] = [];
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            let style = element.getAttribute('style');
            if (element.querySelector('u') !== null)
                style = 'text-decoration:underline;' + style;
            links.push({
                href: element.href + '&lp=' + languagePair,
                label: element.textContent || '?',
                style: style || ''
            });
        }
        if (links && links.length > 0) {
            callback({
                links: links
            });
        } else {
            callback({
                error: browser.i18n.getMessage("resultFailed")
            });
        }
    }, () => {
        callback({
            error: browser.i18n.getMessage("resultFailed")
        });
    });
}

export function run(config: RunConfig, isQuick: boolean, tab: browser.tabs.Tab) {
    let lp = config.languagePair || settings.getFirstLanguagePair();
    if (!lp)
        return;
    let finalConfig = {
        languagePair: lp,
        text: config.text,
        x: config.x || 0,
        y: config.y || 0,
        url: config.url,
        params: settings.createParams(config.text, lp),
        protocol: settings.getProtocol(),
        multiWindow: settings.getMultiWindow(isQuick),
        tab: tab,
        incognito: tab.incognito
    };
    let method = settings.getOpenMethod(isQuick);
    visualizers[method](finalConfig);
}
