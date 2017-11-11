/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file contains helpers to manage the popup windows (one for normal, one for incognito)

import * as browser from 'webextension-polyfill';
export let cache: { [s: string]: number } = {};

export function open(url: string, incognito: boolean, width: number, height: number) {
    let config: browser.windows.CreateData = {
        width: width,
        height: height
    };
    let cacheKey = incognito ? '1' : '0';
    let popupId = cache[cacheKey];
    if (!popupId) {
        config.url = url;
        config.incognito = incognito;
        //firefox popup scrollbar is broken, so using type=popup is not possible
        if (navigator.userAgent.toLowerCase().indexOf("firefox") < 0) {
            config.type = "popup";
        }
        browser.windows.create(config).then(function (window) {
            cache[cacheKey] = window.id;
        });
    } else {
        config.focused = true;
        browser.windows.update(popupId, config);
        browser.tabs.query({ windowId: popupId }).then(function (tabs) {
            if (tabs.length > 0) {
                let id = tabs[0].id;
                if (id)
                    browser.tabs.update(id, { url: url, active: true });
            }
        });
    }
}

browser.windows.onRemoved.addListener(function (windowId) {
    for (let key in cache) {
        if (cache[key] === windowId) {
            delete cache[key];
            break;
        }
    }
});
