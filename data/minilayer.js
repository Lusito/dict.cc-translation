/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Lusito)
 
 * This file is part of The Firefox Dict.cc Addon.
 
 * The Firefox Dict.cc Addon is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 
 * The Firefox Dict.cc Addon is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 
 * You should have received a copy of the GNU General Public License
 * along with The Firefox Dict.cc Addon.  If not, see http://www.gnu.org/licenses/.
 
 * ***** END LICENSE BLOCK ***** */

function updateSize() {
    var last = document.body.className;
    document.body.className += ' measuring';
    self.port.emit('resize', document.body.scrollWidth, document.body.scrollHeight);
    document.body.className = last;
}

var miniResults = document.getElementById('result');
var miniExtra = document.getElementById('extra');

function setupMiniLayer(text, extraNodes) {
    removeAllChildren(miniResults);
    if (text)
        miniResults.appendChild(document.createTextNode(text));
    else
        miniResults.innerHTML = '';
    if (!extraNodes) {
        document.body.className = '';
    } else {
        document.body.className = 'menu';
        removeAllChildren(miniExtra);
        for (var i = 0; i < extraNodes.length; i++)
            miniExtra.appendChild(extraNodes[i]);
    }
}

function removeAllChildren(node) {
    if (node.hasChildNodes()) {
        while (node.childNodes.length >= 1)
            node.removeChild(node.firstChild);
    }
}

function createMenuEntry(text, translation) {
    var link = document.createElement("a");
    var languagePair = translation.k;
    link.addEventListener("click", function () {
        self.port.emit("menuEntryClick", text, languagePair);
    }, false);
    link.textContent = translation.v;
    return link;
}

function showMenu(label, text, translations) {
    var extraNodes = new Array();
    for (var i = 0; i < translations.length; i++) {
        var raquo = document.createElement('span');
        raquo.innerHTML = '&#187; ';
        extraNodes.push(raquo);
        extraNodes.push(createMenuEntry(text, translations[i]));
        extraNodes.push(document.createElement("br"));
    }
    setupMiniLayer(label, extraNodes);
    updateSize();
}
function createResultEntry(def) {
    var link = document.createElement("a");
    link.addEventListener("click", function () {
        self.port.emit("resultClick", def.href);
    }, false);
    link.textContent = def.label;
    if(def.style)
        link.style = def.style;
    return link;
}
function showResult(text, links) {
    var hasResults = links && links.length > 0;
    setupMiniLayer(text, null);
    if (hasResults) {
        for (var i = 0; i < links.length; i++) {
            var link = createResultEntry(links[i]);
            miniResults.appendChild(link);
            if (i < (links.length - 1))
                miniResults.appendChild(document.createTextNode(", "));
        }
    }
    updateSize();
}

function showMessage(text) {
    setupMiniLayer(text, null);
    updateSize();
}

self.port.on('showMessage', showMessage);
self.port.on('showMenu', showMenu);
self.port.on('showResult', showResult);
self.port.emit('init');
