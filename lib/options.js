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

var EXPORTED_SYMBOLS = ["SearchDictCC_Options"];

///////////////////
// Imports

Components.utils.import("resource://searchdictcc-modules/helpers.jsm");
Components.utils.import("resource://searchdictcc-modules/prefs.jsm");

///////////////////
// Private variables

var strings = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://searchdictcc/locale/shared.properties");
var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
var mediatorService = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
var contextEnabled;
var contextShowFirst;
var contextMethod;
var contextMultiWindow;
var quickEnabled;
var quickSelected;
var quickRight;
var quickCtrl;
var quickShift;
var quickAlt;
var quickMethod;
var quickMultiWindow;
var quickFixGestures;
var translationsList;
var document = null;
var instantApply = false;

///////////////////
// Private methods

function alert(message) {
	var wnd = mediatorService.getMostRecentWindow("searchdict_options");
	promptService.alert(wnd, 'Error', message);
}

function confirm(message) {
	var wnd = mediatorService.getMostRecentWindow("searchdict_options");
	return promptService.confirm(wnd, 'Are you sure?', message);
}

function prompt(message, value) {
	var wnd = mediatorService.getMostRecentWindow("searchdict_options");
	var out = { value: value };
	var outCheck = { value: false };
	if(promptService.prompt(wnd, 'Please enter..', message, out, null, outCheck))
		return out.value;
	return null;
}

function updateInstantApply() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("browser.preferences.");
	instantApply = prefs.getBoolPref("instantApply");			
}

function saveTranslations() {
	var out = '';
	var list = new Array();
	var entries = translationsList.getElementsByTagName('listitem');
	for(var i = 0; i < entries.length; i++){
		var columns = entries[i].getElementsByTagName('listcell');
		list.push({ subdomain: columns[1].getAttribute('label'), label: columns[0].getAttribute('label') });
	}
	Prefs.setTranslations(list);
}

function addEntry(label, subdomain) {
	var row = document.createElement('listitem');
	var cell = document.createElement('listcell');
	cell.setAttribute('label', label);
	row.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', subdomain);
	row.appendChild(cell);

	translationsList.appendChild(row);
	if(instantApply)
		saveTranslations();
}

function callbackLanguages(responseText) {
	if(responseText == null) {
		document.getElementById("secondLanguage").disabled = false;
		document.getElementById("updateProgress").hidden = true;
		document.getElementById("update").hidden = false;
		alert(strings.GetStringFromName("refreshFailed"));
		return;
	}
	
	// For some reason, parseHTML will remove relative hrefs, so we'll need to make it absolute first.
	var hrefPrefixShort = './?action=buildup&targetlang=';
	var hrefPrefixLong = 'http://contribute.dict.cc/?action=buildup&targetlang=';
	while(responseText.indexOf(hrefPrefixShort) != -1)
		responseText = responseText.replace(hrefPrefixShort, hrefPrefixLong);

	var htmlDoc = Helpers.parseHTML(document, responseText);
	var elements = htmlDoc.getElementsByTagName("a");
	var list = new Array();
	for(var i=0; i<elements.length; i++) {
		if(elements[i].href.indexOf(hrefPrefixLong) == 0) {
			var lang = elements[i].href.substring(hrefPrefixLong.length);
			var name = elements[i].textContent;
			list.push({ target: lang, label: name });
		}
	}
	Prefs.setLanguages(list);

	SearchDictCC_Options.updateSecondLanguageList();
	document.getElementById("secondLanguage").disabled = false;
	document.getElementById("updateProgress").hidden = true;
	document.getElementById("update").hidden = false;
}

///////////////////
// Public interface

/**
 * SearchDictCC_Options public interface
 */
var SearchDictCC_Options = {
	init : function(doc) { document = doc; },
	onLoad : function () {
		updateInstantApply();
		
		contextEnabled = document.getElementById('contextEnabled');
		contextShowFirst = document.getElementById('contextShowFirst');
		contextMethod = document.getElementById('contextMethod');
		contextMultiWindow = document.getElementById('contextMultiWindow');
		quickEnabled = document.getElementById('quickEnabled');
		quickSelected = document.getElementById('quickSelected');
		quickRight = document.getElementById('quickRight');
		quickCtrl = document.getElementById('quickCtrl');
		quickShift = document.getElementById('quickShift');
		quickAlt = document.getElementById('quickAlt');
		quickMethod = document.getElementById('quickMethod');
		quickMultiWindow = document.getElementById('quickMultiWindow');
		quickFixGestures = document.getElementById('quickFixGestures');

		translationsList = document.getElementById('translations');
		translationsList.addEventListener('dblclick', SearchDictCC_Options.onEdit, true);
		translationsList.addEventListener('keypress', SearchDictCC_Options.onKeyPress, true);

		var translations = Prefs.getTranslations();
		for(var i = 0; i < translations.length; i++){
			var row = document.createElement('listitem');
			var cell = document.createElement('listcell');
			cell.setAttribute('label', translations[i].label);
			row.appendChild(cell);

			cell = document.createElement('listcell');
			cell.setAttribute('label', translations[i].subdomain);
			row.appendChild(cell);

			translationsList.appendChild(row);
		}
		SearchDictCC_Options.updateEnabledItems();

		var menu = document.getElementById("firstLanguagePopup");
		menu.childNodes[0].setAttribute('label', strings.GetStringFromName("language_en"));
		menu.childNodes[1].setAttribute('label', strings.GetStringFromName("language_de"));
		
		SearchDictCC_Options.updateSecondLanguageList();
	},
	
	show : function(window) {
		var wnd = mediatorService.getMostRecentWindow("searchdict_options");
		if (wnd) {
			try { wnd.focus(); } catch (e) {}
		} else {
			updateInstantApply();
			var features = "chrome,titlebar,toolbar,centerscreen" + (instantApply ? ",dialog=no" : ",modal");
			window.openDialog("chrome://searchdictcc/content/options.xul", "dictcc-preferences-dialog", features);
		}
	},

	onBeforeAccept : function () {
		return !quickEnabled.checked  || quickCtrl.checked || quickShift.checked || quickAlt.checked;
	},

	onAccept : function () {
		var result = SearchDictCC_Options.onBeforeAccept();
		if(!result) {
			alert(strings.GetStringFromName("noQuickKeys"));
		} else {
			saveTranslations();
		}
		return result;
	},

	onAdd : function () {
		var firstLanguage = document.getElementById("firstLanguage").selectedIndex;
		var secondLanguage = document.getElementById("secondLanguage").selectedIndex;
		var direction = document.getElementById("languageDirection").selectedIndex;

		var subdomain = '';
		var label = '';
		if(secondLanguage == 0) {
			if(direction == 0) {
				subdomain = 'www';
				label = 'DE<>EN';
			} else if((firstLanguage == 0 && direction == 1) || (firstLanguage == 1 && direction == 2)) {
				subdomain = 'en-de';
				label = 'EN->DE';
			} else {
				subdomain = 'de-en';
				label = 'DE->EN';
			}
		} else {
			var languages = Prefs.getLanguages();
			var first;
			if(firstLanguage == 0)
				first = { target: 'EN', label: strings.GetStringFromName("language_en")};
			else if(firstLanguage == 1)
				first = { target: 'DE', label: strings.GetStringFromName("language_de")};
			else
				first = languages[firstLanguage-1];
			var second = languages[secondLanguage-1];

			if(direction == 0) {
				subdomain = first.target.toLowerCase() + second.target.toLowerCase();
				label = first.target.toUpperCase() + '<>' + second.target.toUpperCase();
			} else if(direction == 1) {
				subdomain = first.target.toLowerCase() + '-' + second.target.toLowerCase();
				label = first.target.toUpperCase() + '->' + second.target.toUpperCase();
			} else {
				subdomain = second.target.toLowerCase() + '-' + first.target.toLowerCase();
				label = second.target.toUpperCase() + '->' + first.target.toUpperCase();
			}
		}
		label = prompt(strings.GetStringFromName("enterLabel"), label);
		if(label)
			addEntry(label, subdomain);
	},
	
	onManualAdd : function () {
		var subdomain = prompt(strings.GetStringFromName("enterSubdomain"), "www");
		if(!subdomain) {
			return;
		}
		var label = prompt(strings.GetStringFromName("enterLabel"), "DE=>EN");
		if(!label) {
			return;
		}
		addEntry(label, subdomain);
	},

	onRemove : function () {
		var entry = translationsList.selectedItem;
		if(entry) {
			var columns = entry.getElementsByTagName('listcell');
			if(confirm("Do you really want to delete the entry '" + columns[0].getAttribute('label') + "'")) {
				entry.parentNode.removeChild(entry);
				if(instantApply)
					saveTranslations();
			}
		}
	},

	onRemoveAll : function () {
		if(confirm("Do you really want to remove all entries?")) {
			while(translationsList.childNodes.length > 1) {
				translationsList.removeChild(translationsList.childNodes[translationsList.childNodes.length-1]);
			}
			if(instantApply)
				saveTranslations();
		}
	},

	onEdit : function () {
		var entry = translationsList.selectedItem;
		if(entry) {
			var columns = entry.getElementsByTagName('listcell');
			var label = prompt(strings.GetStringFromName("enterLabel"), columns[0].getAttribute('label'));
			if(!label) {
				return;
			}
			columns[0].setAttribute('label', label);

			if(instantApply)
				saveTranslations();
		}
	},

	onKeyPress : function (e) {
		if(e.keyCode == 46)
			SearchDictCC_Options.onRemove();
	},

	onMoveUp : function () {
		var entry = translationsList.selectedItem;
		if(entry && entry.previousSibling && entry.previousSibling.tagName == 'listitem') {
			var before = entry.previousSibling;
			translationsList.removeChild(entry);
			translationsList.insertBefore(entry, before);
			translationsList.selectedItem = entry;
			if(instantApply)
				saveTranslations();
		}
	},

	onMoveDown : function () {
		var entry = translationsList.selectedItem;
		if(entry && entry.nextSibling && entry.nextSibling.tagName == 'listitem') {
			var next = entry.nextSibling;
			translationsList.removeChild(next);
			translationsList.insertBefore(next, entry);
			translationsList.selectedItem = entry;
			if(instantApply)
				saveTranslations();
		}
	},

	onRefresh : function () {
		document.getElementById("secondLanguage").disabled = true;
		document.getElementById("updateProgress").hidden = false;
		document.getElementById("update").hidden = true;
		Helpers.getUrlContent('http://contribute.dict.cc/?action=buildup', callbackLanguages);
	},

	updateSecondLanguageList : function() {
		var parentMenu = document.getElementById("secondLanguage");
		var menu = document.getElementById("secondLanguagePopup");
		var selection = '';
		if( parentMenu.selectedIndex >= 1 ) {
			selection = menu.childNodes[parentMenu.selectedIndex].getAttribute('label');
		}
		while(menu.childNodes.length > 0) {
			var node = menu.childNodes[menu.childNodes.length-1];
			menu.removeChild(node);
		}

		var menuitem = document.createElement('menuitem');
		if(document.getElementById("firstLanguage").selectedIndex == 0) {
			menuitem.setAttribute('label', strings.GetStringFromName("language_de"));
		} else {
			menuitem.setAttribute('label', strings.GetStringFromName("language_en"));
		}
		menu.insertBefore(menuitem, null);

		var selectedIndex = 0;
		var languages = Prefs.getLanguages();
		for(var i =0; i < languages.length; i++){
			var menuitem = document.createElement('menuitem');
			var label = '';

			try { label = strings.GetStringFromName("language_"+languages[i].target.toLowerCase()); } catch(e) {}
			if(!label || label == '')
				label = languages[i].label;
			menuitem.setAttribute('label', label);
			if(selection == languages[i].label) {
				selectedIndex = i+1;
			}
			menu.insertBefore(menuitem, null);
		}
		parentMenu.selectedIndex = selectedIndex;
	},

	updateEnabledItems : function () {
		contextShowFirst.disabled = !contextEnabled.checked;
		contextMethod.disabled = !contextEnabled.checked;
		contextMultiWindow.disabled = !contextEnabled.checked;
		quickSelected.disabled = !quickEnabled.checked;
		quickRight.disabled = !quickEnabled.checked;
		quickCtrl.disabled = !quickEnabled.checked;
		quickShift.disabled = !quickEnabled.checked;
		quickAlt.disabled = !quickEnabled.checked;
		quickMethod.disabled = !quickEnabled.checked;
		quickMultiWindow.disabled = !quickEnabled.checked || quickMethod.value == 3;
		quickFixGestures.disabled = !quickEnabled.checked;
	}
};
