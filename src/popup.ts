/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { settings } from "./lib/settings";
import * as request from "./lib/request";
import { byId, createElement, on } from "./lib/htmlUtils";

type Definition = {
    textContent?: string,
    href?: string;
    nodes?: any[];//fixme
    descriptions: {
        href: string,
        nodes: any[];//fixme
    }[]
};

settings.onReady(function () {
    let lp = byId('lp') as HTMLInputElement; // dropdown language pair
    let search = byId('search') as HTMLInputElement; // text input
    let go = byId('go') as HTMLButtonElement; // go button
    let result: null | HTMLElement = null;

    function getProtocol() {
        return settings.get('translation.useHttps') ? 'https://' : 'http://';
    }

    function createParams(text: string, languagePair: string) {
        let params = '?lp=' + languagePair;
        if (text)
            params += '&s=' + encodeURIComponent(text);
        return params;
    }

    function parseDescriptionNodes(parent: HTMLElement) {
        let result = [];
        let nodes = parent.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if ((node as HTMLElement).tagName) {
                result.push({
                    tagName: (node as HTMLElement).tagName,
                    textContent: node.textContent
                });
            } else if (node.nodeType === 3) {
                result.push(node.textContent);
            }
        }
        return result;
    }

    function getSafeHref(a: HTMLAnchorElement, urlPrefix: string, urlSuffix: string) {
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

    function parseDefinitionLists(doc: Document, languagePair: string) {
        let lists = [];
        let dls = doc.querySelectorAll("dl");
        for (let i = 0; i < dls.length; i++) {
            let definitions = parseDefinitions(dls[i], languagePair);
            if (definitions.length > 0)
                lists.push(definitions);
        }
        return lists;
    }
    function parseDefinitions(dl: HTMLDListElement, languagePair: string) {
        let urlPrefix = getProtocol() + 'www.dict.cc';
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
                        href: getSafeHref(a, urlPrefix, urlSuffix),
                        descriptions: []
                    };
                    definitions.push(definition);
                } else {
                    definition = {
                        nodes: parseDescriptionNodes(row as HTMLElement),
                        descriptions: []
                    };
                    definitions.push(definition);
                }
            } else if (definition && row.tagName === 'DD') {
                let links = row.querySelectorAll('a');
                for (let j = 0; j < links.length; j++) {
                    let a: HTMLAnchorElement = links[j];
                    definition.descriptions.push({
                        href: getSafeHref(a, urlPrefix, urlSuffix),
                        nodes: parseDescriptionNodes(a)
                    });
                }
            }
        }
        return definitions;
    }

    function generateResult(result: HTMLElement, definitions: Definition[]) {
        for (let def of definitions) {
            let dt = createElement(document, result, 'dt');
            let dd = createElement(document, result, 'dd');
            if (def.href) {
                createElement(document, dt, 'a', {
                    href: def.href,
                    textContent: def.textContent,
                    target: '_blank'
                });
            } else if (def.nodes) {
                for (let k = 0; k < def.nodes.length; k++) {
                    let node = def.nodes[k];
                    if (node.tagName) {
                        createElement(document, dt, node.tagName, { textContent: node.textContent });
                    } else {
                        dt.appendChild(document.createTextNode(node));
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
                        a.appendChild(document.createTextNode(node));
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
    function runSearch() {
        let word = search.value.trim();
        if (word !== '') {
            let languagePair = lp.value;
            let url = getProtocol() + 'pocket.dict.cc/' + createParams(word, languagePair);


            if (result === null)
                result = createElement(document, document.body, 'div', { id: 'result' });

            result.textContent = browser.i18n.getMessage("loading");
            request.getHTML(url, function (doc: Document | null) {
                if (!result || !doc)
                    return;
                let definitionLists = parseDefinitionLists(doc, languagePair);
                if (!definitionLists.length) {
                    result.textContent = browser.i18n.getMessage("resultFailed");
                } else {
                    result.innerHTML = '';
                    for (let def of definitionLists) {
                        let destination = createElement(document, result, 'dl');
                        generateResult(destination, def);
                    }
                }
            }, function () {
                if (result)
                    result.textContent = browser.i18n.getMessage("resultFailed");
            });
        }
    }

    // Translate text and create dropdown items
    search.placeholder = browser.i18n.getMessage("popup_placeholder");
    go.textContent = browser.i18n.getMessage("popup_button");
    let translations = settings.get('translation.list');
    for (let translation of translations) {
        createElement(document, lp, 'option', {
            textContent: translation.v,
            value: translation.k
        });
    }

    // on enter or click, run search
    on(search, 'keydown', function (e) {
        if (e.keyCode === 13) {
            runSearch();
        }
    });
    on(go, 'click', runSearch);

    // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1338909
    setTimeout(() => search.focus(), 100);
});
