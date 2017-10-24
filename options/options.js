/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Lusito)
 
 * This file is part of the dict.cc web-extension.
 
 * This web-extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 
 * This web-extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 
 * You should have received a copy of the GNU General Public License
 * along with this web-extension.  If not, see http://www.gnu.org/licenses/.
 
 * ***** END LICENSE BLOCK ***** */

/* global byId, settings, request, messageUtil, isFirefox */

var preferenceElements = {};
var translationList = byId('translation_list');
var firstLanguage = byId('firstLanguage');
var secondLanguage = byId('secondLanguage');
var languageDirection = byId('languageDirection');
var selectedTranslationRow = null;

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

function initializePreferenceElements() {
    var checkboxIds = [
        "context_enabled",
        "context_simple",
        "context_multiWindow",
        "quick_enabled",
        "quick_right",
        "quick_ctrl",
        "quick_shift",
        "quick_alt",
        "quick_selected",
        "quick_multiWindow",
        "quick_rocker",
        "translation_useHttps"
    ];
    var radioNames = [
        "context_method",
        "quick_method",
        "micro_method"
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

function translationsToJSON() {
    var list = [];
    var rows = translationList.children;
    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].children;
        list.push({k: cells[1].textContent, v: cells[0].textContent});
    }
    return list;
}

function addTranslationRow(label, languagePair) {
    var row = document.createElement('tr');
    translationList.appendChild(row);

    var cell0 = document.createElement('td');
    cell0.textContent = label;
    row.appendChild(cell0);

    var cell1 = document.createElement('td');
    cell1.textContent = languagePair;
    row.appendChild(cell1);

    on(row, 'click', function () {
        var actives = document.querySelectorAll('#translation_list .active');
        for (var i = 0; i < actives.length; i++)
            actives[i].className = '';
        selectedTranslationRow = row;
        row.className = 'active';
    });
    on(row, 'dblclick', function () {
        startLabelEdit(row);
    });
}

function translationsFromJSON(list) {
    selectedTranslationRow = null;
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

    secondLanguage.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        var option = document.createElement('option');
        option.value = entry.k;
        option.textContent = entry.v;
        secondLanguage.appendChild(option);
    }
}

function languagesToJSON() {
    var list = [];
    var options = secondLanguage.children;
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.value !== 'DE' && option.value !== 'EN')
            list.push({k: option.value, v: option.textContent});
    }
    return list;
}

function languagesFromJSON(value) {
    setLanguageList(value);
}

function loadPreferences() {
    for (var key in preferenceElements) {
        var value = settings.get(key);
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

    translationsFromJSON(settings.get("translation.list"));
    languagesFromJSON(settings.get("translation.languages"));
    updateWarnings();
}

function storePreferences() {
    for (var key in preferenceElements) {
        var el = preferenceElements[key];
        if (el.parentElement)
            settings.set(key, el.checked);
        else {
            for (var i = 0; i < el.length; i++) {
                var radio = el[i];
                if (radio.checked)
                    settings.set(key, parseInt(radio.value));
            }
        }
    }

    settings.set("translation.list", translationsToJSON());
    settings.set("translation.languages", languagesToJSON());
    settings.save();
}

function setElementsDisabled(elements, disabled) {
    for (var i = 0; i < elements.length; i++)
        elements[i].disabled = disabled;
}

function updateDisabledElements() {
    var modifierElements = [
        byId("quick_ctrl"),
        byId("quick_shift"),
        byId("quick_alt")
    ];
    var quickElements = [
        byId("quick_method0"),
        byId("quick_method1"),
        byId("quick_method2"),
        byId("quick_method3"),
        byId("micro_method0"),
        byId("micro_method1"),
        byId("micro_method2"),
        byId("quick_selected"),
        byId("quick_right"),
        byId("quick_multiWindow")
    ];
    var contextElements = [
        byId("context_simple"),
        byId("context_method0"),
        byId("context_method1"),
        byId("context_method2"),
        byId("context_method3"),
        byId("context_multiWindow")
    ];
    var microMethodElements = [
        byId("micro_method0"),
        byId("micro_method1"),
        byId("micro_method2")
    ];

    var quickEnabled = byId("quick_enabled").checked;
    setElementsDisabled(modifierElements, !quickEnabled);
    var quickRocker = byId("quick_rocker").checked;
    setElementsDisabled(quickElements, !quickEnabled && !quickRocker);
    if (quickEnabled || quickRocker) {
        if (!byId('quick_method3').checked)
            setElementsDisabled(microMethodElements, true);
        var microMethod2 = byId('micro_method2');
        if (!byId('quick_method2').checked && (microMethod2.disabled || !microMethod2.checked))
            byId("quick_multiWindow").disabled = true;
    }
    var contextEnabled = byId("context_enabled").checked;
    setElementsDisabled(contextElements, !contextEnabled);
    if (contextEnabled) {
        if (!byId('context_method2').checked)
            byId("context_multiWindow").disabled = true;
    }
}

function initializeDisabledConnections() {
    var elementsDisabling = [
        byId("context_enabled"),
        byId("quick_enabled"),
        byId("quick_rocker"),
        byId("quick_method0"),
        byId("quick_method1"),
        byId("quick_method2"),
        byId("quick_method3"),
        byId("micro_method0"),
        byId("micro_method1"),
        byId("micro_method2"),
        byId("context_method0"),
        byId("context_method1"),
        byId("context_method2"),
        byId("context_method3")
    ];
    for (var i = 0; i < elementsDisabling.length; i++) {
        on(elementsDisabling[i], 'click', updateDisabledElements);
    }
}

var updateWarnings = function () {};

function initializeWarningConnections() {
    var quick_ctrl = byId("quick_ctrl");
    var quick_shift = byId("quick_shift");
    var quick_alt = byId("quick_alt");
    var quick_right = byId("quick_right");

    var quick_warning_shift = byId("quick_warning_shift");
    var quick_warning_alt = byId("quick_warning_alt");
    updateWarnings = function () {
        var warnShift = quick_shift.checked && quick_right.checked && !quick_ctrl.checked && !quick_alt.checked;
        var warnAlt = quick_alt.checked && !quick_ctrl.checked && !quick_shift.checked;
        quick_warning_shift.style.display = warnShift ? 'block' : 'none';
        quick_warning_alt.style.display = warnAlt ? 'block' : 'none';
    };
    updateWarnings();
    on(quick_ctrl, 'click', updateWarnings);
    on(quick_shift, 'click', updateWarnings);
    on(quick_alt, 'click', updateWarnings);
    on(quick_right, 'click', updateWarnings);
}

function startLabelEdit(row) {
    var cell = row.children[0];
    prompt('enterLabel', cell.textContent, function (value) {
        if (value)
            cell.textContent = value;
    });
}

function initializeTranslationButtons() {
    on(byId('moveUp'), 'click', function () {
        if (selectedTranslationRow) {
            var prev = selectedTranslationRow.previousElementSibling;
            if (prev) {
                var parent = selectedTranslationRow.parentElement;
                parent.insertBefore(selectedTranslationRow, prev);
            }
        }
    });
    on(byId('moveDown'), 'click', function () {
        if (selectedTranslationRow) {
            var next = selectedTranslationRow.nextElementSibling;
            if (next) {
                var parent = selectedTranslationRow.parentElement;
                parent.insertBefore(selectedTranslationRow, next.nextElementSibling);
            }
        }
    });
    on(byId('editLabel'), 'click', function () {
        var row = selectedTranslationRow;
        if (row)
            startLabelEdit(row);
    });
    on(byId('remove'), 'click', function () {
        var row = selectedTranslationRow;
        if (row) {
            var label = row.children[0].textContent;
            confirm('confirm_delete', null, label, function (result) {
                if (result) {
                    selectedTranslationRow = row.nextElementSibling || row.previousElementSibling;
                    if (selectedTranslationRow)
                        selectedTranslationRow.className = 'active';
                    row.parentElement.removeChild(row);
                }
            });
        }
    });
    on(byId('clear'), 'click', function () {
        confirm('confirm_delete', 'confirm_removeAll', null, function (result) {
            if (result)
                translationList.innerHTML = '';
        });
    });
    on(byId('manual'), 'click', function () {
        prompt('enterLanguagePair', "de-en", function (languagePair) {
            if (languagePair) {
                prompt('enterLabel', "DE=>EN", function (label) {
                    if (label)
                        addTranslationRow(label, languagePair);
                });
            }
        });
    });
    on(byId('refresh'), 'click', function () {
        setLanguageLoading(true);
        requestLanguageUpdate();
    });
    on(byId('add'), 'click', function () {
        var first = firstLanguage.value;
        var second = secondLanguage.value;
        var dir = languageDirection.value;

        var label, languagePair;
        if (dir === 'both') {
            languagePair = first.toLowerCase() + second.toLowerCase();
            label = first.toUpperCase() + '<>' + second.toUpperCase();
        } else if (dir === 'second') {
            languagePair = first.toLowerCase() + '-' + second.toLowerCase();
            label = first.toUpperCase() + '->' + second.toUpperCase();
        } else {
            languagePair = second.toLowerCase() + '-' + first.toLowerCase();
            label = second.toUpperCase() + '->' + first.toUpperCase();
        }
        prompt('enterLabel', label, function (value) {
            if (value)
                addTranslationRow(value, languagePair);
        });
    });
}

function setLanguageLoading(loading) {
    secondLanguage.disabled = loading;
    byId('loadingIndicator').style.width = byId('refresh').clientWidth + 'px';
    byId('refresh').style.display = loading ? 'none' : '';
    byId('loadingIndicator').style.display = loading ? 'block' : '';
}

function onLanguageListUpdate(languages) {
    setLanguageLoading(false);
    if (languages && languages.length > 0)
        setLanguageList(languages);
    else
        alert('alert_title_error', 'refreshFailed');
}

function requestLanguageUpdate() {
    var protocol = byId('translation_useHttps').checked ? 'https://' : 'http://';
    var url = protocol + 'contribute.dict.cc/?action=buildup';
    var hrefPrefix = protocol + 'contribute.dict.cc/?action=buildup&targetlang=';
    request.getHTML(url, function (doc) {

        var elements = doc.getElementsByTagName("a");
        var list = new Array();
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].href.indexOf(hrefPrefix) === 0) {
                var lang = elements[i].href.substring(hrefPrefix.length);
                var name = elements[i].textContent;
                list.push({k: lang, v: name});
            }
        }
        onLanguageListUpdate(list);
    }, function () {
        onLanguageListUpdate(null);
    });
}

on(byId('restore_defaults'), 'click', function () {
    confirm('confirm_restore_defaults', "confirm_restore_defaults_content", null, function (result) {
        if (result) {
            settings.restoreDefaults();
            byId('save').focus();
        }
    });
});

on(byId('save'), 'click', function () {
    if (!byId('quick_enabled').checked || byId('quick_ctrl').checked
            || byId('quick_shift').checked || byId('quick_alt').checked) {
        storePreferences();
        if(!isFirefox)
            window.close();
    } else {
        alert('alert_title_error', 'noQuickKeys');
    }
});

on(byId('cancel'), 'click', function () {
    if(isFirefox) {
        loadPreferences();
        updateDisabledElements();
    } else {
        window.close();
    }
});

translateChildren(document);
initializeTabs();
initializePreferenceElements();
initializeDisabledConnections();
initializeTranslationButtons();
if (isFirefox)
    initializeWarningConnections();
else
    byId('quick_warning_chrome').style.display = '';
byId('save').focus();

if(isFirefox)
    document.body.className += "firefox";

settings.onReady(function () {
    loadPreferences();
    updateDisabledElements();
    messageUtil.receive('settingsChanged', function () {
        loadPreferences();
        updateDisabledElements();
    });
});