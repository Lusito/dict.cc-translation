/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import * as browser from 'webextension-polyfill';
import { VisualizerConfig } from "../lib/translator";
import { isFirefox, browserInfo } from "../lib/browserInfo";

let lastTab: number | null = null;

// Opens a tab (or updates it) using www.dict.cc
export function tabVisualizer(config: VisualizerConfig) {
    let tabConfig: browser.tabs.CreateProperties = {};
    if (config.tab && isFirefox && parseFloat(browserInfo.version) >= 57)
        tabConfig.openerTabId = config.tab.id;
    if (config.url)
        tabConfig.url = config.url;
    else
        tabConfig.url = config.protocol + 'www.dict.cc/' + config.params;
    if (config.multiWindow || !lastTab) {
        lastTab = null;
        browser.tabs.create(tabConfig).then((tab) => {
            lastTab = tab.id || null;
        });
    } else {
        browser.tabs.update(lastTab, tabConfig);
    }
}

browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === lastTab)
        lastTab = null;
});
