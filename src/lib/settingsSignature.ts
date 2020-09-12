/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

export interface TranslationEntry {
    k: string;
    v: string;
}

export enum TranslationMethod {
    SYN_WINDOW,
    POCKET_WINDOW,
    TAB,
    INPAGE,
}

export interface SettingsTypeMap {
    "translation.list": TranslationEntry[];
    "translation.languages": TranslationEntry[];
    "translation.useHttps": boolean;
    "context.enabled": boolean;
    "context.simple": boolean;
    "context.method": TranslationMethod;
    "context.multiWindow": boolean;
    "quick.enabled": boolean;
    "quick.right": boolean;
    "quick.ctrl": boolean;
    "quick.shift": boolean;
    "quick.alt": boolean;
    "quick.selected": boolean;
    "quick.method": TranslationMethod;
    "micro.method": TranslationMethod;
    "quick.multiWindow": boolean;
    "quick.rocker": boolean;
}

export type SettingsSignature = { [K in keyof SettingsTypeMap]: SettingsTypeMap[K] };
