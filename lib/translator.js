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

/* global request, settings, synPopupVisualizer, pocketPopupVisualizer, tabVisualizer, inpageVisualizer, messageUtil */

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
        if(!languagePair)
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
            if(links && links.length > 0) {
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

messageUtil.receive('requestQuickTranslation', function (data, sender) {
    translator.runDCC(data.text, data.languagePair, function(response) {
        messageUtil.sendToTab(sender.tab, 'showMiniLayerResult', response);
    });
    return true;
});

messageUtil.receive('showTranslationResult', function (data, sender) {
    var index = data.href.indexOf('?');
    var config = {
        multiWindow: settings.get('quick.multiWindow')
    };
    if (index >= 0) {
        if (!config.languagePair) {
            config.languagePair = translator.getFirstLanguagePair();
            if (!config.languagePair)
                return;
        }
        config.params = data.href.substr(index);
        config.protocol = translator.getProtocol();
        config.tab = sender.tab;
        config.incognito = sender.tab && sender.tab.incognito;
        config.asPanel = settings.get('quick.asPanel');

        var method = settings.get('micro.method');
        translator.visualizers[method].show(config);
    } else {
        // could not detect params, just open a new tab with the url
        config.url = data.href;
        tabVisualizer.show(config);
    }
});

// for audio playback:
//http://audio.dict.cc/speak.audio.php?type=wav&id=57760&lang=en_rec_ip&lp=DEEN
// lang= <sprachkürzel lower>_rec_ip
// id=57760, js global variable idArr: (index = row in page)
// var idArr = new Array(0,57760,598020,348546,348910,933862,1067466,1138709,926996,957088,350040,1161338,57069,815509,1161351,1308956,855626,57757,643664,583804,1133482,855629,893572,124,633176,1325451,1264369,745587,724975,677007,1004153,831064,811348,809291);
