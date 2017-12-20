/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

type StyleMap = { [s: string]: string | number };

export const COMMON_STYLES: StyleMap = {
    display: "block",
    float: "none",
    margin: 0,
    padding: 0,
    border: "none",
    "border-radius": 0,
    width: "auto",
    height: "auto",
    outline: "none",
    "box-shadow": "none",
    background: "none"
};

export const OVERLAY_STYLES: StyleMap = {
    position: "fixed",
    "z-index": 1000000000,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(128, 128, 128, 0.22)"
};

export const DEFAULT_PANEL_STYLES: StyleMap = {
    position: "fixed",
    "box-shadow": "0 0 4px 1px #adadad"
};

export const MICRO_PANEL_STYLES: StyleMap = {
    left: "-1000px",
    top: 0,
    right: "auto",
    bottom: "auto",
    width: "50px",
    height: "20px",
    "border-radius": "3px"
};

export function applyForcedStyles(elem: HTMLElement, ...stylesArgs: StyleMap[]) {
    for (let styles of stylesArgs) {
        for (let key in styles) {
            elem.style.setProperty(key, styles[key].toString(), "important");
        }
    }
}
