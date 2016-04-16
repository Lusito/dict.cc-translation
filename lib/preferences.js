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

var storedPreferences = {
    "translation.list": "www{|}DE<>EN{!}en-de{|}EN->DE{!}de-en{|}DE->EN{!}enpl{|}EN<>PL{!}ennl{|}EN<>NL{!}deit{|}DE<>IT{!}dept{|}DE<>PT",
    "translation.languages": "SQ{|}Albanian{!}BS{|}Bosnian{!}BG{|}Bulgarian{!}HR{|}Croatian{!}CS{|}Czech{!}DA{|}Danish{!}NL{|}Dutch{!}EO{|}Esperanto{!}FI{|}Finnish{!}FR{|}French{!}EL{|}Greek{!}HU{|}Hungarian{!}IS{|}Icelandic{!}IT{|}Italian{!}NO{|}Norwegian{!}PL{|}Polish{!}PT{|}Portuguese{!}RO{|}Romanian{!}RU{|}Russian{!}SR{|}Serbian{!}SK{|}Slovak{!}ES{|}Spanish{!}SV{|}Swedish{!}TR{|}Turkish{!}LA{|}Latin",
    "context.enabled": true,
    "context.showFirst": true,
    "context.method": 3,
    "context.multiWindow": false,
    "quick.enabled": true,
    "quick.right": true,
    "quick.ctrl": true,
    "quick.shift": true,
    "quick.alt": false,
    "quick.selected": true,
    "quick.method": 3,
    "quick.multiWindow": false,
    "quick.fixGestures": false
}

function init() {

}

init();
var translations = null;
exports.getTranslations = function () {
    if (translations === null) {
        translations = new Array();
        var value = storedPreferences["translation.list"];
        var parts = value.split("{!}");
        for (var i = 0; i < parts.length; i++) {
            var entry = parts[i].split("{|}");
            if (entry.length === 2)
                translations.push({subdomain: entry[0], label: entry[1]});
        }
    }
    return translations;
};
exports.get = function(key) {
    return storedPreferences[key];
};
