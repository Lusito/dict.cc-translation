/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import * as browser from 'webextension-polyfill';
import { settings } from "./lib/settings";
import * as request from "./lib/request";
import { byId, createElement, on } from "./lib/htmlUtils";

type DefinitionNode = {
    tagName?: string,
    textContent: string
};

interface Description {
    href: string,
    nodes: DefinitionNode[];
}

type Definition = {
    textContent?: string,
    href?: string;
    nodes?: DefinitionNode[];
    descriptions: Description[]
};

class Popup {
    private lp = byId('lp') as HTMLInputElement; // dropdown language pair
    private search = byId('search') as HTMLInputElement; // text input
    private go = byId('go') as HTMLButtonElement; // go button
    private result: null | HTMLElement = null;

    public constructor() {
        // Translate text and create dropdown items
        this.search.placeholder = browser.i18n.getMessage("popup_placeholder");
        this.go.textContent = browser.i18n.getMessage("popup_button");
        let translations = settings.get('translation.list');
        for (let translation of translations) {
            createElement(document, this.lp, 'option', {
                textContent: translation.v,
                value: translation.k
            });
        }

        // on enter or click, run search
        on(this.search, 'keydown', (e) => {
            if (e.keyCode === 13)
                this.runSearch();
        });
        on(this.go, 'click', this.runSearch.bind(this));
        
        // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1338909
        setTimeout(() => this.search.focus(), 100);
    }

    private parseDescriptionNodes(parent: HTMLElement) {
        let result: DefinitionNode[] = [];
        let nodes = parent.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if ((node as HTMLElement).tagName) {
                result.push({
                    tagName: (node as HTMLElement).tagName,
                    textContent: node.textContent || ''
                });
            } else if (node.nodeType === 3) {
                result.push({
                    textContent: node.textContent || ''
                });
            }
        }
        return result;
    }

    private getSafeHref(a: HTMLAnchorElement, urlPrefix: string, urlSuffix: string) {
        let href = a.getAttribute('href') || '';
        if (href.indexOf('/?') === 0) {
            href = urlPrefix + href + urlSuffix;
        } else if (href.indexOf('?') === 0) {
            href = urlPrefix + '/' + href + urlSuffix;
        } else if (href.indexOf('http') !== 0) {
            href = '#'; // not as expected, could be javascript, so override
        }
        return href;
    }

    private parseDefinitionLists(doc: Document, languagePair: string) {
        let lists = [];
        let dls = doc.querySelectorAll("dl");
        for (let i = 0; i < dls.length; i++) {
            let definitions = this.parseDefinitions(dls[i], languagePair);
            if (definitions.length > 0)
                lists.push(definitions);
        }
        return lists;
    }

    private parseDefinitions(dl: HTMLDListElement, languagePair: string) {
        let urlPrefix = settings.getProtocol() + 'www.dict.cc';
        let urlSuffix = '&lp=' + languagePair;

        let rows = dl.querySelectorAll("dt,dd");
        let definitions = [];
        let definition: Definition | null = null;
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            if (row.tagName === 'DT') {
                let a = row.querySelector('a');
                if (a) {
                    definition = {
                        textContent: a.textContent || '',
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
            } else if (definition && row.tagName === 'DD') {
                let links = row.querySelectorAll('a');
                for (let j = 0; j < links.length; j++) {
                    let a: HTMLAnchorElement = links[j];
                    definition.descriptions.push({
                        href: this.getSafeHref(a, urlPrefix, urlSuffix),
                        nodes: this.parseDescriptionNodes(a)
                    });
                }
            }
        }
        return definitions;
    }

    private generateResult(result: HTMLElement, definitions: Definition[]) {
        for (let def of definitions) {
            let dt = createElement(document, result, 'dt');
            let dd = createElement(document, result, 'dd');
            if (def.href) {
                createElement(document, dt, 'a', {
                    href: def.href,
                    textContent: def.textContent || '?',
                    target: '_blank'
                });
            } else if (def.nodes) {
                for (let k = 0; k < def.nodes.length; k++) {
                    let node = def.nodes[k];
                    if (node.tagName) {
                        createElement(document, dt, node.tagName, { textContent: node.textContent });
                    } else {
                        dt.appendChild(document.createTextNode(node.textContent));
                    }
                    if ((k + 1) < def.descriptions.length) {
                        createElement(document, dd, 'br');
                    }
                }
            }
            for (let j = 0; j < def.descriptions.length; j++) {
                let desc = def.descriptions[j];
                let a = createElement(document, dd, 'a', {
                    href: desc.href,
                    target: '_blank'
                });
                for (let node of desc.nodes) {
                    if (node.tagName) {
                        createElement(document, a, node.tagName, { textContent: node.textContent });
                    } else {
                        a.appendChild(document.createTextNode(node.textContent));
                    }
                }
                if ((j + 1) < def.descriptions.length) {
                    createElement(document, dd, 'br');
                }
            }
        }
    }

    // Makes a request to search pocket.dict.cc with the configured parameters.
    // Parses the resulting HTML and generates content for the popup html
    private runSearch() {
        let word = this.search.value.trim();
        if (word !== '') {
            let languagePair = this.lp.value;
            let url = settings.getProtocol() + 'pocket.dict.cc/' + settings.createParams(word, languagePair);


            if (this.result === null)
                this.result = createElement(document, document.body, 'div', { id: 'result' });

            this.result.textContent = browser.i18n.getMessage("loading");
            request.getHTML(url, (doc: Document | null) => {
                if (!this.result || !doc)
                    return;
                let definitionLists = this.parseDefinitionLists(doc, languagePair);
                if (!definitionLists.length) {
                    this.result.textContent = browser.i18n.getMessage("resultFailed");
                } else {
                    this.result.innerHTML = '';
                    for (let def of definitionLists) {
                        let destination = createElement(document, this.result, 'dl');
                        this.generateResult(destination, def);
                    }
                }
            }, () => {
                if (this.result)
                    this.result.textContent = browser.i18n.getMessage("resultFailed");
            });
        }
    }
}

settings.onReady(() => new Popup());
