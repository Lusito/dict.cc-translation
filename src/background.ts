/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import * as messageUtil from "./lib/messageUtil";
import * as translator from "./background/translator";
import { openPopup } from "./lib/windowHelper";
import { settings } from "./lib/settings";
import { VisualizerConfig } from "./background/translatorShared";
import { tabVisualizer } from "./background/visualizers/tabVisualizer";
import { initContextMenu } from "./background/contextmenu";

messageUtil.receive("requestQuickTranslation", (data, sender) => {
    const tab = sender?.tab;
    if (tab) {
        if (data.dcc) {
            translator.runDCC(data.text, data.languagePair, (response: any) => {
                messageUtil.sendToTab(tab, "showMiniLayerResult", response);
            });
            return true;
        }
        translator.run(data, true, tab);
    }
    return undefined;
});

messageUtil.receive("showPopup", (data, sender) => {
    const tab = sender?.tab;
    if (tab) openPopup(data.url, tab.incognito, data.width, data.height);
});

messageUtil.receive("contentScriptLoaded", (data, sender) => {
    const tab = sender?.tab;
    if (tab) messageUtil.sendToTab(tab, "contentStartup", settings.getAll());
});

messageUtil.receive("showTranslationResult", (data, sender) => {
    const index = data.href.indexOf("?");
    const config: VisualizerConfig = {
        multiWindow: settings.get("quick.multiWindow"),
    };
    if (index >= 0) {
        if (!config.languagePair) {
            config.languagePair = settings.getFirstLanguagePair();
            if (!config.languagePair) return;
        }
        config.params = data.href.substr(index);
        config.protocol = settings.getProtocol();
        config.tab = sender?.tab;
        config.incognito = sender?.tab?.incognito;

        const method = settings.get("micro.method");
        translator.visualizers[method](config);
    } else {
        // could not detect params, just open a new tab with the url
        config.url = data.href;
        tabVisualizer(config);
    }
});

initContextMenu();

// Notes for future development of audio playback:
// http://audio.dict.cc/speak.audio.php?type=wav&id=57760&lang=en_rec_ip&lp=DEEN
// lang= <sprachkürzel lower>_rec_ip
// id=57760, js global variable idArr: (index = row in page)
// let idArr = new Array(0,57760,598020,348546,348910,933862,1067466,1138709,926996,957088,350040,1161338,57069,815509,1161351,1308956,855626,57757,643664,583804,1133482,855629,893572,124,633176,1325451,1264369,745587,724975,677007,1004153,831064,811348,809291);
