/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { VisualizerConfig } from "../translatorShared";
import { openPopup } from "../../lib/windowHelper";

// Shows a small popup window using pocket.dict.cc
export function pocketPopupVisualizer(config: VisualizerConfig) {
    const url = `${config.protocol}pocket.dict.cc/${config.params}`;
    openPopup(url, config.incognito || false, 350, 500);
}
