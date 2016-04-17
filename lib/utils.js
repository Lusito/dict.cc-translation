
var XMLHttpRequest = require("sdk/net/xhr").XMLHttpRequest;

exports.requestHTML = function(url, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        onSuccess(this.responseXML);
    };
    xhr.onerror = onError;
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
};
