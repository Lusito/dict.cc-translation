/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { browser } from "webextension-polyfill-ts";
import { settings } from "./lib/settings";
import * as request from "./lib/request";
import { byId, createElement, on } from "./lib/htmlUtils";
import "./styles/popup.scss";

type DefinitionNode = {
    tagName?: string,
    textContent: string
};

interface Description {
    href: string;
    nodes: DefinitionNode[];
}

type Definition = {
    textContent?: string,
    href?: string;
    nodes?: DefinitionNode[];
    descriptions: Description[]
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
                value: translation.k
            });
        }

        // on enter or click, run search
        on(this.search, "keydown", (e) => {
            if (e.keyCode === 13)
                this.runSearch();
        });
        on(this.go, "click", this.runSearch.bind(this));

        // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1338909
        setTimeout(() => this.search.focus(), 100);
    }

    private parseDescriptionNodes(parent: HTMLElement) {
        const result: DefinitionNode[] = [];
        const nodes = parent.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const tagName = (node as HTMLElement).tagName;
            if (tagName) {
                result.push({
                    tagName,
                    textContent: node.textContent || ""
                });
            } else if (node.nodeType === 3) {
                result.push({
                    textContent: node.textContent || ""
                });
            }
        }
        return result;
    }

    private getSafeHref(a: HTMLAnchorElement, urlPrefix: string, urlSuffix: string) {
        let href = a.getAttribute("href") || "";
        if (href.indexOf("/?") === 0) {
            href = urlPrefix + href + urlSuffix;
        } else if (href.indexOf("?") === 0) {
            href = urlPrefix + "/" + href + urlSuffix;
        } else if (href.indexOf("http") !== 0) {
            href = "#"; // not as expected, could be javascript, so override
        }
        return href;
    }

    private parseDefinitionLists(doc: Document, languagePair: string) {
        const lists = [];
        const dls = doc.querySelectorAll("dl");
        for (let i = 0; i < dls.length; i++) {
            const definitions = this.parseDefinitions(dls[i], languagePair);
            if (definitions.length > 0)
                lists.push(definitions);
        }
        return lists;
    }

    private parseDefinitions(dl: HTMLDListElement, languagePair: string) {
        const urlPrefix = settings.getProtocol() + "www.dict.cc";
        const urlSuffix = "&lp=" + languagePair;

        const rows = dl.querySelectorAll("dt,dd");
        const definitions = [];
        let definition: Definition | null = null;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.tagName === "DT") {
                const a = row.querySelector("a");
                if (a) {
                    definition = {
                        textContent: a.textContent || "",
                        href: this.getSafeHref(a, urlPrefix, urlSuffix),
                        descriptions: []
                    };
                    definitions.push(definition);
                } else {
                    definition = {
                        nodes: this.parseDescriptionNodes(row as HTMLElement),
                        descriptions: []
                    };
                    definitions.push(definition);
                }
            } else if (definition && row.tagName === "DD") {
                const links = row.querySelectorAll("a");
                for (let j = 0; j < links.length; j++) {
                    const a: HTMLAnchorElement = links[j];
                    definition.descriptions.push({
                        href: this.getSafeHref(a, urlPrefix, urlSuffix),
                        nodes: this.parseDescriptionNodes(a)
                    });
                }
            }
        }
        return definitions;
    }

    private onFailedKWClick(e: MouseEvent) {
        const href = (e.currentTarget as HTMLAnchorElement).href;
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
                    target: "_blank"
                });
                if (def.href.indexOf("&failed_kw=") > 0)
                    a.onclick = onFailedKWClick;
            } else if (def.nodes) {
                for (let k = 0; k < def.nodes.length; k++) {
                    const node = def.nodes[k];
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
                    target: "_blank"
                });
                if (desc.href.indexOf("&failed_kw=") > 0)
                    a.onclick = onFailedKWClick;
                for (const node of desc.nodes) {
                    if (node.tagName) {
                        createElement(document, a, node.tagName, { textContent: node.textContent });
                    } else {
                        a.appendChild(document.createTextNode(node.textContent));
                    }
                }
                if ((j + 1) < def.descriptions.length) {
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
            const url = settings.getProtocol() + "pocket.dict.cc/" + settings.createParams(word, this.lp.value);
            this.runSearchFor(url);
        }
    }

    private runSearchFor(url: string) {
        if (this.result === null)
            this.result = createElement(document, document.body, "div", { id: "result" });
        this.result.textContent = browser.i18n.getMessage("loading");
        request.getHTML(url, (doc: Document | null) => {
            if (!this.result || !doc)
                return;
            const languagePair = this.lp.value;
            const definitionLists = this.parseDefinitionLists(doc, languagePair);
            if (!definitionLists.length) {
                this.result.textContent = browser.i18n.getMessage("resultFailed");
            }
            else {
                this.result.innerHTML = "";
                for (const def of definitionLists) {
                    const destination = createElement(document, this.result, "dl");
                    this.generateResult(destination, def);
                }
            }
        }, () => {
            if (this.result)
                this.result.textContent = browser.i18n.getMessage("resultFailed");
        });
    }
}

settings.onReady(() => new Popup());
