/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Lusito)
 
 * This file is part of the dict.cc web-extension.
 
 * This web-extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 
 * This web-extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 
 * You should have received a copy of the GNU General Public License
 * along with this web-extension.  If not, see http://www.gnu.org/licenses/.
 
 * ***** END LICENSE BLOCK ***** */

// This file contains helpers to manage the popup windows (one for normal, one for incognito)

/* global browser, runAsPromise */

var popup = {
    cache: {},
    open: function (url, incognito, width, height) {
        var config = {
            width: width,
            height: height
        };
        var popupId = popup.cache[incognito];
        if (!popupId) {
            config.url = url;
            config.incognito = incognito;
            //firefox popup scrollbar is broken, so using type=popup is not possible
            if (navigator.userAgent.toLowerCase().indexOf("firefox") < 0) {
                config.type = "popup";
            }
            runAsPromise(browser.windows, 'create', [config]).then(function (window) {
                popup.cache[incognito] = window.id;
            });
        } else {
            config.focused = true;
            browser.windows.update(popupId, config);
            runAsPromise(browser.tabs, 'query', [{windowId: popupId}]).then(function (tabs) {
                browser.tabs.update(tabs[0].id, {url: url, active: true});
            });
        }
    }
};

browser.windows.onRemoved.addListener(function (windowId) {
    for (var key in popup.cache) {
        if (popup.cache[key] === windowId) {
            delete popup.cache[key];
            break;
        }
    }
});
