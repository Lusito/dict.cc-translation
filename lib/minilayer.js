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

var panel = require("sdk/panel");
var self = require("sdk/self");
var translator = require("./translator");
var core = require("sdk/view/core");
var timers = require("sdk/timers");

var miniPanel;
var miniPanelView;
var lastClose = null;

exports.create = function (x, y, onInit) {
    var currentTime = new Date().getTime();
    if (miniPanel) {
        miniPanel.resize(50, 20);
        onInit(miniPanel);
    } else {
        miniPanel = panel.Panel({
            width: 50,
            height: 20,
            contentURL: self.data.url('minilayer.html'),
            contentScriptWhen: 'ready',
            contentScriptFile: self.data.url('minilayer.js'),
            onHide: function () {
                lastClose = currentTime;
            }
        });
        miniPanelView = core.getActiveView(miniPanel);

        miniPanel.port.on('init', function () {
            onInit(miniPanel);
        });
        miniPanel.port.on('resize', function (w, h) {
            miniPanel.resize(w, h);
        });
        miniPanel.port.on('requestTranslation', function (text, languagePair) {
            translator.loadTranslation(miniPanel, text, languagePair);
        });
        miniPanel.port.on('requestFullTranslation', function (href) {
            miniPanel.hide();
            translator.showFullMicroTranslation(href);
        });
    }

    // delay, since the panel won't show while it's fading out.
    var delay = lastClose !== null && (currentTime - lastClose) < 200;
    timers.setTimeout(function () {
        miniPanel.show();
        miniPanelView.moveTo(x, y);
    }, delay ? 0 : 200);
};
