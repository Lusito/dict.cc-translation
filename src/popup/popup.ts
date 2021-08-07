/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import browser from "webextension-polyfill";

import { settings } from "../lib/settings";
import * as request from "../lib/request";
import { byId, createElement, on } from "../lib/htmlUtils";
import "../shared.scss";
import "./popup.scss";

type DefinitionNode = {
    tagName?: string;
    textContent: string;
};

interface Description {
    href: string;
    nodes: DefinitionNode[];
}

type Definition = {
    textContent?: string;
    href?: string;
    nodes?: DefinitionNode[];
    descriptions: Description[];
};

class Popup {
    private lp = byId("lp") as HTMLInputElement; // dropdown language pair

    private search = byId("search") as HTMLInputElement; // text input

    private go = byId("go") as HTMLButtonElement; // go button

    private result: null | HTMLElement = null;

    public constructor() {
        // Translate text and create dropdown items
        this.search.placeholder = browser.i18n.getMessage("popup_placeholder");
        this.go.textContent = browser.i18n.getMessage("popup_button");
        const translations = settings.get("translation.list");
        for (const translation of translations) {
            createElement(document, this.lp, "option", {
                textContent: translation.v,
                value: translation.k,
            });
        }

        // on enter or click, run search
        on(this.search, "keydown", (e) => {
            if (e.keyCode === 13) this.runSearch();
        });
        on(this.go, "click", this.runSearch.bind(this));

        // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1338909
        setTimeout(() => this.search.focus(), 100);
    }

    private parseDescriptionNodes(parent: HTMLElement) {
        const result: DefinitionNode[] = [];
        const nodes = parent.childNodes;
        for (const node of nodes) {
            const { tagName } = node as HTMLElement;
            if (tagName) {
                result.push({
                    tagName,
                    textContent: node.textContent || "",
                });
            } else if (node.nodeType === 3) {
                result.push({
                    textContent: node.textContent || "",
                });
            }
        }
        return result;
    }

    private getSafeHref(a: HTMLAnchorElement, urlPrefix: string) {
        let href = a.getAttribute("href") || "";
        if (href.indexOf("/?") === 0) {
            href = `${urlPrefix + href}&source=firefox-add-on`;
        } else if (href.indexOf("?") === 0) {
            href = `${urlPrefix}/${href}&source=firefox-add-on`;
        } else if (href.indexOf("http") !== 0) {
            href = "#"; // not as expected, could be javascript, so override
        }
        return href;
    }

    private parseDefinitionLists(doc: Document) {
        const lists = [];
        const dls = doc.querySelectorAll("dl");
        for (const dl of dls) {
            const definitions = this.parseDefinitions(dl);
            if (definitions.length > 0) lists.push(definitions);
        }
        return lists;
    }

    private parseDefinitions(dl: HTMLDListElement) {
        const urlPrefix = `${settings.getProtocol()}www.dict.cc`;

        const rows = dl.querySelectorAll("dt,dd");
        const definitions = [];
        let definition: Definition | null = null;
        for (const row of rows) {
            if (row.tagName === "DT") {
                const a = row.querySelector("a");
                if (a) {
                    definition = {
                        textContent: a.textContent || "",
                        href: this.getSafeHref(a, urlPrefix),
                        descriptions: [],
                    };
                    definitions.push(definition);
                } else {
                    definition = {
                        nodes: this.parseDescriptionNodes(row as HTMLElement),
                        descriptions: [],
                    };
                    definitions.push(definition);
                }
            } else if (definition && row.tagName === "DD") {
                const links = row.querySelectorAll("a");
                for (const a of links) {
                    definition.descriptions.push({
                        href: this.getSafeHref(a, urlPrefix),
                        nodes: this.parseDescriptionNodes(a),
                    });
                }
            }
        }
        return definitions;
    }

    private onFailedKWClick(e: MouseEvent) {
        const { href } = e.currentTarget as HTMLAnchorElement;
        this.runSearchFor(href.replace("www.dict.cc", "pocket.dict.cc"));
        e.stopImmediatePropagation();
        e.preventDefault();
    }

    private generateResult(result: HTMLElement, definitions: Definition[]) {
        const onFailedKWClick = this.onFailedKWClick.bind(this);
        for (const def of definitions) {
            const dt = createElement(document, result, "dt");
            const dd = createElement(document, result, "dd");
            if (def.href) {
                const a = createElement(document, dt, "a", {
                    href: def.href,
                    textContent: def.textContent || "?",
                    target: "_blank",
                });
                if (def.href.indexOf("&failed_kw=") > 0) a.onclick = onFailedKWClick;
            } else if (def.nodes) {
                for (const node of def.nodes) {
                    if (node.tagName) {
                        createElement(document, dt, node.tagName, { textContent: node.textContent });
                    } else {
                        dt.appendChild(document.createTextNode(node.textContent));
                    }
                }
            }
            for (let j = 0; j < def.descriptions.length; j++) {
                const desc = def.descriptions[j];
                const a = createElement(document, dd, "a", {
                    href: desc.href,
                    target: "_blank",
                });
                if (desc.href.indexOf("&failed_kw=") > 0) a.onclick = onFailedKWClick;
                for (const node of desc.nodes) {
                    if (node.tagName) {
                        createElement(document, a, node.tagName, { textContent: node.textContent });
                    } else {
                        a.appendChild(document.createTextNode(node.textContent));
                    }
                }
                if (j + 1 < def.descriptions.length) {
                    createElement(document, dd, "br");
                }
            }
        }
    }

    // Makes a request to search pocket.dict.cc with the configured parameters.
    // Parses the resulting HTML and generates content for the popup html
    private runSearch() {
        const word = this.search.value.trim();
        if (word !== "") {
            const url = `${settings.getProtocol()}pocket.dict.cc/${settings.createParams(word, this.lp.value)}`;
            this.runSearchFor(url);
        }
    }

    private runSearchFor(url: string) {
        if (this.result === null) this.result = createElement(document, document.body, "div", { id: "result" });
        this.result.textContent = browser.i18n.getMessage("loading");
        request.getHTML(
            url,
            (doc: Document | null) => {
                if (!this.result || !doc) return;
                const definitionLists = this.parseDefinitionLists(doc);
                if (!definitionLists.length) {
                    this.result.textContent = browser.i18n.getMessage("resultFailed");
                } else {
                    this.result.innerHTML = "";
                    for (const def of definitionLists) {
                        const destination = createElement(document, this.result, "dl");
                        this.generateResult(destination, def);
                    }
                }
            },
            () => {
                if (this.result) this.result.textContent = browser.i18n.getMessage("resultFailed");
            }
        );
    }
}

settings.onReady(() => new Popup());
