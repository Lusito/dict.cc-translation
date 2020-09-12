/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { byId, on, translateChildren } from "../lib/htmlUtils";
import * as dialogs from "./dialogs";
import * as request from "../lib/request";
import * as messageUtil from "../lib/messageUtil";
import { settings } from "../lib/settings";
import { isFirefox } from "../lib/browserInfo";
import { TranslationEntry } from "../lib/settingsSignature";
import "../shared.scss";
import "./options.scss";

let selectedTranslationRow: HTMLTableRowElement | null = null;

const preferenceElements: { [s: string]: HTMLInputElement | NodeListOf<HTMLInputElement> } = {};
const translationList = byId("translation_list") as HTMLElement;
const firstLanguage = byId("firstLanguage") as HTMLSelectElement;
const secondLanguage = byId("secondLanguage") as HTMLSelectElement;
const languageDirection = byId("languageDirection") as HTMLSelectElement;

const input: { [s: string]: HTMLInputElement } = {
    context_enabled: byId("context_enabled") as HTMLInputElement,
    context_simple: byId("context_simple") as HTMLInputElement,
    context_method0: byId("context_method0") as HTMLInputElement,
    context_method1: byId("context_method1") as HTMLInputElement,
    context_method2: byId("context_method2") as HTMLInputElement,
    context_method3: byId("context_method3") as HTMLInputElement,
    context_multiWindow: byId("context_multiWindow") as HTMLInputElement,

    quick_enabled: byId("quick_enabled") as HTMLInputElement,
    quick_rocker: byId("quick_rocker") as HTMLInputElement,
    quick_method0: byId("quick_method0") as HTMLInputElement,
    quick_method1: byId("quick_method1") as HTMLInputElement,
    quick_method2: byId("quick_method2") as HTMLInputElement,
    quick_method3: byId("quick_method3") as HTMLInputElement,
    quick_ctrl: byId("quick_ctrl") as HTMLInputElement,
    quick_shift: byId("quick_shift") as HTMLInputElement,
    quick_alt: byId("quick_alt") as HTMLInputElement,
    quick_right: byId("quick_right") as HTMLInputElement,
    quick_selected: byId("quick_selected") as HTMLInputElement,
    quick_multiWindow: byId("quick_multiWindow") as HTMLInputElement,

    micro_method0: byId("micro_method0") as HTMLInputElement,
    micro_method1: byId("micro_method1") as HTMLInputElement,
    micro_method2: byId("micro_method2") as HTMLInputElement,

    translation_useHttps: byId("translation_useHttps") as HTMLInputElement,
};

const warnings: { [s: string]: HTMLElement } = {
    quickShift: byId("quick_warning_shift") as HTMLElement,
    quickAlt: byId("quick_warning_alt") as HTMLElement,
    quickChrome: byId("quick_warning_chrome") as HTMLElement,
};

const elementMap = {
    loadingIndicator: byId("loadingIndicator") as HTMLElement,
    refresh: byId("refresh") as HTMLElement,
};

function initializeTabs() {
    const tabs = document.querySelectorAll("#tabs > div");
    const pages = document.querySelectorAll("#pages > div");

    function linkTab(tab: HTMLElement) {
        on(tab, "click", () => {
            for (let i = 0; i < tabs.length; i++) {
                const className = tabs[i] === tab ? "active" : "";
                tabs[i].className = className;
                pages[i].className = className;
            }
        });
    }
    for (const tab of tabs) linkTab(tab as HTMLElement);
}

function initializePreferenceElements() {
    const checkboxIds = [
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
        "translation_useHttps",
    ];
    const radioNames = ["context_method", "quick_method", "micro_method"];
    for (const id of checkboxIds) {
        const key = id.replace(/_/g, ".");
        preferenceElements[key] = input[id];
    }
    for (const name of radioNames) {
        const key = name.replace(/_/g, ".");
        const radios = document.querySelectorAll(`[name=${name}]`);
        preferenceElements[key] = radios as NodeListOf<HTMLInputElement>;
    }
}

function translationsToJSON() {
    const list = [];
    const rows = translationList.children;
    for (const row of rows) {
        const cells = row.children;
        const k = cells[1].textContent;
        const v = cells[0].textContent;
        if (k && v) list.push({ k, v });
    }
    return list;
}

function addTranslationRow(label: string, languagePair: string) {
    const row = document.createElement("tr");
    translationList.appendChild(row);

    const cell0 = document.createElement("td");
    cell0.textContent = label;
    row.appendChild(cell0);

    const cell1 = document.createElement("td");
    cell1.textContent = languagePair;
    row.appendChild(cell1);

    on(row, "click", () => {
        const actives = document.querySelectorAll("#translation_list .active");
        for (const active of actives) active.className = "";
        selectedTranslationRow = row;
        row.className = "active";
    });
    on(row, "dblclick", () => {
        startLabelEdit(row);
    });
}

function translationsFromJSON(list: TranslationEntry[]) {
    selectedTranslationRow = null;
    translationList.innerHTML = "";
    for (const entry of list) {
        addTranslationRow(entry.v, entry.k);
    }
}

function setLanguageList(list: TranslationEntry[]) {
    list.push({ k: "DE", v: "German" });
    list.push({ k: "EN", v: "English" });
    list.sort((a, b) => {
        if (a.v < b.v) return -1;
        if (a.v > b.v) return 1;
        return 0;
    });

    secondLanguage.innerHTML = "";
    for (const entry of list) {
        const option = document.createElement("option");
        option.value = entry.k;
        option.textContent = entry.v;
        secondLanguage.appendChild(option);
    }
}

function languagesToJSON(): TranslationEntry[] {
    const list = [];
    const options = secondLanguage.children;
    for (const option of options) {
        const { value, textContent } = option as HTMLOptionElement;
        if (value !== "DE" && value !== "EN" && textContent) list.push({ k: value, v: textContent });
    }
    return list;
}

let updateWarnings: () => void = () => 0;

function loadPreferences() {
    for (const key of Object.keys(preferenceElements)) {
        const value = settings.get(key as any);
        const el = preferenceElements[key];
        if ((el as HTMLInputElement).parentElement) (el as HTMLInputElement).checked = value as boolean;
        else {
            const list = el as NodeListOf<HTMLInputElement>;
            for (const radio of list) {
                radio.checked = parseInt(radio.value) === value;
            }
        }
    }

    translationsFromJSON(settings.get("translation.list"));
    setLanguageList(settings.get("translation.languages"));
    updateWarnings();
}

function storePreferences() {
    for (const key of Object.keys(preferenceElements)) {
        const el = preferenceElements[key];
        if ((el as HTMLInputElement).parentElement) settings.set(key as any, (el as HTMLInputElement).checked);
        else {
            const list = el as NodeListOf<HTMLInputElement>;
            for (const radio of list) {
                if (radio.checked) settings.set(key as any, parseInt(radio.value));
            }
        }
    }

    settings.set("translation.list", translationsToJSON());
    settings.set("translation.languages", languagesToJSON());
    settings.save();
}

function setElementsDisabled(elements: HTMLInputElement[], disabled: boolean) {
    for (const element of elements) element.disabled = disabled;
}

function updateDisabledElements() {
    const modifierElements = [input.quick_ctrl, input.quick_shift, input.quick_alt];
    const quickElements = [
        input.quick_method0,
        input.quick_method1,
        input.quick_method2,
        input.quick_method3,
        input.micro_method0,
        input.micro_method1,
        input.micro_method2,
        input.quick_selected,
        input.quick_right,
        input.quick_multiWindow,
    ];
    const contextElements = [
        input.context_simple,
        input.context_method0,
        input.context_method1,
        input.context_method2,
        input.context_method3,
        input.context_multiWindow,
    ];
    const microMethodElements = [input.micro_method0, input.micro_method1, input.micro_method2];

    const quickEnabled = input.quick_enabled.checked;
    setElementsDisabled(modifierElements, !quickEnabled);
    const quickRocker = input.quick_rocker.checked;
    setElementsDisabled(quickElements, !quickEnabled && !quickRocker);
    if (quickEnabled || quickRocker) {
        if (!input.quick_method3.checked) setElementsDisabled(microMethodElements, true);
        const microMethod2 = input.micro_method2;
        if (!input.quick_method2.checked && (microMethod2.disabled || !microMethod2.checked))
            input.quick_multiWindow.disabled = true;
    }
    const contextEnabled = input.context_enabled.checked;
    setElementsDisabled(contextElements, !contextEnabled);
    if (contextEnabled) {
        if (!input.context_method2.checked) input.context_multiWindow.disabled = true;
    }
}

function initializeDisabledConnections() {
    const elementsDisabling = [
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
        input.context_method3,
    ];
    for (const element of elementsDisabling) {
        on(element, "click", updateDisabledElements);
    }
}

function initializeWarningConnections() {
    const { quick_ctrl } = input;
    const { quick_shift } = input;
    const { quick_alt } = input;
    const { quick_right } = input;

    updateWarnings = () => {
        const warnShift = quick_shift.checked && quick_right.checked && !quick_ctrl.checked && !quick_alt.checked;
        const warnAlt = quick_alt.checked && !quick_ctrl.checked && !quick_shift.checked;
        warnings.quickShift.style.display = warnShift ? "block" : "none";
        warnings.quickAlt.style.display = warnAlt ? "block" : "none";
    };
    updateWarnings();
    on(quick_ctrl, "click", updateWarnings);
    on(quick_shift, "click", updateWarnings);
    on(quick_alt, "click", updateWarnings);
    on(quick_right, "click", updateWarnings);
}

function startLabelEdit(row: HTMLTableRowElement) {
    const cell = row.children[0] as HTMLTableCellElement;
    dialogs.prompt("enterLabel", cell.textContent || "", (value) => {
        if (value) cell.textContent = value;
    });
}

function initializeTranslationButtons() {
    on(byId("moveUp") as HTMLElement, "click", () => {
        if (selectedTranslationRow) {
            const prev = selectedTranslationRow.previousElementSibling;
            if (prev) {
                const parent = selectedTranslationRow.parentElement as HTMLElement;
                parent.insertBefore(selectedTranslationRow, prev);
            }
        }
    });
    on(byId("moveDown") as HTMLElement, "click", () => {
        if (selectedTranslationRow) {
            const next = selectedTranslationRow.nextElementSibling;
            if (next) {
                const parent = selectedTranslationRow.parentElement as HTMLElement;
                parent.insertBefore(selectedTranslationRow, next.nextElementSibling);
            }
        }
    });
    on(byId("editLabel") as HTMLElement, "click", () => {
        const row = selectedTranslationRow;
        if (row) startLabelEdit(row);
    });
    on(byId("remove") as HTMLElement, "click", () => {
        const row = selectedTranslationRow;
        if (row) {
            const label = row.children[0].textContent;
            dialogs.confirm("confirm_delete", null, label, (result) => {
                if (result && row) {
                    selectedTranslationRow = (row.nextElementSibling ||
                        row.previousElementSibling) as HTMLTableRowElement;
                    if (selectedTranslationRow) selectedTranslationRow.className = "active";
                    (row.parentElement as HTMLElement).removeChild(row);
                }
            });
        }
    });
    on(byId("clear") as HTMLElement, "click", () => {
        dialogs.confirm("confirm_delete", "confirm_removeAll", null, (result) => {
            if (result) translationList.innerHTML = "";
        });
    });
    on(byId("manual") as HTMLElement, "click", () => {
        dialogs.prompt("enterLanguagePair", "de-en", (languagePair) => {
            if (languagePair) {
                dialogs.prompt("enterLabel", "DE=>EN", (label) => {
                    if (label) addTranslationRow(label, languagePair);
                });
            }
        });
    });
    on(byId("refresh") as HTMLElement, "click", () => {
        setLanguageLoading(true);
        requestLanguageUpdate();
    });
    on(byId("add") as HTMLElement, "click", () => {
        const first = firstLanguage.value;
        const second = secondLanguage.value;
        const dir = languageDirection.value;

        let label: string;
        let languagePair: string;
        if (dir === "both") {
            languagePair = first.toLowerCase() + second.toLowerCase();
            label = `${first.toUpperCase()}<>${second.toUpperCase()}`;
        } else if (dir === "second") {
            languagePair = `${first.toLowerCase()}-${second.toLowerCase()}`;
            label = `${first.toUpperCase()}->${second.toUpperCase()}`;
        } else {
            languagePair = `${second.toLowerCase()}-${first.toLowerCase()}`;
            label = `${second.toUpperCase()}->${first.toUpperCase()}`;
        }
        dialogs.prompt("enterLabel", label, (value) => {
            if (value) addTranslationRow(value, languagePair);
        });
    });
}

function setLanguageLoading(loading: boolean) {
    secondLanguage.disabled = loading;
    elementMap.loadingIndicator.style.width = `${elementMap.refresh.clientWidth}px`;
    elementMap.refresh.style.display = loading ? "none" : "";
    elementMap.loadingIndicator.style.display = loading ? "block" : "";
}

function onLanguageListUpdate(languages: null | TranslationEntry[]) {
    setLanguageLoading(false);
    if (languages && languages.length > 0) setLanguageList(languages);
    else dialogs.alert("alert_title_error", "refreshFailed");
}

function requestLanguageUpdate() {
    const protocol = input.translation_useHttps.checked ? "https://" : "http://";
    const url = `${protocol}contribute.dict.cc/?action=buildup`;
    const hrefPrefix = `${protocol}contribute.dict.cc/?action=buildup&targetlang=`;
    request.getHTML(
        url,
        (doc: Document | null) => {
            if (!doc) {
                onLanguageListUpdate(null);
                return;
            }
            const elements = doc.getElementsByTagName("a");
            const list: TranslationEntry[] = [];
            for (const element of elements) {
                if (element.href.indexOf(hrefPrefix) === 0) {
                    const lang = element.href.substring(hrefPrefix.length);
                    const name = element.textContent || "";
                    list.push({ k: lang, v: name });
                }
            }
            onLanguageListUpdate(list);
        },
        () => {
            onLanguageListUpdate(null);
        }
    );
}

const saveButton = byId("save") as HTMLElement;
on(byId("restore_defaults") as HTMLElement, "click", () => {
    dialogs.confirm("confirm_restore_defaults", "confirm_restore_defaults_content", null, (result) => {
        if (result) {
            settings.restoreDefaults();
            saveButton.focus();
        }
    });
});

on(saveButton, "click", () => {
    if (
        !input.quick_enabled.checked ||
        input.quick_ctrl.checked ||
        input.quick_shift.checked ||
        input.quick_alt.checked
    ) {
        storePreferences();
        if (!isFirefox) window.close();
    } else {
        dialogs.alert("alert_title_error", "noQuickKeys");
    }
});

on(byId("cancel") as HTMLElement, "click", () => {
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
if (isFirefox) initializeWarningConnections();
else warnings.quickChrome.style.display = "";
saveButton.focus();

if (isFirefox) document.body.className += " firefox";

settings.onReady(() => {
    loadPreferences();
    updateDisabledElements();
    messageUtil.receive("settingsChanged", () => {
        loadPreferences();
        updateDisabledElements();
    });
});
