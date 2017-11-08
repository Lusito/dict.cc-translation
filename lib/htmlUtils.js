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

/* global browser */

function byId(id) {
    return document.getElementById(id);
}

function on(node, event, callback) {
    node.addEventListener(event, callback);
}

function translateElement(element) {
    var id = element.dataset.l10nId;
    var content = browser.i18n.getMessage(id);
    if (content)
        element.textContent = content;
    var title = browser.i18n.getMessage(id + "__title");
    if (title)
        element.title = title;
}

function translateChildren(parent) {
    var elements = parent.querySelectorAll('[data-l10n-id]');
    for (var i = 0; i < elements.length; i++) {
        translateElement(elements[i]);
    }
}

function removeAllChildren(node) {
    if (node.hasChildNodes()) {
        while (node.childNodes.length >= 1)
            node.removeChild(node.firstChild);
    }
}

function createElement(doc, parent, tagName, params) {
    var e = doc.createElement(tagName);
    if (params) {
        for (var key in params) {
            e[key] = params[key];
        }
    }
    if (parent)
        parent.appendChild(e);
    return e;
}

function addLink(doc, path) {
    var head = doc.querySelector('head');
    createElement(doc, head, 'link', {
        href: browser.runtime.getURL(path),
        type: "text/css",
        rel: "stylesheet"
    });
}

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
    dialog.buttonNodes.alert_ok.focus();
    translateChildren(dialog.domNode);
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
    dialog.buttonNodes.confirm_ok.focus();
    translateChildren(dialog.domNode);
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
    on(input, 'keydown', function (e) {
        if (e.keyCode === 13) {
            dialog.close();
            callback(input.value);
        }
    });
    translateChildren(dialog.domNode);
}
