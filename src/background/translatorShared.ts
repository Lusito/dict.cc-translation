/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { Tabs } from "webextension-polyfill-ts";

export interface RunConfig {
    languagePair?: string;
    text: string;
    x: number;
    y: number;
    url?: string;
}

export interface VisualizerConfig {
    languagePair?: string | null;
    text?: string;
    url?: string;
    x?: number;
    y?: number;
    params?: string;
    protocol?: string;
    multiWindow?: boolean;
    tab?: Tabs.Tab;
    incognito?: boolean;
}

export interface DCCResultLink {
    href: string;
    label: string;
    style: string;
}

export interface DCCResult {
    links?: DCCResultLink[];
    error?: string;
}
