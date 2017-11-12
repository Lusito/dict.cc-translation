/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

// This file intercepts clicks (if appropriate), detects words under the cursor and shows a mini in-page translation
// Ideally, a popup panel would be used to show the translation, but that is not available in web-extensions.

import * as browser from 'webextension-polyfill';
import * as messageUtil from "../lib/messageUtil";
import { DCCResult, VisualizerConfig } from "../background/translatorShared";
import { SettingsSignature, TranslationEntry, TranslationMethod } from "../lib/settingsSignature";
import { detectWordFromEvent } from './wordDetection';
import { MiniLayer } from './miniLayer';

export interface Config {
    method?: number,
    translations?: TranslationEntry[],
    contextEnabled?: boolean,
    contextSimple?: boolean,
    selected?: boolean,
    quickEnabled?: boolean,
    ctrl?: boolean,
    shift?: boolean,
    alt?: boolean,
    menu?: boolean,
    rocker?: boolean,
}

let config: Config = {};
let lastActionTime = 0;
let leftDown: false | number = false;
let rightDown: false | number = false;
let miniLayer: MiniLayer | null = null;

function updateWordUnderCursor(e: MouseEvent) {
    // get the selection text
    let text = config.selected ? window.getSelection().toString() : '';
    // try to get the word from the mouse event
    if (!text) {
        text = detectWordFromEvent(e);
    }
    messageUtil.send("setWordUnderCursor", {
        text: text,
        x: e.clientX,
        y: e.clientY
    });
    return text;
}

function getQuickAction(e: MouseEvent) {
    let action = null;
    // Using modifiers
    if (config.quickEnabled) {
        if ((config.ctrl || config.shift || config.alt)
            && e.ctrlKey === config.ctrl
            && e.shiftKey === config.shift
            && e.altKey === config.alt) {
            if (e.which === 1) {
                action = 'instant';
            } else if (config.menu && e.which === 3) {
                action = 'menu';
            }
        }
    }

    // Support for rocker gestures
    if (config.rocker) {
        if (!action && (leftDown || rightDown)) {
            let currentTime = Date.now();
            if (e.which === 1 && rightDown !== false && (currentTime - rightDown) < 1000)
                action = 'instant';
            else if (config.menu && e.which === 3 && leftDown !== false && (currentTime - leftDown) < 1000)
                action = 'menu';
        }
    }
    return action;
}


function preventMouseEventAfterAction(e: MouseEvent) {
    let currentTime = Date.now();
    let deltaTime = currentTime - lastActionTime;
    if (deltaTime < 500) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    return true;
}

function updateRocker(which: number, value: false | number) {
    if (which === 1)
        leftDown = value;
    else if (which === 3)
        rightDown = value;
}

function onMouseUp(e: MouseEvent) {
    updateRocker(e.which, false);
    return preventMouseEventAfterAction(e);
}

function onMouseDown(e: MouseEvent) {
    destroyPanels();
    let currentTime = Date.now();
    let action = getQuickAction(e);
    if (action) {
        let text = updateWordUnderCursor(e);
        lastActionTime = currentTime;
        if (text) {
            if (config.method === TranslationMethod.INPAGE || action === 'menu') {
                miniLayer = new MiniLayer(e.clientX, e.clientY, () => {
                    if (!miniLayer)
                        return;
                    if (action === 'menu')
                        miniLayer.showMenu(browser.i18n.getMessage("translateTo"), text);
                    else
                        miniLayer.translateQuick(text);
                }, ()=> miniLayer = null, config.translations);
            } else {
                messageUtil.send('requestQuickTranslation', {
                    text: text
                });
            }
        }

        e.preventDefault();
        e.stopPropagation();
    } else if (e.which === 3 && config.contextEnabled) {
        updateWordUnderCursor(e);
    }

    updateRocker(e.which, currentTime);

    return action === null;
}

function destroyPanels() {
    if (miniLayer)
        miniLayer.destroy();
}

function showMiniLayer(cfg: VisualizerConfig) {
    destroyPanels();
    miniLayer = new MiniLayer(cfg.x || 0, cfg.y || 0, () => {
        if (miniLayer && cfg.text)
            miniLayer.translateQuick(cfg.text, cfg.languagePair);
    }, ()=> miniLayer = null, config.translations);
}

function showMiniLayerResult(response: DCCResult) {
    if (miniLayer) {
        if (response.error)
            miniLayer.showMessage(response.error);
        else if (response.links)
            miniLayer.showResult(response.links);
    }
}

function onSettingsChanged(settings: SettingsSignature) {
    config = {
        method: settings['quick.method'],
        translations: settings['translation.list'],
        contextEnabled: settings['context.enabled'],
        contextSimple: settings['context.simple'],
        selected: settings['quick.selected'],
        quickEnabled: settings['quick.enabled'],
        ctrl: settings['quick.ctrl'],
        shift: settings['quick.shift'],
        alt: settings['quick.alt'],
        menu: settings['quick.right'],
        rocker: settings['quick.rocker']
    };
    if(miniLayer)
        miniLayer.setTranslations(config.translations);
}

messageUtil.receive('contentStartup', (settings) => {
    window.addEventListener("click", preventMouseEventAfterAction, true);
    window.addEventListener("contextmenu", preventMouseEventAfterAction, true);
    window.addEventListener("mousedown", onMouseDown, true);
    window.addEventListener("mouseup", onMouseUp, true);

    messageUtil.receive('settingsChanged', onSettingsChanged);
    messageUtil.receive('showMiniLayer', showMiniLayer);
    messageUtil.receive('showMiniLayerResult', showMiniLayerResult);
    onSettingsChanged(settings);
});

messageUtil.send('contentScriptLoaded');
