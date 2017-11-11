/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file is used to run translations as the user configured it

import { settings } from "./settings";
import * as request from "./request";
import { synPopupVisualizer } from "../visualizers/synPopupVisualizer";
import { pocketPopupVisualizer } from "../visualizers/pocketPopupVisualizer";
import { tabVisualizer } from "../visualizers/tabVisualizer";
import { inpageVisualizer } from "../visualizers/inpageVisualizer";

export let visualizers = [
    synPopupVisualizer,
    pocketPopupVisualizer,
    tabVisualizer,
    inpageVisualizer
];

export interface RunConfig {
    languagePair?: string;
    text: string;
    x: number;
    y: number;
    url?: string;
}
export interface VisualizerConfig {
    languagePair?: string;
    text?: string;
    url?: string;
    x?: number;
    y?: number;
    params?: string;
    protocol?: string;
    multiWindow?: boolean;
    tab?: browser.tabs.Tab;
    incognito?: boolean;
}
export interface DCCResultLink {
    href: string;
    label: string;
    style: string;
}
export interface DCCResult {
    links?: DCCResultLink[];
    error?: string;
};
export function getProtocol() {
    return settings.get('translation.useHttps') ? 'https://' : 'http://';
}
export function getOpenMethod(isQuick: boolean) {
    return settings.get(isQuick ? 'quick.method' : 'context.method');
}
export function getMultiWindow(isQuick: boolean) {
    return settings.get(isQuick ? 'quick.multiWindow' : 'context.multiWindow');
}
export function createParams(text: string, languagePair: string) {
    let params = '?lp=' + languagePair;
    if (text)
        params += '&s=' + encodeURIComponent(text);
    return params;
}
export function getFirstLanguagePair() {
    let translations = settings.get('translation.list');
    if (!translations.length)
        return null;

    return translations[0].k;
}
export function runDCC(text: string, languagePair: string, callback: (result: DCCResult) => void) {
    if (!languagePair)
        languagePair = getFirstLanguagePair();
    if (!languagePair)
        return;
    let params = createParams(text, languagePair);
    let url = getProtocol() + 'www.dict.cc/dcc-gadget.php' + params;

    request.getHTML(url, function (doc: Document | null) {
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
    }, function () {
        callback({
            error: browser.i18n.getMessage("resultFailed")
        });
    });
}
export function run(config: RunConfig, isQuick: boolean, tab: browser.tabs.Tab) {
    let lp = config.languagePair || getFirstLanguagePair();
    if (!lp)
        return;
    let finalConfig = {
        languagePair: lp,
        text: config.text,
        x: config.x || 0,
        y: config.y || 0,
        url: config.url,
        params: createParams(config.text, lp),
        protocol: getProtocol(),
        multiWindow: getMultiWindow(isQuick),
        tab: tab,
        incognito: tab.incognito
    };
    let method = getOpenMethod(isQuick);
    visualizers[method](finalConfig);
}
