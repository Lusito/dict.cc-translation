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

var EXPORTED_SYMBOLS = ["SearchDictCC_Overlay"];

///////////////////
// Imports

Components.utils.import("resource://searchdictcc-modules/helpers.jsm");
Components.utils.import("resource://searchdictcc-modules/prefs.jsm");

///////////////////
// Private variables


var strings = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://searchdictcc/locale/shared.properties");
var listEntries = null;
var allowedAscii = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
var ellipsis = "\u2026";
var lastSynWindow = null;
var lastPocketWindow = null;
var lastTab = null;
var lastCachedWord = null;

///////////////////
// Private functions

function clamp(value, min, max) {
	return Math.min( Math.max(min, value), max);
}

function windowOpen(window) {
	try { return null != window && !window.closed; } catch(e) {}
	return false;
}

function fixContentDocument(doc) {
	let contentDocument = doc;
	if(contentDocument.getElementsByTagName("window").length > 0 ) {
		let content_frame = contentDocument.getElementById("content_frame");
		if(content_frame) {
			contentDocument = (content_frame.contentWindow || content_frame.contentDocument);
			if (contentDocument.document)
				contentDocument = contentDocument.document;
		}
	}
	
	return contentDocument;
}

function startTranslation(data, subdomain, isQuick) {
	let openMethod = isQuick ? Prefs.quickMethod() : Prefs.contextMethod();
	let multiWindow = isQuick ? Prefs.quickMultiWindow() : Prefs.contextMultiWindow();
	let params = data.selectionText == '' ? '' : '?s=' + encodeURIComponent(data.selectionText);
	if(openMethod == 0) {
		if (multiWindow || !windowOpen(lastSynWindow)) {
			lastSynWindow = data.wnd.open('http://' + subdomain + '.syn.dict.cc/' + params,'dictcc','width=770,height=600,toolbar=no,location=no,directories=no,status=no,menubar=no,fullscreen=no,scrollbars=yes,copyhistory=yes,resizable=yes');
			lastSynWindow.resizeTo(770, 600);
		} else {
			lastSynWindow.location = 'http://' + subdomain + '.syn.dict.cc/' + params;
			try { lastSynWindow.focus(); } catch (e) {}
		}
	} else if(openMethod == 1) {
		if (multiWindow || !windowOpen(lastPocketWindow)) {
			lastPocketWindow = data.wnd.open('http://' + subdomain + '.pocket.dict.cc/' + params,'pocket_dict','width=350,height=500,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,copyhistory=yes,resizable=yes');
			lastPocketWindow.resizeTo(350, 500);
		} else {
			lastPocketWindow.location = 'http://' + subdomain + '.pocket.dict.cc/' + params;
			try { lastPocketWindow.focus(); } catch (e) {}
		}
	} else {
		if (multiWindow || !windowOpen(lastTab)) {
			lastTab = data.wnd.gBrowser.getBrowserForTab(data.wnd.gBrowser.addTab('http://' + subdomain + '.dict.cc/' + params));
		} else {
			lastTab.contentDocument.location = 'http://' + subdomain + '.dict.cc/' + params;
		}
	}
}

function isWordChar(str, i) {
	let code = str.charCodeAt(i);
	// unicode
	if(code >= 127)
		return code != 160;// nbsp;
	// ascii
	return allowedAscii.indexOf(str.charAt(i)) != -1;
}

function getWordFromEvent(doc, evt) {
	let rangeParent = evt.rangeParent;
	let rangeOffset = evt.rangeOffset;

	// create a range object
	let rangePre = doc.createRange();
	rangePre.setStart(rangeParent, 0);
	rangePre.setEnd(rangeParent, rangeOffset);
	// create a range object
	let rangePost = doc.createRange();
	rangePost.setStart(rangeParent, rangeOffset);
	rangePost.setEnd(rangeParent, rangeParent.length);
	let pre = rangePre.toString();
	let post = rangePost.toString();
	
	// Strip to a word
	if(pre != '') {
		// look for last ascii char that is not an alpha and break out
		for(let i=pre.length-1; i>=0; i--) {
			if(!isWordChar(pre, i)) {
				pre = pre.substr(i+1);
				break;
			}
		}
	}
	if(post != '') {
		// look for first ascii char that is not an alpha and break out
		for(let i=0; i<post.length; i++) {
			if(!isWordChar(post, i)) {
				post = post.substr(0, i);
				break;
			}
		}
	}
	return pre + post;
}

function updateLayers(data) {
	data.miniLayer = data.contentDoc.getElementById('ffdictcc_mini');
	data.miniResults = data.contentDoc.getElementById('ffdictcc_mini_result');
	data.miniExtra = data.contentDoc.getElementById('ffdictcc_mini_extra');
}

function showMiniLayer(data, x, y, text, extraNodes) {
	updateLayers(data);
	if(!data.miniLayer) {
		// Style
		let headID = data.contentDoc.getElementsByTagName("head")[0];
		if(!headID) {
			return;
		}
		let cssNode = data.contentDoc.createElement('link');
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = 'chrome://searchdictcc/skin/overlay.css';
		cssNode.media = 'screen';
		headID.appendChild(cssNode);

		// The container
		data.miniLayer = data.contentDoc.createElement("div");
		data.miniLayer.id = 'ffdictcc_mini';

		// The close button
		let closeButton = data.contentDoc.createElement("div");
		closeButton.textContent = 'x';
		closeButton.id = 'ffdictcc_mini_close';
		closeButton.addEventListener("click", function() { data.miniLayer.style.display='none'; }, false);
		data.miniLayer.appendChild(closeButton);

		// The icon
		let icon = data.contentDoc.createElement("a");
		icon.id = 'ffdictcc_mini_icon';
		icon.href="http://www.dict.cc/";
		icon.target = "_blank";
		data.miniLayer.appendChild(icon);

		let iconImg = data.contentDoc.createElement("img");
		iconImg.src = "chrome://searchdictcc/skin/dictcc.png";
		icon.appendChild(iconImg);

		// The result container
		data.miniResults = data.contentDoc.createElement("span");
		data.miniResults.id = 'ffdictcc_mini_result';
		data.miniResults.textContent = '-';
		data.miniLayer.appendChild(data.miniResults);

		// The result container
		data.miniExtra = data.contentDoc.createElement("span");
		data.miniExtra.id = 'ffdictcc_mini_extra';
		data.miniExtra.textContent = '-';
		data.miniLayer.appendChild(data.miniExtra);

		data.contentDoc.body.appendChild(data.miniLayer);
	}
	removeAllChildren(data.miniResults);
	data.miniResults.appendChild(data.contentDoc.createTextNode(text));
	data.miniLayer.style.display = 'block';
	if(extraNodes == null) {
		data.miniExtra.style.display = 'none';
		data.miniResults.style.fontWeight = 'normal';
	} else {
		data.miniResults.style.fontWeight = 'bold';
		data.miniExtra.style.display = 'block';
		removeAllChildren(data.miniExtra);
		for(let i=0; i<extraNodes.length; i++)
			data.miniExtra.appendChild(extraNodes[i]);
	}

	x = clamp(x, 0, data.contentDoc.documentElement.scrollWidth-10-data.miniLayer.clientWidth);
	y = clamp(y-15, 5, data.contentDoc.documentElement.scrollHeight-5-data.miniLayer.clientHeight);
	data.miniLayer.style.left = x + 'px';
	data.miniLayer.style.top = y + 'px';
}

function removeAllChildren(node) {
	if ( node.hasChildNodes() ) {
		while ( node.childNodes.length >= 1 )
			node.removeChild( node.firstChild );
	}
}

function callbackGadget(data, responseText) {
	removeAllChildren(data.miniResults);
	if(responseText == null) {
		data.miniResults.appendChild(data.contentDoc.createTextNode(strings.GetStringFromName("resultFailed")));
	} else {
		let htmlDoc = Helpers.parseHTML(data.doc, responseText);
		let elements = htmlDoc.getElementsByTagName("a");
		for(let i=0; i<elements.length; i++) {
			let link = data.contentDoc.createElement("a");
			link.href = elements[i].href;
			link.target = "_blank";
			link.textContent = elements[i].textContent;
			data.miniResults.appendChild(link);
			if(i<(elements.length-1)) {
				data.miniResults.appendChild(data.contentDoc.createTextNode(", "));
				link.style.color = 'black';
			}
		}
	}
}

function onQuickMenu(data, subdomain) {
	if(Prefs.quickMethod() == 3) {
		removeAllChildren(data.miniResults);
		data.miniResults.appendChild(data.contentDoc.createTextNode(strings.GetStringFromName("loading")));
		data.miniExtra.style.display = 'none';
		let url = 'http://' + subdomain + '.dict.cc/dcc-gadget.php?s=' + encodeURIComponent(data.selectionText);
		Helpers.getUrlContent( url, function(responseText) { callbackGadget(data, responseText); } );
	} else {
		data.miniLayer.style.display = 'none';
		startTranslation(data, subdomain, true);
	}
}

function isValidClick(data, e) {
	let target = e.target;
	
	while(target) {
		if(target.tagName.toUpperCase() == 'HTML') {
			if(data.miniLayer && data.miniLayer.style.display != 'none') {
				let rect = data.miniLayer.getBoundingClientRect();
				if(e.clientY >= rect.top && e.clientY <= rect.bottom
					&& e.clientX >= rect.left && e.clientX <= rect.right) {
					return false;
				}
			}
			return true;
		}
		target = target.parentNode;
	}

	return false;
}

///////////////////
// Public interface

/**
 * Overlay public interface
 */
var SearchDictCC_Overlay =  {
	contextMenu : function(data, e) {
		data.contentDoc = fixContentDocument(data.contentDoc);
		if(isValidClick(data, e) && Prefs.quickEnabled() && Prefs.quickRight()) {
			let quickCtrl = Prefs.quickCtrl();
			let quickShift = Prefs.quickShift();
			let quickAlt = Prefs.quickAlt();
			if ((quickCtrl || quickShift || quickAlt) && e.ctrlKey == quickCtrl && e.shiftKey == quickShift && e.altKey == quickAlt) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		}

		let text = data.getSelection();
        // try to get the word from the mouse event if nothing was selected
		if(text == '')
			text = getWordFromEvent(data.doc, e);
		data.selectionText = text;

		if (text.length > 15)
			text = text.substring(0,15) + ellipsis;

		if(listEntries != null) {
			for(let i = 0; i < listEntries.length; i++){
				listEntries[i].parentNode.removeChild(listEntries[i]);
			}
		}
		listEntries = new Array();

		let menuParent = data.doc.getElementById("searchdictcc-menu");
		if(!Prefs.contextEnabled()) {
			menuParent.setAttribute("hidden", "true");
			return true;
		}
		menuParent.setAttribute("hidden", "false");

		if(text != "") {
			menuParent.setAttribute("label", strings.GetStringFromName("menuSelection").replace('{TEXT}', text) );
		} else {
			menuParent.setAttribute("label", strings.GetStringFromName("menuNone"));
		}
		let translations = Prefs.getTranslations();
		if(translations.length <= 0) {
			return true;
		}
		let showFirst = Prefs.contextShowFirst();
		if(showFirst) {
			let menuitem = data.doc.createElement('menuitem');
			menuitem.addEventListener("command", function() { startTranslation(data, translations[0].subdomain, false); }, false);
			if(text != "") {
				let label = strings.GetStringFromName("menuFirstSelection");
				label = label.replace('{TEXT}', text);
				label = label.replace('{LABEL}', translations[0].label);
				menuitem.setAttribute("label", label);
			} else {
				let label = strings.GetStringFromName("menuFirstNone");
				label = label.replace('{LABEL}', translations[0].label);
				menuitem.setAttribute("label", label);
			}
			menuitem.setAttribute("class", "menuitem-iconic searchdictcc-icon");

			menuParent.parentNode.insertBefore(menuitem, menuParent.nextSibling);
			listEntries.push(menuitem);
		}
		let menu = data.doc.getElementById("searchdictcc-menu-popup");
		let before = data.doc.getElementById("searchdictcc-menu-options").previousSibling;
		for(let i = showFirst?1:0; i < translations.length; i++){
			let menuitem = data.doc.createElement('menuitem');
			let translation = translations[i];
			menuitem.addEventListener("command", function() { startTranslation(data, translation.subdomain, false); }, false);
			menuitem.setAttribute("label", strings.GetStringFromName("menuSub").replace('{LABEL}', translation.label));
			menuitem.setAttribute("class", "menuitem-iconic searchdictcc-icon");
			menu.insertBefore(menuitem, before);
			listEntries.push(menuitem);
		}
		return true;
	},
	
	mouseDown : function(data, e) {
		data.contentDoc = fixContentDocument(data.contentDoc);
		updateLayers(data);

		if(isValidClick(data, e)) {
			// cache words for use in mouse gestures
			if(e.which == 3 && Prefs.fixGestures()) {
				lastCachedWord = getWordFromEvent(data.doc, e);
			}

			if(data.miniLayer)
				data.miniLayer.style.display = 'none';

			let action = null;
			if(Prefs.quickEnabled()) {
				let quickCtrl = Prefs.quickCtrl();
				let quickShift = Prefs.quickShift();
				let quickAlt = Prefs.quickAlt();
				if((quickCtrl || quickShift || quickAlt) && e.ctrlKey == quickCtrl && e.shiftKey == quickShift && e.altKey == quickAlt) {
					if(e.which == 1) {
						action = 'instant';
					} else if(e.which == 3 && Prefs.quickRight()) {
						action = 'menu';
					}
				}
			}

			if (action != null) {
				SearchDictCC_Overlay.handleClickTranslation(data, e, e.pageX, e.pageY, action == 'menu');
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		}
		return true;
	},
	
	handleClickTranslation : function(data, wordClickEvent, windowX, windowY, showMenu) {
		data.contentDoc = fixContentDocument(data.contentDoc);
		let translations = Prefs.getTranslations();

		if(translations.length <= 0)
			return;

		// get the selection text
		data.selectionText = '';
		if(Prefs.quickSelected())
			data.selectionText = data.getSelection();
		if(data.selectionText == '') {
			data.selectionText = null;
			// try to get the word from the mouse event
			if(wordClickEvent != null && isValidClick(data, wordClickEvent))
				data.selectionText = getWordFromEvent(data.doc, wordClickEvent);

			// if no word event is available check the last cached word
			else if(wordClickEvent == null && lastCachedWord != null)
				data.selectionText = lastCachedWord;
		}
		
		// can't continue without a word
		if(data.selectionText == null || data.selectionText == '')
			return;

		if(showMenu) {
			let translations = Prefs.getTranslations();
			if(translations.length <= 0)
				return true;
			let extraNodes = new Array();

			for(let i = 0; i < translations.length; i++){
				let raquo = data.contentDoc.createElement('span');
				raquo.innerHTML = '&#187; ';
				extraNodes.push(raquo);

				let link = data.contentDoc.createElement("a");
				let subdomain = translations[i].subdomain;

				link.addEventListener("click", function() { onQuickMenu(data, subdomain); }, false);
				link.textContent = translations[i].label;
				extraNodes.push(link);
				extraNodes.push(data.contentDoc.createElement("br"));
			}
			showMiniLayer(data, windowX, windowY, strings.GetStringFromName("translateTo"), extraNodes);
		}
		else if(Prefs.quickMethod() == 3) {
			showMiniLayer(data, windowX, windowY, strings.GetStringFromName("loading"), null);
			let url = 'http://' + translations[0].subdomain + '.dict.cc/dcc-gadget.php?s=' + encodeURIComponent(data.selectionText);
			Helpers.getUrlContent( url, function(responseText) { callbackGadget(data, responseText); } );
		} else {
			startTranslation(data, translations[0].subdomain, true);
		}
	},

	handleMouseGesture : function(options) {
		var data = {
			doc : options.doc,
			contentDoc : options.contentDoc,
			wnd : options.wnd,
			openTab : options.openTab,
			getSelection : options.getSelection
		};
		SearchDictCC_Overlay.handleClickTranslation(data, options.startEvent, options.endEvent.pageX, options.endEvent.pageY, options.showMenu)
	},

	hideMiniLayer : function(data) {
		data.contentDoc = fixContentDocument(data.contentDoc);
		updateLayers(data);
		if(data.miniLayer)
			data.miniLayer.style.display = 'none';
	}
};

