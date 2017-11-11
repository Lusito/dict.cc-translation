/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { byId, on, translateChildren, prompt, alert, confirm } from "./lib/htmlUtils";
import * as request from "./lib/request";
import * as messageUtil from "./lib/messageUtil";
import { TranslationEntry, settings } from "./lib/settings";
import { isFirefox } from "./lib/browserInfo";

let selectedTranslationRow: HTMLTableRowElement | null = null;

const preferenceElements: { [s: string]: (HTMLInputElement | NodeListOf<HTMLInputElement>) } = {};
const translationList = byId('translation_list') as HTMLElement;
const firstLanguage = byId('firstLanguage') as HTMLSelectElement;
const secondLanguage = byId('secondLanguage') as HTMLSelectElement;
const languageDirection = byId('languageDirection') as HTMLSelectElement;

const input: { [s: string]: HTMLInputElement } = {
    context_enabled: byId('context_enabled') as HTMLInputElement,
    context_simple: byId('context_simple') as HTMLInputElement,
    context_method0: byId('context_method0') as HTMLInputElement,
    context_method1: byId('context_method1') as HTMLInputElement,
    context_method2: byId('context_method2') as HTMLInputElement,
    context_method3: byId('context_method3') as HTMLInputElement,
    context_multiWindow: byId('context_multiWindow') as HTMLInputElement,

    quick_enabled: byId('quick_enabled') as HTMLInputElement,
    quick_rocker: byId('quick_rocker') as HTMLInputElement,
    quick_method0: byId('quick_method0') as HTMLInputElement,
    quick_method1: byId('quick_method1') as HTMLInputElement,
    quick_method2: byId('quick_method2') as HTMLInputElement,
    quick_method3: byId('quick_method3') as HTMLInputElement,
    quick_ctrl: byId('quick_ctrl') as HTMLInputElement,
    quick_shift: byId('quick_shift') as HTMLInputElement,
    quick_alt: byId('quick_alt') as HTMLInputElement,
    quick_right: byId('quick_right') as HTMLInputElement,
    quick_selected: byId('quick_selected') as HTMLInputElement,
    quick_multiWindow: byId('quick_multiWindow') as HTMLInputElement,

    micro_method0: byId('micro_method0') as HTMLInputElement,
    micro_method1: byId('micro_method1') as HTMLInputElement,
    micro_method2: byId('micro_method2') as HTMLInputElement,

    translation_useHttps: byId('translation_useHttps') as HTMLInputElement
};

const warnings: { [s: string]: HTMLElement } = {
    quickShift: byId('quick_warning_shift') as HTMLElement,
    quickAlt: byId('quick_warning_alt') as HTMLElement,
    quickChrome: byId('quick_warning_chrome') as HTMLElement
};

const elementMap = {
    loadingIndicator: byId('loadingIndicator') as HTMLElement,
    refresh: byId('refresh') as HTMLElement
};

function initializeTabs() {
    let tabs = document.querySelectorAll('#tabs > div');
    let pages = document.querySelectorAll('#pages > div');

    function linkTab(tab: HTMLElement) {
        on(tab, 'click', function () {
            for (let i = 0; i < tabs.length; i++) {
                let className = tabs[i] === tab ? 'active' : '';
                tabs[i].className = className;
                pages[i].className = className;
            }
        });
    }
    for (let i = 0; i < tabs.length; i++)
        linkTab(tabs[i] as HTMLElement);
}

function initializePreferenceElements() {
    let checkboxIds = [
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
    let radioNames = [
        "context_method",
        "quick_method",
        "micro_method"
    ];
    for (let id of checkboxIds) {
        let key = id.replace(/_/g, '.');
        preferenceElements[key] = input[id];
    }
    for (let name of radioNames) {
        let key = name.replace(/_/g, '.');
        let radios = document.querySelectorAll('[name=' + name + ']');
        preferenceElements[key] = radios as NodeListOf<HTMLInputElement>;
    }
}

function translationsToJSON() {
    let list = [];
    let rows = translationList.children;
    for (let i = 0; i < rows.length; i++) {
        let cells = rows[i].children;
        list.push({ k: cells[1].textContent, v: cells[0].textContent });
    }
    return list;
}

function addTranslationRow(label: string, languagePair: string) {
    let row = document.createElement('tr');
    translationList.appendChild(row);

    let cell0 = document.createElement('td');
    cell0.textContent = label;
    row.appendChild(cell0);

    let cell1 = document.createElement('td');
    cell1.textContent = languagePair;
    row.appendChild(cell1);

    on(row, 'click', function () {
        let actives = document.querySelectorAll('#translation_list .active');
        for (let i = 0; i < actives.length; i++)
            actives[i].className = '';
        selectedTranslationRow = row;
        row.className = 'active';
    });
    on(row, 'dblclick', function () {
        startLabelEdit(row);
    });
}

function translationsFromJSON(list: TranslationEntry[]) {
    selectedTranslationRow = null;
    translationList.innerHTML = '';
    for (let entry of list) {
        addTranslationRow(entry.v, entry.k);
    }
}

function setLanguageList(list: TranslationEntry[]) {
    list.push({ k: 'DE', v: 'German' });
    list.push({ k: 'EN', v: 'English' });
    list.sort(function (a, b) {
        if (a.v < b.v)
            return -1;
        else if (a.v > b.v)
            return 1;
        else
            return 0;
    });

    secondLanguage.innerHTML = '';
    for (let entry of list) {
        let option = document.createElement('option');
        option.value = entry.k;
        option.textContent = entry.v;
        secondLanguage.appendChild(option);
    }
}

function languagesToJSON() {
    let list = [];
    let options = secondLanguage.children;
    for (let i = 0; i < options.length; i++) {
        let option = options[i] as HTMLOptionElement;
        if (option.value !== 'DE' && option.value !== 'EN')
            list.push({ k: option.value, v: option.textContent });
    }
    return list;
}
function loadPreferences() {
    for (let key in preferenceElements) {
        let value = settings.get(key);
        let el = preferenceElements[key];
        if ((el as HTMLInputElement).parentElement)
            (el as HTMLInputElement).checked = value;
        else {
            let list = el as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < list.length; i++) {
                let radio = list[i];
                radio.checked = parseInt(radio.value) === value;
            }
        }
    }

    translationsFromJSON(settings.get("translation.list"));
    setLanguageList(settings.get("translation.languages"));
    updateWarnings();
}

function storePreferences() {
    for (let key in preferenceElements) {
        let el = preferenceElements[key];
        if ((el as HTMLInputElement).parentElement)
            settings.set(key, (el as HTMLInputElement).checked);
        else {
            let list = el as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < list.length; i++) {
                let radio = list[i];
                if (radio.checked)
                    settings.set(key, parseInt(radio.value));
            }
        }
    }

    settings.set("translation.list", translationsToJSON());
    settings.set("translation.languages", languagesToJSON());
    settings.save();
}

function setElementsDisabled(elements: HTMLInputElement[], disabled: boolean) {
    for (let element of elements)
        element.disabled = disabled;
}

function updateDisabledElements() {
    let modifierElements = [
        input.quick_ctrl,
        input.quick_shift,
        input.quick_alt
    ];
    let quickElements = [
        input.quick_method0,
        input.quick_method1,
        input.quick_method2,
        input.quick_method3,
        input.micro_method0,
        input.micro_method1,
        input.micro_method2,
        input.quick_selected,
        input.quick_right,
        input.quick_multiWindow
    ];
    let contextElements = [
        input.context_simple,
        input.context_method0,
        input.context_method1,
        input.context_method2,
        input.context_method3,
        input.context_multiWindow
    ];
    let microMethodElements = [
        input.micro_method0,
        input.micro_method1,
        input.micro_method2
    ];

    let quickEnabled = input.quick_enabled.checked;
    setElementsDisabled(modifierElements, !quickEnabled);
    let quickRocker = input.quick_rocker.checked;
    setElementsDisabled(quickElements, !quickEnabled && !quickRocker);
    if (quickEnabled || quickRocker) {
        if (!input.quick_method3.checked)
            setElementsDisabled(microMethodElements, true);
        let microMethod2 = input.micro_method2;
        if (!input.quick_method2.checked && (microMethod2.disabled || !microMethod2.checked))
            input.quick_multiWindow.disabled = true;
    }
    let contextEnabled = input.context_enabled.checked;
    setElementsDisabled(contextElements, !contextEnabled);
    if (contextEnabled) {
        if (!input.context_method2.checked)
            input.context_multiWindow.disabled = true;
    }
}

function initializeDisabledConnections() {
    let elementsDisabling = [
        input.context_enabled,
        input.quick_enabled,
        input.quick_rocker,
        input.quick_method0,
        input.quick_method1,
        input.quick_method2,
        input.quick_method3,
        input.micro_method0,
        input.micro_method1,
        input.micro_method2,
        input.context_method0,
        input.context_method1,
        input.context_method2,
        input.context_method3
    ];
    for (let element of elementsDisabling) {
        on(element, 'click', updateDisabledElements);
    }
}

let updateWarnings = function () { };

function initializeWarningConnections() {
    let quick_ctrl = input.quick_ctrl;
    let quick_shift = input.quick_shift;
    let quick_alt = input.quick_alt;
    let quick_right = input.quick_right;

    updateWarnings = function () {
        let warnShift = quick_shift.checked && quick_right.checked && !quick_ctrl.checked && !quick_alt.checked;
        let warnAlt = quick_alt.checked && !quick_ctrl.checked && !quick_shift.checked;
        warnings.quickShift.style.display = warnShift ? 'block' : 'none';
        warnings.quickAlt.style.display = warnAlt ? 'block' : 'none';
    };
    updateWarnings();
    on(quick_ctrl, 'click', updateWarnings);
    on(quick_shift, 'click', updateWarnings);
    on(quick_alt, 'click', updateWarnings);
    on(quick_right, 'click', updateWarnings);
}

function startLabelEdit(row: HTMLTableRowElement) {
    let cell = row.children[0] as HTMLTableCellElement;
    prompt('enterLabel', cell.textContent || '', function (value) {
        if (value)
            cell.textContent = value;
    });
}

function initializeTranslationButtons() {
    on(byId('moveUp') as HTMLElement, 'click', function () {
        if (selectedTranslationRow) {
            let prev = selectedTranslationRow.previousElementSibling;
            if (prev) {
                let parent = selectedTranslationRow.parentElement as HTMLElement;
                parent.insertBefore(selectedTranslationRow, prev);
            }
        }
    });
    on(byId('moveDown') as HTMLElement, 'click', function () {
        if (selectedTranslationRow) {
            let next = selectedTranslationRow.nextElementSibling;
            if (next) {
                let parent = selectedTranslationRow.parentElement as HTMLElement;
                parent.insertBefore(selectedTranslationRow, next.nextElementSibling);
            }
        }
    });
    on(byId('editLabel') as HTMLElement, 'click', function () {
        let row = selectedTranslationRow;
        if (row)
            startLabelEdit(row);
    });
    on(byId('remove') as HTMLElement, 'click', function () {
        let row = selectedTranslationRow;
        if (row) {
            let label = row.children[0].textContent;
            confirm('confirm_delete', null, label, function (result) {
                if (result && row) {
                    selectedTranslationRow = (row.nextElementSibling || row.previousElementSibling) as HTMLTableRowElement;
                    if (selectedTranslationRow)
                        selectedTranslationRow.className = 'active';
                    (row.parentElement as HTMLElement).removeChild(row);
                }
            });
        }
    });
    on(byId('clear') as HTMLElement, 'click', function () {
        confirm('confirm_delete', 'confirm_removeAll', null, function (result) {
            if (result)
                translationList.innerHTML = '';
        });
    });
    on(byId('manual') as HTMLElement, 'click', function () {
        prompt('enterLanguagePair', "de-en", function (languagePair) {
            if (languagePair) {
                prompt('enterLabel', "DE=>EN", function (label) {
                    if (label)
                        addTranslationRow(label, languagePair);
                });
            }
        });
    });
    on(byId('refresh') as HTMLElement, 'click', function () {
        setLanguageLoading(true);
        requestLanguageUpdate();
    });
    on(byId('add') as HTMLElement, 'click', function () {
        let first = firstLanguage.value;
        let second = secondLanguage.value;
        let dir = languageDirection.value;

        let label: string;
        let languagePair: string;
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

function setLanguageLoading(loading: boolean) {
    secondLanguage.disabled = loading;
    elementMap.loadingIndicator.style.width = elementMap.refresh.clientWidth + 'px';
    elementMap.refresh.style.display = loading ? 'none' : '';
    elementMap.loadingIndicator.style.display = loading ? 'block' : '';
}

function onLanguageListUpdate(languages: null | TranslationEntry[]) {
    setLanguageLoading(false);
    if (languages && languages.length > 0)
        setLanguageList(languages);
    else
        alert('alert_title_error', 'refreshFailed');
}

function requestLanguageUpdate() {
    let protocol = input.translation_useHttps.checked ? 'https://' : 'http://';
    let url = protocol + 'contribute.dict.cc/?action=buildup';
    let hrefPrefix = protocol + 'contribute.dict.cc/?action=buildup&targetlang=';
    request.getHTML(url, function (doc: Document | null) {
        if (!doc) {
            onLanguageListUpdate(null);
            return;
        }
        let elements = doc.getElementsByTagName("a");
        let list: TranslationEntry[] = [];
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].href.indexOf(hrefPrefix) === 0) {
                let lang = elements[i].href.substring(hrefPrefix.length);
                let name = elements[i].textContent || '';
                list.push({ k: lang, v: name });
            }
        }
        onLanguageListUpdate(list);
    }, function () {
        onLanguageListUpdate(null);
    });
}

const saveButton = byId('save') as HTMLElement;
on(byId('restore_defaults') as HTMLElement, 'click', function () {
    confirm('confirm_restore_defaults', "confirm_restore_defaults_content", null, function (result) {
        if (result) {
            settings.restoreDefaults();
            saveButton.focus();
        }
    });
});

on(saveButton, 'click', function () {
    if (!input.quick_enabled.checked || input.quick_ctrl.checked
        || input.quick_shift.checked || input.quick_alt.checked) {
        storePreferences();
        if (!isFirefox)
            window.close();
    } else {
        alert('alert_title_error', 'noQuickKeys');
    }
});

on(byId('cancel') as HTMLElement, 'click', function () {
    if (isFirefox) {
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
    warnings.quickChrome.style.display = '';
saveButton.focus();

if (isFirefox)
    document.body.className += "firefox";

settings.onReady(function () {
    loadPreferences();
    updateDisabledElements();
    messageUtil.receive('settingsChanged', function () {
        loadPreferences();
        updateDisabledElements();
    });
});