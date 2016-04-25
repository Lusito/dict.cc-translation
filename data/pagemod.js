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

var allowedAscii = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
var config = {};

self.port.on('configure', function (cfg) {
    config = cfg;
});


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

function getQuickAction(e) {
    if (!config.quickEnabled)
        return null;

    var action = null;
    if ((config.ctrl || config.shift || config.alt)
            && e.ctrlKey === config.ctrl
            && e.shiftKey === config.shift
            && e.altKey === config.alt) {
        if (e.which === 1) {
            action = 'instant';
        } else if (e.which === 3 && config.menu) {
            action = 'menu';
        }
    }

    // support for rocker gestures
    var currentTime = new Date().getTime();
    if (config.rocker) {
        if (!action && (leftDown || rightDown)) {
            if (e.which === 1 && rightDown !== false && (currentTime - rightDown) < 1000)
                action = 'instant';
            else if (e.which === 3 && leftDown !== false && (currentTime - leftDown) < 1000)
                action = 'menu';
        }
    }
    return action;
}

window.addEventListener("contextmenu", function (e) {
    if (getQuickAction(e) !== null) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    return true;
});

var leftDown = false;
var rightDown = false;
window.addEventListener("mouseup", function (e) {
    if (e.which === 1)
        leftDown = false;
    else if (e.which === 3)
        rightDown = false;
});
window.addEventListener("mousedown", function (e) {
    // get the selection text
    var text = config.selected ? window.getSelection().toString() : '';
    // try to get the word from the mouse event
    if (!text)
        text = detectWordFromEvent(e);
    self.port.emit("setWordUnderCursor", text);

    var action = getQuickAction(e);
    if (action) {
        if (text)
            self.port.emit('requestQuickTranslation', e.screenX, e.screenY, text, action === 'menu');

        e.preventDefault();
        e.stopPropagation();
    }

    var currentTime = new Date().getTime();
    if (e.which === 1)
        leftDown = currentTime;
    if (e.which === 3)
        rightDown = currentTime;

    return action === null;
}, false);

self.port.emit('init');
