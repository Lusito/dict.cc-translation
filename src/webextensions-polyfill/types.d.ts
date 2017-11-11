declare module 'webextension-polyfill' {
    ////////////////////
    // Types
    ////////////////////
    /**
     * The types API contains type declarations for Chrome.
     */
    export namespace types {
        export interface ChromeSettingClearDetails {
            /**
             * Optional.
             * The scope of the ChromeSetting. One of
             * • regular: setting for the regular profile (which is inherited by the incognito profile if not overridden elsewhere),
             * • regular_only: setting for the regular profile only (not inherited by the incognito profile),
             * • incognito_persistent: setting for the incognito profile that survives browser restarts (overrides regular preferences),
             * • incognito_session_only: setting for the incognito profile that can only be set during an incognito session and is deleted when the incognito session ends (overrides regular and incognito_persistent preferences).
             */
            scope?: string;
        }

        export interface ChromeSettingSetDetails extends ChromeSettingClearDetails {
            /**
             * The value of the setting.
             * Note that every setting has a specific value type, which is described together with the setting. An extension should not set a value of a different type.
             */
            value: any;
            /**
             * Optional.
             * The scope of the ChromeSetting. One of
             * • regular: setting for the regular profile (which is inherited by the incognito profile if not overridden elsewhere),
             * • regular_only: setting for the regular profile only (not inherited by the incognito profile),
             * • incognito_persistent: setting for the incognito profile that survives browser restarts (overrides regular preferences),
             * • incognito_session_only: setting for the incognito profile that can only be set during an incognito session and is deleted when the incognito session ends (overrides regular and incognito_persistent preferences).
             */
            scope?: string;
        }

        export interface ChromeSettingGetDetails {
            /** Optional. Whether to return the value that applies to the incognito session (default false). */
            incognito?: boolean;
        }

        /**
         * @param details Details of the currently effective value.
         */
        type DetailsCallback = (details: ChromeSettingGetResultDetails) => void;

        export interface ChromeSettingGetResultDetails {
            /**
             * One of
             * • not_controllable: cannot be controlled by any extension
             * • controlled_by_other_extensions: controlled by extensions with higher precedence
             * • controllable_by_this_extension: can be controlled by this extension
             * • controlled_by_this_extension: controlled by this extension
             */
            levelOfControl: string;
            /** The value of the setting. */
            value: any;
            /**
             * Optional.
             * Whether the effective value is specific to the incognito session.
             * This property will only be present if the incognito property in the details parameter of get() was true.
             */
            incognitoSpecific?: boolean;
        }

        export interface ChromeSettingChangedEvent extends events.Event<DetailsCallback> { }

        /** An export interface that allows access to a Chrome browser setting. See accessibilityFeatures for an example. */
        export interface ChromeSetting {
            /**
             * Sets the value of a setting.
             * @param details Which setting to change.
             */
            set(details: ChromeSettingSetDetails): Promise<void>;
            /**
             * Gets the value of a setting.
             * @param details Which setting to consider.
             */
            get(details: ChromeSettingGetDetails): Promise<DetailsCallback>;
            /**
             * Clears the setting, restoring any default value.
             * @param details Which setting to clear.
             */
            clear(details: ChromeSettingClearDetails): Promise<void>;
            /** Fired after the setting changes. */
            onChange: ChromeSettingChangedEvent;
        }
    }
}