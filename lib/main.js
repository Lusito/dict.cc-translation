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

var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var simplePrefs = require("sdk/simple-prefs");

var contextMenu = require('./contextmenu');
var translator = require('./translator');

var pageModPrefs = [
    "quick.enabled",
    "quick.right",
    "quick.ctrl",
    "quick.shift",
    "quick.alt",
    "quick.selected",
    "quick.fixGestures",
    "quick.rocker"
];

pageMod.PageMod({
    include: "*",
    contentScriptWhen: 'start',
    contentScriptFile: self.data.url("pagemod.js"),
    attachTo: ["existing", "top", "frame"],
    onAttach: function (worker) {
        worker.port.on('setWordUnderCursor', function (word, x, y) {
            contextMenu.setWordUnderCursor(word, x, y);
        });
        worker.port.on("requestQuickTranslation", function (x, y, text, showMenu) {
            translator.runQuick(x, y, text, showMenu);
        });
        worker.port.on("init", function () {
            function configure() {
                worker.port.emit('configure', {
                    selected: simplePrefs.prefs['quick.selected'],
                    quickEnabled: simplePrefs.prefs['quick.enabled'],
                    ctrl: simplePrefs.prefs['quick.ctrl'],
                    shift: simplePrefs.prefs['quick.shift'],
                    alt: simplePrefs.prefs['quick.alt'],
                    menu: simplePrefs.prefs['quick.right'],
                    fixGestures: simplePrefs.prefs['quick.fixGestures'],
                    rocker: simplePrefs.prefs['quick.rocker']
                });
            }
            configure();
            for (var i = 0; i < pageModPrefs.length; i++)
                simplePrefs.on(pageModPrefs[i], configure);

            worker.on('detach', function () {
                for (var i = 0; i < pageModPrefs.length; i++)
                    simplePrefs.removeListener(pageModPrefs[i], configure);
            });
        });
    }
});
