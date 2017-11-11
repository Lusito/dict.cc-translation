/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file manages all settings, their defaults and changes

import * as messageUtil from "./messageUtil";
import { isFirefox } from "./browserInfo";

type Callback = () => void;

export interface TranslationEntry {
    k: string;
    v: string;
}

export enum TranslationMethod {
    SYN_WINDOW,
    POCKET_WINDOW,
    TAB,
    INPAGE
}

//Fixme: types
type SettingsValue = any; // string | boolean | number | TranslationEntry[]
export type SettingsMap = { [s: string]: SettingsValue };
export const settings = {
    storage: (browser.storage.sync || browser.storage.local) as browser.storage.StorageArea,
    map: {} as SettingsMap,
    readyCallbacks: [] as Callback[] | null,
    defaults: {
        "translation.list": [{ "k": "ende", "v": "DE<>EN" }, { "k": "en-de", "v": "EN->DE" }, { "k": "de-en", "v": "DE->EN" }, { "k": "enpl", "v": "EN<>PL" }, { "k": "ennl", "v": "EN<>NL" }, { "k": "deit", "v": "DE<>IT" }, { "k": "dept", "v": "DE<>PT" }],
        "translation.languages": [{ "k": "SQ", "v": "Albanian" }, { "k": "BS", "v": "Bosnian" }, { "k": "BG", "v": "Bulgarian" }, { "k": "HR", "v": "Croatian" }, { "k": "CS", "v": "Czech" }, { "k": "DA", "v": "Danish" }, { "k": "NL", "v": "Dutch" }, { "k": "EO", "v": "Esperanto" }, { "k": "FI", "v": "Finnish" }, { "k": "FR", "v": "French" }, { "k": "EL", "v": "Greek" }, { "k": "HU", "v": "Hungarian" }, { "k": "IS", "v": "Icelandic" }, { "k": "IT", "v": "Italian" }, { "k": "NO", "v": "Norwegian" }, { "k": "PL", "v": "Polish" }, { "k": "PT", "v": "Portuguese" }, { "k": "RO", "v": "Romanian" }, { "k": "RU", "v": "Russian" }, { "k": "SR", "v": "Serbian" }, { "k": "SK", "v": "Slovak" }, { "k": "ES", "v": "Spanish" }, { "k": "SV", "v": "Swedish" }, { "k": "TR", "v": "Turkish" }, { "k": "LA", "v": "Latin" }],
        "translation.useHttps": true,
        "context.enabled": true,
        "context.simple": false,
        "context.method": TranslationMethod.TAB,
        "context.multiWindow": false,
        "quick.enabled": true,
        "quick.right": true,
        "quick.ctrl": true,
        "quick.shift": false,
        "quick.alt": true,
        "quick.selected": true,
        "quick.method": TranslationMethod.INPAGE,
        "micro.method": TranslationMethod.POCKET_WINDOW,
        "quick.multiWindow": false,
        "quick.rocker": true
    } as SettingsMap,
    onReady: function (callback: Callback) {
        if (settings.readyCallbacks)
            settings.readyCallbacks.push(callback);
        else
            callback();
    },
    getAll: function () {
        let result: SettingsMap = {};
        for (let key in settings.defaults) {
            if (settings.map.hasOwnProperty(key))
                result[key] = settings.map[key];
            else
                result[key] = settings.defaults[key];
        }
        return result;
    },
    get: function (key: string) {
        if (settings.map.hasOwnProperty(key))
            return settings.map[key];
        return settings.defaults[key];
    },
    set: function (key: string, value: SettingsValue) {
        settings.map[key] = value;
    },
    save: function () {
        settings.storage.set(settings.map);
    },
    load: function () {
        settings.storage.get(null, function (map) {
            settings.map = map;
            if (settings.readyCallbacks) {
                for (let callback of settings.readyCallbacks)
                    callback();
                settings.readyCallbacks = null;
            }
            if (typeof (messageUtil) !== 'undefined') {
                let allSettings = settings.getAll();
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
if (isFirefox) {
    settings.storage = browser.storage.local;
}

settings.load();
browser.storage.onChanged.addListener(settings.load);
