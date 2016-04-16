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

var strings = {
    "extensions.searchdictcc@roughael.net.description": "Dict.CC Translation via alt+click or context menu",
    "noQuickKeys": "You need to specify at least one key for the quick click",
    "refreshFailed": "Failed to retrieve language list from dict.cc\nPlease try again later.",
    "loading": "Loading..",
    "translateTo": "Translate to:",
    "resultFailed": "Failed to get translation result",
    "menuSelection": "Translate \"{TEXT}\"",
    "menuNone": "Dict.cc",
    "menuFirstSelection": "Translate \"{TEXT}\": [{LABEL}]",
    "menuFirstNone": "Dict.cc [{LABEL}]",
    "menuOptions": "Options",
    "menuSub": "[{LABEL}]",
    "enterLabel": "Type in the label",
    "enterSubdomain": "Type in the subdomain",
    "language_en": "English",
    "language_de": "German"

};

exports.get = function(key) {
    return strings[key];
}