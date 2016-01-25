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

var EXPORTED_SYMBOLS = ["Prefs"];

///////////////////
// Private variables

var prefs = Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService).getBranch("extensions.searchdictcc.");

/**
 * List of translations
 */
var translations = null;

/**
 * List of languages
 */
var languages = null;

///////////////////
// Public interface

/**
 * Read and Store Preferences
 */
var Prefs = {
	/**
	 * Gets the list of translations
	 * @return a list of {subdomain: value, label: value} entries
	 */
	getTranslations : function() {
		if(translations == null) {
			translations = new Array();
			let value = prefs.getCharPref("translation.list");
			let parts = value.split("{!}");
			for(let i=0; i<parts.length; i++) {
				let entry = parts[i].split("{|}");
				if(entry.length == 2)
					translations.push({ subdomain: entry[0], label: entry[1] });
			}
		}
		return translations;
	},
	
	/**
	 * Sets the list of translations
	 * @param list a list of {subdomain: value, label: value} entries
	 */
	setTranslations : function(list) {
		let result = '';
		for(let i=0; i<list.length; i++) {
			if(i != 0)
				result += '{!}';
			result += list[i].subdomain + '{|}' + list[i].label;
		}
		translations = list;
		prefs.setCharPref("translation.list", result);
	},
	
	/**
	 * Gets the list of languages
	 * @return a list of {target: value, label: value} entries
	 */
	getLanguages : function() {
		if(languages == null) {
			languages = new Array();
			let value = prefs.getCharPref("translation.languages");
			let parts = value.split("{!}");
			for(let i=0; i<parts.length; i++) {
				let entry = parts[i].split("{|}");
				if(entry.length == 2) {
					let obj = {};
					obj.target = entry[0];
					obj.label = entry[1];
					languages.push(obj);
				}
			}
		}
		return languages;
	},
	
	/**
	 * Sets the list of languages
	 * @param list a list of {target: value, label: value} entries
	 */
	setLanguages : function(list) {
		let result = '';
		for(let i=0; i<list.length; i++) {
			if(i != 0)
				result += '{!}';
			result += list[i].target + '{|}' + list[i].label;
		}
		languages = list;
		prefs.setCharPref("translation.languages", result);
	},

	contextEnabled		: function() { return prefs.getBoolPref("context.enabled"); },
	contextShowFirst	: function() { return prefs.getBoolPref("context.showFirst"); },
	contextMethod		: function() { return prefs.getIntPref("context.method"); },
	contextMultiWindow	: function() { return prefs.getBoolPref("context.multiWindow"); },
	
	quickEnabled		: function() { return prefs.getBoolPref("quick.enabled"); },
	quickRight			: function() { return prefs.getBoolPref("quick.right"); },
	quickCtrl			: function() { return prefs.getBoolPref("quick.ctrl"); },
	quickShift			: function() { return prefs.getBoolPref("quick.shift"); },
	quickAlt			: function() { return prefs.getBoolPref("quick.alt"); },
	quickSelected		: function() { return prefs.getBoolPref("quick.selected"); },
	quickMethod			: function() { return prefs.getIntPref("quick.method"); },
	quickMultiWindow	: function() { return prefs.getBoolPref("quick.multiWindow"); },
	fixGestures			: function() { return prefs.getBoolPref("quick.fixGestures"); },
};

