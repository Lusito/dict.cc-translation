// Type definitions for Chrome extension development
// Project: http://developer.browser.com/extensions/
// Definitions by: Matthew Kimber <https://github.com/matthewkimber>, otiai10 <https://github.com/otiai10>, couven92 <https://github.com/couven92>, RReverser <https://github.com/rreverser>, sreimer15 <https://github.com/sreimer15>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

declare module 'webextension-polyfill' {

////////////////////
// Alarms
////////////////////
/**
 * Use the browser.alarms API to schedule code to run periodically or at a specified time in the future. * Permissions:  "alarms"
 */
export namespace alarms {
    export interface AlarmCreateInfo {
        /** Optional. Length of time in minutes after which the onAlarm event should fire.  */
        delayInMinutes?: number;
        /** Optional. If set, the onAlarm event should fire every periodInMinutes minutes after the initial event specified by when or delayInMinutes. If not set, the alarm will only fire once.  */
        periodInMinutes?: number;
        /** Optional. Time at which the alarm should fire, in milliseconds past the epoch (e.g. Date.now() + n).  */
        when?: number;
    }

    export interface Alarm {
        /** Optional. If not null, the alarm is a repeating alarm and will fire again in periodInMinutes minutes.  */
        periodInMinutes?: number;
        /** Time at which this alarm was scheduled to fire, in milliseconds past the epoch (e.g. Date.now() + n). For performance reasons, the alarm may have been delayed an arbitrary amount beyond this. */
        scheduledTime: number;
        /** Name of this alarm. */
        name: string;
    }

    export interface AlarmEvent extends events.Event<(alarm: Alarm) => void> { }

    /**
     * Creates an alarm. Near the time(s) specified by alarmInfo, the onAlarm event is fired. If there is another alarm with the same name (or no name if none is specified), it will be cancelled and replaced by this alarm.
     * In order to reduce the load on the user's machine, Chrome limits alarms to at most once every 1 minute but may delay them an arbitrary amount more. That is, setting delayInMinutes or periodInMinutes to less than 1 will not be honored and will cause a warning. when can be set to less than 1 minute after "now" without warning but won't actually cause the alarm to fire for at least 1 minute.
     * To help you debug your app or extension, when you've loaded it unpacked, there's no limit to how often the alarm can fire.
     * @param alarmInfo Describes when the alarm should fire. The initial time must be specified by either when or delayInMinutes (but not both). If periodInMinutes is set, the alarm will repeat every periodInMinutes minutes after the initial event. If neither when or delayInMinutes is set for a repeating alarm, periodInMinutes is used as the default for delayInMinutes.
     */
    export function create(alarmInfo: AlarmCreateInfo): void;
    /**
     * Creates an alarm. Near the time(s) specified by alarmInfo, the onAlarm event is fired. If there is another alarm with the same name (or no name if none is specified), it will be cancelled and replaced by this alarm.
     * In order to reduce the load on the user's machine, Chrome limits alarms to at most once every 1 minute but may delay them an arbitrary amount more. That is, setting delayInMinutes or periodInMinutes to less than 1 will not be honored and will cause a warning. when can be set to less than 1 minute after "now" without warning but won't actually cause the alarm to fire for at least 1 minute.
     * To help you debug your app or extension, when you've loaded it unpacked, there's no limit to how often the alarm can fire.
     * @param name Optional name to identify this alarm. Defaults to the empty string.
     * @param alarmInfo Describes when the alarm should fire. The initial time must be specified by either when or delayInMinutes (but not both). If periodInMinutes is set, the alarm will repeat every periodInMinutes minutes after the initial event. If neither when or delayInMinutes is set for a repeating alarm, periodInMinutes is used as the default for delayInMinutes.
     */
    export function create(name: string, alarmInfo: AlarmCreateInfo): void;
    /**
     * Gets an array of all the alarms.
     */
    export function getAll(callback: (alarms: Alarm[]) => void): void;
    /**
     * Clears all alarms.
     */
    export function clearAll(): Promise<boolean>;
    /**
     * Clears the alarm with the given name.
     * @param name The name of the alarm to clear. Defaults to the empty string.
     */
    export function clear(name?: string): Promise<boolean>;
    /**
     * Clears the alarm without a name.
     */
    export function clear(): Promise<boolean>;
    /**
     * Retrieves details about the specified alarm.
     */
    export function get(): Promise<Alarm>;
    /**
     * Retrieves details about the specified alarm.
     * @param name The name of the alarm to get. Defaults to the empty string.
     */
    export function get(name: string, ): Promise<Alarm>;

    /** Fired when an alarm has elapsed. Useful for event pages. */
    export var onAlarm: AlarmEvent;
}

////////////////////
// Bookmarks
////////////////////
/**
 * Use the browser.bookmarks API to create, organize, and otherwise manipulate bookmarks. Also see Override Pages, which you can use to create a custom Bookmark Manager page.
 * Permissions:  "bookmarks"
 */
export namespace bookmarks {
    /** A node (either a bookmark or a folder) in the bookmark tree. Child nodes are ordered within their parent folder. */
    export interface BookmarkTreeNode {
        /** Optional. The 0-based position of this node within its parent folder.  */
        index?: number;
        /** Optional. When this node was created, in milliseconds since the epoch (new Date(dateAdded)).  */
        dateAdded?: number;
        /** The text displayed for the node. */
        title: string;
        /** Optional. The URL navigated to when a user clicks the bookmark. Omitted for folders.   */
        url?: string;
        /** Optional. When the contents of this folder last changed, in milliseconds since the epoch.   */
        dateGroupModified?: number;
        /** The unique identifier for the node. IDs are unique within the current profile, and they remain valid even after the browser is restarted.  */
        id: string;
        /** Optional. The id of the parent folder. Omitted for the root node.   */
        parentId?: string;
        /** Optional. An ordered list of children of this node.  */
        children?: BookmarkTreeNode[];
        /**
         * Optional.
          * Since Chrome 37.
         * Indicates the reason why this node is unmodifiable. The managed value indicates that this node was configured by the system administrator or by the custodian of a supervised user. Omitted if the node can be modified by the user and the extension (default).
         */
        unmodifiable?: any;
    }

    export interface BookmarkRemoveInfo {
        index: number;
        parentId: string;
    }

    export interface BookmarkMoveInfo {
        index: number;
        oldIndex: number;
        parentId: string;
        oldParentId: string;
    }

    export interface BookmarkChangeInfo {
        url?: string;
        title: string;
    }

    export interface BookmarkReorderInfo {
        childIds: string[];
    }

    export interface BookmarkRemovedEvent extends events.Event<(id: string, removeInfo: BookmarkRemoveInfo) => void> { }

    export interface BookmarkImportEndedEvent extends events.Event<() => void> { }

    export interface BookmarkMovedEvent extends events.Event<(id: string, moveInfo: BookmarkMoveInfo) => void> { }

    export interface BookmarkImportBeganEvent extends events.Event<() => void> { }

    export interface BookmarkChangedEvent extends events.Event<(id: string, changeInfo: BookmarkChangeInfo) => void> { }

    export interface BookmarkCreatedEvent extends events.Event<(id: string, bookmark: BookmarkTreeNode) => void> { }

    export interface BookmarkChildrenReordered extends events.Event<(id: string, reorderInfo: BookmarkReorderInfo) => void> { }

    export interface BookmarkSearchQuery {
        query?: string;
        url?: string;
        title?: string;
    }

    export interface BookmarkCreateArg {
        /** Optional. Defaults to the Other Bookmarks folder.  */
        parentId?: string;
        index?: number;
        title?: string;
        url?: string;
    }

    export interface BookmarkDestinationArg {
        parentId?: string;
        index?: number;
    }

    export interface BookmarkChangesArg {
        title?: string;
        url?: string;
    }

    /** @deprecated since Chrome 38. Bookmark write operations are no longer limited by Chrome. */
    export var MAX_WRITE_OPERATIONS_PER_HOUR: number;
    /** @deprecated since Chrome 38. Bookmark write operations are no longer limited by Chrome. */
    export var MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: number;

    /**
     * Searches for BookmarkTreeNodes matching the given query. Queries specified with an object produce BookmarkTreeNodes matching all specified properties.
     * @param query A string of words and quoted phrases that are matched against bookmark URLs and titles.
     */
    export function search(query: string): Promise<BookmarkTreeNode[]>;
    /**
     * Searches for BookmarkTreeNodes matching the given query. Queries specified with an object produce BookmarkTreeNodes matching all specified properties.
     * @param query An object with one or more of the properties query, url, and title specified. Bookmarks matching all specified properties will be produced.
     */
    export function search(query: BookmarkSearchQuery): Promise<BookmarkTreeNode[]>;
    /**
     * Retrieves the entire Bookmarks hierarchy.
     */
    export function getTree(callback: (results: BookmarkTreeNode[]) => void): void;
    /**
     * Retrieves the recently added bookmarks.
     * @param numberOfItems The maximum number of items to return.
     */
    export function getRecent(numberOfItems: number): Promise<BookmarkTreeNode[]>;
    /**
     * Retrieves the specified BookmarkTreeNode.
     * @param id A single string-valued id
     */
    export function get(id: string): Promise<BookmarkTreeNode[]>;
    /**
     * Retrieves the specified BookmarkTreeNode.
     * @param idList An array of string-valued ids
     */
    export function get(idList: string[]): Promise<BookmarkTreeNode[]>;
    /**
     * Creates a bookmark or folder under the specified parentId. If url is NULL or missing, it will be a folder.
     */
    export function create(bookmark: BookmarkCreateArg): Promise<BookmarkTreeNode>;
    /**
     * Moves the specified BookmarkTreeNode to the provided location.
     */
    export function move(id: string, destination: BookmarkDestinationArg): Promise<BookmarkTreeNode>;
    /**
     * Updates the properties of a bookmark or folder. Specify only the properties that you want to change; unspecified properties will be left unchanged. Note: Currently, only 'title' and 'url' are supported.
     */
    export function update(id: string, changes: BookmarkChangesArg): Promise<BookmarkTreeNode>;
    /**
     * Removes a bookmark or an empty bookmark folder.
     */
    export function remove(id: string): Promise<void>;
    /**
     * Retrieves the children of the specified BookmarkTreeNode id.
     */
    export function getChildren(id: string): Promise<BookmarkTreeNode[]>;
    /**
     * Since Chrome 14.
     * Retrieves part of the Bookmarks hierarchy, starting at the specified node.
     * @param id The ID of the root of the subtree to retrieve.
     */
    export function getSubTree(id: string): Promise<BookmarkTreeNode[]>;
    /**
     * Recursively removes a bookmark folder.
     */
    export function removeTree(id: string): Promise<void>;

    /** Fired when a bookmark or folder is removed. When a folder is removed recursively, a single notification is fired for the folder, and none for its contents. */
    export var onRemoved: BookmarkRemovedEvent;
    /** Fired when a bookmark import session is ended. */
    export var onImportEnded: BookmarkImportEndedEvent;
    /** Fired when a bookmark import session is begun. Expensive observers should ignore onCreated updates until onImportEnded is fired. Observers should still handle other notifications immediately. */
    export var onImportBegan: BookmarkImportBeganEvent;
    /** Fired when a bookmark or folder changes. Note: Currently, only title and url changes trigger this. */
    export var onChanged: BookmarkChangedEvent;
    /** Fired when a bookmark or folder is moved to a different parent folder. */
    export var onMoved: BookmarkMovedEvent;
    /** Fired when a bookmark or folder is created. */
    export var onCreated: BookmarkCreatedEvent;
    /** Fired when the children of a folder have changed their order due to the order being sorted in the UI. This is not called as a result of a move(). */
    export var onChildrenReordered: BookmarkChildrenReordered;
}

////////////////////
// Browser Action
////////////////////
/**
 * Use browser actions to put icons in the main Google Chrome toolbar, to the right of the address bar. In addition to its icon, a browser action can also have a tooltip, a badge, and a popup. * Manifest:  "browser_action": {...}
 */
export namespace browserAction {
    export interface BadgeBackgroundColorDetails {
        /** An array of four integers in the range [0,255] that make up the RGBA color of the badge. For example, opaque red is [255, 0, 0, 255]. Can also be a string with a CSS value, with opaque red being #FF0000 or #F00. */
        color: string | ColorArray;
        /** Optional. Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  */
        tabId?: number;
    }

    export interface BadgeTextDetails {
        /** Any number of characters can be passed, but only about four can fit in the space. */
        text: string;
        /** Optional. Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  */
        tabId?: number;
    }

    type ColorArray = [number, number, number, number];

    export interface TitleDetails {
        /** The string the browser action should display when moused over. */
        title: string;
        /** Optional. Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  */
        tabId?: number;
    }

    export interface TabDetails {
        /** Optional. Specify the tab to get the information. If no tab is specified, the non-tab-specific information is returned.  */
        tabId?: number;
    }

    export interface TabIconDetails {
        /** Optional. Either a relative image path or a dictionary {size -> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals scale, then image with size scale * 19 will be selected. Initially only scales 1 and 2 will be supported. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.imageData = {'19': foo}'  */
        path?: any;
        /** Optional. Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  */
        tabId?: number;
        /** Optional. Either an ImageData object or a dictionary {size -> ImageData} representing icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals scale, then image with size scale * 19 will be selected. Initially only scales 1 and 2 will be supported. At least one image must be specified. Note that 'details.imageData = foo' is equivalent to 'details.imageData = {'19': foo}'  */
        imageData?: ImageData;
    }

    export interface PopupDetails {
        /** Optional. Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.  */
        tabId?: number;
        /** The html file to show in a popup. If set to the empty string (''), no popup is shown. */
        popup: string;
    }

    export interface BrowserClickedEvent extends events.Event<(tab: tabs.Tab) => void> { }

    /**
     * Since Chrome 22.
     * Enables the browser action for a tab. By default, browser actions are enabled.
     * @param tabId The id of the tab for which you want to modify the browser action.
     */
    export function enable(tabId?: number): void;
    /** Sets the background color for the badge. */
    export function setBadgeBackgroundColor(details: BadgeBackgroundColorDetails): void;
    /** Sets the badge text for the browser action. The badge is displayed on top of the icon. */
    export function setBadgeText(details: BadgeTextDetails): void;
    /** Sets the title of the browser action. This shows up in the tooltip. */
    export function setTitle(details: TitleDetails): void;
    /**
     * Since Chrome 19.
     * Gets the badge text of the browser action. If no tab is specified, the non-tab-specific badge text is returned.
     */
    export function getBadgeText(details: TabDetails): Promise<string>;
    /** Sets the html document to be opened as a popup when the user clicks on the browser action's icon. */
    export function setPopup(details: PopupDetails): void;
    /**
     * Since Chrome 22.
     * Disables the browser action for a tab.
     * @param tabId The id of the tab for which you want to modify the browser action.
     */
    export function disable(tabId?: number): void;
    /**
     * Since Chrome 19.
     * Gets the title of the browser action.
     */
    export function getTitle(details: TabDetails): Promise<string>;
    /**
     * Since Chrome 19.
     * Gets the background color of the browser action.
     */
    export function getBadgeBackgroundColor(details: TabDetails): Promise<ColorArray>;
    /**
     * Since Chrome 19.
     * Gets the html document set as the popup for this browser action.
     */
    export function getPopup(details: TabDetails): Promise<string>;
    /**
     * Sets the icon for the browser action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the path or the imageData property must be specified.
     */
    export function setIcon(details: TabIconDetails): Promise<void>;

    /** Fired when a browser action icon is clicked. This event will not fire if the browser action has a popup. */
    export var onClicked: BrowserClickedEvent;
}

////////////////////
// Browsing Data
////////////////////
/**
 * Use the browser.browsingData API to remove browsing data from a user's local profile. * Permissions:  "browsingData"
 */
export namespace browsingData {
    export interface OriginTypes {
        /** Optional. Websites that have been installed as hosted applications (be careful!).  */
        protectedWeb?: boolean;
        /** Optional. Extensions and packaged applications a user has installed (be _really_ careful!).  */
        extension?: boolean;
        /** Optional. Normal websites.  */
        unprotectedWeb?: boolean;
    }

    /** Options that determine exactly what data will be removed. */
    export interface RemovalOptions {
        /**
         * Optional.
          * Since Chrome 21.
         * An object whose properties specify which origin types ought to be cleared. If this object isn't specified, it defaults to clearing only "unprotected" origins. Please ensure that you really want to remove application data before adding 'protectedWeb' or 'extensions'.
         */
        originTypes?: OriginTypes;
        /** Optional. Remove data accumulated on or after this date, represented in milliseconds since the epoch (accessible via the getTime method of the JavaScript Date object). If absent, defaults to 0 (which would remove all browsing data).  */
        since?: number;
    }

    /**
     * Since Chrome 27.
     * A set of data types. Missing data types are interpreted as false.
     */
    export interface DataTypeSet {
        /** Optional. Websites' WebSQL data.  */
        webSQL?: boolean;
        /** Optional. Websites' IndexedDB data.  */
        indexedDB?: boolean;
        /** Optional. The browser's cookies.  */
        cookies?: boolean;
        /** Optional. Stored passwords.  */
        passwords?: boolean;
        /** Optional. Server-bound certificates.  */
        serverBoundCertificates?: boolean;
        /** Optional. The browser's download list.  */
        downloads?: boolean;
        /** Optional. The browser's cache. Note: when removing data, this clears the entire cache: it is not limited to the range you specify.  */
        cache?: boolean;
        /** Optional. Websites' appcaches.  */
        appcache?: boolean;
        /** Optional. Websites' file systems.  */
        fileSystems?: boolean;
        /** Optional. Plugins' data.  */
        pluginData?: boolean;
        /** Optional. Websites' local storage data.  */
        localStorage?: boolean;
        /** Optional. The browser's stored form data.  */
        formData?: boolean;
        /** Optional. The browser's history.  */
        history?: boolean;
        /**
         * Optional.
          * Since Chrome 39.
         * Service Workers.
         */
        serviceWorkers?: boolean;
    }

    export interface SettingsCallback {
        options: RemovalOptions;
        /** All of the types will be present in the result, with values of true if they are both selected to be removed and permitted to be removed, otherwise false. */
        dataToRemove: DataTypeSet;
        /** All of the types will be present in the result, with values of true if they are permitted to be removed (e.g., by enterprise policy) and false if not. */
        dataRemovalPermitted: DataTypeSet;
    }

    /**
     * Since Chrome 26.
     * Reports which types of data are currently selected in the 'Clear browsing data' settings UI. Note: some of the data types included in this API are not available in the settings UI, and some UI settings control more than one data type listed here.
     */
    export function settings(): Promise<SettingsCallback>;
    /**
     * Clears plugins' data.
     */
    export function removePluginData(options: RemovalOptions): Promise<void>;
    /**
     * Clears the browser's stored form data (autofill).
     */
    export function removeFormData(options: RemovalOptions): Promise<void>;
    /**
     * Clears websites' file system data.
     */
    export function removeFileSystems(options: RemovalOptions): Promise<void>;
    /**
     * Clears export various types of browsing data stored in a user's profile.
     * @param dataToRemove The set of data types to remove.
     */
    export function remove(options: RemovalOptions, dataToRemove: DataTypeSet): Promise<void>;
    /**
     * Clears the browser's stored passwords.
     */
    export function removePasswords(options: RemovalOptions): Promise<void>;
    /**
     * Clears the browser's cookies and server-bound certificates modified within a particular timeframe.
     */
    export function removeCookies(options: RemovalOptions): Promise<void>;
    /**
     * Clears websites' WebSQL data.
     */
    export function removeWebSQL(options: RemovalOptions): Promise<void>;
    /**
     * Clears websites' appcache data.
     */
    export function removeAppcache(options: RemovalOptions): Promise<void>;
    /**
     * Clears the browser's list of downloaded files (not the downloaded files themselves).
     */
    export function removeDownloads(options: RemovalOptions): Promise<void>;
    /**
     * Clears websites' local storage data.
     */
    export function removeLocalStorage(options: RemovalOptions): Promise<void>;
    /**
     * Clears the browser's cache.
     */
    export function removeCache(options: RemovalOptions): Promise<void>;
    /**
     * Clears the browser's history.
     */
    export function removeHistory(options: RemovalOptions): Promise<void>;
    /**
     * Clears websites' IndexedDB data.
     */
    export function removeIndexedDB(options: RemovalOptions): Promise<void>;
}

////////////////////
// Commands
////////////////////
/**
 * Use the commands API to add keyboard shortcuts that trigger actions in your extension, for example, an action to open the browser action or send a command to the extension. * Manifest:  "commands": {...}
 */
export namespace commands {
    export interface Command {
        /** Optional. The name of the Extension Command  */
        name?: string;
        /** Optional. The Extension Command description  */
        description?: string;
        /** Optional. The shortcut active for this command, or blank if not active.  */
        shortcut?: string;
    }

    export interface CommandEvent extends events.Event<(command: string) => void> { }

    /**
     * Returns all the registered extension commands for this extension and their shortcut (if active).
     */
    export function getAll(callback: (commands: Command[]) => void): void;

    /** Fired when a registered command is activated using a keyboard shortcut. */
    export var onCommand: CommandEvent;
}

////////////////////
// Context Menus
////////////////////
/**
 * Use the browser.contextMenus API to add items to Google Chrome's context menu. You can choose what types of objects your context menu additions apply to, such as images, hyperlinks, and pages. * Permissions:  "contextMenus"
 */
export namespace contextMenus {
    export interface OnClickData {
        /**
         * Optional.
          * Since Chrome 35.
         * The text for the context selection, if any.
         */
        selectionText?: string;
        /**
         * Optional.
          * Since Chrome 35.
         * A flag indicating the state of a checkbox or radio item after it is clicked.
         */
        checked?: boolean;
        /**
         * Since Chrome 35.
         * The ID of the menu item that was clicked.
         */
        menuItemId: any;
        /**
         * Optional.
          * Since Chrome 35.
         * The URL of the frame of the element where the context menu was clicked, if it was in a frame.
         */
        frameUrl?: string;
        /**
         * Since Chrome 35.
         * A flag indicating whether the element is editable (text input, textarea, etc.).
         */
        editable: boolean;
        /**
         * Optional.
          * Since Chrome 35.
         * One of 'image', 'video', or 'audio' if the context menu was activated on one of these types of elements.
         */
        mediaType?: string;
        /**
         * Optional.
          * Since Chrome 35.
         * A flag indicating the state of a checkbox or radio item before it was clicked.
         */
        wasChecked?: boolean;
        /**
         * Since Chrome 35.
         * The URL of the page where the menu item was clicked. This property is not set if the click occured in a context where there is no current page, such as in a launcher context menu.
         */
        pageUrl: string;
        /**
         * Optional.
          * Since Chrome 35.
         * If the element is a link, the URL it points to.
         */
        linkUrl?: string;
        /**
         * Optional.
          * Since Chrome 35.
         * The parent ID, if any, for the item clicked.
         */
        parentMenuItemId?: any;
        /**
         * Optional.
          * Since Chrome 35.
         * Will be present for elements with a 'src' URL.
         */
        srcUrl?: string;
    }

    export interface CreateProperties {
        /** Optional. Lets you restrict the item to apply only to documents whose URL matches one of the given patterns. (This applies to frames as well.) For details on the format of a pattern, see Match Patterns.  */
        documentUrlPatterns?: string[];
        /** Optional. The initial state of a checkbox or radio item: true for selected and false for unselected. Only one radio item can be selected at a time in a given group of radio items.  */
        checked?: boolean;
        /** Optional. The text to be displayed in the item; this is required unless type is 'separator'. When the context is 'selection', you can use %s within the string to show the selected text. For example, if this parameter's value is "Translate '%s' to Pig Latin" and the user selects the word "cool", the context menu item for the selection is "Translate 'cool' to Pig Latin".  */
        title?: string;
        /** Optional. List of contexts this menu item will appear in. Defaults to ['page'] if not specified.  */
        contexts?: string[];
        /**
         * Optional.
          * Since Chrome 20.
         * Whether this context menu item is enabled or disabled. Defaults to true.
         */
        enabled?: boolean;
        /** Optional. Similar to documentUrlPatterns, but lets you filter based on the src attribute of img/audio/video tags and the href of anchor tags.  */
        targetUrlPatterns?: string[];
        /**
         * Optional.
          * A export function that will be called back when the menu item is clicked. Event pages cannot use this; instead, they should register a listener for browser.contextMenus.onClicked.
         * @param info Information sent when a context menu item is clicked.
         * @param tab The details of the tab where the click took place. Note: this parameter only present for extensions.
         */
        onclick?: (info: OnClickData, tab: tabs.Tab) => void;
        /** Optional. The ID of a parent menu item; this makes the item a child of a previously added item.  */
        parentId?: any;
        /** Optional. The type of menu item. Defaults to 'normal' if not specified.  */
        type?: string;
        /**
         * Optional.
          * Since Chrome 21.
         * The unique ID to assign to this item. Mandatory for event pages. Cannot be the same as another ID for this extension.
         */
        id?: string;
    }

    export interface UpdateProperties {
        documentUrlPatterns?: string[];
        checked?: boolean;
        title?: string;
        contexts?: string[];
        /** Optional. Since Chrome 20.  */
        enabled?: boolean;
        targetUrlPatterns?: string[];
        onclick?: Function;
        /** Optional. Note: You cannot change an item to be a child of one of its own descendants.  */
        parentId?: any;
        type?: string;
    }

    export interface MenuClickedEvent extends events.Event<(info: OnClickData, tab?: tabs.Tab) => void> { }

    /**
     * Since Chrome 38.
     * The maximum number of top level extension items that can be added to an extension action context menu. Any items beyond this limit will be ignored.
     */
    export var ACTION_MENU_TOP_LEVEL_LIMIT: number;

    /**
     * Removes all context menu items added by this extension.
     */
    export function removeAll(callback?: () => void): void;
    /**
     * Creates a new context menu item. Note that if an error occurs during creation, you may not find out until the creation callback fires (the details will be in browser.runtime.lastError).
     */
    export function create(createProperties: CreateProperties): Promise<void>;
    /**
     * Updates a previously created context menu item.
     * @param id The ID of the item to update.
     * @param updateProperties The properties to update. Accepts the same values as the create export function.
     */
    export function update(id: string, updateProperties: UpdateProperties): Promise<void>;
    /**
     * Updates a previously created context menu item.
     * @param id The ID of the item to update.
     * @param updateProperties The properties to update. Accepts the same values as the create export function.
     */
    export function update(id: number, updateProperties: UpdateProperties): Promise<void>;
    /**
     * Removes a context menu item.
     * @param menuItemId The ID of the context menu item to remove.
     */
    export function remove(menuItemId: string): Promise<void>;
    /**
     * Removes a context menu item.
     * @param menuItemId The ID of the context menu item to remove.
     */
    export function remove(menuItemId: number): Promise<void>;

    /**
     * Since Chrome 21.
     * Fired when a context menu item is clicked.
     */
    export var onClicked: MenuClickedEvent;
}

////////////////////
// Cookies
////////////////////
/**
 * Use the browser.cookies API to query and modify cookies, and to be notified when they change. * Permissions:  "cookies", host permissions
 */
export namespace cookies {
    /** Represents information about an HTTP cookie. */
    export interface Cookie {
        /** The domain of the cookie (e.g. "www.google.com", "example.com"). */
        domain: string;
        /** The name of the cookie. */
        name: string;
        /** The ID of the cookie store containing this cookie, as provided in getAllCookieStores(). */
        storeId: string;
        /** The value of the cookie. */
        value: string;
        /** True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date. */
        session: boolean;
        /** True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie). */
        hostOnly: boolean;
        /** Optional. The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies.  */
        expirationDate?: number;
        /** The path of the cookie. */
        path: string;
        /** True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts). */
        httpOnly: boolean;
        /** True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS). */
        secure: boolean;
    }

    /** Represents a cookie store in the browser. An incognito mode window, for instance, uses a separate cookie store from a non-incognito window. */
    export interface CookieStore {
        /** The unique identifier for the cookie store. */
        id: string;
        /** Identifiers of all the browser tabs that share this cookie store. */
        tabIds: number[];
    }

    export interface GetAllDetails {
        /** Optional. Restricts the retrieved cookies to those whose domains match or are subdomains of this one.  */
        domain?: string;
        /** Optional. Filters the cookies by name.  */
        name?: string;
        /** Optional. Restricts the retrieved cookies to those that would match the given URL.  */
        url?: string;
        /** Optional. The cookie store to retrieve cookies from. If omitted, the current execution context's cookie store will be used.  */
        storeId?: string;
        /** Optional. Filters out session vs. persistent cookies.  */
        session?: boolean;
        /** Optional. Restricts the retrieved cookies to those whose path exactly matches this string.  */
        path?: string;
        /** Optional. Filters the cookies by their Secure property.  */
        secure?: boolean;
    }

    export interface SetDetails {
        /** Optional. The domain of the cookie. If omitted, the cookie becomes a host-only cookie.  */
        domain?: string;
        /** Optional. The name of the cookie. Empty by default if omitted.  */
        name?: string;
        /** The request-URI to associate with the setting of the cookie. This value can affect the default domain and path values of the created cookie. If host permissions for this URL are not specified in the manifest file, the API call will fail. */
        url: string;
        /** Optional. The ID of the cookie store in which to set the cookie. By default, the cookie is set in the current execution context's cookie store.  */
        storeId?: string;
        /** Optional. The value of the cookie. Empty by default if omitted.  */
        value?: string;
        /** Optional. The expiration date of the cookie as the number of seconds since the UNIX epoch. If omitted, the cookie becomes a session cookie.  */
        expirationDate?: number;
        /** Optional. The path of the cookie. Defaults to the path portion of the url parameter.  */
        path?: string;
        /** Optional. Whether the cookie should be marked as HttpOnly. Defaults to false.  */
        httpOnly?: boolean;
        /** Optional. Whether the cookie should be marked as Secure. Defaults to false.  */
        secure?: boolean;
    }

    export interface Details {
        name: string;
        url: string;
        storeId?: string;
    }

    export interface CookieChangeInfo {
        /** Information about the cookie that was set or removed. */
        cookie: Cookie;
        /** True if a cookie was removed. */
        removed: boolean;
        /**
         * Since Chrome 12.
         * The underlying reason behind the cookie's change.
         */
        cause: string;
    }

    export interface CookieChangedEvent extends events.Event<(changeInfo: CookieChangeInfo) => void> { }

    /**
     * Lists all existing cookie stores.
     * Parameter cookieStores: All the existing cookie stores.
     */
    export function getAllCookieStores(callback: (cookieStores: CookieStore[]) => void): void;
    /**
     * Retrieves all cookies from a single cookie store that match the given information. The cookies returned will be sorted, with those with the longest path first. If multiple cookies have the same path length, those with the earliest creation time will be first.
     * @param details Information to filter the cookies being retrieved.
     * Parameter cookies: All the existing, unexpired cookies that match the given cookie info.
     */
    export function getAll(details: GetAllDetails, callback: (cookies: Cookie[]) => void): void;
    /**
     * Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.
     * @param details Details about the cookie being set.
     * Optional parameter cookie: Contains details about the cookie that's been set. If setting failed for any reason, this will be "null", and "browser.runtime.lastError" will be set.
     */
    export function set(details: SetDetails): Promise<Cookie | null>;
    /**
     * Deletes a cookie by name.
     * @param details Information to identify the cookie to remove.
     */
    export function remove(details: Details): Promise<Details>;
    /**
     * Retrieves information about a single cookie. If more than one cookie of the same name exists for the given URL, the one with the longest path will be returned. For cookies with the same path length, the cookie with the earliest creation time will be returned.
     * @param details Details to identify the cookie being retrieved.
     * Parameter cookie: Contains details about the cookie. This parameter is null if no such cookie was found.
     */
    export function get(details: Details, callback: (cookie: Cookie | null) => void): void;

    /** Fired when a cookie is set or removed. As a special case, note that updating a cookie's properties is implemented as a two step process: the cookie to be updated is first removed entirely, generating a notification with "cause" of "overwrite" . Afterwards, a new cookie is written with the updated values, generating a second notification with "cause" "explicit". */
    export var onChanged: CookieChangedEvent;
}

////////////////////
// Dev Tools - Inspected Window
////////////////////
/**
 * Use the browser.devtools.inspectedWindow API to interact with the inspected window: obtain the tab ID for the inspected page, evaluate the code in the context of the inspected window, reload the page, or obtain the list of resources within the page. */
export namespace devtools.inspectedWindow {
    /** A resource within the inspected page, such as a document, a script, or an image. */
    export interface Resource {
        /** The URL of the resource. */
        url: string;
        /**
         * Gets the content of the resource.
         * Parameter content: Content of the resource (potentially encoded).
         * Parameter encoding: Empty if content is not encoded, encoding name otherwise. Currently, only base64 is supported.
         */
        getContent(callback: (content: string, encoding: string) => void): void;
        /**
         * Sets the content of the resource.
         * @param content New content of the resource. Only resources with the text type are currently supported.
         * @param commit True if the user has finished editing the resource, and the new content of the resource should be persisted; false if this is a minor change sent in progress of the user editing the resource.
         * Optional parameter error: Set to undefined if the resource content was set successfully; describes error otherwise.
         */
        setContent(content: string, commit: boolean): Promise<Object>;
    }

    export interface ReloadOptions {
        /** Optional. If specified, the string will override the value of the User-Agent HTTP header that's sent while loading the resources of the inspected page. The string will also override the value of the navigator.userAgent property that's returned to any scripts that are running within the inspected page.  */
        userAgent?: string;
        /** Optional. When true, the loader will ignore the cache for all inspected page resources loaded before the load event is fired. The effect is similar to pressing Ctrl+Shift+R in the inspected window or within the Developer Tools window.  */
        ignoreCache?: boolean;
        /** Optional. If specified, the script will be injected into every frame of the inspected page immediately upon load, before any of the frame's scripts. The script will not be injected after subsequent reloads—for example, if the user presses Ctrl+R.  */
        injectedScript?: string;
        /**
         * Optional.
          * If specified, this script evaluates into a export function that accepts three string arguments: the source to preprocess, the URL of the source, and a export function name if the source is an DOM event handler. The preprocessorerScript export function should return a string to be compiled by Chrome in place of the input source. In the case that the source is a DOM event handler, the returned source must compile to a single JS export function.
         * @deprecated Deprecated since Chrome 41. Please avoid using this parameter, it will be removed soon.
         */
        preprocessorScript?: string;
    }

    export interface EvaluationExceptionInfo {
        /** Set if the error occurred on the DevTools side before the expression is evaluated. */
        isError: boolean;
        /** Set if the error occurred on the DevTools side before the expression is evaluated. */
        code: string;
        /** Set if the error occurred on the DevTools side before the expression is evaluated. */
        description: string;
        /** Set if the error occurred on the DevTools side before the expression is evaluated, contains the array of the values that may be substituted into the description string to provide more information about the cause of the error. */
        details: any[];
        /** Set if the evaluated code produces an unhandled exception. */
        isException: boolean;
        /** Set if the evaluated code produces an unhandled exception. */
        value: string;
    }

    export interface ResourceAddedEvent extends events.Event<(resource: Resource) => void> { }

    export interface ResourceContentCommittedEvent extends events.Event<(resource: Resource, content: string) => void> { }

    /** The ID of the tab being inspected. This ID may be used with tabs.* API. */
    export var tabId: number;

    /** Reloads the inspected page. */
    export function reload(reloadOptions: ReloadOptions): void;
    /**
     * Evaluates a JavaScript expression in the context of the main frame of the inspected page. The expression must evaluate to a JSON-compliant object, otherwise an exception is thrown. The eval export function can report either a DevTools-side error or a JavaScript exception that occurs during evaluation. In either case, the result parameter of the callback is undefined. In the case of a DevTools-side error, the isException parameter is non-null and has isError set to true and code set to an error code. In the case of a JavaScript error, isException is set to true and value is set to the string value of thrown object.
     * @param expression An expression to evaluate.
     * Parameter result: The result of evaluation.
     * Parameter exceptionInfo: An object providing details if an exception occurred while evaluating the expression.
     */
    export function eval(expression: string, callback?: (result: Object, exceptionInfo: EvaluationExceptionInfo) => void): void;
    /**
     * Retrieves the list of resources from the inspected page.
     */
    export function getResources(callback: (resources: Resource[]) => void): void;

    /** Fired when a new resource is added to the inspected page. */
    export var onResourceAdded: ResourceAddedEvent;
    /** Fired when a new revision of the resource is committed (e.g. user saves an edited version of the resource in the Developer Tools). */
    export var onResourceContentCommitted: ResourceContentCommittedEvent;
}

////////////////////
// Dev Tools - Network
////////////////////
/**
 * Use the browser.devtools.network API to retrieve the information about network requests displayed by the Developer Tools in the Network panel. */
export namespace devtools.network {
    /** Represents a network request for a document resource (script, image and so on). See HAR Specification for reference. */
    export interface Request {
        /**
         * Returns content of the response body.
         * Parameter content: Content of the response body (potentially encoded).
         * Parameter encoding: Empty if content is not encoded, encoding name otherwise. Currently, only base64 is supported.
         */
        getContent(callback: (content: string, encoding: string) => void): void;
    }

    export interface RequestFinishedEvent extends events.Event<(request: Request) => void> { }

    export interface NavigatedEvent extends events.Event<(url: string) => void> { }

    /**
     * Returns HAR log that contains all known network requests.
     * Parameter harLog: A HAR log. See HAR specification for details.
     */
    export function getHAR(): Promise<Object>;

    /** Fired when a network request is finished and all request data are available. */
    export var onRequestFinished: RequestFinishedEvent;
    /** Fired when the inspected window navigates to a new page. */
    export var onNavigated: NavigatedEvent;
}

////////////////////
// Dev Tools - Panels
////////////////////
/**
 * Use the browser.devtools.panels API to integrate your extension into Developer Tools window UI: create your own panels, access existing panels, and add sidebars. */
export namespace devtools.panels {
    export interface PanelShownEvent extends events.Event<(window: windows.Window) => void> { }

    export interface PanelHiddenEvent extends events.Event<() => void> { }

    export interface PanelSearchEvent extends events.Event<(action: string, queryString?: string) => void> { }

    /** Represents a panel created by extension. */
    export interface ExtensionPanel {
        /**
         * Appends a button to the status bar of the panel.
         * @param iconPath Path to the icon of the button. The file should contain a 64x24-pixel image composed of two 32x24 icons. The left icon is used when the button is inactive; the right icon is displayed when the button is pressed.
         * @param tooltipText Text shown as a tooltip when user hovers the mouse over the button.
         * @param disabled Whether the button is disabled.
         */
        createStatusBarButton(iconPath: string, tooltipText: string, disabled: boolean): Button;
        /** Fired when the user switches to the panel. */
        onShown: PanelShownEvent;
        /** Fired when the user switches away from the panel. */
        onHidden: PanelHiddenEvent;
        /** Fired upon a search action (start of a new search, search result navigation, or search being canceled). */
        onSearch: PanelSearchEvent;
    }

    export interface ButtonClickedEvent extends events.Event<() => void> { }

    /** A button created by the extension. */
    export interface Button {
        /**
         * Updates the attributes of the button. If some of the arguments are omitted or null, the corresponding attributes are not updated.
         * @param iconPath Path to the new icon of the button.
         * @param tooltipText Text shown as a tooltip when user hovers the mouse over the button.
         * @param disabled Whether the button is disabled.
         */
        update(iconPath?: string | null, tooltipText?: string | null, disabled?: boolean | null): void;
        /** Fired when the button is clicked. */
        onClicked: ButtonClickedEvent;
    }

    export interface SelectionChangedEvent extends events.Event<() => void> { }

    /** Represents the Elements panel. */
    export interface ElementsPanel {
        /**
         * Creates a pane within panel's sidebar.
         * @param title Text that is displayed in sidebar caption.
         * Parameter result: An ExtensionSidebarPane object for created sidebar pane.
         */
        createSidebarPane(title: string): Promise<ExtensionSidebarPane>;
        /** Fired when an object is selected in the panel. */
        onSelectionChanged: SelectionChangedEvent;
    }

    /**
     * Since Chrome 41.
     * Represents the Sources panel.
     */
    export interface SourcesPanel {
        /**
         * Creates a pane within panel's sidebar.
         * @param title Text that is displayed in sidebar caption.
         * Parameter result: An ExtensionSidebarPane object for created sidebar pane.
         */
        createSidebarPane(title: string): Promise<ExtensionSidebarPane>;
        /** Fired when an object is selected in the panel. */
        onSelectionChanged: SelectionChangedEvent;
    }

    export interface ExtensionSidebarPaneShownEvent extends events.Event<(window: windows.Window) => void> { }

    export interface ExtensionSidebarPaneHiddenEvent extends events.Event<() => void> { }

    /** A sidebar created by the extension. */
    export interface ExtensionSidebarPane {
        /**
         * Sets the height of the sidebar.
         * @param height A CSS-like size specification, such as '100px' or '12ex'.
         */
        setHeight(height: string): void;
        /**
         * Sets an expression that is evaluated within the inspected page. The result is displayed in the sidebar pane.
         * @param expression An expression to be evaluated in context of the inspected page. JavaScript objects and DOM nodes are displayed in an expandable tree similar to the console/watch.
         * @param rootTitle An optional title for the root of the expression tree.
         */
        setExpression(expression: string, rootTitle?: string): Promise<void>;
        /**
         * Sets an expression that is evaluated within the inspected page. The result is displayed in the sidebar pane.
         * @param expression An expression to be evaluated in context of the inspected page. JavaScript objects and DOM nodes are displayed in an expandable tree similar to the console/watch.
         */
        setExpression(expression: string): Promise<void>;
        /**
         * Sets a JSON-compliant object to be displayed in the sidebar pane.
         * @param jsonObject An object to be displayed in context of the inspected page. Evaluated in the context of the caller (API client).
         * @param rootTitle An optional title for the root of the expression tree.
         */
        setObject(jsonObject: Object, rootTitle?: string): Promise<void>;
        /**
         * Sets a JSON-compliant object to be displayed in the sidebar pane.
         * @param jsonObject An object to be displayed in context of the inspected page. Evaluated in the context of the caller (API client).
         */
        setObject(jsonObject: Object): Promise<void>;
        /**
         * Sets an HTML page to be displayed in the sidebar pane.
         * @param path Relative path of an extension page to display within the sidebar.
         */
        setPage(path: string): void;
        /** Fired when the sidebar pane becomes visible as a result of user switching to the panel that hosts it. */
        onShown: ExtensionSidebarPaneShownEvent;
        /** Fired when the sidebar pane becomes hidden as a result of the user switching away from the panel that hosts the sidebar pane. */
        onHidden: ExtensionSidebarPaneHiddenEvent;
    }

    /** Elements panel. */
    export var elements: ElementsPanel;
    /**
     * Since Chrome 38.
     * Sources panel.
     */
    export var sources: SourcesPanel;

    /**
     * Creates an extension panel.
     * @param title Title that is displayed next to the extension icon in the Developer Tools toolbar.
     * @param iconPath Path of the panel's icon relative to the extension directory.
     * @param pagePath Path of the panel's HTML page relative to the extension directory.
     * Parameter panel: An ExtensionPanel object representing the created panel.
     */
    export function create(title: string, iconPath: string, pagePath: string): Promise<ExtensionPanel>;
    /**
     * Specifies the export function to be called when the user clicks a resource link in the Developer Tools window. To unset the handler, either call the method with no parameters or pass null as the parameter.
     * Parameter resource: A devtools.inspectedWindow.Resource object for the resource that was clicked.
     */
    export function setOpenResourceHandler(callback?: (resource: devtools.inspectedWindow.Resource) => void): void;
    /**
     * Since Chrome 38.
     * Requests DevTools to open a URL in a Developer Tools panel.
     * @param url The URL of the resource to open.
     * @param lineNumber Specifies the line number to scroll to when the resource is loaded.
     */
    export function openResource(url: string, lineNumber: number, callback: () => void): void;
}

////////////////////
// Dev Tools - Downloads
////////////////////
/**
 * Use the browser.downloads API to programmatically initiate, monitor, manipulate, and search for downloads. * Permissions:  "downloads"
 */
export namespace downloads {
    export interface HeaderNameValuePair {
        /** Name of the HTTP header. */
        name: string;
        /** Value of the HTTP header. */
        value: string;
    }

    export interface DownloadOptions {
        /** Optional. Post body.  */
        body?: string;
        /** Optional. Use a file-chooser to allow the user to select a filename regardless of whether filename is set or already exists.  */
        saveAs?: boolean;
        /** The URL to download. */
        url: string;
        /** Optional. A file path relative to the Downloads directory to contain the downloaded file, possibly containing subdirectories. Absolute paths, empty paths, and paths containing back-references ".." will cause an error. onDeterminingFilename allows suggesting a filename after the file's MIME type and a tentative filename have been determined.  */
        filename?: string;
        /** Optional. Extra HTTP headers to send with the request if the URL uses the HTTP[s] protocol. Each header is represented as a dictionary containing the keys name and either value or binaryValue, restricted to those allowed by XMLHttpRequest.  */
        headers?: HeaderNameValuePair[];
        /** Optional. The HTTP method to use if the URL uses the HTTP[S] protocol.  */
        method?: string;
        /** Optional. The action to take if filename already exists.  */
        conflictAction?: string;
    }

    export interface DownloadDelta {
        /** Optional. The change in danger, if any.  */
        danger?: StringDelta;
        /** Optional. The change in url, if any.  */
        url?: StringDelta;
        /** Optional. The change in totalBytes, if any.  */
        totalBytes?: DoubleDelta;
        /** Optional. The change in filename, if any.  */
        filename?: StringDelta;
        /** Optional. The change in paused, if any.  */
        paused?: BooleanDelta;
        /** Optional. The change in state, if any.  */
        state?: StringDelta;
        /** Optional. The change in mime, if any.  */
        mime?: StringDelta;
        /** Optional. The change in fileSize, if any.  */
        fileSize?: DoubleDelta;
        /** Optional. The change in startTime, if any.  */
        startTime?: DoubleDelta;
        /** Optional. The change in error, if any.  */
        error?: StringDelta;
        /** Optional. The change in endTime, if any.  */
        endTime?: DoubleDelta;
        /** The id of the DownloadItem that changed. */
        id: number;
        /** Optional. The change in canResume, if any.  */
        canResume?: BooleanDelta;
        /** Optional. The change in exists, if any.  */
        exists?: BooleanDelta;
    }

    export interface BooleanDelta {
        current?: boolean;
        previous?: boolean;
    }

    /** Since Chrome 34. */
    export interface DoubleDelta {
        current?: number;
        previous?: number;
    }

    export interface StringDelta {
        current?: string;
        previous?: string;
    }

    export interface DownloadItem {
        /** Number of bytes received so far from the host, without considering file compression. */
        bytesReceived: number;
        /** Indication of whether this download is thought to be safe or known to be suspicious. */
        danger: string;
        /** Absolute URL. */
        url: string;
        /** Number of bytes in the whole file, without considering file compression, or -1 if unknown. */
        totalBytes: number;
        /** Absolute local path. */
        filename: string;
        /** True if the download has stopped reading data from the host, but kept the connection open. */
        paused: boolean;
        /** Indicates whether the download is progressing, interrupted, or complete. */
        state: string;
        /** The file's MIME type. */
        mime: string;
        /** Number of bytes in the whole file post-decompression, or -1 if unknown. */
        fileSize: number;
        /** The time when the download began in ISO 8601 format. May be passed directly to the Date constructor: browser.downloads.search({}, export function(items){items.forEach(export function(item){console.log(new Date(item.startTime))})}) */
        startTime: string;
        /** Optional. Why the download was interrupted. Several kinds of HTTP errors may be grouped under one of the errors beginning with SERVER_. Errors relating to the network begin with NETWORK_, errors relating to the process of writing the file to the file system begin with FILE_, and interruptions initiated by the user begin with USER_.  */
        error?: string;
        /** Optional. The time when the download ended in ISO 8601 format. May be passed directly to the Date constructor: browser.downloads.search({}, export function(items){items.forEach(export function(item){if (item.endTime) console.log(new Date(item.endTime))})})  */
        endTime?: string;
        /** An identifier that is persistent across browser sessions. */
        id: number;
        /** False if this download is recorded in the history, true if it is not recorded. */
        incognito: boolean;
        /** Absolute URL. */
        referrer: string;
        /** Optional. Estimated time when the download will complete in ISO 8601 format. May be passed directly to the Date constructor: browser.downloads.search({}, export function(items){items.forEach(export function(item){if (item.estimatedEndTime) console.log(new Date(item.estimatedEndTime))})})  */
        estimatedEndTime?: string;
        /** True if the download is in progress and paused, or else if it is interrupted and can be resumed starting from where it was interrupted. */
        canResume: boolean;
        /** Whether the downloaded file still exists. This information may be out of date because Chrome does not automatically watch for file removal. Call search() in order to trigger the check for file existence. When the existence check completes, if the file has been deleted, then an onChanged event will fire. Note that search() does not wait for the existence check to finish before returning, so results from search() may not accurately reflect the file system. Also, search() may be called as often as necessary, but will not check for file existence any more frequently than once every 10 seconds. */
        exists: boolean;
        /** Optional. The identifier for the extension that initiated this download if this download was initiated by an extension. Does not change once it is set.  */
        byExtensionId?: string;
        /** Optional. The localized name of the extension that initiated this download if this download was initiated by an extension. May change if the extension changes its name or if the user changes their locale.  */
        byExtensionName?: string;
    }

    export interface GetFileIconOptions {
        /** Optional. * The size of the returned icon. The icon will be square with dimensions size * size pixels. The default and largest size for the icon is 32x32 pixels. The only supported sizes are 16 and 32. It is an error to specify any other size.
 */
        size?: number;
    }

    export interface DownloadQuery {
        /** Optional. Set elements of this array to DownloadItem properties in order to sort search results. For example, setting orderBy=['startTime'] sorts the DownloadItem by their start time in ascending order. To specify descending order, prefix with a hyphen: '-startTime'.  */
        orderBy?: string[];
        /** Optional. Limits results to DownloadItem whose url matches the given regular expression.  */
        urlRegex?: string;
        /** Optional. Limits results to DownloadItem that ended before the given ms since the epoch.  */
        endedBefore?: number;
        /** Optional. Limits results to DownloadItem whose totalBytes is greater than the given integer.  */
        totalBytesGreater?: number;
        /** Optional. Indication of whether this download is thought to be safe or known to be suspicious.  */
        danger?: string;
        /** Optional. Number of bytes in the whole file, without considering file compression, or -1 if unknown.  */
        totalBytes?: number;
        /** Optional. True if the download has stopped reading data from the host, but kept the connection open.  */
        paused?: boolean;
        /** Optional. Limits results to DownloadItem whose filename matches the given regular expression.  */
        filenameRegex?: string;
        /** Optional. This array of search terms limits results to DownloadItem whose filename or url contain all of the search terms that do not begin with a dash '-' and none of the search terms that do begin with a dash.  */
        query?: string[];
        /** Optional. Limits results to DownloadItem whose totalBytes is less than the given integer.  */
        totalBytesLess?: number;
        /** Optional. The id of the DownloadItem to query.  */
        id?: number;
        /** Optional. Number of bytes received so far from the host, without considering file compression.  */
        bytesReceived?: number;
        /** Optional. Limits results to DownloadItem that ended after the given ms since the epoch.  */
        endedAfter?: number;
        /** Optional. Absolute local path.  */
        filename?: string;
        /** Optional. Indicates whether the download is progressing, interrupted, or complete.  */
        state?: string;
        /** Optional. Limits results to DownloadItem that started after the given ms since the epoch.  */
        startedAfter?: number;
        /** Optional. The file's MIME type.  */
        mime?: string;
        /** Optional. Number of bytes in the whole file post-decompression, or -1 if unknown.  */
        fileSize?: number;
        /** Optional. The time when the download began in ISO 8601 format.  */
        startTime?: number;
        /** Optional. Absolute URL.  */
        url?: string;
        /** Optional. Limits results to DownloadItem that started before the given ms since the epoch.  */
        startedBefore?: number;
        /** Optional. The maximum number of matching DownloadItem returned. Defaults to 1000. Set to 0 in order to return all matching DownloadItem. See search for how to page through results.  */
        limit?: number;
        /** Optional. Why a download was interrupted.  */
        error?: number;
        /** Optional. The time when the download ended in ISO 8601 format.  */
        endTime?: number;
        /** Optional. Whether the downloaded file exists;  */
        exists?: boolean;
    }

    export interface DownloadFilenameSuggestion {
        /** The DownloadItem's new target DownloadItem.filename, as a path relative to the user's default Downloads directory, possibly containing subdirectories. Absolute paths, empty paths, and paths containing back-references ".." will be ignored. */
        filename: string;
        /** Optional. The action to take if filename already exists.  */
        conflictAction?: string;
    }

    export interface DownloadChangedEvent extends events.Event<(downloadDelta: DownloadDelta) => void> { }

    export interface DownloadCreatedEvent extends events.Event<(downloadItem: DownloadItem) => void> { }

    export interface DownloadErasedEvent extends events.Event<(downloadId: number) => void> { }

    export interface DownloadDeterminingFilenameEvent extends events.Event<(downloadItem: DownloadItem, suggest: (suggestion?: DownloadFilenameSuggestion) => void) => void> { }

    /**
     * Find DownloadItem. Set query to the empty object to get all DownloadItem. To get a specific DownloadItem, set only the id field. To page through a large number of items, set orderBy: ['-startTime'], set limit to the number of items per page, and set startedAfter to the startTime of the last item from the last page.
     */
    export function search(query: DownloadQuery): Promise<DownloadItem[]>;
    /**
     * Pause the download. If the request was successful the download is in a paused state. Otherwise runtime.lastError contains an error message. The request will fail if the download is not active.
     * @param downloadId The id of the download to pause.
     */
    export function pause(downloadId: number): Promise<void>;
    /**
     * Retrieve an icon for the specified download. For new downloads, file icons are available after the onCreated event has been received. The image returned by this export function while a download is in progress may be different from the image returned after the download is complete. Icon retrieval is done by querying the underlying operating system or toolkit depending on the platform. The icon that is returned will therefore depend on a number of factors including state of the download, platform, registered file types and visual theme. If a file icon cannot be determined, runtime.lastError will contain an error message.
     * @param downloadId The identifier for the download.
     */
    export function getFileIcon(downloadId: number, ): Promise<string>;
    /**
     * Retrieve an icon for the specified download. For new downloads, file icons are available after the onCreated event has been received. The image returned by this export function while a download is in progress may be different from the image returned after the download is complete. Icon retrieval is done by querying the underlying operating system or toolkit depending on the platform. The icon that is returned will therefore depend on a number of factors including state of the download, platform, registered file types and visual theme. If a file icon cannot be determined, runtime.lastError will contain an error message.
     * @param downloadId The identifier for the download.
     */
    export function getFileIcon(downloadId: number, options: GetFileIconOptions, ): Promise<string>;
    /**
     * Resume a paused download. If the request was successful the download is in progress and unpaused. Otherwise runtime.lastError contains an error message. The request will fail if the download is not active.
     * @param downloadId The id of the download to resume.
     */
    export function resume(downloadId: number): Promise<void>;
    /**
     * Cancel a download. When callback is run, the download is cancelled, completed, interrupted or doesn't exist anymore.
     * @param downloadId The id of the download to cancel.
     */
    export function cancel(downloadId: number): Promise<void>;
    /**
     * Download a URL. If the URL uses the HTTP[S] protocol, then the request will include all cookies currently set for its hostname. If both filename and saveAs are specified, then the Save As dialog will be displayed, pre-populated with the specified filename. If the download started successfully, callback will be called with the new DownloadItem's downloadId. If there was an error starting the download, then callback will be called with downloadId=undefined and runtime.lastError will contain a descriptive string. The error strings are not guaranteed to remain backwards compatible between releases. Extensions must not parse it.
     * @param options What to download and how.
     */
    export function download(options: DownloadOptions): Promise<number>;
    /**
     * Open the downloaded file now if the DownloadItem is complete; otherwise returns an error through runtime.lastError. Requires the "downloads.open" permission in addition to the "downloads" permission. An onChanged event will fire when the item is opened for the first time.
     * @param downloadId The identifier for the downloaded file.
     */
    export function open(downloadId: number): void;
    /**
     * Show the downloaded file in its folder in a file manager.
     * @param downloadId The identifier for the downloaded file.
     */
    export function show(downloadId: number): void;
    /** Show the default Downloads folder in a file manager. */
    export function showDefaultFolder(): void;
    /**
     * Erase matching DownloadItem from history without deleting the downloaded file. An onErased event will fire for each DownloadItem that matches query, then callback will be called.
     */
    export function erase(query: DownloadQuery, callback: (erasedIds: number[]) => void): void;
    /**
     * Remove the downloaded file if it exists and the DownloadItem is complete; otherwise return an error through runtime.lastError.
     */
    export function removeFile(downloadId: number): Promise<void>;
    /**
     * Prompt the user to accept a dangerous download. Can only be called from a visible context (tab, window, or page/browser action popup). Does not automatically accept dangerous downloads. If the download is accepted, then an onChanged event will fire, otherwise nothing will happen. When all the data is fetched into a temporary file and either the download is not dangerous or the danger has been accepted, then the temporary file is renamed to the target filename, the |state| changes to 'complete', and onChanged fires.
     * @param downloadId The identifier for the DownloadItem.
     */
    export function acceptDanger(downloadId: number, callback: () => void): void;
    /** Initiate dragging the downloaded file to another application. Call in a javascript ondragstart handler. */
    export function drag(downloadId: number): void;
    /** Enable or disable the gray shelf at the bottom of every window associated with the current browser profile. The shelf will be disabled as long as at least one extension has disabled it. Enabling the shelf while at least one other extension has disabled it will return an error through runtime.lastError. Requires the "downloads.shelf" permission in addition to the "downloads" permission. */
    export function setShelfEnabled(enabled: boolean): void;

    /** When any of a DownloadItem's properties except bytesReceived and estimatedEndTime changes, this event fires with the downloadId and an object containing the properties that changed. */
    export var onChanged: DownloadChangedEvent;
    /** This event fires with the DownloadItem object when a download begins. */
    export var onCreated: DownloadCreatedEvent;
    /** Fires with the downloadId when a download is erased from history. */
    export var onErased: DownloadErasedEvent;
    /** During the filename determination process, extensions will be given the opportunity to override the target DownloadItem.filename. Each extension may not register more than one listener for this event. Each listener must call suggest exactly once, either synchronously or asynchronously. If the listener calls suggest asynchronously, then it must return true. If the listener neither calls suggest synchronously nor returns true, then suggest will be called automatically. The DownloadItem will not complete until all listeners have called suggest. Listeners may call suggest without any arguments in order to allow the download to use downloadItem.filename for its filename, or pass a suggestion object to suggest in order to override the target filename. If more than one extension overrides the filename, then the last extension installed whose listener passes a suggestion object to suggest wins. In order to avoid confusion regarding which extension will win, users should not install extensions that may conflict. If the download is initiated by download and the target filename is known before the MIME type and tentative filename have been determined, pass filename to download instead. */
    export var onDeterminingFilename: DownloadDeterminingFilenameEvent;
}

////////////////////
// Events
////////////////////
/**
 * The events namespace contains common types used by APIs dispatching events to notify you when something interesting happens. */
export namespace events {
    /** Filters URLs for export various criteria. See event filtering. All criteria are case sensitive. */
    export interface UrlFilter {
        /** Optional. Matches if the scheme of the URL is equal to any of the schemes specified in the array.  */
        schemes?: string[];
        /**
         * Optional.
          * Since Chrome 23.
         * Matches if the URL (without fragment identifier) matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.
         */
        urlMatches?: string;
        /** Optional. Matches if the path segment of the URL contains a specified string.  */
        pathContains?: string;
        /** Optional. Matches if the host name of the URL ends with a specified string.  */
        hostSuffix?: string;
        /** Optional. Matches if the host name of the URL starts with a specified string.  */
        hostPrefix?: string;
        /** Optional. Matches if the host name of the URL contains a specified string. To test whether a host name component has a prefix 'foo', use hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com', because an implicit dot is added at the beginning of the host name. Similarly, hostContains can be used to match against component suffix ('foo.') and to exactly match against components ('.foo.'). Suffix- and exact-matching for the last components need to be done separately using hostSuffix, because no implicit dot is added at the end of the host name.  */
        hostContains?: string;
        /** Optional. Matches if the URL (without fragment identifier) contains a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlContains?: string;
        /** Optional. Matches if the query segment of the URL ends with a specified string.  */
        querySuffix?: string;
        /** Optional. Matches if the URL (without fragment identifier) starts with a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlPrefix?: string;
        /** Optional. Matches if the host name of the URL is equal to a specified string.  */
        hostEquals?: string;
        /** Optional. Matches if the URL (without fragment identifier) is equal to a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlEquals?: string;
        /** Optional. Matches if the query segment of the URL contains a specified string.  */
        queryContains?: string;
        /** Optional. Matches if the path segment of the URL starts with a specified string.  */
        pathPrefix?: string;
        /** Optional. Matches if the path segment of the URL is equal to a specified string.  */
        pathEquals?: string;
        /** Optional. Matches if the path segment of the URL ends with a specified string.  */
        pathSuffix?: string;
        /** Optional. Matches if the query segment of the URL is equal to a specified string.  */
        queryEquals?: string;
        /** Optional. Matches if the query segment of the URL starts with a specified string.  */
        queryPrefix?: string;
        /** Optional. Matches if the URL (without fragment identifier) ends with a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlSuffix?: string;
        /** Optional. Matches if the port of the URL is contained in any of the specified port lists. For example [80, 443, [1000, 1200]] matches all requests on port 80, 443 and in the range 1000-1200.  */
        ports?: any[];
        /**
         * Optional.
          * Since Chrome 28.
         * Matches if the URL without query segment and fragment identifier matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.
         */
        originAndPathMatches?: string;
    }

    /** An object which allows the addition and removal of listeners for a Chrome event. */
    export interface Event<T extends Function> {
        /**
         * Registers an event listener callback to an event.
         */
        addListener(callback: T): void;
        /**
         * Returns currently registered rules.
         * Parameter rules: Rules that were registered, the optional parameters are filled with values.
         */
        getRules(callback: (rules: Rule[]) => void): void;
        /**
         * Returns currently registered rules.
         * @param ruleIdentifiers If an array is passed, only rules with identifiers contained in this array are returned.
         * Parameter rules: Rules that were registered, the optional parameters are filled with values.
         */
        getRules(ruleIdentifiers: string[], callback: (rules: Rule[]) => void): void;
        /**
         * @param callback Listener whose registration status shall be tested.
         */
        hasListener(callback: T): boolean;
        /**
         * Unregisters currently registered rules.
         * @param ruleIdentifiers If an array is passed, only rules with identifiers contained in this array are unregistered.
         */
        removeRules(ruleIdentifiers?: string[]): Promise<void>;
        /**
         * Unregisters currently registered rules.
         */
        removeRules(callback?: () => void): void;
        /**
         * Registers rules to handle events.
         * @param rules Rules to be registered. These do not replace previously registered rules.
         * Parameter rules: Rules that were registered, the optional parameters are filled with values.
         */
        addRules(rules: Rule[]): Promise<Rule[]>;
        /**
         * Deregisters an event listener callback from an event.
         */
        removeListener(callback: T): void;
        hasListeners(): boolean;
    }

    /** Description of a declarative rule for handling events. */
    export interface Rule {
        /** Optional. Optional priority of this rule. Defaults to 100.  */
        priority?: number;
        /** List of conditions that can trigger the actions. */
        conditions: any[];
        /** Optional. Optional identifier that allows referencing this rule.  */
        id?: string;
        /** List of actions that are triggered if one of the condtions is fulfilled. */
        actions: any[];
        /**
         * Optional.
          * Since Chrome 28.
         * Tags can be used to annotate rules and perform operations on sets of rules.
         */
        tags?: string[];
    }
}

////////////////////
// Extension
////////////////////
/**
 * The browser.extension API has utilities that can be used by any extension page. It includes support for exchanging messages between an extension and its content scripts or between extensions, as described in detail in Message Passing. */
export namespace extension {
    export interface FetchProperties {
        /** Optional. The window to restrict the search to. If omitted, returns all views.  */
        windowId?: number;
        /** Optional. The type of view to get. If omitted, returns all views (including background pages and tabs). Valid values: 'tab', 'notification', 'popup'.  */
        type?: string;
    }

    export interface LastError {
        /** Description of the error that has taken place. */
        message: string;
    }

    export interface OnRequestEvent extends events.Event<((request: any, sender: runtime.MessageSender, sendResponse: (response: any) => void) => void) | ((sender: runtime.MessageSender, sendResponse: (response: any) => void) => void)> { }

    /**
     * Since Chrome 7.
     * True for content scripts running inside incognito tabs, and for extension pages running inside an incognito process. The latter only applies to extensions with 'split' incognito_behavior.
     */
    export var inIncognitoContext: boolean;
    /** Set for the lifetime of a callback if an ansychronous extension api has resulted in an error. If no error has occured lastError will be undefined. */
    export var lastError: LastError;

    /** Returns the JavaScript 'window' object for the background page running inside the current extension. Returns null if the extension has no background page. */
    export function getBackgroundPage(): Window | null;
    /**
     * Converts a relative path within an extension install directory to a fully-qualified URL.
     * @param path A path to a resource within an extension expressed relative to its install directory.
     */
    export function getURL(path: string): string;
    /**
     * Sets the value of the ap CGI parameter used in the extension's update URL. This value is ignored for extensions that are hosted in the Chrome Extension Gallery.
     * Since Chrome 9.
     */
    export function setUpdateUrlData(data: string): void;
    /** Returns an array of the JavaScript 'window' objects for each of the pages running inside the current extension. */
    export function getViews(fetchProperties?: FetchProperties): Window[];
    /**
     * Retrieves the state of the extension's access to the 'file://' scheme (as determined by the user-controlled 'Allow access to File URLs' checkbox.
     * Since Chrome 12.
     * Parameter isAllowedAccess: True if the extension can access the 'file://' scheme, false otherwise.
     */
    export function isAllowedFileSchemeAccess(): Promise<boolean>;
    /**
     * Retrieves the state of the extension's access to Incognito-mode (as determined by the user-controlled 'Allowed in Incognito' checkbox.
     * Since Chrome 12.
     * Parameter isAllowedAccess: True if the extension has access to Incognito mode, false otherwise.
     */
    export function isAllowedIncognitoAccess(): Promise<boolean>;
    /**
     * Sends a single request to other listeners within the extension. Similar to runtime.connect, but only sends a single request with an optional response. The extension.onRequest event is fired in each page of the extension.
     * @deprecated Deprecated since Chrome 33. Please use runtime.sendMessage.
     * @param extensionId The extension ID of the extension you want to connect to. If omitted, default is your own extension.
     * @param responseCallback If you specify the responseCallback parameter, it should be a export function that looks like this:
     * export function(any response) {...};
     * Parameter response: The JSON response object sent by the handler of the request. If an error occurs while connecting to the extension, the callback will be called with no arguments and runtime.lastError will be set to the error message.
     */
    export function sendRequest(extensionId: string, request: any): Promise<any>;
    /**
     * Sends a single request to other listeners within the extension. Similar to runtime.connect, but only sends a single request with an optional response. The extension.onRequest event is fired in each page of the extension.
     * @deprecated Deprecated since Chrome 33. Please use runtime.sendMessage.
     * @param responseCallback If you specify the responseCallback parameter, it should be a export function that looks like this:
     * export function(any response) {...};
     * Parameter response: The JSON response object sent by the handler of the request. If an error occurs while connecting to the extension, the callback will be called with no arguments and runtime.lastError will be set to the error message.
     */
    export function sendRequest(request: any): Promise<any>;
    /**
     * Returns an array of the JavaScript 'window' objects for each of the tabs running inside the current extension. If windowId is specified, returns only the 'window' objects of tabs attached to the specified window.
     * @deprecated Deprecated since Chrome 33. Please use extension.getViews {type: "tab"}.
     */
    export function getExtensionTabs(windowId?: number): Window[];

    /**
     * Fired when a request is sent from either an extension process or a content script.
     * @deprecated Deprecated since Chrome 33. Please use runtime.onMessage.
     */
    export var onRequest: OnRequestEvent;
    /**
     * Fired when a request is sent from another extension.
     * @deprecated Deprecated since Chrome 33. Please use runtime.onMessageExternal.
     */
    export var onRequestExternal: OnRequestEvent;
}

////////////////////
// History
////////////////////
/**
 * Use the browser.history API to interact with the browser's record of visited pages. You can add, remove, and query for URLs in the browser's history. To override the history page with your own version, see Override Pages. * Permissions:  "history"
 */
export namespace history {
    /** An object encapsulating one visit to a URL. */
    export interface VisitItem {
        /** The transition type for this visit from its referrer. */
        transition: string;
        /** Optional. When this visit occurred, represented in milliseconds since the epoch. */
        visitTime?: number;
        /** The unique identifier for this visit. */
        visitId: string;
        /** The visit ID of the referrer. */
        referringVisitId: string;
        /** The unique identifier for the item. */
        id: string;
    }

    /** An object encapsulating one result of a history query. */
    export interface HistoryItem {
        /** Optional. The number of times the user has navigated to this page by typing in the address. */
        typedCount?: number;
        /** Optional. The title of the page when it was last loaded. */
        title?: string;
        /** Optional. The URL navigated to by a user. */
        url?: string;
        /** Optional. When this page was last loaded, represented in milliseconds since the epoch. */
        lastVisitTime?: number;
        /** Optional. The number of times the user has navigated to this page. */
        visitCount?: number;
        /** The unique identifier for the item. */
        id: string;
    }

    export interface HistoryQuery {
        /** A free-text query to the history service. Leave empty to retrieve all pages. */
        text: string;
        /** Optional. The maximum number of results to retrieve. Defaults to 100. */
        maxResults?: number;
        /** Optional. Limit results to those visited after this date, represented in milliseconds since the epoch. */
        startTime?: number;
        /** Optional. Limit results to those visited before this date, represented in milliseconds since the epoch. */
        endTime?: number;
    }

    export interface Url {
        /** The URL for the operation. It must be in the format as returned from a call to history.search. */
        url: string;
    }

    export interface Range {
        /** Items added to history before this date, represented in milliseconds since the epoch. */
        endTime: number;
        /** Items added to history after this date, represented in milliseconds since the epoch. */
        startTime: number;
    }

    export interface RemovedResult {
        /** True if all history was removed. If true, then urls will be empty. */
        allHistory: boolean;
        /** Optional. */
        urls?: string[];
    }

    export interface HistoryVisitedEvent extends events.Event<(result: HistoryItem) => void> { }

    export interface HistoryVisitRemovedEvent extends events.Event<(removed: RemovedResult) => void> { }

    /**
     * Searches the history for the last visit time of each page matching the query.
     */
    export function search(query: HistoryQuery): Promise<HistoryItem[]>;
    /**
     * Adds a URL to the history at the current time with a transition type of "link".
     */
    export function addUrl(details: Url): Promise<void>;
    /**
     * Removes all items within the specified date range from the history. Pages will not be removed from the history unless all visits fall within the range.
     */
    export function deleteRange(range: Range, callback: () => void): void;
    /**
     * Deletes all items from the history.
     */
    export function deleteAll(callback: () => void): void;
    /**
     * Retrieves information about visits to a URL.
     */
    export function getVisits(details: Url): Promise<VisitItem[]>;
    /**
     * Removes all occurrences of the given URL from the history.
     */
    export function deleteUrl(details: Url): Promise<void>;

    /** Fired when a URL is visited, providing the HistoryItem data for that URL. This event fires before the page has loaded. */
    export var onVisited: HistoryVisitedEvent;
    /** Fired when one or more URLs are removed from the history service. When all visits have been removed the URL is purged from history. */
    export var onVisitRemoved: HistoryVisitRemovedEvent;
}

////////////////////
// i18n
////////////////////
/**
 * Use the browser.i18n infrastructure to implement internationalization across your whole app or extension.
 */
export namespace i18n {
    /** Holds detected ISO language code and its percentage in the input string */
    export interface DetectedLanguage {
        /** An ISO language code such as 'en' or 'fr'.
         * For a complete list of languages supported by this method, see  [kLanguageInfoTable]{@link https://src.chromium.org/viewvc/browser/trunk/src/third_party/cld/languages/internal/languages.cc}.
         * For an unknown language, 'und' will be returned, which means that [percentage] of the text is unknown to CLD */
        language: string;

        /** The percentage of the detected language */
        percentage: number;
    }

    /** Holds detected language reliability and array of DetectedLanguage */
    export interface LanguageDetectionResult {
        /** CLD detected language reliability */
        isReliable: boolean;

        /** Array of detectedLanguage */
        languages: DetectedLanguage[];
    }

    /**
     * Gets the accept-languages of the browser. This is different from the locale used by the browser; to get the locale, use i18n.getUILanguage.
     * Parameter languages: Array of the accept languages of the browser, such as en-US,en,zh-CN
     */
    export function getAcceptLanguages(callback: (languages: string[]) => void): void;
    /**
     * Gets the localized string for the specified message. If the message is missing, this method returns an empty string (''). If the format of the getMessage() call is wrong — for example, messageName is not a string or the substitutions array has more than 9 elements — this method returns undefined.
     * @param messageName The name of the message, as specified in the messages.json file.
     * @param substitutions Optional. Up to 9 substitution strings, if the message requires any.
     */
    export function getMessage(messageName: string, substitutions?: any): string;
    /**
     * Gets the browser UI language of the browser. This is different from i18n.getAcceptLanguages which returns the preferred user languages.
     */
    export function getUILanguage(): string;

    /** Detects the language of the provided text using CLD.
     * @param text User input string to be translated.
     */
    export function detectLanguage(text: string): Promise<LanguageDetectionResult>;
}

////////////////////
// Identity
////////////////////
/**
 * Use the browser.identity API to get OAuth2 access tokens.
 * Permissions:  "identity"
 */
export namespace identity {
    export interface AccountInfo {
        /** A unique identifier for the account. This ID will not change for the lifetime of the account. */
        id: string;
    }

    export interface TokenDetails {
        /**
         * Optional.
         * Fetching a token may require the user to sign-in to Chrome, or approve the application's requested scopes. If the interactive flag is true, getAuthToken will prompt the user as necessary. When the flag is false or omitted, getAuthToken will return failure any time a prompt would be required.
         */
        interactive?: boolean;
        /**
         * Optional.
         * The account ID whose token should be returned. If not specified, the primary account for the profile will be used.
         * account is only supported when the "enable-new-profile-management" flag is set.
         */
        account?: AccountInfo;
        /**
         * Optional.
         * A list of OAuth2 scopes to request.
         * When the scopes field is present, it overrides the list of scopes specified in manifest.json.
         */
        scopes?: string[];
    }

    export interface UserInfo {
        /** An email address for the user account signed into the current profile. Empty if the user is not signed in or the identity.email manifest permission is not specified. */
        email: string;
        /** A unique identifier for the account. This ID will not change for the lifetime of the account. Empty if the user is not signed in or (in M41+) the identity.email manifest permission is not specified. */
        id: string;
    }

    export interface TokenInformation {
        /** The specific token that should be removed from the cache. */
        token: string;
    }

    export interface WebAuthFlowOptions {
        /** The URL that initiates the auth flow. */
        url: string;
        /**
         * Optional.
         * Whether to launch auth flow in interactive mode.
         * Since some auth flows may immediately redirect to a result URL, launchWebAuthFlow hides its web view until the first navigation either redirects to the final URL, or finishes loading a page meant to be displayed.
         * If the interactive flag is true, the window will be displayed when a page load completes. If the flag is false or omitted, launchWebAuthFlow will return with an error if the initial navigation does not complete the flow.
         */
        interactive?: boolean;
    }

    export interface SignInChangeEvent extends events.Event<(account: AccountInfo, signedIn: boolean) => void> { }

    /**
     * Retrieves a list of AccountInfo objects describing the accounts present on the profile.
     * getAccounts is only supported on dev channel.
     * Dev channel only.
     */
    export function getAccounts(callback: (accounts: AccountInfo[]) => void): void;
    /**
     * Gets an OAuth2 access token using the client ID and scopes specified in the oauth2 section of manifest.json.
     * The Identity API caches access tokens in memory, so it's ok to call getAuthToken non-interactively any time a token is required. The token cache automatically handles expiration.
     * For a good user experience it is important interactive token requests are initiated by UI in your app explaining what the authorization is for. Failing to do this will cause your users to get authorization requests, or Chrome sign in screens if they are not signed in, with with no context. In particular, do not use getAuthToken interactively when your app is first launched.
     * @param details Token options.
     */
    export function getAuthToken(details: TokenDetails): Promise<string>;
    /**
     * Retrieves email address and obfuscated gaia id of the user signed into a profile.
     * This API is different from identity.getAccounts in two ways. The information returned is available offline, and it only applies to the primary account for the profile.
     */
    export function getProfileUserInfo(): Promise<UserInfo>;
    /**
     * Removes an OAuth2 access token from the Identity API's token cache.
     * If an access token is discovered to be invalid, it should be passed to removeCachedAuthToken to remove it from the cache. The app may then retrieve a fresh token with getAuthToken.
     * @param details Token information.
     */
    export function removeCachedAuthToken(details: TokenInformation): Promise<void>;
    /**
     * Starts an auth flow at the specified URL.
     * This method enables auth flows with non-Google identity providers by launching a web view and navigating it to the first URL in the provider's auth flow. When the provider redirects to a URL matching the pattern https://<app-id>.chromiumapp.org/*, the window will close, and the final redirect URL will be passed to the callback export function.
     * For a good user experience it is important interactive auth flows are initiated by UI in your app explaining what the authorization is for. Failing to do this will cause your users to get authorization requests with no context. In particular, do not launch an interactive auth flow when your app is first launched.
     * @param details WebAuth flow options.
     */
    export function launchWebAuthFlow(details: WebAuthFlowOptions, callback: (responseUrl?: string) => void): void;
    /**
     * Generates a redirect URL to be used in launchWebAuthFlow.
     * The generated URLs match the pattern https://<app-id>.chromiumapp.org/*.
     * @param path Optional. The path appended to the end of the generated URL.
     */
    export function getRedirectURL(path?: string): string;

    /**
     * Fired when signin state changes for an account on the user's profile.
     */
    export var onSignInChanged: SignInChangeEvent;
}

////////////////////
// Idle
////////////////////
/**
 * Use the browser.idle API to detect when the machine's idle state changes.
 * Permissions:  "idle"
 */
export namespace idle {
    export interface IdleStateChangedEvent extends events.Event<(newState: string) => void> { }

    /**
     * Returns "locked" if the system is locked, "idle" if the user has not generated any input for a specified number of seconds, or "active" otherwise.
     * @param detectionIntervalInSeconds The system is considered idle if detectionIntervalInSeconds seconds have elapsed since the last user input detected.
     * Since Chrome 25.
     */
    export function queryState(detectionIntervalInSeconds: number, ): Promise<string>;
    /**
     * Sets the interval, in seconds, used to determine when the system is in an idle state for onStateChanged events. The default interval is 60 seconds.
     * @param intervalInSeconds Threshold, in seconds, used to determine when the system is in an idle state.
     */
    export function setDetectionInterval(intervalInSeconds: number): void;

    /** Fired when the system changes to an active, idle or locked state. The event fires with "locked" if the screen is locked or the screensaver activates, "idle" if the system is unlocked and the user has not generated any input for a specified number of seconds, and "active" when the user generates input on an idle system. */
    export var onStateChanged: IdleStateChangedEvent;
}

////////////////////
// Management
////////////////////
/**
 * The browser.management API provides ways to manage the list of extensions/apps that are installed and running. It is particularly useful for extensions that override the built-in New Tab page.
 * Permissions:  "management"
 */
export namespace management {
    /** Information about an installed extension, app, or theme. */
    export interface ExtensionInfo {
        /**
         * Optional.
         * A reason the item is disabled.
         */
        disabledReason?: string;
        /** Optional. The launch url (only present for apps). */
        appLaunchUrl?: string;
        /**
         * The description of this extension, app, or theme.
         */
        description: string;
        /**
         * Returns a list of API based permissions.
         */
        permissions: string[];
        /**
         * Optional.
         * A list of icon information. Note that this just reflects what was declared in the manifest, and the actual image at that url may be larger or smaller than what was declared, so you might consider using explicit width and height attributes on img tags referencing these images. See the manifest documentation on icons for more details.
         */
        icons?: IconInfo[];
        /**
         * Returns a list of host based permissions.
         */
        hostPermissions: string[];
        /** Whether it is currently enabled or disabled. */
        enabled: boolean;
        /**
         * Optional.
         * The URL of the homepage of this extension, app, or theme.
         */
        homepageUrl?: string;
        /**
         * Whether this extension can be disabled or uninstalled by the user.
         */
        mayDisable: boolean;
        /**
         * How the extension was installed.
         */
        installType: string;
        /** The version of this extension, app, or theme. */
        version: string;
        /** The extension's unique identifier. */
        id: string;
        /**
         * Whether the extension, app, or theme declares that it supports offline.
         */
        offlineEnabled: boolean;
        /**
         * Optional.
         * The update URL of this extension, app, or theme.
         */
        updateUrl?: string;
        /**
         * The type of this extension, app, or theme.
         */
        type: string;
        /** The url for the item's options page, if it has one. */
        optionsUrl: string;
        /** The name of this extension, app, or theme. */
        name: string;
        /**
         * A short version of the name of this extension, app, or theme.
         */
        shortName: string;
        /**
         * True if this is an app.
         * @deprecated since Chrome 33. Please use management.ExtensionInfo.type.
         */
        isApp: boolean;
        /**
         * Optional.
         * The app launch type (only present for apps).
         */
        launchType?: string;
        /**
         * Optional.
         * The currently available launch types (only present for apps).
         */
        availableLaunchTypes?: string[];
    }

    /** Information about an icon belonging to an extension, app, or theme. */
    export interface IconInfo {
        /** The URL for this icon image. To display a grayscale version of the icon (to indicate that an extension is disabled, for example), append ?grayscale=true to the URL. */
        url: string;
        /** A number representing the width and height of the icon. Likely values include (but are not limited to) 128, 48, 24, and 16. */
        size: number;
    }

    export interface UninstallOptions {
        /**
         * Optional.
         * Whether or not a confirm-uninstall dialog should prompt the user. Defaults to false for self uninstalls. If an extension uninstalls another extension, this parameter is ignored and the dialog is always shown.
         */
        showConfirmDialog?: boolean;
    }

    export interface ManagementDisabledEvent extends events.Event<(info: ExtensionInfo) => void> { }

    export interface ManagementUninstalledEvent extends events.Event<(id: string) => void> { }

    export interface ManagementInstalledEvent extends events.Event<(info: ExtensionInfo) => void> { }

    export interface ManagementEnabledEvent extends events.Event<(info: ExtensionInfo) => void> { }

    /**
     * Enables or disables an app or extension.
     * @param id This should be the id from an item of management.ExtensionInfo.
     * @param enabled Whether this item should be enabled or disabled.
     */
    export function setEnabled(id: string, enabled: boolean): Promise<void>;
    /**
     * Returns a list of permission warnings for the given extension id.
     * @param id The ID of an already installed extension.
     */
    export function getPermissionWarningsById(id: string): Promise<string[]>;
    /**
     * Returns information about the installed extension, app, or theme that has the given ID.
     * @param id The ID from an item of management.ExtensionInfo.
     */
    export function get(id: string): Promise<ExtensionInfo>;
    /**
     * Returns a list of information about installed extensions and apps.
     */
    export function getAll(callback?: (result: ExtensionInfo[]) => void): void;
    /**
     * Returns a list of permission warnings for the given extension manifest string. Note: This export function can be used without requesting the 'management' permission in the manifest.
     * @param manifestStr Extension manifest JSON string.
     */
    export function getPermissionWarningsByManifest(manifestStr: string): Promise<string[]>;
    /**
     * Launches an application.
     * @param id The extension id of the application.
     */
    export function launchApp(id: string): Promise<void>;
    /**
     * Uninstalls a currently installed app or extension.
     * @param id This should be the id from an item of management.ExtensionInfo.
     */
    export function uninstall(id: string, options?: UninstallOptions): Promise<void>;
    /**
     * Uninstalls a currently installed app or extension.
     * @deprecated since Chrome 21. The options parameter was added to this export function.
     * @param id This should be the id from an item of management.ExtensionInfo.
     */
    export function uninstall(id: string): Promise<void>;
    /**
     * Returns information about the calling extension, app, or theme. Note: This export function can be used without requesting the 'management' permission in the manifest.
     */
    export function getSelf(): Promise<ExtensionInfo>;
    /**
     * Uninstalls the calling extension.
     * Note: This export function can be used without requesting the 'management' permission in the manifest.
     */
    export function uninstallSelf(options?: UninstallOptions): Promise<void>;
    /**
     * Uninstalls the calling extension.
     * Note: This export function can be used without requesting the 'management' permission in the manifest.
     */
    export function uninstallSelf(callback?: () => void): void;
    /**
     * Display options to create shortcuts for an app. On Mac, only packaged app shortcuts can be created.
     */
    export function createAppShortcut(id: string): Promise<void>;
    /**
     * Set the launch type of an app.
     * @param id This should be the id from an app item of management.ExtensionInfo.
     * @param launchType The target launch type. Always check and make sure this launch type is in ExtensionInfo.availableLaunchTypes, because the available launch types export vary on different platforms and configurations.
     */
    export function setLaunchType(id: string, launchType: string): Promise<void>;
    /**
     * Generate an app for a URL. Returns the generated bookmark app.
     * @param url The URL of a web page. The scheme of the URL can only be "http" or "https".
     * @param title The title of the generated app.
     */
    export function generateAppForLink(url: string, title: string): Promise<ExtensionInfo>;

    /** Fired when an app or extension has been disabled. */
    export var onDisabled: ManagementDisabledEvent;
    /** Fired when an app or extension has been uninstalled. */
    export var onUninstalled: ManagementUninstalledEvent;
    /** Fired when an app or extension has been installed. */
    export var onInstalled: ManagementInstalledEvent;
    /** Fired when an app or extension has been enabled. */
    export var onEnabled: ManagementEnabledEvent;
}

////////////////////
// Notifications
// https://developer.browser.com/extensions/notifications
////////////////////
/**
 * Use the browser.notifications API to create rich notifications using templates and show these notifications to users in the system tray.
 * Permissions:  "notifications"
 */
export namespace notifications {
    export interface ButtonOptions {
        title: string;
        iconUrl?: string;
    }

    export interface ItemOptions {
        /** Title of one item of a list notification. */
        title: string;
        /** Additional details about this item. */
        message: string;
    }

    export interface NotificationOptions {
        /** Optional. Which type of notification to display. Required for notifications.create method. */
        type?: string;
        /**
         * Optional.
         * A URL to the sender's avatar, app icon, or a thumbnail for image notifications.
         * URLs can be a data URL, a blob URL, or a URL relative to a resource within this extension's .crx file Required for notifications.create method.
         */
        iconUrl?: string;
        /** Optional. Title of the notification (e.g. sender name for email). Required for notifications.create method. */
        title?: string;
        /** Optional. Main notification content. Required for notifications.create method. */
        message?: string;
        /**
         * Optional.
         * Alternate notification content with a lower-weight font.
         */
        contextMessage?: string;
        /** Optional. Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is default. */
        priority?: number;
        /** Optional. A timestamp associated with the notification, in milliseconds past the epoch (e.g. Date.now() + n). */
        eventTime?: number;
        /** Optional. Text and icons for up to two notification action buttons. */
        buttons?: ButtonOptions[];
        /** Optional. Items for multi-item notifications. */
        items?: ItemOptions[];
        /**
         * Optional.
         * Current progress ranges from 0 to 100.
         */
        progress?: number;
        /**
         * Optional.
         * Whether to show UI indicating that the app will visibly respond to clicks on the body of a notification.
         */
        isClickable?: boolean;
        /**
         * Optional.
         * A URL to the app icon mask. URLs have the same restrictions as iconUrl. The app icon mask should be in alpha channel, as only the alpha channel of the image will be considered.
         */
        appIconMaskUrl?: string;
        /** Optional. A URL to the image thumbnail for image-type notifications. URLs have the same restrictions as iconUrl. */
        imageUrl?: string;
        /**
         * Indicates that the notification should remain visible on screen until the user activates or dismisses the notification.
         * This defaults to false.
         */
        requireInteraction?: boolean;
    }

    export interface NotificationClosedEvent extends events.Event<(notificationId: string, byUser: boolean) => void> { }

    export interface NotificationClickedEvent extends events.Event<(notificationId: string) => void> { }

    export interface NotificationButtonClickedEvent extends events.Event<(notificationId: string, buttonIndex: number) => void> { }

    export interface NotificationPermissionLevelChangedEvent extends events.Event<(level: string) => void> { }

    export interface NotificationShowSettingsEvent extends events.Event<() => void> { }

    /** The notification closed, either by the system or by user action. */
    export var onClosed: NotificationClosedEvent;
    /** The user clicked in a non-button area of the notification. */
    export var onClicked: NotificationClickedEvent;
    /** The user pressed a button in the notification. */
    export var onButtonClicked: NotificationButtonClickedEvent;
    /**
     * The user changes the permission level.
     */
    export var onPermissionLevelChanged: NotificationPermissionLevelChangedEvent;
    /**
     * The user clicked on a link for the app's notification settings.
     */
    export var onShowSettings: NotificationShowSettingsEvent;

    /**
     * Creates and displays a notification.
     * @param notificationId Identifier of the notification. If not set or empty, an ID will automatically be generated. If it matches an existing notification, this method first clears that notification before proceeding with the create operation.
     * The notificationId parameter is required before Chrome 42.
     * @param options Contents of the notification.
     */
    export function create(notificationId: string, options: NotificationOptions): Promise<string>;
    /**
     * Creates and displays a notification.
     * @param notificationId Identifier of the notification. If not set or empty, an ID will automatically be generated. If it matches an existing notification, this method first clears that notification before proceeding with the create operation.
     * The notificationId parameter is required before Chrome 42.
     * @param options Contents of the notification.
     */
    export function create(options: NotificationOptions): Promise<string>;
    /**
     * Updates an existing notification.
     * @param notificationId The id of the notification to be updated. This is returned by notifications.create method.
     * @param options Contents of the notification to update to.
     */
    export function update(notificationId: string, options: NotificationOptions): Promise<boolean>;
    /**
     * Clears the specified notification.
     * @param notificationId The id of the notification to be cleared. This is returned by notifications.create method.
     */
    export function clear(notificationId: string): Promise<boolean>;
    /**
     * Retrieves all the notifications.
     */
    export function getAll(): Promise<Object>;
    /**
     * Retrieves whether the user has enabled notifications from this app or extension.
     */
    export function getPermissionLevel(): Promise<string>;
}

////////////////////
// Omnibox
////////////////////
/**
 * The omnibox API allows you to register a keyword with Google Chrome's address bar, which is also known as the omnibox.
 * Manifest:  "omnibox": {...}
 */
export namespace omnibox {
    /** A suggest result. */
    export interface SuggestResult {
        /** The text that is put into the URL bar, and that is sent to the extension when the user chooses this entry. */
        content: string;
        /** The text that is displayed in the URL dropdown. Can contain XML-style markup for styling. The supported tags are 'url' (for a literal URL), 'match' (for highlighting text that matched what the user's query), and 'dim' (for dim helper text). The styles can be nested, eg. dimmed match. You must escape the five predefined entities to display them as text: stackoverflow.com/a/1091953/89484 */
        description: string;
    }

    export interface Suggestion {
        /** The text that is displayed in the URL dropdown. Can contain XML-style markup for styling. The supported tags are 'url' (for a literal URL), 'match' (for highlighting text that matched what the user's query), and 'dim' (for dim helper text). The styles can be nested, eg. dimmed match. */
        description: string;
    }

    export interface OmniboxInputEnteredEvent extends events.Event<(text: string) => void> { }

    export interface OmniboxInputChangedEvent extends events.Event<(text: string, suggest: (suggestResults: SuggestResult[]) => void) => void> { }

    export interface OmniboxInputStartedEvent extends events.Event<() => void> { }

    export interface OmniboxInputCancelledEvent extends events.Event<() => void> { }

    /**
     * Sets the description and styling for the default suggestion. The default suggestion is the text that is displayed in the first suggestion row underneath the URL bar.
     * @param suggestion A partial SuggestResult object, without the 'content' parameter.
     */
    export function setDefaultSuggestion(suggestion: Suggestion): void;

    /** User has accepted what is typed into the omnibox. */
    export var onInputEntered: OmniboxInputEnteredEvent;
    /** User has changed what is typed into the omnibox. */
    export var onInputChanged: OmniboxInputChangedEvent;
    /** User has started a keyword input session by typing the extension's keyword. This is guaranteed to be sent exactly once per input session, and before any onInputChanged events. */
    export var onInputStarted: OmniboxInputStartedEvent;
    /** User has ended the keyword input session without accepting the input. */
    export var onInputCancelled: OmniboxInputCancelledEvent;
}

////////////////////
// Page Action
////////////////////
/**
 * Use the browser.pageAction API to put icons inside the address bar. Page actions represent actions that can be taken on the current page, but that aren't applicable to all pages.
 * Manifest:  "page_action": {...}
 */
export namespace pageAction {
    export interface PageActionClickedEvent extends events.Event<(tab: tabs.Tab) => void> { }

    export interface TitleDetails {
        /** The id of the tab for which you want to modify the page action. */
        tabId: number;
        /** The tooltip string. */
        title: string;
    }

    export interface GetDetails {
        /** Specify the tab to get the title from. */
        tabId: number;
    }

    export interface PopupDetails {
        /** The id of the tab for which you want to modify the page action. */
        tabId: number;
        /** The html file to show in a popup. If set to the empty string (''), no popup is shown. */
        popup: string;
    }

    export interface IconDetails {
        /** The id of the tab for which you want to modify the page action. */
        tabId: number;
        /**
         * Optional.
         * @deprecated This argument is ignored.
         */
        iconIndex?: number;
        /**
         * Optional.
         * Either an ImageData object or a dictionary {size -> ImageData} representing icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals scale, then image with size scale * 19 will be selected. Initially only scales 1 and 2 will be supported. At least one image must be specified. Note that 'details.imageData = foo' is equivalent to 'details.imageData = {'19': foo}'
         */
        imageData?: ImageData;
        /**
         * Optional.
         * Either a relative image path or a dictionary {size -> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals scale, then image with size scale * 19 will be selected. Initially only scales 1 and 2 will be supported. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.imageData = {'19': foo}'
         */
        path?: any;
    }

    /**
     * Shows the page action. The page action is shown whenever the tab is selected.
     * @param tabId The id of the tab for which you want to modify the page action.
     */
    export function hide(tabId: number): void;
    /**
     * Shows the page action. The page action is shown whenever the tab is selected.
     * @param tabId The id of the tab for which you want to modify the page action.
     */
    export function show(tabId: number): void;
    /** Sets the title of the page action. This is displayed in a tooltip over the page action. */
    export function setTitle(details: TitleDetails): void;
    /** Sets the html document to be opened as a popup when the user clicks on the page action's icon. */
    export function setPopup(details: PopupDetails): void;
    /**
     * Gets the title of the page action.
     */
    export function getTitle(details: GetDetails): Promise<string>;
    /**
     * Gets the html document set as the popup for this page action.
     */
    export function getPopup(details: GetDetails): Promise<string>;
    /**
     * Sets the icon for the page action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the path or the imageData property must be specified.
     */
    export function setIcon(details: IconDetails): Promise<void>;

    /** Fired when a page action icon is clicked. This event will not fire if the page action has a popup. */
    export var onClicked: PageActionClickedEvent;
}

////////////////////
// Permissions
////////////////////
/**
 * Use the browser.permissions API to request declared optional permissions at run time rather than install time, so users understand why the permissions are needed and grant only those that are necessary.
 */
export namespace permissions {
    export interface Permissions {
        /**
         * Optional.
         * List of named permissions (does not include hosts or origins). Anything listed here must appear in the optional_permissions list in the manifest.
         */
        origins?: string[];
        /**
         * Optional.
         * List of origin permissions. Anything listed here must be a subset of a host that appears in the optional_permissions list in the manifest. For example, if http://*.example.com/ or http://* appears in optional_permissions, you can request an origin of http://help.example.com/. Any path is ignored.
         */
        permissions?: string[];
    }

    export interface PermissionsRemovedEvent {
        /**
         * Parameter permissions: The permissions that have been removed.
         */
        addListener(): Promise<Permissions>;
    }

    export interface PermissionsAddedEvent {
        /**
         * Parameter permissions: The newly acquired permissions.
         */
        addListener(): Promise<Permissions>;
    }

    /**
     * Checks if the extension has the specified permissions.
     * Parameter result: True if the extension has the specified permissions.
     */
    export function contains(permissions: Permissions): Promise<boolean>;
    /**
     * Gets the extension's current set of permissions.
     * Parameter permissions: The extension's active permissions.
     */
    export function getAll(): Promise<Permissions>;
    /**
     * Requests access to the specified permissions. These permissions must be defined in the optional_permissions field of the manifest. If there are any problems requesting the permissions, runtime.lastError will be set.
     * Parameter granted: True if the user granted the specified permissions.
     */
    export function request(permissions: Permissions): Promise<boolean>;
    /**
     * Removes access to the specified permissions. If there are any problems removing the permissions, runtime.lastError will be set.
     * Parameter removed: True if the permissions were removed.
     */
    export function remove(permissions: Permissions): Promise<boolean>;

    /** Fired when access to permissions has been removed from the extension. */
    export var onRemoved: PermissionsRemovedEvent;
    /** Fired when the extension acquires new permissions. */
    export var onAdded: PermissionsAddedEvent;
}

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

////////////////////
// Proxy
////////////////////
/**
 * Use the browser.proxy API to manage Chrome's proxy settings. This API relies on the ChromeSetting prototype of the type API for getting and setting the proxy configuration.
 * Permissions:  "proxy"
 */
export namespace proxy {
    /** An object holding proxy auto-config information. Exactly one of the fields should be non-empty. */
    export interface PacScript {
        /** Optional. URL of the PAC file to be used. */
        url?: string;
        /** Optional. If true, an invalid PAC script will prevent the network stack from falling back to direct connections. Defaults to false. */
        mandatory?: boolean;
        /** Optional. A PAC script. */
        data?: string;
    }

    /** An object encapsulating a complete proxy configuration. */
    export interface ProxyConfig {
        /** Optional. The proxy rules describing this configuration. Use this for 'fixed_servers' mode. */
        rules?: ProxyRules;
        /** Optional. The proxy auto-config (PAC) script for this configuration. Use this for 'pac_script' mode. */
        pacScript?: PacScript;
        /**
         * 'direct' = Never use a proxy
         * 'auto_detect' = Auto detect proxy settings
         * 'pac_script' = Use specified PAC script
         * 'fixed_servers' = Manually specify proxy servers
         * 'system' = Use system proxy settings
         */
        mode: string;
    }

    /** An object encapsulating a single proxy server's specification. */
    export interface ProxyServer {
        /** The URI of the proxy server. This must be an ASCII hostname (in Punycode format). IDNA is not supported, yet. */
        host: string;
        /** Optional. The scheme (protocol) of the proxy server itself. Defaults to 'http'. */
        scheme?: string;
        /** Optional. The port of the proxy server. Defaults to a port that depends on the scheme. */
        port?: number;
    }

    /** An object encapsulating the set of proxy rules for all protocols. Use either 'singleProxy' or (a subset of) 'proxyForHttp', 'proxyForHttps', 'proxyForFtp' and 'fallbackProxy'. */
    export interface ProxyRules {
        /** Optional. The proxy server to be used for FTP requests. */
        proxyForFtp?: ProxyServer;
        /** Optional. The proxy server to be used for HTTP requests. */
        proxyForHttp?: ProxyServer;
        /** Optional. The proxy server to be used for everthing else or if any of the specific proxyFor... is not specified. */
        fallbackProxy?: ProxyServer;
        /** Optional. The proxy server to be used for all per-URL requests (that is http, https, and ftp). */
        singleProxy?: ProxyServer;
        /** Optional. The proxy server to be used for HTTPS requests. */
        proxyForHttps?: ProxyServer;
        /** Optional. List of servers to connect to without a proxy server. */
        bypassList?: string[];
    }

    export interface ErrorDetails {
        /** Additional details about the error such as a JavaScript runtime error. */
        details: string;
        /** The error description. */
        error: string;
        /** If true, the error was fatal and the network transaction was aborted. Otherwise, a direct connection is used instead. */
        fatal: boolean;
    }

    export interface ProxyErrorEvent extends events.Event<(details: ErrorDetails) => void> { }

    export var settings: types.ChromeSetting;
    /** Notifies about proxy errors. */
    export var onProxyError: ProxyErrorEvent;
}

////////////////////
// Runtime
////////////////////
/**
 * Use the browser.runtime API to retrieve the background page, return details about the manifest, and listen for and respond to events in the app or extension lifecycle. You can also use this API to convert the relative path of URLs to fully-qualified URLs.
 */
export namespace runtime {
    /** This will be defined during an API method callback if there was an error */
    export var lastError: LastError | undefined;
    /** The ID of the extension/app. */
    export var id: string;

    export interface LastError {
        /** Optional. Details about the error which occurred.  */
        message?: string;
    }

    export interface ConnectInfo {
        name?: string;
    }

    export interface InstalledDetails {
        /**
         * The reason that this event is being dispatched.
         * One of: "install", "update", "chrome_update", or "shared_module_update"
         */
        reason: string;
        /**
         * Optional.
         * Indicates the previous version of the extension, which has just been updated. This is present only if 'reason' is 'update'.
         */
        previousVersion?: string;
        /**
         * Optional.
         * Indicates the ID of the imported shared module extension which updated. This is present only if 'reason' is 'shared_module_update'.
         */
        id?: string;
    }

    export interface MessageOptions {
        /** Whether the TLS channel ID will be passed into onMessageExternal for processes that are listening for the connection event. */
        includeTlsChannelId?: boolean;
    }

    /**
     * An object containing information about the script context that sent a message or request.
     */
    export interface MessageSender {
        /** The ID of the extension or app that opened the connection, if any. */
        id?: string;
        /** The tabs.Tab which opened the connection, if any. This property will only be present when the connection was opened from a tab (including content scripts), and only if the receiver is an extension, not an app. */
        tab?: tabs.Tab;
        /**
         * The frame that opened the connection. 0 for top-level frames, positive for child frames. This will only be set when tab is set.
         */
        frameId?: number;
        /**
         * The URL of the page or frame that opened the connection. If the sender is in an iframe, it will be iframe's URL not the URL of the page which hosts it.
         */
        url?: string;
        /**
         * The TLS channel ID of the page or frame that opened the connection, if requested by the extension or app, and if available.
         */
        tlsChannelId?: string;
    }

    /**
     * An object containing information about the current platform.
     */
    export interface PlatformInfo {
        /**
         * The operating system browser is running on.
         * One of: "mac", "win", "android", "cros", "linux", or "openbsd"
         */
        os: string;
        /**
         * The machine's processor architecture.
         * One of: "arm", "x86-32", or "x86-64"
         */
        arch: string;
        /**
         * The native client architecture. This may be different from arch on some platforms.
         * One of: "arm", "x86-32", or "x86-64"
         */
        nacl_arch: string;
    }

    /**
     * An object which allows two way communication with other pages.
     */
    export interface Port {
        postMessage: (message: Object) => void;
        disconnect: () => void;
        /**
         * Optional.
         * This property will only be present on ports passed to onConnect/onConnectExternal listeners.
         */
        sender?: MessageSender;
        /** An object which allows the addition and removal of listeners for a Chrome event. */
        onDisconnect: PortDisconnectEvent;
        /** An object which allows the addition and removal of listeners for a Chrome event. */
        onMessage: PortMessageEvent;
        name: string;
    }

    export interface UpdateAvailableDetails {
        /** The version number of the available update. */
        version: string;
    }

    export interface UpdateCheckDetails {
        /** The version of the available update. */
        version: string;
    }

    export interface PortDisconnectEvent extends events.Event<(port: Port) => void> { }

    export interface PortMessageEvent extends events.Event<(message: Object, port: Port) => void> { }

    export interface ExtensionMessageEvent extends events.Event<(message: any, sender: MessageSender, sendResponse: (response: any) => void) => void> { }

    export interface ExtensionConnectEvent extends events.Event<(port: Port) => void> { }

    export interface RuntimeInstalledEvent extends events.Event<(details: InstalledDetails) => void> { }

    export interface RuntimeEvent extends events.Event<() => void> { }

    export interface RuntimeRestartRequiredEvent extends events.Event<(reason: string) => void> { }

    export interface RuntimeUpdateAvailableEvent extends events.Event<(details: UpdateAvailableDetails) => void> { }

    export interface ManifestIcons {
        [size: number]: string;
    }

    export interface ManifestAction {
        default_icon?: ManifestIcons;
        default_title?: string;
        default_popup?: string;
    }

    export interface SearchProvider {
        name?: string;
        keyword?: string;
        favicon_url?: string;
        search_url: string;
        encoding?: string;
        suggest_url?: string;
        instant_url?: string;
        image_url?: string;
        search_url_post_params?: string;
        suggest_url_post_params?: string;
        instant_url_post_params?: string;
        image_url_post_params?: string;
        alternate_urls?: string[];
        prepopulated_id?: number;
        is_default?: boolean;
    }

    export interface PageStateUrlDetails {
        /** Optional. Matches if the host name of the URL contains a specified string. To test whether a host name component has a prefix 'foo', use hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com', because an implicit dot is added at the beginning of the host name. Similarly, hostContains can be used to match against component suffix ('foo.') and to exactly match against components ('.foo.'). Suffix- and exact-matching for the last components need to be done separately using hostSuffix, because no implicit dot is added at the end of the host name.  */
        hostContains?: string;
        /** Optional. Matches if the host name of the URL is equal to a specified string.  */
        hostEquals?: string;
        /** Optional. Matches if the host name of the URL starts with a specified string.  */
        hostPrefix?: string;
        /** Optional. Matches if the host name of the URL ends with a specified string.  */
        hostSuffix?: string;
        /** Optional. Matches if the path segment of the URL contains a specified string.  */
        pathContains?: string;
        /** Optional. Matches if the path segment of the URL is equal to a specified string.  */
        pathEquals?: string;
        /** Optional. Matches if the path segment of the URL starts with a specified string.  */
        pathPrefix?: string;
        /** Optional. Matches if the path segment of the URL ends with a specified string.  */
        pathSuffix?: string;
        /** Optional. Matches if the query segment of the URL contains a specified string.  */
        queryContains?: string;
        /** Optional. Matches if the query segment of the URL is equal to a specified string.  */
        queryEquals?: string;
        /** Optional. Matches if the query segment of the URL starts with a specified string.  */
        queryPrefix?: string;
        /** Optional. Matches if the query segment of the URL ends with a specified string.  */
        querySuffix?: string;
        /** Optional. Matches if the URL (without fragment identifier) contains a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlContains?: string;
        /** Optional. Matches if the URL (without fragment identifier) is equal to a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlEquals?: string;
        /** Optional. Matches if the URL (without fragment identifier) matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.  */
        urlMatches?: string;
        /** Optional. Matches if the URL without query segment and fragment identifier matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.  */
        originAndPathMatches?: string;
        /** Optional. Matches if the URL (without fragment identifier) starts with a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlPrefix?: string;
        /** Optional. Matches if the URL (without fragment identifier) ends with a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlSuffix?: string;
        /** Optional. Matches if the scheme of the URL is equal to any of the schemes specified in the array.  */
        schemes?: string[];
        /** Optional. Matches if the port of the URL is contained in any of the specified port lists. For example [80, 443, [1000, 1200]] matches all requests on port 80, 443 and in the range 1000-1200.  */
        ports?: (number | number[])[];
    }

    class PageStateMatcherProperties {
        /** Optional. Filters URLs for export various criteria. See event filtering. All criteria are case sensitive.  */
        pageUrl?: PageStateUrlDetails;
        /** Optional. Matches if all of the CSS selectors in the array match displayed elements in a frame with the same origin as the page's main frame. All selectors in this array must be compound selectors to speed up matching. Note that listing hundreds of CSS selectors or CSS selectors that match hundreds of times per page can still slow down web sites.  */
        css?: string[];
        /**
         * Optional.
          * Since Chrome 45. Warning: this is the current Beta channel. More information available on the API documentation pages.
         * Matches if the bookmarked state of the page is equal to the specified value. Requres the bookmarks permission.
         */
        isBookmarked?: boolean;
    }

    export interface Manifest {
        // Required
        manifest_version: number;
        name: string;
        version: string;

        // Recommended
        default_locale?: string;
        description?: string;
        icons?: ManifestIcons;

        // Pick one (or none)
        browser_action?: ManifestAction;
        page_action?: ManifestAction;

        // Optional
        author?: any;
        automation?: any;
        background?: {
            scripts?: string[];
            page?: string;
            persistent?: boolean;
        };
        background_page?: string;
        chrome_settings_overrides?: {
            homepage?: string;
            search_provider?: SearchProvider;
            startup_pages?: string[];
        };
        chrome_ui_overrides?: {
            bookmarks_ui?: {
                remove_bookmark_shortcut?: boolean;
                remove_button?: boolean;
            }
        };
        chrome_url_overrides?: {
            bookmarks?: string;
            history?: string;
            newtab?: string;
        };
        commands?: {
            [name: string]: {
                suggested_key?: {
                    default?: string;
                    windows?: string;
                    mac?: string;
                    chromeos?: string;
                    linux?: string;
                };
                description?: string;
                global?: boolean
            }
        };
        content_capabilities?: {
            matches?: string[];
            permissions?: string[];
        };
        content_scripts?: {
            matches?: string[];
            exclude_matches?: string[];
            css?: string[];
            js?: string[];
            run_at?: string;
            all_frames?: boolean;
            include_globs?: string[];
            exclude_globs?: string[];
        }[];
        content_security_policy?: string;
        converted_from_user_script?: boolean;
        copresence?: any;
        current_locale?: string;
        devtools_page?: string;
        event_rules?: {
            event?: string;
            actions?: {
                type: string;
            }[];
            conditions?: PageStateMatcherProperties[]
        }[];
        externally_connectable?: {
            ids?: string[];
            matches?: string[];
            accepts_tls_channel_id?: boolean;
        };
        file_browser_handlers?: {
            id?: string;
            default_title?: string;
            file_filters?: string[];
        }[];
        file_system_provider_capabilities?: {
            configurable?: boolean;
            watchable?: boolean;
            multiple_mounts?: boolean;
            source?: string;
        };
        homepage_url?: string;
        import?: {
            id: string;
            minimum_version?: string
        }[];
        export?: {
            whitelist?: string[]
        };
        incognito?: string;
        input_components?: {
            name?: string;
            type?: string;
            id?: string;
            description?: string;
            language?: string;
            layouts?: any[];
        }[];
        key?: string;
        minimum_chrome_version?: string;
        nacl_modules?: {
            path: string;
            mime_type: string;
        }[];
        oauth2?: {
            client_id: string;
            scopes?: string[];
        };
        offline_enabled?: boolean;
        omnibox?: {
            keyword: string;
        };
        optional_permissions?: string[];
        options_page?: string;
        options_ui?: {
            page?: string;
            chrome_style?: boolean;
            open_in_tab?: boolean;
        };
        permissions?: string[];
        platforms?: {
            nacl_arch?: string;
            sub_package_path: string;
        }[];
        plugins?: {
            path: string;
        }[];
        requirements?: {
            '3D'?: {
                features?: string[]
            };
            plugins?: {
                npapi?: boolean;
            }
        };
        sandbox?: {
            pages: string[];
            content_security_policy?: string;
        };
        short_name?: string;
        signature?: any;
        spellcheck?: {
            dictionary_language?: string;
            dictionary_locale?: string;
            dictionary_format?: string;
            dictionary_path?: string;
        };
        storage?: {
            managed_schema: string
        };
        system_indicator?: any;
        tts_engine?: {
            voices: {
                voice_name: string;
                lang?: string;
                gender?: string;
                event_types?: string[];
            }[]
        };
        update_url?: string;
        version_name?: string;
        web_accessible_resources?: string[];
        [key: string]: any;
    }

    /**
     * Attempts to connect to connect listeners within an extension/app (such as the background page), or other extensions/apps. This is useful for content scripts connecting to their extension processes, inter-app/extension communication, and web messaging. Note that this does not connect to any listeners in a content script. Extensions may connect to content scripts embedded in tabs via tabs.connect.
     */
    export function connect(connectInfo?: ConnectInfo): Port;
    /**
     * Attempts to connect to connect listeners within an extension/app (such as the background page), or other extensions/apps. This is useful for content scripts connecting to their extension processes, inter-app/extension communication, and web messaging. Note that this does not connect to any listeners in a content script. Extensions may connect to content scripts embedded in tabs via tabs.connect.
     * @param extensionId Optional.
     * The ID of the extension or app to connect to. If omitted, a connection will be attempted with your own extension. Required if sending messages from a web page for web messaging.
     */
    export function connect(extensionId: string, connectInfo?: ConnectInfo): Port;
    /**
     * Connects to a native application in the host machine.
     * @param application The name of the registered application to connect to.
     */
    export function connectNative(application: string): Port;
    /** Retrieves the JavaScript 'window' object for the background page running inside the current extension/app. If the background page is an event page, the system will ensure it is loaded before calling the callback. If there is no background page, an error is set. */
    export function getBackgroundPage(callback: (backgroundPage?: Window) => void): void;
    /**
     * Returns details about the app or extension from the manifest. The object returned is a serialization of the full manifest file.
     * @returns The manifest details.
     */
    export function getManifest(): Manifest;
    /**
     * Returns a DirectoryEntry for the package directory.
     */
    // export function getPackageDirectoryEntry(): Promise<DirectoryEntry>;
    /**
     * Returns information about the current platform.
     */
    export function getPlatformInfo(): Promise<PlatformInfo>;
    /**
     * Converts a relative path within an app/extension install directory to a fully-qualified URL.
     * @param path A path to a resource within an app/extension expressed relative to its install directory.
     */
    export function getURL(path: string): string;
    /**
     * Reloads the app or extension.
     */
    export function reload(): void;
    /**
     * Requests an update check for this app/extension.
     * @param callback
     * Parameter status: Result of the update check. One of: "throttled", "no_update", or "update_available"
     * Optional parameter details: If an update is available, this contains more information about the available update.
     */
    export function requestUpdateCheck(callback: (status: string, details?: UpdateCheckDetails) => void): void;
    /**
     * Restart the ChromeOS device when the app runs in kiosk mode. Otherwise, it's no-op.
     */
    export function restart(): void;
    /**
     * Sends a single message to event listeners within your extension/app or a different extension/app. Similar to runtime.connect but only sends a single message, with an optional response. If sending to your extension, the runtime.onMessage event will be fired in each page, or runtime.onMessageExternal, if a different extension. Note that extensions cannot send messages to content scripts using this method. To send messages to content scripts, use tabs.sendMessage.
     * @param responseCallback Optional
     * Parameter response: The JSON response object sent by the handler of the message. If an error occurs while connecting to the extension, the callback will be called with no arguments and runtime.lastError will be set to the error message.
     */
    export function sendMessage(message: any): Promise<any>;
    /**
     * Sends a single message to event listeners within your extension/app or a different extension/app. Similar to runtime.connect but only sends a single message, with an optional response. If sending to your extension, the runtime.onMessage event will be fired in each page, or runtime.onMessageExternal, if a different extension. Note that extensions cannot send messages to content scripts using this method. To send messages to content scripts, use tabs.sendMessage.
     * @param responseCallback Optional
     * Parameter response: The JSON response object sent by the handler of the message. If an error occurs while connecting to the extension, the callback will be called with no arguments and runtime.lastError will be set to the error message.
     */
    export function sendMessage(message: any, options: MessageOptions): Promise<any>;
    /**
     * Sends a single message to event listeners within your extension/app or a different extension/app. Similar to runtime.connect but only sends a single message, with an optional response. If sending to your extension, the runtime.onMessage event will be fired in each page, or runtime.onMessageExternal, if a different extension. Note that extensions cannot send messages to content scripts using this method. To send messages to content scripts, use tabs.sendMessage.
     * @param extensionId The ID of the extension/app to send the message to. If omitted, the message will be sent to your own extension/app. Required if sending messages from a web page for web messaging.
     * @param responseCallback Optional
     * Parameter response: The JSON response object sent by the handler of the message. If an error occurs while connecting to the extension, the callback will be called with no arguments and runtime.lastError will be set to the error message.
     */
    export function sendMessage(extensionId: string, message: any): Promise<any>;
    /**
     * Sends a single message to event listeners within your extension/app or a different extension/app. Similar to runtime.connect but only sends a single message, with an optional response. If sending to your extension, the runtime.onMessage event will be fired in each page, or runtime.onMessageExternal, if a different extension. Note that extensions cannot send messages to content scripts using this method. To send messages to content scripts, use tabs.sendMessage.
     * @param extensionId The ID of the extension/app to send the message to. If omitted, the message will be sent to your own extension/app. Required if sending messages from a web page for web messaging.
     * @param responseCallback Optional
     * Parameter response: The JSON response object sent by the handler of the message. If an error occurs while connecting to the extension, the callback will be called with no arguments and runtime.lastError will be set to the error message.
     */
    export function sendMessage(extensionId: string, message: any, options: MessageOptions): Promise<any>;
    /**
     * Send a single message to a native application.
     * @param application The of the native messaging host.
     * @param message The message that will be passed to the native messaging host.
     * @param responseCallback Optional.
     * Parameter response: The response message sent by the native messaging host. If an error occurs while connecting to the native messaging host, the callback will be called with no arguments and runtime.lastError will be set to the error message.
     */
    export function sendNativeMessage(application: string, message: Object): Promise<any>;
    /**
     * Sets the URL to be visited upon uninstallation. This may be used to clean up server-side data, do analytics, and implement surveys. Maximum 255 characters.
     * @param url Since Chrome 34.
     * URL to be opened after the extension is uninstalled. This URL must have an http: or https: scheme. Set an empty string to not open a new tab upon uninstallation.
     */
    export function setUninstallURL(url: string): Promise<void>;
    /**
     * Open your Extension's options page, if possible.
     * The precise behavior may depend on your manifest's options_ui or options_page key, or what Chrome happens to support at the time. For example, the page may be opened in a new tab, within browser://extensions, within an App, or it may just focus an open options page. It will never cause the caller page to reload.
     * If your Extension does not declare an options page, or Chrome failed to create one for some other reason, the callback will set lastError.
     */
    export function openOptionsPage(callback?: () => void): void;

    /**
     * Fired when a connection is made from either an extension process or a content script.
     */
    export var onConnect: ExtensionConnectEvent;
    /**
     * Fired when a connection is made from another extension.
     */
    export var onConnectExternal: ExtensionConnectEvent;
    /** Sent to the event page just before it is unloaded. This gives the extension opportunity to do some clean up. Note that since the page is unloading, any asynchronous operations started while handling this event are not guaranteed to complete. If more activity for the event page occurs before it gets unloaded the onSuspendCanceled event will be sent and the page won't be unloaded. */
    export var onSuspend: RuntimeEvent;
    /**
     * Fired when a profile that has this extension installed first starts up. This event is not fired when an incognito profile is started, even if this extension is operating in 'split' incognito mode.
     */
    export var onStartup: RuntimeEvent;
    /** Fired when the extension is first installed, when the extension is updated to a new version, and when Chrome is updated to a new version. */
    export var onInstalled: RuntimeInstalledEvent;
    /** Sent after onSuspend to indicate that the app won't be unloaded after all. */
    export var onSuspendCanceled: RuntimeEvent;
    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    export var onMessage: ExtensionMessageEvent;
    /**
     * Fired when a message is sent from another extension/app. Cannot be used in a content script.
     */
    export var onMessageExternal: ExtensionMessageEvent;
    /**
     * Fired when an update is available, but isn't installed immediately because the app is currently running. If you do nothing, the update will be installed the next time the background page gets unloaded, if you want it to be installed sooner you can explicitly call browser.runtime.reload(). If your extension is using a persistent background page, the background page of course never gets unloaded, so unless you call browser.runtime.reload() manually in response to this event the update will not get installed until the next time browser itself restarts. If no handlers are listening for this event, and your extension has a persistent background page, it behaves as if browser.runtime.reload() is called in response to this event.
     */
    export var onUpdateAvailable: RuntimeUpdateAvailableEvent;
    /**
     * @deprecated since Chrome 33. Please use browser.runtime.onRestartRequired.
     * Fired when a Chrome update is available, but isn't installed immediately because a browser restart is required.
     */
    export var onBrowserUpdateAvailable: RuntimeEvent;
}

////////////////////
// Sessions
////////////////////
/**
 * Use the browser.sessions API to query and restore tabs and windows from a browsing session.
 * Permissions:  "sessions"
 */
export namespace sessions {
    export interface Filter {
        /**
         * Optional.
         * The maximum number of entries to be fetched in the requested list. Omit this parameter to fetch the maximum number of entries (sessions.MAX_SESSION_RESULTS).
         */
        maxResults?: number;
    }

    export interface Session {
        /** The time when the window or tab was closed or modified, represented in milliseconds since the epoch. */
        lastModified: number;
        /**
         * Optional.
         * The tabs.Tab, if this entry describes a tab. Either this or sessions.Session.window will be set.
         */
        tab?: tabs.Tab;
        /**
         * Optional.
         * The windows.Window, if this entry describes a window. Either this or sessions.Session.tab will be set.
         */
        window?: windows.Window;
    }

    export interface Device {
        /** The name of the foreign device. */
        deviceName: string;
        /** A list of open window sessions for the foreign device, sorted from most recently to least recently modified session. */
        sessions: Session[];
    }

    export interface SessionChangedEvent extends events.Event<() => void> { }

    /** The maximum number of sessions.Session that will be included in a requested list. */
    export var MAX_SESSION_RESULTS: number;

    /**
     * Gets the list of recently closed tabs and/or windows.
     */
    export function getRecentlyClosed(filter: Filter): Promise<Session[]>;
    /**
     * Gets the list of recently closed tabs and/or windows.
     */
    export function getRecentlyClosed(): Promise<Session[]>;
    /**
     * Retrieves all devices with synced sessions.
     */
    export function getDevices(filter: Filter): Promise<Device[]>;
    /**
     * Retrieves all devices with synced sessions.
     */
    export function getDevices(): Promise<Device[]>;
    /**
     * Reopens a windows.Window or tabs.Tab.
     * @param sessionId Optional.
     * The windows.Window.sessionId, or tabs.Tab.sessionId to restore. If this parameter is not specified, the most recently closed session is restored.
     */
    export function restore(sessionId?: string): Promise<Session>;

    /** Fired when recently closed tabs and/or windows are changed. This event does not monitor synced sessions changes. */
    export var onChanged: SessionChangedEvent;
}

////////////////////
// Storage
////////////////////
/**
 * Use the browser.storage API to store, retrieve, and track changes to user data.
 * Permissions:  "storage"
 */
export namespace storage {
    // Non-firefox implementations don't accept all these types
    type StorageValue =
        string |
        number |
        boolean |
        null |
        undefined |
        RegExp |
        ArrayBuffer |
        Uint8ClampedArray |
        Uint8Array |
        Uint16Array |
        Uint32Array |
        Int8Array |
        Int16Array |
        Int32Array |
        Float32Array |
        Float64Array |
        DataView |
        StorageObject |
        StorageArray |
        StorageMap |
        StorageSet;
    // The Index signature makes casting to/from classes or export interfaces a pain.
    // Custom types are OK.
    export interface StorageObject {
        [key: string]: StorageValue;
    }
    // These have to be export interfaces rather than types to avoid a circular
    // definition of StorageValue
    export interface StorageArray extends Array<StorageValue> { }
    export interface StorageMap extends Map<StorageValue, StorageValue> { }
    export interface StorageSet extends Set<StorageValue> { }

    export interface StorageArea {
        /**
         * Gets the amount of space (in bytes) being used by one or more items.
         */
        getBytesInUse(): Promise<number>;
        /**
         * Gets the amount of space (in bytes) being used by one or more items.
         * @param keys A single key or list of keys to get the total usage for. An empty list will return 0. Pass in null to get the total usage of all of storage.
         */
        getBytesInUse(keys: string | string[] | null, ): Promise<number>;
        /**
         * Removes all items from storage.
         */
        clear(callback?: () => void): void;
        /**
         * Sets multiple items.
         * @param items An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
         * Primitive values such as numbers will serialize as expected. Values with a typeof "object" and "export function" will typically serialize to {}, with the exception of Array (serializes as expected), Date, and Regex (serialize using their String representation).
         */
        set(items: Object): Promise<void>;
        /**
         * Removes one item from storage.
         * @param key A single key for items to remove.
         */
        remove(key: string): Promise<void>;
        /**
         * Removes items from storage.
         * @param keys A list of keys for items to remove.
         */
        remove(keys: string[]): Promise<void>;
        /**
         * Gets one or more items from storage.
         */
        // get(keys: string | string[] | null): Promise<StorageObject>;
        // get<T extends StorageObject>(keys: T): Promise<T>;
        /**
         * Gets one or more items from storage.
         * @param keys A single key to get, list of keys to get, or a dictionary specifying default values.
         * An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
         */
        get(keys: string | string[] | Object | null): Promise<{ [key: string]: any }>;
    }

    export interface StorageChange {
        /** Optional. The new value of the item, if there is a new value. */
        newValue?: any;
        /** Optional. The old value of the item, if there was an old value. */
        oldValue?: any;
    }

    export interface LocalStorageArea extends StorageArea {
        /** The maximum amount (in bytes) of data that can be stored in local storage, as measured by the JSON stringification of every value plus every key's length. This value will be ignored if the extension has the unlimitedStorage permission. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError. */
        QUOTA_BYTES: number;
    }

    export interface SyncStorageArea extends StorageArea {
        /** @deprecated since Chrome 40. The storage.sync API no longer has a sustained write operation quota. */
        MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: number;
        /** The maximum total amount (in bytes) of data that can be stored in sync storage, as measured by the JSON stringification of every value plus every key's length. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError. */
        QUOTA_BYTES: number;
        /** The maximum size (in bytes) of each individual item in sync storage, as measured by the JSON stringification of its value plus its key length. Updates containing items larger than this limit will fail immediately and set runtime.lastError. */
        QUOTA_BYTES_PER_ITEM: number;
        /** The maximum number of items that can be stored in sync storage. Updates that would cause this limit to be exceeded will fail immediately and set runtime.lastError. */
        MAX_ITEMS: number;
        /**
         * The maximum number of set, remove, or clear operations that can be performed each hour. This is 1 every 2 seconds, a lower ceiling than the short term higher writes-per-minute limit.
         * Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError.
         */
        MAX_WRITE_OPERATIONS_PER_HOUR: number;
        /**
         * The maximum number of set, remove, or clear operations that can be performed each minute. This is 2 per second, providing higher throughput than writes-per-hour over a shorter period of time.
         * Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError.
         */
        MAX_WRITE_OPERATIONS_PER_MINUTE: number;
    }

    export interface StorageChangedEvent extends events.Event<(changes: { [key: string]: StorageChange }, areaName: string) => void> { }

    /** Items in the local storage area are local to each machine. */
    export var local: LocalStorageArea;
    /** Items in the sync storage area are synced using Chrome Sync. */
    export var sync: SyncStorageArea;

    /**
     * Items in the managed storage area are set by the domain administrator, and are read-only for the extension; trying to modify this namespace results in an error.
     */
    export var managed: StorageArea;

    /** Fired when one or more items change. */
    export var onChanged: StorageChangedEvent;
}

////////////////////
// Tabs
////////////////////
/**
 * Use the tabs API to interact with the browser's tab system. You can use this API to create, modify, and rearrange tabs in the browser.
 * Permissions: The majority of the tabs API can be used without declaring any permission. However, the "tabs" permission is required in order to populate the url, title, and favIconUrl properties of Tab.
 */
export namespace tabs {
    /**
     * Tab muted state and the reason for the last state change.
     */
    export interface MutedInfo {
        /** Whether the tab is prevented from playing sound (but hasn't necessarily recently produced sound). Equivalent to whether the muted audio indicator is showing. */
        muted: boolean;
        /**
         * Optional.
         * The reason the tab was muted or unmuted. Not set if the tab's mute state has never been changed.
         * "user": A user input action has set/overridden the muted state.
         * "capture": Tab capture started, forcing a muted state change.
         * "extension": An extension, identified by the extensionId field, set the muted state.
         */
        reason?: string;
        /**
         * Optional.
         * The ID of the extension that changed the muted state. Not set if an extension was not the reason the muted state last changed.
         */
        extensionId?: string;
    }

    export interface Tab {
        /**
         * Optional.
         * Either loading or complete.
         */
        status?: string;
        /** The zero-based index of the tab within its window. */
        index: number;
        /**
         * Optional.
         * The ID of the tab that opened this tab, if any. This property is only present if the opener tab still exists.
         */
        openerTabId?: number;
        /**
         * Optional.
         * The title of the tab. This property is only present if the extension's manifest includes the "tabs" permission.
         */
        title?: string;
        /**
         * Optional.
         * The URL the tab is displaying. This property is only present if the extension's manifest includes the "tabs" permission.
         */
        url?: string;
        /**
         * Whether the tab is pinned.
         */
        pinned: boolean;
        /**
         * Whether the tab is highlighted.
         */
        highlighted: boolean;
        /** The ID of the window the tab is contained within. */
        windowId: number;
        /**
         * Whether the tab is active in its window. (Does not necessarily mean the window is focused.)
         */
        active: boolean;
        /**
         * Optional.
         * The URL of the tab's favicon. This property is only present if the extension's manifest includes the "tabs" permission. It may also be an empty string if the tab is loading.
         */
        favIconUrl?: string;
        /**
         * Optional.
         * The ID of the tab. Tab IDs are unique within a browser session. Under some circumstances a Tab may not be assigned an ID, for example when querying foreign tabs using the sessions API, in which case a session ID may be present. Tab ID can also be set to tabs.TAB_ID_NONE for apps and devtools windows.
         */
        id?: number;
        /** Whether the tab is in an incognito window. */
        incognito: boolean;
        /**
         * Whether the tab is selected.
         * @deprecated since Chrome 33. Please use tabs.Tab.highlighted.
         */
        selected: boolean;
        /**
         * Optional.
         * Whether the tab has produced sound over the past couple of seconds (but it might not be heard if also muted). Equivalent to whether the speaker audio indicator is showing.
         */
        audible?: boolean;
        /**
         * Optional.
         * Current tab muted state and the reason for the last state change.
         */
        mutedInfo?: MutedInfo;
        /**
         * Optional. The width of the tab in pixels.
         */
        width?: number;
        /**
         * Optional. The height of the tab in pixels.
         */
        height?: number;
        /**
         * Optional. The session ID used to uniquely identify a Tab obtained from the sessions API.
         */
        sessionId?: string;
    }

    /**
     * Defines how zoom changes in a tab are handled and at what scope.
     */
    export interface ZoomSettings {
        /**
         * Optional.
         * Defines how zoom changes are handled, i.e. which entity is responsible for the actual scaling of the page; defaults to "automatic".
         * "automatic": Zoom changes are handled automatically by the browser.
         * "manual": Overrides the automatic handling of zoom changes. The onZoomChange event will still be dispatched, and it is the responsibility of the extension to listen for this event and manually scale the page. This mode does not support per-origin zooming, and will thus ignore the scope zoom setting and assume per-tab.
         * "disabled": Disables all zooming in the tab. The tab will revert to the default zoom level, and all attempted zoom changes will be ignored.
         */
        mode?: string;
        /**
         * Optional.
         * Defines whether zoom changes will persist for the page's origin, or only take effect in this tab; defaults to per-origin when in automatic mode, and per-tab otherwise.
         * "per-origin": Zoom changes will persist in the zoomed page's origin, i.e. all other tabs navigated to that same origin will be zoomed as well. Moreover, per-origin zoom changes are saved with the origin, meaning that when navigating to other pages in the same origin, they will all be zoomed to the same zoom factor. The per-origin scope is only available in the automatic mode.
         * "per-tab": Zoom changes only take effect in this tab, and zoom changes in other tabs will not affect the zooming of this tab. Also, per-tab zoom changes are reset on navigation; navigating a tab will always load pages with their per-origin zoom factors.
         */
        scope?: string;
        /**
         * Optional.
         * Used to return the default zoom level for the current tab in calls to tabs.getZoomSettings.
         */
        defaultZoomFactor?: number;
    }

    export interface InjectDetails {
        /**
         * Optional.
         * If allFrames is true, implies that the JavaScript or CSS should be injected into all frames of current page. By default, it's false and is only injected into the top frame.
         */
        allFrames?: boolean;
        /**
         * Optional. JavaScript or CSS code to inject.
         * Warning: Be careful using the code parameter. Incorrect use of it may open your extension to cross site scripting attacks.
         */
        code?: string;
        /**
         * Optional. The soonest that the JavaScript or CSS will be injected into the tab.
         * One of: "document_start", "document_end", or "document_idle"
         */
        runAt?: string;
        /** Optional. JavaScript or CSS file to inject. */
        file?: string;
        /**
         * Optional.
         * The frame where the script or CSS should be injected. Defaults to 0 (the top-level frame).
         */
        frameId?: number;
        /**
         * Optional.
         * If matchAboutBlank is true, then the code is also injected in about:blank and about:srcdoc frames if your extension has access to its parent document. Code cannot be inserted in top-level about:-frames. By default it is false.
         */
        matchAboutBlank?: boolean;
    }

    export interface CreateProperties {
        /** Optional. The position the tab should take in the window. The provided value will be clamped to between zero and the number of tabs in the window. */
        index?: number;
        /**
         * Optional.
         * The ID of the tab that opened this tab. If specified, the opener tab must be in the same window as the newly created tab.
         */
        openerTabId?: number;
        /**
         * Optional.
         * The URL to navigate the tab to initially. Fully-qualified URLs must include a scheme (i.e. 'http://www.google.com', not 'www.google.com'). Relative URLs will be relative to the current page within the extension. Defaults to the New Tab Page.
         */
        url?: string;
        /**
         * Optional. Whether the tab should be pinned. Defaults to false
         */
        pinned?: boolean;
        /** Optional. The window to create the new tab in. Defaults to the current window. */
        windowId?: number;
        /**
         * Optional.
         * Whether the tab should become the active tab in the window. Does not affect whether the window is focused (see windows.update). Defaults to true.
         */
        active?: boolean;
        /**
         * Optional. Whether the tab should become the selected tab in the window. Defaults to true
         * @deprecated since Chrome 33. Please use active.
         */
        selected?: boolean;
    }

    export interface MoveProperties {
        /** The position to move the window to. -1 will place the tab at the end of the window. */
        index: number;
        /** Optional. Defaults to the window the tab is currently in. */
        windowId?: number;
    }

    export interface UpdateProperties {
        /**
         * Optional. Whether the tab should be pinned.
         */
        pinned?: boolean;
        /**
         * Optional. The ID of the tab that opened this tab. If specified, the opener tab must be in the same window as this tab.
         */
        openerTabId?: number;
        /** Optional. A URL to navigate the tab to. */
        url?: string;
        /**
         * Optional. Adds or removes the tab from the current selection.
         */
        highlighted?: boolean;
        /**
         * Optional. Whether the tab should be active. Does not affect whether the window is focused (see windows.update).
         */
        active?: boolean;
        /**
         * Optional. Whether the tab should be selected.
         * @deprecated since Chrome 33. Please use highlighted.
         */
        selected?: boolean;
        /**
         * Optional. Whether the tab should be muted.
         */
        muted?: boolean;
    }

    export interface CaptureVisibleTabOptions {
        /**
         * Optional.
         * When format is "jpeg", controls the quality of the resulting image. This value is ignored for PNG images. As quality is decreased, the resulting image will have more visual artifacts, and the number of bytes needed to store it will decrease.
         */
        quality?: number;
        /**
         * Optional. The format of an image.
         * One of: "jpeg", or "png"
         */
        format?: string;
    }

    export interface ReloadProperties {
        /** Optional. Whether using any local cache. Default is false. */
        bypassCache?: boolean;
    }

    export interface ConnectInfo {
        /** Optional. Will be passed into onConnect for content scripts that are listening for the connection event. */
        name?: string;
        /**
         * Open a port to a specific frame identified by frameId instead of all frames in the tab.
         */
        frameId?: number;
    }

    export interface MessageSendOptions {
        /** Optional. Send a message to a specific frame identified by frameId instead of all frames in the tab. */
        frameId?: number;
    }

    export interface HighlightInfo {
        /** One or more tab indices to highlight. */
        tabs: number | number[];
        /** Optional. The window that contains the tabs. */
        windowId?: number;
    }

    export interface QueryInfo {
        /**
         * Optional. Whether the tabs have completed loading.
         * One of: "loading", or "complete"
         */
        status?: string;
        /**
         * Optional. Whether the tabs are in the last focused window.
         */
        lastFocusedWindow?: boolean;
        /** Optional. The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window. */
        windowId?: number;
        /**
         * Optional. The type of window the tabs are in.
         * One of: "normal", "popup", "panel", "app", or "devtools"
         */
        windowType?: string;
        /** Optional. Whether the tabs are active in their windows. */
        active?: boolean;
        /**
         * Optional. The position of the tabs within their windows.
         */
        index?: number;
        /** Optional. Match page titles against a pattern. */
        title?: string;
        /** Optional. Match tabs against one or more URL patterns. Note that fragment identifiers are not matched. */
        url?: string | string[];
        /**
         * Optional. Whether the tabs are in the current window.
         */
        currentWindow?: boolean;
        /** Optional. Whether the tabs are highlighted. */
        highlighted?: boolean;
        /** Optional. Whether the tabs are pinned. */
        pinned?: boolean;
        /**
         * Optional. Whether the tabs are audible.
         */
        audible?: boolean;
        /**
         * Optional. Whether the tabs are muted.
         */
        muted?: boolean;
    }

    export interface TabHighlightInfo {
        windowId: number;
        tabIds: number[];
    }

    export interface TabRemoveInfo {
        /**
         * The window whose tab is closed.
         */
        windowId: number;
        /** True when the tab is being closed because its window is being closed. */
        isWindowClosing: boolean;
    }

    export interface TabAttachInfo {
        newPosition: number;
        newWindowId: number;
    }

    export interface TabChangeInfo {
        /** Optional. The status of the tab. Can be either loading or complete. */
        status?: string;
        /**
         * The tab's new pinned state.
         */
        pinned?: boolean;
        /** Optional. The tab's URL if it has changed. */
        url?: string;
        /**
         * The tab's new audible state.
         */
        audible?: boolean;
        /**
         * The tab's new muted state and the reason for the change.
         */
        mutedInfo?: MutedInfo;
        /**
         * The tab's new favicon URL.
         */
        favIconUrl?: string;
        /**
         * The tab's new title.
         */
        title?: string;
    }

    export interface TabMoveInfo {
        toIndex: number;
        windowId: number;
        fromIndex: number;
    }

    export interface TabDetachInfo {
        oldWindowId: number;
        oldPosition: number;
    }

    export interface TabActiveInfo {
        /** The ID of the tab that has become active. */
        tabId: number;
        /** The ID of the window the active tab changed inside of. */
        windowId: number;
    }

    export interface TabWindowInfo {
        /** The ID of the window of where the tab is located. */
        windowId: number;
    }

    export interface ZoomChangeInfo {
        tabId: number;
        oldZoomFactor: number;
        newZoomFactor: number;
        zoomSettings: ZoomSettings;
    }

    export interface TabHighlightedEvent extends events.Event<(highlightInfo: HighlightInfo) => void> { }

    export interface TabRemovedEvent extends events.Event<(tabId: number, removeInfo: TabRemoveInfo) => void> { }

    export interface TabUpdatedEvent extends events.Event<(tabId: number, changeInfo: TabChangeInfo, tab: Tab) => void> { }

    export interface TabAttachedEvent extends events.Event<(tabId: number, attachInfo: TabAttachInfo) => void> { }

    export interface TabMovedEvent extends events.Event<(tabId: number, moveInfo: TabMoveInfo) => void> { }

    export interface TabDetachedEvent extends events.Event<(tabId: number, detachInfo: TabDetachInfo) => void> { }

    export interface TabCreatedEvent extends events.Event<(tab: Tab) => void> { }

    export interface TabActivatedEvent extends events.Event<(activeInfo: TabActiveInfo) => void> { }

    export interface TabReplacedEvent extends events.Event<(addedTabId: number, removedTabId: number) => void> { }

    export interface TabSelectedEvent extends events.Event<(tabId: number, selectInfo: TabWindowInfo) => void> { }

    export interface TabZoomChangeEvent extends events.Event<(ZoomChangeInfo: ZoomChangeInfo) => void> { }

    /**
     * Injects JavaScript code into a page. For details, see the programmatic injection section of the content scripts doc.
     * @param details Details of the script or CSS to inject. Either the code or the file property must be set, but both may not be set at the same time.
     */
    export function executeScript(details: InjectDetails): Promise<any[]>;
    /**
     * Injects JavaScript code into a page. For details, see the programmatic injection section of the content scripts doc.
     * @param tabId Optional. The ID of the tab in which to run the script; defaults to the active tab of the current window.
     * @param details Details of the script or CSS to inject. Either the code or the file property must be set, but both may not be set at the same time.
     */
    export function executeScript(tabId: number, details: InjectDetails): Promise<any[]>;
    /** Retrieves details about the specified tab. */
    export function get(tabId: number, ): Promise<Tab>;
    /**
     * Gets details about all tabs in the specified window.
     * @deprecated since Chrome 33. Please use tabs.query {windowId: windowId}.
     */
    export function getAllInWindow(): Promise<Tab>;
    /**
     * Gets details about all tabs in the specified window.
     * @deprecated since Chrome 33. Please use tabs.query {windowId: windowId}.
     * @param windowId Optional. Defaults to the current window.
     */
    export function getAllInWindow(windowId: number, ): Promise<Tab>;
    /** Gets the tab that this script call is being made from. May be undefined if called from a non-tab context (for example: a background page or popup view). */
    export function getCurrent(): Promise<Tab>;
    /**
     * Gets the tab that is selected in the specified window.
     * @deprecated since Chrome 33. Please use tabs.query {active: true}.
     */
    export function getSelected(): Promise<Tab>;
    /**
     * Gets the tab that is selected in the specified window.
     * @deprecated since Chrome 33. Please use tabs.query {active: true}.
     * @param windowId Optional. Defaults to the current window.
     */
    export function getSelected(windowId: number, ): Promise<Tab>;
    /**
     * Creates a new tab.
     */
    export function create(createProperties: CreateProperties): Promise<Tab>;
    /**
     * Moves one or more tabs to a new position within its window, or to a new window. Note that tabs can only be moved to and from normal (window.type === "normal") windows.
     * @param tabId The tab to move.
     */
    export function move(tabId: number, moveProperties: MoveProperties): Promise<Tab>;
    /**
     * Moves one or more tabs to a new position within its window, or to a new window. Note that tabs can only be moved to and from normal (window.type === "normal") windows.
     * @param tabIds The tabs to move.
     */
    export function move(tabIds: number[], moveProperties: MoveProperties): Promise<Tab[]>;
    /**
     * Modifies the properties of a tab. Properties that are not specified in updateProperties are not modified.
     */
    export function update(updateProperties: UpdateProperties): Promise<Tab>;
    /**
     * Modifies the properties of a tab. Properties that are not specified in updateProperties are not modified.
     * @param tabId Defaults to the selected tab of the current window.
     */
    export function update(tabId: number, updateProperties: UpdateProperties): Promise<Tab>;
    /**
     * Closes a tab.
     * @param tabId The tab to close.
     */
    export function remove(tabId: number): Promise<void>;
    /**
     * Closes several tabs.
     * @param tabIds The list of tabs to close.
     */
    export function remove(tabIds: number[]): Promise<void>;
    /**
     * Captures the visible area of the currently active tab in the specified window. You must have <all_urls> permission to use this method.
     */
    export function captureVisibleTab(): Promise<string>;
    /**
     * Captures the visible area of the currently active tab in the specified window. You must have <all_urls> permission to use this method.
     * @param windowId Optional. The target window. Defaults to the current window.
     */
    export function captureVisibleTab(windowId: number, ): Promise<string>;
    /**
     * Captures the visible area of the currently active tab in the specified window. You must have <all_urls> permission to use this method.
     * @param options Optional. Details about the format and quality of an image.
     */
    export function captureVisibleTab(options: CaptureVisibleTabOptions, ): Promise<string>;
    /**
     * Captures the visible area of the currently active tab in the specified window. You must have <all_urls> permission to use this method.
     * @param windowId Optional. The target window. Defaults to the current window.
     * @param options Optional. Details about the format and quality of an image.
     */
    export function captureVisibleTab(windowId: number, options: CaptureVisibleTabOptions, ): Promise<string>;
    /**
     * Reload a tab.
     * @param tabId The ID of the tab to reload; defaults to the selected tab of the current window.
     */
    export function reload(tabId: number, reloadProperties?: ReloadProperties): Promise<void>;
    /**
     * Reload the selected tab of the current window.
     */
    export function reload(reloadProperties: ReloadProperties): Promise<void>;
    /**
     * Reload the selected tab of the current window.
     */
    export function reload(): Promise<void>;
    /**
     * Duplicates a tab.
     * @param tabId The ID of the tab which is to be duplicated.
     */
    export function duplicate(tabId: number): Promise<Tab>;
    /**
     * Sends a single message to the content script(s) in the specified tab, with an optional callback to run when a response is sent back. The runtime.onMessage event is fired in each content script running in the specified tab for the current extension.
     */
    export function sendMessage(tabId: number, message: any): Promise<any>;
    /**
     * Sends a single message to the content script(s) in the specified tab, with an optional callback to run when a response is sent back. The runtime.onMessage event is fired in each content script running in the specified tab for the current extension.
     */
    export function sendMessage(tabId: number, message: any, options: MessageSendOptions): Promise<any>;
    /**
     * Sends a single request to the content script(s) in the specified tab, with an optional callback to run when a response is sent back. The extension.onRequest event is fired in each content script running in the specified tab for the current extension.
     */
    export function sendRequest(tabId: number, request: any): Promise<any>;
    /** Connects to the content script(s) in the specified tab. The runtime.onConnect event is fired in each content script running in the specified tab for the current extension. */
    export function connect(tabId: number, connectInfo?: ConnectInfo): runtime.Port;
    /**
     * Injects CSS into a page. For details, see the programmatic injection section of the content scripts doc.
     * @param details Details of the script or CSS to inject. Either the code or the file property must be set, but both may not be set at the same time.
     */
    export function insertCSS(details: InjectDetails): Promise<void>;
    /**
     * Injects CSS into a page. For details, see the programmatic injection section of the content scripts doc.
     * @param tabId Optional. The ID of the tab in which to insert the CSS; defaults to the active tab of the current window.
     * @param details Details of the script or CSS to inject. Either the code or the file property must be set, but both may not be set at the same time.
     */
    export function insertCSS(tabId: number, details: InjectDetails): Promise<void>;
    /**
     * Highlights the given tabs.
     */
    export function highlight(highlightInfo: HighlightInfo): Promise<windows.Window>;
    /**
     * Gets all tabs that have the specified properties, or all tabs if no properties are specified.
     */
    export function query(queryInfo: QueryInfo): Promise<Tab[]>;
    /**
     * Detects the primary language of the content in a tab.
     */
    export function detectLanguage(): Promise<string>;
    /**
     * Detects the primary language of the content in a tab.
     * @param tabId Optional. Defaults to the active tab of the current window.
     */
    export function detectLanguage(tabId: number, ): Promise<string>;
    /**
     * Zooms a specified tab.
     * @param zoomFactor The new zoom factor. Use a value of 0 here to set the tab to its current default zoom factor. Values greater than zero specify a (possibly non-default) zoom factor for the tab.
     */
    export function setZoom(zoomFactor: number): Promise<void>;
    /**
     * Zooms a specified tab.
     * @param tabId Optional. The ID of the tab to zoom; defaults to the active tab of the current window.
     * @param zoomFactor The new zoom factor. Use a value of 0 here to set the tab to its current default zoom factor. Values greater than zero specify a (possibly non-default) zoom factor for the tab.
     */
    export function setZoom(tabId: number, zoomFactor: number): Promise<void>;
    /**
     * Gets the current zoom factor of a specified tab.
     */
    export function getZoom(): Promise<number>;
    /**
     * Gets the current zoom factor of a specified tab.
     * @param tabId Optional. The ID of the tab to get the current zoom factor from; defaults to the active tab of the current window.
     */
    export function getZoom(tabId: number, ): Promise<number>;
    /**
     * Sets the zoom settings for a specified tab, which define how zoom changes are handled. These settings are reset to defaults upon navigating the tab.
     * @param zoomSettings Defines how zoom changes are handled and at what scope.
     */
    export function setZoomSettings(zoomSettings: ZoomSettings): Promise<void>;
    /**
     * Sets the zoom settings for a specified tab, which define how zoom changes are handled. These settings are reset to defaults upon navigating the tab.
     * @param tabId Optional. The ID of the tab to change the zoom settings for; defaults to the active tab of the current window.
     * @param zoomSettings Defines how zoom changes are handled and at what scope.
     */
    export function setZoomSettings(tabId: number, zoomSettings: ZoomSettings): Promise<void>;
    /**
     * Gets the current zoom settings of a specified tab.
     * Paramater zoomSettings: The tab's current zoom settings.
     */
    export function getZoomSettings(): Promise<ZoomSettings>;
    /**
     * Gets the current zoom settings of a specified tab.
     * @param tabId Optional. The ID of the tab to get the current zoom settings from; defaults to the active tab of the current window.
     * Paramater zoomSettings: The tab's current zoom settings.
     */
    export function getZoomSettings(tabId: number, ): Promise<ZoomSettings>;

    /**
     * Fired when the highlighted or selected tabs in a window changes.
     */
    export var onHighlighted: TabHighlightedEvent;
    /** Fired when a tab is closed. */
    export var onRemoved: TabRemovedEvent;
    /** Fired when a tab is updated. */
    export var onUpdated: TabUpdatedEvent;
    /** Fired when a tab is attached to a window, for example because it was moved between windows. */
    export var onAttached: TabAttachedEvent;
    /**
     * Fired when a tab is moved within a window. Only one move event is fired, representing the tab the user directly moved. Move events are not fired for the other tabs that must move in response. This event is not fired when a tab is moved between windows. For that, see tabs.onDetached.
     */
    export var onMoved: TabMovedEvent;
    /** Fired when a tab is detached from a window, for example because it is being moved between windows. */
    export var onDetached: TabDetachedEvent;
    /** Fired when a tab is created. Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events to be notified when a URL is set. */
    export var onCreated: TabCreatedEvent;
    /**
     * Fires when the active tab in a window changes. Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events to be notified when a URL is set.
     */
    export var onActivated: TabActivatedEvent;
    /**
     * Fired when a tab is replaced with another tab due to prerendering or instant.
     */
    export var onReplaced: TabReplacedEvent;
    /**
     * @deprecated since Chrome 33. Please use tabs.onActivated.
     * Fires when the selected tab in a window changes.
     */
    export var onSelectionChanged: TabSelectedEvent;
    /**
     * @deprecated since Chrome 33. Please use tabs.onActivated.
     * Fires when the selected tab in a window changes. Note that the tab's URL may not be set at the time this event fired, but you can listen to tabs.onUpdated events to be notified when a URL is set.
     */
    export var onActiveChanged: TabSelectedEvent;
    /**
     * @deprecated since Chrome 33. Please use tabs.onHighlighted.
     * Fired when the highlighted or selected tabs in a window changes.
     */
    export var onHighlightChanged: TabHighlightedEvent;
    /**
     * Fired when a tab is zoomed.
     */
    export var onZoomChange: TabZoomChangeEvent;

    /**
     * An ID which represents the absence of a browser tab.
     */
    export var TAB_ID_NONE: -1;
}

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
        get(details: ChromeSettingGetDetails, callback?: DetailsCallback): void;
        /**
         * Clears the setting, restoring any default value.
         * @param details Which setting to clear.
         */
        clear(details: ChromeSettingClearDetails): Promise<void>;
        /** Fired after the setting changes. */
        onChange: ChromeSettingChangedEvent;
    }
}

////////////////////
// Web Navigation
////////////////////
/**
 * Use the browser.webNavigation API to receive notifications about the status of navigation requests in-flight.
 * Permissions:  "webNavigation"
 */
export namespace webNavigation {
    export interface GetFrameDetails {
        /**
         * The ID of the process runs the renderer for this tab.
         * @deprecated since Chrome 49. Frames are now uniquely identified by their tab ID and frame ID; the process ID is no longer needed and therefore ignored.
         */
        processId?: number;
        /** The ID of the tab in which the frame is. */
        tabId: number;
        /** The ID of the frame in the given tab. */
        frameId: number;
    }

    export interface GetFrameResultDetails {
        /** The URL currently associated with this frame, if the frame identified by the frameId existed at one point in the given tab. The fact that an URL is associated with a given frameId does not imply that the corresponding frame still exists. */
        url: string;
        /** True if the last navigation in this frame was interrupted by an error, i.e. the onErrorOccurred event fired. */
        errorOccurred: boolean;
        /** ID of frame that wraps the frame. Set to -1 of no parent frame exists. */
        parentFrameId: number;
    }

    export interface GetAllFrameDetails {
        /** The ID of the tab. */
        tabId: number;
    }

    export interface GetAllFrameResultDetails extends GetFrameResultDetails {
        /** The ID of the process runs the renderer for this tab. */
        processId: number;
        /** The ID of the frame. 0 indicates that this is the main frame; a positive value indicates the ID of a subframe. */
        frameId: number;
    }

    export interface WebNavigationCallbackDetails {
        /** The ID of the tab in which the navigation is about to occur. */
        tabId: number;
        /** The time when the browser was about to start the navigation, in milliseconds since the epoch. */
        timeStamp: number;
    }

    export interface WebNavigationUrlCallbackDetails extends WebNavigationCallbackDetails {
        url: string;
    }

    export interface WebNavigationReplacementCallbackDetails extends WebNavigationCallbackDetails {
        /** The ID of the tab that was replaced. */
        replacedTabId: number;
    }

    export interface WebNavigationFramedCallbackDetails extends WebNavigationUrlCallbackDetails {
        /** 0 indicates the navigation happens in the tab content window; a positive value indicates navigation in a subframe. Frame IDs are unique for a given tab and process. */
        frameId: number;
        /**
         * The ID of the process runs the renderer for this tab.
         */
        processId: number;
    }

    export interface WebNavigationFramedErrorCallbackDetails extends WebNavigationFramedCallbackDetails {
        /** The error description. */
        error: string;
    }

    export interface WebNavigationSourceCallbackDetails extends WebNavigationUrlCallbackDetails {
        /** The ID of the tab in which the navigation is triggered. */
        sourceTabId: number;
        /**
         * The ID of the process runs the renderer for the source tab.
         */
        sourceProcessId: number;
        /** The ID of the frame with sourceTabId in which the navigation is triggered. 0 indicates the main frame. */
        sourceFrameId: number;
    }

    export interface WebNavigationParentedCallbackDetails extends WebNavigationFramedCallbackDetails {
        /**
         * ID of frame that wraps the frame. Set to -1 of no parent frame exists.
         */
        parentFrameId: number;
    }

    export interface WebNavigationTransitionCallbackDetails extends WebNavigationFramedCallbackDetails {
        /**
         * Cause of the navigation.
         * One of: "link", "typed", "auto_bookmark", "auto_subframe", "manual_subframe", "generated", "start_page", "form_submit", "reload", "keyword", or "keyword_generated"
         */
        transitionType: string;
        /**
         * A list of transition qualifiers.
         * Each element one of: "client_redirect", "server_redirect", "forward_back", or "from_address_bar"
         */
        transitionQualifiers: string[];
    }

    export interface WebNavigationEventFilter {
        /** Conditions that the URL being navigated to must satisfy. The 'schemes' and 'ports' fields of UrlFilter are ignored for this event. */
        url: events.UrlFilter[];
    }

    export interface WebNavigationEvent<T extends WebNavigationCallbackDetails> extends events.Event<(details: T) => void> {
        addListener(callback: (details: T) => void, filters?: WebNavigationEventFilter): void;
    }

    export interface WebNavigationFramedEvent extends WebNavigationEvent<WebNavigationFramedCallbackDetails> { }

    export interface WebNavigationFramedErrorEvent extends WebNavigationEvent<WebNavigationFramedErrorCallbackDetails> { }

    export interface WebNavigationSourceEvent extends WebNavigationEvent<WebNavigationSourceCallbackDetails> { }

    export interface WebNavigationParentedEvent extends WebNavigationEvent<WebNavigationParentedCallbackDetails> { }

    export interface WebNavigationTransitionalEvent extends WebNavigationEvent<WebNavigationTransitionCallbackDetails> { }

    export interface WebNavigationReplacementEvent extends WebNavigationEvent<WebNavigationReplacementCallbackDetails> { }

    /**
     * Retrieves information about the given frame. A frame refers to an <iframe> or a <frame> of a web page and is identified by a tab ID and a frame ID.
     * @param details Information about the frame to retrieve information about.
     * @param callback
     * Optional parameter details: Information about the requested frame, null if the specified frame ID and/or tab ID are invalid.
     */
    export function getFrame(details: GetFrameDetails, callback: (details: GetFrameResultDetails | null) => void): void;
    /**
     * Retrieves information about all frames of a given tab.
     * @param details Information about the tab to retrieve all frames from.
     * @param callback
     * Optional parameter details: A list of frames in the given tab, null if the specified tab ID is invalid.
     */
    export function getAllFrames(details: GetAllFrameDetails, callback: (details: GetAllFrameResultDetails[] | null) => void): void;

    /** Fired when the reference fragment of a frame was updated. All future events for that frame will use the updated URL. */
    export var onReferenceFragmentUpdated: WebNavigationTransitionalEvent;
    /** Fired when a document, including the resources it refers to, is completely loaded and initialized. */
    export var onCompleted: WebNavigationFramedEvent;
    /**
     * Fired when the frame's history was updated to a new URL. All future events for that frame will use the updated URL.
     */
    export var onHistoryStateUpdated: WebNavigationTransitionalEvent;
    /** Fired when a new window, or a new tab in an existing window, is created to host a navigation. */
    export var onCreatedNavigationTarget: WebNavigationSourceEvent;
    /**
     * Fired when the contents of the tab is replaced by a different (usually previously pre-rendered) tab.
     */
    export var onTabReplaced: WebNavigationReplacementEvent;
    /** Fired when a navigation is about to occur. */
    export var onBeforeNavigate: WebNavigationParentedEvent;
    /** Fired when a navigation is committed. The document (and the resources it refers to, such as images and subframes) might still be downloading, but at least part of the document has been received from the server and the browser has decided to switch to the new document. */
    export var onCommitted: WebNavigationTransitionalEvent;
    /** Fired when the page's DOM is fully constructed, but the referenced resources may not finish loading. */
    export var onDOMContentLoaded: WebNavigationFramedEvent;
    /** Fired when an error occurs and the navigation is aborted. This can happen if either a network error occurred, or the user aborted the navigation. */
    export var onErrorOccurred: WebNavigationFramedErrorEvent;
}

////////////////////
// Web Request
////////////////////
/**
 * Use the browser.webRequest API to observe and analyze traffic and to intercept, block, or modify requests in-flight.
 * Permissions:  "webRequest", host permissions
 */
export namespace webRequest {
    export interface AuthCredentials {
        username: string;
        password: string;
    }

    /** An HTTP Header, represented as an object containing a key and either a value or a binaryValue. */
    export interface HttpHeader {
        name: string;
        value?: string;
        binaryValue?: ArrayBuffer;
    }

    /** Returns value for event handlers that have the 'blocking' extraInfoSpec applied. Allows the event handler to modify network requests. */
    export interface BlockingResponse {
        /** Optional. If true, the request is cancelled. Used in onBeforeRequest, this prevents the request from being sent. */
        cancel?: boolean;
        /**
         * Optional.
         * Only used as a response to the onBeforeRequest and onHeadersReceived events. If set, the original request is prevented from being sent/completed and is instead redirected to the given URL. Redirections to non-HTTP schemes such as data: are allowed. Redirects initiated by a redirect action use the original request method for the redirect, with one exception: If the redirect is initiated at the onHeadersReceived stage, then the redirect will be issued using the GET method.
         */
        redirectUrl?: string;
        /**
         * Optional.
         * Only used as a response to the onHeadersReceived event. If set, the server is assumed to have responded with these response headers instead. Only return responseHeaders if you really want to modify the headers in order to limit the number of conflicts (only one extension may modify responseHeaders for each request).
         */
        responseHeaders?: HttpHeader[];
        /** Optional. Only used as a response to the onAuthRequired event. If set, the request is made using the supplied credentials. */
        authCredentials?: AuthCredentials;
        /**
         * Optional.
         * Only used as a response to the onBeforeSendHeaders event. If set, the request is made with these request headers instead.
         */
        requestHeaders?: HttpHeader[];
    }

    /** An object describing filters to apply to webRequest events. */
    export interface RequestFilter {
        /** Optional. */
        tabId?: number;
        /**
         * A list of request types. Requests that cannot match any of the types will be filtered out.
         * Each element one of: "main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", or "other"
         */
        types?: string[];
        /** A list of URLs or URL patterns. Requests that cannot match any of the URLs will be filtered out. */
        urls: string[];

        /** Optional. */
        windowId?: number;
    }

    /**
     * Contains data uploaded in a URL request.
     */
    export interface UploadData {
        /** Optional. An ArrayBuffer with a copy of the data. */
        bytes?: ArrayBuffer;
        /** Optional. A string with the file's path and name. */
        file?: string;
    }

    export interface WebRequestBody {
        /** Optional. Errors when obtaining request body data. */
        error?: string;
        /**
         * Optional.
         * If the request method is POST and the body is a sequence of key-value pairs encoded in UTF8, encoded as either multipart/form-data, or application/x-www-form-urlencoded, this dictionary is present and for each key contains the list of all values for that key. If the data is of another media type, or if it is malformed, the dictionary is not present. An example value of this dictionary is {'key': ['value1', 'value2']}.
         */
        formData?: { [key: string]: string[] };
        /**
         * Optional.
         * If the request method is PUT or POST, and the body is not already parsed in formData, then the unparsed request body elements are contained in this array.
         */
        raw?: UploadData[];
    }

    export interface WebAuthChallenger {
        host: string;
        port: number;
    }

    export interface ResourceRequest {
        url: string;
        /** The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request. */
        requestId: string;
        /** The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab. */
        frameId: number;
        /** ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists. */
        parentFrameId: number;
        /** The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab. */
        tabId: number;
        /**
         * How the requested resource will be used.
         * One of: "main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", or "other"
         */
        type: string;
        /** The time when this signal is triggered, in milliseconds since the epoch. */
        timeStamp: number;
    }

    export interface WebRequestDetails extends ResourceRequest {
        /** Standard HTTP method. */
        method: string;
    }

    export interface WebRequestHeadersDetails extends WebRequestDetails {
        /** Optional. The HTTP request headers that are going to be sent out with this request. */
        requestHeaders?: HttpHeader[];
    }

    export interface WebRequestBodyDetails extends WebRequestDetails {
        /**
         * Contains the HTTP request body data. Only provided if extraInfoSpec contains 'requestBody'.
         */
        requestBody: WebRequestBody;
    }

    export interface WebRequestFullDetails extends WebRequestHeadersDetails, WebRequestBodyDetails {
    }

    export interface WebResponseDetails extends ResourceRequest {
        /** HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line). */
        statusLine: string;
        /**
         * Standard HTTP status code returned by the server.
         */
        statusCode: number;
    }

    export interface WebResponseHeadersDetails extends WebResponseDetails {
        /** Optional. The HTTP response headers that have been received with this response. */
        responseHeaders?: HttpHeader[];
        method: string; /** standard HTTP method i.e. GET, POST, PUT, etc. */
    }

    export interface WebResponseCacheDetails extends WebResponseHeadersDetails {
        /**
         * Optional.
         * The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
         */
        ip?: string;
        /** Indicates if this response was fetched from disk cache. */
        fromCache: boolean;
    }

    export interface WebRedirectionResponseDetails extends WebResponseCacheDetails {
        /** The new URL. */
        redirectUrl: string;
    }

    export interface WebAuthenticationChallengeDetails extends WebResponseHeadersDetails {
        /** The authentication scheme, e.g. Basic or Digest. */
        scheme: string;
        /** The authentication realm provided by the server, if there is one. */
        realm?: string;
        /** The server requesting authentication. */
        challenger: WebAuthChallenger;
        /** True for Proxy-Authenticate, false for WWW-Authenticate. */
        isProxy: boolean;
    }

    export interface WebResponseErrorDetails extends WebResponseCacheDetails {
        /** The error description. This string is not guaranteed to remain backwards compatible between releases. You must not parse and act based upon its content. */
        error: string;
    }

    export interface WebRequestBodyEvent extends events.Event<(details: WebRequestBodyDetails) => void> {
        addListener(callback: (details: WebRequestBodyDetails) => void, filter?: RequestFilter, opt_extraInfoSpec?: string[]): void;
    }

    export interface WebRequestHeadersEvent extends events.Event<(details: WebRequestHeadersDetails) => void> {
        addListener(callback: (details: WebRequestHeadersDetails) => void, filter?: RequestFilter, opt_extraInfoSpec?: string[]): void;
    }

    export interface _WebResponseHeadersEvent<T extends WebResponseHeadersDetails> extends events.Event<(details: T) => void> {
        addListener(callback: (details: T) => void, filter?: RequestFilter, opt_extraInfoSpec?: string[]): void;
    }

    export interface WebResponseHeadersEvent extends _WebResponseHeadersEvent<WebResponseHeadersDetails> { }

    export interface WebResponseCacheEvent extends _WebResponseHeadersEvent<WebResponseCacheDetails> { }

    export interface WebRedirectionResponseEvent extends _WebResponseHeadersEvent<WebRedirectionResponseDetails> { }

    export interface WebAuthenticationChallengeEvent extends events.Event<(details: WebAuthenticationChallengeDetails, callback?: (response: BlockingResponse) => void) => void> {
        addListener(callback: (details: WebAuthenticationChallengeDetails, callback?: (response: BlockingResponse) => void) => void, filter?: RequestFilter, opt_extraInfoSpec?: string[]): void;
    }

    export interface WebResponseErrorEvent extends _WebResponseHeadersEvent<WebResponseErrorDetails> { }

    /**
     * The maximum number of times that handlerBehaviorChanged can be called per 10 minute sustained interval. handlerBehaviorChanged is an expensive export function call that shouldn't be called often.
     */
    export var MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES: number;

    /** Needs to be called when the behavior of the webRequest handlers has changed to prevent incorrect handling due to caching. This export function call is expensive. Don't call it often. */
    export function handlerBehaviorChanged(callback?: Function): void;

    /** Fired when a request is about to occur. */
    export var onBeforeRequest: WebRequestBodyEvent;
    /** Fired before sending an HTTP request, once the request headers are available. This may occur after a TCP connection is made to the server, but before any HTTP data is sent. */
    export var onBeforeSendHeaders: WebRequestHeadersEvent;
    /** Fired just before a request is going to be sent to the server (modifications of previous onBeforeSendHeaders callbacks are visible by the time onSendHeaders is fired). */
    export var onSendHeaders: WebRequestHeadersEvent;
    /** Fired when HTTP response headers of a request have been received. */
    export var onHeadersReceived: WebResponseHeadersEvent;
    /** Fired when an authentication failure is received. The listener has three options: it can provide authentication credentials, it can cancel the request and display the error page, or it can take no action on the challenge. If bad user credentials are provided, this may be called multiple times for the same request. */
    export var onAuthRequired: WebAuthenticationChallengeEvent;
    /** Fired when the first byte of the response body is received. For HTTP requests, this means that the status line and response headers are available. */
    export var onResponseStarted: WebResponseCacheEvent;
    /** Fired when a server-initiated redirect is about to occur. */
    export var onBeforeRedirect: WebRedirectionResponseEvent;
    /** Fired when a request is completed. */
    export var onCompleted: WebResponseCacheEvent;
    /** Fired when an error occurs. */
    export var onErrorOccurred: WebResponseErrorEvent;
}

////////////////////
// Windows
////////////////////
/**
 * Use the windows API to interact with browser windows. You can use this API to create, modify, and rearrange windows in the browser.
 * Permissions: The windows API can be used without declaring any permission. However, the "tabs" permission is required in order to populate the url, title, and favIconUrl properties of Tab objects.
 */
export namespace windows {
    export interface Window {
        /** Array of tabs.Tab objects representing the current tabs in the window. */
        tabs?: tabs.Tab[];
        /** Optional. The offset of the window from the top edge of the screen in pixels. Under some circumstances a Window may not be assigned top property, for example when querying closed windows from the sessions API. */
        top?: number;
        /** Optional. The height of the window, including the frame, in pixels. Under some circumstances a Window may not be assigned height property, for example when querying closed windows from the sessions API. */
        height?: number;
        /** Optional. The width of the window, including the frame, in pixels. Under some circumstances a Window may not be assigned width property, for example when querying closed windows from the sessions API. */
        width?: number;
        /**
         * The state of this browser window.
         * One of: "normal", "minimized", "maximized", "fullscreen", or "docked"
         */
        state: string;
        /** Whether the window is currently the focused window. */
        focused: boolean;
        /**
         * Whether the window is set to be always on top.
         */
        alwaysOnTop: boolean;
        /** Whether the window is incognito. */
        incognito: boolean;
        /**
         * The type of browser window this is.
         * One of: "normal", "popup", "panel", "app", or "devtools"
         */
        type: string;
        /** Optional. The ID of the window. Window IDs are unique within a browser session. Under some circumstances a Window may not be assigned an ID, for example when querying windows using the sessions API, in which case a session ID may be present. */
        id: number;
        /** Optional. The offset of the window from the left edge of the screen in pixels. Under some circumstances a Window may not be assigned left property, for example when querying closed windows from the sessions API. */
        left?: number;
        /**
         * The session ID used to uniquely identify a Window obtained from the sessions API.
         */
        sessionId?: string;
    }

    export interface GetInfo {
        /**
         * Optional.
         * If true, the windows.Window object will have a tabs property that contains a list of the tabs.Tab objects. The Tab objects only contain the url, title and favIconUrl properties if the extension's manifest file includes the "tabs" permission.
         */
        populate?: boolean;
        /**
         * If set, the windows.Window returned will be filtered based on its type. If unset the default filter is set to ['app', 'normal', 'panel', 'popup'], with 'app' and 'panel' window types limited to the extension's own windows.
         * Each one of: "normal", "popup", "panel", "app", or "devtools"
         */
        windowTypes?: string[];
    }

    export interface CreateData {
        /**
         * Optional. The id of the tab for which you want to adopt to the new window.
         */
        tabId?: number;
        /**
         * Optional.
         * A URL or array of URLs to open as tabs in the window. Fully-qualified URLs must include a scheme (i.e. 'http://www.google.com', not 'www.google.com'). Relative URLs will be relative to the current page within the extension. Defaults to the New Tab Page.
         */
        url?: string | string[];
        /**
         * Optional.
         * The number of pixels to position the new window from the top edge of the screen. If not specified, the new window is offset naturally from the last focused window. This value is ignored for panels.
         */
        top?: number;
        /**
         * Optional.
         * The height in pixels of the new window, including the frame. If not specified defaults to a natural height.
         */
        height?: number;
        /**
         * Optional.
         * The width in pixels of the new window, including the frame. If not specified defaults to a natural width.
         */
        width?: number;
        /**
         * Optional. If true, opens an active window. If false, opens an inactive window.
         */
        focused?: boolean;
        /** Optional. Whether the new window should be an incognito window. */
        incognito?: boolean;
        /**
         * Optional. Specifies what type of browser window to create. The 'panel' and 'detached_panel' types create a popup unless the '--enable-panels' flag is set.
         * One of: "normal", "popup", "panel", or "detached_panel"
         */
        type?: string;
        /**
         * Optional.
         * The number of pixels to position the new window from the left edge of the screen. If not specified, the new window is offset naturally from the last focused window. This value is ignored for panels.
         */
        left?: number;
        /**
         * Optional. The initial state of the window. The 'minimized', 'maximized' and 'fullscreen' states cannot be combined with 'left', 'top', 'width' or 'height'.
         * One of: "normal", "minimized", "maximized", "fullscreen", or "docked"
         */
        state?: string;
    }

    export interface UpdateInfo {
        /** Optional. The offset from the top edge of the screen to move the window to in pixels. This value is ignored for panels. */
        top?: number;
        /**
         * Optional. If true, causes the window to be displayed in a manner that draws the user's attention to the window, without changing the focused window. The effect lasts until the user changes focus to the window. This option has no effect if the window already has focus. Set to false to cancel a previous draw attention request.
         */
        drawAttention?: boolean;
        /** Optional. The height to resize the window to in pixels. This value is ignored for panels. */
        height?: number;
        /** Optional. The width to resize the window to in pixels. This value is ignored for panels. */
        width?: number;
        /**
         * Optional. The new state of the window. The 'minimized', 'maximized' and 'fullscreen' states cannot be combined with 'left', 'top', 'width' or 'height'.
         * One of: "normal", "minimized", "maximized", "fullscreen", or "docked"
         */
        state?: string;
        /**
         * Optional. If true, brings the window to the front. If false, brings the next window in the z-order to the front.
         */
        focused?: boolean;
        /** Optional. The offset from the left edge of the screen to move the window to in pixels. This value is ignored for panels. */
        left?: number;
    }

    export interface WindowEventFilter {
        /**
         * Conditions that the window's type being created must satisfy. By default it will satisfy ['app', 'normal', 'panel', 'popup'], with 'app' and 'panel' window types limited to the extension's own windows.
         * Each one of: "normal", "popup", "panel", "app", or "devtools"
         */
        windowTypes: string[];
    }

    export interface WindowIdEvent extends events.Event<(windowId: number, filters?: WindowEventFilter) => void> { }

    export interface WindowReferenceEvent extends events.Event<(window: Window, filters?: WindowEventFilter) => void> { }

    /**
     * The windowId value that represents the current window.
     */
    export var WINDOW_ID_CURRENT: number;
    /**
     * The windowId value that represents the absence of a browser browser window.
     */
    export var WINDOW_ID_NONE: number;

    /** Gets details about a window. */
    export function get(windowId: number, callback: (window: windows.Window) => void): void;
    /**
     * Gets details about a window.
     */
    export function get(windowId: number, getInfo: GetInfo, callback: (window: windows.Window) => void): void;
    /**
     * Gets the current window.
     */
    export function getCurrent(callback: (window: windows.Window) => void): void;
    /**
     * Gets the current window.
     */
    export function getCurrent(getInfo: GetInfo, callback: (window: windows.Window) => void): void;
    /**
     * Creates (opens) a new browser with any optional sizing, position or default URL provided.
     */
    export function create(): Promise<windows.Window>;
    /**
     * Creates (opens) a new browser with any optional sizing, position or default URL provided.
     */
    export function create(createData: CreateData): Promise<windows.Window>;
    /**
     * Gets all windows.
     */
    export function getAll(): Promise<windows.Window[]>;
    /**
     * Gets all windows.
     */
    export function getAll(getInfo: GetInfo, callback: (windows: windows.Window[]) => void): void;
    /** Updates the properties of a window. Specify only the properties that you want to change; unspecified properties will be left unchanged. */
    export function update(windowId: number, updateInfo: UpdateInfo): Promise<windows.Window>;
    /** Removes (closes) a window, and all the tabs inside it. */
    export function remove(windowId: number): Promise<void>;
    /**
     * Gets the window that was most recently focused — typically the window 'on top'.
     */
    export function getLastFocused(callback: (window: windows.Window) => void): void;
    /**
     * Gets the window that was most recently focused — typically the window 'on top'.
     */
    export function getLastFocused(getInfo: GetInfo, callback: (window: windows.Window) => void): void;

    /** Fired when a window is removed (closed). */
    export var onRemoved: WindowIdEvent;
    /** Fired when a window is created. */
    export var onCreated: WindowReferenceEvent;
    /**
     * Fired when the currently focused window changes. Will be windows.WINDOW_ID_NONE if all browser windows have lost focus.
     * Note: On some Linux window managers, WINDOW_ID_NONE will always be sent immediately preceding a switch from one browser window to another.
     */
    export var onFocusChanged: WindowIdEvent;
}

}