/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

const allowedAscii = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function isWordChar(str: string, i: number) {
    let code = str.charCodeAt(i);
    // unicode
    if (code >= 127)
        return code !== 160;// nbsp;
    // ascii
    return allowedAscii.indexOf(str.charAt(i)) !== -1;
}

// Add definitions
declare global {
    interface MouseEvent {
        rangeParent: Node;
        rangeOffset: number;
    }

    interface CaretPosition {
        offsetNode: Node;
        offset: number;
    }

    interface RangeParent extends Node {
        length?: number;
        value?: string;
    }

    interface Document {
        caretPositionFromPoint: (x: number, y: number) => CaretPosition;
    }
}


export function detectWordFromEvent(evt: MouseEvent) {
    let rangeParent: RangeParent;
    let rangeOffset;
    if (evt.rangeParent) {
        rangeParent = evt.rangeParent;
        rangeOffset = evt.rangeOffset;
    } else if (document.caretPositionFromPoint) {
        let pos = document.caretPositionFromPoint(evt.clientX, evt.clientY);
        rangeParent = pos.offsetNode;
        rangeOffset = pos.offset;
    } else if (document.caretRangeFromPoint) {
        let pos = document.caretRangeFromPoint(evt.clientX, evt.clientY);
        rangeParent = pos.startContainer;
        rangeOffset = pos.startOffset;
    } else {
        console.error('browser not supported');
        return "";
    }

    let pre = "", post = "";
    if (rangeParent.length) {
        // create a range object
        let rangePre = document.createRange();
        rangePre.setStart(rangeParent, 0);
        rangePre.setEnd(rangeParent, rangeOffset);
        // create a range object
        let rangePost = document.createRange();
        rangePost.setStart(rangeParent, rangeOffset);
        rangePost.setEnd(rangeParent, rangeParent.length);
        pre = rangePre.toString();
        post = rangePost.toString();
    } else if (rangeParent.value) {
        pre = rangeParent.value.substr(0, rangeOffset);
        post = rangeParent.value.substr(rangeOffset);
    }

    // Strip to a word
    if (pre !== '') {
        // look for last ascii char that is not an alpha and break out
        for (let i = pre.length - 1; i >= 0; i--) {
            if (!isWordChar(pre, i)) {
                pre = pre.substr(i + 1);
                break;
            }
        }
    }
    if (post !== '') {
        // look for first ascii char that is not an alpha and break out
        for (let i = 0; i < post.length; i++) {
            if (!isWordChar(post, i)) {
                post = post.substr(0, i);
                break;
            }
        }
    }
    return pre + post;
}
