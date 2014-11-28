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
var Aria = require("../Aria");
var arrayUtils = require("../utils/Array");
var typeUtils = require("../utils/Type");


/**
 * Global class gathering information about current browser type and version A list of user agent string for mobile
 * phones could be find here: http://www.useragentstring.com/pages/Mobile%20Browserlist/
 */
module.exports = Aria.classDefinition({
    $classpath : 'aria.core.Browser',
    $singleton : true,
    $constructor : function () {
        var navigator = Aria.$global.navigator;
        var ua = navigator ? navigator.userAgent.toLowerCase() : "";

        /**
         * The user agent string.
         * @type String
         */
        this.ua = ua;

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
         * True if the browser is any version of Chrome or Safari.
         * @type Boolean
         */
        this.isWebkit = false;

        /**
         * True if the browser uses the Gecko engine.
         * @type Boolean
         */
        this.isGecko = false;

        /**
         * True if the browser is any version of Firefox.
         * @type Boolean
         */
        this.isFirefox = false;

        /**
         * Browser version.
         * @type String
         */
        this.version = "";

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

        /**
         * Browser name.
         * @type String
         */
        this.name = "";

        /**
         * MacOS or Windows
         * @type String
         */
        this.environment = "";

        /**
         * Major version.
         * @type Integer
         */
        this.majorVersion = "";

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
         * True if browser type is Phantomjs
         * @type Boolean
         */
        this.isPhantomJS = false;

        /**
         * True if browser type is S60
         * @type Boolean
         */
        this.isOtherBrowser = false;

        /**
         * OS running in Device
         * @type String
         */
        this.osName = "";

        /**
         * OS Version in Device
         * @type String
         */
        this.osVersion = "";

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

        // ---------------------------------------------------------------------

        this._init();
    },
    $prototype : {
        /**
         * Returns browser name and version - ease debugging
         */
        toString : function () {
            return this.name + " " + this.version;
        },
        /**
         * Internal initialization function - automatically called when the object is created
         * @private
         */
        _init : function () {
            this._determineBrowser();

            // -----------------------------------------------------------------

            // common group for webkit-based browsers
            this.isWebkit = this.isSafari || this.isChrome || this.isPhantomJS;

            if (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1) {
                this.isWindows = true;

                this.environment = "Windows";
            } else if (ua.indexOf("macintosh") != -1) {
                this.isMac = true;

                this.environment = "MacOS";
            }

            // -----------------------------------------------------------------

            this._determineVersion();
            if (this.ua) {
                this._checkMobileBrowsers();
            }
        },

        _determineBrowser: function() {
            var specifications = [
                {
                    mark: 'trident/7.0',
                    flags: ['IE', 'ModernIE'],
                    name: 'IE',
                    version: "11.0"
                },
                {
                    mark: 'opera',
                    flags: "opera",
                    name: "Opera"
                },
                {
                    mark: 'chrome',
                    flags: "Chrome",
                    name: "Chrome"
                },
                {
                    mark: 'phantomjs',
                    flags: "PhantomJS",
                    name: "PhantomJS"
                },
                {
                    mark: 'webkit',
                    flags: "Safari",
                    name: "Safari"
                }
            ];

            // FIXME Break out of the loop instead
            arrayUtils.forEach(specifications, function(spec) {
                if (this.ua.indexOf(spec.mark) > -1) {
                    // ---------------------------------------------------- name

                    var name = spec.name;
                    this.name = name;

                    // --------------------------------------------------- flags

                    var flags = spec.flags;
                    if (flags == null) {
                        flags = [name];
                    } else if (!typeUtils.isArray(flags)) {
                        flags = [flags];
                    }
                    arrayUtils.forEach(flags, function(flag) {
                        this[this.prefixWithIs(flag)] = true;
                    }, this);

                    // ---------------------------------------------------------

                    break;
                }
            }, this);

            // -----------------------------------------------------------------

            var ua = this.ua;

            if (ua.indexOf('msie') > -1) {
                this.isIE = true;
                this.isOldIE = true;
                this.name = "IE";

                if (/msie[\/\s]((?:\d+\.?)+)/.test(ua)) {
                    this.version = RegExp.$1;
                    var ieVersion = parseInt(this.version, 10);

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
            } else if (ua.indexOf('trident/7.0') > -1) {
                this.isIE = true;
                this.isModernIE = true;

                this.name = "IE";
                this.version = "11.0";
            } else if (ua.indexOf('opera') > -1) {
                this.isOpera = true;

                this.name = "Opera";
            } else if (ua.indexOf('chrome') > -1) {
                this.isChrome = true;

                this.name = "Chrome";
            } else if (ua.indexOf('phantomjs') > -1) {
                this.isPhantomJS = true;

                this.name = "PhantomJS";
            } else if (ua.indexOf('webkit') > -1) {
                this.isSafari = true;

                this.name = "Safari";
            } else {
                if (ua.indexOf('gecko') > -1) {
                    this.isGecko = true;
                }
                if (ua.indexOf('firefox') > -1) {
                    this.name = "Firefox";
                    this.isFirefox = true;
                }
            }
        },

        _determineVersion: function() {
            // ---------------------------------------------------- full version

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

            for (var index = 0, length = versions.length; index < length; index++) {
                var versionSpec = versions[index];

                if (this[this.prefixWithIs(versionSpec.flag)]) {
                    if (versionSpec.regexp.test(this.ua)) {
                        this.version = RegExp.$1;
                    }
                    break;
                }
            }

            // --------------------------------------------------- major version

            if (this.version) {
                if (/(\d+)\./.test(this.version)) {
                    this.majorVersion = parseInt(RegExp.$1, 10);
                }
            }
        },

        _checkMobileBrowsers: function() {
            var properties = [
                // To Match OS and its Version
                {
                    type: 'os',

                    // for getting OS and Version
                    processingMethod: function (patternSpec, patternMatch, index) {
                        // --------------------------------------------- os name

                        var osName = patternSpec.osName;
                        this.osName = osName;

                        // ------------------------------------------ os version

                        var osVersion = patternMatch[2] || "";

                        if (patternSpec.osVersionPostProcessing != null) {
                            osVersion = patternSpec.osVersionPostProcessing(osVersion);
                        }
                        osVersion = osVersion.replace(/\s*/g, "");

                        this.osVersion = osVersion;

                        // ------------------------------------------------ flag

                        var flag = patternSpec.flag;
                        if (flag == null) {
                            flag = osName;
                        }

                        this[this.prefixWithIs(flag)] = true;

                        // ---------------------------------------------- device

                        var device = patternSpec.device;

                        if (typeUtils.isString(device)) {
                            this[this.prefixWithIs(device)] = true;
                        } else if typeUtils.isFunction(device) {
                            device.apply(this, arguments)
                        }
                    },

                    patterns: [
                        {
                            pattern : /(android)[\/\s-]?([\w\.]+)*/i,

                            osName: "Android",
                            device: function() {
                                // since android version 3 specifically for tablet checking screen resolution make no sense
                                if (this.osVersion.match(/\d/) + "" == "3") {
                                    this.isTablet = true;
                                } else {
                                    this.isPhone = true;
                                }
                            }
                        },
                        {
                            pattern : /(ip[honead]+).*os\s*([\w]+)*\slike\smac/i,

                            osName: "IOS",
                            osVersionPostProcessing: function() {
                                this.osVersion = this.osVersion.replace(/\_/g, ".");
                            },

                            device: function(patternSpec, patternMatch, index) {
                                if (patternMatch[1] == "iPad") {
                                    this.isTablet = true;
                                } else {
                                    this.isPhone = true;
                                }
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
                    type: 'browser',

                    processingMethod: this.__setBrowser, // for getting Browser and Version
                    patterns: [
                        {
                            pattern : /(chrome|crios)\/((\d+)?[\w\.]+)/i
                        },
                        {
                            pattern : /(mobile\ssafari)\/((\d+)?[\w\.]+)/i
                        },
                        {
                            pattern : /(mobile)\/\w+\s(safari)\/([\w\.]+)/i
                        },
                        {
                            pattern : /(iemobile)[\/\s]?((\d+)?[\w\.]*)/i
                        },
                        {
                            pattern : /(safari)\/((\d+)?[\w\.]+)/i
                        },
                        {
                            pattern : /(series60.+(browserng))\/((\d+)?[\w\.]+)/i
                        },
                        {
                            pattern : /(firefox)\/([\w\.]+).+(fennec)\/\d+/i
                        },
                        {
                            pattern : /(opera\smobi)\/((\d+)?[\w\.-]+)/i
                        },
                        {
                            pattern : /(opera\smini)\/((\d+)?[\w\.-]+)/i
                        },
                        {
                            pattern : /(dolfin|Blazer|S40OviBrowser)\/((\d+)?[\w\.]+)/i
                        }
                    ]
                },
                // To Match Device Name
                {
                    type: 'device',

                    // for getting the device
                    processingMethod: function (patternSpec, patternMatch, index) {
                        this.deviceName = patternMatch[1] || "";
                    },

                    patterns: [
                        {
                            pattern : /\(((ipad|playbook));/i
                        }, {
                            pattern : /\(((ip[honed]+));/i
                        }, {
                            pattern : /(blackberry[\s-]?\w+)/i
                        }, {
                            pattern : /(hp)\s([\w\s]+\w)/i
                        }, {
                            pattern : /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i
                        }, {
                            pattern : /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i
                        }, {
                            pattern : /((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i
                        }, {
                            pattern : /sec-((sgh\w+))/i
                        }, {
                            pattern : /(maemo|nokia).*(\w|n900|lumia\s\d+)/i
                        }, {
                            pattern : /(lg)[e;\s\-\/]+(\w+)*/i
                        }, {
                            pattern : /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i
                        }
                    ]
                }
            ];

            // -----------------------------------------------------------------

            arrayUtils.forEach(properties, function(property) {
                var patterns = property.patterns;
                var method = property.processingMethod;

                // -------------------------------------------------------------

                for (var index = 0, length = patterns.length; index < length; index++) {
                    var patternSpec = patterns[index];

                    var patternMatch = patternSpec.pattern.exec(this.ua);
                    if (patternMatch) {
                        method.call(this, patternSpec, patternMatch, index);
                        break;
                    }
                };
            }, this);
        },
        /**
         * private function - To set the Browser Name and Version
         * @param {Array} Array of matched string for given pattern
         * @param {Integer} index of the matched pattern
         * @private
         */
        __setBrowser : function (patternSpec, patternMatch, index) {
            var browserName = ["Mobile Safari", "Chrome", "Other"];

            switch (index) {
                case 0 :
                    this.browserType = browserName[1];
                    this.browserVersion = patternMatch[2] || "";
                    this.isChrome = true;
                    break;
                case 1 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    if (this.isAndroid) {
                        this.isAndroidBrowser = true;
                    }
                    if (this.isBlackBerry) {
                        this.isBlackBerryBrowser = true;
                    }
                    break;
                case 2 :
                    this.browserType = browserName[0];
                    this.browserVersion = patternMatch[3] || "";
                    this.isSafariMobile = true;
                    break;
                case 3 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    if (patternMatch[0]
                            && (patternMatch[0].indexOf('XBLWP7') > -1 || patternMatch[0].indexOf('ZuneWP7') > -1)) {
                        this.DesktopView = true;

                    } else {
                        this.isMobileView = true;
                    }
                    this.isIEMobile = true;
                    break;
                case 4 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    this.isSafari = true;
                    break;
                case 5 :
                    this.browserType = patternMatch[2] || "";
                    this.browserVersion = patternMatch[3] || "";
                    this.isS60 = true;
                    break;
                case 6 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    this.isFF = true;
                    break;
                case 7 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    this.isFF = true;
                    break;
                case 8 :
                    this.browserType = patternMatch[1] || "";
                    this.browserVersion = patternMatch[2] || "";
                    this.isFF = true;
                    break;
                case 9 :
                    this.browserType = browserName[2];
                    this.browserVersion = patternMatch[2] || "";
                    this.isOtherBrowser = true;
                    break;
            }
        },

        // ------------------------------------------------------------- Helpers

        capitalize: function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        prefixWithIs: function(string) {
            return "is" + this.capitalize(string);
        }
    }
});
