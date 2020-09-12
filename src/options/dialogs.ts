/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

import { MouseEventCallback, createButton, translateChildren, on } from "../lib/htmlUtils";

export function createDialog(className: string, titleL10nKey: string, buttons: { [s: string]: MouseEventCallback }) {
    const overlay = document.createElement("div");
    overlay.className = "dialogOverlay";
    const dialog = document.createElement("div");
    dialog.className = `dialog ${className}`;
    const titleNode = document.createElement("h2");
    titleNode.setAttribute("data-l10n-id", titleL10nKey);
    const contentNode = document.createElement("div");
    const buttonsNode = document.createElement("div");
    buttonsNode.className = "dialogButtons";
    dialog.appendChild(titleNode);
    dialog.appendChild(contentNode);
    dialog.appendChild(buttonsNode);
    const buttonNodes: { [s: string]: HTMLButtonElement } = {};
    for (const key of Object.keys(buttons)) {
        const button = createButton(key, buttons[key]);
        buttonNodes[key] = button;
        buttonsNode.appendChild(button);
    }
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    return {
        domNode: dialog,
        contentNode,
        buttonNodes,
        close: () => document.body.removeChild(overlay),
    };
}

export function alert(titleL10nKey: string, contentL10nKey: string, content?: string, callback?: () => void) {
    const dialog = createDialog("alert", titleL10nKey, {
        alert_ok: () => {
            dialog.close();
            if (callback) callback();
        },
    });
    if (contentL10nKey) dialog.contentNode.setAttribute("data-l10n-id", contentL10nKey);
    if (content) dialog.contentNode.textContent = content;
    dialog.buttonNodes.alert_ok.focus();
    translateChildren(dialog.domNode);
}

export function confirm(
    titleL10nKey: string,
    contentL10nKey: string | null,
    content: string | null,
    callback: (value: boolean) => void
) {
    const dialog = createDialog("confirm", titleL10nKey, {
        confirm_ok: () => {
            dialog.close();
            callback(true);
        },
        confirm_cancel: () => {
            dialog.close();
            callback(false);
        },
    });
    if (contentL10nKey) dialog.contentNode.setAttribute("data-l10n-id", contentL10nKey);
    if (content) dialog.contentNode.textContent = content;
    dialog.buttonNodes.confirm_ok.focus();
    translateChildren(dialog.domNode);
}

export function prompt(titleL10nKey: string, value: string, callback: (value: string | null) => void) {
    const input = document.createElement("input");
    input.value = value;
    const dialog = createDialog("prompt", titleL10nKey, {
        prompt_ok: () => {
            dialog.close();
            callback(input.value);
        },
        prompt_cancel: () => {
            dialog.close();
            callback(null);
        },
    });
    dialog.contentNode.appendChild(input);
    input.focus();
    on(input, "keydown", (e) => {
        if (e.keyCode === 13) {
            dialog.close();
            callback(input.value);
        }
    });
    translateChildren(dialog.domNode);
}
