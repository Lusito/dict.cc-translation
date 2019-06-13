/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { browser } from "webextension-polyfill-ts";

export function byId(id: string) {
    return document.getElementById(id);
}

export function on<K extends keyof HTMLElementEventMap>(node: Node, event: K, callback: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any) {
    node.addEventListener(event, callback as EventListener);
}

export function translateElement(element: HTMLElement) {
    const id = element.dataset.l10nId;
    if (id) {
        const content = browser.i18n.getMessage(id);
        if (content)
            element.textContent = content;
        const title = browser.i18n.getMessage(id + "__title");
        if (title)
            element.title = title;
    }
}

export function translateChildren(parent: HTMLElement | Document) {
    const elements = parent.querySelectorAll("[data-l10n-id]");
    for (let i = 0; i < elements.length; i++)
        translateElement(elements[i] as HTMLElement);
}

export function removeAllChildren(node: HTMLElement) {
    if (node.hasChildNodes()) {
        while (node.firstChild)
            node.removeChild(node.firstChild);
    }
}

type ElementAttributes = { [s: string]: string | number | boolean };

export function createElement(doc: Document, parent: HTMLElement | null, tagName: string, params?: ElementAttributes) {
    const e = doc.createElement(tagName);
    if (params) {
        for (const key in params) {
            (e as any)[key] = params[key];
        }
    }
    if (parent)
        parent.appendChild(e);
    return e;
}

export function addLink(doc: Document, path: string) {
    const head = doc.querySelector("head");
    if (head) {
        createElement(doc, head, "link", {
            href: browser.runtime.getURL(path),
            type: "text/css",
            rel: "stylesheet"
        });
    }
}

export type MouseEventCallback = (this: HTMLInputElement, ev: MouseEvent) => any;

export function createButton(labelL10nKey: string, callback: MouseEventCallback) {
    const button = document.createElement("button");
    button.setAttribute("data-l10n-id", labelL10nKey);
    on(button, "click", callback);
    return button;
}
