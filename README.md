#Dict.cc Translation Web-Extension

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

Version 5 has been rewritten (and crippled along the way) to work as web-extension, since Firefox discontinues all other add-ons.

Version 4 has been heavily rewritten to work with the new SDK and support multi-process Firefox.

- Support for Fire-Gestures add-on had to be dropped.
- Rocker gestures are now supported out of the box.
- There's an option to use https for secure requests (enabled by default)

##About Dict.cc
Dict.cc is a nice dictionary with mostly German English translations, but other languages are also available and growing. Dict.cc shows quite a lot of different possible results, instead of just one, so you have a better chance of finding the correct one.

## Help
If you have problems, questions or other feedback, please [create an issue](https://github.com/Lusito/dict.cc-translation/issues) here on Github.

If you like it, please [write a review](https://addons.mozilla.org/de/firefox/addon/dictcc-translation/).

I've received suggestions on how to improve the add-on, which can't be done without changes on dict.cc (The website):

- Audio Playback support
- Vocabulary Trainer support

Until support for this has been added in the form of a RESTful API, there is little I can do.

## License
The code of this add-on has been released under the [LGPL V3 License](https://github.com/Lusito/dict.cc-translation/blob/master/LICENSE)
