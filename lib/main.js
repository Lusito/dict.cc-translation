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

var self = require("sdk/self");
var pageMod = require("sdk/page-mod");

var contextMenu = require('./contextmenu');
var translator = require('./translator');

pageMod.PageMod({
    include: "*",
    contentScriptFile: self.data.url("pagemod.js"),
    attachTo: ["existing", "top", "frame"],
    onAttach: function (worker) {
        worker.port.on('setWordUnderCursor', function (word) {
            contextMenu.setWordUnderCursor(word);
        });
        worker.port.on("requestQuickTranslation", function (x, y, text, showMenu) {
            translator.runQuick(x, y, text, showMenu)
        });
        worker.port.on("init", function () {
            //Fixme: update when necessary
            worker.port.emit('configure', {
                selected: true,
                quickEnabled: true,
                ctrl: false,
                shift: false,
                alt: true,
                menu: true
            });
        });
    }
});

//fixme: remove on release
var tabs = require("sdk/tabs");
tabs.open({
    url: 'about:debugging',
    inBackground: true
});
