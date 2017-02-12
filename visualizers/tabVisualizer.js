/* ***** BEGIN LICENSE BLOCK *****
 
 * Author: Santo Pfingsten (Lusito)
 
 * This file is part of the dict.cc web-extension.
 
 * The dict.cc web-extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 
 * The dict.cc web-extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 
 * You should have received a copy of the GNU General Public License
 * along with the dict.cc web-extension.  If not, see http://www.gnu.org/licenses/.
 
 * ***** END LICENSE BLOCK ***** */

/* global browser */

var tabVisualizer = {
    lastTab: null,
    show: function (config) {
        var tabConfig = {};
        if (config.url)
            tabConfig.url = config.url;
        else
            tabConfig.url = config.protocol + 'www.dict.cc/' + config.params;
        if (config.multiWindow || !tabVisualizer.lastTab) {
            tabVisualizer.lastTab = null;
            browser.tabs.create(tabConfig, function (tab) {
                tabVisualizer.lastTab = tab.id;
            });
        } else {
            browser.tabs.update(tabVisualizer.lastTab, tabConfig);
        }
    }
};
browser.tabs.onRemoved.addListener(function (tabId) {
    if (tabId === tabVisualizer.lastTab)
        tabVisualizer.lastTab = null;
});
