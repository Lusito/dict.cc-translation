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

var self = require("sdk/self");
var _ = require("sdk/l10n").get;
var tabs = require("sdk/tabs");
var ui = require("sdk/ui");
var core = require("sdk/view/core");
var panel = require("sdk/panel");
var simplePrefs = require("sdk/simple-prefs");
var browserWindows = require("sdk/windows").browserWindows;
var privateBrowsing = require("sdk/private-browsing");

var minilayer = require("./minilayer");
var utils = require('./utils');

// Some constants
var METHOD_SYN_WINDOW = 0;
var METHOD_POCKET_WINDOW = 1;
var METHOD_TAB = 2;
var METHOD_INPAGE = 3;
var METHOD_SIDEBAR = 4;

var lastTab = null;
var lastPopups = {};
var sidebarId = 0;

function getProtocol() {
    return simplePrefs.prefs['translation.useHttps'] ? 'https://' : 'http://';
}

function createParams(text, languagePair) {
    var params = '?lp=' + languagePair;
    if (text)
        params += '&s=' + encodeURIComponent(text);
    return params;
}

function openSidebar(url) {
    var id = sidebarId++;
    var window = browserWindows.activeWindow;
    var view = core.viewFor(window);
    // btoa in addition, since simple uri encoding creates an invalid url according to older firefox sidebar.
    var wrappedUrl = self.data.url('sidebar.html?id=' + id + '&url=' + encodeURIComponent(view.btoa(url)));
    if(!window.dictccSidebar) {
        window.dictccSidebar = ui.Sidebar({
          id: 'dictcc-sidebar-' + id,
          title: _('sidebar_title'),
          url: wrappedUrl
        });
    } else {
        window.dictccSidebar.url = wrappedUrl;
    }
    window.dictccSidebar.show(view);
}

function openPanel(url, w, h) {
    var myPanel = panel.Panel({
        width: w,
        height: h,
        contentURL: 'about:blank',
        onHide: function () {
            myPanel.destroy();
        }
    });
    if (privateBrowsing.isPrivate(browserWindows.activeWindow)) {
        var view = core.getActiveView(myPanel);
        view.setAttribute("disablehistory", true);
    }
    myPanel.show();
    myPanel.contentURL = url;
}

function setupPopup(active, window, w, h, url) {
    var activeView = core.viewFor(active);
    var left = activeView.screenX + (activeView.innerWidth - w) / 2;
    var top = activeView.screenY + (activeView.innerHeight - h) / 2;
    var view = core.viewFor(window);
    view.toolbar.visible = false;
    view.locationbar.visible = false;
    view.resizeTo(w, h);
    view.moveTo(left, top);
    if(url)
        view.location = url;
    window.activate();
}

function openPopup(url, w, h) {
    var active = browserWindows.activeWindow;
    var isPrivate = privateBrowsing.isPrivate(active);
    debugger;
    var popup = lastPopups[isPrivate];
    if(!popup) {
        popup = browserWindows.open({
            url: url,
            isPrivate: isPrivate,
            onOpen: function (window) {
                setupPopup(active, window, w, h);
            },
            onClose: function() {
                lastPopups[isPrivate] = null;
            }
        });
        lastPopups[isPrivate] = popup;
    } else {
        setupPopup(active, popup, w, h, url);
    }
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

function startInpageTranslation(params, languagePair, callback) {
    var url = getProtocol() + 'www.dict.cc/dcc-gadget.php' + params;

    utils.requestHTML(url, function (doc) {
        var elements = doc.getElementsByTagName("a");
        var links = [];
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var style = element.getAttribute('style');
            if (element.querySelector('u') !== null)
                style = 'text-decoration:underline;' + style;
            links.push({
                href: element.href + '&lp=' + languagePair,
                label: element.textContent,
                style: style
            });
        }
        var hasResults = links && links.length > 0;
        var label = hasResults ? null : _("resultFailed");
        callback(label, links);
    }, function () {
        callback(_("resultFailed"), null);
    });
}

function startBigTranslation(params, openMethod, multiWindow, asPanel) {
    switch (openMethod) {
        case METHOD_SYN_WINDOW:
            var url = getProtocol() + 'syn.dict.cc/' + params;
            if (asPanel)
                openPanel(url, 770, 600);
            else
                openPopup(url, 770, 600);
            break;
        case METHOD_POCKET_WINDOW:
            var url = getProtocol() + 'pocket.dict.cc/' + params;
            if (asPanel)
                openPanel(url, 350, 500);
            else
                openPopup(url, 350, 500);
            break;
        case METHOD_TAB:
            startTabTranslation(params, multiWindow);
            break;
        case METHOD_SIDEBAR:
            var url = getProtocol() + 'pocket.dict.cc/' + params;
            openSidebar(url);
            break;
    }
}

exports.run = function (text, languagePair, isQuick, x, y) {
    var params = createParams(text, languagePair);
    var openMethod = simplePrefs.prefs[isQuick ? 'quick.method' : 'context.method'];
    var multiWindow = simplePrefs.prefs[isQuick ? 'quick.multiWindow' : 'context.multiWindow'];
    var asPanel = simplePrefs.prefs[isQuick ? 'quick.asPanel' : 'context.asPanel'];
    if (openMethod === METHOD_INPAGE) {
        minilayer.create(x, y, function (p) {
            p.port.emit('showMessage', _('loading'));
            startInpageTranslation(params, languagePair, function (label, links) {
                p.port.emit('showResult', label, links);
            });
        });
    } else {
        startBigTranslation(params, openMethod, multiWindow, asPanel);
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
        exports.run(text, languagePair, true, x, y);
    }
};

exports.miniMenuEntryClick = function (p, text, languagePair) {
    var params = createParams(text, languagePair);

    var openMethod = simplePrefs.prefs['quick.method'];
    var multiWindow = simplePrefs.prefs['quick.multiWindow'];
    var asPanel = simplePrefs.prefs['quick.asPanel'];
    if (openMethod === METHOD_INPAGE) {
        p.port.emit('showMessage', _('loading'));
        startInpageTranslation(params, languagePair, function (label, links) {
            p.port.emit('showResult', label, links);
        });
    } else {
        p.hide();
        startBigTranslation(params, openMethod, multiWindow, asPanel);
    }
};

exports.miniResultClick = function (href) {
    var index = href.indexOf('?');
    if (index >= 0) {
        var params = href.substr(index);
        var openMethod = simplePrefs.prefs['micro.method'];
        var multiWindow = simplePrefs.prefs['quick.multiWindow'];
        var asPanel = simplePrefs.prefs['quick.asPanel'];
        startBigTranslation(params, openMethod, multiWindow, asPanel);
    } else {
        // could not detect params, just open a new tab with the url
        tabs.open({url: href});
    }
};
