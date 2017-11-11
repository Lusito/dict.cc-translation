/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file intercepts clicks (if appropriate), detects words under the cursor and shows a mini in-page translation
// Ideally, a popup panel would be used to show the translation, but that is not available in web-extensions.

import * as messageUtil from "./lib/messageUtil";
import { createElement, addLink, on, removeAllChildren } from "./lib/htmlUtils";
import { DCCResult, DCCResultLink, VisualizerConfig } from "./lib/translator";
import { SettingsMap, TranslationEntry, TranslationMethod } from "./lib/settings";

interface Config {
    method?: number,
    translations?: TranslationEntry[],
    contextEnabled?: boolean,
    contextSimple?: boolean,
    selected?: boolean,
    quickEnabled?: boolean,
    ctrl?: boolean,
    shift?: boolean,
    alt?: boolean,
    menu?: boolean,
    rocker?: boolean,
}

const allowedAscii = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let config: Config = {};
let lastActionTime = 0;
let leftDown: false | number = false;
let rightDown: false | number = false;
let miniLayer: MiniLayer | null = null;

function isWordChar(str: string, i: number) {
    let code = str.charCodeAt(i);
    // unicode
    if (code >= 127)
        return code !== 160;// nbsp;
    // ascii
    return allowedAscii.indexOf(str.charAt(i)) !== -1;
}

// Add definitions
declare global {
    interface MouseEvent {
        rangeParent: Node;
        rangeOffset: number;
    }

    interface CaretPosition {
        offsetNode: Node;
        offset: number;
    }

    interface RangeParent extends Node {
        length?: number;
        value?: string;
    }

    interface Document {
        caretPositionFromPoint: (x: number, y: number) => CaretPosition;
    }
}


function detectWordFromEvent(evt: MouseEvent) {
    let rangeParent: RangeParent;
    let rangeOffset;
    if (evt.rangeParent) {
        rangeParent = evt.rangeParent;
        rangeOffset = evt.rangeOffset;
    } else if (document.caretPositionFromPoint) {
        let pos = document.caretPositionFromPoint(evt.clientX, evt.clientY);
        rangeParent = pos.offsetNode;
        rangeOffset = pos.offset;
    } else if (document.caretRangeFromPoint) {
        let pos = document.caretRangeFromPoint(evt.clientX, evt.clientY);
        rangeParent = pos.startContainer;
        rangeOffset = pos.startOffset;
    } else {
        console.error('browser not supported');
        return "";
    }

    let pre = "", post = "";
    if (rangeParent.length) {
        // create a range object
        let rangePre = document.createRange();
        rangePre.setStart(rangeParent, 0);
        rangePre.setEnd(rangeParent, rangeOffset);
        // create a range object
        let rangePost = document.createRange();
        rangePost.setStart(rangeParent, rangeOffset);
        rangePost.setEnd(rangeParent, rangeParent.length);
        pre = rangePre.toString();
        post = rangePost.toString();
    } else if (rangeParent.value) {
        pre = rangeParent.value.substr(0, rangeOffset);
        post = rangeParent.value.substr(rangeOffset);
    }

    // Strip to a word
    if (pre !== '') {
        // look for last ascii char that is not an alpha and break out
        for (let i = pre.length - 1; i >= 0; i--) {
            if (!isWordChar(pre, i)) {
                pre = pre.substr(i + 1);
                break;
            }
        }
    }
    if (post !== '') {
        // look for first ascii char that is not an alpha and break out
        for (let i = 0; i < post.length; i++) {
            if (!isWordChar(post, i)) {
                post = post.substr(0, i);
                break;
            }
        }
    }
    return pre + post;
}

function updateWordUnderCursor(e: MouseEvent) {
    // get the selection text
    let text = config.selected ? window.getSelection().toString() : '';
    // try to get the word from the mouse event
    if (!text) {
        text = detectWordFromEvent(e);
    }
    messageUtil.send("setWordUnderCursor", {
        text: text,
        x: e.clientX,
        y: e.clientY
    });
    return text;
}

function getQuickAction(e: MouseEvent) {
    let action = null;
    // Using modifiers
    if (config.quickEnabled) {
        if ((config.ctrl || config.shift || config.alt)
            && e.ctrlKey === config.ctrl
            && e.shiftKey === config.shift
            && e.altKey === config.alt) {
            if (e.which === 1) {
                action = 'instant';
            } else if (config.menu && e.which === 3) {
                action = 'menu';
            }
        }
    }

    // Support for rocker gestures
    if (config.rocker) {
        if (!action && (leftDown || rightDown)) {
            let currentTime = Date.now();
            if (e.which === 1 && rightDown !== false && (currentTime - rightDown) < 1000)
                action = 'instant';
            else if (config.menu && e.which === 3 && leftDown !== false && (currentTime - leftDown) < 1000)
                action = 'menu';
        }
    }
    return action;
}


function preventMouseEventAfterAction(e: MouseEvent) {
    let currentTime = Date.now();
    let deltaTime = currentTime - lastActionTime;
    if (deltaTime < 500) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    return true;
}

function updateRocker(which: number, value: false | number) {
    if (which === 1)
        leftDown = value;
    else if (which === 3)
        rightDown = value;
}

function onMouseUp(e: MouseEvent) {
    updateRocker(e.which, false);
    return preventMouseEventAfterAction(e);
}

function onMouseDown(e: MouseEvent) {
    destroyPanels();
    let currentTime = Date.now();
    let action = getQuickAction(e);
    if (action) {
        let text = updateWordUnderCursor(e);
        lastActionTime = currentTime;
        if (text) {
            if (config.method === TranslationMethod.INPAGE || action === 'menu') {
                miniLayer = new MiniLayer(e.clientX, e.clientY, function () {
                    if (!miniLayer)
                        return;
                    if (action === 'menu')
                        miniLayer.showMenu(browser.i18n.getMessage("translateTo"), text);
                    else
                        miniLayer.translateQuick(text);
                });
            } else {
                messageUtil.send('requestQuickTranslation', {
                    text: text
                });
            }
        }

        e.preventDefault();
        e.stopPropagation();
    } else if (e.which === 3 && config.contextEnabled) {
        updateWordUnderCursor(e);
    }

    updateRocker(e.which, currentTime);

    return action === null;
}

function getTopLeftFromIframe() {
    let left = 0, top = 0;
    let win = window;
    let element = window.frameElement as HTMLElement;

    do {
        left += element.offsetLeft;
        top += element.offsetTop;
        element = element.offsetParent as HTMLElement;

        if (!element) {
            element = win.frameElement as HTMLElement;
            win = win.parent;
        }
    } while (element)

    return [left, top];
}

type StyleMap = { [s: string]: string | number };

const COMMON_STYLES:StyleMap = {
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

const OVERLAY_STYLES:StyleMap = {
    position: "fixed",
    "z-index": 1000000000,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(128, 128, 128, 0.22)"
};

const DEFAULT_PANEL_STYLES:StyleMap = {
    position: "fixed",
    "box-shadow": "0 0 4px 1px #adadad"
};

const MICRO_PANEL_STYLES:StyleMap = {
    left: "-1000px",
    top: 0,
    right: "auto",
    bottom: "auto",
    width: "50px",
    height: "20px",
    "border-radius": "3px"
};

function applyForcedStyles(elem: HTMLElement, ...stylesArgs: StyleMap[]) {
    for (let styles of stylesArgs) {
        for (let key in styles) {
            elem.style.setProperty(key, styles[key].toString(), "important");
        }
    }
}

function createPanelOverlay() {
    let tdoc = window.top.document;
    let overlay = tdoc.createElement('div');
    applyForcedStyles(overlay, COMMON_STYLES, OVERLAY_STYLES, { "pointer-events": "none" });
    on(overlay, 'mousedown', destroyPanels);
    tdoc.body.appendChild(overlay);
    // enable pointer-events later, since otherwise context-menu will be opened on the new panel
    setTimeout(function () {
        applyForcedStyles(overlay, { 'pointer-events': 'auto' });
    }, 500);
    return overlay;
}

class MiniLayer {
    overlay: HTMLDivElement;
    y: number;
    x: number;
    tdoc: Document;
    iframe: HTMLIFrameElement;
    idoc: Document;
    ibody: HTMLElement;
    resultNode: HTMLElement;
    extraNode: HTMLElement;
    constructor(x: number, y: number, onload: () => void) {
        // If in a frame, add frame position
        if (window.top !== window.self) {
            let tl = getTopLeftFromIframe();
            x += tl[0];
            y += tl[1];
        }
        this.x = x;
        this.y = y;
        this.overlay = createPanelOverlay();
        this.tdoc = window.top.document;
        this.iframe = this.tdoc.createElement('iframe');
        applyForcedStyles(this.iframe, COMMON_STYLES, DEFAULT_PANEL_STYLES, MICRO_PANEL_STYLES);
        this.iframe.onload = () => this.onIframeLoad();
        this.overlay.appendChild(this.iframe);
    }

    private onIframeLoad() {
        this.idoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        this.ibody = this.idoc.body;
        addLink(this.idoc, "dist/minilayer.css");
        on(this.idoc, 'keydown', function (e) {
            if (e.keyCode === 27)
                destroyPanels();
        });

        let ihead = this.idoc.querySelector('head');
        if (ihead) {
            let meta = createElement(this.idoc, ihead, 'meta');
            meta.setAttribute('charset', "utf-8");
        }

        let div = createElement(this.idoc, this.ibody, 'div');
        let a = createElement(this.idoc, div, 'a', { target: "_blank", href: "http://www.dict.cc/", id: "logo" });
        createElement(this.idoc, a, 'img', { src: browser.runtime.getURL("icons/icon16.png"), alt: "dict.cc" });
        this.resultNode = createElement(this.idoc, div, 'span', { id: "result" });
        this.extraNode = createElement(this.idoc, this.ibody, 'span', { id: "extra" });
        setTimeout(onload, 0);
        a.focus();
    }

    private updateSize() {
        let last = this.ibody.className;
        this.ibody.className += ' measuring';
        applyForcedStyles(this.iframe, {
            width: '50px',
            height: '20px'
        });
        let calculatedWidth = this.ibody.scrollWidth;
        let calculatedHeight = this.ibody.scrollHeight;
        this.ibody.className = last;

        applyForcedStyles(this.iframe, {
            width: calculatedWidth + 'px',
            height: calculatedHeight + 'px'
        });
        let vw = Math.max(this.tdoc.documentElement.clientWidth, window.innerWidth || 0);
        let vh = Math.max(this.tdoc.documentElement.clientHeight, window.innerHeight || 0);
        let left = (this.x + 5);
        if ((left + calculatedWidth) >= vw)
            left = (this.x - calculatedWidth - 5);
        let top = (this.y + 5);
        if ((top + calculatedHeight) >= vh)
            top = (this.y - calculatedHeight - 5);
        applyForcedStyles(this.iframe, {
            left: left + 'px',
            top: top + 'px'
        });
    }

    private setup(text: string | null, extraNodes: HTMLElement[] | null) {
        removeAllChildren(this.resultNode);
        if (text)
            this.resultNode.appendChild(this.idoc.createTextNode(text));
        else
            this.resultNode.innerHTML = '';
        if (!extraNodes) {
            this.ibody.className = '';
        } else {
            this.ibody.className = 'menu';
            removeAllChildren(this.extraNode);
            for (let node of extraNodes)
                this.extraNode.appendChild(node);
        }
    }

    private createMenuEntry(text: string, translation: TranslationEntry) {
        let link = createElement(this.idoc, null, "a", {
            textContent: translation.v
        });
        on(link, "click", function () {
            if (miniLayer)
                miniLayer.translateQuick(text, translation.k);
        });
        return link;
    }

    private createResultEntry(def: DCCResultLink) {
        let link = createElement(this.idoc, null, "a", {
            textContent: def.label,
            style: def.style
        });
        on(link, "click", function () {
            destroyPanels();
            messageUtil.send('showTranslationResult', {
                href: def.href
            });
        });
        return link;
    }

    public showMenu(label: string, text: string) {
        let translations = config.translations;
        if (!translations)
            return;
        let extraNodes = [];
        for (let translation of translations) {
            let raquo = createElement(this.idoc, null, "span", {
                innerHTML: '&#187; '
            });
            extraNodes.push(raquo);
            extraNodes.push(this.createMenuEntry(text, translation));
            extraNodes.push(this.idoc.createElement("br"));
        }
        this.setup(label, extraNodes);
        this.updateSize();
    }

    public showResult(links: DCCResultLink[]) {
        this.setup(null, null);
        for (let i = 0; i < links.length; i++) {
            let link = this.createResultEntry(links[i]);
            this.resultNode.appendChild(link);
            if (i < (links.length - 1))
                this.resultNode.appendChild(this.idoc.createTextNode(", "));
        }
        this.updateSize();
    }

    public showMessage(text: string) {
        this.setup(text, null);
        this.updateSize();
    }

    public showLoading() {
        this.showMessage(browser.i18n.getMessage("loading"));
    }

    public translateQuick(text: string, languagePair?: string) {
        if (miniLayer)
            miniLayer.showLoading();
        messageUtil.send('requestQuickTranslation', {
            text: text,
            languagePair: languagePair,
            dcc: true
        });
    }

    public destroy() {
        this.tdoc.body.removeChild(this.overlay);
    }
}

function destroyPanels() {
    if (miniLayer) {
        miniLayer.destroy();
        miniLayer = null;
    }
}

function showMiniLayer(cfg: VisualizerConfig) {
    destroyPanels();
    miniLayer = new MiniLayer(cfg.x || 0, cfg.y || 0, function () {
        if (miniLayer && cfg.text)
            miniLayer.translateQuick(cfg.text, cfg.languagePair);
    });
}

function showMiniLayerResult(response: DCCResult) {
    if (miniLayer) {
        if (response.error)
            miniLayer.showMessage(response.error);
        else if (response.links)
            miniLayer.showResult(response.links);
    }
}

function onSettingsChanged(settings: SettingsMap) {
    config = {
        method: settings['quick.method'],
        translations: settings['translation.list'],
        contextEnabled: settings['context.enabled'],
        contextSimple: settings['context.simple'],
        selected: settings['quick.selected'],
        quickEnabled: settings['quick.enabled'],
        ctrl: settings['quick.ctrl'],
        shift: settings['quick.shift'],
        alt: settings['quick.alt'],
        menu: settings['quick.right'],
        rocker: settings['quick.rocker']
    };
}

messageUtil.receive('contentStartup', function (settings) {
    window.addEventListener("click", preventMouseEventAfterAction, true);
    window.addEventListener("contextmenu", preventMouseEventAfterAction, true);
    window.addEventListener("mousedown", onMouseDown, true);
    window.addEventListener("mouseup", onMouseUp, true);

    messageUtil.receive('settingsChanged', onSettingsChanged);
    messageUtil.receive('showMiniLayer', showMiniLayer);
    messageUtil.receive('showMiniLayerResult', showMiniLayerResult);
    onSettingsChanged(settings);
});

messageUtil.send('contentScriptLoaded');
