/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./TSX/jQueryUI Widgets/TimeCorrelatedSags.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../node_modules/free-style/dist/free-style.js":
/*!*****************************************************!*\
  !*** ../node_modules/free-style/dist/free-style.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The unique id is used for unique hashes.
 */
var uniqueId = 0;
/**
 * Tag styles with this string to get unique hashes.
 */
exports.IS_UNIQUE = '__DO_NOT_DEDUPE_STYLE__';
var upperCasePattern = /[A-Z]/g;
var msPattern = /^ms-/;
var interpolatePattern = /&/g;
var escapePattern = /[ !#$%&()*+,./;<=>?@[\]^`{|}~"'\\]/g;
var propLower = function (m) { return "-" + m.toLowerCase(); };
/**
 * CSS properties that are valid unit-less numbers.
 */
var cssNumberProperties = [
    'animation-iteration-count',
    'box-flex',
    'box-flex-group',
    'column-count',
    'counter-increment',
    'counter-reset',
    'flex',
    'flex-grow',
    'flex-positive',
    'flex-shrink',
    'flex-negative',
    'font-weight',
    'line-clamp',
    'line-height',
    'opacity',
    'order',
    'orphans',
    'tab-size',
    'widows',
    'z-index',
    'zoom',
    // SVG properties.
    'fill-opacity',
    'stroke-dashoffset',
    'stroke-opacity',
    'stroke-width'
];
/**
 * Map of css number properties.
 */
var CSS_NUMBER = Object.create(null);
// Add vendor prefixes to all unit-less properties.
for (var _i = 0, _a = ['-webkit-', '-ms-', '-moz-', '-o-', '']; _i < _a.length; _i++) {
    var prefix = _a[_i];
    for (var _b = 0, cssNumberProperties_1 = cssNumberProperties; _b < cssNumberProperties_1.length; _b++) {
        var property = cssNumberProperties_1[_b];
        CSS_NUMBER[prefix + property] = true;
    }
}
/**
 * Escape a CSS class name.
 */
exports.escape = function (str) { return str.replace(escapePattern, '\\$&'); };
/**
 * Transform a JavaScript property into a CSS property.
 */
function hyphenate(propertyName) {
    return propertyName
        .replace(upperCasePattern, propLower)
        .replace(msPattern, '-ms-'); // Internet Explorer vendor prefix.
}
exports.hyphenate = hyphenate;
/**
 * Generate a hash value from a string.
 */
function stringHash(str) {
    var value = 5381;
    var len = str.length;
    while (len--)
        value = (value * 33) ^ str.charCodeAt(len);
    return (value >>> 0).toString(36);
}
exports.stringHash = stringHash;
/**
 * Transform a style string to a CSS string.
 */
function styleToString(key, value) {
    if (typeof value === 'number' && value !== 0 && !CSS_NUMBER[key]) {
        return key + ":" + value + "px";
    }
    return key + ":" + value;
}
/**
 * Sort an array of tuples by first value.
 */
function sortTuples(value) {
    return value.sort(function (a, b) { return a[0] > b[0] ? 1 : -1; });
}
/**
 * Categorize user styles.
 */
function parseStyles(styles, hasNestedStyles) {
    var properties = [];
    var nestedStyles = [];
    var isUnique = false;
    // Sort keys before adding to styles.
    for (var _i = 0, _a = Object.keys(styles); _i < _a.length; _i++) {
        var key = _a[_i];
        var value = styles[key];
        if (value !== null && value !== undefined) {
            if (key === exports.IS_UNIQUE) {
                isUnique = true;
            }
            else if (typeof value === 'object' && !Array.isArray(value)) {
                nestedStyles.push([key.trim(), value]);
            }
            else {
                properties.push([hyphenate(key.trim()), value]);
            }
        }
    }
    return {
        styleString: stringifyProperties(sortTuples(properties)),
        nestedStyles: hasNestedStyles ? nestedStyles : sortTuples(nestedStyles),
        isUnique: isUnique
    };
}
/**
 * Stringify an array of property tuples.
 */
function stringifyProperties(properties) {
    return properties.map(function (_a) {
        var name = _a[0], value = _a[1];
        if (!Array.isArray(value))
            return styleToString(name, value);
        return value.map(function (x) { return styleToString(name, x); }).join(';');
    }).join(';');
}
/**
 * Interpolate CSS selectors.
 */
function interpolate(selector, parent) {
    if (selector.indexOf('&') > -1) {
        return selector.replace(interpolatePattern, parent);
    }
    return parent + " " + selector;
}
/**
 * Recursive loop building styles with deferred selectors.
 */
function stylize(cache, selector, styles, list, parent) {
    var _a = parseStyles(styles, !!selector), styleString = _a.styleString, nestedStyles = _a.nestedStyles, isUnique = _a.isUnique;
    var pid = styleString;
    if (selector.charCodeAt(0) === 64 /* @ */) {
        var rule = cache.add(new Rule(selector, parent ? undefined : styleString, cache.hash));
        // Nested styles support (e.g. `.foo > @media > .bar`).
        if (styleString && parent) {
            var style = rule.add(new Style(styleString, rule.hash, isUnique ? "u" + (++uniqueId).toString(36) : undefined));
            list.push([parent, style]);
        }
        for (var _i = 0, nestedStyles_1 = nestedStyles; _i < nestedStyles_1.length; _i++) {
            var _b = nestedStyles_1[_i], name = _b[0], value = _b[1];
            pid += name + stylize(rule, name, value, list, parent);
        }
    }
    else {
        var key = parent ? interpolate(selector, parent) : selector;
        if (styleString) {
            var style = cache.add(new Style(styleString, cache.hash, isUnique ? "u" + (++uniqueId).toString(36) : undefined));
            list.push([key, style]);
        }
        for (var _c = 0, nestedStyles_2 = nestedStyles; _c < nestedStyles_2.length; _c++) {
            var _d = nestedStyles_2[_c], name = _d[0], value = _d[1];
            pid += name + stylize(cache, name, value, list, key);
        }
    }
    return pid;
}
/**
 * Register all styles, but collect for selector interpolation using the hash.
 */
function composeStyles(container, selector, styles, isStyle, displayName) {
    var cache = new Cache(container.hash);
    var list = [];
    var pid = stylize(cache, selector, styles, list);
    var hash = "f" + cache.hash(pid);
    var id = displayName ? displayName + "_" + hash : hash;
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var _a = list_1[_i], selector_1 = _a[0], style = _a[1];
        var key = isStyle ? interpolate(selector_1, "." + exports.escape(id)) : selector_1;
        style.add(new Selector(key, style.hash, undefined, pid));
    }
    return { cache: cache, pid: pid, id: id };
}
/**
 * Cache to list to styles.
 */
function join(arr) {
    var res = '';
    for (var i = 0; i < arr.length; i++)
        res += arr[i];
    return res;
}
/**
 * Noop changes.
 */
var noopChanges = {
    add: function () { return undefined; },
    change: function () { return undefined; },
    remove: function () { return undefined; }
};
/**
 * Implement a cache/event emitter.
 */
var Cache = /** @class */ (function () {
    function Cache(hash, changes) {
        if (hash === void 0) { hash = stringHash; }
        if (changes === void 0) { changes = noopChanges; }
        this.hash = hash;
        this.changes = changes;
        this.sheet = [];
        this.changeId = 0;
        this._keys = [];
        this._children = Object.create(null);
        this._counters = Object.create(null);
    }
    Cache.prototype.add = function (style) {
        var count = this._counters[style.id] || 0;
        var item = this._children[style.id] || style.clone();
        this._counters[style.id] = count + 1;
        if (count === 0) {
            this._children[item.id] = item;
            this._keys.push(item.id);
            this.sheet.push(item.getStyles());
            this.changeId++;
            this.changes.add(item, this._keys.length - 1);
        }
        else {
            // Check if contents are different.
            if (item.getIdentifier() !== style.getIdentifier()) {
                throw new TypeError("Hash collision: " + style.getStyles() + " === " + item.getStyles());
            }
            var oldIndex = this._keys.indexOf(style.id);
            var newIndex = this._keys.length - 1;
            var prevChangeId = this.changeId;
            if (oldIndex !== newIndex) {
                this._keys.splice(oldIndex, 1);
                this._keys.push(style.id);
                this.changeId++;
            }
            if (item instanceof Cache && style instanceof Cache) {
                var prevChangeId_1 = item.changeId;
                item.merge(style);
                if (item.changeId !== prevChangeId_1) {
                    this.changeId++;
                }
            }
            if (this.changeId !== prevChangeId) {
                if (oldIndex === newIndex) {
                    this.sheet.splice(oldIndex, 1, item.getStyles());
                }
                else {
                    this.sheet.splice(oldIndex, 1);
                    this.sheet.splice(newIndex, 0, item.getStyles());
                }
                this.changes.change(item, oldIndex, newIndex);
            }
        }
        return item;
    };
    Cache.prototype.remove = function (style) {
        var count = this._counters[style.id];
        if (count > 0) {
            this._counters[style.id] = count - 1;
            var item = this._children[style.id];
            var index = this._keys.indexOf(item.id);
            if (count === 1) {
                delete this._counters[style.id];
                delete this._children[style.id];
                this._keys.splice(index, 1);
                this.sheet.splice(index, 1);
                this.changeId++;
                this.changes.remove(item, index);
            }
            else if (item instanceof Cache && style instanceof Cache) {
                var prevChangeId = item.changeId;
                item.unmerge(style);
                if (item.changeId !== prevChangeId) {
                    this.sheet.splice(index, 1, item.getStyles());
                    this.changeId++;
                    this.changes.change(item, index, index);
                }
            }
        }
    };
    Cache.prototype.merge = function (cache) {
        for (var _i = 0, _a = cache._keys; _i < _a.length; _i++) {
            var id = _a[_i];
            this.add(cache._children[id]);
        }
        return this;
    };
    Cache.prototype.unmerge = function (cache) {
        for (var _i = 0, _a = cache._keys; _i < _a.length; _i++) {
            var id = _a[_i];
            this.remove(cache._children[id]);
        }
        return this;
    };
    Cache.prototype.clone = function () {
        return new Cache(this.hash).merge(this);
    };
    return Cache;
}());
exports.Cache = Cache;
/**
 * Selector is a dumb class made to represent nested CSS selectors.
 */
var Selector = /** @class */ (function () {
    function Selector(selector, hash, id, pid) {
        if (id === void 0) { id = "s" + hash(selector); }
        if (pid === void 0) { pid = ''; }
        this.selector = selector;
        this.hash = hash;
        this.id = id;
        this.pid = pid;
    }
    Selector.prototype.getStyles = function () {
        return this.selector;
    };
    Selector.prototype.getIdentifier = function () {
        return this.pid + "." + this.selector;
    };
    Selector.prototype.clone = function () {
        return new Selector(this.selector, this.hash, this.id, this.pid);
    };
    return Selector;
}());
exports.Selector = Selector;
/**
 * The style container registers a style string with selectors.
 */
var Style = /** @class */ (function (_super) {
    __extends(Style, _super);
    function Style(style, hash, id) {
        if (id === void 0) { id = "c" + hash(style); }
        var _this = _super.call(this, hash) || this;
        _this.style = style;
        _this.hash = hash;
        _this.id = id;
        return _this;
    }
    Style.prototype.getStyles = function () {
        return this.sheet.join(',') + "{" + this.style + "}";
    };
    Style.prototype.getIdentifier = function () {
        return this.style;
    };
    Style.prototype.clone = function () {
        return new Style(this.style, this.hash, this.id).merge(this);
    };
    return Style;
}(Cache));
exports.Style = Style;
/**
 * Implement rule logic for style output.
 */
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule(rule, style, hash, id, pid) {
        if (style === void 0) { style = ''; }
        if (id === void 0) { id = "a" + hash(rule + "." + style); }
        if (pid === void 0) { pid = ''; }
        var _this = _super.call(this, hash) || this;
        _this.rule = rule;
        _this.style = style;
        _this.hash = hash;
        _this.id = id;
        _this.pid = pid;
        return _this;
    }
    Rule.prototype.getStyles = function () {
        return this.rule + "{" + this.style + join(this.sheet) + "}";
    };
    Rule.prototype.getIdentifier = function () {
        return this.pid + "." + this.rule + "." + this.style;
    };
    Rule.prototype.clone = function () {
        return new Rule(this.rule, this.style, this.hash, this.id, this.pid).merge(this);
    };
    return Rule;
}(Cache));
exports.Rule = Rule;
/**
 * The FreeStyle class implements the API for everything else.
 */
var FreeStyle = /** @class */ (function (_super) {
    __extends(FreeStyle, _super);
    function FreeStyle(hash, debug, id, changes) {
        if (hash === void 0) { hash = stringHash; }
        if (debug === void 0) { debug = typeof process !== 'undefined' && "development" !== 'production'; }
        if (id === void 0) { id = "f" + (++uniqueId).toString(36); }
        var _this = _super.call(this, hash, changes) || this;
        _this.hash = hash;
        _this.debug = debug;
        _this.id = id;
        return _this;
    }
    FreeStyle.prototype.registerStyle = function (styles, displayName) {
        var debugName = this.debug ? displayName : undefined;
        var _a = composeStyles(this, '&', styles, true, debugName), cache = _a.cache, id = _a.id;
        this.merge(cache);
        return id;
    };
    FreeStyle.prototype.registerKeyframes = function (keyframes, displayName) {
        return this.registerHashRule('@keyframes', keyframes, displayName);
    };
    FreeStyle.prototype.registerHashRule = function (prefix, styles, displayName) {
        var debugName = this.debug ? displayName : undefined;
        var _a = composeStyles(this, '', styles, false, debugName), cache = _a.cache, pid = _a.pid, id = _a.id;
        var rule = new Rule(prefix + " " + exports.escape(id), undefined, this.hash, undefined, pid);
        this.add(rule.merge(cache));
        return id;
    };
    FreeStyle.prototype.registerRule = function (rule, styles) {
        this.merge(composeStyles(this, rule, styles, false).cache);
    };
    FreeStyle.prototype.registerCss = function (styles) {
        this.merge(composeStyles(this, '', styles, false).cache);
    };
    FreeStyle.prototype.getStyles = function () {
        return join(this.sheet);
    };
    FreeStyle.prototype.getIdentifier = function () {
        return this.id;
    };
    FreeStyle.prototype.clone = function () {
        return new FreeStyle(this.hash, this.debug, this.id, this.changes).merge(this);
    };
    return FreeStyle;
}(Cache));
exports.FreeStyle = FreeStyle;
/**
 * Exports a simple function to create a new instance.
 */
function create(hash, debug, changes) {
    return new FreeStyle(hash, debug, undefined, changes);
}
exports.create = create;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "../node_modules/process/browser.js")))

/***/ }),

/***/ "../node_modules/process/browser.js":
/*!******************************************!*\
  !*** ../node_modules/process/browser.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "../node_modules/typestyle/lib.es2015/index.js":
/*!*****************************************************!*\
  !*** ../node_modules/typestyle/lib.es2015/index.js ***!
  \*****************************************************/
/*! exports provided: TypeStyle, types, extend, classes, media, setStylesTarget, cssRaw, cssRule, forceRenderStyles, fontFace, getStyles, keyframes, reinit, style, stylesheet, createTypeStyle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setStylesTarget", function() { return setStylesTarget; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cssRaw", function() { return cssRaw; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cssRule", function() { return cssRule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forceRenderStyles", function() { return forceRenderStyles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fontFace", function() { return fontFace; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getStyles", function() { return getStyles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keyframes", function() { return keyframes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reinit", function() { return reinit; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "style", function() { return style; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stylesheet", function() { return stylesheet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTypeStyle", function() { return createTypeStyle; });
/* harmony import */ var _internal_typestyle__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./internal/typestyle */ "../node_modules/typestyle/lib.es2015/internal/typestyle.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TypeStyle", function() { return _internal_typestyle__WEBPACK_IMPORTED_MODULE_0__["TypeStyle"]; });

/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types */ "../node_modules/typestyle/lib.es2015/types.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_types__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "types", function() { return _types__WEBPACK_IMPORTED_MODULE_1__; });
/* harmony import */ var _internal_utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./internal/utilities */ "../node_modules/typestyle/lib.es2015/internal/utilities.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return _internal_utilities__WEBPACK_IMPORTED_MODULE_2__["extend"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "classes", function() { return _internal_utilities__WEBPACK_IMPORTED_MODULE_2__["classes"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "media", function() { return _internal_utilities__WEBPACK_IMPORTED_MODULE_2__["media"]; });



/**
 * All the CSS types in the 'types' namespace
 */


/**
 * Export certain utilities
 */

/** Zero configuration, default instance of TypeStyle */
var ts = new _internal_typestyle__WEBPACK_IMPORTED_MODULE_0__["TypeStyle"]({ autoGenerateTag: true });
/** Sets the target tag where we write the css on style updates */
var setStylesTarget = ts.setStylesTarget;
/**
 * Insert `raw` CSS as a string. This is useful for e.g.
 * - third party CSS that you are customizing with template strings
 * - generating raw CSS in JavaScript
 * - reset libraries like normalize.css that you can use without loaders
 */
var cssRaw = ts.cssRaw;
/**
 * Takes CSSProperties and registers it to a global selector (body, html, etc.)
 */
var cssRule = ts.cssRule;
/**
 * Renders styles to the singleton tag imediately
 * NOTE: You should only call it on initial render to prevent any non CSS flash.
 * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
 **/
var forceRenderStyles = ts.forceRenderStyles;
/**
 * Utility function to register an @font-face
 */
var fontFace = ts.fontFace;
/**
 * Allows use to use the stylesheet in a node.js environment
 */
var getStyles = ts.getStyles;
/**
 * Takes keyframes and returns a generated animationName
 */
var keyframes = ts.keyframes;
/**
 * Helps with testing. Reinitializes FreeStyle + raw
 */
var reinit = ts.reinit;
/**
 * Takes CSSProperties and return a generated className you can use on your component
 */
var style = ts.style;
/**
 * Takes an object where property names are ideal class names and property values are CSSProperties, and
 * returns an object where property names are the same ideal class names and the property values are
 * the actual generated class names using the ideal class name as the $debugName
 */
var stylesheet = ts.stylesheet;
/**
 * Creates a new instance of TypeStyle separate from the default instance.
 *
 * - Use this for creating a different typestyle instance for a shadow dom component.
 * - Use this if you don't want an auto tag generated and you just want to collect the CSS.
 *
 * NOTE: styles aren't shared between different instances.
 */
function createTypeStyle(target) {
    var instance = new _internal_typestyle__WEBPACK_IMPORTED_MODULE_0__["TypeStyle"]({ autoGenerateTag: false });
    if (target) {
        instance.setStylesTarget(target);
    }
    return instance;
}


/***/ }),

/***/ "../node_modules/typestyle/lib.es2015/internal/formatting.js":
/*!*******************************************************************!*\
  !*** ../node_modules/typestyle/lib.es2015/internal/formatting.js ***!
  \*******************************************************************/
/*! exports provided: ensureStringObj, explodeKeyframes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ensureStringObj", function() { return ensureStringObj; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "explodeKeyframes", function() { return explodeKeyframes; });
/* harmony import */ var free_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! free-style */ "../node_modules/free-style/dist/free-style.js");
/* harmony import */ var free_style__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(free_style__WEBPACK_IMPORTED_MODULE_0__);

/**
 * We need to do the following to *our* objects before passing to freestyle:
 * - For any `$nest` directive move up to FreeStyle style nesting
 * - For any `$unique` directive map to FreeStyle Unique
 * - For any `$debugName` directive return the debug name
 */
function ensureStringObj(object) {
    /** The final result we will return */
    var result = {};
    var debugName = '';
    for (var key in object) {
        /** Grab the value upfront */
        var val = object[key];
        /** TypeStyle configuration options */
        if (key === '$unique') {
            result[free_style__WEBPACK_IMPORTED_MODULE_0__["IS_UNIQUE"]] = val;
        }
        else if (key === '$nest') {
            var nested = val;
            for (var selector in nested) {
                var subproperties = nested[selector];
                result[selector] = ensureStringObj(subproperties).result;
            }
        }
        else if (key === '$debugName') {
            debugName = val;
        }
        else {
            result[key] = val;
        }
    }
    return { result: result, debugName: debugName };
}
// todo: better name here
function explodeKeyframes(frames) {
    var result = { $debugName: undefined, keyframes: {} };
    for (var offset in frames) {
        var val = frames[offset];
        if (offset === '$debugName') {
            result.$debugName = val;
        }
        else {
            result.keyframes[offset] = val;
        }
    }
    return result;
}


/***/ }),

/***/ "../node_modules/typestyle/lib.es2015/internal/typestyle.js":
/*!******************************************************************!*\
  !*** ../node_modules/typestyle/lib.es2015/internal/typestyle.js ***!
  \******************************************************************/
/*! exports provided: TypeStyle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TypeStyle", function() { return TypeStyle; });
/* harmony import */ var free_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! free-style */ "../node_modules/free-style/dist/free-style.js");
/* harmony import */ var free_style__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(free_style__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _formatting__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./formatting */ "../node_modules/typestyle/lib.es2015/internal/formatting.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities */ "../node_modules/typestyle/lib.es2015/internal/utilities.js");



/**
 * Creates an instance of free style with our options
 */
var createFreeStyle = function () { return free_style__WEBPACK_IMPORTED_MODULE_0__["create"](
/** Use the default hash function */
undefined, 
/** Preserve $debugName values */
true); };
/**
 * Maintains a single stylesheet and keeps it in sync with requested styles
 */
var TypeStyle = /** @class */ (function () {
    function TypeStyle(_a) {
        var autoGenerateTag = _a.autoGenerateTag;
        var _this = this;
        /**
         * Insert `raw` CSS as a string. This is useful for e.g.
         * - third party CSS that you are customizing with template strings
         * - generating raw CSS in JavaScript
         * - reset libraries like normalize.css that you can use without loaders
         */
        this.cssRaw = function (mustBeValidCSS) {
            if (!mustBeValidCSS) {
                return;
            }
            _this._raw += mustBeValidCSS || '';
            _this._pendingRawChange = true;
            _this._styleUpdated();
        };
        /**
         * Takes CSSProperties and registers it to a global selector (body, html, etc.)
         */
        this.cssRule = function (selector) {
            var objects = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                objects[_i - 1] = arguments[_i];
            }
            var object = Object(_formatting__WEBPACK_IMPORTED_MODULE_1__["ensureStringObj"])(_utilities__WEBPACK_IMPORTED_MODULE_2__["extend"].apply(void 0, objects)).result;
            _this._freeStyle.registerRule(selector, object);
            _this._styleUpdated();
            return;
        };
        /**
         * Renders styles to the singleton tag imediately
         * NOTE: You should only call it on initial render to prevent any non CSS flash.
         * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
         **/
        this.forceRenderStyles = function () {
            var target = _this._getTag();
            if (!target) {
                return;
            }
            target.textContent = _this.getStyles();
        };
        /**
         * Utility function to register an @font-face
         */
        this.fontFace = function () {
            var fontFace = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fontFace[_i] = arguments[_i];
            }
            var freeStyle = _this._freeStyle;
            for (var _a = 0, _b = fontFace; _a < _b.length; _a++) {
                var face = _b[_a];
                freeStyle.registerRule('@font-face', face);
            }
            _this._styleUpdated();
            return;
        };
        /**
         * Allows use to use the stylesheet in a node.js environment
         */
        this.getStyles = function () {
            return (_this._raw || '') + _this._freeStyle.getStyles();
        };
        /**
         * Takes keyframes and returns a generated animationName
         */
        this.keyframes = function (frames) {
            var _a = Object(_formatting__WEBPACK_IMPORTED_MODULE_1__["explodeKeyframes"])(frames), keyframes = _a.keyframes, $debugName = _a.$debugName;
            // TODO: replace $debugName with display name
            var animationName = _this._freeStyle.registerKeyframes(keyframes, $debugName);
            _this._styleUpdated();
            return animationName;
        };
        /**
         * Helps with testing. Reinitializes FreeStyle + raw
         */
        this.reinit = function () {
            /** reinit freestyle */
            var freeStyle = createFreeStyle();
            _this._freeStyle = freeStyle;
            _this._lastFreeStyleChangeId = freeStyle.changeId;
            /** reinit raw */
            _this._raw = '';
            _this._pendingRawChange = false;
            /** Clear any styles that were flushed */
            var target = _this._getTag();
            if (target) {
                target.textContent = '';
            }
        };
        /** Sets the target tag where we write the css on style updates */
        this.setStylesTarget = function (tag) {
            /** Clear any data in any previous tag */
            if (_this._tag) {
                _this._tag.textContent = '';
            }
            _this._tag = tag;
            /** This special time buffer immediately */
            _this.forceRenderStyles();
        };
        /**
         * Takes an object where property names are ideal class names and property values are CSSProperties, and
         * returns an object where property names are the same ideal class names and the property values are
         * the actual generated class names using the ideal class name as the $debugName
         */
        this.stylesheet = function (classes) {
            var classNames = Object.getOwnPropertyNames(classes);
            var result = {};
            for (var _i = 0, classNames_1 = classNames; _i < classNames_1.length; _i++) {
                var className = classNames_1[_i];
                var classDef = classes[className];
                if (classDef) {
                    classDef.$debugName = className;
                    result[className] = _this.style(classDef);
                }
            }
            return result;
        };
        var freeStyle = createFreeStyle();
        this._autoGenerateTag = autoGenerateTag;
        this._freeStyle = freeStyle;
        this._lastFreeStyleChangeId = freeStyle.changeId;
        this._pending = 0;
        this._pendingRawChange = false;
        this._raw = '';
        this._tag = undefined;
        // rebind prototype to TypeStyle.  It might be better to do a function() { return this.style.apply(this, arguments)}
        this.style = this.style.bind(this);
    }
    /**
     * Only calls cb all sync operations settle
     */
    TypeStyle.prototype._afterAllSync = function (cb) {
        var _this = this;
        this._pending++;
        var pending = this._pending;
        Object(_utilities__WEBPACK_IMPORTED_MODULE_2__["raf"])(function () {
            if (pending !== _this._pending) {
                return;
            }
            cb();
        });
    };
    TypeStyle.prototype._getTag = function () {
        if (this._tag) {
            return this._tag;
        }
        if (this._autoGenerateTag) {
            var tag = typeof window === 'undefined'
                ? { textContent: '' }
                : document.createElement('style');
            if (typeof document !== 'undefined') {
                document.head.appendChild(tag);
            }
            this._tag = tag;
            return tag;
        }
        return undefined;
    };
    /** Checks if the style tag needs updating and if so queues up the change */
    TypeStyle.prototype._styleUpdated = function () {
        var _this = this;
        var changeId = this._freeStyle.changeId;
        var lastChangeId = this._lastFreeStyleChangeId;
        if (!this._pendingRawChange && changeId === lastChangeId) {
            return;
        }
        this._lastFreeStyleChangeId = changeId;
        this._pendingRawChange = false;
        this._afterAllSync(function () { return _this.forceRenderStyles(); });
    };
    TypeStyle.prototype.style = function () {
        var freeStyle = this._freeStyle;
        var _a = Object(_formatting__WEBPACK_IMPORTED_MODULE_1__["ensureStringObj"])(_utilities__WEBPACK_IMPORTED_MODULE_2__["extend"].apply(undefined, arguments)), result = _a.result, debugName = _a.debugName;
        var className = debugName ? freeStyle.registerStyle(result, debugName) : freeStyle.registerStyle(result);
        this._styleUpdated();
        return className;
    };
    return TypeStyle;
}());



/***/ }),

/***/ "../node_modules/typestyle/lib.es2015/internal/utilities.js":
/*!******************************************************************!*\
  !*** ../node_modules/typestyle/lib.es2015/internal/utilities.js ***!
  \******************************************************************/
/*! exports provided: raf, classes, extend, media */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "raf", function() { return raf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "classes", function() { return classes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return extend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "media", function() { return media; });
/** Raf for node + browser */
var raf = typeof requestAnimationFrame === 'undefined'
    /**
     * Make sure setTimeout is always invoked with
     * `this` set to `window` or `global` automatically
     **/
    ? function (cb) { return setTimeout(cb); }
    /**
     * Make sure window.requestAnimationFrame is always invoked with `this` window
     * We might have raf without window in case of `raf/polyfill` (recommended by React)
     **/
    : typeof window === 'undefined'
        ? requestAnimationFrame
        : requestAnimationFrame.bind(window);
/**
 * Utility to join classes conditionally
 */
function classes() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return classes.filter(function (c) { return !!c; }).join(' ');
}
/**
 * Merges various styles into a single style object.
 * Note: if two objects have the same property the last one wins
 */
function extend() {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    /** The final result we will return */
    var result = {};
    for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
        var object = objects_1[_a];
        if (object == null || object === false) {
            continue;
        }
        for (var key in object) {
            /** Falsy values except a explicit 0 is ignored */
            var val = object[key];
            if (!val && val !== 0) {
                continue;
            }
            /** if nested media or pseudo selector */
            if (key === '$nest' && val) {
                result[key] = result['$nest'] ? extend(result['$nest'], val) : val;
            }
            else if ((key.indexOf('&') !== -1 || key.indexOf('@media') === 0)) {
                result[key] = result[key] ? extend(result[key], val) : val;
            }
            else {
                result[key] = val;
            }
        }
    }
    return result;
}
/**
 * Utility to help customize styles with media queries. e.g.
 * ```
 * style(
 *  media({maxWidth:500}, {color:'red'})
 * )
 * ```
 */
var media = function (mediaQuery) {
    var objects = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objects[_i - 1] = arguments[_i];
    }
    var mediaQuerySections = [];
    if (mediaQuery.type)
        mediaQuerySections.push(mediaQuery.type);
    if (mediaQuery.orientation)
        mediaQuerySections.push("(orientation: " + mediaQuery.orientation + ")");
    if (mediaQuery.minWidth)
        mediaQuerySections.push("(min-width: " + mediaLength(mediaQuery.minWidth) + ")");
    if (mediaQuery.maxWidth)
        mediaQuerySections.push("(max-width: " + mediaLength(mediaQuery.maxWidth) + ")");
    if (mediaQuery.minHeight)
        mediaQuerySections.push("(min-height: " + mediaLength(mediaQuery.minHeight) + ")");
    if (mediaQuery.maxHeight)
        mediaQuerySections.push("(max-height: " + mediaLength(mediaQuery.maxHeight) + ")");
    var stringMediaQuery = "@media " + mediaQuerySections.join(' and ');
    var object = {
        $nest: (_a = {},
            _a[stringMediaQuery] = extend.apply(void 0, objects),
            _a)
    };
    return object;
    var _a;
};
var mediaLength = function (value) {
    return typeof value === 'string' ? value : value + "px";
};


/***/ }),

/***/ "../node_modules/typestyle/lib.es2015/types.js":
/*!*****************************************************!*\
  !*** ../node_modules/typestyle/lib.es2015/types.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./TSX/jQueryUI Widgets/Common.tsx":
/*!*****************************************!*\
  !*** ./TSX/jQueryUI Widgets/Common.tsx ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(__webpack_require__(/*! react */ "react"));
var typestyle_1 = __webpack_require__(/*! typestyle */ "../node_modules/typestyle/lib.es2015/index.js");
exports.outerDiv = {
    fontSize: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflowY: 'hidden',
    overflowX: 'hidden',
    padding: '0em',
    zIndex: 1000,
    boxShadow: '4px 4px 2px #888888',
    border: '2px solid black',
    position: 'absolute',
    top: '0',
    left: 0,
    display: 'none',
    backgroundColor: 'white',
};
exports.handle = typestyle_1.style({
    width: '100%',
    height: '20px',
    backgroundColor: '#808080',
    cursor: 'move',
    padding: '0em'
});
exports.closeButton = typestyle_1.style({
    background: 'firebrick',
    color: 'white',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20px',
    height: '20px',
    textAlign: 'center',
    verticalAlign: 'middle',
    padding: 0,
    border: 0,
    $nest: {
        "&:hover": {
            background: 'orangered'
        }
    }
});
exports.WidgetWindow = function (props) {
    var refWindow = React.useRef(null);
    var refHandle = React.useRef(null);
    React.useLayoutEffect(function () {
        if (props.show)
            $(refWindow.current).draggable({ scroll: false, handle: refHandle.current, containment: '#chartpanel' });
    });
    if (!props.show)
        return null;
    return (React.createElement("div", { ref: refWindow, className: "ui-widget-content", style: __assign({}, exports.outerDiv, { width: props.width, maxHeight: props.maxHeight, display: undefined }) },
        React.createElement("div", { style: { border: 'black solid 2px' } },
            React.createElement("div", { ref: refHandle, className: exports.handle }),
            React.createElement("div", { style: { width: props.width - 6, maxHeight: props.maxHeight - 24 } }, props.children),
            React.createElement("button", { className: exports.closeButton, onClick: function () { return props.close(); } }, "X"))));
};


/***/ }),

/***/ "./TSX/jQueryUI Widgets/TimeCorrelatedSags.tsx":
/*!*****************************************************!*\
  !*** ./TSX/jQueryUI Widgets/TimeCorrelatedSags.tsx ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(__webpack_require__(/*! react */ "react"));
var Common_1 = __webpack_require__(/*! ./Common */ "./TSX/jQueryUI Widgets/Common.tsx");
var TimeCorrelatedSagsWidget = function (props) {
    var _a = __read(React.useState([]), 2), tblData = _a[0], setTblData = _a[1];
    React.useEffect(function () {
        var handle = getData();
        return function () { if (handle != undefined && handle.abort != undefined)
            handle.abort(); };
    }, [props.eventId]);
    var rowStyle = { paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 5 };
    function getData() {
        var handle = $.ajax({
            type: "GET",
            url: homePath + "api/OpenSEE/GetTimeCorrelatedSags?eventId=" + props.eventId,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        handle.done(function (d) {
            setTblData(d.map(function (row) {
                return React.createElement("tr", { style: { display: 'table', tableLayout: 'fixed', background: (row.EventID == props.eventId ? 'lightyellow' : 'default') }, key: row.EventID },
                    React.createElement("td", { style: __assign({ width: 60 }, rowStyle) },
                        React.createElement("a", { id: "eventLink", target: "_blank", href: './?eventid=' + row.EventID },
                            React.createElement("div", { style: { width: '100%', height: '100%' } }, row.EventID))),
                    React.createElement("td", { style: __assign({ width: 80 }, rowStyle) }, row.EventType),
                    React.createElement("td", { style: __assign({ width: 80 }, rowStyle) },
                        row.SagMagnitudePercent,
                        "%"),
                    React.createElement("td", { style: __assign({ width: 200 }, rowStyle) },
                        row.SagDurationMilliseconds,
                        " ms (",
                        row.SagDurationCycles,
                        " cycles)"),
                    React.createElement("td", { style: __assign({ width: 220 }, rowStyle) }, row.StartTime),
                    React.createElement("td", { style: __assign({ width: 200 }, rowStyle) }, row.MeterName),
                    React.createElement("td", { style: __assign({ width: 300 }, rowStyle) }, row.AssetName));
            }));
        });
        return handle;
    }
    return (React.createElement(Common_1.WidgetWindow, { show: props.isOpen, close: props.closeCallback, maxHeight: 550, width: 996 },
        React.createElement("table", { className: "table", style: { fontSize: 'small', marginBottom: 0 } },
            React.createElement("thead", { style: { display: 'table', tableLayout: 'fixed', marginBottom: 0 } },
                React.createElement("tr", null,
                    React.createElement("th", { style: __assign({ width: 60 }, rowStyle) }, "Event ID"),
                    React.createElement("th", { style: __assign({ width: 80 }, rowStyle) }, "Event Type"),
                    React.createElement("th", { style: __assign({ width: 80 }, rowStyle) }, "Magnitude"),
                    React.createElement("th", { style: __assign({ width: 200 }, rowStyle) }, "Duration"),
                    React.createElement("th", { style: __assign({ width: 220 }, rowStyle) }, "Start Time"),
                    React.createElement("th", { style: __assign({ width: 200 }, rowStyle) }, "Meter Name"),
                    React.createElement("th", { style: __assign({ width: 300 }, rowStyle) },
                        "Asset Name\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
                        React.createElement("button", { className: 'btn btn-primary', onClick: function () { return props.exportCallback(); } }, "Export(csv)")))),
            React.createElement("tbody", { style: { maxHeight: 500, overflowY: 'auto', display: 'block' } }, tblData))));
};
exports.default = TimeCorrelatedSagsWidget;


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = React;

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL3NyYy9mcmVlLXN0eWxlLnRzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy90eXBlc3R5bGUvbGliLmVzMjAxNS9pbnRlcm5hbC9mb3JtYXR0aW5nLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvdHlwZXN0eWxlLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvdXRpbGl0aWVzLmpzIiwid2VicGFjazovLy8uL1RTWC9qUXVlcnlVSSBXaWRnZXRzL0NvbW1vbi50c3giLCJ3ZWJwYWNrOi8vLy4vVFNYL2pRdWVyeVVJIFdpZGdldHMvVGltZUNvcnJlbGF0ZWRTYWdzLnRzeCIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJSZWFjdFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUs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R0FBRyxJQUFLLFFBQVEsa0JBQW1CO29CQUN2RCw0QkFBSSxLQUFLLGFBQUksS0FBSyxFQUFFLEdBQUcsSUFBSyxRQUFROzt3QkFBb0UsZ0NBQVEsU0FBUyxFQUFDLGlCQUFpQixFQUFDLE9BQU8sRUFBRSxjQUFNLFlBQUssQ0FBQyxjQUFjLEVBQUUsRUFBdEIsQ0FBc0Isa0JBQXNCLENBQUssQ0FDM00sQ0FDRDtZQUNSLCtCQUFPLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQ2hFLE9BQU8sQ0FDSixDQUNKLENBQ0csQ0FDbEIsQ0FBQztBQUVOLENBQUM7QUFFRCxrQkFBZSx3QkFBd0I7Ozs7Ozs7Ozs7OztBQzVGdkMsdUIiLCJmaWxlIjoiVGltZUNvcnJlbGF0ZWRTYWdzV2lkZ2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9UU1gvalF1ZXJ5VUkgV2lkZ2V0cy9UaW1lQ29ycmVsYXRlZFNhZ3MudHN4XCIpO1xuIiwiLyoqXG4gKiBUaGUgdW5pcXVlIGlkIGlzIHVzZWQgZm9yIHVuaXF1ZSBoYXNoZXMuXG4gKi9cbmxldCB1bmlxdWVJZCA9IDBcblxuLyoqXG4gKiBWYWxpZCBDU1MgcHJvcGVydHkgdmFsdWVzLlxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eVZhbHVlID0gbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZ1xuXG4vKipcbiAqIElucHV0IHN0eWxlcyBvYmplY3QuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3R5bGVzIHtcbiAgW3NlbGVjdG9yOiBzdHJpbmddOiBudWxsIHwgdW5kZWZpbmVkIHwgUHJvcGVydHlWYWx1ZSB8IFByb3BlcnR5VmFsdWVbXSB8IFN0eWxlc1xufVxuXG4vKipcbiAqIEhhc2ggYWxnb3JpdGhtIGludGVyZmFjZS5cbiAqL1xuZXhwb3J0IHR5cGUgSGFzaEZ1bmN0aW9uID0gKHN0cjogc3RyaW5nKSA9PiBzdHJpbmdcblxuLyoqXG4gKiBUYWcgc3R5bGVzIHdpdGggdGhpcyBzdHJpbmcgdG8gZ2V0IHVuaXF1ZSBoYXNoZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBJU19VTklRVUUgPSAnX19ET19OT1RfREVEVVBFX1NUWUxFX18nXG5cbmNvbnN0IHVwcGVyQ2FzZVBhdHRlcm4gPSAvW0EtWl0vZ1xuY29uc3QgbXNQYXR0ZXJuID0gL15tcy0vXG5jb25zdCBpbnRlcnBvbGF0ZVBhdHRlcm4gPSAvJi9nXG5jb25zdCBlc2NhcGVQYXR0ZXJuID0gL1sgISMkJSYoKSorLC4vOzw9Pj9AW1xcXV5ge3x9flwiJ1xcXFxdL2dcbmNvbnN0IHByb3BMb3dlciA9IChtOiBzdHJpbmcpID0+IGAtJHttLnRvTG93ZXJDYXNlKCl9YFxuXG4vKipcbiAqIENTUyBwcm9wZXJ0aWVzIHRoYXQgYXJlIHZhbGlkIHVuaXQtbGVzcyBudW1iZXJzLlxuICovXG5jb25zdCBjc3NOdW1iZXJQcm9wZXJ0aWVzID0gW1xuICAnYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudCcsXG4gICdib3gtZmxleCcsXG4gICdib3gtZmxleC1ncm91cCcsXG4gICdjb2x1bW4tY291bnQnLFxuICAnY291bnRlci1pbmNyZW1lbnQnLFxuICAnY291bnRlci1yZXNldCcsXG4gICdmbGV4JyxcbiAgJ2ZsZXgtZ3JvdycsXG4gICdmbGV4LXBvc2l0aXZlJyxcbiAgJ2ZsZXgtc2hyaW5rJyxcbiAgJ2ZsZXgtbmVnYXRpdmUnLFxuICAnZm9udC13ZWlnaHQnLFxuICAnbGluZS1jbGFtcCcsXG4gICdsaW5lLWhlaWdodCcsXG4gICdvcGFjaXR5JyxcbiAgJ29yZGVyJyxcbiAgJ29ycGhhbnMnLFxuICAndGFiLXNpemUnLFxuICAnd2lkb3dzJyxcbiAgJ3otaW5kZXgnLFxuICAnem9vbScsXG4gIC8vIFNWRyBwcm9wZXJ0aWVzLlxuICAnZmlsbC1vcGFjaXR5JyxcbiAgJ3N0cm9rZS1kYXNob2Zmc2V0JyxcbiAgJ3N0cm9rZS1vcGFjaXR5JyxcbiAgJ3N0cm9rZS13aWR0aCdcbl1cblxuLyoqXG4gKiBNYXAgb2YgY3NzIG51bWJlciBwcm9wZXJ0aWVzLlxuICovXG5jb25zdCBDU1NfTlVNQkVSID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4vLyBBZGQgdmVuZG9yIHByZWZpeGVzIHRvIGFsbCB1bml0LWxlc3MgcHJvcGVydGllcy5cbmZvciAoY29uc3QgcHJlZml4IG9mIFsnLXdlYmtpdC0nLCAnLW1zLScsICctbW96LScsICctby0nLCAnJ10pIHtcbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBjc3NOdW1iZXJQcm9wZXJ0aWVzKSB7XG4gICAgQ1NTX05VTUJFUltwcmVmaXggKyBwcm9wZXJ0eV0gPSB0cnVlXG4gIH1cbn1cblxuLyoqXG4gKiBFc2NhcGUgYSBDU1MgY2xhc3MgbmFtZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVzY2FwZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLnJlcGxhY2UoZXNjYXBlUGF0dGVybiwgJ1xcXFwkJicpXG5cbi8qKlxuICogVHJhbnNmb3JtIGEgSmF2YVNjcmlwdCBwcm9wZXJ0eSBpbnRvIGEgQ1NTIHByb3BlcnR5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaHlwaGVuYXRlIChwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwcm9wZXJ0eU5hbWVcbiAgICAucmVwbGFjZSh1cHBlckNhc2VQYXR0ZXJuLCBwcm9wTG93ZXIpXG4gICAgLnJlcGxhY2UobXNQYXR0ZXJuLCAnLW1zLScpIC8vIEludGVybmV0IEV4cGxvcmVyIHZlbmRvciBwcmVmaXguXG59XG5cbi8qKlxuICogR2VuZXJhdGUgYSBoYXNoIHZhbHVlIGZyb20gYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdIYXNoIChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCB2YWx1ZSA9IDUzODFcbiAgbGV0IGxlbiA9IHN0ci5sZW5ndGhcblxuICB3aGlsZSAobGVuLS0pIHZhbHVlID0gKHZhbHVlICogMzMpIF4gc3RyLmNoYXJDb2RlQXQobGVuKVxuXG4gIHJldHVybiAodmFsdWUgPj4+IDApLnRvU3RyaW5nKDM2KVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhIHN0eWxlIHN0cmluZyB0byBhIENTUyBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHN0eWxlVG9TdHJpbmcgKGtleTogc3RyaW5nLCB2YWx1ZTogUHJvcGVydHlWYWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiB2YWx1ZSAhPT0gMCAmJiAhQ1NTX05VTUJFUltrZXldKSB7XG4gICAgcmV0dXJuIGAke2tleX06JHt2YWx1ZX1weGBcbiAgfVxuXG4gIHJldHVybiBgJHtrZXl9OiR7dmFsdWV9YFxufVxuXG4vKipcbiAqIFNvcnQgYW4gYXJyYXkgb2YgdHVwbGVzIGJ5IGZpcnN0IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzb3J0VHVwbGVzIDxUIGV4dGVuZHMgYW55W10+ICh2YWx1ZTogVFtdKTogVFtdIHtcbiAgcmV0dXJuIHZhbHVlLnNvcnQoKGEsIGIpID0+IGFbMF0gPiBiWzBdID8gMSA6IC0xKVxufVxuXG4vKipcbiAqIENhdGVnb3JpemUgdXNlciBzdHlsZXMuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlU3R5bGVzIChzdHlsZXM6IFN0eWxlcywgaGFzTmVzdGVkU3R5bGVzOiBib29sZWFuKSB7XG4gIGNvbnN0IHByb3BlcnRpZXM6IEFycmF5PFtzdHJpbmcsIFByb3BlcnR5VmFsdWUgfCBQcm9wZXJ0eVZhbHVlW11dPiA9IFtdXG4gIGNvbnN0IG5lc3RlZFN0eWxlczogQXJyYXk8W3N0cmluZywgU3R5bGVzXT4gPSBbXVxuICBsZXQgaXNVbmlxdWUgPSBmYWxzZVxuXG4gIC8vIFNvcnQga2V5cyBiZWZvcmUgYWRkaW5nIHRvIHN0eWxlcy5cbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3R5bGVzKSkge1xuICAgIGNvbnN0IHZhbHVlID0gc3R5bGVzW2tleV1cblxuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoa2V5ID09PSBJU19VTklRVUUpIHtcbiAgICAgICAgaXNVbmlxdWUgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIG5lc3RlZFN0eWxlcy5wdXNoKFtrZXkudHJpbSgpLCB2YWx1ZV0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wZXJ0aWVzLnB1c2goW2h5cGhlbmF0ZShrZXkudHJpbSgpKSwgdmFsdWVdKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3R5bGVTdHJpbmc6IHN0cmluZ2lmeVByb3BlcnRpZXMoc29ydFR1cGxlcyhwcm9wZXJ0aWVzKSksXG4gICAgbmVzdGVkU3R5bGVzOiBoYXNOZXN0ZWRTdHlsZXMgPyBuZXN0ZWRTdHlsZXMgOiBzb3J0VHVwbGVzKG5lc3RlZFN0eWxlcyksXG4gICAgaXNVbmlxdWVcbiAgfVxufVxuXG4vKipcbiAqIFN0cmluZ2lmeSBhbiBhcnJheSBvZiBwcm9wZXJ0eSB0dXBsZXMuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVByb3BlcnRpZXMgKHByb3BlcnRpZXM6IEFycmF5PFtzdHJpbmcsIFByb3BlcnR5VmFsdWUgfCBQcm9wZXJ0eVZhbHVlW11dPikge1xuICByZXR1cm4gcHJvcGVydGllcy5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSByZXR1cm4gc3R5bGVUb1N0cmluZyhuYW1lLCB2YWx1ZSlcblxuICAgIHJldHVybiB2YWx1ZS5tYXAoeCA9PiBzdHlsZVRvU3RyaW5nKG5hbWUsIHgpKS5qb2luKCc7JylcbiAgfSkuam9pbignOycpXG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGUgQ1NTIHNlbGVjdG9ycy5cbiAqL1xuZnVuY3Rpb24gaW50ZXJwb2xhdGUgKHNlbGVjdG9yOiBzdHJpbmcsIHBhcmVudDogc3RyaW5nKSB7XG4gIGlmIChzZWxlY3Rvci5pbmRleE9mKCcmJykgPiAtMSkge1xuICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKGludGVycG9sYXRlUGF0dGVybiwgcGFyZW50KVxuICB9XG5cbiAgcmV0dXJuIGAke3BhcmVudH0gJHtzZWxlY3Rvcn1gXG59XG5cbi8qKlxuICogUmVjdXJzaXZlIGxvb3AgYnVpbGRpbmcgc3R5bGVzIHdpdGggZGVmZXJyZWQgc2VsZWN0b3JzLlxuICovXG5mdW5jdGlvbiBzdHlsaXplIChjYWNoZTogQ2FjaGU8YW55Piwgc2VsZWN0b3I6IHN0cmluZywgc3R5bGVzOiBTdHlsZXMsIGxpc3Q6IFtzdHJpbmcsIFN0eWxlXVtdLCBwYXJlbnQ/OiBzdHJpbmcpIHtcbiAgY29uc3QgeyBzdHlsZVN0cmluZywgbmVzdGVkU3R5bGVzLCBpc1VuaXF1ZSB9ID0gcGFyc2VTdHlsZXMoc3R5bGVzLCAhIXNlbGVjdG9yKVxuICBsZXQgcGlkID0gc3R5bGVTdHJpbmdcblxuICBpZiAoc2VsZWN0b3IuY2hhckNvZGVBdCgwKSA9PT0gNjQgLyogQCAqLykge1xuICAgIGNvbnN0IHJ1bGUgPSBjYWNoZS5hZGQobmV3IFJ1bGUoc2VsZWN0b3IsIHBhcmVudCA/IHVuZGVmaW5lZCA6IHN0eWxlU3RyaW5nLCBjYWNoZS5oYXNoKSlcblxuICAgIC8vIE5lc3RlZCBzdHlsZXMgc3VwcG9ydCAoZS5nLiBgLmZvbyA+IEBtZWRpYSA+IC5iYXJgKS5cbiAgICBpZiAoc3R5bGVTdHJpbmcgJiYgcGFyZW50KSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHJ1bGUuYWRkKG5ldyBTdHlsZShzdHlsZVN0cmluZywgcnVsZS5oYXNoLCBpc1VuaXF1ZSA/IGB1JHsoKyt1bmlxdWVJZCkudG9TdHJpbmcoMzYpfWAgOiB1bmRlZmluZWQpKVxuICAgICAgbGlzdC5wdXNoKFtwYXJlbnQsIHN0eWxlXSlcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgbmVzdGVkU3R5bGVzKSB7XG4gICAgICBwaWQgKz0gbmFtZSArIHN0eWxpemUocnVsZSwgbmFtZSwgdmFsdWUsIGxpc3QsIHBhcmVudClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qga2V5ID0gcGFyZW50ID8gaW50ZXJwb2xhdGUoc2VsZWN0b3IsIHBhcmVudCkgOiBzZWxlY3RvclxuXG4gICAgaWYgKHN0eWxlU3RyaW5nKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IGNhY2hlLmFkZChuZXcgU3R5bGUoc3R5bGVTdHJpbmcsIGNhY2hlLmhhc2gsIGlzVW5pcXVlID8gYHUkeygrK3VuaXF1ZUlkKS50b1N0cmluZygzNil9YCA6IHVuZGVmaW5lZCkpXG4gICAgICBsaXN0LnB1c2goW2tleSwgc3R5bGVdKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBuZXN0ZWRTdHlsZXMpIHtcbiAgICAgIHBpZCArPSBuYW1lICsgc3R5bGl6ZShjYWNoZSwgbmFtZSwgdmFsdWUsIGxpc3QsIGtleSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGlkXG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYWxsIHN0eWxlcywgYnV0IGNvbGxlY3QgZm9yIHNlbGVjdG9yIGludGVycG9sYXRpb24gdXNpbmcgdGhlIGhhc2guXG4gKi9cbmZ1bmN0aW9uIGNvbXBvc2VTdHlsZXMgKGNvbnRhaW5lcjogRnJlZVN0eWxlLCBzZWxlY3Rvcjogc3RyaW5nLCBzdHlsZXM6IFN0eWxlcywgaXNTdHlsZTogYm9vbGVhbiwgZGlzcGxheU5hbWU/OiBzdHJpbmcpIHtcbiAgY29uc3QgY2FjaGUgPSBuZXcgQ2FjaGU8UnVsZSB8IFN0eWxlPihjb250YWluZXIuaGFzaClcbiAgY29uc3QgbGlzdDogW3N0cmluZywgU3R5bGVdW10gPSBbXVxuICBjb25zdCBwaWQgPSBzdHlsaXplKGNhY2hlLCBzZWxlY3Rvciwgc3R5bGVzLCBsaXN0KVxuXG4gIGNvbnN0IGhhc2ggPSBgZiR7Y2FjaGUuaGFzaChwaWQpfWBcbiAgY29uc3QgaWQgPSBkaXNwbGF5TmFtZSA/IGAke2Rpc3BsYXlOYW1lfV8ke2hhc2h9YCA6IGhhc2hcblxuICBmb3IgKGNvbnN0IFtzZWxlY3Rvciwgc3R5bGVdIG9mIGxpc3QpIHtcbiAgICBjb25zdCBrZXkgPSBpc1N0eWxlID8gaW50ZXJwb2xhdGUoc2VsZWN0b3IsIGAuJHtlc2NhcGUoaWQpfWApIDogc2VsZWN0b3JcbiAgICBzdHlsZS5hZGQobmV3IFNlbGVjdG9yKGtleSwgc3R5bGUuaGFzaCwgdW5kZWZpbmVkLCBwaWQpKVxuICB9XG5cbiAgcmV0dXJuIHsgY2FjaGUsIHBpZCwgaWQgfVxufVxuXG4vKipcbiAqIENhY2hlIHRvIGxpc3QgdG8gc3R5bGVzLlxuICovXG5mdW5jdGlvbiBqb2luIChhcnI6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlcyA9ICcnXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSByZXMgKz0gYXJyW2ldXG4gIHJldHVybiByZXNcbn1cblxuLyoqXG4gKiBQcm9wYWdhdGUgY2hhbmdlIGV2ZW50cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDaGFuZ2VzIHtcbiAgYWRkIChzdHlsZTogQ29udGFpbmVyPGFueT4sIGluZGV4OiBudW1iZXIpOiB2b2lkXG4gIGNoYW5nZSAoc3R5bGU6IENvbnRhaW5lcjxhbnk+LCBvbGRJbmRleDogbnVtYmVyLCBuZXdJbmRleDogbnVtYmVyKTogdm9pZFxuICByZW1vdmUgKHN0eWxlOiBDb250YWluZXI8YW55PiwgaW5kZXg6IG51bWJlcik6IHZvaWRcbn1cblxuLyoqXG4gKiBOb29wIGNoYW5nZXMuXG4gKi9cbmNvbnN0IG5vb3BDaGFuZ2VzOiBDaGFuZ2VzID0ge1xuICBhZGQ6ICgpID0+IHVuZGVmaW5lZCxcbiAgY2hhbmdlOiAoKSA9PiB1bmRlZmluZWQsXG4gIHJlbW92ZTogKCkgPT4gdW5kZWZpbmVkXG59XG5cbi8qKlxuICogQ2FjaGVhYmxlIGludGVyZmFjZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250YWluZXIgPFQ+IHtcbiAgaWQ6IHN0cmluZ1xuICBjbG9uZSAoKTogVFxuICBnZXRJZGVudGlmaWVyICgpOiBzdHJpbmdcbiAgZ2V0U3R5bGVzICgpOiBzdHJpbmdcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnQgYSBjYWNoZS9ldmVudCBlbWl0dGVyLlxuICovXG5leHBvcnQgY2xhc3MgQ2FjaGUgPFQgZXh0ZW5kcyBDb250YWluZXI8YW55Pj4ge1xuXG4gIHNoZWV0OiBzdHJpbmdbXSA9IFtdXG4gIGNoYW5nZUlkID0gMFxuXG4gIHByaXZhdGUgX2tleXM6IHN0cmluZ1tdID0gW11cbiAgcHJpdmF0ZSBfY2hpbGRyZW46IHsgW2lkOiBzdHJpbmddOiBUIH0gPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHByaXZhdGUgX2NvdW50ZXJzOiB7IFtpZDogc3RyaW5nXTogbnVtYmVyIH0gPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cbiAgY29uc3RydWN0b3IgKHB1YmxpYyBoYXNoID0gc3RyaW5nSGFzaCwgcHVibGljIGNoYW5nZXM6IENoYW5nZXMgPSBub29wQ2hhbmdlcykge31cblxuICBhZGQgPFUgZXh0ZW5kcyBUPiAoc3R5bGU6IFUpOiBVIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXSB8fCAwXG4gICAgY29uc3QgaXRlbSA9IHRoaXMuX2NoaWxkcmVuW3N0eWxlLmlkXSB8fCBzdHlsZS5jbG9uZSgpXG5cbiAgICB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF0gPSBjb3VudCArIDFcblxuICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fY2hpbGRyZW5baXRlbS5pZF0gPSBpdGVtXG4gICAgICB0aGlzLl9rZXlzLnB1c2goaXRlbS5pZClcbiAgICAgIHRoaXMuc2hlZXQucHVzaChpdGVtLmdldFN0eWxlcygpKVxuICAgICAgdGhpcy5jaGFuZ2VJZCsrXG4gICAgICB0aGlzLmNoYW5nZXMuYWRkKGl0ZW0sIHRoaXMuX2tleXMubGVuZ3RoIC0gMSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2hlY2sgaWYgY29udGVudHMgYXJlIGRpZmZlcmVudC5cbiAgICAgIGlmIChpdGVtLmdldElkZW50aWZpZXIoKSAhPT0gc3R5bGUuZ2V0SWRlbnRpZmllcigpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEhhc2ggY29sbGlzaW9uOiAke3N0eWxlLmdldFN0eWxlcygpfSA9PT0gJHtpdGVtLmdldFN0eWxlcygpfWApXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9sZEluZGV4ID0gdGhpcy5fa2V5cy5pbmRleE9mKHN0eWxlLmlkKVxuICAgICAgY29uc3QgbmV3SW5kZXggPSB0aGlzLl9rZXlzLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IHByZXZDaGFuZ2VJZCA9IHRoaXMuY2hhbmdlSWRcblxuICAgICAgaWYgKG9sZEluZGV4ICE9PSBuZXdJbmRleCkge1xuICAgICAgICB0aGlzLl9rZXlzLnNwbGljZShvbGRJbmRleCwgMSlcbiAgICAgICAgdGhpcy5fa2V5cy5wdXNoKHN0eWxlLmlkKVxuICAgICAgICB0aGlzLmNoYW5nZUlkKytcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBDYWNoZSAmJiBzdHlsZSBpbnN0YW5jZW9mIENhY2hlKSB7XG4gICAgICAgIGNvbnN0IHByZXZDaGFuZ2VJZCA9IGl0ZW0uY2hhbmdlSWRcblxuICAgICAgICBpdGVtLm1lcmdlKHN0eWxlKVxuXG4gICAgICAgIGlmIChpdGVtLmNoYW5nZUlkICE9PSBwcmV2Q2hhbmdlSWQpIHtcbiAgICAgICAgICB0aGlzLmNoYW5nZUlkKytcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VJZCAhPT0gcHJldkNoYW5nZUlkKSB7XG4gICAgICAgIGlmIChvbGRJbmRleCA9PT0gbmV3SW5kZXgpIHtcbiAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShvbGRJbmRleCwgMSwgaXRlbS5nZXRTdHlsZXMoKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShvbGRJbmRleCwgMSlcbiAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShuZXdJbmRleCwgMCwgaXRlbS5nZXRTdHlsZXMoKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2hhbmdlcy5jaGFuZ2UoaXRlbSwgb2xkSW5kZXgsIG5ld0luZGV4KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVtIGFzIFVcbiAgfVxuXG4gIHJlbW92ZSAoc3R5bGU6IFQpOiB2b2lkIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXVxuXG4gICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdID0gY291bnQgLSAxXG5cbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9jaGlsZHJlbltzdHlsZS5pZF1cbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fa2V5cy5pbmRleE9mKGl0ZW0uaWQpXG5cbiAgICAgIGlmIChjb3VudCA9PT0gMSkge1xuICAgICAgICBkZWxldGUgdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9jaGlsZHJlbltzdHlsZS5pZF1cblxuICAgICAgICB0aGlzLl9rZXlzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgdGhpcy5zaGVldC5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIHRoaXMuY2hhbmdlSWQrK1xuICAgICAgICB0aGlzLmNoYW5nZXMucmVtb3ZlKGl0ZW0sIGluZGV4KVxuICAgICAgfSBlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgQ2FjaGUgJiYgc3R5bGUgaW5zdGFuY2VvZiBDYWNoZSkge1xuICAgICAgICBjb25zdCBwcmV2Q2hhbmdlSWQgPSBpdGVtLmNoYW5nZUlkXG5cbiAgICAgICAgaXRlbS51bm1lcmdlKHN0eWxlKVxuXG4gICAgICAgIGlmIChpdGVtLmNoYW5nZUlkICE9PSBwcmV2Q2hhbmdlSWQpIHtcbiAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShpbmRleCwgMSwgaXRlbS5nZXRTdHlsZXMoKSlcbiAgICAgICAgICB0aGlzLmNoYW5nZUlkKytcbiAgICAgICAgICB0aGlzLmNoYW5nZXMuY2hhbmdlKGl0ZW0sIGluZGV4LCBpbmRleClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1lcmdlIChjYWNoZTogQ2FjaGU8YW55Pikge1xuICAgIGZvciAoY29uc3QgaWQgb2YgY2FjaGUuX2tleXMpIHRoaXMuYWRkKGNhY2hlLl9jaGlsZHJlbltpZF0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdW5tZXJnZSAoY2FjaGU6IENhY2hlPGFueT4pIHtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGNhY2hlLl9rZXlzKSB0aGlzLnJlbW92ZShjYWNoZS5fY2hpbGRyZW5baWRdKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICByZXR1cm4gbmV3IENhY2hlKHRoaXMuaGFzaCkubWVyZ2UodGhpcylcbiAgfVxuXG59XG5cbi8qKlxuICogU2VsZWN0b3IgaXMgYSBkdW1iIGNsYXNzIG1hZGUgdG8gcmVwcmVzZW50IG5lc3RlZCBDU1Mgc2VsZWN0b3JzLlxuICovXG5leHBvcnQgY2xhc3MgU2VsZWN0b3IgaW1wbGVtZW50cyBDb250YWluZXI8U2VsZWN0b3I+IHtcblxuICBjb25zdHJ1Y3RvciAoXG4gICAgcHVibGljIHNlbGVjdG9yOiBzdHJpbmcsXG4gICAgcHVibGljIGhhc2g6IEhhc2hGdW5jdGlvbixcbiAgICBwdWJsaWMgaWQgPSBgcyR7aGFzaChzZWxlY3Rvcil9YCxcbiAgICBwdWJsaWMgcGlkID0gJydcbiAgKSB7fVxuXG4gIGdldFN0eWxlcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0b3JcbiAgfVxuXG4gIGdldElkZW50aWZpZXIgKCkge1xuICAgIHJldHVybiBgJHt0aGlzLnBpZH0uJHt0aGlzLnNlbGVjdG9yfWBcbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICByZXR1cm4gbmV3IFNlbGVjdG9yKHRoaXMuc2VsZWN0b3IsIHRoaXMuaGFzaCwgdGhpcy5pZCwgdGhpcy5waWQpXG4gIH1cblxufVxuXG4vKipcbiAqIFRoZSBzdHlsZSBjb250YWluZXIgcmVnaXN0ZXJzIGEgc3R5bGUgc3RyaW5nIHdpdGggc2VsZWN0b3JzLlxuICovXG5leHBvcnQgY2xhc3MgU3R5bGUgZXh0ZW5kcyBDYWNoZTxTZWxlY3Rvcj4gaW1wbGVtZW50cyBDb250YWluZXI8U3R5bGU+IHtcblxuICBjb25zdHJ1Y3RvciAocHVibGljIHN0eWxlOiBzdHJpbmcsIHB1YmxpYyBoYXNoOiBIYXNoRnVuY3Rpb24sIHB1YmxpYyBpZCA9IGBjJHtoYXNoKHN0eWxlKX1gKSB7XG4gICAgc3VwZXIoaGFzaClcbiAgfVxuXG4gIGdldFN0eWxlcyAoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5zaGVldC5qb2luKCcsJyl9eyR7dGhpcy5zdHlsZX19YFxuICB9XG5cbiAgZ2V0SWRlbnRpZmllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3R5bGVcbiAgfVxuXG4gIGNsb25lICgpOiBTdHlsZSB7XG4gICAgcmV0dXJuIG5ldyBTdHlsZSh0aGlzLnN0eWxlLCB0aGlzLmhhc2gsIHRoaXMuaWQpLm1lcmdlKHRoaXMpXG4gIH1cblxufVxuXG4vKipcbiAqIEltcGxlbWVudCBydWxlIGxvZ2ljIGZvciBzdHlsZSBvdXRwdXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBSdWxlIGV4dGVuZHMgQ2FjaGU8UnVsZSB8IFN0eWxlPiBpbXBsZW1lbnRzIENvbnRhaW5lcjxSdWxlPiB7XG5cbiAgY29uc3RydWN0b3IgKFxuICAgIHB1YmxpYyBydWxlOiBzdHJpbmcsXG4gICAgcHVibGljIHN0eWxlID0gJycsXG4gICAgcHVibGljIGhhc2g6IEhhc2hGdW5jdGlvbixcbiAgICBwdWJsaWMgaWQgPSBgYSR7aGFzaChgJHtydWxlfS4ke3N0eWxlfWApfWAsXG4gICAgcHVibGljIHBpZCA9ICcnXG4gICkge1xuICAgIHN1cGVyKGhhc2gpXG4gIH1cblxuICBnZXRTdHlsZXMgKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMucnVsZX17JHt0aGlzLnN0eWxlfSR7am9pbih0aGlzLnNoZWV0KX19YFxuICB9XG5cbiAgZ2V0SWRlbnRpZmllciAoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucGlkfS4ke3RoaXMucnVsZX0uJHt0aGlzLnN0eWxlfWBcbiAgfVxuXG4gIGNsb25lICgpOiBSdWxlIHtcbiAgICByZXR1cm4gbmV3IFJ1bGUodGhpcy5ydWxlLCB0aGlzLnN0eWxlLCB0aGlzLmhhc2gsIHRoaXMuaWQsIHRoaXMucGlkKS5tZXJnZSh0aGlzKVxuICB9XG5cbn1cblxuLyoqXG4gKiBUaGUgRnJlZVN0eWxlIGNsYXNzIGltcGxlbWVudHMgdGhlIEFQSSBmb3IgZXZlcnl0aGluZyBlbHNlLlxuICovXG5leHBvcnQgY2xhc3MgRnJlZVN0eWxlIGV4dGVuZHMgQ2FjaGU8UnVsZSB8IFN0eWxlPiBpbXBsZW1lbnRzIENvbnRhaW5lcjxGcmVlU3R5bGU+IHtcblxuICBjb25zdHJ1Y3RvciAoXG4gICAgcHVibGljIGhhc2ggPSBzdHJpbmdIYXNoLFxuICAgIHB1YmxpYyBkZWJ1ZyA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudlsnTk9ERV9FTlYnXSAhPT0gJ3Byb2R1Y3Rpb24nLFxuICAgIHB1YmxpYyBpZCA9IGBmJHsoKyt1bmlxdWVJZCkudG9TdHJpbmcoMzYpfWAsXG4gICAgY2hhbmdlcz86IENoYW5nZXNcbiAgKSB7XG4gICAgc3VwZXIoaGFzaCwgY2hhbmdlcylcbiAgfVxuXG4gIHJlZ2lzdGVyU3R5bGUgKHN0eWxlczogU3R5bGVzLCBkaXNwbGF5TmFtZT86IHN0cmluZykge1xuICAgIGNvbnN0IGRlYnVnTmFtZSA9IHRoaXMuZGVidWcgPyBkaXNwbGF5TmFtZSA6IHVuZGVmaW5lZFxuICAgIGNvbnN0IHsgY2FjaGUsIGlkIH0gPSBjb21wb3NlU3R5bGVzKHRoaXMsICcmJywgc3R5bGVzLCB0cnVlLCBkZWJ1Z05hbWUpXG4gICAgdGhpcy5tZXJnZShjYWNoZSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIHJlZ2lzdGVyS2V5ZnJhbWVzIChrZXlmcmFtZXM6IFN0eWxlcywgZGlzcGxheU5hbWU/OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3Rlckhhc2hSdWxlKCdAa2V5ZnJhbWVzJywga2V5ZnJhbWVzLCBkaXNwbGF5TmFtZSlcbiAgfVxuXG4gIHJlZ2lzdGVySGFzaFJ1bGUgKHByZWZpeDogc3RyaW5nLCBzdHlsZXM6IFN0eWxlcywgZGlzcGxheU5hbWU/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZWJ1Z05hbWUgPSB0aGlzLmRlYnVnID8gZGlzcGxheU5hbWUgOiB1bmRlZmluZWRcbiAgICBjb25zdCB7IGNhY2hlLCBwaWQsIGlkIH0gPSBjb21wb3NlU3R5bGVzKHRoaXMsICcnLCBzdHlsZXMsIGZhbHNlLCBkZWJ1Z05hbWUpXG4gICAgY29uc3QgcnVsZSA9IG5ldyBSdWxlKGAke3ByZWZpeH0gJHtlc2NhcGUoaWQpfWAsIHVuZGVmaW5lZCwgdGhpcy5oYXNoLCB1bmRlZmluZWQsIHBpZClcbiAgICB0aGlzLmFkZChydWxlLm1lcmdlKGNhY2hlKSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIHJlZ2lzdGVyUnVsZSAocnVsZTogc3RyaW5nLCBzdHlsZXM6IFN0eWxlcykge1xuICAgIHRoaXMubWVyZ2UoY29tcG9zZVN0eWxlcyh0aGlzLCBydWxlLCBzdHlsZXMsIGZhbHNlKS5jYWNoZSlcbiAgfVxuXG4gIHJlZ2lzdGVyQ3NzIChzdHlsZXM6IFN0eWxlcykge1xuICAgIHRoaXMubWVyZ2UoY29tcG9zZVN0eWxlcyh0aGlzLCAnJywgc3R5bGVzLCBmYWxzZSkuY2FjaGUpXG4gIH1cblxuICBnZXRTdHlsZXMgKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGpvaW4odGhpcy5zaGVldClcbiAgfVxuXG4gIGdldElkZW50aWZpZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmlkXG4gIH1cblxuICBjbG9uZSAoKTogRnJlZVN0eWxlIHtcbiAgICByZXR1cm4gbmV3IEZyZWVTdHlsZSh0aGlzLmhhc2gsIHRoaXMuZGVidWcsIHRoaXMuaWQsIHRoaXMuY2hhbmdlcykubWVyZ2UodGhpcylcbiAgfVxuXG59XG5cbi8qKlxuICogRXhwb3J0cyBhIHNpbXBsZSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUgKGhhc2g/OiBIYXNoRnVuY3Rpb24sIGRlYnVnPzogYm9vbGVhbiwgY2hhbmdlcz86IENoYW5nZXMpIHtcbiAgcmV0dXJuIG5ldyBGcmVlU3R5bGUoaGFzaCwgZGVidWcsIHVuZGVmaW5lZCwgY2hhbmdlcylcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJpbXBvcnQgeyBUeXBlU3R5bGUgfSBmcm9tICcuL2ludGVybmFsL3R5cGVzdHlsZSc7XHJcbmV4cG9ydCB7IFR5cGVTdHlsZSB9O1xyXG4vKipcclxuICogQWxsIHRoZSBDU1MgdHlwZXMgaW4gdGhlICd0eXBlcycgbmFtZXNwYWNlXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyB0eXBlcyBmcm9tICcuL3R5cGVzJztcclxuZXhwb3J0IHsgdHlwZXMgfTtcclxuLyoqXHJcbiAqIEV4cG9ydCBjZXJ0YWluIHV0aWxpdGllc1xyXG4gKi9cclxuZXhwb3J0IHsgZXh0ZW5kLCBjbGFzc2VzLCBtZWRpYSB9IGZyb20gJy4vaW50ZXJuYWwvdXRpbGl0aWVzJztcclxuLyoqIFplcm8gY29uZmlndXJhdGlvbiwgZGVmYXVsdCBpbnN0YW5jZSBvZiBUeXBlU3R5bGUgKi9cclxudmFyIHRzID0gbmV3IFR5cGVTdHlsZSh7IGF1dG9HZW5lcmF0ZVRhZzogdHJ1ZSB9KTtcclxuLyoqIFNldHMgdGhlIHRhcmdldCB0YWcgd2hlcmUgd2Ugd3JpdGUgdGhlIGNzcyBvbiBzdHlsZSB1cGRhdGVzICovXHJcbmV4cG9ydCB2YXIgc2V0U3R5bGVzVGFyZ2V0ID0gdHMuc2V0U3R5bGVzVGFyZ2V0O1xyXG4vKipcclxuICogSW5zZXJ0IGByYXdgIENTUyBhcyBhIHN0cmluZy4gVGhpcyBpcyB1c2VmdWwgZm9yIGUuZy5cclxuICogLSB0aGlyZCBwYXJ0eSBDU1MgdGhhdCB5b3UgYXJlIGN1c3RvbWl6aW5nIHdpdGggdGVtcGxhdGUgc3RyaW5nc1xyXG4gKiAtIGdlbmVyYXRpbmcgcmF3IENTUyBpbiBKYXZhU2NyaXB0XHJcbiAqIC0gcmVzZXQgbGlicmFyaWVzIGxpa2Ugbm9ybWFsaXplLmNzcyB0aGF0IHlvdSBjYW4gdXNlIHdpdGhvdXQgbG9hZGVyc1xyXG4gKi9cclxuZXhwb3J0IHZhciBjc3NSYXcgPSB0cy5jc3NSYXc7XHJcbi8qKlxyXG4gKiBUYWtlcyBDU1NQcm9wZXJ0aWVzIGFuZCByZWdpc3RlcnMgaXQgdG8gYSBnbG9iYWwgc2VsZWN0b3IgKGJvZHksIGh0bWwsIGV0Yy4pXHJcbiAqL1xyXG5leHBvcnQgdmFyIGNzc1J1bGUgPSB0cy5jc3NSdWxlO1xyXG4vKipcclxuICogUmVuZGVycyBzdHlsZXMgdG8gdGhlIHNpbmdsZXRvbiB0YWcgaW1lZGlhdGVseVxyXG4gKiBOT1RFOiBZb3Ugc2hvdWxkIG9ubHkgY2FsbCBpdCBvbiBpbml0aWFsIHJlbmRlciB0byBwcmV2ZW50IGFueSBub24gQ1NTIGZsYXNoLlxyXG4gKiBBZnRlciB0aGF0IGl0IGlzIGtlcHQgc3luYyB1c2luZyBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBhbmQgd2UgaGF2ZW4ndCBub3RpY2VkIGFueSBiYWQgZmxhc2hlcy5cclxuICoqL1xyXG5leHBvcnQgdmFyIGZvcmNlUmVuZGVyU3R5bGVzID0gdHMuZm9yY2VSZW5kZXJTdHlsZXM7XHJcbi8qKlxyXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIGFuIEBmb250LWZhY2VcclxuICovXHJcbmV4cG9ydCB2YXIgZm9udEZhY2UgPSB0cy5mb250RmFjZTtcclxuLyoqXHJcbiAqIEFsbG93cyB1c2UgdG8gdXNlIHRoZSBzdHlsZXNoZWV0IGluIGEgbm9kZS5qcyBlbnZpcm9ubWVudFxyXG4gKi9cclxuZXhwb3J0IHZhciBnZXRTdHlsZXMgPSB0cy5nZXRTdHlsZXM7XHJcbi8qKlxyXG4gKiBUYWtlcyBrZXlmcmFtZXMgYW5kIHJldHVybnMgYSBnZW5lcmF0ZWQgYW5pbWF0aW9uTmFtZVxyXG4gKi9cclxuZXhwb3J0IHZhciBrZXlmcmFtZXMgPSB0cy5rZXlmcmFtZXM7XHJcbi8qKlxyXG4gKiBIZWxwcyB3aXRoIHRlc3RpbmcuIFJlaW5pdGlhbGl6ZXMgRnJlZVN0eWxlICsgcmF3XHJcbiAqL1xyXG5leHBvcnQgdmFyIHJlaW5pdCA9IHRzLnJlaW5pdDtcclxuLyoqXHJcbiAqIFRha2VzIENTU1Byb3BlcnRpZXMgYW5kIHJldHVybiBhIGdlbmVyYXRlZCBjbGFzc05hbWUgeW91IGNhbiB1c2Ugb24geW91ciBjb21wb25lbnRcclxuICovXHJcbmV4cG9ydCB2YXIgc3R5bGUgPSB0cy5zdHlsZTtcclxuLyoqXHJcbiAqIFRha2VzIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHByb3BlcnR5IHZhbHVlcyBhcmUgQ1NTUHJvcGVydGllcywgYW5kXHJcbiAqIHJldHVybnMgYW4gb2JqZWN0IHdoZXJlIHByb3BlcnR5IG5hbWVzIGFyZSB0aGUgc2FtZSBpZGVhbCBjbGFzcyBuYW1lcyBhbmQgdGhlIHByb3BlcnR5IHZhbHVlcyBhcmVcclxuICogdGhlIGFjdHVhbCBnZW5lcmF0ZWQgY2xhc3MgbmFtZXMgdXNpbmcgdGhlIGlkZWFsIGNsYXNzIG5hbWUgYXMgdGhlICRkZWJ1Z05hbWVcclxuICovXHJcbmV4cG9ydCB2YXIgc3R5bGVzaGVldCA9IHRzLnN0eWxlc2hlZXQ7XHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIFR5cGVTdHlsZSBzZXBhcmF0ZSBmcm9tIHRoZSBkZWZhdWx0IGluc3RhbmNlLlxyXG4gKlxyXG4gKiAtIFVzZSB0aGlzIGZvciBjcmVhdGluZyBhIGRpZmZlcmVudCB0eXBlc3R5bGUgaW5zdGFuY2UgZm9yIGEgc2hhZG93IGRvbSBjb21wb25lbnQuXHJcbiAqIC0gVXNlIHRoaXMgaWYgeW91IGRvbid0IHdhbnQgYW4gYXV0byB0YWcgZ2VuZXJhdGVkIGFuZCB5b3UganVzdCB3YW50IHRvIGNvbGxlY3QgdGhlIENTUy5cclxuICpcclxuICogTk9URTogc3R5bGVzIGFyZW4ndCBzaGFyZWQgYmV0d2VlbiBkaWZmZXJlbnQgaW5zdGFuY2VzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVR5cGVTdHlsZSh0YXJnZXQpIHtcclxuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBUeXBlU3R5bGUoeyBhdXRvR2VuZXJhdGVUYWc6IGZhbHNlIH0pO1xyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIGluc3RhbmNlLnNldFN0eWxlc1RhcmdldCh0YXJnZXQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluc3RhbmNlO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIEZyZWVTdHlsZSBmcm9tICdmcmVlLXN0eWxlJztcclxuLyoqXHJcbiAqIFdlIG5lZWQgdG8gZG8gdGhlIGZvbGxvd2luZyB0byAqb3VyKiBvYmplY3RzIGJlZm9yZSBwYXNzaW5nIHRvIGZyZWVzdHlsZTpcclxuICogLSBGb3IgYW55IGAkbmVzdGAgZGlyZWN0aXZlIG1vdmUgdXAgdG8gRnJlZVN0eWxlIHN0eWxlIG5lc3RpbmdcclxuICogLSBGb3IgYW55IGAkdW5pcXVlYCBkaXJlY3RpdmUgbWFwIHRvIEZyZWVTdHlsZSBVbmlxdWVcclxuICogLSBGb3IgYW55IGAkZGVidWdOYW1lYCBkaXJlY3RpdmUgcmV0dXJuIHRoZSBkZWJ1ZyBuYW1lXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlU3RyaW5nT2JqKG9iamVjdCkge1xyXG4gICAgLyoqIFRoZSBmaW5hbCByZXN1bHQgd2Ugd2lsbCByZXR1cm4gKi9cclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIHZhciBkZWJ1Z05hbWUgPSAnJztcclxuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcclxuICAgICAgICAvKiogR3JhYiB0aGUgdmFsdWUgdXBmcm9udCAqL1xyXG4gICAgICAgIHZhciB2YWwgPSBvYmplY3Rba2V5XTtcclxuICAgICAgICAvKiogVHlwZVN0eWxlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyAqL1xyXG4gICAgICAgIGlmIChrZXkgPT09ICckdW5pcXVlJykge1xyXG4gICAgICAgICAgICByZXN1bHRbRnJlZVN0eWxlLklTX1VOSVFVRV0gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJyRuZXN0Jykge1xyXG4gICAgICAgICAgICB2YXIgbmVzdGVkID0gdmFsO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RvciBpbiBuZXN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdWJwcm9wZXJ0aWVzID0gbmVzdGVkW3NlbGVjdG9yXTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtzZWxlY3Rvcl0gPSBlbnN1cmVTdHJpbmdPYmooc3VicHJvcGVydGllcykucmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJyRkZWJ1Z05hbWUnKSB7XHJcbiAgICAgICAgICAgIGRlYnVnTmFtZSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7IHJlc3VsdDogcmVzdWx0LCBkZWJ1Z05hbWU6IGRlYnVnTmFtZSB9O1xyXG59XHJcbi8vIHRvZG86IGJldHRlciBuYW1lIGhlcmVcclxuZXhwb3J0IGZ1bmN0aW9uIGV4cGxvZGVLZXlmcmFtZXMoZnJhbWVzKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0geyAkZGVidWdOYW1lOiB1bmRlZmluZWQsIGtleWZyYW1lczoge30gfTtcclxuICAgIGZvciAodmFyIG9mZnNldCBpbiBmcmFtZXMpIHtcclxuICAgICAgICB2YXIgdmFsID0gZnJhbWVzW29mZnNldF07XHJcbiAgICAgICAgaWYgKG9mZnNldCA9PT0gJyRkZWJ1Z05hbWUnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC4kZGVidWdOYW1lID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0LmtleWZyYW1lc1tvZmZzZXRdID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgRnJlZVN0eWxlIGZyb20gXCJmcmVlLXN0eWxlXCI7XHJcbmltcG9ydCB7IGVuc3VyZVN0cmluZ09iaiwgZXhwbG9kZUtleWZyYW1lcyB9IGZyb20gJy4vZm9ybWF0dGluZyc7XHJcbmltcG9ydCB7IGV4dGVuZCwgcmFmIH0gZnJvbSAnLi91dGlsaXRpZXMnO1xyXG4vKipcclxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBmcmVlIHN0eWxlIHdpdGggb3VyIG9wdGlvbnNcclxuICovXHJcbnZhciBjcmVhdGVGcmVlU3R5bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBGcmVlU3R5bGUuY3JlYXRlKFxyXG4vKiogVXNlIHRoZSBkZWZhdWx0IGhhc2ggZnVuY3Rpb24gKi9cclxudW5kZWZpbmVkLCBcclxuLyoqIFByZXNlcnZlICRkZWJ1Z05hbWUgdmFsdWVzICovXHJcbnRydWUpOyB9O1xyXG4vKipcclxuICogTWFpbnRhaW5zIGEgc2luZ2xlIHN0eWxlc2hlZXQgYW5kIGtlZXBzIGl0IGluIHN5bmMgd2l0aCByZXF1ZXN0ZWQgc3R5bGVzXHJcbiAqL1xyXG52YXIgVHlwZVN0eWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVHlwZVN0eWxlKF9hKSB7XHJcbiAgICAgICAgdmFyIGF1dG9HZW5lcmF0ZVRhZyA9IF9hLmF1dG9HZW5lcmF0ZVRhZztcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluc2VydCBgcmF3YCBDU1MgYXMgYSBzdHJpbmcuIFRoaXMgaXMgdXNlZnVsIGZvciBlLmcuXHJcbiAgICAgICAgICogLSB0aGlyZCBwYXJ0eSBDU1MgdGhhdCB5b3UgYXJlIGN1c3RvbWl6aW5nIHdpdGggdGVtcGxhdGUgc3RyaW5nc1xyXG4gICAgICAgICAqIC0gZ2VuZXJhdGluZyByYXcgQ1NTIGluIEphdmFTY3JpcHRcclxuICAgICAgICAgKiAtIHJlc2V0IGxpYnJhcmllcyBsaWtlIG5vcm1hbGl6ZS5jc3MgdGhhdCB5b3UgY2FuIHVzZSB3aXRob3V0IGxvYWRlcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNzc1JhdyA9IGZ1bmN0aW9uIChtdXN0QmVWYWxpZENTUykge1xyXG4gICAgICAgICAgICBpZiAoIW11c3RCZVZhbGlkQ1NTKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX3JhdyArPSBtdXN0QmVWYWxpZENTUyB8fCAnJztcclxuICAgICAgICAgICAgX3RoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUYWtlcyBDU1NQcm9wZXJ0aWVzIGFuZCByZWdpc3RlcnMgaXQgdG8gYSBnbG9iYWwgc2VsZWN0b3IgKGJvZHksIGh0bWwsIGV0Yy4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jc3NSdWxlID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciBvYmplY3RzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBvYmplY3RzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSBlbnN1cmVTdHJpbmdPYmooZXh0ZW5kLmFwcGx5KHZvaWQgMCwgb2JqZWN0cykpLnJlc3VsdDtcclxuICAgICAgICAgICAgX3RoaXMuX2ZyZWVTdHlsZS5yZWdpc3RlclJ1bGUoc2VsZWN0b3IsIG9iamVjdCk7XHJcbiAgICAgICAgICAgIF90aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVuZGVycyBzdHlsZXMgdG8gdGhlIHNpbmdsZXRvbiB0YWcgaW1lZGlhdGVseVxyXG4gICAgICAgICAqIE5PVEU6IFlvdSBzaG91bGQgb25seSBjYWxsIGl0IG9uIGluaXRpYWwgcmVuZGVyIHRvIHByZXZlbnQgYW55IG5vbiBDU1MgZmxhc2guXHJcbiAgICAgICAgICogQWZ0ZXIgdGhhdCBpdCBpcyBrZXB0IHN5bmMgdXNpbmcgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgYW5kIHdlIGhhdmVuJ3Qgbm90aWNlZCBhbnkgYmFkIGZsYXNoZXMuXHJcbiAgICAgICAgICoqL1xyXG4gICAgICAgIHRoaXMuZm9yY2VSZW5kZXJTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBfdGhpcy5fZ2V0VGFnKCk7XHJcbiAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gX3RoaXMuZ2V0U3R5bGVzKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIGFuIEBmb250LWZhY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmZvbnRGYWNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZm9udEZhY2UgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIGZvbnRGYWNlW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGZyZWVTdHlsZSA9IF90aGlzLl9mcmVlU3R5bGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9hID0gMCwgX2IgPSBmb250RmFjZTsgX2EgPCBfYi5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBmYWNlID0gX2JbX2FdO1xyXG4gICAgICAgICAgICAgICAgZnJlZVN0eWxlLnJlZ2lzdGVyUnVsZSgnQGZvbnQtZmFjZScsIGZhY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsb3dzIHVzZSB0byB1c2UgdGhlIHN0eWxlc2hlZXQgaW4gYSBub2RlLmpzIGVudmlyb25tZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5nZXRTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoX3RoaXMuX3JhdyB8fCAnJykgKyBfdGhpcy5fZnJlZVN0eWxlLmdldFN0eWxlcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMga2V5ZnJhbWVzIGFuZCByZXR1cm5zIGEgZ2VuZXJhdGVkIGFuaW1hdGlvbk5hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmtleWZyYW1lcyA9IGZ1bmN0aW9uIChmcmFtZXMpIHtcclxuICAgICAgICAgICAgdmFyIF9hID0gZXhwbG9kZUtleWZyYW1lcyhmcmFtZXMpLCBrZXlmcmFtZXMgPSBfYS5rZXlmcmFtZXMsICRkZWJ1Z05hbWUgPSBfYS4kZGVidWdOYW1lO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiByZXBsYWNlICRkZWJ1Z05hbWUgd2l0aCBkaXNwbGF5IG5hbWVcclxuICAgICAgICAgICAgdmFyIGFuaW1hdGlvbk5hbWUgPSBfdGhpcy5fZnJlZVN0eWxlLnJlZ2lzdGVyS2V5ZnJhbWVzKGtleWZyYW1lcywgJGRlYnVnTmFtZSk7XHJcbiAgICAgICAgICAgIF90aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbk5hbWU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIZWxwcyB3aXRoIHRlc3RpbmcuIFJlaW5pdGlhbGl6ZXMgRnJlZVN0eWxlICsgcmF3XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWluaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8qKiByZWluaXQgZnJlZXN0eWxlICovXHJcbiAgICAgICAgICAgIHZhciBmcmVlU3R5bGUgPSBjcmVhdGVGcmVlU3R5bGUoKTtcclxuICAgICAgICAgICAgX3RoaXMuX2ZyZWVTdHlsZSA9IGZyZWVTdHlsZTtcclxuICAgICAgICAgICAgX3RoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZCA9IGZyZWVTdHlsZS5jaGFuZ2VJZDtcclxuICAgICAgICAgICAgLyoqIHJlaW5pdCByYXcgKi9cclxuICAgICAgICAgICAgX3RoaXMuX3JhdyA9ICcnO1xyXG4gICAgICAgICAgICBfdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvKiogQ2xlYXIgYW55IHN0eWxlcyB0aGF0IHdlcmUgZmx1c2hlZCAqL1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gX3RoaXMuX2dldFRhZygpO1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqIFNldHMgdGhlIHRhcmdldCB0YWcgd2hlcmUgd2Ugd3JpdGUgdGhlIGNzcyBvbiBzdHlsZSB1cGRhdGVzICovXHJcbiAgICAgICAgdGhpcy5zZXRTdHlsZXNUYXJnZXQgPSBmdW5jdGlvbiAodGFnKSB7XHJcbiAgICAgICAgICAgIC8qKiBDbGVhciBhbnkgZGF0YSBpbiBhbnkgcHJldmlvdXMgdGFnICovXHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5fdGFnKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5fdGFnLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX3RhZyA9IHRhZztcclxuICAgICAgICAgICAgLyoqIFRoaXMgc3BlY2lhbCB0aW1lIGJ1ZmZlciBpbW1lZGlhdGVseSAqL1xyXG4gICAgICAgICAgICBfdGhpcy5mb3JjZVJlbmRlclN0eWxlcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMgYW4gb2JqZWN0IHdoZXJlIHByb3BlcnR5IG5hbWVzIGFyZSBpZGVhbCBjbGFzcyBuYW1lcyBhbmQgcHJvcGVydHkgdmFsdWVzIGFyZSBDU1NQcm9wZXJ0aWVzLCBhbmRcclxuICAgICAgICAgKiByZXR1cm5zIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgdGhlIHNhbWUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHRoZSBwcm9wZXJ0eSB2YWx1ZXMgYXJlXHJcbiAgICAgICAgICogdGhlIGFjdHVhbCBnZW5lcmF0ZWQgY2xhc3MgbmFtZXMgdXNpbmcgdGhlIGlkZWFsIGNsYXNzIG5hbWUgYXMgdGhlICRkZWJ1Z05hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnN0eWxlc2hlZXQgPSBmdW5jdGlvbiAoY2xhc3Nlcykge1xyXG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGNsYXNzZXMpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgY2xhc3NOYW1lc18xID0gY2xhc3NOYW1lczsgX2kgPCBjbGFzc05hbWVzXzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NOYW1lc18xW19pXTtcclxuICAgICAgICAgICAgICAgIHZhciBjbGFzc0RlZiA9IGNsYXNzZXNbY2xhc3NOYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChjbGFzc0RlZikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzRGVmLiRkZWJ1Z05hbWUgPSBjbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NsYXNzTmFtZV0gPSBfdGhpcy5zdHlsZShjbGFzc0RlZik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBmcmVlU3R5bGUgPSBjcmVhdGVGcmVlU3R5bGUoKTtcclxuICAgICAgICB0aGlzLl9hdXRvR2VuZXJhdGVUYWcgPSBhdXRvR2VuZXJhdGVUYWc7XHJcbiAgICAgICAgdGhpcy5fZnJlZVN0eWxlID0gZnJlZVN0eWxlO1xyXG4gICAgICAgIHRoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZCA9IGZyZWVTdHlsZS5jaGFuZ2VJZDtcclxuICAgICAgICB0aGlzLl9wZW5kaW5nID0gMDtcclxuICAgICAgICB0aGlzLl9wZW5kaW5nUmF3Q2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcmF3ID0gJyc7XHJcbiAgICAgICAgdGhpcy5fdGFnID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIC8vIHJlYmluZCBwcm90b3R5cGUgdG8gVHlwZVN0eWxlLiAgSXQgbWlnaHQgYmUgYmV0dGVyIHRvIGRvIGEgZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLnN0eWxlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyl9XHJcbiAgICAgICAgdGhpcy5zdHlsZSA9IHRoaXMuc3R5bGUuYmluZCh0aGlzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogT25seSBjYWxscyBjYiBhbGwgc3luYyBvcGVyYXRpb25zIHNldHRsZVxyXG4gICAgICovXHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLl9hZnRlckFsbFN5bmMgPSBmdW5jdGlvbiAoY2IpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmcrKztcclxuICAgICAgICB2YXIgcGVuZGluZyA9IHRoaXMuX3BlbmRpbmc7XHJcbiAgICAgICAgcmFmKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBlbmRpbmcgIT09IF90aGlzLl9wZW5kaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLl9nZXRUYWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3RhZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGFnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fYXV0b0dlbmVyYXRlVGFnKSB7XHJcbiAgICAgICAgICAgIHZhciB0YWcgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xyXG4gICAgICAgICAgICAgICAgPyB7IHRleHRDb250ZW50OiAnJyB9XHJcbiAgICAgICAgICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRhZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdGFnID0gdGFnO1xyXG4gICAgICAgICAgICByZXR1cm4gdGFnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuICAgIC8qKiBDaGVja3MgaWYgdGhlIHN0eWxlIHRhZyBuZWVkcyB1cGRhdGluZyBhbmQgaWYgc28gcXVldWVzIHVwIHRoZSBjaGFuZ2UgKi9cclxuICAgIFR5cGVTdHlsZS5wcm90b3R5cGUuX3N0eWxlVXBkYXRlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBjaGFuZ2VJZCA9IHRoaXMuX2ZyZWVTdHlsZS5jaGFuZ2VJZDtcclxuICAgICAgICB2YXIgbGFzdENoYW5nZUlkID0gdGhpcy5fbGFzdEZyZWVTdHlsZUNoYW5nZUlkO1xyXG4gICAgICAgIGlmICghdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSAmJiBjaGFuZ2VJZCA9PT0gbGFzdENoYW5nZUlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGFzdEZyZWVTdHlsZUNoYW5nZUlkID0gY2hhbmdlSWQ7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2FmdGVyQWxsU3luYyhmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy5mb3JjZVJlbmRlclN0eWxlcygpOyB9KTtcclxuICAgIH07XHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLnN0eWxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBmcmVlU3R5bGUgPSB0aGlzLl9mcmVlU3R5bGU7XHJcbiAgICAgICAgdmFyIF9hID0gZW5zdXJlU3RyaW5nT2JqKGV4dGVuZC5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpLCByZXN1bHQgPSBfYS5yZXN1bHQsIGRlYnVnTmFtZSA9IF9hLmRlYnVnTmFtZTtcclxuICAgICAgICB2YXIgY2xhc3NOYW1lID0gZGVidWdOYW1lID8gZnJlZVN0eWxlLnJlZ2lzdGVyU3R5bGUocmVzdWx0LCBkZWJ1Z05hbWUpIDogZnJlZVN0eWxlLnJlZ2lzdGVyU3R5bGUocmVzdWx0KTtcclxuICAgICAgICB0aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICByZXR1cm4gY2xhc3NOYW1lO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUeXBlU3R5bGU7XHJcbn0oKSk7XHJcbmV4cG9ydCB7IFR5cGVTdHlsZSB9O1xyXG4iLCIvKiogUmFmIGZvciBub2RlICsgYnJvd3NlciAqL1xyXG5leHBvcnQgdmFyIHJhZiA9IHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICd1bmRlZmluZWQnXHJcbiAgICAvKipcclxuICAgICAqIE1ha2Ugc3VyZSBzZXRUaW1lb3V0IGlzIGFsd2F5cyBpbnZva2VkIHdpdGhcclxuICAgICAqIGB0aGlzYCBzZXQgdG8gYHdpbmRvd2Agb3IgYGdsb2JhbGAgYXV0b21hdGljYWxseVxyXG4gICAgICoqL1xyXG4gICAgPyBmdW5jdGlvbiAoY2IpIHsgcmV0dXJuIHNldFRpbWVvdXQoY2IpOyB9XHJcbiAgICAvKipcclxuICAgICAqIE1ha2Ugc3VyZSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIGFsd2F5cyBpbnZva2VkIHdpdGggYHRoaXNgIHdpbmRvd1xyXG4gICAgICogV2UgbWlnaHQgaGF2ZSByYWYgd2l0aG91dCB3aW5kb3cgaW4gY2FzZSBvZiBgcmFmL3BvbHlmaWxsYCAocmVjb21tZW5kZWQgYnkgUmVhY3QpXHJcbiAgICAgKiovXHJcbiAgICA6IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnXHJcbiAgICAgICAgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcclxuICAgICAgICA6IHJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdyk7XHJcbi8qKlxyXG4gKiBVdGlsaXR5IHRvIGpvaW4gY2xhc3NlcyBjb25kaXRpb25hbGx5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NlcygpIHtcclxuICAgIHZhciBjbGFzc2VzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIGNsYXNzZXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIHJldHVybiBjbGFzc2VzLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gISFjOyB9KS5qb2luKCcgJyk7XHJcbn1cclxuLyoqXHJcbiAqIE1lcmdlcyB2YXJpb3VzIHN0eWxlcyBpbnRvIGEgc2luZ2xlIHN0eWxlIG9iamVjdC5cclxuICogTm90ZTogaWYgdHdvIG9iamVjdHMgaGF2ZSB0aGUgc2FtZSBwcm9wZXJ0eSB0aGUgbGFzdCBvbmUgd2luc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCgpIHtcclxuICAgIHZhciBvYmplY3RzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIG9iamVjdHNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIC8qKiBUaGUgZmluYWwgcmVzdWx0IHdlIHdpbGwgcmV0dXJuICovXHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBmb3IgKHZhciBfYSA9IDAsIG9iamVjdHNfMSA9IG9iamVjdHM7IF9hIDwgb2JqZWN0c18xLmxlbmd0aDsgX2ErKykge1xyXG4gICAgICAgIHZhciBvYmplY3QgPSBvYmplY3RzXzFbX2FdO1xyXG4gICAgICAgIGlmIChvYmplY3QgPT0gbnVsbCB8fCBvYmplY3QgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgICAgIC8qKiBGYWxzeSB2YWx1ZXMgZXhjZXB0IGEgZXhwbGljaXQgMCBpcyBpZ25vcmVkICovXHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBvYmplY3Rba2V5XTtcclxuICAgICAgICAgICAgaWYgKCF2YWwgJiYgdmFsICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiogaWYgbmVzdGVkIG1lZGlhIG9yIHBzZXVkbyBzZWxlY3RvciAqL1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnJG5lc3QnICYmIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSByZXN1bHRbJyRuZXN0J10gPyBleHRlbmQocmVzdWx0WyckbmVzdCddLCB2YWwpIDogdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKChrZXkuaW5kZXhPZignJicpICE9PSAtMSB8fCBrZXkuaW5kZXhPZignQG1lZGlhJykgPT09IDApKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHJlc3VsdFtrZXldID8gZXh0ZW5kKHJlc3VsdFtrZXldLCB2YWwpIDogdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qKlxyXG4gKiBVdGlsaXR5IHRvIGhlbHAgY3VzdG9taXplIHN0eWxlcyB3aXRoIG1lZGlhIHF1ZXJpZXMuIGUuZy5cclxuICogYGBgXHJcbiAqIHN0eWxlKFxyXG4gKiAgbWVkaWEoe21heFdpZHRoOjUwMH0sIHtjb2xvcjoncmVkJ30pXHJcbiAqIClcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgdmFyIG1lZGlhID0gZnVuY3Rpb24gKG1lZGlhUXVlcnkpIHtcclxuICAgIHZhciBvYmplY3RzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIG9iamVjdHNbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICB2YXIgbWVkaWFRdWVyeVNlY3Rpb25zID0gW107XHJcbiAgICBpZiAobWVkaWFRdWVyeS50eXBlKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKG1lZGlhUXVlcnkudHlwZSk7XHJcbiAgICBpZiAobWVkaWFRdWVyeS5vcmllbnRhdGlvbilcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihvcmllbnRhdGlvbjogXCIgKyBtZWRpYVF1ZXJ5Lm9yaWVudGF0aW9uICsgXCIpXCIpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkubWluV2lkdGgpXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIobWluLXdpZHRoOiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWluV2lkdGgpICsgXCIpXCIpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkubWF4V2lkdGgpXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIobWF4LXdpZHRoOiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWF4V2lkdGgpICsgXCIpXCIpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkubWluSGVpZ2h0KVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1pbi1oZWlnaHQ6IFwiICsgbWVkaWFMZW5ndGgobWVkaWFRdWVyeS5taW5IZWlnaHQpICsgXCIpXCIpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkubWF4SGVpZ2h0KVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1heC1oZWlnaHQ6IFwiICsgbWVkaWFMZW5ndGgobWVkaWFRdWVyeS5tYXhIZWlnaHQpICsgXCIpXCIpO1xyXG4gICAgdmFyIHN0cmluZ01lZGlhUXVlcnkgPSBcIkBtZWRpYSBcIiArIG1lZGlhUXVlcnlTZWN0aW9ucy5qb2luKCcgYW5kICcpO1xyXG4gICAgdmFyIG9iamVjdCA9IHtcclxuICAgICAgICAkbmVzdDogKF9hID0ge30sXHJcbiAgICAgICAgICAgIF9hW3N0cmluZ01lZGlhUXVlcnldID0gZXh0ZW5kLmFwcGx5KHZvaWQgMCwgb2JqZWN0cyksXHJcbiAgICAgICAgICAgIF9hKVxyXG4gICAgfTtcclxuICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICB2YXIgX2E7XHJcbn07XHJcbnZhciBtZWRpYUxlbmd0aCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IHZhbHVlICsgXCJweFwiO1xyXG59O1xyXG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyAgQ29tbW9uLnRzeCAtIEdidGNcclxuLy9cclxuLy8gIENvcHlyaWdodCDCqSAyMDE4LCBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UuICBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4vL1xyXG4vLyAgTGljZW5zZWQgdG8gdGhlIEdyaWQgUHJvdGVjdGlvbiBBbGxpYW5jZSAoR1BBKSB1bmRlciBvbmUgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuIFNlZVxyXG4vLyAgdGhlIE5PVElDRSBmaWxlIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLlxyXG4vLyAgVGhlIEdQQSBsaWNlbnNlcyB0aGlzIGZpbGUgdG8geW91IHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgdGhlIFwiTGljZW5zZVwiOyB5b3UgbWF5IG5vdCB1c2UgdGhpc1xyXG4vLyAgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXQ6XHJcbi8vXHJcbi8vICAgICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4vL1xyXG4vLyAgVW5sZXNzIGFncmVlZCB0byBpbiB3cml0aW5nLCB0aGUgc3ViamVjdCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhblxyXG4vLyAgXCJBUy1JU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gUmVmZXIgdG8gdGhlXHJcbi8vICBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucy5cclxuLy9cclxuLy8gIENvZGUgTW9kaWZpY2F0aW9uIEhpc3Rvcnk6XHJcbi8vICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICAxMC8xMy8yMDIwIC0gQy4gTGFja25lclxyXG4vLyAgICAgICBHZW5lcmF0ZWQgb3JpZ2luYWwgdmVyc2lvbiBvZiBzb3VyY2UgY29kZS5cclxuLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgc3R5bGUgfSBmcm9tIFwidHlwZXN0eWxlXCJcclxuXHJcbi8vIHN0eWxlc1xyXG5leHBvcnQgY29uc3Qgb3V0ZXJEaXY6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgbWFyZ2luTGVmdDogJ2F1dG8nLFxyXG4gICAgbWFyZ2luUmlnaHQ6ICdhdXRvJyxcclxuICAgIG92ZXJmbG93WTogJ2hpZGRlbicsXHJcbiAgICBvdmVyZmxvd1g6ICdoaWRkZW4nLFxyXG4gICAgcGFkZGluZzogJzBlbScsXHJcbiAgICB6SW5kZXg6IDEwMDAsXHJcbiAgICBib3hTaGFkb3c6ICc0cHggNHB4IDJweCAjODg4ODg4JyxcclxuICAgIGJvcmRlcjogJzJweCBzb2xpZCBibGFjaycsXHJcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgIHRvcDogJzAnLFxyXG4gICAgbGVmdDogMCxcclxuICAgIGRpc3BsYXk6ICdub25lJyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGUgPSBzdHlsZSh7XHJcbiAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgaGVpZ2h0OiAnMjBweCcsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjODA4MDgwJyxcclxuICAgIGN1cnNvcjogJ21vdmUnLFxyXG4gICAgcGFkZGluZzogJzBlbSdcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgY2xvc2VCdXR0b24gPSBzdHlsZSh7XHJcbiAgICBiYWNrZ3JvdW5kOiAnZmlyZWJyaWNrJyxcclxuICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICB0b3A6IDAsXHJcbiAgICByaWdodDogMCxcclxuICAgIHdpZHRoOiAnMjBweCcsXHJcbiAgICBoZWlnaHQ6ICcyMHB4JyxcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICB2ZXJ0aWNhbEFsaWduOiAnbWlkZGxlJyxcclxuICAgIHBhZGRpbmc6IDAsXHJcbiAgICBib3JkZXI6IDAsXHJcbiAgICAkbmVzdDoge1xyXG4gICAgICAgIFwiJjpob3ZlclwiOiB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICdvcmFuZ2VyZWQnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbmludGVyZmFjZSBJd2luZG93UHJvcHMge1xyXG4gICAgc2hvdzogYm9vbGVhbixcclxuICAgIGNsb3NlOiAoKSA9PiB2b2lkLFxyXG4gICAgd2lkdGg6IG51bWJlcixcclxuICAgIG1heEhlaWdodDogbnVtYmVyLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgV2lkZ2V0V2luZG93OiBSZWFjdC5GdW5jdGlvbkNvbXBvbmVudDxJd2luZG93UHJvcHM+ID0gKHByb3BzKSA9PiB7XHJcbiAgICBjb25zdCByZWZXaW5kb3cgPSBSZWFjdC51c2VSZWYobnVsbCk7XHJcbiAgICBjb25zdCByZWZIYW5kbGUgPSBSZWFjdC51c2VSZWYobnVsbCk7XHJcblxyXG4gICAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcclxuICAgICAgICBpZiAocHJvcHMuc2hvdylcclxuICAgICAgICAgICAgKCQocmVmV2luZG93LmN1cnJlbnQpIGFzIGFueSkuZHJhZ2dhYmxlKHsgc2Nyb2xsOiBmYWxzZSwgaGFuZGxlOiByZWZIYW5kbGUuY3VycmVudCwgY29udGFpbm1lbnQ6ICcjY2hhcnRwYW5lbCcgfSk7XHJcbiAgICB9KVxyXG5cclxuICAgIGlmICghcHJvcHMuc2hvdylcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDwgZGl2IHJlZj17cmVmV2luZG93fSBjbGFzc05hbWU9XCJ1aS13aWRnZXQtY29udGVudFwiIHN0eWxlPXt7IC4uLm91dGVyRGl2LCB3aWR0aDogcHJvcHMud2lkdGgsIG1heEhlaWdodDogcHJvcHMubWF4SGVpZ2h0LCBkaXNwbGF5OiB1bmRlZmluZWQgfX0gPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlcjogJ2JsYWNrIHNvbGlkIDJweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHJlZj17cmVmSGFuZGxlfSBjbGFzc05hbWU9e2hhbmRsZX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiBwcm9wcy53aWR0aCAtIDYsIG1heEhlaWdodDogcHJvcHMubWF4SGVpZ2h0IC0gMjQgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAge3Byb3BzLmNoaWxkcmVufVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17Y2xvc2VCdXR0b259IG9uQ2xpY2s9eygpID0+IHByb3BzLmNsb3NlKCl9Plg8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG59IiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gIFRpbWVDb3JyZWxhdGVkU2Fncy50c3ggLSBHYnRjXHJcbi8vXHJcbi8vICBDb3B5cmlnaHQgwqkgMjAxOCwgR3JpZCBQcm90ZWN0aW9uIEFsbGlhbmNlLiAgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuLy9cclxuLy8gIExpY2Vuc2VkIHRvIHRoZSBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UgKEdQQSkgdW5kZXIgb25lIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiBTZWVcclxuLy8gIHRoZSBOT1RJQ0UgZmlsZSBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC5cclxuLy8gIFRoZSBHUEEgbGljZW5zZXMgdGhpcyBmaWxlIHRvIHlvdSB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHRoZSBcIkxpY2Vuc2VcIjsgeW91IG1heSBub3QgdXNlIHRoaXNcclxuLy8gIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0OlxyXG4vL1xyXG4vLyAgICAgIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuLy9cclxuLy8gIFVubGVzcyBhZ3JlZWQgdG8gaW4gd3JpdGluZywgdGhlIHN1YmplY3Qgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW5cclxuLy8gIFwiQVMtSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFJlZmVyIHRvIHRoZVxyXG4vLyAgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMuXHJcbi8vXHJcbi8vICBDb2RlIE1vZGlmaWNhdGlvbiBIaXN0b3J5OlxyXG4vLyAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAgMDIvMDUvMjAxOSAtIFN0ZXBoZW4gQy4gV2lsbHNcclxuLy8gICAgICAgR2VuZXJhdGVkIG9yaWdpbmFsIHZlcnNpb24gb2Ygc291cmNlIGNvZGUuXHJcbi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IFdpZGdldFdpbmRvdyB9IGZyb20gJy4vQ29tbW9uJztcclxuXHJcblxyXG5pbnRlcmZhY2UgSXByb3BzIHsgY2xvc2VDYWxsYmFjazogKCkgPT4gdm9pZCwgZXhwb3J0Q2FsbGJhY2s6ICgpID0+IHZvaWQsIGV2ZW50SWQ6IG51bWJlciwgaXNPcGVuOiBib29sZWFuIH1cclxuXHJcbmNvbnN0IFRpbWVDb3JyZWxhdGVkU2Fnc1dpZGdldCA9IChwcm9wczogSXByb3BzKSA9PiB7XHJcbiAgICBjb25zdCBbdGJsRGF0YSwgc2V0VGJsRGF0YV0gPSBSZWFjdC51c2VTdGF0ZTxBcnJheTxKU1guRWxlbWVudD4+KFtdKTtcclxuXHJcbiAgICBcclxuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAgICAgbGV0IGhhbmRsZSA9IGdldERhdGEoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuICgpID0+IHsgaWYgKGhhbmRsZSAhPSB1bmRlZmluZWQgJiYgaGFuZGxlLmFib3J0ICE9IHVuZGVmaW5lZCkgaGFuZGxlLmFib3J0KCk7IH1cclxuICAgIH0sIFtwcm9wcy5ldmVudElkXSlcclxuXHJcbiAgICBjb25zdCByb3dTdHlsZSA9IHsgcGFkZGluZ0xlZnQ6IDUsIHBhZGRpbmdSaWdodDogNSwgcGFkZGluZ1RvcDogMCwgcGFkZGluZ0JvdHRvbTogNSB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RGF0YSgpOiBKUXVlcnkuanFYSFIge1xyXG5cclxuICAgICAgICBsZXQgaGFuZGxlID0gJC5hamF4KHtcclxuICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgdXJsOiBgJHtob21lUGF0aH1hcGkvT3BlblNFRS9HZXRUaW1lQ29ycmVsYXRlZFNhZ3M/ZXZlbnRJZD0ke3Byb3BzLmV2ZW50SWR9YCxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZSxcclxuICAgICAgICAgICAgYXN5bmM6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGhhbmRsZS5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRibERhdGEoZC5tYXAocm93ID0+XHJcbiAgICAgICAgICAgICAgICA8dHIgc3R5bGU9e3sgZGlzcGxheTogJ3RhYmxlJywgdGFibGVMYXlvdXQ6ICdmaXhlZCcsIGJhY2tncm91bmQ6IChyb3cuRXZlbnRJRCA9PSBwcm9wcy5ldmVudElkPyAnbGlnaHR5ZWxsb3cnIDogJ2RlZmF1bHQnKSB9fSBrZXk9e3Jvdy5FdmVudElEfT5cclxuICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgd2lkdGg6IDYwLCAuLi5yb3dTdHlsZSB9fSA+PGEgaWQ9XCJldmVudExpbmtcIiB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPXsnLi8/ZXZlbnRpZD0nICsgcm93LkV2ZW50SUR9PjxkaXYgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScgfX0+e3Jvdy5FdmVudElEfTwvZGl2PjwvYT48L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB3aWR0aDogODAsIC4uLnJvd1N0eWxlIH19ID57cm93LkV2ZW50VHlwZX08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB3aWR0aDogODAsIC4uLnJvd1N0eWxlIH19ID57cm93LlNhZ01hZ25pdHVkZVBlcmNlbnR9JTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHdpZHRoOiAyMDAsIC4uLnJvd1N0eWxlIH19Pntyb3cuU2FnRHVyYXRpb25NaWxsaXNlY29uZHN9IG1zICh7cm93LlNhZ0R1cmF0aW9uQ3ljbGVzfSBjeWNsZXMpPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgd2lkdGg6IDIyMCwgLi4ucm93U3R5bGUgfX0+e3Jvdy5TdGFydFRpbWV9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgd2lkdGg6IDIwMCwgLi4ucm93U3R5bGUgfX0+e3Jvdy5NZXRlck5hbWV9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgd2lkdGg6IDMwMCwgLi4ucm93U3R5bGUgfX0+e3Jvdy5Bc3NldE5hbWV9PC90ZD5cclxuICAgICAgICAgICAgICAgIDwvdHI+KSlcclxuICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIHJldHVybiBoYW5kbGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8V2lkZ2V0V2luZG93IHNob3c9e3Byb3BzLmlzT3Blbn0gY2xvc2U9e3Byb3BzLmNsb3NlQ2FsbGJhY2t9IG1heEhlaWdodD17NTUwfSB3aWR0aD17OTk2fT5cclxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRhYmxlXCIgc3R5bGU9e3sgZm9udFNpemU6ICdzbWFsbCcsIG1hcmdpbkJvdHRvbTogMCB9fT5cclxuICAgICAgICAgICAgICAgIDx0aGVhZCBzdHlsZT17eyBkaXNwbGF5OiAndGFibGUnLCB0YWJsZUxheW91dDogJ2ZpeGVkJywgbWFyZ2luQm90dG9tOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHdpZHRoOiA2MCwgLi4ucm93U3R5bGUgfX0+RXZlbnQgSUQ8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgd2lkdGg6IDgwLCAuLi5yb3dTdHlsZSB9fT5FdmVudCBUeXBlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHdpZHRoOiA4MCwgLi4ucm93U3R5bGUgfX0+TWFnbml0dWRlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHdpZHRoOiAyMDAsIC4uLnJvd1N0eWxlIH19PkR1cmF0aW9uPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHdpZHRoOiAyMjAsIC4uLnJvd1N0eWxlIH19PlN0YXJ0IFRpbWU8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgd2lkdGg6IDIwMCwgLi4ucm93U3R5bGUgfX0+TWV0ZXIgTmFtZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB3aWR0aDogMzAwLCAuLi5yb3dTdHlsZSB9fT5Bc3NldCBOYW1lJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7PGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tcHJpbWFyeScgb25DbGljaz17KCkgPT4gcHJvcHMuZXhwb3J0Q2FsbGJhY2soKX0+RXhwb3J0KGNzdik8L2J1dHRvbj48L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPHRib2R5IHN0eWxlPXt7IG1heEhlaWdodDogNTAwLCBvdmVyZmxvd1k6ICdhdXRvJywgZGlzcGxheTogJ2Jsb2NrJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7dGJsRGF0YX1cclxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgPC9XaWRnZXRXaW5kb3c+XHJcbiAgICApO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGltZUNvcnJlbGF0ZWRTYWdzV2lkZ2V0XHJcblxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFJlYWN0OyJdLCJzb3VyY2VSb290IjoiIn0=