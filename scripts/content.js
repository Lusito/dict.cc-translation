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

/* global messageUtil, settings, browser */

var allowedAscii = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
var config = {};
var lastActionTime = 0;
var leftDown = false;
var rightDown = false;

// hopefully we don't need this code at all
//function detectWordFromEventChrome(evt) {
//    var elem = evt.target;
//    var x = evt.x;
//    var y = evt.y;
//    if (elem.nodeType === elem.TEXT_NODE) {
//        var range = elem.ownerDocument.createRange();
//        range.selectNodeContents(elem);
//        var currentPos = 0;
//        var endPos = range.endOffset;
//        while (currentPos + 1 < endPos) {
//            range.setStart(elem, currentPos);
//            range.setEnd(elem, currentPos + 1);
//            if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
//                    range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
//                range.expand("word");
//                var ret = range.toString();
//                range.detach();
//                return(ret);
//            }
//            currentPos += 1;
//        }
//    } else {
//        for (var i = 0; i < elem.childNodes.length; i++) {
//            var range = elem.childNodes[i].ownerDocument.createRange();
//            range.selectNodeContents(elem.childNodes[i]);
//            if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
//                    range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
//                range.detach();
//                return(getWordAtPoint(elem.childNodes[i], x, y));
//            } else {
//                range.detach();
//            }
//        }
//    }
//    return(null);
//}

function isWordChar(str, i) {
    var code = str.charCodeAt(i);
    // unicode
    if (code >= 127)
        return code !== 160;// nbsp;
    // ascii
    return allowedAscii.indexOf(str.charAt(i)) !== -1;
}
function detectWordFromEvent(evt) {
    var rangeParent;
    var rangeOffset;
    if (evt.rangeParent) {
        rangeParent = evt.rangeParent;
        rangeOffset = evt.rangeOffset;
    } else if (document.caretPositionFromPoint) {
        var pos = document.caretPositionFromPoint(evt.clientX, evt.clientY);
        rangeParent = pos.offsetNode;
        rangeOffset = pos.offset;
    } else if (document.caretRangeFromPoint) {
        var pos = document.caretRangeFromPoint(evt.clientX, evt.clientY);
        rangeParent = pos.startContainer;
        rangeOffset = pos.startOffset;
    } else {
        console.error('browser not supported');
        return "";
    }

    var pre = "", post = "";
    if (rangeParent.length) {
        // create a range object
        var rangePre = document.createRange();
        rangePre.setStart(rangeParent, 0);
        rangePre.setEnd(rangeParent, rangeOffset);
        // create a range object
        var rangePost = document.createRange();
        rangePost.setStart(rangeParent, rangeOffset);
        rangePost.setEnd(rangeParent, rangeParent.length);
        pre = rangePre.toString();
        post = rangePost.toString();
    } else if (rangeParent.value) {
        var pre = rangeParent.value.substr(0, rangeOffset);
        var post = rangeParent.value.substr(rangeOffset);
    }

    // Strip to a word
    if (pre !== '') {
        // look for last ascii char that is not an alpha and break out
        for (var i = pre.length - 1; i >= 0; i--) {
            if (!isWordChar(pre, i)) {
                pre = pre.substr(i + 1);
                break;
            }
        }
    }
    if (post !== '') {
        // look for first ascii char that is not an alpha and break out
        for (var i = 0; i < post.length; i++) {
            if (!isWordChar(post, i)) {
                post = post.substr(0, i);
                break;
            }
        }
    }
    return pre + post;
}

function updateWordUnderCursor(e) {
    // get the selection text
    var text = config.selected ? window.getSelection().toString() : '';
    // try to get the word from the mouse event
    if (!text) {
        text = detectWordFromEvent(e);
    }
    console.log(text);
    messageUtil.send("setWordUnderCursor", {
        text: text,
        x: e.clientX,
        y: e.clientY
    });
    return text;
}

function getQuickAction(e) {
    var action = null;
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
            var currentTime = new Date().getTime();
            if (e.which === 1 && rightDown !== false && (currentTime - rightDown) < 1000)
                action = 'instant';
            else if (config.menu && e.which === 3 && leftDown !== false && (currentTime - leftDown) < 1000)
                action = 'menu';
        }
    }
    return action;
}


function preventMouseEventAfterAction(e) {
    var currentTime = new Date().getTime();
    var deltaTime = currentTime - lastActionTime;
    if (deltaTime < 500) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    return true;
}

function updateRocker(which, value) {
    if (which === 1)
        leftDown = value;
    else if (which === 3)
        rightDown = value;
}

function onMouseUp(e) {
    updateRocker(e.which, false);
    return preventMouseEventAfterAction(e);
}

function onMouseDown(e) {
    destroyPanels();
    var currentTime = new Date().getTime();
    var action = getQuickAction(e);
    if (action) {
        var text = updateWordUnderCursor(e);
        lastActionTime = currentTime;
        if (text) {
            if(config.method === METHOD_INPAGE || action === 'menu') {
                miniLayer = new MiniLayer(e.clientX, e.clientY, function() {
                    if(!miniLayer)
                        return;
                    if(action === 'menu')
                        miniLayer.showMenu(browser.i18n.getMessage("translateTo"), text);
                    else
                        miniLayer.translateQuick(text);
                });
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
function getTopLeftFromIframe() {
   var left = 0, top = 0;
   var win = window;
   var element = window.frameElement;

   do {
      left += element.offsetLeft;
      top += element.offsetTop;
      element = element.offsetParent;

      if (!element) {
         element = win.frameElement;
         win = win.parent;
      }
   } while (element)

   return [left,top];
}
var COMMON_STYLES = {
    display: "block",
    float: "none",
    margin: 0,
    padding: 0,
    border: "none",
    "border-radius": 0,
    width: "auto",
    height: "auto",
    outline: "none",
    "box-shadow": "none",
    background: "none"
};
var OVERLAY_STYLES = {
    position: "fixed",
    "z-index": 1000000000,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(128, 128, 128, 0.22)"
};
var DEFAULT_PANEL_STYLES = {
    position: "fixed",
    "box-shadow": "0 0 4px 1px #adadad"
};

var MICRO_PANEL_STYLES = {
    left: "-1000px",
    top: 0,
    right: "auto",
    bottom: "auto",
    width: "50px",
    height: "20px",
    "border-radius": "3px"
};

function applyForcedStyles(elem) {
    for(var i=1; i<arguments.length; i++) {
        var styles = arguments[i];
        for(var key in styles) {
            elem.style.setProperty(key, styles[key], "important");
        }
    }
}

function createPanelOverlay() {
    var tdoc = window.top.document;
    var overlay = tdoc.createElement('div');
    applyForcedStyles(overlay, COMMON_STYLES, OVERLAY_STYLES, {"pointer-events":"none"});
    on(overlay, 'mousedown', destroyPanels);
    tdoc.body.appendChild(overlay);
    // enable pointer-events later, since otherwise context-menu will be opened on the new panel
    setTimeout(function() {
        applyForcedStyles(overlay, {'pointer-events': 'auto'});
    }, 500);
    return overlay;
}

function MiniLayer(x, y, onload) {
    // If in a frame, add frame position
    if(window.top !== window.self) {
        var tl = getTopLeftFromIframe();
        x += tl[0];
        y += tl[1];
    }
    var overlay = createPanelOverlay();
    var tdoc = window.top.document;
    var iframe = tdoc.createElement('iframe');
    var idoc,ibody,resultNode,extraNode;
    applyForcedStyles(iframe, COMMON_STYLES, DEFAULT_PANEL_STYLES, MICRO_PANEL_STYLES);
    iframe.onload = function() {
        idoc = iframe.contentDocument || iframe.contentWindow.document;
        ibody = idoc.body;
        addLink(idoc, "minilayer/minilayer.css");

        var div = createElement(idoc, ibody, 'div');
        var a = createElement(idoc, div, 'a', {target: "_blank", href:"http://www.dict.cc/"});
        createElement(idoc, a, 'img', {src: browser.runtime.getURL("icon16.png"), alt:"dict.cc"});
        resultNode = createElement(idoc, div, 'span', {id: "result"});
        extraNode = createElement(idoc, ibody, 'span', {id: "extra"});
        setTimeout(onload, 0);
    };
    overlay.appendChild(iframe);
    

    function updateSize() {
        var last = ibody.className;
        ibody.className += ' measuring';
        applyForcedStyles(iframe, {
            width: '50px',
            height: '20px'
        });
        var calculatedWidth = ibody.scrollWidth;
        var calculatedHeight = ibody.scrollHeight;
        ibody.className = last;

        applyForcedStyles(iframe, {
            width: calculatedWidth + 'px',
            height: calculatedHeight + 'px'
        });
        var vw = Math.max(tdoc.documentElement.clientWidth, window.innerWidth || 0);
        var vh = Math.max(tdoc.documentElement.clientHeight, window.innerHeight || 0);
        var left = (x + 5);
        if((left + calculatedWidth) >= vw)
            left = (x - calculatedWidth - 5);
        var top = (y + 5);
        if((top + calculatedHeight) >= vh)
            top = (y - calculatedHeight - 5);
        applyForcedStyles(iframe, {
            left: left + 'px',
            top: top + 'px'
        });
    }
    function setup(text, extraNodes) {
        removeAllChildren(resultNode);
        if (text)
           resultNode.appendChild(idoc.createTextNode(text));
        else
            resultNode.innerHTML = '';
        if (!extraNodes) {
            ibody.className = '';
        } else {
            ibody.className = 'menu';
            removeAllChildren(extraNode);
            for (var i = 0; i < extraNodes.length; i++)
                extraNode.appendChild(extraNodes[i]);
        }
    }
    function createMenuEntry(text, translation) {
        var link = createElement(idoc, null, "a", {
            textContent: translation.v
        });
        on(link, "click", function () {
            miniLayer.translateQuick(text, translation.k);
        });
        return link;
    }
    function createResultEntry(def) {
        var link = createElement(idoc, null, "a", {
            textContent: def.label,
            style: def.style
        });
        on(link, "click", function () {
            destroyPanels();
            messageUtil.send('showTranslationResult', {
                href: def.href
            });
        });
        return link;
    }
    this.showMenu = function(label, text) {
        var translations = config.translations;
        var extraNodes = new Array();
        for (var i = 0; i < translations.length; i++) {
            var raquo = createElement(idoc, null, "span", {
                innerHTML: '&#187; '
            });
            extraNodes.push(raquo);
            extraNodes.push(createMenuEntry(text, translations[i]));
            extraNodes.push(idoc.createElement("br"));
        }
        setup(label, extraNodes);
        updateSize();
    };
    this.showResult = function (links) {
        setup(null, null);
        for (var i = 0; i < links.length; i++) {
            var link = createResultEntry(links[i]);
            resultNode.appendChild(link);
            if (i < (links.length - 1))
                resultNode.appendChild(idoc.createTextNode(", "));
        }
        updateSize();
    };
    this.showMessage = function (text) {
        setup(text, null);
        updateSize();
    };
    this.showLoading = function () {
        this.showMessage(browser.i18n.getMessage("loading"), null);
    };
    this.translateQuick = function(text, languagePair) {
        miniLayer.showLoading();
        messageUtil.send('requestQuickTranslation', {
            text: text,
            languagePair: languagePair,
            dcc: true
        });
    };
    this.destroy = function() {
        tdoc.body.removeChild(overlay);
    };
}
var miniLayer = null;

function destroyPanels() {
    if(miniLayer) {
        miniLayer.destroy();
        miniLayer = null;
    }
}

function showMiniLayer(cfg) {
    destroyPanels();
    miniLayer = new MiniLayer(cfg.x, cfg.y, function() {
        if(miniLayer)
            miniLayer.translateQuick(cfg.text, cfg.languagePair);
    });
}
function showMiniLayerResult(response) {
    if(miniLayer) {
        if(response.error)
            miniLayer.showMessage(response.error);
        else
            miniLayer.showResult(response.links);
    }
}
settings.onReady(function () {
    window.addEventListener("click", preventMouseEventAfterAction, true);
    window.addEventListener("contextmenu", preventMouseEventAfterAction, true);
    window.addEventListener("mousedown", onMouseDown, true);
    window.addEventListener("mouseup", onMouseUp, true);

    function updateConfig() {
        config = {
            method: settings.get('quick.method'),
            translations: settings.get('translation.list'),
            contextEnabled: settings.get('context.enabled'),
            selected: settings.get('quick.selected'),
            quickEnabled: settings.get('quick.enabled'),
            ctrl: settings.get('quick.ctrl'),
            shift: settings.get('quick.shift'),
            alt: settings.get('quick.alt'),
            menu: settings.get('quick.right'),
            rocker: settings.get('quick.rocker')
        };
    }
    messageUtil.receive('settingsChanged', updateConfig);
    messageUtil.receive('showMiniLayer', showMiniLayer);
    messageUtil.receive('showMiniLayerResult', showMiniLayerResult);
    updateConfig();
});
