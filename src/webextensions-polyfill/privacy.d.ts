/// <reference path="types.d.ts"/>

declare module 'webextension-polyfill' {
    ////////////////////
    // Privacy
    ////////////////////
    /**
     * Use the browser.privacy API to control usage of the features in Chrome that can affect a user's privacy. This API relies on the ChromeSetting prototype of the type API for getting and setting Chrome's configuration.
     * Permissions:  "privacy"
     * The Chrome Privacy Whitepaper gives background detail regarding the features which this API can control.
     */
    export namespace privacy {
        export interface Services {
            /** since Chrome 20. */
            spellingServiceEnabled: types.ChromeSetting;
            searchSuggestEnabled: types.ChromeSetting;
            instantEnabled: types.ChromeSetting;
            alternateErrorPagesEnabled: types.ChromeSetting;
            safeBrowsingEnabled: types.ChromeSetting;
            autofillEnabled: types.ChromeSetting;
            translationServiceEnabled: types.ChromeSetting;
            passwordSavingEnabled: types.ChromeSetting;
            hotwordSearchEnabled: types.ChromeSetting;
            safeBrowsingExtendedReportingEnabled: types.ChromeSetting;
        }

        export interface Network {
            networkPredictionEnabled: types.ChromeSetting;
            webRTCMultipleRoutesEnabled: types.ChromeSetting;
            webRTCNonProxiedUdpEnabled: types.ChromeSetting;
        }

        export interface Websites {
            thirdPartyCookiesAllowed: types.ChromeSetting;
            referrersEnabled: types.ChromeSetting;
            hyperlinkAuditingEnabled: types.ChromeSetting;
            protectedContentEnabled: types.ChromeSetting;
        }

        /** Settings that enable or disable features that require third-party network services provided by Google and your default search provider. */
        export var services: Services;
        /** Settings that influence Chrome's handling of network connections in general. */
        export var network: Network;
        /** Settings that determine what information Chrome makes available to websites. */
        export var websites: Websites;
    }
}