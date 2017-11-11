/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { VisualizerConfig } from "../lib/translator";
import * as popup from "../lib/popup";

// Shows a bigger popup window using syn.dict.cc
export function synPopupVisualizer(config: VisualizerConfig) {
    let url = config.protocol + 'syn.dict.cc/' + config.params;
    popup.open(url, config.incognito || false, 770, 600);
}
