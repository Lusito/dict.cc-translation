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

// This file creates and recreates the context menu (when settings changed)

/* global messageUtil, browser, translator, settings */

(function () {

    var ellipsis = "\u2026";
    var wordUnderCursor = null;
    var lastCursorX = 0;
    var lastCursorY = 0;
    var menuContexts = ["editable", "frame", "page", "link", "selection"];

    messageUtil.receive('setWordUnderCursor', function (data) {
        wordUnderCursor = data.text.trim();
        lastCursorX = data.x;
        lastCursorY = data.y;
//        var title = wordUnderCursor;
//        // Update labels
//        if (title.length > 15)
//            title = title.substring(0, 15) + ellipsis;
//
//        if (title !== "") {
//            title = browser.i18n.getMessage("menuSelection", title);
//        } else {
//            title = browser.i18n.getMessage("menuNone");
//        }
//
//        browser.contextMenus.update("translationLabel", {title: title});
    });

    messageUtil.receive('settingsChanged', recreate);

    function createSeparator() {
        return browser.contextMenus.create({
            type: "separator",
            contexts: menuContexts
        });
    }

    function createEntry(label, callback) {
        var options = {
            title: label,
            contexts: menuContexts,
            onclick: callback
        };
        return browser.contextMenus.create(options);
    }

    function createLabel(label, id) {
        var options = {
            title: label,
            id: id,
            contexts: menuContexts,
            enabled: false
        };
        return browser.contextMenus.create(options);
    }

    function createTranslationEntry(translation) {
        return browser.contextMenus.create({
            title: translation.v,
            contexts: menuContexts,
            onclick: function (info, tab) {
                translator.run({
                    text: info.selectionText || wordUnderCursor,
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

        createLabel(browser.i18n.getMessage("translateTo"), "translationLabel");
        createSeparator();

        var translations = settings.get('translation.list');
        for (var i = 0; i < translations.length; i++) {
            createTranslationEntry(translations[i]);
        }

        createSeparator();

        createEntry(browser.i18n.getMessage("options_label"), function () {
            browser.runtime.openOptionsPage();
        });
    }
    settings.onReady(recreate);

})();
