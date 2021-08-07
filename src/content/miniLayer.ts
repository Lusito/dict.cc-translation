/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import browser from "webextension-polyfill";

import * as messageUtil from "../lib/messageUtil";
import { createElement, addLink, on, removeAllChildren } from "../lib/htmlUtils";
import { DCCResultLink } from "../background/translatorShared";
import {
    applyForcedStyles,
    DEFAULT_PANEL_STYLES,
    MICRO_PANEL_STYLES,
    COMMON_STYLES,
    OVERLAY_STYLES,
} from "./forcedStyles";
import { TranslationEntry } from "../lib/settingsSignature";
import "./miniLayer.scss";

function getTopLeftFromIframe() {
    let left = 0;
    let top = 0;
    let win: Window = window;
    let element = window.frameElement as HTMLElement;

    do {
        left += element.offsetLeft;
        top += element.offsetTop;
        element = element.offsetParent as HTMLElement;

        if (!element) {
            element = win.frameElement as HTMLElement;
            win = win.parent;
        }
    } while (element);

    return [left, top];
}

function createPanelOverlay() {
    const tdoc = window.top.document;
    const overlay = tdoc.createElement("div");
    applyForcedStyles(overlay, COMMON_STYLES, OVERLAY_STYLES, { "pointer-events": "none" });
    tdoc.body.appendChild(overlay);
    // enable pointer-events later, since otherwise context-menu will be opened on the new panel
    setTimeout(() => applyForcedStyles(overlay, { "pointer-events": "auto" }), 500);
    return overlay;
}

export class MiniLayer {
    public onLoad: () => void;

    public onDestroy: () => void;

    public overlay: HTMLDivElement;

    public y: number;

    public x: number;

    public tdoc: Document;

    public iframe: HTMLIFrameElement;

    public idoc?: Document;

    public ibody?: HTMLElement;

    public resultNode?: HTMLElement;

    public extraNode?: HTMLElement;

    public translations?: TranslationEntry[];

    constructor(x: number, y: number, onLoad: () => void, onDestroy: () => void, translations?: TranslationEntry[]) {
        // If in a frame, add frame position
        if (window.top !== window.self) {
            const tl = getTopLeftFromIframe();
            x += tl[0];
            y += tl[1];
        }
        this.x = x;
        this.y = y;
        this.onLoad = onLoad;
        this.onDestroy = onDestroy;
        this.overlay = createPanelOverlay();
        this.translations = translations;
        on(this.overlay, "mousedown", this.destroy.bind(this));
        this.tdoc = window.top.document;
        this.iframe = this.tdoc.createElement("iframe");
        applyForcedStyles(this.iframe, COMMON_STYLES, DEFAULT_PANEL_STYLES, MICRO_PANEL_STYLES);
        this.iframe.onload = () => this.onIframeLoad();
        this.overlay.appendChild(this.iframe);
    }

    public setTranslations(translations?: TranslationEntry[]) {
        this.translations = translations;
    }

    private onIframeLoad() {
        this.idoc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
        if (!this.idoc) return;

        this.ibody = this.idoc.body;
        addLink(this.idoc, "data/content.css");
        on(this.idoc, "keydown", (e) => {
            if (e.keyCode === 27) this.destroy();
        });

        const ihead = this.idoc.querySelector("head");
        if (ihead) {
            const meta = createElement(this.idoc, ihead, "meta");
            meta.setAttribute("charset", "utf-8");
        }

        const div = createElement(this.idoc, this.ibody, "div");
        const a = createElement(this.idoc, div, "a", { target: "_blank", href: "http://www.dict.cc/", id: "logo" });
        createElement(this.idoc, a, "img", { src: browser.runtime.getURL("icons/icon16.png"), alt: "dict.cc" });
        this.resultNode = createElement(this.idoc, div, "span", { id: "result" });
        this.extraNode = createElement(this.idoc, this.ibody, "span", { id: "extra" });
        setTimeout(this.onLoad, 0);
        a.focus();
    }

    private updateSize() {
        const { ibody } = this;
        if (!ibody) return;

        const last = ibody.className;
        ibody.className += " measuring";
        applyForcedStyles(this.iframe, {
            width: "50px",
            height: "20px",
        });
        setTimeout(() => {
            const calculatedWidth = ibody.scrollWidth;
            const calculatedHeight = ibody.scrollHeight;
            ibody.className = last;

            applyForcedStyles(this.iframe, {
                width: `${calculatedWidth}px`,
                height: `${calculatedHeight}px`,
            });
            const vw = Math.max(this.tdoc.documentElement.clientWidth, window.innerWidth || 0);
            const vh = Math.max(this.tdoc.documentElement.clientHeight, window.innerHeight || 0);
            let left = this.x + 5;
            if (left + calculatedWidth >= vw) left = this.x - calculatedWidth - 5;
            let top = this.y + 5;
            if (top + calculatedHeight >= vh) top = this.y - calculatedHeight - 5;
            applyForcedStyles(this.iframe, {
                left: `${left}px`,
                top: `${top}px`,
            });
        }, 10);
    }

    private setup(text: string | null, extraNodes: HTMLElement[] | null) {
        if (!this.resultNode || !this.idoc || !this.ibody) return;

        removeAllChildren(this.resultNode);
        if (text) this.resultNode.appendChild(this.idoc.createTextNode(text));
        else this.resultNode.innerHTML = "";
        if (!extraNodes) {
            this.ibody.className = "";
        } else if (this.extraNode) {
            this.ibody.className = "menu";
            removeAllChildren(this.extraNode);
            for (const node of extraNodes) this.extraNode.appendChild(node);
        }
    }

    private createMenuEntry(idoc: Document, text: string, translation: TranslationEntry) {
        const link = createElement(idoc, null, "a", {
            textContent: translation.v,
        });
        on(link, "click", () => {
            this.translateQuick(text, translation.k);
        });
        return link;
    }

    private createResultEntry(idoc: Document, def: DCCResultLink) {
        const link = createElement(idoc, null, "a", {
            textContent: def.label,
            style: def.style,
            href: def.href,
        });
        on(link, "click", (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.destroy();
            messageUtil.send("showTranslationResult", {
                href: def.href,
            });
        });
        return link;
    }

    public showMenu(label: string, text: string) {
        if (!this.translations || !this.idoc) return;
        const extraNodes: HTMLElement[] = [];
        for (const translation of this.translations) {
            const raquo = createElement(this.idoc, null, "span", {
                innerHTML: "&#187; ",
            });
            extraNodes.push(raquo);
            extraNodes.push(this.createMenuEntry(this.idoc, text, translation));
            extraNodes.push(this.idoc.createElement("br"));
        }
        this.setup(label, extraNodes);
        this.updateSize();
    }

    public showResult(links: DCCResultLink[]) {
        this.setup(null, null);
        if (!this.resultNode || !this.idoc) return;
        for (let i = 0; i < links.length; i++) {
            const link = this.createResultEntry(this.idoc, links[i]);
            this.resultNode.appendChild(link);
            if (i < links.length - 1) this.resultNode.appendChild(this.idoc.createTextNode(", "));
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

    public translateQuick(text: string, languagePair?: string | null) {
        this.showLoading();
        messageUtil.send("requestQuickTranslation", {
            text,
            languagePair,
            dcc: true,
        });
    }

    public destroy() {
        this.tdoc.body.removeChild(this.overlay);
        this.onDestroy();
    }
}
