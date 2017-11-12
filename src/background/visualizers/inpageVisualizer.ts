/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { VisualizerConfig } from "../translatorShared";
import { sendToTab } from "../../lib/messageUtil";

// Shows a mini translation layer above the current website.
export function inpageVisualizer(config: VisualizerConfig) {
    if (config.tab) { //fixme: else
        sendToTab(config.tab, 'showMiniLayer', {
            x: config.x,
            y: config.y,
            text: config.text,
            languagePair: config.languagePair
        });
    }
}
