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

/* global browser */

function byId(id) {
    return document.getElementById(id);
}

function on(node, event, callback) {
    node.addEventListener(event, callback);
}

function translateElement(element) {
    var id = element.dataset.l10nId;
    var content = browser.i18n.getMessage(id);
    if (content)
        element.textContent = content;
    var title = browser.i18n.getMessage(id + "__title");
    if (title)
        element.title = title;
}

function translateChildren(parent) {
    var elements = parent.querySelectorAll('[data-l10n-id]');
    for (var i = 0; i < elements.length; i++) {
        translateElement(elements[i]);
    }
}

function removeAllChildren(node) {
    if (node.hasChildNodes()) {
        while (node.childNodes.length >= 1)
            node.removeChild(node.firstChild);
    }
}
function createElement(doc, parent, tagName, params) {
    var e = doc.createElement(tagName);
    if (params) {
        for (var key in params) {
            e[key] = params[key];
        }
    }
    if (parent)
        parent.appendChild(e);
    return e;
}

function addLink(doc, path) {
    var head = doc.querySelector('head');
    createElement(doc, head, 'link', {
        href: browser.runtime.getURL(path),
        type: "text/css",
        rel: "stylesheet"
    });
}
