/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Lusito)
 
 * This file is part of the dict.cc web-extension.
 
 * The dict.cc web-extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 
 * The dict.cc web-extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 
 * You should have received a copy of the GNU General Public License
 * along with the dict.cc web-extension.  If not, see http://www.gnu.org/licenses/.
 
 * ***** END LICENSE BLOCK ***** */

/* global settings, request, browser */

settings.onReady(function () {
    var lp = byId('lp'); // dropdown language pair
    var search = byId('search'); // text input
    var go = byId('go'); // go button
    var result = null;

    function getProtocol() {
        return settings.get('translation.useHttps') ? 'https://' : 'http://';
    }

    function createParams(text, languagePair) {
        var params = '?lp=' + languagePair;
        if (text)
            params += '&s=' + encodeURIComponent(text);
        return params;
    }

    function parseDescriptionLink(a) {
        var result = [];
        var nodes = a.childNodes;
        for(var i=0; i<nodes.length; i++) {
            var node = nodes[i];
            if(node.tagName) {
                result.push({
                    tagName: node.tagName,
                    textContent: node.textContent
                });
            } else if(node.nodeType === 3) {
                result.push(node.textContent);
            }
        }
        return result;
    }

    function getSafeHref(a, urlPrefix, urlSuffix) {
        var href = a.getAttribute('href');
        if (href.indexOf('/?') === 0) {
            href = urlPrefix + href + urlSuffix;
        } else if (href.indexOf('http') !== 0)  {
            href = '#'; // not as expected, could be javascript, so override
        }
        return href;
    }

    function parseDefinitions(doc, languagePair) {
        var urlPrefix = getProtocol() + 'www.dict.cc';
        var urlSuffix = '&lp=' + languagePair;
        
        var rows = doc.querySelectorAll("dl > dt, dl > dd");
        var definitions = [];
        var definition = null;
        for(var i=0; i<rows.length; i++) {
            var row = rows[i];
            if(row.tagName === 'DT') {
                var a = row.querySelector('a');
                if(a) {
                    definition = {
                        textContent: a.textContent,
                        href: getSafeHref(a, urlPrefix, urlSuffix),
                        descriptions: []
                    };
                    definitions.push(definition);
                }
            } else if(definition && row.tagName === 'DD') {
                var links = row.querySelectorAll('a');
                for(var j=0; j<links.length; j++) {
                    var a = links[j];
                    definition.descriptions.push({
                        href: getSafeHref(a, urlPrefix, urlSuffix),
                        nodes: parseDescriptionLink(a)
                    });
                }
            }
        }
        return definitions;
    }

    function generateResult(result, definitions) {
        for(var i=0; i<definitions.length; i++) {
            var def = definitions[i];
            var dt = createElement(document, result, 'dt');
            createElement(document, dt, 'a', {
                href: def.href,
                textContent: def.textContent,
                target: '_blank'
            });
            var dd = createElement(document, result, 'dd');
            for(var j=0; j<def.descriptions.length; j++) {
                var desc = def.descriptions[j];
                var a = createElement(document, dd, 'a', {
                    href: desc.href,
                    target: '_blank'
                });
                for(var k=0; k<desc.nodes.length; k++) {
                    var node = desc.nodes[k];
                    if(node.tagName) {
                        createElement(document, a, node.tagName, {textContent: node.textContent});
                    } else {
                        a.appendChild(document.createTextNode(node));
                    }
                }
                if((j+1)<def.descriptions.length) {
                    createElement(document, dd, 'br');
                }
            }
        }
    }

    // Makes a request to search pocket.dict.cc with the configured parameters.
    // Parses the resulting HTML and generates content for the popup html
    function runSearch() {
        var word = search.value.trim();
        if (word !== '') {
            var languagePair = lp.value;
            var url = getProtocol() + 'pocket.dict.cc/' + createParams(word, languagePair);


            if (result === null)
                result = createElement(document, document.body, 'dl', {id: 'result'});

            result.textContent = browser.i18n.getMessage("loading");
            request.getHTML(url, function (doc) {
                var definitions = parseDefinitions(doc, languagePair);
                if (!definitions.length) {
                    result.textContent = browser.i18n.getMessage("resultFailed");
                } else {
                    result.innerHTML = '';
                    generateResult(result, definitions);
                }
            }, function () {
                result.textContent = browser.i18n.getMessage("resultFailed");
            });
        }
    }

    // Translate text and create dropdown items
    search.placeholder = browser.i18n.getMessage("popup_placeholder");
    go.textContent = browser.i18n.getMessage("popup_button");
    var translations = settings.get('translation.list');
    for (var i = 0; i < translations.length; i++) {
        var translation = translations[i];
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
