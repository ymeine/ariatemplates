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
var Aria = require("../../Aria");
var ariaWidgetsControllersReportsControllerReport = require("./reports/ControllerReport");
var ariaUtilsType = require("../../utils/Type");
var ariaUtilsArray = require("../../utils/Array");
var ariaWidgetsWidgetsRes = require("../../$resources").file(__dirname, "../WidgetsRes");
var ariaWidgetsSettings = require("../environment/WidgetSettings");





/**
 * Iterates over the properties of the given object's properties and calls the provided callback with these properties information.
 *
 * <p>
 * The callback is called with the following parameters:
 * <ul>
 *   <li>the current property's key</li>
 *   <li>the current property's value</li>
 *   <li>the given object</li>
 * </ul>
 * </p>
 *
 * @param {Object} object The object to iterate over
 * @param {Function} callback The function to be called for each property with the described parameters
 * @param {Object} thisArg The value to use for <em>this</em> for the callback call
 *
 * @return {Object} the given object
 */
function forEachKey(object, callback, thisArg) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            callback.call(thisArg, key, object[key], object);
        }
    }

    return object;
}

/**
 * An enhanced version of the for each for sequences. Loops over the values of the sequence and calls the provided callback with the current iteration's information.
 *
 * <p>
 * The callback is called with the following parameters:
 * <ul>
 *   <li>the current iteration's value</li>
 *   <li>the current iteration's index</li>
 *   <li>the given sequence</li>
 *   <li>an object used to control the loop's flow. It contains a boolean property named <em>break</em>, which can be set to <em>false</em> in order to break out from the loop.</li>
 * </ul>
 * </p>
 *
 * @param {Object} sequence The sequence to iterate over
 * @param {Function} callback The function to be called for each property with the described parameters
 * @param {Object} thisArg The value to use for <em>this</em> for the callback call
 *
 * @return {Object} the given sequence
 */
function forEach(sequence, callback, thisArg) {
    var flow = {
        "break": false
    };

    for (var index = 0, length = sequence.length; index < length; index++) {
        callback.call(this, sequence[index], index, sequence, flow);
        if (flow["break"]) {
            break;
        }
    }

    return sequence;
}



/**
 * A configuration handler for default error messages.
 *
 * <p>
 * It has one important method that should be used externally: <em>getErrorMessage</em>. It will return the default message as specified by this configuration handler (and according to the given input). Other methods are facilities which handle common use cases, and are used by the default implementation of the class.
 * </p>
 *
 * @param {Object} methods The methods to be set on the instance object, used for specialization.
 */
function ErrorMessageGetter(methods) {
    forEachKey(methods, function(name, method) {
        this[name] = method;
    }, this);
}
ErrorMessageGetter.prototype = {};
/**
 * Returns the error message corresponding to the given name and for the specified widget.
 *
 * <p>
 * The context object carries the following data:
 * <code>
 * {
 *  errorMessageName // {String} The name of the error message to get
 *  widgetName // {String} The name of the widget for which to get the error message
 *  controller // The controller from which the configuration is looked up
 * }
 * </code>
 * </p>
 *
 * @param context A context object carrying data that can be useful for the implementation
 *
 * @return {String} The error message if any was found, a void value otherwise.
 */
ErrorMessageGetter.prototype.getErrorMessage = function (context) {
    var errorMessage;

    var defaultErrorMessages = this.getWidgetErrorMessages(context);
    if (defaultErrorMessages != null) {
        errorMessage = defaultErrorMessages[context.errorMessageName];
    }

    return errorMessage;
};
/**
 * Returns all the error messages for the specified widget.
 *
 * <p>
 * The context object is the same as defined for method <em>getErrorMessage</em>.
 * </p>
 *
 * @param context A context object carrying data that can be useful for the implementation
 *
 * @return {Object} The error messages if found, a void value otherwise.
 */
ErrorMessageGetter.prototype.getWidgetErrorMessages = function (context) {
    var allErrorMessages = this.getAllErrorMessages(context);
    return allErrorMessages[context.widgetName];
};
/**
 * Is expected to return the map of error messages per widget.
 *
 * <p>
 * If no other method is overridden, this one must be implemented, since default implementation of the class uses it.
 * </p>
 * <p>
 * The context object is the same as defined for method <em>getErrorMessage</em>.
 * </p>
 *
 * @param context A context object carrying data that can be useful for the implementation
 *
 * @return {Object} A map of error messages per widget.
 */
ErrorMessageGetter.prototype.getAllErrorMessages = function (context) {};





// error messages configurations specifications --------------------------------

/* BACKWARD-COMPATIBILITY-BEGIN (GitHub #1428) */
var newKeysToOldKeysMap  = {
    "NumberField" : {
        "validation" : "40006"
    },
    "TimeField" : {
        "validation" : "40007"
    },
    "DateField" : {
        "validation" : "40008",
        "minValue" : "40018",
        "maxValue" : "40019"
    },
    "AutoComplete" : {
        "validation" : "40020"
    }
};

forEachKey(newKeysToOldKeysMap, function(widget, messages) {
    forEachKey(messages, function(message, code, messages) {
        var key = [code, "widget", widget, message].join("_").toUpperCase();
        messages[message] = key;
    });
});
/* BACKWARD-COMPATIBILITY-END (GitHub #1428) */

var defaultErrorMessagesConfigurations = [
    // widget internal configuration -------------------------------------------
    {
        getWidgetErrorMessages : function (context) {
            return context.controller._defaultErrorMessages;
        }
    },
    // widgets global configuration --------------------------------------------
    {
        getAllErrorMessages : function () {
            var widgetsSettings = ariaWidgetsSettings.getWidgetSettings();

            return widgetsSettings["defaultErrorMessages"];
        }
    },
    // hardcoded defaults ------------------------------------------------------
    {
        getAllErrorMessages : function (context) {
            return context.controller.res.errors;
        }
        /* BACKWARD-COMPATIBILITY-BEGIN (GitHub #1428) */
        ,
        getErrorMessage : function (context) {
            var map = newKeysToOldKeysMap;
            var store = context.controller.res.errors;
            var actualKey = map[context.widgetName][context.errorMessageName];

            var value = store[actualKey];

            return value;
        }
        /* BACKWARD-COMPATIBILITY-END (GitHub #1428) */
    }
];

forEach(defaultErrorMessagesConfigurations, function(spec, index, configurations) {
    configurations[index] = new ErrorMessageGetter(spec);
});





/**
 * Base class for any data controller associated to Text Input objects
 */
module.exports = Aria.classDefinition({
    $classpath : "aria.widgets.controllers.TextDataController",
    $resources : {
        res : ariaWidgetsWidgetsRes
    },
    $events : {
        "onCheck" : {
            description : "Notifies that controller has finished an asynchronous check (internal, of the value or of a keystroke)",
            properties : {
                report : "{aria.widgets.controllers.reports.ControllerReport} a check report"
            }
        }
    },
    $constructor : function () {
        /**
         * Data model associated to this controller
         * @type Object
         */
        this._dataModel = {
            value : null,
            displayText : ''
        };

        this.setDefaultErrorMessages();

        /* BACKWARD-COMPATIBILITY-BEGIN (GitHub #1428) */
        this._newKeysToOldKeysMap = newKeysToOldKeysMap
        /* BACKWARD-COMPATIBILITY-END (GitHub #1428) */
    },
    $prototype : {

        /**
         * Verify a given keyStroke
         * @param {Integer} charCode
         * @param {Integer} keyCode
         * @param {String} currentValue
         * @param {Integer} caretPos
         * @return {aria.widgets.controllers.reports.ControllerReport}
         */
        checkKeyStroke : function (charCode, keyCode, currentValue, caretPos) {
            return new ariaWidgetsControllersReportsControllerReport();
        },

        /**
         * Verify a given value
         * @param {String} text - the displayed text
         * @return {aria.widgets.controllers.reports.ControllerReport}
         */
        checkText : function (text) {
            var report = new ariaWidgetsControllersReportsControllerReport();
            if (ariaUtilsType.isString(text) || ariaUtilsType.isNumber(text)) {
                // allow values that can be easily displayed in the textfield
                report.value = text;
                report.ok = true;
            } else {
                report.ok = false;
            }
            return report;
        },

        /**
         * Verify an internal value (the same kind of value contained in this._dataModel.value)
         * @param {MultiTypes} internalValue
         * @return {aria.widgets.controllers.reports.ControllerReport}
         */
        checkValue : function (internalValue) {
            // consider null as empty string
            if (internalValue == null) {
                internalValue = '';
            }
            // internal value is the same as displayed value
            var report = this.checkText(internalValue);
            report.text = report.value;
            return report;
        },

        /**
         * Return the data model associated to this controller
         * @return {Object}
         */
        getDataModel : function () {
            return this._dataModel;
        },

        /**
         * Sets the default error messages map to the given value.
         *
         * <p>
         * The input value type is specified in bean <em>aria.widgets.CfgBeans</em> for the widgets supporting it.
         * </p>
         *
         * <p>
         * If the given value is <em>null</em>, an empty object is set, meaning no default messages.
         * </p>
         *
         * @param {Object} defaultErrorMessages The map of error messages to set for the controller.
         *
         * @return {Object} The final default error messages (as given or further processed ones).
         */
        setDefaultErrorMessages : function (defaultErrorMessages) {
            if (defaultErrorMessages == null) {
                defaultErrorMessages = {};
            }

            this._defaultErrorMessages = defaultErrorMessages;

            return defaultErrorMessages;
        },

        /**
         * Deduce the value that will be generated if the char is typed at the specified caret postion
         * @param {Integer} charCode the unicode character code that has been typed
         * @param {String} curVal the current text field value
         * @param {Integer} caretPosStart the start of the caret (cursor) position in the text field
         * @param {Integer} caretPosEnd the end of the caret (cursor) position in the text field (can be a selection)
         * @return {Object} the next field value along with the next caret positions
         */
        _getTypedValue : function (charCode, curVal, caretPosStart, caretPosEnd) {
            var returnedObject;
            if (charCode === 0) {
                returnedObject = {
                    nextValue : curVal,
                    caretPosStart : caretPosStart,
                    caretPosEnd : caretPosEnd
                };
                return returnedObject;
            }
            var str = String.fromCharCode(charCode);
            if (str === '') {
                returnedObject = {
                    nextValue : curVal,
                    caretPosStart : caretPosStart,
                    caretPosEnd : caretPosEnd
                };
                return returnedObject;
            }
            if (curVal == null || curVal === '') {
                returnedObject = {
                    nextValue : str,
                    caretPosStart : str.length,
                    caretPosEnd : str.length
                };
                return returnedObject;
            }

            var sz = curVal.length;
            if (caretPosStart >= sz) {
                returnedObject = {
                    nextValue : curVal + str,
                    caretPosStart : caretPosStart + str.length,
                    caretPosEnd : caretPosStart + str.length
                };
                return returnedObject;
            } else {
                var s1 = curVal.slice(0, caretPosStart);
                var s2 = curVal.slice(caretPosEnd, sz);
                returnedObject = {
                    nextValue : s1 + str + s2,
                    caretPosStart : caretPosStart + str.length,
                    caretPosEnd : caretPosStart + str.length
                };
                return returnedObject;
            }
        },

        /**
         * Deduce the value that will be generated if the delete or backspace keys are typed
         * @param {Integer} keyCode the key code (DEL or BACKSPACE)
         * @param {String} curVal the current text field value
         * @param {Integer} caretPosStart the start of the caret (cursor) position in the text field
         * @param {Integer} caretPosEnd the end of the caret (cursor) position in the text field (can be a selection)
         * @return {Object} the next field value along with the next caret positions
         */
        _getTypedValueOnDelete : function (keyCode, curVal, caretPosStart, caretPosEnd) {
            var returnedObject = {};
            if (curVal == null || curVal === '') {
                returnedObject = {
                    nextValue : '',
                    caretPosStart : 0,
                    caretPosEnd : 0
                };
                return returnedObject;
            }
            var sz = curVal.length;
            if (caretPosStart >= sz) {
                caretPosStart = sz;
            }
            var s1 = '', s2 = '';
            // backspace and del behave the same when there is a selection
            if (caretPosStart != caretPosEnd) {
                keyCode = aria.DomEvent.KC_DELETE;
            }
            if (keyCode == aria.DomEvent.KC_DELETE) {
                // delete key
                if (caretPosStart != caretPosEnd) {
                    s1 = curVal.slice(0, caretPosStart);
                    s2 = curVal.slice(caretPosEnd, sz);
                } else {
                    // caretPosStart==caretPosEnd
                    s1 = curVal.slice(0, caretPosStart);
                    if (caretPosStart == sz) {
                        s2 = '';
                    } else {
                        s2 = curVal.slice(caretPosStart + 1, sz);
                    }
                }
                returnedObject.caretPosStart = caretPosStart;
                returnedObject.caretPosEnd = caretPosStart;
            } else {
                // backspace key
                if (caretPosStart < 1) {
                    s1 = '';
                    returnedObject.caretPosStart = caretPosStart;
                    returnedObject.caretPosEnd = caretPosStart;
                } else {
                    s1 = curVal.slice(0, caretPosStart - 1);
                    returnedObject.caretPosStart = caretPosStart - 1;
                    returnedObject.caretPosEnd = caretPosStart - 1;
                }
                s2 = curVal.slice(caretPosEnd, sz);
            }
            returnedObject.nextValue = s1 + s2;
            return returnedObject;
        },

        /**
         * Raise a onCheck event with the given report
         * @protected
         * @param {aria.widgets.controllers.reports.ControllerReport} report
         */
        _raiseReport : function (report, arg) {
            this.$raiseEvent({
                name : "onCheck",
                report : report,
                arg : arg
            });
        },

        /**
         * Retrieves the requested error message from different sets of configuration ordered by precedence.
         *
         * <p>
         * An error message value is requested from this error message name.
         * </p>
         *
         * <p>
         * There can be three levels of configuration for the error messages of a widget, enumerated here by order of precedence:
         * <ol>
         *  <li>local: in the configuration of the widget's instance</li>
         *  <li>global: in the application's environment configuration</li>
         *  <li>hardcoded: in internal resources; it is used as a fallback</li>
         * </ol>
         * </p>
         *
         * <p>
         * As soon as a configuration contains a non-void value for the requested error message, this one is used for the return value.
         * </p>
         *
         * <p>
         * Note that since there are hardcoded values, there will always be an error message for a valid message name. However, if the message name is not supported, an <em>unefined</em> value is returned in the end.
         * </p>
         *
         * @param {String} errorMessageName The name of the error message to retrieve (it is the key to the requested message in the collection).
         *
         * @return {String} The retrieved error message if any, <em>undefined</em> if the message name is not supported.
         */
        getErrorMessage : function (errorMessageName) {
            // ----------------------------------------------- early termination

            if (errorMessageName == null) {
                return "";
            }

            // ------------------------------------------------------ processing

            var configurations = defaultErrorMessagesConfigurations;
            var widgetName = this._widgetName;

            var context = {
                widgetName: widgetName,
                errorMessageName: errorMessageName,
                controller: this
            };

            var errorMessage;
            forEach(configurations, function(configuration, index, configurations, flow) {
                errorMessage = configuration.getErrorMessage(context);
                if (errorMessage != null) {
                    flow["break"] = true;
                }
            }, this);

            // ---------------------------------------------------------- return

            return errorMessage;
        }
    }
});
