/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file creates and recreates the context menu (when settings changed)
import { browser, Menus, Tabs } from 'webextension-polyfill-ts';
import * as messageUtil from "../lib/messageUtil";
import * as translator from "./translator";
import { settings } from "../lib/settings";
import { isFirefox } from "../lib/browserInfo";
import { TranslationEntry } from "../lib/settingsSignature";

export function initContextMenu() {
    interface WordUnderCursor {
        x: number;
        y: number;
        text: string;
    }

    // const ellipsis = "\u2026";
    let wordUnderCursor: string | null = null;
    let lastCursorX = 0;
    let lastCursorY = 0;
    const menuContexts:[Menus.ContextType] = ["editable", "frame", "page", "link", "selection"];

    messageUtil.receive('setWordUnderCursor', (data: WordUnderCursor) => {
        wordUnderCursor = data.text.trim();
        lastCursorX = data.x;
        lastCursorY = data.y;
        // let title = wordUnderCursor;
        // // Update labels
        // if (title.length > 15)
        //     title = title.substring(0, 15) + ellipsis;

        // if (title !== "") {
        //     title = browser.i18n.getMessage("menuSelection", title);
        // } else {
        //     title = browser.i18n.getMessage("menuNone");
        // }

        // browser.contextMenus.update("translationLabel", {title: title});
    });

    messageUtil.receive('settingsChanged', recreate);

    function createSeparator() {
        return browser.contextMenus.create({
            type: "separator",
            contexts: menuContexts
        });
    }

    function createEntry(label: string, callback: (info: Menus.OnClickData, tab: Tabs.Tab) => void) {
        let options = {
            title: label,
            contexts: menuContexts,
            onclick: callback
        };
        return browser.contextMenus.create(options);
    }

    function createLabel(label: string, id: string) {
        let options = {
            title: label,
            id: id,
            contexts: menuContexts,
            enabled: false
        };
        return browser.contextMenus.create(options);
    }

    function createTranslationEntry(translation: TranslationEntry, title?: string) {
        return browser.contextMenus.create({
            title: title || translation.v,
            contexts: menuContexts,
            onclick: (info, tab) => {
                translator.run({
                    text: info.selectionText || wordUnderCursor || '',
                    languagePair: translation.k,
                    x: lastCursorX,
                    y: lastCursorY
                }, false, tab);
            }
        });
    }

    function recreate() {
        browser.contextMenus.removeAll();
        if (!settings.get('context.enabled'))
            return;

        if (settings.get('context.simple')) {
            let translations = settings.get('translation.list');
            if (translations.length) {
                let t = translations[0];
                createTranslationEntry(t, browser.i18n.getMessage("translateAs", t.v));
            }
            return;
        }

        createLabel(browser.i18n.getMessage("translateTo"), "translationLabel");
        createSeparator();

        let translations = settings.get('translation.list');
        if (translations.length) {
            for (let translation of translations) {
                createTranslationEntry(translation);
            }

            createSeparator();
        }

        createEntry(browser.i18n.getMessage("options_label"), () => browser.runtime.openOptionsPage());

        if (isFirefox) {
            browser.contextMenus.create({
                title: browser.i18n.getMessage("options_label"),
                contexts: ["browser_action"],
                onclick: () => browser.runtime.openOptionsPage()
            });
        }
    }
    settings.onReady(recreate);
}
