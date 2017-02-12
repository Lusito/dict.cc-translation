/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Lusito)
 
 * This file is part of the dict.cc web-extension.
 
 * The dict.cc web-extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 
 * The dict.cc web-extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 
 * You should have received a copy of the GNU General Public License
 * along with the dict.cc web-extension.  If not, see http://www.gnu.org/licenses/.
 
 * ***** END LICENSE BLOCK ***** */

/* global browser */

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
            config.type = "popup";
            browser.windows.create(config, function (window) {
                popup.cache[incognito] = window.id;
            });
        } else {
            config.focused = true;
            browser.windows.update(popupId, config);
            browser.tabs.query({windowId: popupId}, function (tabs) {
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
