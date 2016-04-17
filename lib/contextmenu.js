/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Roughael)
 
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
var cm = require("sdk/context-menu");
var _ = require("sdk/l10n").get;
var simplePrefs = require("sdk/simple-prefs");

var translator = require("./translator");
var options = require('./options');

var ellipsis = "\u2026";

var wordUnderCursor;
var rootMenu;
var firstEntry;

function destroy() {
    if (rootMenu) {
        rootMenu.destroy();
        rootMenu = null;
    }
    if (firstEntry) {
        firstEntry.destroy();
        firstEntry = null;
    }
}

function createTranslationEntry(translation) {
    return cm.Item({
        label: translation.v,
        image: self.data.url('dictcc.png'),
        contentScript: 'self.on("click", function(){self.postMessage();});',
        onMessage: function () {
            translator.run(wordUnderCursor, translation.k, false);
        }
    });
}
function createEntry(label, callback) {
    return cm.Item({
        label: label,
        image: self.data.url('dictcc.png'),
        contentScript: 'self.on("click", function(){self.postMessage();});',
        onMessage: callback
    });
}

function recreate() {
    destroy();
    if (!simplePrefs.prefs['context.enabled'])
        return;

    var children = [];
    var translations = JSON.parse(simplePrefs.prefs['translation.list']);
    var firstItem = simplePrefs.prefs['context.showFirst'];
    var start = firstItem ? 1 : 0;
    for (var i = start; i < translations.length; i++)
        children.push(createTranslationEntry(translations[i]));

    children.push(cm.Separator());
    var optionsEntry = createEntry(_("options_label"), options.show);
    
    children.push(optionsEntry);
    rootMenu = cm.Menu({
        label: _("menuNone"),
        image: self.data.url('dictcc.png'),
        items: children
    });

    if (firstItem && translations.length > 0)
        firstEntry = createTranslationEntry(translations[0]);
}
recreate();
simplePrefs.on("context.enabled", recreate);
simplePrefs.on("translation.list", recreate);
simplePrefs.on("context.showFirst", recreate);

exports.setWordUnderCursor = function (word) {
    if (!rootMenu)
        return;

    wordUnderCursor = word;
    // Update labels
    if (word.length > 15)
        word = word.substring(0, 15) + ellipsis;

    var translations = JSON.parse(simplePrefs.prefs['translation.list']);
    if (word !== "") {
        rootMenu.label = _("menuSelection", word);

        if (firstEntry) {
            var label = _("menuFirstSelection", word, translations[0].v);
            firstEntry.label = label;
        }
    } else {
        rootMenu.label = _("menuNone");

        if (firstEntry) {
            var label = _("menuFirstNone", translations[0].v);
            firstEntry.label = label;
        }
    }
};

