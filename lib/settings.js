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

// This file manages all settings, their defaults and changes

/* global METHOD_INPAGE, METHOD_POCKET_WINDOW, METHOD_TAB, browser, messageUtil */

var settings = {
    storage: browser.storage.sync || browser.storage.local,
    map: {},
    readyCallbacks: [],
    defaults: {
        "translation.list": [{"k": "ende", "v": "DE<>EN"}, {"k": "en-de", "v": "EN->DE"}, {"k": "de-en", "v": "DE->EN"}, {"k": "enpl", "v": "EN<>PL"}, {"k": "ennl", "v": "EN<>NL"}, {"k": "deit", "v": "DE<>IT"}, {"k": "dept", "v": "DE<>PT"}],
        "translation.languages": [{"k": "SQ", "v": "Albanian"}, {"k": "BS", "v": "Bosnian"}, {"k": "BG", "v": "Bulgarian"}, {"k": "HR", "v": "Croatian"}, {"k": "CS", "v": "Czech"}, {"k": "DA", "v": "Danish"}, {"k": "NL", "v": "Dutch"}, {"k": "EO", "v": "Esperanto"}, {"k": "FI", "v": "Finnish"}, {"k": "FR", "v": "French"}, {"k": "EL", "v": "Greek"}, {"k": "HU", "v": "Hungarian"}, {"k": "IS", "v": "Icelandic"}, {"k": "IT", "v": "Italian"}, {"k": "NO", "v": "Norwegian"}, {"k": "PL", "v": "Polish"}, {"k": "PT", "v": "Portuguese"}, {"k": "RO", "v": "Romanian"}, {"k": "RU", "v": "Russian"}, {"k": "SR", "v": "Serbian"}, {"k": "SK", "v": "Slovak"}, {"k": "ES", "v": "Spanish"}, {"k": "SV", "v": "Swedish"}, {"k": "TR", "v": "Turkish"}, {"k": "LA", "v": "Latin"}],
        "translation.useHttps": true,
        "context.enabled": true,
        "context.method": METHOD_TAB,
        "context.multiWindow": false,
        "quick.enabled": true,
        "quick.right": true,
        "quick.ctrl": true,
        "quick.shift": false,
        "quick.alt": true,
        "quick.selected": true,
        "quick.method": METHOD_INPAGE,
        "micro.method": METHOD_POCKET_WINDOW,
        "quick.multiWindow": false,
        "quick.rocker": true
    },
    onReady: function (callback) {
        if (settings.readyCallbacks)
            settings.readyCallbacks.push(callback);
        else
            callback();
    },
    getAll: function() {
        var result = {};
        for(var key in settings.defaults) {
            if (settings.map.hasOwnProperty(key))
                result[key] = settings.map[key];
            else
                result[key] = settings.defaults[key];
        }
        return result;
    },
    get: function (key) {
        if (settings.map.hasOwnProperty(key))
            return settings.map[key];
        return settings.defaults[key];
    },
    set: function (key, value) {
        settings.map[key] = value;
    },
    save: function () {
        settings.storage.set(settings.map);
    },
    load: function () {
        settings.storage.get(null, function (map) {
            settings.map = map;
            if (settings.readyCallbacks) {
                for (var i = 0; i < settings.readyCallbacks.length; i++)
                    settings.readyCallbacks[i]();
                settings.readyCallbacks = null;
            }
            if (typeof (messageUtil) !== 'undefined') {
                var allSettings = settings.getAll();
                messageUtil.sendToAllTabs('settingsChanged', allSettings);
                messageUtil.send('settingsChanged', allSettings); // to other background scripts
                messageUtil.sendSelf('settingsChanged', allSettings); // since the above does not fire on the same process
            }
        });
    },
    restoreDefaults: function () {
        settings.map = {};
        settings.storage.clear();
    }
};

//firefox sync is broken, not sure how to test against this exact problem, for now, always use local storage on firefox
if (navigator.userAgent.toLowerCase().indexOf("firefox") >= 0) {
	settings.storage = browser.storage.local;
}

settings.load();
browser.storage.onChanged.addListener(settings.load);
