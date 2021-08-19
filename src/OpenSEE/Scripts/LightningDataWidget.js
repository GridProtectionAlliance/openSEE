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
/******/ 	return __webpack_require__(__webpack_require__.s = "./TSX/jQueryUI Widgets/LightningData.tsx");
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

/***/ "./TSX/jQueryUI Widgets/LightningData.tsx":
/*!************************************************!*\
  !*** ./TSX/jQueryUI Widgets/LightningData.tsx ***!
  \************************************************/
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
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
var moment_1 = __webpack_require__(/*! moment */ "moment");
var Common_1 = __webpack_require__(/*! ./Common */ "./TSX/jQueryUI Widgets/Common.tsx");
var LightningDataWidget = function (props) {
    var _a = __read(React.useState([]), 2), tblData = _a[0], setTBLData = _a[1];
    React.useEffect(function () {
        var handle = getData();
        return function () { if (handle != undefined && handle.abort != undefined)
            handle.abort(); };
    }, [props.eventId]);
    function getData() {
        var lightningQuery = window.LightningQuery;
        if (lightningQuery === undefined)
            return;
        var updateTable = function (displayData) {
            var arr = Array.isArray(displayData) ? displayData : [displayData];
            var result = [];
            result.push(React.createElement("tr", { key: 'Header' }, Object.keys(arr[0]).map(function (key) { return React.createElement("th", { key: key }, key); })));
            result.push.apply(result, __spread(arr.map(function (row, index) {
                return React.createElement("tr", { style: { display: 'table', tableLayout: 'fixed', width: '100%' }, key: "row" + index }, Object.keys(row).map(function (key) { return React.createElement("td", { key: "row" + index + key }, row[key]); }));
            })));
            setTBLData(result);
        };
        var errHandler = function (err) {
            var message = "Unknown error";
            if (typeof (err) === "string")
                message = err;
            else if (err && typeof (err.message) === "string" && err.message !== "")
                message = err.message;
            updateTable({ Error: message });
        };
        updateTable({ State: "Loading..." });
        var handle = $.ajax({
            type: "GET",
            url: homePath + "api/OpenSEE/GetLightningParameters?eventId=" + props.eventId,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        handle.done(function (lightningParameters) {
            var noData = { State: "No Data" };
            var lineKey = lightningParameters.LineKey;
            var startTime = moment_1.utc(lightningParameters.StartTime).toDate();
            var endTime = moment_1.utc(lightningParameters.EndTime).toDate();
            if (!lineKey) {
                updateTable(noData);
                return;
            }
            lightningQuery.queryLineGeometry(lineKey, function (lineGeometry) {
                lightningQuery.queryLineBufferGeometry(lineGeometry, function (lineBufferGeometry) {
                    lightningQuery.queryLightningData(lineBufferGeometry, startTime, endTime, function (lightningData) {
                        var displayData = (lightningData.length !== 0) ? lightningData : noData;
                        updateTable(displayData);
                    }, errHandler);
                }, errHandler);
            }, errHandler);
        });
        return handle;
    }
    return (React.createElement(Common_1.WidgetWindow, { show: props.isOpen, close: props.closeCallback, maxHeight: 500, width: 800 },
        React.createElement("table", { className: "table", style: { fontSize: 'small', marginBottom: 0 } },
            React.createElement("thead", { style: { display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)' } }, tblData[0]),
            React.createElement("tbody", { style: { maxHeight: 410, overflowY: 'auto', display: 'block' } }, tblData.slice(1)))));
};
exports.default = LightningDataWidget;


/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = moment;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL3NyYy9mcmVlLXN0eWxlLnRzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy90eXBlc3R5bGUvbGliLmVzMjAxNS9pbnRlcm5hbC9mb3JtYXR0aW5nLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvdHlwZXN0eWxlLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvdXRpbGl0aWVzLmpzIiwid2VicGFjazovLy8uL1RTWC9qUXVlcnlVSSBXaWRnZXRzL0NvbW1vbi50c3giLCJ3ZWJwYWNrOi8vLy4vVFNYL2pRdWVyeVVJIFdpZGdldHMvTGlnaHRuaW5nRGF0YS50c3giLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibW9tZW50XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiUmVhY3RcIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FB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YUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7d0JBQ3hFLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDN0IsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNuQixDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbkIsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNELE9BQU8sQ0FDSCxvQkFBQyxxQkFBWSxJQUFDLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUc7UUFDaEYsK0JBQU8sU0FBUyxFQUFDLE9BQU8sRUFBQyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUU7WUFDbEUsK0JBQU8sS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxJQUM5RSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQ1A7WUFDUiwrQkFBTyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUNoRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUNiLENBQ1IsQ0FDSSxDQUNuQixDQUFDO0FBQ04sQ0FBQztBQUVELGtCQUFlLG1CQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7QUMxSG5DLHdCOzs7Ozs7Ozs7OztBQ0FBLHVCIiwiZmlsZSI6IkxpZ2h0bmluZ0RhdGFXaWRnZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL1RTWC9qUXVlcnlVSSBXaWRnZXRzL0xpZ2h0bmluZ0RhdGEudHN4XCIpO1xuIiwiLyoqXG4gKiBUaGUgdW5pcXVlIGlkIGlzIHVzZWQgZm9yIHVuaXF1ZSBoYXNoZXMuXG4gKi9cbmxldCB1bmlxdWVJZCA9IDBcblxuLyoqXG4gKiBWYWxpZCBDU1MgcHJvcGVydHkgdmFsdWVzLlxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eVZhbHVlID0gbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZ1xuXG4vKipcbiAqIElucHV0IHN0eWxlcyBvYmplY3QuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3R5bGVzIHtcbiAgW3NlbGVjdG9yOiBzdHJpbmddOiBudWxsIHwgdW5kZWZpbmVkIHwgUHJvcGVydHlWYWx1ZSB8IFByb3BlcnR5VmFsdWVbXSB8IFN0eWxlc1xufVxuXG4vKipcbiAqIEhhc2ggYWxnb3JpdGhtIGludGVyZmFjZS5cbiAqL1xuZXhwb3J0IHR5cGUgSGFzaEZ1bmN0aW9uID0gKHN0cjogc3RyaW5nKSA9PiBzdHJpbmdcblxuLyoqXG4gKiBUYWcgc3R5bGVzIHdpdGggdGhpcyBzdHJpbmcgdG8gZ2V0IHVuaXF1ZSBoYXNoZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBJU19VTklRVUUgPSAnX19ET19OT1RfREVEVVBFX1NUWUxFX18nXG5cbmNvbnN0IHVwcGVyQ2FzZVBhdHRlcm4gPSAvW0EtWl0vZ1xuY29uc3QgbXNQYXR0ZXJuID0gL15tcy0vXG5jb25zdCBpbnRlcnBvbGF0ZVBhdHRlcm4gPSAvJi9nXG5jb25zdCBlc2NhcGVQYXR0ZXJuID0gL1sgISMkJSYoKSorLC4vOzw9Pj9AW1xcXV5ge3x9flwiJ1xcXFxdL2dcbmNvbnN0IHByb3BMb3dlciA9IChtOiBzdHJpbmcpID0+IGAtJHttLnRvTG93ZXJDYXNlKCl9YFxuXG4vKipcbiAqIENTUyBwcm9wZXJ0aWVzIHRoYXQgYXJlIHZhbGlkIHVuaXQtbGVzcyBudW1iZXJzLlxuICovXG5jb25zdCBjc3NOdW1iZXJQcm9wZXJ0aWVzID0gW1xuICAnYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudCcsXG4gICdib3gtZmxleCcsXG4gICdib3gtZmxleC1ncm91cCcsXG4gICdjb2x1bW4tY291bnQnLFxuICAnY291bnRlci1pbmNyZW1lbnQnLFxuICAnY291bnRlci1yZXNldCcsXG4gICdmbGV4JyxcbiAgJ2ZsZXgtZ3JvdycsXG4gICdmbGV4LXBvc2l0aXZlJyxcbiAgJ2ZsZXgtc2hyaW5rJyxcbiAgJ2ZsZXgtbmVnYXRpdmUnLFxuICAnZm9udC13ZWlnaHQnLFxuICAnbGluZS1jbGFtcCcsXG4gICdsaW5lLWhlaWdodCcsXG4gICdvcGFjaXR5JyxcbiAgJ29yZGVyJyxcbiAgJ29ycGhhbnMnLFxuICAndGFiLXNpemUnLFxuICAnd2lkb3dzJyxcbiAgJ3otaW5kZXgnLFxuICAnem9vbScsXG4gIC8vIFNWRyBwcm9wZXJ0aWVzLlxuICAnZmlsbC1vcGFjaXR5JyxcbiAgJ3N0cm9rZS1kYXNob2Zmc2V0JyxcbiAgJ3N0cm9rZS1vcGFjaXR5JyxcbiAgJ3N0cm9rZS13aWR0aCdcbl1cblxuLyoqXG4gKiBNYXAgb2YgY3NzIG51bWJlciBwcm9wZXJ0aWVzLlxuICovXG5jb25zdCBDU1NfTlVNQkVSID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4vLyBBZGQgdmVuZG9yIHByZWZpeGVzIHRvIGFsbCB1bml0LWxlc3MgcHJvcGVydGllcy5cbmZvciAoY29uc3QgcHJlZml4IG9mIFsnLXdlYmtpdC0nLCAnLW1zLScsICctbW96LScsICctby0nLCAnJ10pIHtcbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBjc3NOdW1iZXJQcm9wZXJ0aWVzKSB7XG4gICAgQ1NTX05VTUJFUltwcmVmaXggKyBwcm9wZXJ0eV0gPSB0cnVlXG4gIH1cbn1cblxuLyoqXG4gKiBFc2NhcGUgYSBDU1MgY2xhc3MgbmFtZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVzY2FwZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLnJlcGxhY2UoZXNjYXBlUGF0dGVybiwgJ1xcXFwkJicpXG5cbi8qKlxuICogVHJhbnNmb3JtIGEgSmF2YVNjcmlwdCBwcm9wZXJ0eSBpbnRvIGEgQ1NTIHByb3BlcnR5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaHlwaGVuYXRlIChwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwcm9wZXJ0eU5hbWVcbiAgICAucmVwbGFjZSh1cHBlckNhc2VQYXR0ZXJuLCBwcm9wTG93ZXIpXG4gICAgLnJlcGxhY2UobXNQYXR0ZXJuLCAnLW1zLScpIC8vIEludGVybmV0IEV4cGxvcmVyIHZlbmRvciBwcmVmaXguXG59XG5cbi8qKlxuICogR2VuZXJhdGUgYSBoYXNoIHZhbHVlIGZyb20gYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdIYXNoIChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCB2YWx1ZSA9IDUzODFcbiAgbGV0IGxlbiA9IHN0ci5sZW5ndGhcblxuICB3aGlsZSAobGVuLS0pIHZhbHVlID0gKHZhbHVlICogMzMpIF4gc3RyLmNoYXJDb2RlQXQobGVuKVxuXG4gIHJldHVybiAodmFsdWUgPj4+IDApLnRvU3RyaW5nKDM2KVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhIHN0eWxlIHN0cmluZyB0byBhIENTUyBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHN0eWxlVG9TdHJpbmcgKGtleTogc3RyaW5nLCB2YWx1ZTogUHJvcGVydHlWYWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiB2YWx1ZSAhPT0gMCAmJiAhQ1NTX05VTUJFUltrZXldKSB7XG4gICAgcmV0dXJuIGAke2tleX06JHt2YWx1ZX1weGBcbiAgfVxuXG4gIHJldHVybiBgJHtrZXl9OiR7dmFsdWV9YFxufVxuXG4vKipcbiAqIFNvcnQgYW4gYXJyYXkgb2YgdHVwbGVzIGJ5IGZpcnN0IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzb3J0VHVwbGVzIDxUIGV4dGVuZHMgYW55W10+ICh2YWx1ZTogVFtdKTogVFtdIHtcbiAgcmV0dXJuIHZhbHVlLnNvcnQoKGEsIGIpID0+IGFbMF0gPiBiWzBdID8gMSA6IC0xKVxufVxuXG4vKipcbiAqIENhdGVnb3JpemUgdXNlciBzdHlsZXMuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlU3R5bGVzIChzdHlsZXM6IFN0eWxlcywgaGFzTmVzdGVkU3R5bGVzOiBib29sZWFuKSB7XG4gIGNvbnN0IHByb3BlcnRpZXM6IEFycmF5PFtzdHJpbmcsIFByb3BlcnR5VmFsdWUgfCBQcm9wZXJ0eVZhbHVlW11dPiA9IFtdXG4gIGNvbnN0IG5lc3RlZFN0eWxlczogQXJyYXk8W3N0cmluZywgU3R5bGVzXT4gPSBbXVxuICBsZXQgaXNVbmlxdWUgPSBmYWxzZVxuXG4gIC8vIFNvcnQga2V5cyBiZWZvcmUgYWRkaW5nIHRvIHN0eWxlcy5cbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3R5bGVzKSkge1xuICAgIGNvbnN0IHZhbHVlID0gc3R5bGVzW2tleV1cblxuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoa2V5ID09PSBJU19VTklRVUUpIHtcbiAgICAgICAgaXNVbmlxdWUgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIG5lc3RlZFN0eWxlcy5wdXNoKFtrZXkudHJpbSgpLCB2YWx1ZV0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wZXJ0aWVzLnB1c2goW2h5cGhlbmF0ZShrZXkudHJpbSgpKSwgdmFsdWVdKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3R5bGVTdHJpbmc6IHN0cmluZ2lmeVByb3BlcnRpZXMoc29ydFR1cGxlcyhwcm9wZXJ0aWVzKSksXG4gICAgbmVzdGVkU3R5bGVzOiBoYXNOZXN0ZWRTdHlsZXMgPyBuZXN0ZWRTdHlsZXMgOiBzb3J0VHVwbGVzKG5lc3RlZFN0eWxlcyksXG4gICAgaXNVbmlxdWVcbiAgfVxufVxuXG4vKipcbiAqIFN0cmluZ2lmeSBhbiBhcnJheSBvZiBwcm9wZXJ0eSB0dXBsZXMuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVByb3BlcnRpZXMgKHByb3BlcnRpZXM6IEFycmF5PFtzdHJpbmcsIFByb3BlcnR5VmFsdWUgfCBQcm9wZXJ0eVZhbHVlW11dPikge1xuICByZXR1cm4gcHJvcGVydGllcy5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSByZXR1cm4gc3R5bGVUb1N0cmluZyhuYW1lLCB2YWx1ZSlcblxuICAgIHJldHVybiB2YWx1ZS5tYXAoeCA9PiBzdHlsZVRvU3RyaW5nKG5hbWUsIHgpKS5qb2luKCc7JylcbiAgfSkuam9pbignOycpXG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGUgQ1NTIHNlbGVjdG9ycy5cbiAqL1xuZnVuY3Rpb24gaW50ZXJwb2xhdGUgKHNlbGVjdG9yOiBzdHJpbmcsIHBhcmVudDogc3RyaW5nKSB7XG4gIGlmIChzZWxlY3Rvci5pbmRleE9mKCcmJykgPiAtMSkge1xuICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKGludGVycG9sYXRlUGF0dGVybiwgcGFyZW50KVxuICB9XG5cbiAgcmV0dXJuIGAke3BhcmVudH0gJHtzZWxlY3Rvcn1gXG59XG5cbi8qKlxuICogUmVjdXJzaXZlIGxvb3AgYnVpbGRpbmcgc3R5bGVzIHdpdGggZGVmZXJyZWQgc2VsZWN0b3JzLlxuICovXG5mdW5jdGlvbiBzdHlsaXplIChjYWNoZTogQ2FjaGU8YW55Piwgc2VsZWN0b3I6IHN0cmluZywgc3R5bGVzOiBTdHlsZXMsIGxpc3Q6IFtzdHJpbmcsIFN0eWxlXVtdLCBwYXJlbnQ/OiBzdHJpbmcpIHtcbiAgY29uc3QgeyBzdHlsZVN0cmluZywgbmVzdGVkU3R5bGVzLCBpc1VuaXF1ZSB9ID0gcGFyc2VTdHlsZXMoc3R5bGVzLCAhIXNlbGVjdG9yKVxuICBsZXQgcGlkID0gc3R5bGVTdHJpbmdcblxuICBpZiAoc2VsZWN0b3IuY2hhckNvZGVBdCgwKSA9PT0gNjQgLyogQCAqLykge1xuICAgIGNvbnN0IHJ1bGUgPSBjYWNoZS5hZGQobmV3IFJ1bGUoc2VsZWN0b3IsIHBhcmVudCA/IHVuZGVmaW5lZCA6IHN0eWxlU3RyaW5nLCBjYWNoZS5oYXNoKSlcblxuICAgIC8vIE5lc3RlZCBzdHlsZXMgc3VwcG9ydCAoZS5nLiBgLmZvbyA+IEBtZWRpYSA+IC5iYXJgKS5cbiAgICBpZiAoc3R5bGVTdHJpbmcgJiYgcGFyZW50KSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHJ1bGUuYWRkKG5ldyBTdHlsZShzdHlsZVN0cmluZywgcnVsZS5oYXNoLCBpc1VuaXF1ZSA/IGB1JHsoKyt1bmlxdWVJZCkudG9TdHJpbmcoMzYpfWAgOiB1bmRlZmluZWQpKVxuICAgICAgbGlzdC5wdXNoKFtwYXJlbnQsIHN0eWxlXSlcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgbmVzdGVkU3R5bGVzKSB7XG4gICAgICBwaWQgKz0gbmFtZSArIHN0eWxpemUocnVsZSwgbmFtZSwgdmFsdWUsIGxpc3QsIHBhcmVudClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qga2V5ID0gcGFyZW50ID8gaW50ZXJwb2xhdGUoc2VsZWN0b3IsIHBhcmVudCkgOiBzZWxlY3RvclxuXG4gICAgaWYgKHN0eWxlU3RyaW5nKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IGNhY2hlLmFkZChuZXcgU3R5bGUoc3R5bGVTdHJpbmcsIGNhY2hlLmhhc2gsIGlzVW5pcXVlID8gYHUkeygrK3VuaXF1ZUlkKS50b1N0cmluZygzNil9YCA6IHVuZGVmaW5lZCkpXG4gICAgICBsaXN0LnB1c2goW2tleSwgc3R5bGVdKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBuZXN0ZWRTdHlsZXMpIHtcbiAgICAgIHBpZCArPSBuYW1lICsgc3R5bGl6ZShjYWNoZSwgbmFtZSwgdmFsdWUsIGxpc3QsIGtleSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGlkXG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYWxsIHN0eWxlcywgYnV0IGNvbGxlY3QgZm9yIHNlbGVjdG9yIGludGVycG9sYXRpb24gdXNpbmcgdGhlIGhhc2guXG4gKi9cbmZ1bmN0aW9uIGNvbXBvc2VTdHlsZXMgKGNvbnRhaW5lcjogRnJlZVN0eWxlLCBzZWxlY3Rvcjogc3RyaW5nLCBzdHlsZXM6IFN0eWxlcywgaXNTdHlsZTogYm9vbGVhbiwgZGlzcGxheU5hbWU/OiBzdHJpbmcpIHtcbiAgY29uc3QgY2FjaGUgPSBuZXcgQ2FjaGU8UnVsZSB8IFN0eWxlPihjb250YWluZXIuaGFzaClcbiAgY29uc3QgbGlzdDogW3N0cmluZywgU3R5bGVdW10gPSBbXVxuICBjb25zdCBwaWQgPSBzdHlsaXplKGNhY2hlLCBzZWxlY3Rvciwgc3R5bGVzLCBsaXN0KVxuXG4gIGNvbnN0IGhhc2ggPSBgZiR7Y2FjaGUuaGFzaChwaWQpfWBcbiAgY29uc3QgaWQgPSBkaXNwbGF5TmFtZSA/IGAke2Rpc3BsYXlOYW1lfV8ke2hhc2h9YCA6IGhhc2hcblxuICBmb3IgKGNvbnN0IFtzZWxlY3Rvciwgc3R5bGVdIG9mIGxpc3QpIHtcbiAgICBjb25zdCBrZXkgPSBpc1N0eWxlID8gaW50ZXJwb2xhdGUoc2VsZWN0b3IsIGAuJHtlc2NhcGUoaWQpfWApIDogc2VsZWN0b3JcbiAgICBzdHlsZS5hZGQobmV3IFNlbGVjdG9yKGtleSwgc3R5bGUuaGFzaCwgdW5kZWZpbmVkLCBwaWQpKVxuICB9XG5cbiAgcmV0dXJuIHsgY2FjaGUsIHBpZCwgaWQgfVxufVxuXG4vKipcbiAqIENhY2hlIHRvIGxpc3QgdG8gc3R5bGVzLlxuICovXG5mdW5jdGlvbiBqb2luIChhcnI6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlcyA9ICcnXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSByZXMgKz0gYXJyW2ldXG4gIHJldHVybiByZXNcbn1cblxuLyoqXG4gKiBQcm9wYWdhdGUgY2hhbmdlIGV2ZW50cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDaGFuZ2VzIHtcbiAgYWRkIChzdHlsZTogQ29udGFpbmVyPGFueT4sIGluZGV4OiBudW1iZXIpOiB2b2lkXG4gIGNoYW5nZSAoc3R5bGU6IENvbnRhaW5lcjxhbnk+LCBvbGRJbmRleDogbnVtYmVyLCBuZXdJbmRleDogbnVtYmVyKTogdm9pZFxuICByZW1vdmUgKHN0eWxlOiBDb250YWluZXI8YW55PiwgaW5kZXg6IG51bWJlcik6IHZvaWRcbn1cblxuLyoqXG4gKiBOb29wIGNoYW5nZXMuXG4gKi9cbmNvbnN0IG5vb3BDaGFuZ2VzOiBDaGFuZ2VzID0ge1xuICBhZGQ6ICgpID0+IHVuZGVmaW5lZCxcbiAgY2hhbmdlOiAoKSA9PiB1bmRlZmluZWQsXG4gIHJlbW92ZTogKCkgPT4gdW5kZWZpbmVkXG59XG5cbi8qKlxuICogQ2FjaGVhYmxlIGludGVyZmFjZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250YWluZXIgPFQ+IHtcbiAgaWQ6IHN0cmluZ1xuICBjbG9uZSAoKTogVFxuICBnZXRJZGVudGlmaWVyICgpOiBzdHJpbmdcbiAgZ2V0U3R5bGVzICgpOiBzdHJpbmdcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnQgYSBjYWNoZS9ldmVudCBlbWl0dGVyLlxuICovXG5leHBvcnQgY2xhc3MgQ2FjaGUgPFQgZXh0ZW5kcyBDb250YWluZXI8YW55Pj4ge1xuXG4gIHNoZWV0OiBzdHJpbmdbXSA9IFtdXG4gIGNoYW5nZUlkID0gMFxuXG4gIHByaXZhdGUgX2tleXM6IHN0cmluZ1tdID0gW11cbiAgcHJpdmF0ZSBfY2hpbGRyZW46IHsgW2lkOiBzdHJpbmddOiBUIH0gPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHByaXZhdGUgX2NvdW50ZXJzOiB7IFtpZDogc3RyaW5nXTogbnVtYmVyIH0gPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cbiAgY29uc3RydWN0b3IgKHB1YmxpYyBoYXNoID0gc3RyaW5nSGFzaCwgcHVibGljIGNoYW5nZXM6IENoYW5nZXMgPSBub29wQ2hhbmdlcykge31cblxuICBhZGQgPFUgZXh0ZW5kcyBUPiAoc3R5bGU6IFUpOiBVIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXSB8fCAwXG4gICAgY29uc3QgaXRlbSA9IHRoaXMuX2NoaWxkcmVuW3N0eWxlLmlkXSB8fCBzdHlsZS5jbG9uZSgpXG5cbiAgICB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF0gPSBjb3VudCArIDFcblxuICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fY2hpbGRyZW5baXRlbS5pZF0gPSBpdGVtXG4gICAgICB0aGlzLl9rZXlzLnB1c2goaXRlbS5pZClcbiAgICAgIHRoaXMuc2hlZXQucHVzaChpdGVtLmdldFN0eWxlcygpKVxuICAgICAgdGhpcy5jaGFuZ2VJZCsrXG4gICAgICB0aGlzLmNoYW5nZXMuYWRkKGl0ZW0sIHRoaXMuX2tleXMubGVuZ3RoIC0gMSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2hlY2sgaWYgY29udGVudHMgYXJlIGRpZmZlcmVudC5cbiAgICAgIGlmIChpdGVtLmdldElkZW50aWZpZXIoKSAhPT0gc3R5bGUuZ2V0SWRlbnRpZmllcigpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEhhc2ggY29sbGlzaW9uOiAke3N0eWxlLmdldFN0eWxlcygpfSA9PT0gJHtpdGVtLmdldFN0eWxlcygpfWApXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9sZEluZGV4ID0gdGhpcy5fa2V5cy5pbmRleE9mKHN0eWxlLmlkKVxuICAgICAgY29uc3QgbmV3SW5kZXggPSB0aGlzLl9rZXlzLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IHByZXZDaGFuZ2VJZCA9IHRoaXMuY2hhbmdlSWRcblxuICAgICAgaWYgKG9sZEluZGV4ICE9PSBuZXdJbmRleCkge1xuICAgICAgICB0aGlzLl9rZXlzLnNwbGljZShvbGRJbmRleCwgMSlcbiAgICAgICAgdGhpcy5fa2V5cy5wdXNoKHN0eWxlLmlkKVxuICAgICAgICB0aGlzLmNoYW5nZUlkKytcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBDYWNoZSAmJiBzdHlsZSBpbnN0YW5jZW9mIENhY2hlKSB7XG4gICAgICAgIGNvbnN0IHByZXZDaGFuZ2VJZCA9IGl0ZW0uY2hhbmdlSWRcblxuICAgICAgICBpdGVtLm1lcmdlKHN0eWxlKVxuXG4gICAgICAgIGlmIChpdGVtLmNoYW5nZUlkICE9PSBwcmV2Q2hhbmdlSWQpIHtcbiAgICAgICAgICB0aGlzLmNoYW5nZUlkKytcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VJZCAhPT0gcHJldkNoYW5nZUlkKSB7XG4gICAgICAgIGlmIChvbGRJbmRleCA9PT0gbmV3SW5kZXgpIHtcbiAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShvbGRJbmRleCwgMSwgaXRlbS5nZXRTdHlsZXMoKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShvbGRJbmRleCwgMSlcbiAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShuZXdJbmRleCwgMCwgaXRlbS5nZXRTdHlsZXMoKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2hhbmdlcy5jaGFuZ2UoaXRlbSwgb2xkSW5kZXgsIG5ld0luZGV4KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVtIGFzIFVcbiAgfVxuXG4gIHJlbW92ZSAoc3R5bGU6IFQpOiB2b2lkIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXVxuXG4gICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdID0gY291bnQgLSAxXG5cbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9jaGlsZHJlbltzdHlsZS5pZF1cbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fa2V5cy5pbmRleE9mKGl0ZW0uaWQpXG5cbiAgICAgIGlmIChjb3VudCA9PT0gMSkge1xuICAgICAgICBkZWxldGUgdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9jaGlsZHJlbltzdHlsZS5pZF1cblxuICAgICAgICB0aGlzLl9rZXlzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgdGhpcy5zaGVldC5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIHRoaXMuY2hhbmdlSWQrK1xuICAgICAgICB0aGlzLmNoYW5nZXMucmVtb3ZlKGl0ZW0sIGluZGV4KVxuICAgICAgfSBlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgQ2FjaGUgJiYgc3R5bGUgaW5zdGFuY2VvZiBDYWNoZSkge1xuICAgICAgICBjb25zdCBwcmV2Q2hhbmdlSWQgPSBpdGVtLmNoYW5nZUlkXG5cbiAgICAgICAgaXRlbS51bm1lcmdlKHN0eWxlKVxuXG4gICAgICAgIGlmIChpdGVtLmNoYW5nZUlkICE9PSBwcmV2Q2hhbmdlSWQpIHtcbiAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShpbmRleCwgMSwgaXRlbS5nZXRTdHlsZXMoKSlcbiAgICAgICAgICB0aGlzLmNoYW5nZUlkKytcbiAgICAgICAgICB0aGlzLmNoYW5nZXMuY2hhbmdlKGl0ZW0sIGluZGV4LCBpbmRleClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1lcmdlIChjYWNoZTogQ2FjaGU8YW55Pikge1xuICAgIGZvciAoY29uc3QgaWQgb2YgY2FjaGUuX2tleXMpIHRoaXMuYWRkKGNhY2hlLl9jaGlsZHJlbltpZF0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdW5tZXJnZSAoY2FjaGU6IENhY2hlPGFueT4pIHtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGNhY2hlLl9rZXlzKSB0aGlzLnJlbW92ZShjYWNoZS5fY2hpbGRyZW5baWRdKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICByZXR1cm4gbmV3IENhY2hlKHRoaXMuaGFzaCkubWVyZ2UodGhpcylcbiAgfVxuXG59XG5cbi8qKlxuICogU2VsZWN0b3IgaXMgYSBkdW1iIGNsYXNzIG1hZGUgdG8gcmVwcmVzZW50IG5lc3RlZCBDU1Mgc2VsZWN0b3JzLlxuICovXG5leHBvcnQgY2xhc3MgU2VsZWN0b3IgaW1wbGVtZW50cyBDb250YWluZXI8U2VsZWN0b3I+IHtcblxuICBjb25zdHJ1Y3RvciAoXG4gICAgcHVibGljIHNlbGVjdG9yOiBzdHJpbmcsXG4gICAgcHVibGljIGhhc2g6IEhhc2hGdW5jdGlvbixcbiAgICBwdWJsaWMgaWQgPSBgcyR7aGFzaChzZWxlY3Rvcil9YCxcbiAgICBwdWJsaWMgcGlkID0gJydcbiAgKSB7fVxuXG4gIGdldFN0eWxlcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0b3JcbiAgfVxuXG4gIGdldElkZW50aWZpZXIgKCkge1xuICAgIHJldHVybiBgJHt0aGlzLnBpZH0uJHt0aGlzLnNlbGVjdG9yfWBcbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICByZXR1cm4gbmV3IFNlbGVjdG9yKHRoaXMuc2VsZWN0b3IsIHRoaXMuaGFzaCwgdGhpcy5pZCwgdGhpcy5waWQpXG4gIH1cblxufVxuXG4vKipcbiAqIFRoZSBzdHlsZSBjb250YWluZXIgcmVnaXN0ZXJzIGEgc3R5bGUgc3RyaW5nIHdpdGggc2VsZWN0b3JzLlxuICovXG5leHBvcnQgY2xhc3MgU3R5bGUgZXh0ZW5kcyBDYWNoZTxTZWxlY3Rvcj4gaW1wbGVtZW50cyBDb250YWluZXI8U3R5bGU+IHtcblxuICBjb25zdHJ1Y3RvciAocHVibGljIHN0eWxlOiBzdHJpbmcsIHB1YmxpYyBoYXNoOiBIYXNoRnVuY3Rpb24sIHB1YmxpYyBpZCA9IGBjJHtoYXNoKHN0eWxlKX1gKSB7XG4gICAgc3VwZXIoaGFzaClcbiAgfVxuXG4gIGdldFN0eWxlcyAoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5zaGVldC5qb2luKCcsJyl9eyR7dGhpcy5zdHlsZX19YFxuICB9XG5cbiAgZ2V0SWRlbnRpZmllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3R5bGVcbiAgfVxuXG4gIGNsb25lICgpOiBTdHlsZSB7XG4gICAgcmV0dXJuIG5ldyBTdHlsZSh0aGlzLnN0eWxlLCB0aGlzLmhhc2gsIHRoaXMuaWQpLm1lcmdlKHRoaXMpXG4gIH1cblxufVxuXG4vKipcbiAqIEltcGxlbWVudCBydWxlIGxvZ2ljIGZvciBzdHlsZSBvdXRwdXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBSdWxlIGV4dGVuZHMgQ2FjaGU8UnVsZSB8IFN0eWxlPiBpbXBsZW1lbnRzIENvbnRhaW5lcjxSdWxlPiB7XG5cbiAgY29uc3RydWN0b3IgKFxuICAgIHB1YmxpYyBydWxlOiBzdHJpbmcsXG4gICAgcHVibGljIHN0eWxlID0gJycsXG4gICAgcHVibGljIGhhc2g6IEhhc2hGdW5jdGlvbixcbiAgICBwdWJsaWMgaWQgPSBgYSR7aGFzaChgJHtydWxlfS4ke3N0eWxlfWApfWAsXG4gICAgcHVibGljIHBpZCA9ICcnXG4gICkge1xuICAgIHN1cGVyKGhhc2gpXG4gIH1cblxuICBnZXRTdHlsZXMgKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMucnVsZX17JHt0aGlzLnN0eWxlfSR7am9pbih0aGlzLnNoZWV0KX19YFxuICB9XG5cbiAgZ2V0SWRlbnRpZmllciAoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucGlkfS4ke3RoaXMucnVsZX0uJHt0aGlzLnN0eWxlfWBcbiAgfVxuXG4gIGNsb25lICgpOiBSdWxlIHtcbiAgICByZXR1cm4gbmV3IFJ1bGUodGhpcy5ydWxlLCB0aGlzLnN0eWxlLCB0aGlzLmhhc2gsIHRoaXMuaWQsIHRoaXMucGlkKS5tZXJnZSh0aGlzKVxuICB9XG5cbn1cblxuLyoqXG4gKiBUaGUgRnJlZVN0eWxlIGNsYXNzIGltcGxlbWVudHMgdGhlIEFQSSBmb3IgZXZlcnl0aGluZyBlbHNlLlxuICovXG5leHBvcnQgY2xhc3MgRnJlZVN0eWxlIGV4dGVuZHMgQ2FjaGU8UnVsZSB8IFN0eWxlPiBpbXBsZW1lbnRzIENvbnRhaW5lcjxGcmVlU3R5bGU+IHtcblxuICBjb25zdHJ1Y3RvciAoXG4gICAgcHVibGljIGhhc2ggPSBzdHJpbmdIYXNoLFxuICAgIHB1YmxpYyBkZWJ1ZyA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudlsnTk9ERV9FTlYnXSAhPT0gJ3Byb2R1Y3Rpb24nLFxuICAgIHB1YmxpYyBpZCA9IGBmJHsoKyt1bmlxdWVJZCkudG9TdHJpbmcoMzYpfWAsXG4gICAgY2hhbmdlcz86IENoYW5nZXNcbiAgKSB7XG4gICAgc3VwZXIoaGFzaCwgY2hhbmdlcylcbiAgfVxuXG4gIHJlZ2lzdGVyU3R5bGUgKHN0eWxlczogU3R5bGVzLCBkaXNwbGF5TmFtZT86IHN0cmluZykge1xuICAgIGNvbnN0IGRlYnVnTmFtZSA9IHRoaXMuZGVidWcgPyBkaXNwbGF5TmFtZSA6IHVuZGVmaW5lZFxuICAgIGNvbnN0IHsgY2FjaGUsIGlkIH0gPSBjb21wb3NlU3R5bGVzKHRoaXMsICcmJywgc3R5bGVzLCB0cnVlLCBkZWJ1Z05hbWUpXG4gICAgdGhpcy5tZXJnZShjYWNoZSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIHJlZ2lzdGVyS2V5ZnJhbWVzIChrZXlmcmFtZXM6IFN0eWxlcywgZGlzcGxheU5hbWU/OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3Rlckhhc2hSdWxlKCdAa2V5ZnJhbWVzJywga2V5ZnJhbWVzLCBkaXNwbGF5TmFtZSlcbiAgfVxuXG4gIHJlZ2lzdGVySGFzaFJ1bGUgKHByZWZpeDogc3RyaW5nLCBzdHlsZXM6IFN0eWxlcywgZGlzcGxheU5hbWU/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZWJ1Z05hbWUgPSB0aGlzLmRlYnVnID8gZGlzcGxheU5hbWUgOiB1bmRlZmluZWRcbiAgICBjb25zdCB7IGNhY2hlLCBwaWQsIGlkIH0gPSBjb21wb3NlU3R5bGVzKHRoaXMsICcnLCBzdHlsZXMsIGZhbHNlLCBkZWJ1Z05hbWUpXG4gICAgY29uc3QgcnVsZSA9IG5ldyBSdWxlKGAke3ByZWZpeH0gJHtlc2NhcGUoaWQpfWAsIHVuZGVmaW5lZCwgdGhpcy5oYXNoLCB1bmRlZmluZWQsIHBpZClcbiAgICB0aGlzLmFkZChydWxlLm1lcmdlKGNhY2hlKSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIHJlZ2lzdGVyUnVsZSAocnVsZTogc3RyaW5nLCBzdHlsZXM6IFN0eWxlcykge1xuICAgIHRoaXMubWVyZ2UoY29tcG9zZVN0eWxlcyh0aGlzLCBydWxlLCBzdHlsZXMsIGZhbHNlKS5jYWNoZSlcbiAgfVxuXG4gIHJlZ2lzdGVyQ3NzIChzdHlsZXM6IFN0eWxlcykge1xuICAgIHRoaXMubWVyZ2UoY29tcG9zZVN0eWxlcyh0aGlzLCAnJywgc3R5bGVzLCBmYWxzZSkuY2FjaGUpXG4gIH1cblxuICBnZXRTdHlsZXMgKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGpvaW4odGhpcy5zaGVldClcbiAgfVxuXG4gIGdldElkZW50aWZpZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmlkXG4gIH1cblxuICBjbG9uZSAoKTogRnJlZVN0eWxlIHtcbiAgICByZXR1cm4gbmV3IEZyZWVTdHlsZSh0aGlzLmhhc2gsIHRoaXMuZGVidWcsIHRoaXMuaWQsIHRoaXMuY2hhbmdlcykubWVyZ2UodGhpcylcbiAgfVxuXG59XG5cbi8qKlxuICogRXhwb3J0cyBhIHNpbXBsZSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUgKGhhc2g/OiBIYXNoRnVuY3Rpb24sIGRlYnVnPzogYm9vbGVhbiwgY2hhbmdlcz86IENoYW5nZXMpIHtcbiAgcmV0dXJuIG5ldyBGcmVlU3R5bGUoaGFzaCwgZGVidWcsIHVuZGVmaW5lZCwgY2hhbmdlcylcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJpbXBvcnQgeyBUeXBlU3R5bGUgfSBmcm9tICcuL2ludGVybmFsL3R5cGVzdHlsZSc7XHJcbmV4cG9ydCB7IFR5cGVTdHlsZSB9O1xyXG4vKipcclxuICogQWxsIHRoZSBDU1MgdHlwZXMgaW4gdGhlICd0eXBlcycgbmFtZXNwYWNlXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyB0eXBlcyBmcm9tICcuL3R5cGVzJztcclxuZXhwb3J0IHsgdHlwZXMgfTtcclxuLyoqXHJcbiAqIEV4cG9ydCBjZXJ0YWluIHV0aWxpdGllc1xyXG4gKi9cclxuZXhwb3J0IHsgZXh0ZW5kLCBjbGFzc2VzLCBtZWRpYSB9IGZyb20gJy4vaW50ZXJuYWwvdXRpbGl0aWVzJztcclxuLyoqIFplcm8gY29uZmlndXJhdGlvbiwgZGVmYXVsdCBpbnN0YW5jZSBvZiBUeXBlU3R5bGUgKi9cclxudmFyIHRzID0gbmV3IFR5cGVTdHlsZSh7IGF1dG9HZW5lcmF0ZVRhZzogdHJ1ZSB9KTtcclxuLyoqIFNldHMgdGhlIHRhcmdldCB0YWcgd2hlcmUgd2Ugd3JpdGUgdGhlIGNzcyBvbiBzdHlsZSB1cGRhdGVzICovXHJcbmV4cG9ydCB2YXIgc2V0U3R5bGVzVGFyZ2V0ID0gdHMuc2V0U3R5bGVzVGFyZ2V0O1xyXG4vKipcclxuICogSW5zZXJ0IGByYXdgIENTUyBhcyBhIHN0cmluZy4gVGhpcyBpcyB1c2VmdWwgZm9yIGUuZy5cclxuICogLSB0aGlyZCBwYXJ0eSBDU1MgdGhhdCB5b3UgYXJlIGN1c3RvbWl6aW5nIHdpdGggdGVtcGxhdGUgc3RyaW5nc1xyXG4gKiAtIGdlbmVyYXRpbmcgcmF3IENTUyBpbiBKYXZhU2NyaXB0XHJcbiAqIC0gcmVzZXQgbGlicmFyaWVzIGxpa2Ugbm9ybWFsaXplLmNzcyB0aGF0IHlvdSBjYW4gdXNlIHdpdGhvdXQgbG9hZGVyc1xyXG4gKi9cclxuZXhwb3J0IHZhciBjc3NSYXcgPSB0cy5jc3NSYXc7XHJcbi8qKlxyXG4gKiBUYWtlcyBDU1NQcm9wZXJ0aWVzIGFuZCByZWdpc3RlcnMgaXQgdG8gYSBnbG9iYWwgc2VsZWN0b3IgKGJvZHksIGh0bWwsIGV0Yy4pXHJcbiAqL1xyXG5leHBvcnQgdmFyIGNzc1J1bGUgPSB0cy5jc3NSdWxlO1xyXG4vKipcclxuICogUmVuZGVycyBzdHlsZXMgdG8gdGhlIHNpbmdsZXRvbiB0YWcgaW1lZGlhdGVseVxyXG4gKiBOT1RFOiBZb3Ugc2hvdWxkIG9ubHkgY2FsbCBpdCBvbiBpbml0aWFsIHJlbmRlciB0byBwcmV2ZW50IGFueSBub24gQ1NTIGZsYXNoLlxyXG4gKiBBZnRlciB0aGF0IGl0IGlzIGtlcHQgc3luYyB1c2luZyBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBhbmQgd2UgaGF2ZW4ndCBub3RpY2VkIGFueSBiYWQgZmxhc2hlcy5cclxuICoqL1xyXG5leHBvcnQgdmFyIGZvcmNlUmVuZGVyU3R5bGVzID0gdHMuZm9yY2VSZW5kZXJTdHlsZXM7XHJcbi8qKlxyXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIGFuIEBmb250LWZhY2VcclxuICovXHJcbmV4cG9ydCB2YXIgZm9udEZhY2UgPSB0cy5mb250RmFjZTtcclxuLyoqXHJcbiAqIEFsbG93cyB1c2UgdG8gdXNlIHRoZSBzdHlsZXNoZWV0IGluIGEgbm9kZS5qcyBlbnZpcm9ubWVudFxyXG4gKi9cclxuZXhwb3J0IHZhciBnZXRTdHlsZXMgPSB0cy5nZXRTdHlsZXM7XHJcbi8qKlxyXG4gKiBUYWtlcyBrZXlmcmFtZXMgYW5kIHJldHVybnMgYSBnZW5lcmF0ZWQgYW5pbWF0aW9uTmFtZVxyXG4gKi9cclxuZXhwb3J0IHZhciBrZXlmcmFtZXMgPSB0cy5rZXlmcmFtZXM7XHJcbi8qKlxyXG4gKiBIZWxwcyB3aXRoIHRlc3RpbmcuIFJlaW5pdGlhbGl6ZXMgRnJlZVN0eWxlICsgcmF3XHJcbiAqL1xyXG5leHBvcnQgdmFyIHJlaW5pdCA9IHRzLnJlaW5pdDtcclxuLyoqXHJcbiAqIFRha2VzIENTU1Byb3BlcnRpZXMgYW5kIHJldHVybiBhIGdlbmVyYXRlZCBjbGFzc05hbWUgeW91IGNhbiB1c2Ugb24geW91ciBjb21wb25lbnRcclxuICovXHJcbmV4cG9ydCB2YXIgc3R5bGUgPSB0cy5zdHlsZTtcclxuLyoqXHJcbiAqIFRha2VzIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHByb3BlcnR5IHZhbHVlcyBhcmUgQ1NTUHJvcGVydGllcywgYW5kXHJcbiAqIHJldHVybnMgYW4gb2JqZWN0IHdoZXJlIHByb3BlcnR5IG5hbWVzIGFyZSB0aGUgc2FtZSBpZGVhbCBjbGFzcyBuYW1lcyBhbmQgdGhlIHByb3BlcnR5IHZhbHVlcyBhcmVcclxuICogdGhlIGFjdHVhbCBnZW5lcmF0ZWQgY2xhc3MgbmFtZXMgdXNpbmcgdGhlIGlkZWFsIGNsYXNzIG5hbWUgYXMgdGhlICRkZWJ1Z05hbWVcclxuICovXHJcbmV4cG9ydCB2YXIgc3R5bGVzaGVldCA9IHRzLnN0eWxlc2hlZXQ7XHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIFR5cGVTdHlsZSBzZXBhcmF0ZSBmcm9tIHRoZSBkZWZhdWx0IGluc3RhbmNlLlxyXG4gKlxyXG4gKiAtIFVzZSB0aGlzIGZvciBjcmVhdGluZyBhIGRpZmZlcmVudCB0eXBlc3R5bGUgaW5zdGFuY2UgZm9yIGEgc2hhZG93IGRvbSBjb21wb25lbnQuXHJcbiAqIC0gVXNlIHRoaXMgaWYgeW91IGRvbid0IHdhbnQgYW4gYXV0byB0YWcgZ2VuZXJhdGVkIGFuZCB5b3UganVzdCB3YW50IHRvIGNvbGxlY3QgdGhlIENTUy5cclxuICpcclxuICogTk9URTogc3R5bGVzIGFyZW4ndCBzaGFyZWQgYmV0d2VlbiBkaWZmZXJlbnQgaW5zdGFuY2VzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVR5cGVTdHlsZSh0YXJnZXQpIHtcclxuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBUeXBlU3R5bGUoeyBhdXRvR2VuZXJhdGVUYWc6IGZhbHNlIH0pO1xyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIGluc3RhbmNlLnNldFN0eWxlc1RhcmdldCh0YXJnZXQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluc3RhbmNlO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIEZyZWVTdHlsZSBmcm9tICdmcmVlLXN0eWxlJztcclxuLyoqXHJcbiAqIFdlIG5lZWQgdG8gZG8gdGhlIGZvbGxvd2luZyB0byAqb3VyKiBvYmplY3RzIGJlZm9yZSBwYXNzaW5nIHRvIGZyZWVzdHlsZTpcclxuICogLSBGb3IgYW55IGAkbmVzdGAgZGlyZWN0aXZlIG1vdmUgdXAgdG8gRnJlZVN0eWxlIHN0eWxlIG5lc3RpbmdcclxuICogLSBGb3IgYW55IGAkdW5pcXVlYCBkaXJlY3RpdmUgbWFwIHRvIEZyZWVTdHlsZSBVbmlxdWVcclxuICogLSBGb3IgYW55IGAkZGVidWdOYW1lYCBkaXJlY3RpdmUgcmV0dXJuIHRoZSBkZWJ1ZyBuYW1lXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlU3RyaW5nT2JqKG9iamVjdCkge1xyXG4gICAgLyoqIFRoZSBmaW5hbCByZXN1bHQgd2Ugd2lsbCByZXR1cm4gKi9cclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIHZhciBkZWJ1Z05hbWUgPSAnJztcclxuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcclxuICAgICAgICAvKiogR3JhYiB0aGUgdmFsdWUgdXBmcm9udCAqL1xyXG4gICAgICAgIHZhciB2YWwgPSBvYmplY3Rba2V5XTtcclxuICAgICAgICAvKiogVHlwZVN0eWxlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyAqL1xyXG4gICAgICAgIGlmIChrZXkgPT09ICckdW5pcXVlJykge1xyXG4gICAgICAgICAgICByZXN1bHRbRnJlZVN0eWxlLklTX1VOSVFVRV0gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJyRuZXN0Jykge1xyXG4gICAgICAgICAgICB2YXIgbmVzdGVkID0gdmFsO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RvciBpbiBuZXN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdWJwcm9wZXJ0aWVzID0gbmVzdGVkW3NlbGVjdG9yXTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtzZWxlY3Rvcl0gPSBlbnN1cmVTdHJpbmdPYmooc3VicHJvcGVydGllcykucmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJyRkZWJ1Z05hbWUnKSB7XHJcbiAgICAgICAgICAgIGRlYnVnTmFtZSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7IHJlc3VsdDogcmVzdWx0LCBkZWJ1Z05hbWU6IGRlYnVnTmFtZSB9O1xyXG59XHJcbi8vIHRvZG86IGJldHRlciBuYW1lIGhlcmVcclxuZXhwb3J0IGZ1bmN0aW9uIGV4cGxvZGVLZXlmcmFtZXMoZnJhbWVzKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0geyAkZGVidWdOYW1lOiB1bmRlZmluZWQsIGtleWZyYW1lczoge30gfTtcclxuICAgIGZvciAodmFyIG9mZnNldCBpbiBmcmFtZXMpIHtcclxuICAgICAgICB2YXIgdmFsID0gZnJhbWVzW29mZnNldF07XHJcbiAgICAgICAgaWYgKG9mZnNldCA9PT0gJyRkZWJ1Z05hbWUnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC4kZGVidWdOYW1lID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0LmtleWZyYW1lc1tvZmZzZXRdID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgRnJlZVN0eWxlIGZyb20gXCJmcmVlLXN0eWxlXCI7XHJcbmltcG9ydCB7IGVuc3VyZVN0cmluZ09iaiwgZXhwbG9kZUtleWZyYW1lcyB9IGZyb20gJy4vZm9ybWF0dGluZyc7XHJcbmltcG9ydCB7IGV4dGVuZCwgcmFmIH0gZnJvbSAnLi91dGlsaXRpZXMnO1xyXG4vKipcclxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBmcmVlIHN0eWxlIHdpdGggb3VyIG9wdGlvbnNcclxuICovXHJcbnZhciBjcmVhdGVGcmVlU3R5bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBGcmVlU3R5bGUuY3JlYXRlKFxyXG4vKiogVXNlIHRoZSBkZWZhdWx0IGhhc2ggZnVuY3Rpb24gKi9cclxudW5kZWZpbmVkLCBcclxuLyoqIFByZXNlcnZlICRkZWJ1Z05hbWUgdmFsdWVzICovXHJcbnRydWUpOyB9O1xyXG4vKipcclxuICogTWFpbnRhaW5zIGEgc2luZ2xlIHN0eWxlc2hlZXQgYW5kIGtlZXBzIGl0IGluIHN5bmMgd2l0aCByZXF1ZXN0ZWQgc3R5bGVzXHJcbiAqL1xyXG52YXIgVHlwZVN0eWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVHlwZVN0eWxlKF9hKSB7XHJcbiAgICAgICAgdmFyIGF1dG9HZW5lcmF0ZVRhZyA9IF9hLmF1dG9HZW5lcmF0ZVRhZztcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluc2VydCBgcmF3YCBDU1MgYXMgYSBzdHJpbmcuIFRoaXMgaXMgdXNlZnVsIGZvciBlLmcuXHJcbiAgICAgICAgICogLSB0aGlyZCBwYXJ0eSBDU1MgdGhhdCB5b3UgYXJlIGN1c3RvbWl6aW5nIHdpdGggdGVtcGxhdGUgc3RyaW5nc1xyXG4gICAgICAgICAqIC0gZ2VuZXJhdGluZyByYXcgQ1NTIGluIEphdmFTY3JpcHRcclxuICAgICAgICAgKiAtIHJlc2V0IGxpYnJhcmllcyBsaWtlIG5vcm1hbGl6ZS5jc3MgdGhhdCB5b3UgY2FuIHVzZSB3aXRob3V0IGxvYWRlcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNzc1JhdyA9IGZ1bmN0aW9uIChtdXN0QmVWYWxpZENTUykge1xyXG4gICAgICAgICAgICBpZiAoIW11c3RCZVZhbGlkQ1NTKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX3JhdyArPSBtdXN0QmVWYWxpZENTUyB8fCAnJztcclxuICAgICAgICAgICAgX3RoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUYWtlcyBDU1NQcm9wZXJ0aWVzIGFuZCByZWdpc3RlcnMgaXQgdG8gYSBnbG9iYWwgc2VsZWN0b3IgKGJvZHksIGh0bWwsIGV0Yy4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jc3NSdWxlID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciBvYmplY3RzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBvYmplY3RzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSBlbnN1cmVTdHJpbmdPYmooZXh0ZW5kLmFwcGx5KHZvaWQgMCwgb2JqZWN0cykpLnJlc3VsdDtcclxuICAgICAgICAgICAgX3RoaXMuX2ZyZWVTdHlsZS5yZWdpc3RlclJ1bGUoc2VsZWN0b3IsIG9iamVjdCk7XHJcbiAgICAgICAgICAgIF90aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVuZGVycyBzdHlsZXMgdG8gdGhlIHNpbmdsZXRvbiB0YWcgaW1lZGlhdGVseVxyXG4gICAgICAgICAqIE5PVEU6IFlvdSBzaG91bGQgb25seSBjYWxsIGl0IG9uIGluaXRpYWwgcmVuZGVyIHRvIHByZXZlbnQgYW55IG5vbiBDU1MgZmxhc2guXHJcbiAgICAgICAgICogQWZ0ZXIgdGhhdCBpdCBpcyBrZXB0IHN5bmMgdXNpbmcgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgYW5kIHdlIGhhdmVuJ3Qgbm90aWNlZCBhbnkgYmFkIGZsYXNoZXMuXHJcbiAgICAgICAgICoqL1xyXG4gICAgICAgIHRoaXMuZm9yY2VSZW5kZXJTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBfdGhpcy5fZ2V0VGFnKCk7XHJcbiAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gX3RoaXMuZ2V0U3R5bGVzKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIGFuIEBmb250LWZhY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmZvbnRGYWNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZm9udEZhY2UgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIGZvbnRGYWNlW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGZyZWVTdHlsZSA9IF90aGlzLl9mcmVlU3R5bGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9hID0gMCwgX2IgPSBmb250RmFjZTsgX2EgPCBfYi5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBmYWNlID0gX2JbX2FdO1xyXG4gICAgICAgICAgICAgICAgZnJlZVN0eWxlLnJlZ2lzdGVyUnVsZSgnQGZvbnQtZmFjZScsIGZhY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsb3dzIHVzZSB0byB1c2UgdGhlIHN0eWxlc2hlZXQgaW4gYSBub2RlLmpzIGVudmlyb25tZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5nZXRTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoX3RoaXMuX3JhdyB8fCAnJykgKyBfdGhpcy5fZnJlZVN0eWxlLmdldFN0eWxlcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMga2V5ZnJhbWVzIGFuZCByZXR1cm5zIGEgZ2VuZXJhdGVkIGFuaW1hdGlvbk5hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmtleWZyYW1lcyA9IGZ1bmN0aW9uIChmcmFtZXMpIHtcclxuICAgICAgICAgICAgdmFyIF9hID0gZXhwbG9kZUtleWZyYW1lcyhmcmFtZXMpLCBrZXlmcmFtZXMgPSBfYS5rZXlmcmFtZXMsICRkZWJ1Z05hbWUgPSBfYS4kZGVidWdOYW1lO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiByZXBsYWNlICRkZWJ1Z05hbWUgd2l0aCBkaXNwbGF5IG5hbWVcclxuICAgICAgICAgICAgdmFyIGFuaW1hdGlvbk5hbWUgPSBfdGhpcy5fZnJlZVN0eWxlLnJlZ2lzdGVyS2V5ZnJhbWVzKGtleWZyYW1lcywgJGRlYnVnTmFtZSk7XHJcbiAgICAgICAgICAgIF90aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbk5hbWU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIZWxwcyB3aXRoIHRlc3RpbmcuIFJlaW5pdGlhbGl6ZXMgRnJlZVN0eWxlICsgcmF3XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWluaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8qKiByZWluaXQgZnJlZXN0eWxlICovXHJcbiAgICAgICAgICAgIHZhciBmcmVlU3R5bGUgPSBjcmVhdGVGcmVlU3R5bGUoKTtcclxuICAgICAgICAgICAgX3RoaXMuX2ZyZWVTdHlsZSA9IGZyZWVTdHlsZTtcclxuICAgICAgICAgICAgX3RoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZCA9IGZyZWVTdHlsZS5jaGFuZ2VJZDtcclxuICAgICAgICAgICAgLyoqIHJlaW5pdCByYXcgKi9cclxuICAgICAgICAgICAgX3RoaXMuX3JhdyA9ICcnO1xyXG4gICAgICAgICAgICBfdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvKiogQ2xlYXIgYW55IHN0eWxlcyB0aGF0IHdlcmUgZmx1c2hlZCAqL1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gX3RoaXMuX2dldFRhZygpO1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqIFNldHMgdGhlIHRhcmdldCB0YWcgd2hlcmUgd2Ugd3JpdGUgdGhlIGNzcyBvbiBzdHlsZSB1cGRhdGVzICovXHJcbiAgICAgICAgdGhpcy5zZXRTdHlsZXNUYXJnZXQgPSBmdW5jdGlvbiAodGFnKSB7XHJcbiAgICAgICAgICAgIC8qKiBDbGVhciBhbnkgZGF0YSBpbiBhbnkgcHJldmlvdXMgdGFnICovXHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5fdGFnKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5fdGFnLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX3RhZyA9IHRhZztcclxuICAgICAgICAgICAgLyoqIFRoaXMgc3BlY2lhbCB0aW1lIGJ1ZmZlciBpbW1lZGlhdGVseSAqL1xyXG4gICAgICAgICAgICBfdGhpcy5mb3JjZVJlbmRlclN0eWxlcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMgYW4gb2JqZWN0IHdoZXJlIHByb3BlcnR5IG5hbWVzIGFyZSBpZGVhbCBjbGFzcyBuYW1lcyBhbmQgcHJvcGVydHkgdmFsdWVzIGFyZSBDU1NQcm9wZXJ0aWVzLCBhbmRcclxuICAgICAgICAgKiByZXR1cm5zIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgdGhlIHNhbWUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHRoZSBwcm9wZXJ0eSB2YWx1ZXMgYXJlXHJcbiAgICAgICAgICogdGhlIGFjdHVhbCBnZW5lcmF0ZWQgY2xhc3MgbmFtZXMgdXNpbmcgdGhlIGlkZWFsIGNsYXNzIG5hbWUgYXMgdGhlICRkZWJ1Z05hbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnN0eWxlc2hlZXQgPSBmdW5jdGlvbiAoY2xhc3Nlcykge1xyXG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGNsYXNzZXMpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgY2xhc3NOYW1lc18xID0gY2xhc3NOYW1lczsgX2kgPCBjbGFzc05hbWVzXzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NOYW1lc18xW19pXTtcclxuICAgICAgICAgICAgICAgIHZhciBjbGFzc0RlZiA9IGNsYXNzZXNbY2xhc3NOYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChjbGFzc0RlZikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzRGVmLiRkZWJ1Z05hbWUgPSBjbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NsYXNzTmFtZV0gPSBfdGhpcy5zdHlsZShjbGFzc0RlZik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBmcmVlU3R5bGUgPSBjcmVhdGVGcmVlU3R5bGUoKTtcclxuICAgICAgICB0aGlzLl9hdXRvR2VuZXJhdGVUYWcgPSBhdXRvR2VuZXJhdGVUYWc7XHJcbiAgICAgICAgdGhpcy5fZnJlZVN0eWxlID0gZnJlZVN0eWxlO1xyXG4gICAgICAgIHRoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZCA9IGZyZWVTdHlsZS5jaGFuZ2VJZDtcclxuICAgICAgICB0aGlzLl9wZW5kaW5nID0gMDtcclxuICAgICAgICB0aGlzLl9wZW5kaW5nUmF3Q2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcmF3ID0gJyc7XHJcbiAgICAgICAgdGhpcy5fdGFnID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIC8vIHJlYmluZCBwcm90b3R5cGUgdG8gVHlwZVN0eWxlLiAgSXQgbWlnaHQgYmUgYmV0dGVyIHRvIGRvIGEgZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLnN0eWxlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyl9XHJcbiAgICAgICAgdGhpcy5zdHlsZSA9IHRoaXMuc3R5bGUuYmluZCh0aGlzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogT25seSBjYWxscyBjYiBhbGwgc3luYyBvcGVyYXRpb25zIHNldHRsZVxyXG4gICAgICovXHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLl9hZnRlckFsbFN5bmMgPSBmdW5jdGlvbiAoY2IpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmcrKztcclxuICAgICAgICB2YXIgcGVuZGluZyA9IHRoaXMuX3BlbmRpbmc7XHJcbiAgICAgICAgcmFmKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBlbmRpbmcgIT09IF90aGlzLl9wZW5kaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLl9nZXRUYWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3RhZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGFnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fYXV0b0dlbmVyYXRlVGFnKSB7XHJcbiAgICAgICAgICAgIHZhciB0YWcgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xyXG4gICAgICAgICAgICAgICAgPyB7IHRleHRDb250ZW50OiAnJyB9XHJcbiAgICAgICAgICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRhZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdGFnID0gdGFnO1xyXG4gICAgICAgICAgICByZXR1cm4gdGFnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuICAgIC8qKiBDaGVja3MgaWYgdGhlIHN0eWxlIHRhZyBuZWVkcyB1cGRhdGluZyBhbmQgaWYgc28gcXVldWVzIHVwIHRoZSBjaGFuZ2UgKi9cclxuICAgIFR5cGVTdHlsZS5wcm90b3R5cGUuX3N0eWxlVXBkYXRlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBjaGFuZ2VJZCA9IHRoaXMuX2ZyZWVTdHlsZS5jaGFuZ2VJZDtcclxuICAgICAgICB2YXIgbGFzdENoYW5nZUlkID0gdGhpcy5fbGFzdEZyZWVTdHlsZUNoYW5nZUlkO1xyXG4gICAgICAgIGlmICghdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSAmJiBjaGFuZ2VJZCA9PT0gbGFzdENoYW5nZUlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGFzdEZyZWVTdHlsZUNoYW5nZUlkID0gY2hhbmdlSWQ7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2FmdGVyQWxsU3luYyhmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy5mb3JjZVJlbmRlclN0eWxlcygpOyB9KTtcclxuICAgIH07XHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLnN0eWxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBmcmVlU3R5bGUgPSB0aGlzLl9mcmVlU3R5bGU7XHJcbiAgICAgICAgdmFyIF9hID0gZW5zdXJlU3RyaW5nT2JqKGV4dGVuZC5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpLCByZXN1bHQgPSBfYS5yZXN1bHQsIGRlYnVnTmFtZSA9IF9hLmRlYnVnTmFtZTtcclxuICAgICAgICB2YXIgY2xhc3NOYW1lID0gZGVidWdOYW1lID8gZnJlZVN0eWxlLnJlZ2lzdGVyU3R5bGUocmVzdWx0LCBkZWJ1Z05hbWUpIDogZnJlZVN0eWxlLnJlZ2lzdGVyU3R5bGUocmVzdWx0KTtcclxuICAgICAgICB0aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICByZXR1cm4gY2xhc3NOYW1lO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUeXBlU3R5bGU7XHJcbn0oKSk7XHJcbmV4cG9ydCB7IFR5cGVTdHlsZSB9O1xyXG4iLCIvKiogUmFmIGZvciBub2RlICsgYnJvd3NlciAqL1xyXG5leHBvcnQgdmFyIHJhZiA9IHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICd1bmRlZmluZWQnXHJcbiAgICAvKipcclxuICAgICAqIE1ha2Ugc3VyZSBzZXRUaW1lb3V0IGlzIGFsd2F5cyBpbnZva2VkIHdpdGhcclxuICAgICAqIGB0aGlzYCBzZXQgdG8gYHdpbmRvd2Agb3IgYGdsb2JhbGAgYXV0b21hdGljYWxseVxyXG4gICAgICoqL1xyXG4gICAgPyBmdW5jdGlvbiAoY2IpIHsgcmV0dXJuIHNldFRpbWVvdXQoY2IpOyB9XHJcbiAgICAvKipcclxuICAgICAqIE1ha2Ugc3VyZSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIGFsd2F5cyBpbnZva2VkIHdpdGggYHRoaXNgIHdpbmRvd1xyXG4gICAgICogV2UgbWlnaHQgaGF2ZSByYWYgd2l0aG91dCB3aW5kb3cgaW4gY2FzZSBvZiBgcmFmL3BvbHlmaWxsYCAocmVjb21tZW5kZWQgYnkgUmVhY3QpXHJcbiAgICAgKiovXHJcbiAgICA6IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnXHJcbiAgICAgICAgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcclxuICAgICAgICA6IHJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdyk7XHJcbi8qKlxyXG4gKiBVdGlsaXR5IHRvIGpvaW4gY2xhc3NlcyBjb25kaXRpb25hbGx5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NlcygpIHtcclxuICAgIHZhciBjbGFzc2VzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIGNsYXNzZXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIHJldHVybiBjbGFzc2VzLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gISFjOyB9KS5qb2luKCcgJyk7XHJcbn1cclxuLyoqXHJcbiAqIE1lcmdlcyB2YXJpb3VzIHN0eWxlcyBpbnRvIGEgc2luZ2xlIHN0eWxlIG9iamVjdC5cclxuICogTm90ZTogaWYgdHdvIG9iamVjdHMgaGF2ZSB0aGUgc2FtZSBwcm9wZXJ0eSB0aGUgbGFzdCBvbmUgd2luc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCgpIHtcclxuICAgIHZhciBvYmplY3RzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIG9iamVjdHNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIC8qKiBUaGUgZmluYWwgcmVzdWx0IHdlIHdpbGwgcmV0dXJuICovXHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBmb3IgKHZhciBfYSA9IDAsIG9iamVjdHNfMSA9IG9iamVjdHM7IF9hIDwgb2JqZWN0c18xLmxlbmd0aDsgX2ErKykge1xyXG4gICAgICAgIHZhciBvYmplY3QgPSBvYmplY3RzXzFbX2FdO1xyXG4gICAgICAgIGlmIChvYmplY3QgPT0gbnVsbCB8fCBvYmplY3QgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgICAgIC8qKiBGYWxzeSB2YWx1ZXMgZXhjZXB0IGEgZXhwbGljaXQgMCBpcyBpZ25vcmVkICovXHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBvYmplY3Rba2V5XTtcclxuICAgICAgICAgICAgaWYgKCF2YWwgJiYgdmFsICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiogaWYgbmVzdGVkIG1lZGlhIG9yIHBzZXVkbyBzZWxlY3RvciAqL1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnJG5lc3QnICYmIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSByZXN1bHRbJyRuZXN0J10gPyBleHRlbmQocmVzdWx0WyckbmVzdCddLCB2YWwpIDogdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKChrZXkuaW5kZXhPZignJicpICE9PSAtMSB8fCBrZXkuaW5kZXhPZignQG1lZGlhJykgPT09IDApKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHJlc3VsdFtrZXldID8gZXh0ZW5kKHJlc3VsdFtrZXldLCB2YWwpIDogdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qKlxyXG4gKiBVdGlsaXR5IHRvIGhlbHAgY3VzdG9taXplIHN0eWxlcyB3aXRoIG1lZGlhIHF1ZXJpZXMuIGUuZy5cclxuICogYGBgXHJcbiAqIHN0eWxlKFxyXG4gKiAgbWVkaWEoe21heFdpZHRoOjUwMH0sIHtjb2xvcjoncmVkJ30pXHJcbiAqIClcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgdmFyIG1lZGlhID0gZnVuY3Rpb24gKG1lZGlhUXVlcnkpIHtcclxuICAgIHZhciBvYmplY3RzID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIG9iamVjdHNbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICB2YXIgbWVkaWFRdWVyeVNlY3Rpb25zID0gW107XHJcbiAgICBpZiAobWVkaWFRdWVyeS50eXBlKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKG1lZGlhUXVlcnkudHlwZSk7XHJcbiAgICBpZiAobWVkaWFRdWVyeS5vcmllbnRhdGlvbilcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihvcmllbnRhdGlvbjogXCIgKyBtZWRpYVF1ZXJ5Lm9yaWVudGF0aW9uICsgXCIpXCIpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkubWluV2lkdGgpXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIobWluLXdpZHRoOiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWluV2lkdGgpICsgXCIpXCIpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkubWF4V2lkdGgpXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIobWF4LXdpZHRoOiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWF4V2lkdGgpICsgXCIpXCIpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkubWluSGVpZ2h0KVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1pbi1oZWlnaHQ6IFwiICsgbWVkaWFMZW5ndGgobWVkaWFRdWVyeS5taW5IZWlnaHQpICsgXCIpXCIpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkubWF4SGVpZ2h0KVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1heC1oZWlnaHQ6IFwiICsgbWVkaWFMZW5ndGgobWVkaWFRdWVyeS5tYXhIZWlnaHQpICsgXCIpXCIpO1xyXG4gICAgdmFyIHN0cmluZ01lZGlhUXVlcnkgPSBcIkBtZWRpYSBcIiArIG1lZGlhUXVlcnlTZWN0aW9ucy5qb2luKCcgYW5kICcpO1xyXG4gICAgdmFyIG9iamVjdCA9IHtcclxuICAgICAgICAkbmVzdDogKF9hID0ge30sXHJcbiAgICAgICAgICAgIF9hW3N0cmluZ01lZGlhUXVlcnldID0gZXh0ZW5kLmFwcGx5KHZvaWQgMCwgb2JqZWN0cyksXHJcbiAgICAgICAgICAgIF9hKVxyXG4gICAgfTtcclxuICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICB2YXIgX2E7XHJcbn07XHJcbnZhciBtZWRpYUxlbmd0aCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IHZhbHVlICsgXCJweFwiO1xyXG59O1xyXG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyAgQ29tbW9uLnRzeCAtIEdidGNcclxuLy9cclxuLy8gIENvcHlyaWdodCDCqSAyMDE4LCBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UuICBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4vL1xyXG4vLyAgTGljZW5zZWQgdG8gdGhlIEdyaWQgUHJvdGVjdGlvbiBBbGxpYW5jZSAoR1BBKSB1bmRlciBvbmUgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuIFNlZVxyXG4vLyAgdGhlIE5PVElDRSBmaWxlIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLlxyXG4vLyAgVGhlIEdQQSBsaWNlbnNlcyB0aGlzIGZpbGUgdG8geW91IHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgdGhlIFwiTGljZW5zZVwiOyB5b3UgbWF5IG5vdCB1c2UgdGhpc1xyXG4vLyAgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXQ6XHJcbi8vXHJcbi8vICAgICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4vL1xyXG4vLyAgVW5sZXNzIGFncmVlZCB0byBpbiB3cml0aW5nLCB0aGUgc3ViamVjdCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhblxyXG4vLyAgXCJBUy1JU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gUmVmZXIgdG8gdGhlXHJcbi8vICBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucy5cclxuLy9cclxuLy8gIENvZGUgTW9kaWZpY2F0aW9uIEhpc3Rvcnk6XHJcbi8vICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICAxMC8xMy8yMDIwIC0gQy4gTGFja25lclxyXG4vLyAgICAgICBHZW5lcmF0ZWQgb3JpZ2luYWwgdmVyc2lvbiBvZiBzb3VyY2UgY29kZS5cclxuLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgc3R5bGUgfSBmcm9tIFwidHlwZXN0eWxlXCJcclxuXHJcbi8vIHN0eWxlc1xyXG5leHBvcnQgY29uc3Qgb3V0ZXJEaXY6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgbWFyZ2luTGVmdDogJ2F1dG8nLFxyXG4gICAgbWFyZ2luUmlnaHQ6ICdhdXRvJyxcclxuICAgIG92ZXJmbG93WTogJ2hpZGRlbicsXHJcbiAgICBvdmVyZmxvd1g6ICdoaWRkZW4nLFxyXG4gICAgcGFkZGluZzogJzBlbScsXHJcbiAgICB6SW5kZXg6IDEwMDAsXHJcbiAgICBib3hTaGFkb3c6ICc0cHggNHB4IDJweCAjODg4ODg4JyxcclxuICAgIGJvcmRlcjogJzJweCBzb2xpZCBibGFjaycsXHJcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgIHRvcDogJzAnLFxyXG4gICAgbGVmdDogMCxcclxuICAgIGRpc3BsYXk6ICdub25lJyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGUgPSBzdHlsZSh7XHJcbiAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgaGVpZ2h0OiAnMjBweCcsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjODA4MDgwJyxcclxuICAgIGN1cnNvcjogJ21vdmUnLFxyXG4gICAgcGFkZGluZzogJzBlbSdcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgY2xvc2VCdXR0b24gPSBzdHlsZSh7XHJcbiAgICBiYWNrZ3JvdW5kOiAnZmlyZWJyaWNrJyxcclxuICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICB0b3A6IDAsXHJcbiAgICByaWdodDogMCxcclxuICAgIHdpZHRoOiAnMjBweCcsXHJcbiAgICBoZWlnaHQ6ICcyMHB4JyxcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICB2ZXJ0aWNhbEFsaWduOiAnbWlkZGxlJyxcclxuICAgIHBhZGRpbmc6IDAsXHJcbiAgICBib3JkZXI6IDAsXHJcbiAgICAkbmVzdDoge1xyXG4gICAgICAgIFwiJjpob3ZlclwiOiB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICdvcmFuZ2VyZWQnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbmludGVyZmFjZSBJd2luZG93UHJvcHMge1xyXG4gICAgc2hvdzogYm9vbGVhbixcclxuICAgIGNsb3NlOiAoKSA9PiB2b2lkLFxyXG4gICAgd2lkdGg6IG51bWJlcixcclxuICAgIG1heEhlaWdodDogbnVtYmVyLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgV2lkZ2V0V2luZG93OiBSZWFjdC5GdW5jdGlvbkNvbXBvbmVudDxJd2luZG93UHJvcHM+ID0gKHByb3BzKSA9PiB7XHJcbiAgICBjb25zdCByZWZXaW5kb3cgPSBSZWFjdC51c2VSZWYobnVsbCk7XHJcbiAgICBjb25zdCByZWZIYW5kbGUgPSBSZWFjdC51c2VSZWYobnVsbCk7XHJcblxyXG4gICAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcclxuICAgICAgICBpZiAocHJvcHMuc2hvdylcclxuICAgICAgICAgICAgKCQocmVmV2luZG93LmN1cnJlbnQpIGFzIGFueSkuZHJhZ2dhYmxlKHsgc2Nyb2xsOiBmYWxzZSwgaGFuZGxlOiByZWZIYW5kbGUuY3VycmVudCwgY29udGFpbm1lbnQ6ICcjY2hhcnRwYW5lbCcgfSk7XHJcbiAgICB9KVxyXG5cclxuICAgIGlmICghcHJvcHMuc2hvdylcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDwgZGl2IHJlZj17cmVmV2luZG93fSBjbGFzc05hbWU9XCJ1aS13aWRnZXQtY29udGVudFwiIHN0eWxlPXt7IC4uLm91dGVyRGl2LCB3aWR0aDogcHJvcHMud2lkdGgsIG1heEhlaWdodDogcHJvcHMubWF4SGVpZ2h0LCBkaXNwbGF5OiB1bmRlZmluZWQgfX0gPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlcjogJ2JsYWNrIHNvbGlkIDJweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHJlZj17cmVmSGFuZGxlfSBjbGFzc05hbWU9e2hhbmRsZX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiBwcm9wcy53aWR0aCAtIDYsIG1heEhlaWdodDogcHJvcHMubWF4SGVpZ2h0IC0gMjQgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAge3Byb3BzLmNoaWxkcmVufVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17Y2xvc2VCdXR0b259IG9uQ2xpY2s9eygpID0+IHByb3BzLmNsb3NlKCl9Plg8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG59IiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gIExpZ2h0bmluZ0RhdGEudHN4IC0gR2J0Y1xyXG4vL1xyXG4vLyAgQ29weXJpZ2h0IMKpIDIwMTgsIEdyaWQgUHJvdGVjdGlvbiBBbGxpYW5jZS4gIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbi8vXHJcbi8vICBMaWNlbnNlZCB0byB0aGUgR3JpZCBQcm90ZWN0aW9uIEFsbGlhbmNlIChHUEEpIHVuZGVyIG9uZSBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gU2VlXHJcbi8vICB0aGUgTk9USUNFIGZpbGUgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuXHJcbi8vICBUaGUgR1BBIGxpY2Vuc2VzIHRoaXMgZmlsZSB0byB5b3UgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCB0aGUgXCJMaWNlbnNlXCI7IHlvdSBtYXkgbm90IHVzZSB0aGlzXHJcbi8vICBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdDpcclxuLy9cclxuLy8gICAgICBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbi8vXHJcbi8vICBVbmxlc3MgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHRoZSBzdWJqZWN0IHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuXHJcbi8vICBcIkFTLUlTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBSZWZlciB0byB0aGVcclxuLy8gIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zLlxyXG4vL1xyXG4vLyAgQ29kZSBNb2RpZmljYXRpb24gSGlzdG9yeTpcclxuLy8gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gIDAzLzEzLzIwMTkgLSBTdGVwaGVuIEMuIFdpbGxzXHJcbi8vICAgICAgIEdlbmVyYXRlZCBvcmlnaW5hbCB2ZXJzaW9uIG9mIHNvdXJjZSBjb2RlLlxyXG4vL1xyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1dGMgfSBmcm9tICdtb21lbnQnO1xyXG5pbXBvcnQgeyBvdXRlckRpdiwgaGFuZGxlLCBjbG9zZUJ1dHRvbiwgV2lkZ2V0V2luZG93IH0gZnJvbSAnLi9Db21tb24nO1xyXG5cclxuXHJcbmludGVyZmFjZSBJcHJvcHMgeyBjbG9zZUNhbGxiYWNrOiAoKSA9PiB2b2lkLCBldmVudElkOiBudW1iZXIsIGlzT3BlbjogYm9vbGVhbiB9XHJcbmRlY2xhcmUgdmFyIHdpbmRvdzogYW55XHJcblxyXG5jb25zdCBMaWdodG5pbmdEYXRhV2lkZ2V0ID0gKHByb3BzOiBJcHJvcHMpID0+IHtcclxuICAgIGNvbnN0IFt0YmxEYXRhLCBzZXRUQkxEYXRhXSA9IFJlYWN0LnVzZVN0YXRlPEFycmF5PEpTWC5FbGVtZW50Pj4oW10pO1xyXG5cclxuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAgICAgbGV0IGhhbmRsZSA9IGdldERhdGEoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuICgpID0+IHsgaWYgKGhhbmRsZSAhPSB1bmRlZmluZWQgJiYgaGFuZGxlLmFib3J0ICE9IHVuZGVmaW5lZCkgaGFuZGxlLmFib3J0KCk7IH1cclxuICAgIH0sIFtwcm9wcy5ldmVudElkXSlcclxuXHJcbiAgICBmdW5jdGlvbiBnZXREYXRhKCk6IEpRdWVyeS5qcVhIUiB7XHJcbiAgICAgICAgdmFyIGxpZ2h0bmluZ1F1ZXJ5ID0gd2luZG93LkxpZ2h0bmluZ1F1ZXJ5O1xyXG5cclxuICAgICAgICBpZiAobGlnaHRuaW5nUXVlcnkgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZVRhYmxlID0gZGlzcGxheURhdGEgPT4ge1xyXG4gICAgICAgICAgICBsZXQgYXJyID0gQXJyYXkuaXNBcnJheShkaXNwbGF5RGF0YSkgPyBkaXNwbGF5RGF0YSA6IFtkaXNwbGF5RGF0YV07XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goXHJcbiAgICAgICAgICAgICAgICA8dHIga2V5PSdIZWFkZXInPlxyXG4gICAgICAgICAgICAgICAgICAgIHtPYmplY3Qua2V5cyhhcnJbMF0pLm1hcChrZXkgPT4gPHRoIGtleT17a2V5fT57a2V5fTwvdGg+KX1cclxuICAgICAgICAgICAgICAgIDwvdHI+KVxyXG4gICAgICAgICAgICByZXN1bHQucHVzaCguLi5hcnIubWFwKChyb3csaW5kZXgpID0+IFxyXG4gICAgICAgICAgICAgICAgPHRyIHN0eWxlPXt7IGRpc3BsYXk6ICd0YWJsZScsIHRhYmxlTGF5b3V0OiAnZml4ZWQnLCB3aWR0aDogJzEwMCUnIH19IGtleT17XCJyb3dcIiArIGluZGV4fT5cclxuICAgICAgICAgICAgICAgICAgICB7T2JqZWN0LmtleXMocm93KS5tYXAoa2V5ID0+IDx0ZCBrZXk9e1wicm93XCIgKyBpbmRleCArIGtleX0+e3Jvd1trZXldfTwvdGQ+KX1cclxuICAgICAgICAgICAgICAgIDwvdHI+KSlcclxuICAgICAgICAgICAgc2V0VEJMRGF0YShyZXN1bHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBlcnJIYW5kbGVyID0gZXJyID0+IHtcclxuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIlVua25vd24gZXJyb3JcIjtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKGVycikgPT09IFwic3RyaW5nXCIpXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gZXJyO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChlcnIgJiYgdHlwZW9mIChlcnIubWVzc2FnZSkgPT09IFwic3RyaW5nXCIgJiYgZXJyLm1lc3NhZ2UgIT09IFwiXCIpXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gZXJyLm1lc3NhZ2U7XHJcblxyXG4gICAgICAgICAgICB1cGRhdGVUYWJsZSh7IEVycm9yOiBtZXNzYWdlIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHVwZGF0ZVRhYmxlKHsgU3RhdGU6IFwiTG9hZGluZy4uLlwiIH0pO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBsZXQgaGFuZGxlID0gICQuYWpheCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIHVybDogYCR7aG9tZVBhdGh9YXBpL09wZW5TRUUvR2V0TGlnaHRuaW5nUGFyYW1ldGVycz9ldmVudElkPSR7cHJvcHMuZXZlbnRJZH1gLFxyXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBoYW5kbGUuZG9uZShsaWdodG5pbmdQYXJhbWV0ZXJzID0+IHtcclxuICAgICAgICAgICAgbGV0IG5vRGF0YSA9IHsgU3RhdGU6IFwiTm8gRGF0YVwiIH07XHJcblxyXG4gICAgICAgICAgICBsZXQgbGluZUtleSA9IGxpZ2h0bmluZ1BhcmFtZXRlcnMuTGluZUtleTtcclxuICAgICAgICAgICAgbGV0IHN0YXJ0VGltZSA9IHV0YyhsaWdodG5pbmdQYXJhbWV0ZXJzLlN0YXJ0VGltZSkudG9EYXRlKCk7XHJcbiAgICAgICAgICAgIGxldCBlbmRUaW1lID0gdXRjKGxpZ2h0bmluZ1BhcmFtZXRlcnMuRW5kVGltZSkudG9EYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWxpbmVLZXkpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZVRhYmxlKG5vRGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxpZ2h0bmluZ1F1ZXJ5LnF1ZXJ5TGluZUdlb21ldHJ5KGxpbmVLZXksIGxpbmVHZW9tZXRyeSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsaWdodG5pbmdRdWVyeS5xdWVyeUxpbmVCdWZmZXJHZW9tZXRyeShsaW5lR2VvbWV0cnksIGxpbmVCdWZmZXJHZW9tZXRyeSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlnaHRuaW5nUXVlcnkucXVlcnlMaWdodG5pbmdEYXRhKGxpbmVCdWZmZXJHZW9tZXRyeSwgc3RhcnRUaW1lLCBlbmRUaW1lLCBsaWdodG5pbmdEYXRhID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpc3BsYXlEYXRhID0gKGxpZ2h0bmluZ0RhdGEubGVuZ3RoICE9PSAwKSA/IGxpZ2h0bmluZ0RhdGEgOiBub0RhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVRhYmxlKGRpc3BsYXlEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCBlcnJIYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgIH0sIGVyckhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9LCBlcnJIYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZTtcclxuICAgIH1cclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPFdpZGdldFdpbmRvdyBzaG93PXtwcm9wcy5pc09wZW59IGNsb3NlPXtwcm9wcy5jbG9zZUNhbGxiYWNrfSBtYXhIZWlnaHQ9ezUwMH0gd2lkdGg9ezgwMH0+XHJcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidGFibGVcIiBzdHlsZT17eyBmb250U2l6ZTogJ3NtYWxsJywgbWFyZ2luQm90dG9tOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZCBzdHlsZT17eyBkaXNwbGF5OiAndGFibGUnLCB0YWJsZUxheW91dDogJ2ZpeGVkJywgd2lkdGg6ICdjYWxjKDEwMCUgLSAxZW0pJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3RibERhdGFbMF19XHJcbiAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICA8dGJvZHkgc3R5bGU9e3sgbWF4SGVpZ2h0OiA0MTAsIG92ZXJmbG93WTogJ2F1dG8nLCBkaXNwbGF5OiAnYmxvY2snIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7dGJsRGF0YS5zbGljZSgxKX1cclxuICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICA8L1dpZGdldFdpbmRvdz5cclxuICAgICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExpZ2h0bmluZ0RhdGFXaWRnZXQ7XHJcblxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IG1vbWVudDsiLCJtb2R1bGUuZXhwb3J0cyA9IFJlYWN0OyJdLCJzb3VyY2VSb290IjoiIn0=