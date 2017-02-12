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

/* global request, settings, synPopupVisualizer, pocketPopupVisualizer, tabVisualizer, inpageVisualizer, browser */

var translator = {
    visualizers: [
        synPopupVisualizer,
        pocketPopupVisualizer,
        tabVisualizer,
        inpageVisualizer
    ],
    getProtocol: function () {
        return settings.get('translation.useHttps') ? 'https://' : 'http://';
    },
    getOpenMethod: function (isQuick) {
        return settings.get(isQuick ? 'quick.method' : 'context.method');
    },
    getMultiWindow: function (isQuick) {
        return settings.get(isQuick ? 'quick.multiWindow' : 'context.multiWindow');
    },
    createParams: function (text, languagePair) {
        var params = '?lp=' + languagePair;
        if (text)
            params += '&s=' + encodeURIComponent(text);
        return params;
    },
    getFirstLanguagePair: function () {
        var translations = settings.get('translation.list');
        if (!translations.length)
            return null;

        return translations[0].k;
    },
    runDCC: function (text, languagePair, callback) {
        if (!languagePair)
            languagePair = translator.getFirstLanguagePair();
        if (!languagePair)
            return;
        var params = translator.createParams(text, languagePair);
        var url = translator.getProtocol() + 'www.dict.cc/dcc-gadget.php' + params;

        request.getHTML(url, function (doc) {
            var elements = doc.getElementsByTagName("a");
            var links = [];
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                var style = element.getAttribute('style');
                if (element.querySelector('u') !== null)
                    style = 'text-decoration:underline;' + style;
                links.push({
                    href: element.href + '&lp=' + languagePair,
                    label: element.textContent,
                    style: style
                });
            }
            if (links && links.length > 0) {
                callback({
                    links: links
                });
            } else {
                callback({
                    error: browser.i18n.getMessage("resultFailed")
                });
            }
        }, function () {
            callback({
                error: browser.i18n.getMessage("resultFailed")
            });
        });
    },
    run: function (config, isQuick, tab) {
        if (!config.languagePair) {
            config.languagePair = translator.getFirstLanguagePair();
            if (!config.languagePair)
                return;
        }
        config.params = translator.createParams(config.text, config.languagePair);
        config.protocol = translator.getProtocol();
        config.multiWindow = translator.getMultiWindow(isQuick);
        config.tab = tab;
        config.incognito = tab.incognito;

        var method = translator.getOpenMethod(isQuick);
        translator.visualizers[method].show(config);
    }
};
