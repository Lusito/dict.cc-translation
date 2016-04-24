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

var _ = require("sdk/l10n").get;
var panel = require("sdk/panel");
var self = require("sdk/self");
var core = require("sdk/view/core");
var simplePrefs = require("sdk/simple-prefs");
var preferencesList = require('../package.json').preferences;
var utils = require('./utils');

var optionsPanel;
var initialized;
var closing;

function createPreferences() {
    var result = {};
    for (var i = 0; i < preferencesList.length; i++) {
        var name = preferencesList[i].name;
        result[name] = simplePrefs.prefs[name];
    }
    return result;
}

exports.show = function () {
    closing = false;
    if (optionsPanel) {
        optionsPanel.show();
        if (initialized)
            optionsPanel.port.emit('show', createPreferences());
    } else {
        optionsPanel = panel.Panel({
            width: 600,
            height: 380,
            contentURL: self.data.url('options.html'),
            contentScriptFile: self.data.url('options.js'),
            onHide: function () {
                if (!closing)
                    optionsPanel.show();
            }
        });
        var view = core.getActiveView(optionsPanel);
        view.setAttribute("noautohide", true);
        view.setAttribute("ignorekeys", true);

        optionsPanel.port.on("init", function () {
            initialized = true;
            optionsPanel.port.emit('show', createPreferences());
        });
        optionsPanel.port.on("cancel", function () {
            closing = true;
            optionsPanel.hide();
        });
        optionsPanel.port.on("save", function (preferences) {
            closing = true;
            optionsPanel.hide();
            for (var key in preferences) {
                simplePrefs.prefs[key] = preferences[key];
            }
        });
        optionsPanel.port.on('requestLanguageUpdate', exports.requestLanguageUpdate);
        optionsPanel.port.on('requestTranslation', function (keys) {
            var result = {};
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                result[key] = _(key);
            }
            optionsPanel.port.emit('translationResult', result);
        });
        optionsPanel.show();
    }
};

simplePrefs.on("options", exports.show);

exports.requestLanguageUpdate = function () {
    if (!optionsPanel)
        return;
    var url = 'http://contribute.dict.cc/?action=buildup';
    var hrefPrefix = 'http://contribute.dict.cc/?action=buildup&targetlang=';
    utils.requestHTML(url, true, function (doc) {

        var elements = doc.getElementsByTagName("a");
        var list = new Array();
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].href.indexOf(hrefPrefix) === 0) {
                var lang = elements[i].href.substring(hrefPrefix.length);
                var name = elements[i].textContent;
                list.push({k: lang, v: name});
            }
        }
        optionsPanel.port.emit('languageListUpdate', list);
    }, function () {
        optionsPanel.port.emit('languageListUpdate', null);
    });
};
