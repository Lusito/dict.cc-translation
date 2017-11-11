/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { VisualizerConfig } from "../lib/translator";
import * as popup from "../lib/popup";

// Shows a small popup window using pocket.dict.cc
export function pocketPopupVisualizer(config: VisualizerConfig) {
    let url = config.protocol + 'pocket.dict.cc/' + config.params;
    popup.open(url, config.incognito || false, 350, 500);
}
