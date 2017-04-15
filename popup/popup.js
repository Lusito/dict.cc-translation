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

    // All attributes which will be kept during sanitization
    var attributeWhiteList = ['href', 'style', 'align', 'target'];
    // All potentially dangerous tag names as a css-selector
    var tagBlackListSelector = 'script, iframe, svg, link, style, img, base, basefont, object, embed, applet, source, video, audio, canvas, input, form';

    // Remove tags which are in tagBlackListSelector (parent is not checked, as the caller makes sure it's of a different type)
    function sanitizeTags(parent) {
        var elements = parent.querySelectorAll(tagBlackListSelector);
        for (var i = 0; i < elements.length; i++) {
            var e = elements[i];
            e.parentElement.removeChild(e);
        }
    }

    // Makes sure links are sanitary urls (i.e. no javascript code)
    function sanitizeLinks(parent, languagePair) {
        var urlPrefix = getProtocol() + 'www.dict.cc';
        var urlSuffix = '&lp=' + languagePair;
        var links = parent.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            var href = a.getAttribute('href');
            if (href.indexOf('/?') === 0) {
                a.href = urlPrefix + href + urlSuffix;
            } else if (href.indexOf('http') !== 0)  {
                a.href = '#'; // not as expected, could be javascript, so override
            }
            a.target = '_blank';
        }
    }

    // Get an array of all attribute names which are not in the whitelist
    function getUnusedAttributeNames(attributes) {
        var names = [];
        for (var i = 0; i < attributes.length; i++) {
            var name = attributes[i].name;
            if(attributeWhiteList.indexOf(name) === -1)
                names.push(name);
        }
        return names;
    }

    // Removes all attributes on the element we don't use
    function sanitizeAttributesOn(element) {
        var attributes = getUnusedAttributeNames(element.attributes);
        for (var i= 0; i < attributes.length; i++) {
            element.removeAttribute(attributes[i]);
        }
    }

    // Calls sanitizeAttributesOn for parent and all nested children
    function sanitizeAttributes(parent) {
        sanitizeAttributesOn(parent);
        var elements = parent.querySelectorAll('*');
        for (var i = 0; i < elements.length; i++) {
            sanitizeAttributesOn(elements[i]);
        }
    }

    // Makes a request to search pocket.dict.cc with the configured parameters.
    // Sanitizes the resulting HTML and stores (part of) it in the popup html for display only.
    function runSearch() {
        var word = search.value.trim();
        if (word !== '') {
            var languagePair = lp.value;
            var url = getProtocol() + 'pocket.dict.cc/' + createParams(word, languagePair);


            if (result === null)
                result = createElement(document, document.body, 'dl', {id: 'result'});

            result.textContent = browser.i18n.getMessage("loading");
            request.getHTML(url, function (doc) {
                var dl = doc.querySelector("dl");
                if (!dl) {
                    result.textContent = browser.i18n.getMessage("resultFailed");
                } else {
                    sanitizeTags(dl);
                    sanitizeLinks(dl, languagePair);
                    sanitizeAttributes(dl);
                    result.innerHTML = dl.innerHTML;
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