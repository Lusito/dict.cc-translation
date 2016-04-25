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

var _ = require("sdk/l10n").get;
var tabs = require("sdk/tabs");
var panel = require("sdk/panel");
var simplePrefs = require("sdk/simple-prefs");

var minilayer = require("./minilayer");
var utils = require('./utils');

// Some constants
var METHOD_SYN_WINDOW = 0;
var METHOD_POCKET_WINDOW = 1;
var METHOD_TAB = 2;
var METHOD_INPAGE = 3;

var lastTab = null;

function getProtocol() {
    return simplePrefs.prefs['translation.useHttps'] ? 'https://' : 'http://';
}

function createParams(text, languagePair) {
    var params = '?lp=' + languagePair;
    if (text)
        params += '&s=' + encodeURIComponent(text);
    return params;
}

function openPanel(url, w, h) {
    panel.Panel({
        width: w,
        height: h,
        contentURL: url
    }).show();
}
function startSynTranslation(params) {
    var url = getProtocol() + 'syn.dict.cc/' + params;
    openPanel(url, 770, 600);
}

function startPocketTranslation(params) {
    var url = getProtocol() + 'pocket.dict.cc/' + params;
    openPanel(url, 350, 500);
}

function startTabTranslation(params, multiWindow) {
    var url = getProtocol() + 'www.dict.cc/' + params;
    if (multiWindow || !lastTab) {
        lastTab = null;
        tabs.open({
            url: url,
            onOpen: function (tab) {
                lastTab = tab;
            },
            onClose: function () {
                lastTab = null;
            }
        });
    } else {
        lastTab.url = url;
        lastTab.activate();
    }
}

function startInpageTranslation(params, callback) {
    var url = getProtocol() + 'www.dict.cc/dcc-gadget.php' + params;

    utils.requestHTML(url, true, function (doc) {
        var elements = doc.getElementsByTagName("a");
        var links = [];
        for (var i = 0; i < elements.length; i++) {
            links.push({
                href: elements[i].href,
                label: elements[i].textContent
            });
        }
        var hasResults = links && links.length > 0;
        var label = hasResults ? null : _("resultFailed");
        callback(label, links);
    }, function () {
        callback(_("resultFailed"), null);
    });
}


exports.run = function (text, languagePair, isQuick) {
    var openMethod = simplePrefs.prefs[isQuick ? 'quick.method' : 'context.method'];
    var multiWindow = simplePrefs.prefs[isQuick ? 'quick.multiWindow' : 'context.multiWindow'];
    var params = createParams(text, languagePair);
    switch (openMethod) {
        case METHOD_SYN_WINDOW:
            startSynTranslation(params, multiWindow);
            break;
        case METHOD_POCKET_WINDOW:
            startPocketTranslation(params, multiWindow);
            break;
        case METHOD_TAB:
            startTabTranslation(params, multiWindow);
            break;
    }
};

exports.runQuick = function (x, y, text, showMenu) {
    var translations = JSON.parse(simplePrefs.prefs['translation.list']);
    if (!translations.length)
        return;

    var languagePair = translations[0].k;
    if (showMenu) {
        minilayer.create(x, y, function (p) {
            p.port.emit('showMenu', _('translateTo'), text, translations);
        });
    } else {
        var openMethod = simplePrefs.prefs['quick.method'];
        var params = createParams(text, languagePair);
        if (openMethod === METHOD_INPAGE) {
            minilayer.create(x, y, function (p) {
                p.port.emit('showMessage', _('loading'));
                startInpageTranslation(params, function (label, links) {
                    p.port.emit('showResult', label, links);
                });
            });
        } else {
            exports.run(text, languagePair, true);
        }
    }
};



exports.loadTranslation = function (p, text, languagePair) {
    p.port.emit('showMessage', _('loading'));
    var params = createParams(text, languagePair);
    startInpageTranslation(params, function (label, links) {
        p.port.emit('showResult', label, links);
    });
};