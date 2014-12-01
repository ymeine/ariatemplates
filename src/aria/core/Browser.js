/*
 * Copyright 2012 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



// --------------------------------------------------------------------- imports

var Aria = require("../Aria");
var arrayUtils = require("../utils/Array");
var typeUtils = require("../utils/Type");



// -------------------------------------------------------- additional utilities

function stringIncludes(string, pattern) {
    return string.indexOf(pattern) > -1;
}

function stringIncludesOne(string) {
    var patterns = arguments.slice(1);

    var match = false;

    forEach(patterns, function(pattern) {
        if (stringIncludes(string, pattern)) {
            match = true;
            return true; // break
        }
    });

    return match;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function ensureArray(value) {
    if (!typeUtils.isArray(value)) {
        value = [value];
    }

    return value;
}

function forEach(sequence, callback, thisArg) {
    for (var index = 0, length = sequence.length; index < length; index++) {
        if (callback.call(thisArg, sequence[index], index, sequence)) {
            break;
        }
    }
}

// ------------------------------------------------ aria.core.Browser definition

/**
 * Global class gathering information about current browser type and version A list of user agent string for mobile
 * phones could be find here: http://www.useragentstring.com/pages/Mobile%20Browserlist/
 */
module.exports = Aria.classDefinition({
    $classpath : 'aria.core.Browser',
    $singleton : true,
    $constructor : function () {
        // ----------------------------------------------- attributes definition

        // user agent ----------------------------------------------------------

        var navigator = Aria.$global.navigator;
        var ua = navigator ? navigator.userAgent.toLowerCase() : "";

        /**
         * The user agent string.
         * @type String
         */
        this.ua = ua;

        // browsers ------------------------------------------------------------

        /**
         * True if the browser is any version of Internet Explorer.
         * @type Boolean
         */
        this.isIE = false;

        /**
         * True if the browser is Internet Explorer 6.
         * @type Boolean
         */
        this.isIE6 = false;

        /**
         * True if the browser is Internet Explorer 7.
         * @type Boolean
         */
        this.isIE7 = false;

        /**
         * True if the browser is Internet Explorer 8.
         * @type Boolean
         */
        this.isIE8 = false;

        /**
         * True if the browser is Internet Explorer 9.
         * @type Boolean
         */
        this.isIE9 = false;

        /**
         * True if the browser is Internet Explorer 10.
         * @type Boolean
         */
        this.isIE10 = false;

        /**
         * True if the browser is Internet Explorer 10 or less.
         * @type Boolean
         */
        this.isOldIE = false;

        /**
         * True if the browser is Internet Explorer 11.
         * @type Boolean
         */
        this.isModernIE = false;

        /**
         * True if the browser is any version of Opera.
         * @type Boolean
         */
        this.isOpera = false;

        /**
         * True if the browser is any version of Chrome.
         * @type Boolean
         */
        this.isChrome = false;

        /**
         * True if the browser is any version of Safari.
         * @type Boolean
         */
        this.isSafari = false;

        /**
         * True if the browser is any version of Firefox.
         * @type Boolean
         */
        this.isFirefox = false;

        // rendering engines ---------------------------------------------------

        /**
         * True if the browser is any version of Chrome or Safari.
         * @type Boolean
         */
        this.isWebkit = false;

        /**
         * True if the browser uses the Gecko engine.
         * @type Boolean
         */
        this.isGecko = false;

        // browser version -----------------------------------------------------

        /**
         * Browser version.
         * @type String
         */
        this.version = "";

        /**
         * Major version.
         * @type Integer
         */
        this.majorVersion = "";

        // browser name --------------------------------------------------------

        /**
         * Browser name.
         * @type String
         */
        this.name = "";

        // OS ------------------------------------------------------------------

        /**
         * True if the operating systems is Windows.
         * @type Boolean
         */
        this.isWindows = false;

        /**
         * True if the operating systems is Mac.
         * @type Boolean
         */
        this.isMac = false;

        // OS name -------------------------------------------------------------

        /**
         * MacOS or Windows
         * @type String
         */
        this.environment = "";

        // mobile device -------------------------------------------------------

        // For Mobile Browsers
        /**
         * True if the device is of type phone
         * @type Boolean
         */
        this.isPhone = false;

        /**
         * True if the device is of type tablet
         * @type Boolean
         */
        this.isTablet = false;

        // mobile device OS ----------------------------------------------------

        /**
         * True if OS is iOS
         * @type Boolean
         */
        this.isIOS = false;

        /**
         * True if OS is Android
         * @type Boolean
         */
        this.isAndroid = false;

        /**
         * True if OS is Windows
         * @type Boolean
         */
        this.isWindowsPhone = false;

        /**
         * True if OS is BlackBerry
         * @type Boolean
         */
        this.isBlackBerry = false;

        /**
         * True if OS is Symbian
         * @type Boolean
         */
        this.isSymbian = false;

        /**
         * True if OS is some mobile OS
         * @type Boolean
         */
        this.isOtherMobile = false;

        // mobile device OS name -----------------------------------------------
        /**
         * OS running in Device
         * @type String
         */
        this.osName = "";

        // mobile device OS version --------------------------------------------

        /**
         * OS Version in Device
         * @type String
         */
        this.osVersion = "";

        // mobile device properties --------------------------------------------

        // Only for Window Phone with IE+9
        /**
         * True if view type if Mobile
         * @type Boolean
         */
        this.isMobileView = false;

        /**
         * True if view type if Desktop
         * @type Boolean
         */
        this.DesktopView = false;

        // Check for browser Type

        // mobile device browser -----------------------------------------------

        /**
         * True if browser is of type FF http://hacks.mozilla.org/2010/09/final-user-agent-string-for-firefox-4/
         * @type Boolean
         */
        this.isFF = false;

        /**
         * True if browser type is blackberry
         * @type Boolean
         */
        this.isBlackBerryBrowser = false;

        /**
         * True if browser type is Android
         * @type Boolean
         */
        this.isAndroidBrowser = false;

        /**
         * True if browser type is Safari Mobile
         * @type Boolean
         */
        this.isSafariMobile = false;

        /**
         * True if browser type is IE Mobile
         * @type Boolean
         */
        this.isIEMobile = false;

        /**
         * True if browser type is Opera Mobile
         * @type Boolean
         */
        this.isOperaMobile = false;

        /**
         * True if browser type is Opera Mini
         * @type Boolean
         */
        this.isOperaMini = false;

        /**
         * True if browser type is S60
         * @type Boolean
         */
        this.isS60 = false;

        /**
         * Browser Name
         * @type String
         */
        this.browserType = "";

        /**
         * Browser Version
         * @type String
         */
        this.browserVersion = "";

        /**
         * Device Name
         * @type String
         */
        this.deviceName = "";

        // other browser -------------------------------------------------------

        /**
         * True if browser type is Phantomjs
         * @type Boolean
         */
        this.isPhantomJS = false;

        /**
         * True if browser type is S60
         * @type Boolean
         */
        this.isOtherBrowser = false;

        // ------------------------------------------------------ initialization

        this._init();
    },
    $prototype : {

        ////////////////////////////////////////////////////////////////////////
        // Public interface
        ////////////////////////////////////////////////////////////////////////

        /**
         * Returns browser name and version - ease debugging
         */
        toString : function () {
            return this.name + " " + this.version;
        },



        ////////////////////////////////////////////////////////////////////////
        // Initialization / properties computation
        ////////////////////////////////////////////////////////////////////////

        /**
         * Internal initialization function - called when the object is created.
         * @private
         */
        _init : function () {
            // ------------------------------------------------------- unpacking

            var ua = this.ua;

            // ----------------------------------- automated processing (part 1)

            this._determineBrowser();
            this._determineEnvironment();
            this._determineBrowserVersion();
            if (ua) {
                this._checkMobileBrowsers();
            }
        },

        _determineBrowser: function() {
            // ------------------------------------------------------- unpacking

            var ua = this.ua;

            // -------------------------------------------------- implementation

            // specifications --------------------------------------------------

            // Order is important!!
            // Items description:
            // {
                // mark --------------------------------------------------------
                // Mandatory.
                // The string to look for inside the user agent string to consider this set of rules.
                // Example: "opera".

                // The below is applied if the mark has been found

                // flags -------------------------------------------------------
                // Inferred from the specified name if omitted.
                // Series of boolean properties of the instance to set to "true".
                // Can be specified as an array of flags or a single one.
                // Example: "opera" for "this.isOpera = true".

                // name --------------------------------------------------------
                // Mandatory.
                // The name of the browser (case-sensitive).
                // Example: "Opera" for "this.name = 'Opera'"

                // version -----------------------------------------------------
                // Optional.
                // A version to set.
                // Example: "11.0" for "this.version = '11.0'"

                // postProcessing ----------------------------------------------
                // Optional.
                // A custom function to be able to set, correct, override any property.
            // }

            var specifications = [
                {
                    mark: 'msie',
                    flags: ['IE', 'OldIE'],
                    name: "IE",
                    postProcessing: function() {
                        var version = RegExp.$1;

                        this.version = version;

                        var ieVersion = parseInt(version, 10);

                        if (ieVersion == 6) {
                            this.isIE6 = true;
                        } else if (ieVersion >= 7) {
                            // PTR 05207453
                            // With compatibility view, it can become tricky to
                            // detect the version.
                            // What is important to detect here is the document mode
                            // (which defines how the browser really
                            // reacts), NOT the browser mode (how the browser says
                            // it reacts, through conditional comments
                            // and ua string).
                            //
                            // In IE7 document.documentMode is undefined. For IE8+
                            // (also in document modes emulating IE7) it is defined
                            // and readonly.

                            var document = Aria.$frameworkWindow.document;
                            var detectedIEVersion = document.documentMode || 7;
                            this["isIE" + detectedIEVersion] = true;
                            if (detectedIEVersion != ieVersion) {
                                // the browser is not what it claims to be!
                                // make sure this.version is consistent with isIE...
                                // variables
                                this.version = detectedIEVersion + ".0";
                            }
                        }
                    }
                },
                {
                    mark: 'trident/7.0',
                    flags: ['IE', 'ModernIE'],
                    name: 'IE',
                    version: "11.0"
                },
                {
                    mark: 'opera',
                    name: "Opera"
                },
                {
                    mark: 'chrome',
                    name: "Chrome"
                },
                {
                    mark: 'phantomjs',
                    name: "PhantomJS"
                },
                {
                    mark: 'webkit',
                    name: "Safari"
                }
            ];

            // processing ------------------------------------------------------

            var foundOne = false;
            forEach(specifications, function(spec) {
                // ------------------------------------------------------- match

                var mark = spec.mark;

                if (stringIncludes(ua, mark)) {
                    // ---------------------------------------------------- name

                    var name = spec.name;

                    this.name = name;

                    // --------------------------------------------------- flags

                    var flags = spec.flags;

                    if (flags == null) {
                        flags = [name];
                    }

                    flags = ensureArray(flags);

                    this.setFlags(flags);

                    // ------------------------------------------------- version

                    var version = spec.version;

                    if (version != null) {
                        this.version = version;
                    }

                    // ---------------------------------- custom post processing

                    var postProcessing = spec.postProcessing;

                    if (postProcessing != null) {
                        postProcessing.call(this);
                    }

                    // ---------------------------------------------------------

                    foundOne = true;
                    return true; // break
                }
            }, this);

            // fallback --------------------------------------------------------

            if (!foundOne) {
                if (stringIncludes(ua, 'gecko')) {
                    this.isGecko = true;
                }
                if (stringIncludes(ua, 'firefox')) {
                    this.name = "Firefox";
                    this.isFirefox = true;
                }
            }

            // ------------------------------------------- properties inferences

            // common group for webkit-based browsers
            this.isWebkit = this.isSafari || this.isChrome || this.isPhantomJS;
        },

        _determineEnvironment : function() {
            // ------------------------------------------------------- unpacking

            var ua = this.ua;

            // ------------------------------------------------------ processing

            // specifications --------------------------------------------------

            var specifications = [
                {
                    marks: ["windows", "win32"],

                    environment: "Windows"
                },
                {
                    marks: "macintosh",

                    flag: "mac",
                    environment: "MacOS"
                }
            ];

            // processing ------------------------------------------------------

            forEach(specifications, function(spec) {
                // ------------------------------------------------------- match

                var marks = spec.marks;

                marks = ensureArray(marks);

                if (stringIncludesOne(ua, marks)) {
                    // --------------------------------------------- environment

                    var environment = spec.environment;

                    this.environment = environment;

                    // ---------------------------------------------------- flag

                    var flag = spec.flag;

                    if (flag == null) {
                        flag = environment;
                    }

                    this.setFlag(flag);

                    // ---------------------------------------------------------

                    return true; // break
                }
            }, this);
        },

        _determineBrowserVersion: function() {
            // ------------------------------------------------------- unpacking

            var ua = this.ua;

            // ---------------------------------------------------- full version

            // specifications --------------------------------------------------

            var versions = [
                // already determined for IE
                {
                    flag: 'firefox',
                    regexp: /firefox[\/\s]((?:\d+\.?)+)/
                },
                {
                    flag: 'safari',
                    regexp: /version[\/\s]((?:\d+\.?)+)/
                },
                {
                    flag: 'chrome',
                    regexp: /chrome[\/\s]((?:\d+\.?)+)/
                },
                {
                    flag: 'phantomJS',
                    regexp: /phantomjs[\/\s]((?:\d+\.?)+)/
                },
                {
                    flag: 'opera',
                    regexp: /version[\/\s]((?:\d+\.?)+)/
                }
            ];

            // processing ------------------------------------------------------

            var version;

            forEach(versions, function(versionSpec) {
                var flag = versionSpec.flag;

                if (this.getFlag(flag)) {
                    if (versionSpec.regexp.test(ua)) {
                        version = RegExp.$1;

                        this.version = version;
                    }

                    return true; // break
                }
            }, this);

            // --------------------------------------------------- major version

            if (version) {
                if (/(\d+)\./.test(version)) {
                    this.majorVersion = parseInt(RegExp.$1, 10);
                }
            }
        },

        _checkMobileBrowsers: function() {
            // ------------------------------------------------------- unpacking

            var ua = this.ua;

            // ------------------------------------------------------ processing

            // specifications --------------------------------------------------

            var specifications = [

                // To Match OS and its Version
                {
                    // for getting OS and Version
                    processingMethod: this.__setMobileOS,

                    patterns: [
                        {
                            pattern : /(android)[\/\s-]?([\w\.]+)*/i,

                            osName: "Android",

                            device: function() {
                                // since android version 3 specifically for tablet checking screen resolution make no sense
                                var flag;
                                if (this.osVersion.match(/\d/) + "" == "3") {
                                    flag = "tablet";
                                } else {
                                    flag = "phone";
                                }

                                this.setFlag(flag);
                            }
                        },
                        {
                            pattern : /(ip[honead]+).*os\s*([\w]+)*\slike\smac/i,

                            osName: "IOS",
                            osVersionPostProcessing: function() {
                                this.osVersion = this.osVersion.replace(/\_/g, ".");
                            },

                            device: function(patternSpec, patternMatch, index) {
                                var flag;
                                if (patternMatch[1] == "iPad") {
                                    flag = "tablet";
                                } else {
                                    flag = "phone";
                                }

                                this.setFlag(flag);
                            }
                        },
                        {
                            pattern : /(blackberry).+version\/([\w\.]+)/i,

                            osName: "BlackBerry",
                            device: "phone"
                        },
                        {
                            pattern : /(rim\stablet+).*os\s*([\w\.]+)*/i,

                            osName: "BlackBerry Tablet OS",
                            flag: "BlackBerry",
                            device: "tablet"
                        },
                        {
                            pattern : /(windows\sphone\sos|windows\s?[mobile]*)[\s\/\;]?([ntwce\d\.\s]+\w)/i,

                            osName: "Windows",
                            flag: "WindowsPhone",
                            device: "phone"
                        },
                        {
                            pattern : /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i,

                            osName: "Symbian",
                            device: "phone"
                        },
                        {
                            pattern : /(webos|palm\sos|bada|rim\sos|meego)[\/\s-]?([\w\.]+)*/i,

                            osName: "Other",
                            flag: "OtherMobile",
                            device: "phone"
                        }
                    ]
                },

                // To Match Browser and its Version
                {
                    // for getting Browser and Version
                    processingMethod: this.__setMobileBrowser,

                    // browserType
                    // Optional. Default: 1.
                    // Used to set the property "browserType".
                    // If a string, applies it as is.
                    // If a number, tells which group to take from the pattern match to use as the value.

                    patterns: [
                        {
                            pattern : /(chrome|crios)\/((\d+)?[\w\.]+)/i,

                            flag: 'chrome',
                            browserType: "Chrome"
                        },
                        {
                            pattern : /(mobile\ssafari)\/((\d+)?[\w\.]+)/i,

                            flag: function(patternSpec, patternMatch, index) {
                                if (this.isAndroid) {
                                    this.isAndroidBrowser = true;
                                }
                                if (this.isBlackBerry) {
                                    this.isBlackBerryBrowser = true;
                                }
                            }
                        },
                        {
                            pattern : /(mobile)\/\w+\s(safari)\/([\w\.]+)/i,

                            flag: 'SafariMobile',
                            browserType: "Mobile Safari"
                        },
                        {
                            pattern : /(iemobile)[\/\s]?((\d+)?[\w\.]*)/i,

                            flag: 'IEMobile',
                            postProcessing: function(patternSpec, patternMatch, index) {
                                if (patternMatch[0] && (stringIncludes(patternMatch[0], 'XBLWP7') || stringIncludes(patternMatch[0], 'ZuneWP7'))) {
                                    this.DesktopView = true;
                                } else {
                                    this.isMobileView = true;
                                }
                            }
                        },
                        {
                            pattern : /(safari)\/((\d+)?[\w\.]+)/i,

                            flag: 'safari'
                        },
                        {
                            pattern : /(series60.+(browserng))\/((\d+)?[\w\.]+)/i,

                            flag: 'S60',
                            browserType: 2
                        },
                        {
                            pattern : /(firefox)\/([\w\.]+).+(fennec)\/\d+/i,

                            flag: 'FF'
                        },
                        {
                            pattern : /(opera\smobi)\/((\d+)?[\w\.-]+)/i,

                            flag: 'FF'
                        },
                        {
                            pattern : /(opera\smini)\/((\d+)?[\w\.-]+)/i,

                            flag: 'FF'
                        },
                        {
                            pattern : /(dolfin|Blazer|S40OviBrowser)\/((\d+)?[\w\.]+)/i,

                            flag: 'OtherBrowser',
                            browserType: "Other"
                        }
                    ]
                },

                // To Match Device Name
                {
                    // for getting the device
                    processingMethod: function (patternSpec, patternMatch, index) {
                        this.deviceName = patternMatch[1] || "";
                    },

                    patterns: [
                        /\(((ipad|playbook));/i,
                        /\(((ip[honed]+));/i,
                        /(blackberry[\s-]?\w+)/i,
                        /(hp)\s([\w\s]+\w)/i,
                        /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,
                        /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
                        /((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i,
                        /sec-((sgh\w+))/i,
                        /(maemo|nokia).*(\w|n900|lumia\s\d+)/i,
                        /(lg)[e;\s\-\/]+(\w+)*/i,
                        /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i
                    ]
                }
            ];

            // processing ------------------------------------------------------

            forEach(specifications, function(spec) {
                // --------------------------------------------------- unpacking

                var patterns = spec.patterns;
                var method = spec.processingMethod;

                // -------------------------------------------------- processing

                forEach(patterns, function(patternSpec, index) {
                    // --------------------------------------------- patternSpec

                    if (!typeUtils.isObject(patternSpec)) {
                        patternSpec = {pattern: patternSpec};
                    }

                    // ---------------------------------------------------------

                    var patternMatch = patternSpec.pattern.exec(ua);
                    if (patternMatch) {
                        method.call(this, patternSpec, patternMatch, index);
                        return true; // break
                    }
                }, this);
            }, this);
        },

        __setMobileOS: function (patternSpec, patternMatch) {
            // --------------------------------------------------------- os name

            var osName = patternSpec.osName;

            this.osName = osName;

            // ------------------------------------------------------ os version

            var osVersion = patternMatch[2] || "";

            if (patternSpec.osVersionPostProcessing != null) {
                osVersion = patternSpec.osVersionPostProcessing(osVersion);
            }
            osVersion = osVersion.replace(/\s*/g, "");

            this.osVersion = osVersion;

            // ------------------------------------------------------------ flag

            var flag = patternSpec.flag;

            if (flag == null) {
                flag = osName;
            }

            this.setFlag(flag);

            // ---------------------------------------------------------- device

            var device = patternSpec.device;

            if (typeUtils.isString(device)) {
                this.setFlag(device);
            } else if (typeUtils.isFunction(device)) {
                device.apply(this, arguments);
            }
        },

        /**
         * private function - To set the Browser Name and Version
         * @param patternMatch {Array} Array of matched string for given pattern
         * @private
         */
        __setMobileBrowser : function (patternSpec, patternMatch) {
            // ---------------------------------------------------- browser type

            var browserType = patternSpec.browserType;

            if (browserType == null) {
                browserType = 1;
            }

            if (typeUtils.isNumber(browserType)) {
                browserType = patternMatch[browserType] || "";
            }

            this.browserType = browserType;

            // ------------------------------------------------- browser version

            var browserVersion = patternSpec.browserVersion;

            if (browserVersion == null) {
                browserVersion = 2;
            }

            if (typeUtils.isNumber(browserVersion)) {
                browserVersion = patternMatch[browserVersion] || "";
            }

            this.browserVersion = browserVersion;

            // ------------------------------------------------------------ flag

            var flag = patternSpec.flag;

            if (typeUtils.isString(flag)) {
                this.setFlag(flag);
            } else {
                flag.apply(this, arguments);
            }

            // ------------------------------------------------- post processing

            var postProcessing = patternSpec.postProcessing;

            if (postProcessing != null) {
                postProcessing.apply(this, arguments);
            }
        },



        ////////////////////////////////////////////////////////////////////////
        // Helpers
        ////////////////////////////////////////////////////////////////////////

        getFlag: function(name) {
            return this[this.prefixWithIs(name)];
        },

        setFlag: function(name) {
            this[this.prefixWithIs(name)] = true;
        },

        setFlags: function(names) {
            forEach(names, this.setFlag, this);
        },

        prefixWithIs: function(string) {
            return "is" + capitalize(string);
        }
    }
});
