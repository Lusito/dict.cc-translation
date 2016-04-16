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
var translator = require("./translator");

exports.create = function(x, y, onInit) {
    var p = panel.Panel({
        position: {
            left: x,
            top: y
        },
        width: 50,
        height: 20,
        contentURL: self.data.url('minilayer.html'),
        contentScriptWhen: 'ready',
        contentScriptFile: self.data.url('minilayer.js')
    });
    p.port.on('init', function (w, h) {
        p.resize(w, h);
        onInit(p);
    });
    p.port.on('resize', function (w, h) {
        p.resize(w, h);
    });
    p.port.on('requestTranslation', function(text, subdomain) {
        translator.loadTranslation(p, text, subdomain);
    });
    p.show();
};
