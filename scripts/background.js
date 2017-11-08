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

/* global messageUtil, translator, settings, popup, tabVisualizer */

messageUtil.receive('requestQuickTranslation', function (data, sender) {
    if (data.dcc) {
        translator.runDCC(data.text, data.languagePair, function (response) {
            messageUtil.sendToTab(sender.tab, 'showMiniLayerResult', response);
        });
        return true;
    } else {
        translator.run(data, true, sender.tab);
    }
});

messageUtil.receive('showPopup', function (data, sender) {
    var incognito = sender.tab && sender.tab.incognito;
    popup.open(data.url, incognito, data.width, data.height);
});

messageUtil.receive('contentScriptLoaded', function (data, sender) {
    messageUtil.sendToTab(sender.tab, 'contentStartup', settings.getAll());
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

        var method = settings.get('micro.method');
        translator.visualizers[method].show(config);
    } else {
        // could not detect params, just open a new tab with the url
        config.url = data.href;
        tabVisualizer.show(config);
    }
});

// Notes for future development of audio playback:
//http://audio.dict.cc/speak.audio.php?type=wav&id=57760&lang=en_rec_ip&lp=DEEN
// lang= <sprachkürzel lower>_rec_ip
// id=57760, js global variable idArr: (index = row in page)
// var idArr = new Array(0,57760,598020,348546,348910,933862,1067466,1138709,926996,957088,350040,1161338,57069,815509,1161351,1308956,855626,57757,643664,583804,1133482,855629,893572,124,633176,1325451,1264369,745587,724975,677007,1004153,831064,811348,809291);
