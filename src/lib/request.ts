/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/dict.cc-translation
 */

export function getHTML(
    url: string,
    onSuccess: (doc: Document | null) => void,
    onError: (this: XMLHttpRequest, ev: ProgressEvent) => any
) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore'
    const xhr = new XMLHttpRequest({ mozAnon: true });
    // xhr.withCredentials = false;
    xhr.onload = () => onSuccess(xhr.responseXML);
    xhr.onerror = onError;
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
}
