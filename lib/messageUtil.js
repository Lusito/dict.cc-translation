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

var messageUtil = {
    callbacks: null,
    _addListener: function () {
        messageUtil.callbacks = {};
        browser.runtime.onMessage.addListener(
                function (request, sender, sendResponse) {
                    var callback = messageUtil.callbacks[request.action];
                    if (callback) {
                        return callback(request.params, sender, sendResponse);
                    }
                });
    },
    send: function (name, params, callback) {
        var data = {
            action: name,
            params: params
        };
        browser.runtime.sendMessage(data, function () {
            if (callback)
                callback.apply(callback, arguments);
        });
    },
    sendSelf: function (name, params) {
        if (messageUtil.callbacks) {
            var callback = messageUtil.callbacks[name];
            if (callback) {
                return callback(params);
            }
        }
    },
    sendToAllTabs: function (name, params) {
        if (browser.tabs) {
            var data = {
                action: name,
                params: params
            };
            browser.tabs.query({}, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    browser.tabs.sendMessage(tabs[i].id, data);
                }
            });
        }
    },
    sendToTab: function (tab, name, params) {
        var data = {
            action: name,
            params: params
        };
        browser.tabs.sendMessage(tab.id, data);
    },
    receive: function (name, callback) {
        if (!messageUtil.callbacks)
            messageUtil._addListener();
        messageUtil.callbacks[name] = callback;
    }
};

