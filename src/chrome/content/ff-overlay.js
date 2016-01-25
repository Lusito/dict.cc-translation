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

Components.utils.import("resource://searchdictcc-modules/overlay.jsm");

var SearchDictCC_CreateData = function() {
	return {
		doc : document,
		contentDoc : content.document,
		wnd : window,
		openTab : gBrowser.addTab,
		getSelection : getBrowserSelection
	};
}

window.addEventListener("mousedown", function (e) { return SearchDictCC_Overlay.mouseDown(SearchDictCC_CreateData(), e); }, false);
window.addEventListener("contextmenu", function(e) { return SearchDictCC_Overlay.contextMenu(SearchDictCC_CreateData(), e); }, false);
window.addEventListener("keypress", function (e) { if(e.keyCode == 27) { SearchDictCC_Overlay.hideMiniLayer(SearchDictCC_CreateData()); } }, false);
