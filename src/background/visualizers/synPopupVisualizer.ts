/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { VisualizerConfig } from "../translatorShared";
import { openPopup } from "../../lib/windowHelper";

// Shows a bigger popup window using syn.dict.cc
export function synPopupVisualizer(config: VisualizerConfig) {
    const url = config.protocol + "syn.dict.cc/" + config.params;
    openPopup(url, config.incognito || false, 770, 600);
}
