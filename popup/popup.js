/* global settings, request */

settings.onReady(function () {
    var lp = byId('lp');
    var search = byId('search');
    var go = byId('go');
    search.placeholder = browser.i18n.getMessage("popup_placeholder");
    go.textContent = browser.i18n.getMessage("popup_button");
    var result = null;
    var translations = settings.get('translation.list');
    for (var i = 0; i < translations.length; i++) {
        var translation = translations[i];
        createElement(document, lp, 'option', {
            textContent: translation.v,
            value: translation.k
        });
    }

    function getProtocol() {
        return settings.get('translation.useHttps') ? 'https://' : 'http://';
    }
    function createParams(text, languagePair) {
        var params = '?lp=' + languagePair;
        if (text)
            params += '&s=' + encodeURIComponent(text);
        return params;
    }
    function runSearch() {
        var word = search.value.trim();
        if (word !== '') {
            var languagePair = lp.value;
            var url = getProtocol() + 'pocket.dict.cc/' + createParams(word, languagePair);


            if (result === null)
                result = createElement(document, document.body, 'dl', {id: 'result'});

            result.textContent = browser.i18n.getMessage("loading");
            request.getHTML(url, function (doc) {
                var dl = doc.querySelector("dl");
                if (!dl) {
                    //fixme: error
                } else {
                    var scripts = dl.querySelectorAll('script');
                    for (var i = 0; i < scripts.length; i++) {
                        var s = scripts[i];
                        s.parentElement.removeChild(s);
                    }
                    var links = dl.querySelectorAll('a');
                    for (var i = 0; i < links.length; i++) {
                        var a = links[i];
                        var href = a.getAttribute('href');
                        if (href.indexOf('/?') === 0) {
                            a.href = getProtocol() + 'www.dict.cc' + href + '&lp=' + languagePair;
                        }
                        a.target = '_blank';
                    }
                    result.innerHTML = dl.innerHTML;
                }
            }, function () {
                //fixme: error
            });
        }
    }
    on(search, 'keydown', function (e) {
        if (e.keyCode === 13) {
            runSearch();
        }
    });
    on(go, 'click', runSearch);
});