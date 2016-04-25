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

var preferences = {};

function byId(id) {
    return document.getElementById(id);
}
function on(node, event, callback) {
    node.addEventListener(event, callback);
}

var preferenceElements = {};
var translationList = byId('translation_list');
var firstLanguage = byId('firstLanguage');
var secondLanguage = byId('secondLanguage');
var languageDirection = byId('languageDirection');
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
        byId("quick_rocker"),
        byId("quick_fixGestures"),
        byId("quick_multiWindow")
    ],
    "quick_method0": [],
    "quick_method1": [],
    "quick_method2": [byId("quick_multiWindow")],
    "quick_method3": [],
    "context_method0": [],
    "context_method1": [],
    "context_method2": [byId("context_multiWindow")]
};

function createButton(labelL10nKey, callback) {
    var button = document.createElement('button');
    button.setAttribute('data-l10n-id', labelL10nKey);
    on(button, 'click', callback);
    return button;
}

function createDialog(className, titleL10nKey, buttons) {
    var overlay = document.createElement('div');
    overlay.className = 'dialogOverlay';
    var dialog = document.createElement('div');
    dialog.className = 'dialog ' + className;
    var titleNode = document.createElement('h2');
    titleNode.setAttribute('data-l10n-id', titleL10nKey);
    var contentNode = document.createElement('div');
    var buttonsNode = document.createElement('div');
    buttonsNode.className = 'dialogButtons';
    dialog.appendChild(titleNode);
    dialog.appendChild(contentNode);
    dialog.appendChild(buttonsNode);
    var buttonNodes = {};
    for (var key in buttons) {
        var button = createButton(key, buttons[key]);
        buttonNodes[key] = button;
        buttonsNode.appendChild(button);
    }
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    return {
        domNode: dialog,
        contentNode: contentNode,
        buttonNodes: buttonNodes,
        close: function () {
            document.body.removeChild(overlay);
        }
    };
}

function alert(titleL10nKey, contentL10nKey, content, callback) {
    var dialog = createDialog('alert', titleL10nKey, {
        'alert_ok': function () {
            dialog.close();
            if (callback)
                callback();
        }
    });
    if (contentL10nKey)
        dialog.contentNode.setAttribute('data-l10n-id', contentL10nKey);
    if (content)
        dialog.contentNode.textContent = content;
    var l10n = ['alert_ok', titleL10nKey];
    if (contentL10nKey)
        l10n.push(contentL10nKey);
    dialog.buttonNodes.alert_ok.focus();
    self.port.emit('requestTranslation', l10n);
}

function confirm(titleL10nKey, contentL10nKey, content, callback) {
    var dialog = createDialog('confirm', titleL10nKey, {
        'confirm_ok': function () {
            dialog.close();
            callback(true);
        },
        'confirm_cancel': function () {
            dialog.close();
            callback(false);
        }
    });
    if (contentL10nKey)
        dialog.contentNode.setAttribute('data-l10n-id', contentL10nKey);
    if (content)
        dialog.contentNode.textContent = content;
    var l10n = ['confirm_ok', 'confirm_cancel', titleL10nKey];
    if (contentL10nKey)
        l10n.push(contentL10nKey);
    dialog.buttonNodes.confirm_ok.focus();
    self.port.emit('requestTranslation', l10n);
}

function prompt(titleL10nKey, value, callback) {
    var input = document.createElement('input');
    input.value = value;
    var dialog = createDialog('prompt', titleL10nKey, {
        'prompt_ok': function () {
            dialog.close();
            callback(input.value);
        },
        'prompt_cancel': function () {
            dialog.close();
            callback(null);
        }
    });
    dialog.contentNode.appendChild(input);
    input.focus();
    on(input, 'keydown', function(e) {
        if(e.keyCode === 13) {
            dialog.close();
            callback(input.value);
        }
    });
    var l10n = ['prompt_ok', 'prompt_cancel', titleL10nKey];
    self.port.emit('requestTranslation', l10n);
}

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
    var tooltipShowTimeoutHandle;
    var showTooltipDelay = 500;
    var lastMouseX, lastMouseY;
    function showTooltip() {
        tooltipShowTimeoutHandle = null;
        if(hasTooltip) {
            tooltip.style.left = 0;
            tooltip.style.top = 0;
            tooltip.className = 'visible';
            var width = tooltip.clientWidth;
            var height = tooltip.clientHeight;
            if (lastMouseY > document.body.clientHeight / 2)
                tooltip.style.top = (lastMouseY - height) + 'px';
            else
                tooltip.style.top = lastMouseY + 'px';
            if (lastMouseX > document.body.clientWidth / 2)
                tooltip.style.left = (lastMouseX - width - 8) + 'px';
            else
                tooltip.style.left = (lastMouseX + 15) + 'px';
        }
    }
    function moveTooltip(x, y) {
        if(tooltipShowTimeoutHandle) {
            clearTimeout(tooltipShowTimeoutHandle);
            tooltipShowTimeoutHandle = null;
        }
        if(hasTooltip) {
            tooltipShowTimeoutHandle = setTimeout(showTooltip, showTooltipDelay);
            lastMouseX = x;
            lastMouseY = y;
        }
    }
    function prepareTooltip(x, y, title) {
        tooltip.textContent = title;
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
            prepareTooltip(e.clientX, e.clientY, element.title);
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
        "quick_rocker",
        "quick_fixGestures",
        "translation_useHttps"
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

    secondLanguage.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        var option = document.createElement('option');
        option.value = entry.k;
        option.textContent = entry.v;
        secondLanguage.appendChild(option);
    }
}
function serializeLanguages() {
    var list = [];
    var options = secondLanguage.children;
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.value !== 'DE' && option.value !== 'EN')
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
    for (var key in checkedDisableElements) {
        var elements = checkedDisableElements[key];
        for (var i = 0; i < elements.length; i++)
            elements[i].disabled = false;
    }
    for (var key in checkedDisableElements) {
        if (!byId(key).checked) {
            var elements = checkedDisableElements[key];
            for (var i = 0; i < elements.length; i++)
                elements[i].disabled = true;
        }
    }
}
function initializeDisabledConnections() {
    for (var key in checkedDisableElements) {
        on(byId(key), 'click', updateDisabledElements);
    }
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
        self.port.emit('requestLanguageUpdate');
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

on(byId('cancel'), 'click', function () {
    self.port.emit('cancel');
});

on(byId('save'), 'click', function () {
    if (!byId('quick_enabled').checked || byId('quick_ctrl').checked
            || byId('quick_shift').checked || byId('quick_alt').checked) {
        storePreferences();
        self.port.emit('save', preferences);
    } else {
        alert('alert_title_error', 'noQuickKeys');
    }
});

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

//byId('title').innerHTML = '<div data-l10n-id="prefPane_title">ddd</div>';
//self.port.emit('requestTranslation', ['prefPane_title']);
self.port.on('translationResult', function (map) {
    for (var key in map) {
        var value = map[key];
        var elements = document.querySelectorAll('[data-l10n-id=' + key + ']');
        for (var i = 0; i < elements.length; i++)
            elements[i].textContent = value;
    }
});
