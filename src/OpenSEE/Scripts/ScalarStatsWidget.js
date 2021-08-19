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
/******/ 	return __webpack_require__(__webpack_require__.s = "./TSX/jQueryUI Widgets/ScalarStats.tsx");
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

/***/ "./TSX/jQueryUI Widgets/ScalarStats.tsx":
/*!**********************************************!*\
  !*** ./TSX/jQueryUI Widgets/ScalarStats.tsx ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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
var ScalarStatsWidget = function (props) {
    var _a = __read(React.useState([]), 2), stats = _a[0], setStats = _a[1];
    React.useEffect(function () {
        var handle = getData();
        return function () { if (handle != undefined && handle.abort != undefined)
            handle.abort(); };
    }, [props.eventId]);
    function getData() {
        var handle = $.ajax({
            type: "GET",
            url: homePath + "api/OpenSEE/GetScalarStats?eventId=" + props.eventId,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        handle.done(function (d) {
            setStats(Object.keys(d).map(function (item) {
                return React.createElement("tr", { style: { display: 'table', tableLayout: 'fixed', width: '100%' }, key: item },
                    React.createElement("td", null, item),
                    React.createElement("td", null, d[item]));
            }));
        });
        return handle;
    }
    return (React.createElement(Common_1.WidgetWindow, { show: props.isOpen, close: props.closeCallback, maxHeight: 400, width: 500 },
        React.createElement("table", { className: "table", style: { fontSize: 'small', marginBottom: 0 } },
            React.createElement("thead", { style: { display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)' } },
                React.createElement("tr", null,
                    React.createElement("th", null, "Stat"),
                    React.createElement("th", null,
                        "Value\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
                        React.createElement("button", { className: 'btn btn-primary', onClick: function () { return props.exportCallback(); } }, "Export(csv)")))),
            React.createElement("tbody", { style: { maxHeight: 310, overflowY: 'auto', display: 'block' } }, stats))));
};
exports.default = ScalarStatsWidget;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL3NyYy9mcmVlLXN0eWxlLnRzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy90eXBlc3R5bGUvbGliLmVzMjAxNS9pbnRlcm5hbC9mb3JtYXR0aW5nLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvdHlwZXN0eWxlLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvdXRpbGl0aWVzLmpzIiwid2VicGFjazovLy8uL1RTWC9qUXVlcnlVSSBXaWRnZXRzL0NvbW1vbi50c3giLCJ3ZWJwYWNrOi8vLy4vVFNYL2pRdWVyeVVJIFdpZGdldHMvU2NhbGFyU3RhdHMudHN4Iiwid2VicGFjazovLy9leHRlcm5hbCBcIlJlYWN0XCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gs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LENBQUM7QUFDTixDQUFDO0FBRUQsa0JBQWUsaUJBQWlCLENBQUM7Ozs7Ozs7Ozs7OztBQ3hFakMsdUIiLCJmaWxlIjoiU2NhbGFyU3RhdHNXaWRnZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL1RTWC9qUXVlcnlVSSBXaWRnZXRzL1NjYWxhclN0YXRzLnRzeFwiKTtcbiIsIi8qKlxuICogVGhlIHVuaXF1ZSBpZCBpcyB1c2VkIGZvciB1bmlxdWUgaGFzaGVzLlxuICovXG5sZXQgdW5pcXVlSWQgPSAwXG5cbi8qKlxuICogVmFsaWQgQ1NTIHByb3BlcnR5IHZhbHVlcy5cbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlWYWx1ZSA9IG51bWJlciB8IGJvb2xlYW4gfCBzdHJpbmdcblxuLyoqXG4gKiBJbnB1dCBzdHlsZXMgb2JqZWN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0eWxlcyB7XG4gIFtzZWxlY3Rvcjogc3RyaW5nXTogbnVsbCB8IHVuZGVmaW5lZCB8IFByb3BlcnR5VmFsdWUgfCBQcm9wZXJ0eVZhbHVlW10gfCBTdHlsZXNcbn1cblxuLyoqXG4gKiBIYXNoIGFsZ29yaXRobSBpbnRlcmZhY2UuXG4gKi9cbmV4cG9ydCB0eXBlIEhhc2hGdW5jdGlvbiA9IChzdHI6IHN0cmluZykgPT4gc3RyaW5nXG5cbi8qKlxuICogVGFnIHN0eWxlcyB3aXRoIHRoaXMgc3RyaW5nIHRvIGdldCB1bmlxdWUgaGFzaGVzLlxuICovXG5leHBvcnQgY29uc3QgSVNfVU5JUVVFID0gJ19fRE9fTk9UX0RFRFVQRV9TVFlMRV9fJ1xuXG5jb25zdCB1cHBlckNhc2VQYXR0ZXJuID0gL1tBLVpdL2dcbmNvbnN0IG1zUGF0dGVybiA9IC9ebXMtL1xuY29uc3QgaW50ZXJwb2xhdGVQYXR0ZXJuID0gLyYvZ1xuY29uc3QgZXNjYXBlUGF0dGVybiA9IC9bICEjJCUmKCkqKywuLzs8PT4/QFtcXF1eYHt8fX5cIidcXFxcXS9nXG5jb25zdCBwcm9wTG93ZXIgPSAobTogc3RyaW5nKSA9PiBgLSR7bS50b0xvd2VyQ2FzZSgpfWBcblxuLyoqXG4gKiBDU1MgcHJvcGVydGllcyB0aGF0IGFyZSB2YWxpZCB1bml0LWxlc3MgbnVtYmVycy5cbiAqL1xuY29uc3QgY3NzTnVtYmVyUHJvcGVydGllcyA9IFtcbiAgJ2FuaW1hdGlvbi1pdGVyYXRpb24tY291bnQnLFxuICAnYm94LWZsZXgnLFxuICAnYm94LWZsZXgtZ3JvdXAnLFxuICAnY29sdW1uLWNvdW50JyxcbiAgJ2NvdW50ZXItaW5jcmVtZW50JyxcbiAgJ2NvdW50ZXItcmVzZXQnLFxuICAnZmxleCcsXG4gICdmbGV4LWdyb3cnLFxuICAnZmxleC1wb3NpdGl2ZScsXG4gICdmbGV4LXNocmluaycsXG4gICdmbGV4LW5lZ2F0aXZlJyxcbiAgJ2ZvbnQtd2VpZ2h0JyxcbiAgJ2xpbmUtY2xhbXAnLFxuICAnbGluZS1oZWlnaHQnLFxuICAnb3BhY2l0eScsXG4gICdvcmRlcicsXG4gICdvcnBoYW5zJyxcbiAgJ3RhYi1zaXplJyxcbiAgJ3dpZG93cycsXG4gICd6LWluZGV4JyxcbiAgJ3pvb20nLFxuICAvLyBTVkcgcHJvcGVydGllcy5cbiAgJ2ZpbGwtb3BhY2l0eScsXG4gICdzdHJva2UtZGFzaG9mZnNldCcsXG4gICdzdHJva2Utb3BhY2l0eScsXG4gICdzdHJva2Utd2lkdGgnXG5dXG5cbi8qKlxuICogTWFwIG9mIGNzcyBudW1iZXIgcHJvcGVydGllcy5cbiAqL1xuY29uc3QgQ1NTX05VTUJFUiA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuLy8gQWRkIHZlbmRvciBwcmVmaXhlcyB0byBhbGwgdW5pdC1sZXNzIHByb3BlcnRpZXMuXG5mb3IgKGNvbnN0IHByZWZpeCBvZiBbJy13ZWJraXQtJywgJy1tcy0nLCAnLW1vei0nLCAnLW8tJywgJyddKSB7XG4gIGZvciAoY29uc3QgcHJvcGVydHkgb2YgY3NzTnVtYmVyUHJvcGVydGllcykge1xuICAgIENTU19OVU1CRVJbcHJlZml4ICsgcHJvcGVydHldID0gdHJ1ZVxuICB9XG59XG5cbi8qKlxuICogRXNjYXBlIGEgQ1NTIGNsYXNzIG5hbWUuXG4gKi9cbmV4cG9ydCBjb25zdCBlc2NhcGUgPSAoc3RyOiBzdHJpbmcpID0+IHN0ci5yZXBsYWNlKGVzY2FwZVBhdHRlcm4sICdcXFxcJCYnKVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhIEphdmFTY3JpcHQgcHJvcGVydHkgaW50byBhIENTUyBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGh5cGhlbmF0ZSAocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcHJvcGVydHlOYW1lXG4gICAgLnJlcGxhY2UodXBwZXJDYXNlUGF0dGVybiwgcHJvcExvd2VyKVxuICAgIC5yZXBsYWNlKG1zUGF0dGVybiwgJy1tcy0nKSAvLyBJbnRlcm5ldCBFeHBsb3JlciB2ZW5kb3IgcHJlZml4LlxufVxuXG4vKipcbiAqIEdlbmVyYXRlIGEgaGFzaCB2YWx1ZSBmcm9tIGEgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nSGFzaCAoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgdmFsdWUgPSA1MzgxXG4gIGxldCBsZW4gPSBzdHIubGVuZ3RoXG5cbiAgd2hpbGUgKGxlbi0tKSB2YWx1ZSA9ICh2YWx1ZSAqIDMzKSBeIHN0ci5jaGFyQ29kZUF0KGxlbilcblxuICByZXR1cm4gKHZhbHVlID4+PiAwKS50b1N0cmluZygzNilcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYSBzdHlsZSBzdHJpbmcgdG8gYSBDU1Mgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBzdHlsZVRvU3RyaW5nIChrZXk6IHN0cmluZywgdmFsdWU6IFByb3BlcnR5VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgdmFsdWUgIT09IDAgJiYgIUNTU19OVU1CRVJba2V5XSkge1xuICAgIHJldHVybiBgJHtrZXl9OiR7dmFsdWV9cHhgXG4gIH1cblxuICByZXR1cm4gYCR7a2V5fToke3ZhbHVlfWBcbn1cblxuLyoqXG4gKiBTb3J0IGFuIGFycmF5IG9mIHR1cGxlcyBieSBmaXJzdCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc29ydFR1cGxlcyA8VCBleHRlbmRzIGFueVtdPiAodmFsdWU6IFRbXSk6IFRbXSB7XG4gIHJldHVybiB2YWx1ZS5zb3J0KChhLCBiKSA9PiBhWzBdID4gYlswXSA/IDEgOiAtMSlcbn1cblxuLyoqXG4gKiBDYXRlZ29yaXplIHVzZXIgc3R5bGVzLlxuICovXG5mdW5jdGlvbiBwYXJzZVN0eWxlcyAoc3R5bGVzOiBTdHlsZXMsIGhhc05lc3RlZFN0eWxlczogYm9vbGVhbikge1xuICBjb25zdCBwcm9wZXJ0aWVzOiBBcnJheTxbc3RyaW5nLCBQcm9wZXJ0eVZhbHVlIHwgUHJvcGVydHlWYWx1ZVtdXT4gPSBbXVxuICBjb25zdCBuZXN0ZWRTdHlsZXM6IEFycmF5PFtzdHJpbmcsIFN0eWxlc10+ID0gW11cbiAgbGV0IGlzVW5pcXVlID0gZmFsc2VcblxuICAvLyBTb3J0IGtleXMgYmVmb3JlIGFkZGluZyB0byBzdHlsZXMuXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN0eWxlcykpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHN0eWxlc1trZXldXG5cbiAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGtleSA9PT0gSVNfVU5JUVVFKSB7XG4gICAgICAgIGlzVW5pcXVlID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBuZXN0ZWRTdHlsZXMucHVzaChba2V5LnRyaW0oKSwgdmFsdWVdKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvcGVydGllcy5wdXNoKFtoeXBoZW5hdGUoa2V5LnRyaW0oKSksIHZhbHVlXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0eWxlU3RyaW5nOiBzdHJpbmdpZnlQcm9wZXJ0aWVzKHNvcnRUdXBsZXMocHJvcGVydGllcykpLFxuICAgIG5lc3RlZFN0eWxlczogaGFzTmVzdGVkU3R5bGVzID8gbmVzdGVkU3R5bGVzIDogc29ydFR1cGxlcyhuZXN0ZWRTdHlsZXMpLFxuICAgIGlzVW5pcXVlXG4gIH1cbn1cblxuLyoqXG4gKiBTdHJpbmdpZnkgYW4gYXJyYXkgb2YgcHJvcGVydHkgdHVwbGVzLlxuICovXG5mdW5jdGlvbiBzdHJpbmdpZnlQcm9wZXJ0aWVzIChwcm9wZXJ0aWVzOiBBcnJheTxbc3RyaW5nLCBQcm9wZXJ0eVZhbHVlIHwgUHJvcGVydHlWYWx1ZVtdXT4pIHtcbiAgcmV0dXJuIHByb3BlcnRpZXMubWFwKChbbmFtZSwgdmFsdWVdKSA9PiB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHN0eWxlVG9TdHJpbmcobmFtZSwgdmFsdWUpXG5cbiAgICByZXR1cm4gdmFsdWUubWFwKHggPT4gc3R5bGVUb1N0cmluZyhuYW1lLCB4KSkuam9pbignOycpXG4gIH0pLmpvaW4oJzsnKVxufVxuXG4vKipcbiAqIEludGVycG9sYXRlIENTUyBzZWxlY3RvcnMuXG4gKi9cbmZ1bmN0aW9uIGludGVycG9sYXRlIChzZWxlY3Rvcjogc3RyaW5nLCBwYXJlbnQ6IHN0cmluZykge1xuICBpZiAoc2VsZWN0b3IuaW5kZXhPZignJicpID4gLTEpIHtcbiAgICByZXR1cm4gc2VsZWN0b3IucmVwbGFjZShpbnRlcnBvbGF0ZVBhdHRlcm4sIHBhcmVudClcbiAgfVxuXG4gIHJldHVybiBgJHtwYXJlbnR9ICR7c2VsZWN0b3J9YFxufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZSBsb29wIGJ1aWxkaW5nIHN0eWxlcyB3aXRoIGRlZmVycmVkIHNlbGVjdG9ycy5cbiAqL1xuZnVuY3Rpb24gc3R5bGl6ZSAoY2FjaGU6IENhY2hlPGFueT4sIHNlbGVjdG9yOiBzdHJpbmcsIHN0eWxlczogU3R5bGVzLCBsaXN0OiBbc3RyaW5nLCBTdHlsZV1bXSwgcGFyZW50Pzogc3RyaW5nKSB7XG4gIGNvbnN0IHsgc3R5bGVTdHJpbmcsIG5lc3RlZFN0eWxlcywgaXNVbmlxdWUgfSA9IHBhcnNlU3R5bGVzKHN0eWxlcywgISFzZWxlY3RvcilcbiAgbGV0IHBpZCA9IHN0eWxlU3RyaW5nXG5cbiAgaWYgKHNlbGVjdG9yLmNoYXJDb2RlQXQoMCkgPT09IDY0IC8qIEAgKi8pIHtcbiAgICBjb25zdCBydWxlID0gY2FjaGUuYWRkKG5ldyBSdWxlKHNlbGVjdG9yLCBwYXJlbnQgPyB1bmRlZmluZWQgOiBzdHlsZVN0cmluZywgY2FjaGUuaGFzaCkpXG5cbiAgICAvLyBOZXN0ZWQgc3R5bGVzIHN1cHBvcnQgKGUuZy4gYC5mb28gPiBAbWVkaWEgPiAuYmFyYCkuXG4gICAgaWYgKHN0eWxlU3RyaW5nICYmIHBhcmVudCkge1xuICAgICAgY29uc3Qgc3R5bGUgPSBydWxlLmFkZChuZXcgU3R5bGUoc3R5bGVTdHJpbmcsIHJ1bGUuaGFzaCwgaXNVbmlxdWUgPyBgdSR7KCsrdW5pcXVlSWQpLnRvU3RyaW5nKDM2KX1gIDogdW5kZWZpbmVkKSlcbiAgICAgIGxpc3QucHVzaChbcGFyZW50LCBzdHlsZV0pXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIG5lc3RlZFN0eWxlcykge1xuICAgICAgcGlkICs9IG5hbWUgKyBzdHlsaXplKHJ1bGUsIG5hbWUsIHZhbHVlLCBsaXN0LCBwYXJlbnQpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGtleSA9IHBhcmVudCA/IGludGVycG9sYXRlKHNlbGVjdG9yLCBwYXJlbnQpIDogc2VsZWN0b3JcblxuICAgIGlmIChzdHlsZVN0cmluZykge1xuICAgICAgY29uc3Qgc3R5bGUgPSBjYWNoZS5hZGQobmV3IFN0eWxlKHN0eWxlU3RyaW5nLCBjYWNoZS5oYXNoLCBpc1VuaXF1ZSA/IGB1JHsoKyt1bmlxdWVJZCkudG9TdHJpbmcoMzYpfWAgOiB1bmRlZmluZWQpKVxuICAgICAgbGlzdC5wdXNoKFtrZXksIHN0eWxlXSlcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgbmVzdGVkU3R5bGVzKSB7XG4gICAgICBwaWQgKz0gbmFtZSArIHN0eWxpemUoY2FjaGUsIG5hbWUsIHZhbHVlLCBsaXN0LCBrZXkpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBpZFxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGFsbCBzdHlsZXMsIGJ1dCBjb2xsZWN0IGZvciBzZWxlY3RvciBpbnRlcnBvbGF0aW9uIHVzaW5nIHRoZSBoYXNoLlxuICovXG5mdW5jdGlvbiBjb21wb3NlU3R5bGVzIChjb250YWluZXI6IEZyZWVTdHlsZSwgc2VsZWN0b3I6IHN0cmluZywgc3R5bGVzOiBTdHlsZXMsIGlzU3R5bGU6IGJvb2xlYW4sIGRpc3BsYXlOYW1lPzogc3RyaW5nKSB7XG4gIGNvbnN0IGNhY2hlID0gbmV3IENhY2hlPFJ1bGUgfCBTdHlsZT4oY29udGFpbmVyLmhhc2gpXG4gIGNvbnN0IGxpc3Q6IFtzdHJpbmcsIFN0eWxlXVtdID0gW11cbiAgY29uc3QgcGlkID0gc3R5bGl6ZShjYWNoZSwgc2VsZWN0b3IsIHN0eWxlcywgbGlzdClcblxuICBjb25zdCBoYXNoID0gYGYke2NhY2hlLmhhc2gocGlkKX1gXG4gIGNvbnN0IGlkID0gZGlzcGxheU5hbWUgPyBgJHtkaXNwbGF5TmFtZX1fJHtoYXNofWAgOiBoYXNoXG5cbiAgZm9yIChjb25zdCBbc2VsZWN0b3IsIHN0eWxlXSBvZiBsaXN0KSB7XG4gICAgY29uc3Qga2V5ID0gaXNTdHlsZSA/IGludGVycG9sYXRlKHNlbGVjdG9yLCBgLiR7ZXNjYXBlKGlkKX1gKSA6IHNlbGVjdG9yXG4gICAgc3R5bGUuYWRkKG5ldyBTZWxlY3RvcihrZXksIHN0eWxlLmhhc2gsIHVuZGVmaW5lZCwgcGlkKSlcbiAgfVxuXG4gIHJldHVybiB7IGNhY2hlLCBwaWQsIGlkIH1cbn1cblxuLyoqXG4gKiBDYWNoZSB0byBsaXN0IHRvIHN0eWxlcy5cbiAqL1xuZnVuY3Rpb24gam9pbiAoYXJyOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGxldCByZXMgPSAnJ1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykgcmVzICs9IGFycltpXVxuICByZXR1cm4gcmVzXG59XG5cbi8qKlxuICogUHJvcGFnYXRlIGNoYW5nZSBldmVudHMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhbmdlcyB7XG4gIGFkZCAoc3R5bGU6IENvbnRhaW5lcjxhbnk+LCBpbmRleDogbnVtYmVyKTogdm9pZFxuICBjaGFuZ2UgKHN0eWxlOiBDb250YWluZXI8YW55Piwgb2xkSW5kZXg6IG51bWJlciwgbmV3SW5kZXg6IG51bWJlcik6IHZvaWRcbiAgcmVtb3ZlIChzdHlsZTogQ29udGFpbmVyPGFueT4sIGluZGV4OiBudW1iZXIpOiB2b2lkXG59XG5cbi8qKlxuICogTm9vcCBjaGFuZ2VzLlxuICovXG5jb25zdCBub29wQ2hhbmdlczogQ2hhbmdlcyA9IHtcbiAgYWRkOiAoKSA9PiB1bmRlZmluZWQsXG4gIGNoYW5nZTogKCkgPT4gdW5kZWZpbmVkLFxuICByZW1vdmU6ICgpID0+IHVuZGVmaW5lZFxufVxuXG4vKipcbiAqIENhY2hlYWJsZSBpbnRlcmZhY2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGFpbmVyIDxUPiB7XG4gIGlkOiBzdHJpbmdcbiAgY2xvbmUgKCk6IFRcbiAgZ2V0SWRlbnRpZmllciAoKTogc3RyaW5nXG4gIGdldFN0eWxlcyAoKTogc3RyaW5nXG59XG5cbi8qKlxuICogSW1wbGVtZW50IGEgY2FjaGUvZXZlbnQgZW1pdHRlci5cbiAqL1xuZXhwb3J0IGNsYXNzIENhY2hlIDxUIGV4dGVuZHMgQ29udGFpbmVyPGFueT4+IHtcblxuICBzaGVldDogc3RyaW5nW10gPSBbXVxuICBjaGFuZ2VJZCA9IDBcblxuICBwcml2YXRlIF9rZXlzOiBzdHJpbmdbXSA9IFtdXG4gIHByaXZhdGUgX2NoaWxkcmVuOiB7IFtpZDogc3RyaW5nXTogVCB9ID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICBwcml2YXRlIF9jb3VudGVyczogeyBbaWQ6IHN0cmluZ106IG51bWJlciB9ID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gIGNvbnN0cnVjdG9yIChwdWJsaWMgaGFzaCA9IHN0cmluZ0hhc2gsIHB1YmxpYyBjaGFuZ2VzOiBDaGFuZ2VzID0gbm9vcENoYW5nZXMpIHt9XG5cbiAgYWRkIDxVIGV4dGVuZHMgVD4gKHN0eWxlOiBVKTogVSB7XG4gICAgY29uc3QgY291bnQgPSB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF0gfHwgMFxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9jaGlsZHJlbltzdHlsZS5pZF0gfHwgc3R5bGUuY2xvbmUoKVxuXG4gICAgdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdID0gY291bnQgKyAxXG5cbiAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2NoaWxkcmVuW2l0ZW0uaWRdID0gaXRlbVxuICAgICAgdGhpcy5fa2V5cy5wdXNoKGl0ZW0uaWQpXG4gICAgICB0aGlzLnNoZWV0LnB1c2goaXRlbS5nZXRTdHlsZXMoKSlcbiAgICAgIHRoaXMuY2hhbmdlSWQrK1xuICAgICAgdGhpcy5jaGFuZ2VzLmFkZChpdGVtLCB0aGlzLl9rZXlzLmxlbmd0aCAtIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENoZWNrIGlmIGNvbnRlbnRzIGFyZSBkaWZmZXJlbnQuXG4gICAgICBpZiAoaXRlbS5nZXRJZGVudGlmaWVyKCkgIT09IHN0eWxlLmdldElkZW50aWZpZXIoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBIYXNoIGNvbGxpc2lvbjogJHtzdHlsZS5nZXRTdHlsZXMoKX0gPT09ICR7aXRlbS5nZXRTdHlsZXMoKX1gKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvbGRJbmRleCA9IHRoaXMuX2tleXMuaW5kZXhPZihzdHlsZS5pZClcbiAgICAgIGNvbnN0IG5ld0luZGV4ID0gdGhpcy5fa2V5cy5sZW5ndGggLSAxXG4gICAgICBjb25zdCBwcmV2Q2hhbmdlSWQgPSB0aGlzLmNoYW5nZUlkXG5cbiAgICAgIGlmIChvbGRJbmRleCAhPT0gbmV3SW5kZXgpIHtcbiAgICAgICAgdGhpcy5fa2V5cy5zcGxpY2Uob2xkSW5kZXgsIDEpXG4gICAgICAgIHRoaXMuX2tleXMucHVzaChzdHlsZS5pZClcbiAgICAgICAgdGhpcy5jaGFuZ2VJZCsrXG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgQ2FjaGUgJiYgc3R5bGUgaW5zdGFuY2VvZiBDYWNoZSkge1xuICAgICAgICBjb25zdCBwcmV2Q2hhbmdlSWQgPSBpdGVtLmNoYW5nZUlkXG5cbiAgICAgICAgaXRlbS5tZXJnZShzdHlsZSlcblxuICAgICAgICBpZiAoaXRlbS5jaGFuZ2VJZCAhPT0gcHJldkNoYW5nZUlkKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VJZCsrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2hhbmdlSWQgIT09IHByZXZDaGFuZ2VJZCkge1xuICAgICAgICBpZiAob2xkSW5kZXggPT09IG5ld0luZGV4KSB7XG4gICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2Uob2xkSW5kZXgsIDEsIGl0ZW0uZ2V0U3R5bGVzKCkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2Uob2xkSW5kZXgsIDEpXG4gICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2UobmV3SW5kZXgsIDAsIGl0ZW0uZ2V0U3R5bGVzKCkpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoYW5nZXMuY2hhbmdlKGl0ZW0sIG9sZEluZGV4LCBuZXdJbmRleClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbSBhcyBVXG4gIH1cblxuICByZW1vdmUgKHN0eWxlOiBUKTogdm9pZCB7XG4gICAgY29uc3QgY291bnQgPSB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF1cblxuICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgIHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXSA9IGNvdW50IC0gMVxuXG4gICAgICBjb25zdCBpdGVtID0gdGhpcy5fY2hpbGRyZW5bc3R5bGUuaWRdXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2tleXMuaW5kZXhPZihpdGVtLmlkKVxuXG4gICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXVxuICAgICAgICBkZWxldGUgdGhpcy5fY2hpbGRyZW5bc3R5bGUuaWRdXG5cbiAgICAgICAgdGhpcy5fa2V5cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIHRoaXMuc2hlZXQuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICB0aGlzLmNoYW5nZUlkKytcbiAgICAgICAgdGhpcy5jaGFuZ2VzLnJlbW92ZShpdGVtLCBpbmRleClcbiAgICAgIH0gZWxzZSBpZiAoaXRlbSBpbnN0YW5jZW9mIENhY2hlICYmIHN0eWxlIGluc3RhbmNlb2YgQ2FjaGUpIHtcbiAgICAgICAgY29uc3QgcHJldkNoYW5nZUlkID0gaXRlbS5jaGFuZ2VJZFxuXG4gICAgICAgIGl0ZW0udW5tZXJnZShzdHlsZSlcblxuICAgICAgICBpZiAoaXRlbS5jaGFuZ2VJZCAhPT0gcHJldkNoYW5nZUlkKSB7XG4gICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2UoaW5kZXgsIDEsIGl0ZW0uZ2V0U3R5bGVzKCkpXG4gICAgICAgICAgdGhpcy5jaGFuZ2VJZCsrXG4gICAgICAgICAgdGhpcy5jaGFuZ2VzLmNoYW5nZShpdGVtLCBpbmRleCwgaW5kZXgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtZXJnZSAoY2FjaGU6IENhY2hlPGFueT4pIHtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGNhY2hlLl9rZXlzKSB0aGlzLmFkZChjYWNoZS5fY2hpbGRyZW5baWRdKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVubWVyZ2UgKGNhY2hlOiBDYWNoZTxhbnk+KSB7XG4gICAgZm9yIChjb25zdCBpZCBvZiBjYWNoZS5fa2V5cykgdGhpcy5yZW1vdmUoY2FjaGUuX2NoaWxkcmVuW2lkXSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjbG9uZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBDYWNoZSh0aGlzLmhhc2gpLm1lcmdlKHRoaXMpXG4gIH1cblxufVxuXG4vKipcbiAqIFNlbGVjdG9yIGlzIGEgZHVtYiBjbGFzcyBtYWRlIHRvIHJlcHJlc2VudCBuZXN0ZWQgQ1NTIHNlbGVjdG9ycy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlbGVjdG9yIGltcGxlbWVudHMgQ29udGFpbmVyPFNlbGVjdG9yPiB7XG5cbiAgY29uc3RydWN0b3IgKFxuICAgIHB1YmxpYyBzZWxlY3Rvcjogc3RyaW5nLFxuICAgIHB1YmxpYyBoYXNoOiBIYXNoRnVuY3Rpb24sXG4gICAgcHVibGljIGlkID0gYHMke2hhc2goc2VsZWN0b3IpfWAsXG4gICAgcHVibGljIHBpZCA9ICcnXG4gICkge31cblxuICBnZXRTdHlsZXMgKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdG9yXG4gIH1cblxuICBnZXRJZGVudGlmaWVyICgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5waWR9LiR7dGhpcy5zZWxlY3Rvcn1gXG4gIH1cblxuICBjbG9uZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBTZWxlY3Rvcih0aGlzLnNlbGVjdG9yLCB0aGlzLmhhc2gsIHRoaXMuaWQsIHRoaXMucGlkKVxuICB9XG5cbn1cblxuLyoqXG4gKiBUaGUgc3R5bGUgY29udGFpbmVyIHJlZ2lzdGVycyBhIHN0eWxlIHN0cmluZyB3aXRoIHNlbGVjdG9ycy5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0eWxlIGV4dGVuZHMgQ2FjaGU8U2VsZWN0b3I+IGltcGxlbWVudHMgQ29udGFpbmVyPFN0eWxlPiB7XG5cbiAgY29uc3RydWN0b3IgKHB1YmxpYyBzdHlsZTogc3RyaW5nLCBwdWJsaWMgaGFzaDogSGFzaEZ1bmN0aW9uLCBwdWJsaWMgaWQgPSBgYyR7aGFzaChzdHlsZSl9YCkge1xuICAgIHN1cGVyKGhhc2gpXG4gIH1cblxuICBnZXRTdHlsZXMgKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuc2hlZXQuam9pbignLCcpfXske3RoaXMuc3R5bGV9fWBcbiAgfVxuXG4gIGdldElkZW50aWZpZXIgKCkge1xuICAgIHJldHVybiB0aGlzLnN0eWxlXG4gIH1cblxuICBjbG9uZSAoKTogU3R5bGUge1xuICAgIHJldHVybiBuZXcgU3R5bGUodGhpcy5zdHlsZSwgdGhpcy5oYXNoLCB0aGlzLmlkKS5tZXJnZSh0aGlzKVxuICB9XG5cbn1cblxuLyoqXG4gKiBJbXBsZW1lbnQgcnVsZSBsb2dpYyBmb3Igc3R5bGUgb3V0cHV0LlxuICovXG5leHBvcnQgY2xhc3MgUnVsZSBleHRlbmRzIENhY2hlPFJ1bGUgfCBTdHlsZT4gaW1wbGVtZW50cyBDb250YWluZXI8UnVsZT4ge1xuXG4gIGNvbnN0cnVjdG9yIChcbiAgICBwdWJsaWMgcnVsZTogc3RyaW5nLFxuICAgIHB1YmxpYyBzdHlsZSA9ICcnLFxuICAgIHB1YmxpYyBoYXNoOiBIYXNoRnVuY3Rpb24sXG4gICAgcHVibGljIGlkID0gYGEke2hhc2goYCR7cnVsZX0uJHtzdHlsZX1gKX1gLFxuICAgIHB1YmxpYyBwaWQgPSAnJ1xuICApIHtcbiAgICBzdXBlcihoYXNoKVxuICB9XG5cbiAgZ2V0U3R5bGVzICgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLnJ1bGV9eyR7dGhpcy5zdHlsZX0ke2pvaW4odGhpcy5zaGVldCl9fWBcbiAgfVxuXG4gIGdldElkZW50aWZpZXIgKCkge1xuICAgIHJldHVybiBgJHt0aGlzLnBpZH0uJHt0aGlzLnJ1bGV9LiR7dGhpcy5zdHlsZX1gXG4gIH1cblxuICBjbG9uZSAoKTogUnVsZSB7XG4gICAgcmV0dXJuIG5ldyBSdWxlKHRoaXMucnVsZSwgdGhpcy5zdHlsZSwgdGhpcy5oYXNoLCB0aGlzLmlkLCB0aGlzLnBpZCkubWVyZ2UodGhpcylcbiAgfVxuXG59XG5cbi8qKlxuICogVGhlIEZyZWVTdHlsZSBjbGFzcyBpbXBsZW1lbnRzIHRoZSBBUEkgZm9yIGV2ZXJ5dGhpbmcgZWxzZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZyZWVTdHlsZSBleHRlbmRzIENhY2hlPFJ1bGUgfCBTdHlsZT4gaW1wbGVtZW50cyBDb250YWluZXI8RnJlZVN0eWxlPiB7XG5cbiAgY29uc3RydWN0b3IgKFxuICAgIHB1YmxpYyBoYXNoID0gc3RyaW5nSGFzaCxcbiAgICBwdWJsaWMgZGVidWcgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnZbJ05PREVfRU5WJ10gIT09ICdwcm9kdWN0aW9uJyxcbiAgICBwdWJsaWMgaWQgPSBgZiR7KCsrdW5pcXVlSWQpLnRvU3RyaW5nKDM2KX1gLFxuICAgIGNoYW5nZXM/OiBDaGFuZ2VzXG4gICkge1xuICAgIHN1cGVyKGhhc2gsIGNoYW5nZXMpXG4gIH1cblxuICByZWdpc3RlclN0eWxlIChzdHlsZXM6IFN0eWxlcywgZGlzcGxheU5hbWU/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZWJ1Z05hbWUgPSB0aGlzLmRlYnVnID8gZGlzcGxheU5hbWUgOiB1bmRlZmluZWRcbiAgICBjb25zdCB7IGNhY2hlLCBpZCB9ID0gY29tcG9zZVN0eWxlcyh0aGlzLCAnJicsIHN0eWxlcywgdHJ1ZSwgZGVidWdOYW1lKVxuICAgIHRoaXMubWVyZ2UoY2FjaGUpXG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICByZWdpc3RlcktleWZyYW1lcyAoa2V5ZnJhbWVzOiBTdHlsZXMsIGRpc3BsYXlOYW1lPzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJIYXNoUnVsZSgnQGtleWZyYW1lcycsIGtleWZyYW1lcywgZGlzcGxheU5hbWUpXG4gIH1cblxuICByZWdpc3Rlckhhc2hSdWxlIChwcmVmaXg6IHN0cmluZywgc3R5bGVzOiBTdHlsZXMsIGRpc3BsYXlOYW1lPzogc3RyaW5nKSB7XG4gICAgY29uc3QgZGVidWdOYW1lID0gdGhpcy5kZWJ1ZyA/IGRpc3BsYXlOYW1lIDogdW5kZWZpbmVkXG4gICAgY29uc3QgeyBjYWNoZSwgcGlkLCBpZCB9ID0gY29tcG9zZVN0eWxlcyh0aGlzLCAnJywgc3R5bGVzLCBmYWxzZSwgZGVidWdOYW1lKVxuICAgIGNvbnN0IHJ1bGUgPSBuZXcgUnVsZShgJHtwcmVmaXh9ICR7ZXNjYXBlKGlkKX1gLCB1bmRlZmluZWQsIHRoaXMuaGFzaCwgdW5kZWZpbmVkLCBwaWQpXG4gICAgdGhpcy5hZGQocnVsZS5tZXJnZShjYWNoZSkpXG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICByZWdpc3RlclJ1bGUgKHJ1bGU6IHN0cmluZywgc3R5bGVzOiBTdHlsZXMpIHtcbiAgICB0aGlzLm1lcmdlKGNvbXBvc2VTdHlsZXModGhpcywgcnVsZSwgc3R5bGVzLCBmYWxzZSkuY2FjaGUpXG4gIH1cblxuICByZWdpc3RlckNzcyAoc3R5bGVzOiBTdHlsZXMpIHtcbiAgICB0aGlzLm1lcmdlKGNvbXBvc2VTdHlsZXModGhpcywgJycsIHN0eWxlcywgZmFsc2UpLmNhY2hlKVxuICB9XG5cbiAgZ2V0U3R5bGVzICgpOiBzdHJpbmcge1xuICAgIHJldHVybiBqb2luKHRoaXMuc2hlZXQpXG4gIH1cblxuICBnZXRJZGVudGlmaWVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5pZFxuICB9XG5cbiAgY2xvbmUgKCk6IEZyZWVTdHlsZSB7XG4gICAgcmV0dXJuIG5ldyBGcmVlU3R5bGUodGhpcy5oYXNoLCB0aGlzLmRlYnVnLCB0aGlzLmlkLCB0aGlzLmNoYW5nZXMpLm1lcmdlKHRoaXMpXG4gIH1cblxufVxuXG4vKipcbiAqIEV4cG9ydHMgYSBzaW1wbGUgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IGluc3RhbmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlIChoYXNoPzogSGFzaEZ1bmN0aW9uLCBkZWJ1Zz86IGJvb2xlYW4sIGNoYW5nZXM/OiBDaGFuZ2VzKSB7XG4gIHJldHVybiBuZXcgRnJlZVN0eWxlKGhhc2gsIGRlYnVnLCB1bmRlZmluZWQsIGNoYW5nZXMpXG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiaW1wb3J0IHsgVHlwZVN0eWxlIH0gZnJvbSAnLi9pbnRlcm5hbC90eXBlc3R5bGUnO1xyXG5leHBvcnQgeyBUeXBlU3R5bGUgfTtcclxuLyoqXHJcbiAqIEFsbCB0aGUgQ1NTIHR5cGVzIGluIHRoZSAndHlwZXMnIG5hbWVzcGFjZVxyXG4gKi9cclxuaW1wb3J0ICogYXMgdHlwZXMgZnJvbSAnLi90eXBlcyc7XHJcbmV4cG9ydCB7IHR5cGVzIH07XHJcbi8qKlxyXG4gKiBFeHBvcnQgY2VydGFpbiB1dGlsaXRpZXNcclxuICovXHJcbmV4cG9ydCB7IGV4dGVuZCwgY2xhc3NlcywgbWVkaWEgfSBmcm9tICcuL2ludGVybmFsL3V0aWxpdGllcyc7XHJcbi8qKiBaZXJvIGNvbmZpZ3VyYXRpb24sIGRlZmF1bHQgaW5zdGFuY2Ugb2YgVHlwZVN0eWxlICovXHJcbnZhciB0cyA9IG5ldyBUeXBlU3R5bGUoeyBhdXRvR2VuZXJhdGVUYWc6IHRydWUgfSk7XHJcbi8qKiBTZXRzIHRoZSB0YXJnZXQgdGFnIHdoZXJlIHdlIHdyaXRlIHRoZSBjc3Mgb24gc3R5bGUgdXBkYXRlcyAqL1xyXG5leHBvcnQgdmFyIHNldFN0eWxlc1RhcmdldCA9IHRzLnNldFN0eWxlc1RhcmdldDtcclxuLyoqXHJcbiAqIEluc2VydCBgcmF3YCBDU1MgYXMgYSBzdHJpbmcuIFRoaXMgaXMgdXNlZnVsIGZvciBlLmcuXHJcbiAqIC0gdGhpcmQgcGFydHkgQ1NTIHRoYXQgeW91IGFyZSBjdXN0b21pemluZyB3aXRoIHRlbXBsYXRlIHN0cmluZ3NcclxuICogLSBnZW5lcmF0aW5nIHJhdyBDU1MgaW4gSmF2YVNjcmlwdFxyXG4gKiAtIHJlc2V0IGxpYnJhcmllcyBsaWtlIG5vcm1hbGl6ZS5jc3MgdGhhdCB5b3UgY2FuIHVzZSB3aXRob3V0IGxvYWRlcnNcclxuICovXHJcbmV4cG9ydCB2YXIgY3NzUmF3ID0gdHMuY3NzUmF3O1xyXG4vKipcclxuICogVGFrZXMgQ1NTUHJvcGVydGllcyBhbmQgcmVnaXN0ZXJzIGl0IHRvIGEgZ2xvYmFsIHNlbGVjdG9yIChib2R5LCBodG1sLCBldGMuKVxyXG4gKi9cclxuZXhwb3J0IHZhciBjc3NSdWxlID0gdHMuY3NzUnVsZTtcclxuLyoqXHJcbiAqIFJlbmRlcnMgc3R5bGVzIHRvIHRoZSBzaW5nbGV0b24gdGFnIGltZWRpYXRlbHlcclxuICogTk9URTogWW91IHNob3VsZCBvbmx5IGNhbGwgaXQgb24gaW5pdGlhbCByZW5kZXIgdG8gcHJldmVudCBhbnkgbm9uIENTUyBmbGFzaC5cclxuICogQWZ0ZXIgdGhhdCBpdCBpcyBrZXB0IHN5bmMgdXNpbmcgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgYW5kIHdlIGhhdmVuJ3Qgbm90aWNlZCBhbnkgYmFkIGZsYXNoZXMuXHJcbiAqKi9cclxuZXhwb3J0IHZhciBmb3JjZVJlbmRlclN0eWxlcyA9IHRzLmZvcmNlUmVuZGVyU3R5bGVzO1xyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiB0byByZWdpc3RlciBhbiBAZm9udC1mYWNlXHJcbiAqL1xyXG5leHBvcnQgdmFyIGZvbnRGYWNlID0gdHMuZm9udEZhY2U7XHJcbi8qKlxyXG4gKiBBbGxvd3MgdXNlIHRvIHVzZSB0aGUgc3R5bGVzaGVldCBpbiBhIG5vZGUuanMgZW52aXJvbm1lbnRcclxuICovXHJcbmV4cG9ydCB2YXIgZ2V0U3R5bGVzID0gdHMuZ2V0U3R5bGVzO1xyXG4vKipcclxuICogVGFrZXMga2V5ZnJhbWVzIGFuZCByZXR1cm5zIGEgZ2VuZXJhdGVkIGFuaW1hdGlvbk5hbWVcclxuICovXHJcbmV4cG9ydCB2YXIga2V5ZnJhbWVzID0gdHMua2V5ZnJhbWVzO1xyXG4vKipcclxuICogSGVscHMgd2l0aCB0ZXN0aW5nLiBSZWluaXRpYWxpemVzIEZyZWVTdHlsZSArIHJhd1xyXG4gKi9cclxuZXhwb3J0IHZhciByZWluaXQgPSB0cy5yZWluaXQ7XHJcbi8qKlxyXG4gKiBUYWtlcyBDU1NQcm9wZXJ0aWVzIGFuZCByZXR1cm4gYSBnZW5lcmF0ZWQgY2xhc3NOYW1lIHlvdSBjYW4gdXNlIG9uIHlvdXIgY29tcG9uZW50XHJcbiAqL1xyXG5leHBvcnQgdmFyIHN0eWxlID0gdHMuc3R5bGU7XHJcbi8qKlxyXG4gKiBUYWtlcyBhbiBvYmplY3Qgd2hlcmUgcHJvcGVydHkgbmFtZXMgYXJlIGlkZWFsIGNsYXNzIG5hbWVzIGFuZCBwcm9wZXJ0eSB2YWx1ZXMgYXJlIENTU1Byb3BlcnRpZXMsIGFuZFxyXG4gKiByZXR1cm5zIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgdGhlIHNhbWUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHRoZSBwcm9wZXJ0eSB2YWx1ZXMgYXJlXHJcbiAqIHRoZSBhY3R1YWwgZ2VuZXJhdGVkIGNsYXNzIG5hbWVzIHVzaW5nIHRoZSBpZGVhbCBjbGFzcyBuYW1lIGFzIHRoZSAkZGVidWdOYW1lXHJcbiAqL1xyXG5leHBvcnQgdmFyIHN0eWxlc2hlZXQgPSB0cy5zdHlsZXNoZWV0O1xyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBUeXBlU3R5bGUgc2VwYXJhdGUgZnJvbSB0aGUgZGVmYXVsdCBpbnN0YW5jZS5cclxuICpcclxuICogLSBVc2UgdGhpcyBmb3IgY3JlYXRpbmcgYSBkaWZmZXJlbnQgdHlwZXN0eWxlIGluc3RhbmNlIGZvciBhIHNoYWRvdyBkb20gY29tcG9uZW50LlxyXG4gKiAtIFVzZSB0aGlzIGlmIHlvdSBkb24ndCB3YW50IGFuIGF1dG8gdGFnIGdlbmVyYXRlZCBhbmQgeW91IGp1c3Qgd2FudCB0byBjb2xsZWN0IHRoZSBDU1MuXHJcbiAqXHJcbiAqIE5PVEU6IHN0eWxlcyBhcmVuJ3Qgc2hhcmVkIGJldHdlZW4gZGlmZmVyZW50IGluc3RhbmNlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUeXBlU3R5bGUodGFyZ2V0KSB7XHJcbiAgICB2YXIgaW5zdGFuY2UgPSBuZXcgVHlwZVN0eWxlKHsgYXV0b0dlbmVyYXRlVGFnOiBmYWxzZSB9KTtcclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBpbnN0YW5jZS5zZXRTdHlsZXNUYXJnZXQodGFyZ2V0KTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBGcmVlU3R5bGUgZnJvbSAnZnJlZS1zdHlsZSc7XHJcbi8qKlxyXG4gKiBXZSBuZWVkIHRvIGRvIHRoZSBmb2xsb3dpbmcgdG8gKm91ciogb2JqZWN0cyBiZWZvcmUgcGFzc2luZyB0byBmcmVlc3R5bGU6XHJcbiAqIC0gRm9yIGFueSBgJG5lc3RgIGRpcmVjdGl2ZSBtb3ZlIHVwIHRvIEZyZWVTdHlsZSBzdHlsZSBuZXN0aW5nXHJcbiAqIC0gRm9yIGFueSBgJHVuaXF1ZWAgZGlyZWN0aXZlIG1hcCB0byBGcmVlU3R5bGUgVW5pcXVlXHJcbiAqIC0gRm9yIGFueSBgJGRlYnVnTmFtZWAgZGlyZWN0aXZlIHJldHVybiB0aGUgZGVidWcgbmFtZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVN0cmluZ09iaihvYmplY3QpIHtcclxuICAgIC8qKiBUaGUgZmluYWwgcmVzdWx0IHdlIHdpbGwgcmV0dXJuICovXHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICB2YXIgZGVidWdOYW1lID0gJyc7XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgLyoqIEdyYWIgdGhlIHZhbHVlIHVwZnJvbnQgKi9cclxuICAgICAgICB2YXIgdmFsID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgLyoqIFR5cGVTdHlsZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgKi9cclxuICAgICAgICBpZiAoa2V5ID09PSAnJHVuaXF1ZScpIHtcclxuICAgICAgICAgICAgcmVzdWx0W0ZyZWVTdHlsZS5JU19VTklRVUVdID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICckbmVzdCcpIHtcclxuICAgICAgICAgICAgdmFyIG5lc3RlZCA9IHZhbDtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0b3IgaW4gbmVzdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3VicHJvcGVydGllcyA9IG5lc3RlZFtzZWxlY3Rvcl07XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbc2VsZWN0b3JdID0gZW5zdXJlU3RyaW5nT2JqKHN1YnByb3BlcnRpZXMpLnJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICckZGVidWdOYW1lJykge1xyXG4gICAgICAgICAgICBkZWJ1Z05hbWUgPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHJlc3VsdCwgZGVidWdOYW1lOiBkZWJ1Z05hbWUgfTtcclxufVxyXG4vLyB0b2RvOiBiZXR0ZXIgbmFtZSBoZXJlXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBsb2RlS2V5ZnJhbWVzKGZyYW1lcykge1xyXG4gICAgdmFyIHJlc3VsdCA9IHsgJGRlYnVnTmFtZTogdW5kZWZpbmVkLCBrZXlmcmFtZXM6IHt9IH07XHJcbiAgICBmb3IgKHZhciBvZmZzZXQgaW4gZnJhbWVzKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IGZyYW1lc1tvZmZzZXRdO1xyXG4gICAgICAgIGlmIChvZmZzZXQgPT09ICckZGVidWdOYW1lJykge1xyXG4gICAgICAgICAgICByZXN1bHQuJGRlYnVnTmFtZSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5rZXlmcmFtZXNbb2Zmc2V0XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbiIsImltcG9ydCAqIGFzIEZyZWVTdHlsZSBmcm9tIFwiZnJlZS1zdHlsZVwiO1xyXG5pbXBvcnQgeyBlbnN1cmVTdHJpbmdPYmosIGV4cGxvZGVLZXlmcmFtZXMgfSBmcm9tICcuL2Zvcm1hdHRpbmcnO1xyXG5pbXBvcnQgeyBleHRlbmQsIHJhZiB9IGZyb20gJy4vdXRpbGl0aWVzJztcclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZnJlZSBzdHlsZSB3aXRoIG91ciBvcHRpb25zXHJcbiAqL1xyXG52YXIgY3JlYXRlRnJlZVN0eWxlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gRnJlZVN0eWxlLmNyZWF0ZShcclxuLyoqIFVzZSB0aGUgZGVmYXVsdCBoYXNoIGZ1bmN0aW9uICovXHJcbnVuZGVmaW5lZCwgXHJcbi8qKiBQcmVzZXJ2ZSAkZGVidWdOYW1lIHZhbHVlcyAqL1xyXG50cnVlKTsgfTtcclxuLyoqXHJcbiAqIE1haW50YWlucyBhIHNpbmdsZSBzdHlsZXNoZWV0IGFuZCBrZWVwcyBpdCBpbiBzeW5jIHdpdGggcmVxdWVzdGVkIHN0eWxlc1xyXG4gKi9cclxudmFyIFR5cGVTdHlsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFR5cGVTdHlsZShfYSkge1xyXG4gICAgICAgIHZhciBhdXRvR2VuZXJhdGVUYWcgPSBfYS5hdXRvR2VuZXJhdGVUYWc7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbnNlcnQgYHJhd2AgQ1NTIGFzIGEgc3RyaW5nLiBUaGlzIGlzIHVzZWZ1bCBmb3IgZS5nLlxyXG4gICAgICAgICAqIC0gdGhpcmQgcGFydHkgQ1NTIHRoYXQgeW91IGFyZSBjdXN0b21pemluZyB3aXRoIHRlbXBsYXRlIHN0cmluZ3NcclxuICAgICAgICAgKiAtIGdlbmVyYXRpbmcgcmF3IENTUyBpbiBKYXZhU2NyaXB0XHJcbiAgICAgICAgICogLSByZXNldCBsaWJyYXJpZXMgbGlrZSBub3JtYWxpemUuY3NzIHRoYXQgeW91IGNhbiB1c2Ugd2l0aG91dCBsb2FkZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jc3NSYXcgPSBmdW5jdGlvbiAobXVzdEJlVmFsaWRDU1MpIHtcclxuICAgICAgICAgICAgaWYgKCFtdXN0QmVWYWxpZENTUykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9yYXcgKz0gbXVzdEJlVmFsaWRDU1MgfHwgJyc7XHJcbiAgICAgICAgICAgIF90aGlzLl9wZW5kaW5nUmF3Q2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgX3RoaXMuX3N0eWxlVXBkYXRlZCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMgQ1NTUHJvcGVydGllcyBhbmQgcmVnaXN0ZXJzIGl0IHRvIGEgZ2xvYmFsIHNlbGVjdG9yIChib2R5LCBodG1sLCBldGMuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY3NzUnVsZSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgb2JqZWN0c1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0gZW5zdXJlU3RyaW5nT2JqKGV4dGVuZC5hcHBseSh2b2lkIDAsIG9iamVjdHMpKS5yZXN1bHQ7XHJcbiAgICAgICAgICAgIF90aGlzLl9mcmVlU3R5bGUucmVnaXN0ZXJSdWxlKHNlbGVjdG9yLCBvYmplY3QpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbmRlcnMgc3R5bGVzIHRvIHRoZSBzaW5nbGV0b24gdGFnIGltZWRpYXRlbHlcclxuICAgICAgICAgKiBOT1RFOiBZb3Ugc2hvdWxkIG9ubHkgY2FsbCBpdCBvbiBpbml0aWFsIHJlbmRlciB0byBwcmV2ZW50IGFueSBub24gQ1NTIGZsYXNoLlxyXG4gICAgICAgICAqIEFmdGVyIHRoYXQgaXQgaXMga2VwdCBzeW5jIHVzaW5nIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGFuZCB3ZSBoYXZlbid0IG5vdGljZWQgYW55IGJhZCBmbGFzaGVzLlxyXG4gICAgICAgICAqKi9cclxuICAgICAgICB0aGlzLmZvcmNlUmVuZGVyU3R5bGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gX3RoaXMuX2dldFRhZygpO1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRhcmdldC50ZXh0Q29udGVudCA9IF90aGlzLmdldFN0eWxlcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXRpbGl0eSBmdW5jdGlvbiB0byByZWdpc3RlciBhbiBAZm9udC1mYWNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5mb250RmFjZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGZvbnRGYWNlID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb250RmFjZVtfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBmcmVlU3R5bGUgPSBfdGhpcy5fZnJlZVN0eWxlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIF9iID0gZm9udEZhY2U7IF9hIDwgX2IubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmFjZSA9IF9iW19hXTtcclxuICAgICAgICAgICAgICAgIGZyZWVTdHlsZS5yZWdpc3RlclJ1bGUoJ0Bmb250LWZhY2UnLCBmYWNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsbG93cyB1c2UgdG8gdXNlIHRoZSBzdHlsZXNoZWV0IGluIGEgbm9kZS5qcyBlbnZpcm9ubWVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZ2V0U3R5bGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKF90aGlzLl9yYXcgfHwgJycpICsgX3RoaXMuX2ZyZWVTdHlsZS5nZXRTdHlsZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRha2VzIGtleWZyYW1lcyBhbmQgcmV0dXJucyBhIGdlbmVyYXRlZCBhbmltYXRpb25OYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5rZXlmcmFtZXMgPSBmdW5jdGlvbiAoZnJhbWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBfYSA9IGV4cGxvZGVLZXlmcmFtZXMoZnJhbWVzKSwga2V5ZnJhbWVzID0gX2Eua2V5ZnJhbWVzLCAkZGVidWdOYW1lID0gX2EuJGRlYnVnTmFtZTtcclxuICAgICAgICAgICAgLy8gVE9ETzogcmVwbGFjZSAkZGVidWdOYW1lIHdpdGggZGlzcGxheSBuYW1lXHJcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25OYW1lID0gX3RoaXMuX2ZyZWVTdHlsZS5yZWdpc3RlcktleWZyYW1lcyhrZXlmcmFtZXMsICRkZWJ1Z05hbWUpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25OYW1lO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGVscHMgd2l0aCB0ZXN0aW5nLiBSZWluaXRpYWxpemVzIEZyZWVTdHlsZSArIHJhd1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucmVpbml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvKiogcmVpbml0IGZyZWVzdHlsZSAqL1xyXG4gICAgICAgICAgICB2YXIgZnJlZVN0eWxlID0gY3JlYXRlRnJlZVN0eWxlKCk7XHJcbiAgICAgICAgICAgIF90aGlzLl9mcmVlU3R5bGUgPSBmcmVlU3R5bGU7XHJcbiAgICAgICAgICAgIF90aGlzLl9sYXN0RnJlZVN0eWxlQ2hhbmdlSWQgPSBmcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgICAgIC8qKiByZWluaXQgcmF3ICovXHJcbiAgICAgICAgICAgIF90aGlzLl9yYXcgPSAnJztcclxuICAgICAgICAgICAgX3RoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgLyoqIENsZWFyIGFueSBzdHlsZXMgdGhhdCB3ZXJlIGZsdXNoZWQgKi9cclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IF90aGlzLl9nZXRUYWcoKTtcclxuICAgICAgICAgICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKiBTZXRzIHRoZSB0YXJnZXQgdGFnIHdoZXJlIHdlIHdyaXRlIHRoZSBjc3Mgb24gc3R5bGUgdXBkYXRlcyAqL1xyXG4gICAgICAgIHRoaXMuc2V0U3R5bGVzVGFyZ2V0ID0gZnVuY3Rpb24gKHRhZykge1xyXG4gICAgICAgICAgICAvKiogQ2xlYXIgYW55IGRhdGEgaW4gYW55IHByZXZpb3VzIHRhZyAqL1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMuX3RhZykge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX3RhZy50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl90YWcgPSB0YWc7XHJcbiAgICAgICAgICAgIC8qKiBUaGlzIHNwZWNpYWwgdGltZSBidWZmZXIgaW1tZWRpYXRlbHkgKi9cclxuICAgICAgICAgICAgX3RoaXMuZm9yY2VSZW5kZXJTdHlsZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRha2VzIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHByb3BlcnR5IHZhbHVlcyBhcmUgQ1NTUHJvcGVydGllcywgYW5kXHJcbiAgICAgICAgICogcmV0dXJucyBhbiBvYmplY3Qgd2hlcmUgcHJvcGVydHkgbmFtZXMgYXJlIHRoZSBzYW1lIGlkZWFsIGNsYXNzIG5hbWVzIGFuZCB0aGUgcHJvcGVydHkgdmFsdWVzIGFyZVxyXG4gICAgICAgICAqIHRoZSBhY3R1YWwgZ2VuZXJhdGVkIGNsYXNzIG5hbWVzIHVzaW5nIHRoZSBpZGVhbCBjbGFzcyBuYW1lIGFzIHRoZSAkZGVidWdOYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0ID0gZnVuY3Rpb24gKGNsYXNzZXMpIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjbGFzc2VzKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGNsYXNzTmFtZXNfMSA9IGNsYXNzTmFtZXM7IF9pIDwgY2xhc3NOYW1lc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzTmFtZXNfMVtfaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NEZWYgPSBjbGFzc2VzW2NsYXNzTmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xhc3NEZWYpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc0RlZi4kZGVidWdOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjbGFzc05hbWVdID0gX3RoaXMuc3R5bGUoY2xhc3NEZWYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZnJlZVN0eWxlID0gY3JlYXRlRnJlZVN0eWxlKCk7XHJcbiAgICAgICAgdGhpcy5fYXV0b0dlbmVyYXRlVGFnID0gYXV0b0dlbmVyYXRlVGFnO1xyXG4gICAgICAgIHRoaXMuX2ZyZWVTdHlsZSA9IGZyZWVTdHlsZTtcclxuICAgICAgICB0aGlzLl9sYXN0RnJlZVN0eWxlQ2hhbmdlSWQgPSBmcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZyA9IDA7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3JhdyA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3RhZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAvLyByZWJpbmQgcHJvdG90eXBlIHRvIFR5cGVTdHlsZS4gIEl0IG1pZ2h0IGJlIGJldHRlciB0byBkbyBhIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5zdHlsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpfVxyXG4gICAgICAgIHRoaXMuc3R5bGUgPSB0aGlzLnN0eWxlLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE9ubHkgY2FsbHMgY2IgYWxsIHN5bmMgb3BlcmF0aW9ucyBzZXR0bGVcclxuICAgICAqL1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5fYWZ0ZXJBbGxTeW5jID0gZnVuY3Rpb24gKGNiKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLl9wZW5kaW5nKys7XHJcbiAgICAgICAgdmFyIHBlbmRpbmcgPSB0aGlzLl9wZW5kaW5nO1xyXG4gICAgICAgIHJhZihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwZW5kaW5nICE9PSBfdGhpcy5fcGVuZGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5fZ2V0VGFnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl90YWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9HZW5lcmF0ZVRhZykge1xyXG4gICAgICAgICAgICB2YXIgdGFnID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCdcclxuICAgICAgICAgICAgICAgID8geyB0ZXh0Q29udGVudDogJycgfVxyXG4gICAgICAgICAgICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RhZyA9IHRhZztcclxuICAgICAgICAgICAgcmV0dXJuIHRhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICAvKiogQ2hlY2tzIGlmIHRoZSBzdHlsZSB0YWcgbmVlZHMgdXBkYXRpbmcgYW5kIGlmIHNvIHF1ZXVlcyB1cCB0aGUgY2hhbmdlICovXHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLl9zdHlsZVVwZGF0ZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgY2hhbmdlSWQgPSB0aGlzLl9mcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgdmFyIGxhc3RDaGFuZ2VJZCA9IHRoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZDtcclxuICAgICAgICBpZiAoIXRoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgJiYgY2hhbmdlSWQgPT09IGxhc3RDaGFuZ2VJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZCA9IGNoYW5nZUlkO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9hZnRlckFsbFN5bmMoZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMuZm9yY2VSZW5kZXJTdHlsZXMoKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5zdHlsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZnJlZVN0eWxlID0gdGhpcy5fZnJlZVN0eWxlO1xyXG4gICAgICAgIHZhciBfYSA9IGVuc3VyZVN0cmluZ09iaihleHRlbmQuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKSwgcmVzdWx0ID0gX2EucmVzdWx0LCBkZWJ1Z05hbWUgPSBfYS5kZWJ1Z05hbWU7XHJcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGRlYnVnTmFtZSA/IGZyZWVTdHlsZS5yZWdpc3RlclN0eWxlKHJlc3VsdCwgZGVidWdOYW1lKSA6IGZyZWVTdHlsZS5yZWdpc3RlclN0eWxlKHJlc3VsdCk7XHJcbiAgICAgICAgdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVHlwZVN0eWxlO1xyXG59KCkpO1xyXG5leHBvcnQgeyBUeXBlU3R5bGUgfTtcclxuIiwiLyoqIFJhZiBmb3Igbm9kZSArIGJyb3dzZXIgKi9cclxuZXhwb3J0IHZhciByYWYgPSB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSAndW5kZWZpbmVkJ1xyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHN1cmUgc2V0VGltZW91dCBpcyBhbHdheXMgaW52b2tlZCB3aXRoXHJcbiAgICAgKiBgdGhpc2Agc2V0IHRvIGB3aW5kb3dgIG9yIGBnbG9iYWxgIGF1dG9tYXRpY2FsbHlcclxuICAgICAqKi9cclxuICAgID8gZnVuY3Rpb24gKGNiKSB7IHJldHVybiBzZXRUaW1lb3V0KGNiKTsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHN1cmUgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSBpcyBhbHdheXMgaW52b2tlZCB3aXRoIGB0aGlzYCB3aW5kb3dcclxuICAgICAqIFdlIG1pZ2h0IGhhdmUgcmFmIHdpdGhvdXQgd2luZG93IGluIGNhc2Ugb2YgYHJhZi9wb2x5ZmlsbGAgKHJlY29tbWVuZGVkIGJ5IFJlYWN0KVxyXG4gICAgICoqL1xyXG4gICAgOiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xyXG4gICAgICAgID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbiAgICAgICAgOiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpO1xyXG4vKipcclxuICogVXRpbGl0eSB0byBqb2luIGNsYXNzZXMgY29uZGl0aW9uYWxseVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzZXMoKSB7XHJcbiAgICB2YXIgY2xhc3NlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBjbGFzc2VzW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2xhc3Nlcy5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuICEhYzsgfSkuam9pbignICcpO1xyXG59XHJcbi8qKlxyXG4gKiBNZXJnZXMgdmFyaW91cyBzdHlsZXMgaW50byBhIHNpbmdsZSBzdHlsZSBvYmplY3QuXHJcbiAqIE5vdGU6IGlmIHR3byBvYmplY3RzIGhhdmUgdGhlIHNhbWUgcHJvcGVydHkgdGhlIGxhc3Qgb25lIHdpbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoKSB7XHJcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBvYmplY3RzW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICAvKiogVGhlIGZpbmFsIHJlc3VsdCB3ZSB3aWxsIHJldHVybiAqL1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgX2EgPSAwLCBvYmplY3RzXzEgPSBvYmplY3RzOyBfYSA8IG9iamVjdHNfMS5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICB2YXIgb2JqZWN0ID0gb2JqZWN0c18xW19hXTtcclxuICAgICAgICBpZiAob2JqZWN0ID09IG51bGwgfHwgb2JqZWN0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICAvKiogRmFsc3kgdmFsdWVzIGV4Y2VwdCBhIGV4cGxpY2l0IDAgaXMgaWdub3JlZCAqL1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgICAgIGlmICghdmFsICYmIHZhbCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyoqIGlmIG5lc3RlZCBtZWRpYSBvciBwc2V1ZG8gc2VsZWN0b3IgKi9cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJyRuZXN0JyAmJiB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gcmVzdWx0WyckbmVzdCddID8gZXh0ZW5kKHJlc3VsdFsnJG5lc3QnXSwgdmFsKSA6IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgoa2V5LmluZGV4T2YoJyYnKSAhPT0gLTEgfHwga2V5LmluZGV4T2YoJ0BtZWRpYScpID09PSAwKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSByZXN1bHRba2V5XSA/IGV4dGVuZChyZXN1bHRba2V5XSwgdmFsKSA6IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vKipcclxuICogVXRpbGl0eSB0byBoZWxwIGN1c3RvbWl6ZSBzdHlsZXMgd2l0aCBtZWRpYSBxdWVyaWVzLiBlLmcuXHJcbiAqIGBgYFxyXG4gKiBzdHlsZShcclxuICogIG1lZGlhKHttYXhXaWR0aDo1MDB9LCB7Y29sb3I6J3JlZCd9KVxyXG4gKiApXHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IHZhciBtZWRpYSA9IGZ1bmN0aW9uIChtZWRpYVF1ZXJ5KSB7XHJcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBvYmplY3RzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgdmFyIG1lZGlhUXVlcnlTZWN0aW9ucyA9IFtdO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkudHlwZSlcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChtZWRpYVF1ZXJ5LnR5cGUpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkub3JpZW50YXRpb24pXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIob3JpZW50YXRpb246IFwiICsgbWVkaWFRdWVyeS5vcmllbnRhdGlvbiArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1pbldpZHRoKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1pbi13aWR0aDogXCIgKyBtZWRpYUxlbmd0aChtZWRpYVF1ZXJ5Lm1pbldpZHRoKSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1heFdpZHRoKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1heC13aWR0aDogXCIgKyBtZWRpYUxlbmd0aChtZWRpYVF1ZXJ5Lm1heFdpZHRoKSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1pbkhlaWdodClcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihtaW4taGVpZ2h0OiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWluSGVpZ2h0KSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1heEhlaWdodClcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihtYXgtaGVpZ2h0OiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWF4SGVpZ2h0KSArIFwiKVwiKTtcclxuICAgIHZhciBzdHJpbmdNZWRpYVF1ZXJ5ID0gXCJAbWVkaWEgXCIgKyBtZWRpYVF1ZXJ5U2VjdGlvbnMuam9pbignIGFuZCAnKTtcclxuICAgIHZhciBvYmplY3QgPSB7XHJcbiAgICAgICAgJG5lc3Q6IChfYSA9IHt9LFxyXG4gICAgICAgICAgICBfYVtzdHJpbmdNZWRpYVF1ZXJ5XSA9IGV4dGVuZC5hcHBseSh2b2lkIDAsIG9iamVjdHMpLFxyXG4gICAgICAgICAgICBfYSlcclxuICAgIH07XHJcbiAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgdmFyIF9hO1xyXG59O1xyXG52YXIgbWVkaWFMZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiB2YWx1ZSArIFwicHhcIjtcclxufTtcclxuIiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gIENvbW1vbi50c3ggLSBHYnRjXHJcbi8vXHJcbi8vICBDb3B5cmlnaHQgwqkgMjAxOCwgR3JpZCBQcm90ZWN0aW9uIEFsbGlhbmNlLiAgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuLy9cclxuLy8gIExpY2Vuc2VkIHRvIHRoZSBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UgKEdQQSkgdW5kZXIgb25lIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiBTZWVcclxuLy8gIHRoZSBOT1RJQ0UgZmlsZSBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC5cclxuLy8gIFRoZSBHUEEgbGljZW5zZXMgdGhpcyBmaWxlIHRvIHlvdSB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHRoZSBcIkxpY2Vuc2VcIjsgeW91IG1heSBub3QgdXNlIHRoaXNcclxuLy8gIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0OlxyXG4vL1xyXG4vLyAgICAgIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuLy9cclxuLy8gIFVubGVzcyBhZ3JlZWQgdG8gaW4gd3JpdGluZywgdGhlIHN1YmplY3Qgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW5cclxuLy8gIFwiQVMtSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFJlZmVyIHRvIHRoZVxyXG4vLyAgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMuXHJcbi8vXHJcbi8vICBDb2RlIE1vZGlmaWNhdGlvbiBIaXN0b3J5OlxyXG4vLyAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAgMTAvMTMvMjAyMCAtIEMuIExhY2tuZXJcclxuLy8gICAgICAgR2VuZXJhdGVkIG9yaWdpbmFsIHZlcnNpb24gb2Ygc291cmNlIGNvZGUuXHJcbi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHN0eWxlIH0gZnJvbSBcInR5cGVzdHlsZVwiXHJcblxyXG4vLyBzdHlsZXNcclxuZXhwb3J0IGNvbnN0IG91dGVyRGl2OiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgIG1hcmdpbkxlZnQ6ICdhdXRvJyxcclxuICAgIG1hcmdpblJpZ2h0OiAnYXV0bycsXHJcbiAgICBvdmVyZmxvd1k6ICdoaWRkZW4nLFxyXG4gICAgb3ZlcmZsb3dYOiAnaGlkZGVuJyxcclxuICAgIHBhZGRpbmc6ICcwZW0nLFxyXG4gICAgekluZGV4OiAxMDAwLFxyXG4gICAgYm94U2hhZG93OiAnNHB4IDRweCAycHggIzg4ODg4OCcsXHJcbiAgICBib3JkZXI6ICcycHggc29saWQgYmxhY2snLFxyXG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICB0b3A6ICcwJyxcclxuICAgIGxlZnQ6IDAsXHJcbiAgICBkaXNwbGF5OiAnbm9uZScsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlID0gc3R5bGUoe1xyXG4gICAgd2lkdGg6ICcxMDAlJyxcclxuICAgIGhlaWdodDogJzIwcHgnLFxyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnIzgwODA4MCcsXHJcbiAgICBjdXJzb3I6ICdtb3ZlJyxcclxuICAgIHBhZGRpbmc6ICcwZW0nXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNsb3NlQnV0dG9uID0gc3R5bGUoe1xyXG4gICAgYmFja2dyb3VuZDogJ2ZpcmVicmljaycsXHJcbiAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgdG9wOiAwLFxyXG4gICAgcmlnaHQ6IDAsXHJcbiAgICB3aWR0aDogJzIwcHgnLFxyXG4gICAgaGVpZ2h0OiAnMjBweCcsXHJcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgdmVydGljYWxBbGlnbjogJ21pZGRsZScsXHJcbiAgICBwYWRkaW5nOiAwLFxyXG4gICAgYm9yZGVyOiAwLFxyXG4gICAgJG5lc3Q6IHtcclxuICAgICAgICBcIiY6aG92ZXJcIjoge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnb3JhbmdlcmVkJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5pbnRlcmZhY2UgSXdpbmRvd1Byb3BzIHtcclxuICAgIHNob3c6IGJvb2xlYW4sXHJcbiAgICBjbG9zZTogKCkgPT4gdm9pZCxcclxuICAgIHdpZHRoOiBudW1iZXIsXHJcbiAgICBtYXhIZWlnaHQ6IG51bWJlcixcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFdpZGdldFdpbmRvdzogUmVhY3QuRnVuY3Rpb25Db21wb25lbnQ8SXdpbmRvd1Byb3BzPiA9IChwcm9wcykgPT4ge1xyXG4gICAgY29uc3QgcmVmV2luZG93ID0gUmVhY3QudXNlUmVmKG51bGwpO1xyXG4gICAgY29uc3QgcmVmSGFuZGxlID0gUmVhY3QudXNlUmVmKG51bGwpO1xyXG5cclxuICAgIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHByb3BzLnNob3cpXHJcbiAgICAgICAgICAgICgkKHJlZldpbmRvdy5jdXJyZW50KSBhcyBhbnkpLmRyYWdnYWJsZSh7IHNjcm9sbDogZmFsc2UsIGhhbmRsZTogcmVmSGFuZGxlLmN1cnJlbnQsIGNvbnRhaW5tZW50OiAnI2NoYXJ0cGFuZWwnIH0pO1xyXG4gICAgfSlcclxuXHJcbiAgICBpZiAoIXByb3BzLnNob3cpXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8IGRpdiByZWY9e3JlZldpbmRvd30gY2xhc3NOYW1lPVwidWktd2lkZ2V0LWNvbnRlbnRcIiBzdHlsZT17eyAuLi5vdXRlckRpdiwgd2lkdGg6IHByb3BzLndpZHRoLCBtYXhIZWlnaHQ6IHByb3BzLm1heEhlaWdodCwgZGlzcGxheTogdW5kZWZpbmVkIH19ID5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXI6ICdibGFjayBzb2xpZCAycHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiByZWY9e3JlZkhhbmRsZX0gY2xhc3NOYW1lPXtoYW5kbGV9PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogcHJvcHMud2lkdGggLSA2LCBtYXhIZWlnaHQ6IHByb3BzLm1heEhlaWdodCAtIDI0IH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHtwcm9wcy5jaGlsZHJlbn1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9e2Nsb3NlQnV0dG9ufSBvbkNsaWNrPXsoKSA9PiBwcm9wcy5jbG9zZSgpfT5YPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIClcclxufSIsIi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vICBTY2FsYXJTdGF0cy50c3ggLSBHYnRjXHJcbi8vXHJcbi8vICBDb3B5cmlnaHQgwqkgMjAxOCwgR3JpZCBQcm90ZWN0aW9uIEFsbGlhbmNlLiAgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuLy9cclxuLy8gIExpY2Vuc2VkIHRvIHRoZSBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UgKEdQQSkgdW5kZXIgb25lIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiBTZWVcclxuLy8gIHRoZSBOT1RJQ0UgZmlsZSBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC5cclxuLy8gIFRoZSBHUEEgbGljZW5zZXMgdGhpcyBmaWxlIHRvIHlvdSB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHRoZSBcIkxpY2Vuc2VcIjsgeW91IG1heSBub3QgdXNlIHRoaXNcclxuLy8gIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0OlxyXG4vL1xyXG4vLyAgICAgIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuLy9cclxuLy8gIFVubGVzcyBhZ3JlZWQgdG8gaW4gd3JpdGluZywgdGhlIHN1YmplY3Qgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW5cclxuLy8gIFwiQVMtSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFJlZmVyIHRvIHRoZVxyXG4vLyAgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMuXHJcbi8vXHJcbi8vICBDb2RlIE1vZGlmaWNhdGlvbiBIaXN0b3J5OlxyXG4vLyAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAgMDUvMTQvMjAxOCAtIEJpbGx5IEVybmVzdFxyXG4vLyAgICAgICBHZW5lcmF0ZWQgb3JpZ2luYWwgdmVyc2lvbiBvZiBzb3VyY2UgY29kZS5cclxuLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgV2lkZ2V0V2luZG93IH0gZnJvbSAnLi9Db21tb24nO1xyXG5cclxuaW50ZXJmYWNlIElwcm9wcyB7IGNsb3NlQ2FsbGJhY2s6ICgpID0+IHZvaWQsIGV4cG9ydENhbGxiYWNrOiAoKSA9PiB2b2lkLCBldmVudElkOiBudW1iZXIsIGlzT3BlbjogYm9vbGVhbiB9XHJcblxyXG5jb25zdCBTY2FsYXJTdGF0c1dpZGdldCA9IChwcm9wczogSXByb3BzKSA9PiB7XHJcbiAgICBjb25zdCBbc3RhdHMsIHNldFN0YXRzXSA9IFJlYWN0LnVzZVN0YXRlPEFycmF5PEpTWC5FbGVtZW50Pj4oW10pO1xyXG5cclxuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAgICAgbGV0IGhhbmRsZSA9IGdldERhdGEoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuICgpID0+IHsgaWYgKGhhbmRsZSAhPSB1bmRlZmluZWQgJiYgaGFuZGxlLmFib3J0ICE9IHVuZGVmaW5lZCkgaGFuZGxlLmFib3J0KCk7fVxyXG4gICAgfSwgW3Byb3BzLmV2ZW50SWRdKVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldERhdGEoKTogSlF1ZXJ5LmpxWEhSIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IGhhbmRsZSA9ICQuYWpheCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIHVybDogYCR7aG9tZVBhdGh9YXBpL09wZW5TRUUvR2V0U2NhbGFyU3RhdHM/ZXZlbnRJZD0ke3Byb3BzLmV2ZW50SWR9YCxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZSxcclxuICAgICAgICAgICAgYXN5bmM6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaGFuZGxlLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgc2V0U3RhdHMoT2JqZWN0LmtleXMoZCkubWFwKGl0ZW0gPT5cclxuICAgICAgICAgICAgICAgIDx0ciBzdHlsZT17eyBkaXNwbGF5OiAndGFibGUnLCB0YWJsZUxheW91dDogJ2ZpeGVkJywgd2lkdGg6ICcxMDAlJyB9fSBrZXk9e2l0ZW19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZD57aXRlbX08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZD57ZFtpdGVtXX08L3RkPlxyXG4gICAgICAgICAgICAgICAgPC90cj4pKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBoYW5kbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPFdpZGdldFdpbmRvdyBzaG93PXtwcm9wcy5pc09wZW59IGNsb3NlPXtwcm9wcy5jbG9zZUNhbGxiYWNrfSBtYXhIZWlnaHQ9ezQwMH0gd2lkdGg9ezUwMH0+XHJcbiAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ0YWJsZVwiIHN0eWxlPXt7IGZvbnRTaXplOiAnc21hbGwnLCBtYXJnaW5Cb3R0b206IDAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGRpc3BsYXk6ICd0YWJsZScsIHRhYmxlTGF5b3V0OiAnZml4ZWQnLCB3aWR0aDogJ2NhbGMoMTAwJSAtIDFlbSknIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+PHRoPlN0YXQ8L3RoPjx0aD5WYWx1ZSZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOzxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXByaW1hcnknIG9uQ2xpY2s9eygpID0+IHByb3BzLmV4cG9ydENhbGxiYWNrKCl9PkV4cG9ydChjc3YpPC9idXR0b24+PC90aD48L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5IHN0eWxlPXt7IG1heEhlaWdodDogMzEwLCBvdmVyZmxvd1k6ICdhdXRvJywgZGlzcGxheTogJ2Jsb2NrJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3N0YXRzfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgIDwvV2lkZ2V0V2luZG93PlxyXG4gICAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2NhbGFyU3RhdHNXaWRnZXQ7IiwibW9kdWxlLmV4cG9ydHMgPSBSZWFjdDsiXSwic291cmNlUm9vdCI6IiJ9