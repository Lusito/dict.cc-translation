/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file manages all settings, their defaults and changes

import { browser, Storage } from "webextension-polyfill-ts";
import * as messageUtil from "./messageUtil";
import { isFirefox } from "./browserInfo";
import { TranslationMethod, TranslationEntry, SettingsTypeMap, SettingsSignature } from "./settingsSignature";

type Callback = () => void;

type SettingsValue = string | boolean | number | TranslationMethod | TranslationEntry[];
type SettingsMap = { [s: string]: SettingsValue };

const defaultSettings: SettingsMap = {
    "translation.list": [{ k: "ende", v: "DE<>EN" }, { k: "en-de", v: "EN->DE" }, { k: "de-en", v: "DE->EN" }, { k: "enpl", v: "EN<>PL" }, { k: "ennl", v: "EN<>NL" }, { k: "deit", v: "DE<>IT" }, { k: "dept", v: "DE<>PT" }],
    "translation.languages": [{ k: "SQ", v: "Albanian" }, { k: "BS", v: "Bosnian" }, { k: "BG", v: "Bulgarian" }, { k: "HR", v: "Croatian" }, { k: "CS", v: "Czech" }, { k: "DA", v: "Danish" }, { k: "NL", v: "Dutch" }, { k: "EO", v: "Esperanto" }, { k: "FI", v: "Finnish" }, { k: "FR", v: "French" }, { k: "EL", v: "Greek" }, { k: "HU", v: "Hungarian" }, { k: "IS", v: "Icelandic" }, { k: "IT", v: "Italian" }, { k: "NO", v: "Norwegian" }, { k: "PL", v: "Polish" }, { k: "PT", v: "Portuguese" }, { k: "RO", v: "Romanian" }, { k: "RU", v: "Russian" }, { k: "SR", v: "Serbian" }, { k: "SK", v: "Slovak" }, { k: "ES", v: "Spanish" }, { k: "SV", v: "Swedish" }, { k: "TR", v: "Turkish" }, { k: "LA", v: "Latin" }],
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
};

class Settings {
    private storage: Storage.StorageArea;
    private map: SettingsMap = {};
    private readyCallbacks: Callback[] | null = [];
    public constructor() {
        // firefox sync is broken, not sure how to test against this exact problem, for now, always use local storage on firefox
        if (isFirefox) {
            this.storage = browser.storage.local;
        } else {
            this.storage = browser.storage.sync || browser.storage.local;
        }

        this.load();
        browser.storage.onChanged.addListener(this.load.bind(this));
    }

    private load() {
        this.storage.get(null).then((map) => {
            this.map = map;
            if (this.readyCallbacks) {
                for (const callback of this.readyCallbacks)
                    callback();
                this.readyCallbacks = null;
            }
            if (typeof (messageUtil) !== "undefined") {
                const allSettings = this.getAll();
                messageUtil.sendToAllTabs("settingsChanged", allSettings);
                messageUtil.send("settingsChanged", allSettings); // to other background scripts
                messageUtil.sendSelf("settingsChanged", allSettings); // since the above does not fire on the same process
            }
        });
    }

    public save() {
        this.storage.set(this.map);
    }

    public onReady(callback: Callback) {
        if (this.readyCallbacks)
            this.readyCallbacks.push(callback);
        else
            callback();
    }

    public restoreDefaults() {
        this.map = {};
        this.storage.clear();
    }

    public getAll() {
        const result: SettingsMap = {};
        for (const key in defaultSettings) {
            if (this.map.hasOwnProperty(key))
                result[key] = this.map[key];
            else
                result[key] = defaultSettings[key];
        }
        return result as SettingsSignature;
    }

    public get<K extends keyof SettingsTypeMap>(key: K): SettingsTypeMap[K] {
        if (this.map.hasOwnProperty(key))
            return this.map[key] as SettingsTypeMap[K];
        return defaultSettings[key] as SettingsTypeMap[K];
    }

    public set<K extends keyof SettingsTypeMap>(key: K, value: SettingsTypeMap[K]) {
        this.map[key] = value;
    }

    // some convenience functions:

    public getProtocol() {
        return this.get("translation.useHttps") ? "https://" : "http://";
    }

    public getOpenMethod(isQuick: boolean) {
        return this.get(isQuick ? "quick.method" : "context.method");
    }

    public getMultiWindow(isQuick: boolean) {
        return this.get(isQuick ? "quick.multiWindow" : "context.multiWindow");
    }

    public createParams(text: string, languagePair: string) {
        let params = "?lp=" + languagePair;
        if (text)
            params += "&s=" + encodeURIComponent(text);
        return params;
    }

    public getFirstLanguagePair() {
        const translations = this.get("translation.list");
        if (!translations.length)
            return null;

        return translations[0].k;
    }
}
export const settings = new Settings();
