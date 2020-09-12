# Dict.cc Translation Web-Extension

[Install on Firefox](https://addons.mozilla.org/firefox/addon/dictcc-translation/)

## Privacy Statement
Your privacy is of the utmost importance.
This extension does not analyze or collect anything beyond what it needs to fulfill its duty.
It does not send any data anywhere not even anonymously. PERIOD.

## About the add-on
The add-on uses [Dict.cc](https://www.dict.cc/) to translate words and phrases in any website, epub or pdf.
No add-on is faster, easier or more precise!

- Text selection is only required for phrases.
- Use rocker gestures or modifiers (for example ctrl+alt) and mouseclick to quickly translate the word under your cursor.
- Use the context menu to get more options.
- This is a word and phrase translation, it does not translate whole sentences.
- I'm not the author or owner of Dict.cc, I just wrote this web-extension.

All languages from dict.cc are supported, and if new ones arrive, you can just update the list of languages from within the add-on.
And now it's also possible to do a quick search using a combination of [ctrl,shift,alt] + click on a word.
Results can be shown as a pop-up or in a new tab or as an in-page translation layer.

## About Dict.cc
Dict.cc is a nice dictionary with mostly German English translations, but other languages are also available and growing. Dict.cc shows quite a lot of different possible results, instead of just one, so you have a better chance of finding the correct one.

## Help
If you have problems, questions or other feedback, please [create an issue](https://github.com/Lusito/dict.cc-translation/issues) here on Github.

If you like it, please [write a review](https://addons.mozilla.org/firefox/addon/dictcc-translation/).

I've received suggestions on how to improve the add-on, which can't be done without changes on dict.cc (The website):

- Audio Playback support
- Vocabulary Trainer support

Until support for this has been added in the form of a RESTful API, there is little I can do.

## Instructions for Mozilla Reviewers:
- run `npm ci`
- run `npm run release`
- check `web-ext-artifacts` directory

## License
The code of this add-on has been released under the [zlib/libpng License](https://github.com/Lusito/dict.cc-translation/blob/master/LICENSE)
