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

var EXPORTED_SYMBOLS = ["Helpers"];

///////////////////
// Public interface

/**
 * Helpers
 */
var Helpers = {
	/**
	 * Get the contents of a specified url and call a callback when done or failed. Asynchronous!
	 * @param url The url to get the content from
	 * @param callback The callback function to call when done,
	 *        with one parameter for the response text, which will be null if it failed
	 */
	getUrlContent : function(url, callback) {
		let xmlhttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState==4) {
				if(xmlhttp.status == 200)
					callback(xmlhttp.responseText);
				else
					callback(null);
			}
		}
		xmlhttp.open("GET", url, true);
		xmlhttp.send(null);
	},

	/**
	 * Parse html code and return the body element.
	 * @return The body element
	 */
	parseHTML : function(doc, htmlText){
		let html = doc.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
		let body = doc.createElementNS("http://www.w3.org/1999/xhtml", "body");
		html.documentElement.appendChild(body);

		body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
				.getService(Components.interfaces.nsIScriptableUnescapeHTML)
				.parseFragment(htmlText, false, null, body));
		return body;
	}
};
