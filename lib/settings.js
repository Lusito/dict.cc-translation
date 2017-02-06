/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Lusito)
 
 * This file is part of The Firefox Dict.cc Addon.
 
 * The Firefox Dict.cc Addon is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 
 * The Firefox Dict.cc Addon is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 
 * You should have received a copy of the GNU General Public License
 * along with The Firefox Dict.cc Addon.  If not, see http://www.gnu.org/licenses/.
 
 * ***** END LICENSE BLOCK ***** */

/* global METHOD_INPAGE, METHOD_POCKET_WINDOW, METHOD_TAB, browser, messageUtil */

var browserStorage = browser.storage.sync || browser.storage.local;

var settings = {
    map: {},
    readyCallbacks: [],
    defaults: {
        "translation.list": [{"k": "ende", "v": "DE<>EN"}, {"k": "en-de", "v": "EN->DE"}, {"k": "de-en", "v": "DE->EN"}, {"k": "enpl", "v": "EN<>PL"}, {"k": "ennl", "v": "EN<>NL"}, {"k": "deit", "v": "DE<>IT"}, {"k": "dept", "v": "DE<>PT"}],
        "translation.languages": [{"k": "SQ", "v": "Albanian"}, {"k": "BS", "v": "Bosnian"}, {"k": "BG", "v": "Bulgarian"}, {"k": "HR", "v": "Croatian"}, {"k": "CS", "v": "Czech"}, {"k": "DA", "v": "Danish"}, {"k": "NL", "v": "Dutch"}, {"k": "EO", "v": "Esperanto"}, {"k": "FI", "v": "Finnish"}, {"k": "FR", "v": "French"}, {"k": "EL", "v": "Greek"}, {"k": "HU", "v": "Hungarian"}, {"k": "IS", "v": "Icelandic"}, {"k": "IT", "v": "Italian"}, {"k": "NO", "v": "Norwegian"}, {"k": "PL", "v": "Polish"}, {"k": "PT", "v": "Portuguese"}, {"k": "RO", "v": "Romanian"}, {"k": "RU", "v": "Russian"}, {"k": "SR", "v": "Serbian"}, {"k": "SK", "v": "Slovak"}, {"k": "ES", "v": "Spanish"}, {"k": "SV", "v": "Swedish"}, {"k": "TR", "v": "Turkish"}, {"k": "LA", "v": "Latin"}],
        "translation.useHttps": true,
        "context.enabled": true,
        "context.method": METHOD_TAB,
        "context.multiWindow": false,
        "context.asPanel": true,
        "quick.enabled": true,
        "quick.right": true,
        "quick.ctrl": true,
        "quick.shift": false,
        "quick.alt": true,
        "quick.selected": true,
        "quick.method": METHOD_INPAGE,
        "micro.method": METHOD_POCKET_WINDOW,
        "quick.multiWindow": false,
        "quick.asPanel": true,
        "quick.rocker": true
    },
    onReady: function (callback) {
        if (settings.readyCallbacks)
            settings.readyCallbacks.push(callback);
        else
            callback();
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
        browserStorage.set(settings.map);
    },
    load: function () {
        browserStorage.get(null, function (map) {
            if (settings.readyCallbacks) {
                for (var i = 0; i < settings.readyCallbacks.length; i++)
                    settings.readyCallbacks[i]();
                settings.readyCallbacks = null;
            }
            settings.map = map;
            messageUtil.sendToAllTabs('settingsChanged');
            messageUtil.send('settingsChanged'); // to other background scripts
            messageUtil.sendSelf('settingsChanged'); // since the above does not fire on the same process
        });
    },
    restoreDefaults: function () {
        settings.map = {};
        browserStorage.clear();
    }
};
settings.load();
browser.storage.onChanged.addListener(settings.load);
