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

var panel = require("sdk/panel");
var self = require("sdk/self");
var simplePrefs = require("sdk/simple-prefs");
var preferencesList = require('../package.json').preferences;

var optionsPanel;
var initialized;

function createPreferences() {
    var result = {};
    for (var i = 0; i < preferencesList.length; i++) {
        var name = preferencesList[i].name;
        result[name] = simplePrefs.prefs[name];
    }
    return result;
}

exports.show = function () {
    if (optionsPanel) {
        optionsPanel.show();
        if (initialized)
            optionsPanel.port.emit('show', createPreferences());
    } else {
        optionsPanel = panel.Panel({
            width: 600,
            height: 400,
            contentURL: self.data.url('options.html'),
            contentScriptFile: self.data.url('options.js')
        });
        optionsPanel.port.on("init", function () {
            initialized = true;
            optionsPanel.port.emit('show', createPreferences());
        });
        optionsPanel.show();
    }
};

simplePrefs.on("options", exports.show);