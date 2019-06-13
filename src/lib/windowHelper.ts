/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file contains helpers to manage the popup windows (one for normal, one for incognito)

import { browser, Windows } from "webextension-polyfill-ts";
export let cache: { [s: string]: number } = {};

export function openPopup(url: string, incognito: boolean, width: number, height: number) {
    const config: Windows.CreateCreateDataType = {
        width,
        height
    };
    const cacheKey = incognito ? "1" : "0";
    const popupId = cache[cacheKey];
    if (!popupId) {
        config.url = url;
        config.incognito = incognito;
        // firefox popup scrollbar is broken, so using type=popup is not possible
        if (navigator.userAgent.toLowerCase().indexOf("firefox") < 0) {
            config.type = "popup";
        }
        browser.windows.create(config).then((window) => cache[cacheKey] = window.id || 0);
    } else {
        // config.focused = true; //fixme: unsupported?
        browser.windows.update(popupId, config);
        browser.tabs.query({ windowId: popupId }).then((tabs) => {
            if (tabs.length > 0) {
                const id = tabs[0].id;
                if (id)
                    browser.tabs.update(id, { url, active: true });
            }
        });
    }
}

browser.windows.onRemoved.addListener((windowId) => {
    for (const key in cache) {
        if (cache[key] === windowId) {
            delete cache[key];
            break;
        }
    }
});
