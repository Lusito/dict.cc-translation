/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Roughael)
 
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

var preferences = {};

function byId(id) {
    return document.getElementById(id);
}
function on(node, event, callback) {
    node.addEventListener(event, callback);
}
var tabs = document.querySelectorAll('#tabs > div');
var pages = document.querySelectorAll('#pages > div');

function linkTab(tab) {
    on(tab, 'click', function() {
        for(var i=0; i<tabs.length; i++) {
            var className = tabs[i] === tab ? 'active' : '';
            tabs[i].className = className;
            pages[i].className = className;
        }
    });
}
for(var i=0; i<tabs.length; i++)
    linkTab(tabs[i]);

self.port.on('show', function (prefs) {
    preferences = prefs;
    console.log(prefs['translation.list']);
});

self.port.emit('init');
