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

var preferences = {};

function byId(id) {
    return document.getElementById(id);
}
function on(node, event, callback) {
    node.addEventListener(event, callback);
}

var preferenceElements = {};
var translationList = byId('translation_list');
var translationLanguages = byId('translation_languages');
var selectedTranslationRow = null;

var checkedDisableElements = {
    "context_enabled": [
        byId("context_method0"),
        byId("context_method1"),
        byId("context_method2"),
        byId("context_showFirst"),
        byId("context_multiWindow")
    ],
    "quick_enabled": [
        byId("quick_ctrl"),
        byId("quick_shift"),
        byId("quick_alt"),
        byId("quick_method0"),
        byId("quick_method1"),
        byId("quick_method2"),
        byId("quick_method3"),
        byId("quick_selected"),
        byId("quick_right"),
        byId("quick_fixGestures"),
        byId("quick_multiWindow")
    ],
    "quick_method0": [],
    "quick_method1": [],
    "quick_method2": [ byId("quick_multiWindow") ],
    "quick_method3": [],
    "context_method0": [],
    "context_method1": [],
    "context_method2": [ byId("context_multiWindow") ]
};

function initializeTabs() {
    var tabs = document.querySelectorAll('#tabs > div');
    var pages = document.querySelectorAll('#pages > div');

    function linkTab(tab) {
        on(tab, 'click', function () {
            for (var i = 0; i < tabs.length; i++) {
                var className = tabs[i] === tab ? 'active' : '';
                tabs[i].className = className;
                pages[i].className = className;
            }
        });
    }
    for (var i = 0; i < tabs.length; i++)
        linkTab(tabs[i]);
}

function initializeTooltips() {
    var tooltip = byId('tooltip');
    var hasTooltip = false;
    //Fixme: show tooltip 1s after move has stopped
    function moveTooltip(x, y) {
        tooltip.style.left = 0;
        tooltip.style.top = 0;
        var width = tooltip.clientWidth;
        var height = tooltip.clientHeight;
        if (y > document.body.clientHeight / 2)
            tooltip.style.top = (y - height) + 'px';
        else
            tooltip.style.top = y + 'px';
        if (x > document.body.clientWidth / 2)
            tooltip.style.left = (x - width - 8) + 'px';
        else
            tooltip.style.left = (x + 15) + 'px';
    }
    function showTooltip(x, y, title) {
        tooltip.textContent = title;
        tooltip.className = 'visible';
        hasTooltip = true;
        moveTooltip(x, y);
    }
    function hideTooltip() {
        tooltip.className = '';
        hasTooltip = false;
    }
    document.body.addEventListener('mousemove', function (e) {
        moveTooltip(e.clientX, e.clientY);
    });
    function registerTooltip(element) {
        element.addEventListener('mouseover', function (e) {
            showTooltip(e.clientX, e.clientY, element.title);
        });
        element.addEventListener('mouseout', hideTooltip);
    }
    var titledElements = document.querySelectorAll('[title]');
    for (var i = 0; i < titledElements.length; i++)
        registerTooltip(titledElements[i]);
}

function initializePreferenceElements() {
    var checkboxIds = [
        "context_enabled",
        "context_showFirst",
        "context_multiWindow",
        "quick_enabled",
        "quick_right",
        "quick_ctrl",
        "quick_shift",
        "quick_alt",
        "quick_selected",
        "quick_multiWindow",
        "quick_fixGestures",
    ];
    var radioNames = [
        "context_method",
        "quick_method"
    ];
    for (var i = 0; i < checkboxIds.length; i++) {
        var id = checkboxIds[i];
        var key = id.replace(/_/g, '.');
        preferenceElements[key] = byId(id);
    }
    for (var i = 0; i < radioNames.length; i++) {
        var name = radioNames[i];
        var key = name.replace(/_/g, '.');
        var radios = document.querySelectorAll('[name=' + name + ']');
        preferenceElements[key] = radios;
    }
}

function serializeTranslations() {
    var list = [];
    var rows = translationList.children;
    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].children;
        list.push({k: cells[1].textContent, v: cells[0].textContent});
    }
    return JSON.stringify(list);
}
function addTranslationRow(label, subdomain) {
    var row = document.createElement('tr');
    translationList.appendChild(row);

    var cell0 = document.createElement('td');
    cell0.textContent = label;
    row.appendChild(cell0);

    var cell1 = document.createElement('td');
    cell1.textContent = subdomain;
    row.appendChild(cell1);
    
    on(row, 'click', function () {
        var actives = document.querySelectorAll('#translation_list .active');
        for (var i = 0; i < actives.length; i++)
            actives[i].className = '';
        selectedTranslationRow = row;
        row.className = 'active';
    });
    on(row, 'dblclick', function () {
        //Fixme: edit label
    });
    
    on(row, 'keypress', function (e) {
        //Fixme: remove
    });
}
function unserializeTranslations(value) {
    selectedTranslationRow = null;
    var list = JSON.parse(value);
    translationList.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        addTranslationRow(entry.v, entry.k);
    }
}
function setLanguageList(list) {
    list.push({k: 'DE', v: 'German'});
    list.push({k: 'EN', v: 'English'});
    list.sort(function (a, b) {
        if (a.v < b.v)
            return -1;
        else if (a.v > b.v)
            return 1;
        else
            return 0;
    });

    translationLanguages.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        var option = document.createElement('option');
        option.value = entry.k;
        option.textContent = entry.v;
        translationLanguages.appendChild(option);
    }
}
function serializeLanguages() {
    var list = [];
    var options = translationLanguages.children;
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if(option.value !== 'DE' && option.value !== 'EN')
            list.push({k: option.value, v: option.textContent});
    }
    return JSON.stringify(list);
}
function unserializeLanguages(value) {
    setLanguageList(JSON.parse(value));
}

function loadPreferences() {
    for (var key in preferenceElements) {
        var value = preferences[key];
        var el = preferenceElements[key];
        if (el.parentElement)
            el.checked = value;
        else {
            for (var i = 0; i < el.length; i++) {
                var radio = el[i];
                radio.checked = parseInt(radio.value) === value;
            }
        }
    }

    unserializeTranslations(preferences["translation.list"]);
    unserializeLanguages(preferences["translation.languages"]);
}

function storePreferences() {
    for (var key in preferenceElements) {
        var el = preferenceElements[key];
        if (el.parentElement)
            preferences[key] = el.checked;
        else {
            for (var i = 0; i < el.length; i++) {
                var radio = el[i];
                if (radio.checked)
                    preferences[key] = parseInt(radio.value);
            }
        }
    }

    preferences["translation.list"] = serializeTranslations();
    preferences["translation.languages"] = serializeLanguages();
}

function updateDisabledElements() {
    for(var key in checkedDisableElements) {
        var elements = checkedDisableElements[key];
        for(var i=0; i<elements.length; i++)
            elements[i].disabled = false;
    }
    for(var key in checkedDisableElements) {
        if(!byId(key).checked) {
            var elements = checkedDisableElements[key];
            for(var i=0; i<elements.length; i++)
                elements[i].disabled = true;
        }
    }
}
function initializeDisabledConnections() {
    for(var key in checkedDisableElements) {
        on(byId(key), 'click', updateDisabledElements);
    }
}

function initializeTranslationButtons() {
    on(byId('moveUp'), 'click', function() {
        if(selectedTranslationRow) {
            var prev = selectedTranslationRow.previousElementSibling;
            if(prev) {
                var parent = selectedTranslationRow.parentElement;
                parent.insertBefore(selectedTranslationRow, prev);
            }
        }
    });
    on(byId('moveDown'), 'click', function() {
        if(selectedTranslationRow) {
            var next = selectedTranslationRow.nextElementSibling;
            if(next) {
                var parent = selectedTranslationRow.parentElement;
                parent.insertBefore(selectedTranslationRow, next.nextElementSibling);
            }
        }
    });
    on(byId('editLabel'), 'click', function() {
    });
    on(byId('remove'), 'click', function() {
        var row = selectedTranslationRow;
        selectedTranslationRow = row.nextElementSibling || row.previousElementSibling;
        if(selectedTranslationRow)
            selectedTranslationRow.className = 'active';
        row.parentElement.removeChild(row);
    });
    on(byId('clear'), 'click', function() {
        translationList.innerHTML = '';
    });
    on(byId('manual'), 'click', function() {
    });
    on(byId('refresh'), 'click', function() {
        self.port.emit('requestLanguageUpdate');
    });
    on(byId('add'), 'click', function() {
    });
}

function setLanguageLoading(loading) {
//		document.getElementById("secondLanguage").disabled = !loading;
//		document.getElementById("updateProgress").hidden = loading;
//		document.getElementById("update").hidden = loading;
}
function onLanguageListUpdate(languages, error) {
    setLanguageLoading(false);
    if(!error)
        setLanguageList(languages);
//    else
//		alert(strings.GetStringFromName("refreshFailed"));
}

initializeTabs();
initializeTooltips();
initializePreferenceElements();
initializeDisabledConnections();
initializeTranslationButtons();

self.port.emit('init');
self.port.on('languageListUpdate', onLanguageListUpdate);

self.port.on('show', function (prefs) {
    preferences = prefs;
    loadPreferences();
    updateDisabledElements();
});

// todo:

//	onBeforeAccept : function () {
//		return !quickEnabled.checked  || quickCtrl.checked || quickShift.checked || quickAlt.checked;
//	},
//
//	onAccept : function () {
//		var result = SearchDictCC_Options.onBeforeAccept();
//		if(!result) {
//			alert(strings.GetStringFromName("noQuickKeys"));
//		} else {
//			saveTranslations();
//		}
//		return result;
//	},

//	onAdd : function () {
//		var firstLanguage = document.getElementById("firstLanguage").selectedIndex;
//		var secondLanguage = document.getElementById("secondLanguage").selectedIndex;
//		var direction = document.getElementById("languageDirection").selectedIndex;
//
//		var subdomain = '';
//		var label = '';
//		if(secondLanguage == 0) {
//			if(direction == 0) {
//				subdomain = 'www';
//				label = 'DE<>EN';
//			} else if((firstLanguage == 0 && direction == 1) || (firstLanguage == 1 && direction == 2)) {
//				subdomain = 'en-de';
//				label = 'EN->DE';
//			} else {
//				subdomain = 'de-en';
//				label = 'DE->EN';
//			}
//		} else {
//			var languages = Prefs.getLanguages();
//			var first;
//			if(firstLanguage == 0)
//				first = { target: 'EN', label: strings.GetStringFromName("language_en")};
//			else if(firstLanguage == 1)
//				first = { target: 'DE', label: strings.GetStringFromName("language_de")};
//			else
//				first = languages[firstLanguage-1];
//			var second = languages[secondLanguage-1];
//
//			if(direction == 0) {
//				subdomain = first.target.toLowerCase() + second.target.toLowerCase();
//				label = first.target.toUpperCase() + '<>' + second.target.toUpperCase();
//			} else if(direction == 1) {
//				subdomain = first.target.toLowerCase() + '-' + second.target.toLowerCase();
//				label = first.target.toUpperCase() + '->' + second.target.toUpperCase();
//			} else {
//				subdomain = second.target.toLowerCase() + '-' + first.target.toLowerCase();
//				label = second.target.toUpperCase() + '->' + first.target.toUpperCase();
//			}
//		}
//		label = prompt(strings.GetStringFromName("enterLabel"), label);
//		if(label)
//			addEntry(label, subdomain);
//	},
//	
//	onManualAdd : function () {
//		var subdomain = prompt(strings.GetStringFromName("enterSubdomain"), "www");
//		if(!subdomain) {
//			return;
//		}
//		var label = prompt(strings.GetStringFromName("enterLabel"), "DE=>EN");
//		if(!label) {
//			return;
//		}
//		addEntry(label, subdomain);
//	},
//
//	onRemove : function () {
//		var entry = translationsList.selectedItem;
//		if(entry) {
//			var columns = entry.getElementsByTagName('listcell');
//			if(confirm("Do you really want to delete the entry '" + columns[0].getAttribute('label') + "'")) {
//				entry.parentNode.removeChild(entry);
//				if(instantApply)
//					saveTranslations();
//			}
//		}
//	},
//
//	onRemoveAll : function () {
//		if(confirm("Do you really want to remove all entries?")) {
//			while(translationsList.childNodes.length > 1) {
//				translationsList.removeChild(translationsList.childNodes[translationsList.childNodes.length-1]);
//			}
//			if(instantApply)
//				saveTranslations();
//		}
//	},
//
//	onEdit : function () {
//		var entry = translationsList.selectedItem;
//		if(entry) {
//			var columns = entry.getElementsByTagName('listcell');
//			var label = prompt(strings.GetStringFromName("enterLabel"), columns[0].getAttribute('label'));
//			if(!label) {
//				return;
//			}
//			columns[0].setAttribute('label', label);
//
//			if(instantApply)
//				saveTranslations();
//		}
//	},

//	onRefresh : function () {
//		document.getElementById("secondLanguage").disabled = true;
//		document.getElementById("updateProgress").hidden = false;
//		document.getElementById("update").hidden = true;
//		Helpers.getUrlContent('http://contribute.dict.cc/?action=buildup', callbackLanguages);
//	},
