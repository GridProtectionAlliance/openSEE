/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/free-style/dist/free-style.js":
/*!****************************************************!*\
  !*** ./node_modules/free-style/dist/free-style.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "./node_modules/process/browser.js");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
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
//# sourceMappingURL=free-style.js.map

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

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

/***/ "./Scripts/TSX/jQueryUI Widgets/Common.tsx":
/*!*************************************************!*\
  !*** ./Scripts/TSX/jQueryUI Widgets/Common.tsx ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WidgetWindow = exports.closeButton = exports.handle = exports.outerDiv = void 0;
var React = __importStar(__webpack_require__(/*! react */ "react"));
var typestyle_1 = __webpack_require__(/*! typestyle */ "./node_modules/typestyle/lib.es2015/index.js");
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
var WidgetWindow = function (props) {
    var refWindow = React.useRef(null);
    var refHandle = React.useRef(null);
    React.useLayoutEffect(function () {
        if (props.show)
            $(refWindow.current).draggable({ scroll: false, handle: refHandle.current, containment: '#chartpanel' });
    });
    if (!props.show)
        return null;
    return (React.createElement("div", { ref: refWindow, className: "ui-widget-content", style: __assign(__assign({}, exports.outerDiv), { width: props.width, maxHeight: props.maxHeight, display: undefined }) },
        React.createElement("div", { style: { border: 'black solid 2px' } },
            React.createElement("div", { ref: refHandle, className: exports.handle }),
            React.createElement("div", { style: { width: props.width - 6, maxHeight: props.maxHeight - 24 } }, props.children),
            React.createElement("button", { className: exports.closeButton, onClick: function () { return props.close(); } }, "X"))));
};
exports.WidgetWindow = WidgetWindow;


/***/ }),

/***/ "./Scripts/TSX/jQueryUI Widgets/HarmonicStats.tsx":
/*!********************************************************!*\
  !*** ./Scripts/TSX/jQueryUI Widgets/HarmonicStats.tsx ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var React = __importStar(__webpack_require__(/*! react */ "react"));
var Common_1 = __webpack_require__(/*! ./Common */ "./Scripts/TSX/jQueryUI Widgets/Common.tsx");
var HarmonicStatsWidget = function (props) {
    var _a = __read(React.useState([]), 2), tblData = _a[0], setTblData = _a[1];
    React.useEffect(function () {
        var handle = getData();
        return function () { if (handle != undefined && handle.abort != undefined)
            handle.abort(); };
    }, [props.eventId]);
    function getData() {
        var handle = $.ajax({
            type: "GET",
            url: homePath + "api/OpenSEE/GetHarmonics?eventId=" + props.eventId,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        handle.done(function (data) {
            var rows = [];
            rows.push(React.createElement("tr", null,
                React.createElement("th", { colSpan: 1 },
                    React.createElement("button", { className: 'btn btn-primary', style: { width: 75 }, onClick: function () { return props.exportCallback(); } }, "Export")),
                data.map(function (key, i) { return React.createElement("th", { colSpan: 2, scope: 'colgroup', key: i }, key.Channel); })));
            rows.push(React.createElement("tr", null,
                React.createElement("th", null, "Harmonic"),
                data.map(function (item, index) { return React.createElement(React.Fragment, { key: index },
                    React.createElement("th", null, "Mag"),
                    " ",
                    React.createElement("th", null, "Ang"),
                    " "); })));
            var numChannels = data.length;
            var jsons = data.map(function (x) { return JSON.parse(x.SpectralData); });
            var numHarmonics = Math.max.apply(Math, __spreadArray([], __read(jsons.map(function (x) { return Object.keys(x).length; }))));
            for (var index = 1; index <= numHarmonics; ++index) {
                var tds = [];
                var label = 'H' + index;
                for (var j = 0; j < numChannels; ++j) {
                    var key = data[j].Channel + label;
                    if (jsons[j][label] != undefined) {
                        tds.push(React.createElement("td", { key: key + 'Mag' }, jsons[j][label].Magnitude.toFixed(2)));
                        tds.push(React.createElement("td", { key: key + 'Ang' }, jsons[j][label].Angle.toFixed(2)));
                    }
                    else {
                        tds.push(React.createElement("td", { key: key + 'Mag' }));
                        tds.push(React.createElement("td", { key: key + 'Ang' }));
                    }
                }
                rows.push(React.createElement("tr", { style: { display: 'table', tableLayout: 'fixed', width: '100%' }, key: label },
                    React.createElement("td", null, label),
                    tds));
            }
            setTblData(rows);
        });
        return handle;
    }
    return (React.createElement(Common_1.WidgetWindow, { show: props.isOpen, close: props.closeCallback, maxHeight: 600, width: 1706 },
        React.createElement("div", { style: { maxWidth: 1700 } },
            React.createElement("table", { className: "table", style: { fontSize: 'large', marginBottom: 0 } },
                React.createElement("thead", { style: { display: 'table', tableLayout: 'fixed', width: 'calc(100% - 1em)' } },
                    tblData[0],
                    tblData[1]),
                React.createElement("tbody", { style: { fontSize: 'medium', height: 500, maxHeight: 500, overflowY: 'auto', display: 'block' } }, tblData.slice(2))))));
};
exports.default = HarmonicStatsWidget;


/***/ }),

/***/ "./node_modules/typestyle/lib.es2015/index.js":
/*!****************************************************!*\
  !*** ./node_modules/typestyle/lib.es2015/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TypeStyle": () => (/* reexport safe */ _internal_typestyle__WEBPACK_IMPORTED_MODULE_0__.TypeStyle),
/* harmony export */   "types": () => (/* reexport module object */ _types__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   "extend": () => (/* reexport safe */ _internal_utilities__WEBPACK_IMPORTED_MODULE_2__.extend),
/* harmony export */   "classes": () => (/* reexport safe */ _internal_utilities__WEBPACK_IMPORTED_MODULE_2__.classes),
/* harmony export */   "media": () => (/* reexport safe */ _internal_utilities__WEBPACK_IMPORTED_MODULE_2__.media),
/* harmony export */   "setStylesTarget": () => (/* binding */ setStylesTarget),
/* harmony export */   "cssRaw": () => (/* binding */ cssRaw),
/* harmony export */   "cssRule": () => (/* binding */ cssRule),
/* harmony export */   "forceRenderStyles": () => (/* binding */ forceRenderStyles),
/* harmony export */   "fontFace": () => (/* binding */ fontFace),
/* harmony export */   "getStyles": () => (/* binding */ getStyles),
/* harmony export */   "keyframes": () => (/* binding */ keyframes),
/* harmony export */   "reinit": () => (/* binding */ reinit),
/* harmony export */   "style": () => (/* binding */ style),
/* harmony export */   "stylesheet": () => (/* binding */ stylesheet),
/* harmony export */   "createTypeStyle": () => (/* binding */ createTypeStyle)
/* harmony export */ });
/* harmony import */ var _internal_typestyle__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./internal/typestyle */ "./node_modules/typestyle/lib.es2015/internal/typestyle.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types */ "./node_modules/typestyle/lib.es2015/types.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_types__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _internal_utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./internal/utilities */ "./node_modules/typestyle/lib.es2015/internal/utilities.js");


/**
 * All the CSS types in the 'types' namespace
 */


/**
 * Export certain utilities
 */

/** Zero configuration, default instance of TypeStyle */
var ts = new _internal_typestyle__WEBPACK_IMPORTED_MODULE_0__.TypeStyle({ autoGenerateTag: true });
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
    var instance = new _internal_typestyle__WEBPACK_IMPORTED_MODULE_0__.TypeStyle({ autoGenerateTag: false });
    if (target) {
        instance.setStylesTarget(target);
    }
    return instance;
}


/***/ }),

/***/ "./node_modules/typestyle/lib.es2015/internal/formatting.js":
/*!******************************************************************!*\
  !*** ./node_modules/typestyle/lib.es2015/internal/formatting.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ensureStringObj": () => (/* binding */ ensureStringObj),
/* harmony export */   "explodeKeyframes": () => (/* binding */ explodeKeyframes)
/* harmony export */ });
/* harmony import */ var free_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! free-style */ "./node_modules/free-style/dist/free-style.js");
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
            result[free_style__WEBPACK_IMPORTED_MODULE_0__.IS_UNIQUE] = val;
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

/***/ "./node_modules/typestyle/lib.es2015/internal/typestyle.js":
/*!*****************************************************************!*\
  !*** ./node_modules/typestyle/lib.es2015/internal/typestyle.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TypeStyle": () => (/* binding */ TypeStyle)
/* harmony export */ });
/* harmony import */ var free_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! free-style */ "./node_modules/free-style/dist/free-style.js");
/* harmony import */ var free_style__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(free_style__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _formatting__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./formatting */ "./node_modules/typestyle/lib.es2015/internal/formatting.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities */ "./node_modules/typestyle/lib.es2015/internal/utilities.js");



/**
 * Creates an instance of free style with our options
 */
var createFreeStyle = function () { return free_style__WEBPACK_IMPORTED_MODULE_0__.create(
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
            var object = (0,_formatting__WEBPACK_IMPORTED_MODULE_1__.ensureStringObj)(_utilities__WEBPACK_IMPORTED_MODULE_2__.extend.apply(void 0, objects)).result;
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
            var _a = (0,_formatting__WEBPACK_IMPORTED_MODULE_1__.explodeKeyframes)(frames), keyframes = _a.keyframes, $debugName = _a.$debugName;
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
        (0,_utilities__WEBPACK_IMPORTED_MODULE_2__.raf)(function () {
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
        var _a = (0,_formatting__WEBPACK_IMPORTED_MODULE_1__.ensureStringObj)(_utilities__WEBPACK_IMPORTED_MODULE_2__.extend.apply(undefined, arguments)), result = _a.result, debugName = _a.debugName;
        var className = debugName ? freeStyle.registerStyle(result, debugName) : freeStyle.registerStyle(result);
        this._styleUpdated();
        return className;
    };
    return TypeStyle;
}());



/***/ }),

/***/ "./node_modules/typestyle/lib.es2015/internal/utilities.js":
/*!*****************************************************************!*\
  !*** ./node_modules/typestyle/lib.es2015/internal/utilities.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "raf": () => (/* binding */ raf),
/* harmony export */   "classes": () => (/* binding */ classes),
/* harmony export */   "extend": () => (/* binding */ extend),
/* harmony export */   "media": () => (/* binding */ media)
/* harmony export */ });
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

/***/ "./node_modules/typestyle/lib.es2015/types.js":
/*!****************************************************!*\
  !*** ./node_modules/typestyle/lib.es2015/types.js ***!
  \****************************************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = React;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./Scripts/TSX/jQueryUI Widgets/HarmonicStats.tsx");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFybW9uaWNTdGF0c1dpZGdldC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFhO0FBQ2I7QUFDQTtBQUNBLFdBQVcsZ0JBQWdCLHNDQUFzQyxrQkFBa0I7QUFDbkYsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBLENBQUM7QUFDRCw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLFdBQVcsRUFBRTtBQUNqRCwrQkFBK0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0VBQWdFLGdCQUFnQjtBQUNoRjtBQUNBLGtFQUFrRSxtQ0FBbUM7QUFDckc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLG9CQUFvQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUM7QUFDckM7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsOEJBQThCO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxnQkFBZ0I7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsZ0NBQWdDLFNBQVM7QUFDakYsS0FBSyxTQUFTO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCw0QkFBNEI7QUFDcEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0QsNEJBQTRCO0FBQ3BGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxvQkFBb0I7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixtQkFBbUI7QUFDMUMsMEJBQTBCLG1CQUFtQjtBQUM3QywwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsZ0JBQWdCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxnQkFBZ0I7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxtQkFBbUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDLDZCQUE2QjtBQUM3Qiw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHNDQUFzQztBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0I7QUFDL0IsZ0NBQWdDLGVBQWUsT0FBTyxvQkFBb0IsYUFBdUI7QUFDakcsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDs7Ozs7Ozs7OztBQzFjQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHNCQUFzQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0Qjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsc0NBQXNDOztBQUV0QztBQUNBO0FBQ0E7O0FBRUEsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaEs3QixvRUFBK0I7QUFDL0IsdUdBQWlDO0FBR3BCLGdCQUFRLEdBQXdCO0lBQ3pDLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFNBQVMsRUFBRSxRQUFRO0lBQ25CLFNBQVMsRUFBRSxRQUFRO0lBQ25CLE9BQU8sRUFBRSxLQUFLO0lBQ2QsTUFBTSxFQUFFLElBQUk7SUFDWixTQUFTLEVBQUUscUJBQXFCO0lBQ2hDLE1BQU0sRUFBRSxpQkFBaUI7SUFDekIsUUFBUSxFQUFFLFVBQVU7SUFDcEIsR0FBRyxFQUFFLEdBQUc7SUFDUixJQUFJLEVBQUUsQ0FBQztJQUNQLE9BQU8sRUFBRSxNQUFNO0lBQ2YsZUFBZSxFQUFFLE9BQU87Q0FDM0IsQ0FBQztBQUVXLGNBQU0sR0FBRyxpQkFBSyxDQUFDO0lBQ3hCLEtBQUssRUFBRSxNQUFNO0lBQ2IsTUFBTSxFQUFFLE1BQU07SUFDZCxlQUFlLEVBQUUsU0FBUztJQUMxQixNQUFNLEVBQUUsTUFBTTtJQUNkLE9BQU8sRUFBRSxLQUFLO0NBQ2pCLENBQUMsQ0FBQztBQUVVLG1CQUFXLEdBQUcsaUJBQUssQ0FBQztJQUM3QixVQUFVLEVBQUUsV0FBVztJQUN2QixLQUFLLEVBQUUsT0FBTztJQUNkLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLEdBQUcsRUFBRSxDQUFDO0lBQ04sS0FBSyxFQUFFLENBQUM7SUFDUixLQUFLLEVBQUUsTUFBTTtJQUNiLE1BQU0sRUFBRSxNQUFNO0lBQ2QsU0FBUyxFQUFFLFFBQVE7SUFDbkIsYUFBYSxFQUFFLFFBQVE7SUFDdkIsT0FBTyxFQUFFLENBQUM7SUFDVixNQUFNLEVBQUUsQ0FBQztJQUNULEtBQUssRUFBRTtRQUNILFNBQVMsRUFBRTtZQUNQLFVBQVUsRUFBRSxXQUFXO1NBQzFCO0tBQ0o7Q0FDSixDQUFDLENBQUM7QUFTSSxJQUFNLFlBQVksR0FBMEMsVUFBQyxLQUFLO0lBQ3JFLElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVyQyxLQUFLLENBQUMsZUFBZSxDQUFDO1FBQ2xCLElBQUksS0FBSyxDQUFDLElBQUk7WUFDVCxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDMUgsQ0FBQyxDQUFDO0lBRUYsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO1FBQ1gsT0FBTyxJQUFJLENBQUM7SUFFaEIsT0FBTyxDQUNILDZCQUFNLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLG1CQUFtQixFQUFDLEtBQUssd0JBQU8sZ0JBQVEsS0FBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUztRQUN4SSw2QkFBSyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsaUJBQWlCLEVBQUU7WUFDckMsNkJBQUssR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsY0FBTSxHQUFRO1lBQzlDLDZCQUFLLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLEVBQUUsSUFDbEUsS0FBSyxDQUFDLFFBQVEsQ0FDYjtZQUNOLGdDQUFRLFNBQVMsRUFBRSxtQkFBVyxFQUFFLE9BQU8sRUFBRSxjQUFNLFlBQUssQ0FBQyxLQUFLLEVBQUUsRUFBYixDQUFhLFFBQVksQ0FDdEUsQ0FDSixDQUNMO0FBQ1QsQ0FBQztBQXZCWSxvQkFBWSxnQkF1QnhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5RUQsb0VBQStCO0FBQy9CLGdHQUF1RTtBQUl2RSxJQUFNLG1CQUFtQixHQUFHLFVBQUMsS0FBYTtJQUVoQyxnQkFBd0IsS0FBSyxDQUFDLFFBQVEsQ0FBcUIsRUFBRSxDQUFDLE1BQTdELE9BQU8sVUFBRSxVQUFVLFFBQTBDLENBQUM7SUFHckUsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNaLElBQUksTUFBTSxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBRXZCLE9BQU8sY0FBUSxJQUFJLE1BQU0sSUFBSSxTQUFTLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxTQUFTO1lBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxRixDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkIsU0FBUyxPQUFPO1FBQ1osSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNoQixJQUFJLEVBQUUsS0FBSztZQUNYLEdBQUcsRUFBSyxRQUFRLHlDQUFvQyxLQUFLLENBQUMsT0FBUztZQUNuRSxXQUFXLEVBQUUsaUNBQWlDO1lBQzlDLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLEtBQUssRUFBRSxJQUFJO1lBQ1gsS0FBSyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSTtZQUNiLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxJQUFJLENBQ0w7Z0JBQ0ksNEJBQUksT0FBTyxFQUFFLENBQUM7b0JBQUUsZ0NBQVEsU0FBUyxFQUFDLGlCQUFpQixFQUFDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsY0FBTSxZQUFLLENBQUMsY0FBYyxFQUFFLEVBQXRCLENBQXNCLGFBQWlCLENBQUs7Z0JBQ3BJLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxHQUFHLEVBQUMsQ0FBQyxJQUFLLG1DQUFJLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFDLFVBQVUsRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFHLEdBQUcsQ0FBQyxPQUFPLENBQU0sRUFBM0QsQ0FBMkQsQ0FBQyxDQUNoRixDQUFDO1lBRVYsSUFBSSxDQUFDLElBQUksQ0FDTDtnQkFDSSwyQ0FBaUI7Z0JBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUUsS0FBSyxJQUFLLDJCQUFDLEtBQUssQ0FBQyxRQUFRLElBQUMsR0FBRyxFQUFFLEtBQUs7b0JBQUUsc0NBQVk7O29CQUFDLHNDQUFZO3dCQUFrQixFQUF2RSxDQUF1RSxDQUFDLENBQ2xHLENBQUM7WUFHVixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBQyxJQUFJLFdBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7WUFDdEQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsT0FBUixJQUFJLDJCQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBQyxJQUFJLGFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFyQixDQUFxQixDQUFDLEdBQUMsQ0FBQztZQUV0RSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLElBQUksWUFBWSxFQUFFLEVBQUUsS0FBSyxFQUFFO2dCQUNoRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7Z0JBQ2IsSUFBSSxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUs7Z0JBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUU7b0JBQ2xDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsS0FBSztvQkFDakMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksU0FBUyxFQUFFO3dCQUM5QixHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUFJLEdBQUcsRUFBRSxHQUFHLEdBQUcsS0FBSyxJQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFNLENBQUMsQ0FBQzt3QkFDNUUsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBSSxHQUFHLEVBQUUsR0FBRyxHQUFHLEtBQUssSUFBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBTSxDQUFDLENBQUM7cUJBQzNFO3lCQUNJO3dCQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxLQUFLLEdBQU8sQ0FBQyxDQUFDO3dCQUN0QyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUFJLEdBQUcsRUFBRSxHQUFHLEdBQUcsS0FBSyxHQUFPLENBQUMsQ0FBQztxQkFDekM7aUJBQ0o7Z0JBQ0QsSUFBSSxDQUFDLElBQUksQ0FDTCw0QkFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLO29CQUM1RSxnQ0FBSyxLQUFLLENBQU07b0JBQ2YsR0FBRyxDQUNILENBQUMsQ0FBQzthQUNkO1lBQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELE9BQU8sQ0FDSCxvQkFBQyxxQkFBWSxJQUFDLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUk7UUFDckYsNkJBQUssS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUMxQiwrQkFBTyxTQUFTLEVBQUMsT0FBTyxFQUFDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRTtnQkFDbEUsK0JBQU8sS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRTtvQkFDOUUsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDVixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQ1A7Z0JBQ1IsK0JBQU8sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQ2pHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ2IsQ0FDSixDQUNOLENBQ0ssQ0FDbEIsQ0FBQztBQUVOLENBQUM7QUFFRCxrQkFBZSxtQkFBbUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoSGM7QUFDNUI7QUFDckI7QUFDQTtBQUNBO0FBQ2lDO0FBQ2hCO0FBQ2pCO0FBQ0E7QUFDQTtBQUM4RDtBQUM5RDtBQUNBLGFBQWEsMERBQVMsR0FBRyx1QkFBdUI7QUFDaEQ7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsdUJBQXVCLDBEQUFTLEdBQUcsd0JBQXdCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4RXdDO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpREFBbUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDTztBQUNQLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9Dd0M7QUFDeUI7QUFDdkI7QUFDMUM7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLE9BQU8sOENBQWdCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qix1QkFBdUI7QUFDcEQ7QUFDQTtBQUNBLHlCQUF5Qiw0REFBZSxDQUFDLG9EQUFZO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qix1QkFBdUI7QUFDcEQ7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLGdCQUFnQjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQiw2REFBZ0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0QsMEJBQTBCO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtRkFBbUY7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSwrQ0FBRztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLG1DQUFtQztBQUM1RTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsNERBQWUsQ0FBQyxvREFBWTtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BNckI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBLHFCQUFxQix1QkFBdUI7QUFDNUM7QUFDQTtBQUNBLHlDQUF5QyxhQUFhO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0EscUJBQXFCLHVCQUF1QjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyx1QkFBdUI7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLGFBQWEsR0FBRyxZQUFZO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQSxxQkFBcUIsdUJBQXVCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakdBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5zZWUvLi9ub2RlX21vZHVsZXMvZnJlZS1zdHlsZS9kaXN0L2ZyZWUtc3R5bGUuanMiLCJ3ZWJwYWNrOi8vb3BlbnNlZS8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vb3BlbnNlZS8uL1NjcmlwdHMvVFNYL2pRdWVyeVVJIFdpZGdldHMvQ29tbW9uLnRzeCIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vU2NyaXB0cy9UU1gvalF1ZXJ5VUkgV2lkZ2V0cy9IYXJtb25pY1N0YXRzLnRzeCIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vbm9kZV9tb2R1bGVzL3R5cGVzdHlsZS9saWIuZXMyMDE1L2luZGV4LmpzIiwid2VicGFjazovL29wZW5zZWUvLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvZm9ybWF0dGluZy5qcyIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vbm9kZV9tb2R1bGVzL3R5cGVzdHlsZS9saWIuZXMyMDE1L2ludGVybmFsL3R5cGVzdHlsZS5qcyIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vbm9kZV9tb2R1bGVzL3R5cGVzdHlsZS9saWIuZXMyMDE1L2ludGVybmFsL3V0aWxpdGllcy5qcyIsIndlYnBhY2s6Ly9vcGVuc2VlL2V4dGVybmFsIFwiUmVhY3RcIiIsIndlYnBhY2s6Ly9vcGVuc2VlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL29wZW5zZWUvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vb3BlbnNlZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb3BlbnNlZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL29wZW5zZWUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vcGVuc2VlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vb3BlbnNlZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vb3BlbnNlZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogVGhlIHVuaXF1ZSBpZCBpcyB1c2VkIGZvciB1bmlxdWUgaGFzaGVzLlxuICovXG52YXIgdW5pcXVlSWQgPSAwO1xuLyoqXG4gKiBUYWcgc3R5bGVzIHdpdGggdGhpcyBzdHJpbmcgdG8gZ2V0IHVuaXF1ZSBoYXNoZXMuXG4gKi9cbmV4cG9ydHMuSVNfVU5JUVVFID0gJ19fRE9fTk9UX0RFRFVQRV9TVFlMRV9fJztcbnZhciB1cHBlckNhc2VQYXR0ZXJuID0gL1tBLVpdL2c7XG52YXIgbXNQYXR0ZXJuID0gL15tcy0vO1xudmFyIGludGVycG9sYXRlUGF0dGVybiA9IC8mL2c7XG52YXIgZXNjYXBlUGF0dGVybiA9IC9bICEjJCUmKCkqKywuLzs8PT4/QFtcXF1eYHt8fX5cIidcXFxcXS9nO1xudmFyIHByb3BMb3dlciA9IGZ1bmN0aW9uIChtKSB7IHJldHVybiBcIi1cIiArIG0udG9Mb3dlckNhc2UoKTsgfTtcbi8qKlxuICogQ1NTIHByb3BlcnRpZXMgdGhhdCBhcmUgdmFsaWQgdW5pdC1sZXNzIG51bWJlcnMuXG4gKi9cbnZhciBjc3NOdW1iZXJQcm9wZXJ0aWVzID0gW1xuICAgICdhbmltYXRpb24taXRlcmF0aW9uLWNvdW50JyxcbiAgICAnYm94LWZsZXgnLFxuICAgICdib3gtZmxleC1ncm91cCcsXG4gICAgJ2NvbHVtbi1jb3VudCcsXG4gICAgJ2NvdW50ZXItaW5jcmVtZW50JyxcbiAgICAnY291bnRlci1yZXNldCcsXG4gICAgJ2ZsZXgnLFxuICAgICdmbGV4LWdyb3cnLFxuICAgICdmbGV4LXBvc2l0aXZlJyxcbiAgICAnZmxleC1zaHJpbmsnLFxuICAgICdmbGV4LW5lZ2F0aXZlJyxcbiAgICAnZm9udC13ZWlnaHQnLFxuICAgICdsaW5lLWNsYW1wJyxcbiAgICAnbGluZS1oZWlnaHQnLFxuICAgICdvcGFjaXR5JyxcbiAgICAnb3JkZXInLFxuICAgICdvcnBoYW5zJyxcbiAgICAndGFiLXNpemUnLFxuICAgICd3aWRvd3MnLFxuICAgICd6LWluZGV4JyxcbiAgICAnem9vbScsXG4gICAgLy8gU1ZHIHByb3BlcnRpZXMuXG4gICAgJ2ZpbGwtb3BhY2l0eScsXG4gICAgJ3N0cm9rZS1kYXNob2Zmc2V0JyxcbiAgICAnc3Ryb2tlLW9wYWNpdHknLFxuICAgICdzdHJva2Utd2lkdGgnXG5dO1xuLyoqXG4gKiBNYXAgb2YgY3NzIG51bWJlciBwcm9wZXJ0aWVzLlxuICovXG52YXIgQ1NTX05VTUJFUiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4vLyBBZGQgdmVuZG9yIHByZWZpeGVzIHRvIGFsbCB1bml0LWxlc3MgcHJvcGVydGllcy5cbmZvciAodmFyIF9pID0gMCwgX2EgPSBbJy13ZWJraXQtJywgJy1tcy0nLCAnLW1vei0nLCAnLW8tJywgJyddOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgIHZhciBwcmVmaXggPSBfYVtfaV07XG4gICAgZm9yICh2YXIgX2IgPSAwLCBjc3NOdW1iZXJQcm9wZXJ0aWVzXzEgPSBjc3NOdW1iZXJQcm9wZXJ0aWVzOyBfYiA8IGNzc051bWJlclByb3BlcnRpZXNfMS5sZW5ndGg7IF9iKyspIHtcbiAgICAgICAgdmFyIHByb3BlcnR5ID0gY3NzTnVtYmVyUHJvcGVydGllc18xW19iXTtcbiAgICAgICAgQ1NTX05VTUJFUltwcmVmaXggKyBwcm9wZXJ0eV0gPSB0cnVlO1xuICAgIH1cbn1cbi8qKlxuICogRXNjYXBlIGEgQ1NTIGNsYXNzIG5hbWUuXG4gKi9cbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gKHN0cikgeyByZXR1cm4gc3RyLnJlcGxhY2UoZXNjYXBlUGF0dGVybiwgJ1xcXFwkJicpOyB9O1xuLyoqXG4gKiBUcmFuc2Zvcm0gYSBKYXZhU2NyaXB0IHByb3BlcnR5IGludG8gYSBDU1MgcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGh5cGhlbmF0ZShwcm9wZXJ0eU5hbWUpIHtcbiAgICByZXR1cm4gcHJvcGVydHlOYW1lXG4gICAgICAgIC5yZXBsYWNlKHVwcGVyQ2FzZVBhdHRlcm4sIHByb3BMb3dlcilcbiAgICAgICAgLnJlcGxhY2UobXNQYXR0ZXJuLCAnLW1zLScpOyAvLyBJbnRlcm5ldCBFeHBsb3JlciB2ZW5kb3IgcHJlZml4LlxufVxuZXhwb3J0cy5oeXBoZW5hdGUgPSBoeXBoZW5hdGU7XG4vKipcbiAqIEdlbmVyYXRlIGEgaGFzaCB2YWx1ZSBmcm9tIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBzdHJpbmdIYXNoKHN0cikge1xuICAgIHZhciB2YWx1ZSA9IDUzODE7XG4gICAgdmFyIGxlbiA9IHN0ci5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbi0tKVxuICAgICAgICB2YWx1ZSA9ICh2YWx1ZSAqIDMzKSBeIHN0ci5jaGFyQ29kZUF0KGxlbik7XG4gICAgcmV0dXJuICh2YWx1ZSA+Pj4gMCkudG9TdHJpbmcoMzYpO1xufVxuZXhwb3J0cy5zdHJpbmdIYXNoID0gc3RyaW5nSGFzaDtcbi8qKlxuICogVHJhbnNmb3JtIGEgc3R5bGUgc3RyaW5nIHRvIGEgQ1NTIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gc3R5bGVUb1N0cmluZyhrZXksIHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgdmFsdWUgIT09IDAgJiYgIUNTU19OVU1CRVJba2V5XSkge1xuICAgICAgICByZXR1cm4ga2V5ICsgXCI6XCIgKyB2YWx1ZSArIFwicHhcIjtcbiAgICB9XG4gICAgcmV0dXJuIGtleSArIFwiOlwiICsgdmFsdWU7XG59XG4vKipcbiAqIFNvcnQgYW4gYXJyYXkgb2YgdHVwbGVzIGJ5IGZpcnN0IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzb3J0VHVwbGVzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGFbMF0gPiBiWzBdID8gMSA6IC0xOyB9KTtcbn1cbi8qKlxuICogQ2F0ZWdvcml6ZSB1c2VyIHN0eWxlcy5cbiAqL1xuZnVuY3Rpb24gcGFyc2VTdHlsZXMoc3R5bGVzLCBoYXNOZXN0ZWRTdHlsZXMpIHtcbiAgICB2YXIgcHJvcGVydGllcyA9IFtdO1xuICAgIHZhciBuZXN0ZWRTdHlsZXMgPSBbXTtcbiAgICB2YXIgaXNVbmlxdWUgPSBmYWxzZTtcbiAgICAvLyBTb3J0IGtleXMgYmVmb3JlIGFkZGluZyB0byBzdHlsZXMuXG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5rZXlzKHN0eWxlcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBfYVtfaV07XG4gICAgICAgIHZhciB2YWx1ZSA9IHN0eWxlc1trZXldO1xuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gZXhwb3J0cy5JU19VTklRVUUpIHtcbiAgICAgICAgICAgICAgICBpc1VuaXF1ZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIG5lc3RlZFN0eWxlcy5wdXNoKFtrZXkudHJpbSgpLCB2YWx1ZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKFtoeXBoZW5hdGUoa2V5LnRyaW0oKSksIHZhbHVlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3R5bGVTdHJpbmc6IHN0cmluZ2lmeVByb3BlcnRpZXMoc29ydFR1cGxlcyhwcm9wZXJ0aWVzKSksXG4gICAgICAgIG5lc3RlZFN0eWxlczogaGFzTmVzdGVkU3R5bGVzID8gbmVzdGVkU3R5bGVzIDogc29ydFR1cGxlcyhuZXN0ZWRTdHlsZXMpLFxuICAgICAgICBpc1VuaXF1ZTogaXNVbmlxdWVcbiAgICB9O1xufVxuLyoqXG4gKiBTdHJpbmdpZnkgYW4gYXJyYXkgb2YgcHJvcGVydHkgdHVwbGVzLlxuICovXG5mdW5jdGlvbiBzdHJpbmdpZnlQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICByZXR1cm4gcHJvcGVydGllcy5tYXAoZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgIHZhciBuYW1lID0gX2FbMF0sIHZhbHVlID0gX2FbMV07XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gc3R5bGVUb1N0cmluZyhuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHN0eWxlVG9TdHJpbmcobmFtZSwgeCk7IH0pLmpvaW4oJzsnKTtcbiAgICB9KS5qb2luKCc7Jyk7XG59XG4vKipcbiAqIEludGVycG9sYXRlIENTUyBzZWxlY3RvcnMuXG4gKi9cbmZ1bmN0aW9uIGludGVycG9sYXRlKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICBpZiAoc2VsZWN0b3IuaW5kZXhPZignJicpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlcGxhY2UoaW50ZXJwb2xhdGVQYXR0ZXJuLCBwYXJlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50ICsgXCIgXCIgKyBzZWxlY3Rvcjtcbn1cbi8qKlxuICogUmVjdXJzaXZlIGxvb3AgYnVpbGRpbmcgc3R5bGVzIHdpdGggZGVmZXJyZWQgc2VsZWN0b3JzLlxuICovXG5mdW5jdGlvbiBzdHlsaXplKGNhY2hlLCBzZWxlY3Rvciwgc3R5bGVzLCBsaXN0LCBwYXJlbnQpIHtcbiAgICB2YXIgX2EgPSBwYXJzZVN0eWxlcyhzdHlsZXMsICEhc2VsZWN0b3IpLCBzdHlsZVN0cmluZyA9IF9hLnN0eWxlU3RyaW5nLCBuZXN0ZWRTdHlsZXMgPSBfYS5uZXN0ZWRTdHlsZXMsIGlzVW5pcXVlID0gX2EuaXNVbmlxdWU7XG4gICAgdmFyIHBpZCA9IHN0eWxlU3RyaW5nO1xuICAgIGlmIChzZWxlY3Rvci5jaGFyQ29kZUF0KDApID09PSA2NCAvKiBAICovKSB7XG4gICAgICAgIHZhciBydWxlID0gY2FjaGUuYWRkKG5ldyBSdWxlKHNlbGVjdG9yLCBwYXJlbnQgPyB1bmRlZmluZWQgOiBzdHlsZVN0cmluZywgY2FjaGUuaGFzaCkpO1xuICAgICAgICAvLyBOZXN0ZWQgc3R5bGVzIHN1cHBvcnQgKGUuZy4gYC5mb28gPiBAbWVkaWEgPiAuYmFyYCkuXG4gICAgICAgIGlmIChzdHlsZVN0cmluZyAmJiBwYXJlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IHJ1bGUuYWRkKG5ldyBTdHlsZShzdHlsZVN0cmluZywgcnVsZS5oYXNoLCBpc1VuaXF1ZSA/IFwidVwiICsgKCsrdW5pcXVlSWQpLnRvU3RyaW5nKDM2KSA6IHVuZGVmaW5lZCkpO1xuICAgICAgICAgICAgbGlzdC5wdXNoKFtwYXJlbnQsIHN0eWxlXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBuZXN0ZWRTdHlsZXNfMSA9IG5lc3RlZFN0eWxlczsgX2kgPCBuZXN0ZWRTdHlsZXNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBfYiA9IG5lc3RlZFN0eWxlc18xW19pXSwgbmFtZSA9IF9iWzBdLCB2YWx1ZSA9IF9iWzFdO1xuICAgICAgICAgICAgcGlkICs9IG5hbWUgKyBzdHlsaXplKHJ1bGUsIG5hbWUsIHZhbHVlLCBsaXN0LCBwYXJlbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIga2V5ID0gcGFyZW50ID8gaW50ZXJwb2xhdGUoc2VsZWN0b3IsIHBhcmVudCkgOiBzZWxlY3RvcjtcbiAgICAgICAgaWYgKHN0eWxlU3RyaW5nKSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBjYWNoZS5hZGQobmV3IFN0eWxlKHN0eWxlU3RyaW5nLCBjYWNoZS5oYXNoLCBpc1VuaXF1ZSA/IFwidVwiICsgKCsrdW5pcXVlSWQpLnRvU3RyaW5nKDM2KSA6IHVuZGVmaW5lZCkpO1xuICAgICAgICAgICAgbGlzdC5wdXNoKFtrZXksIHN0eWxlXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgX2MgPSAwLCBuZXN0ZWRTdHlsZXNfMiA9IG5lc3RlZFN0eWxlczsgX2MgPCBuZXN0ZWRTdHlsZXNfMi5sZW5ndGg7IF9jKyspIHtcbiAgICAgICAgICAgIHZhciBfZCA9IG5lc3RlZFN0eWxlc18yW19jXSwgbmFtZSA9IF9kWzBdLCB2YWx1ZSA9IF9kWzFdO1xuICAgICAgICAgICAgcGlkICs9IG5hbWUgKyBzdHlsaXplKGNhY2hlLCBuYW1lLCB2YWx1ZSwgbGlzdCwga2V5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGlkO1xufVxuLyoqXG4gKiBSZWdpc3RlciBhbGwgc3R5bGVzLCBidXQgY29sbGVjdCBmb3Igc2VsZWN0b3IgaW50ZXJwb2xhdGlvbiB1c2luZyB0aGUgaGFzaC5cbiAqL1xuZnVuY3Rpb24gY29tcG9zZVN0eWxlcyhjb250YWluZXIsIHNlbGVjdG9yLCBzdHlsZXMsIGlzU3R5bGUsIGRpc3BsYXlOYW1lKSB7XG4gICAgdmFyIGNhY2hlID0gbmV3IENhY2hlKGNvbnRhaW5lci5oYXNoKTtcbiAgICB2YXIgbGlzdCA9IFtdO1xuICAgIHZhciBwaWQgPSBzdHlsaXplKGNhY2hlLCBzZWxlY3Rvciwgc3R5bGVzLCBsaXN0KTtcbiAgICB2YXIgaGFzaCA9IFwiZlwiICsgY2FjaGUuaGFzaChwaWQpO1xuICAgIHZhciBpZCA9IGRpc3BsYXlOYW1lID8gZGlzcGxheU5hbWUgKyBcIl9cIiArIGhhc2ggOiBoYXNoO1xuICAgIGZvciAodmFyIF9pID0gMCwgbGlzdF8xID0gbGlzdDsgX2kgPCBsaXN0XzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYSA9IGxpc3RfMVtfaV0sIHNlbGVjdG9yXzEgPSBfYVswXSwgc3R5bGUgPSBfYVsxXTtcbiAgICAgICAgdmFyIGtleSA9IGlzU3R5bGUgPyBpbnRlcnBvbGF0ZShzZWxlY3Rvcl8xLCBcIi5cIiArIGV4cG9ydHMuZXNjYXBlKGlkKSkgOiBzZWxlY3Rvcl8xO1xuICAgICAgICBzdHlsZS5hZGQobmV3IFNlbGVjdG9yKGtleSwgc3R5bGUuaGFzaCwgdW5kZWZpbmVkLCBwaWQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgY2FjaGU6IGNhY2hlLCBwaWQ6IHBpZCwgaWQ6IGlkIH07XG59XG4vKipcbiAqIENhY2hlIHRvIGxpc3QgdG8gc3R5bGVzLlxuICovXG5mdW5jdGlvbiBqb2luKGFycikge1xuICAgIHZhciByZXMgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKylcbiAgICAgICAgcmVzICs9IGFycltpXTtcbiAgICByZXR1cm4gcmVzO1xufVxuLyoqXG4gKiBOb29wIGNoYW5nZXMuXG4gKi9cbnZhciBub29wQ2hhbmdlcyA9IHtcbiAgICBhZGQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSxcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxufTtcbi8qKlxuICogSW1wbGVtZW50IGEgY2FjaGUvZXZlbnQgZW1pdHRlci5cbiAqL1xudmFyIENhY2hlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhY2hlKGhhc2gsIGNoYW5nZXMpIHtcbiAgICAgICAgaWYgKGhhc2ggPT09IHZvaWQgMCkgeyBoYXNoID0gc3RyaW5nSGFzaDsgfVxuICAgICAgICBpZiAoY2hhbmdlcyA9PT0gdm9pZCAwKSB7IGNoYW5nZXMgPSBub29wQ2hhbmdlczsgfVxuICAgICAgICB0aGlzLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aGlzLmNoYW5nZXMgPSBjaGFuZ2VzO1xuICAgICAgICB0aGlzLnNoZWV0ID0gW107XG4gICAgICAgIHRoaXMuY2hhbmdlSWQgPSAwO1xuICAgICAgICB0aGlzLl9rZXlzID0gW107XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fY291bnRlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIH1cbiAgICBDYWNoZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICAgIHZhciBjb3VudCA9IHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXSB8fCAwO1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2NoaWxkcmVuW3N0eWxlLmlkXSB8fCBzdHlsZS5jbG9uZSgpO1xuICAgICAgICB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF0gPSBjb3VudCArIDE7XG4gICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5baXRlbS5pZF0gPSBpdGVtO1xuICAgICAgICAgICAgdGhpcy5fa2V5cy5wdXNoKGl0ZW0uaWQpO1xuICAgICAgICAgICAgdGhpcy5zaGVldC5wdXNoKGl0ZW0uZ2V0U3R5bGVzKCkpO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VJZCsrO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VzLmFkZChpdGVtLCB0aGlzLl9rZXlzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgY29udGVudHMgYXJlIGRpZmZlcmVudC5cbiAgICAgICAgICAgIGlmIChpdGVtLmdldElkZW50aWZpZXIoKSAhPT0gc3R5bGUuZ2V0SWRlbnRpZmllcigpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkhhc2ggY29sbGlzaW9uOiBcIiArIHN0eWxlLmdldFN0eWxlcygpICsgXCIgPT09IFwiICsgaXRlbS5nZXRTdHlsZXMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgb2xkSW5kZXggPSB0aGlzLl9rZXlzLmluZGV4T2Yoc3R5bGUuaWQpO1xuICAgICAgICAgICAgdmFyIG5ld0luZGV4ID0gdGhpcy5fa2V5cy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgdmFyIHByZXZDaGFuZ2VJZCA9IHRoaXMuY2hhbmdlSWQ7XG4gICAgICAgICAgICBpZiAob2xkSW5kZXggIT09IG5ld0luZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2tleXMucHVzaChzdHlsZS5pZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VJZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBDYWNoZSAmJiBzdHlsZSBpbnN0YW5jZW9mIENhY2hlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZDaGFuZ2VJZF8xID0gaXRlbS5jaGFuZ2VJZDtcbiAgICAgICAgICAgICAgICBpdGVtLm1lcmdlKHN0eWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jaGFuZ2VJZCAhPT0gcHJldkNoYW5nZUlkXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VJZCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmNoYW5nZUlkICE9PSBwcmV2Q2hhbmdlSWQpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkSW5kZXggPT09IG5ld0luZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlZXQuc3BsaWNlKG9sZEluZGV4LCAxLCBpdGVtLmdldFN0eWxlcygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlZXQuc3BsaWNlKG9sZEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2UobmV3SW5kZXgsIDAsIGl0ZW0uZ2V0U3R5bGVzKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZXMuY2hhbmdlKGl0ZW0sIG9sZEluZGV4LCBuZXdJbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfTtcbiAgICBDYWNoZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICAgIHZhciBjb3VudCA9IHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXTtcbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdID0gY291bnQgLSAxO1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9jaGlsZHJlbltzdHlsZS5pZF07XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9rZXlzLmluZGV4T2YoaXRlbS5pZCk7XG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9jaGlsZHJlbltzdHlsZS5pZF07XG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hlZXQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUlkKys7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VzLnJlbW92ZShpdGVtLCBpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgQ2FjaGUgJiYgc3R5bGUgaW5zdGFuY2VvZiBDYWNoZSkge1xuICAgICAgICAgICAgICAgIHZhciBwcmV2Q2hhbmdlSWQgPSBpdGVtLmNoYW5nZUlkO1xuICAgICAgICAgICAgICAgIGl0ZW0udW5tZXJnZShzdHlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uY2hhbmdlSWQgIT09IHByZXZDaGFuZ2VJZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShpbmRleCwgMSwgaXRlbS5nZXRTdHlsZXMoKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlSWQrKztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VzLmNoYW5nZShpdGVtLCBpbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgQ2FjaGUucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24gKGNhY2hlKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBjYWNoZS5fa2V5czsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBpZCA9IF9hW19pXTtcbiAgICAgICAgICAgIHRoaXMuYWRkKGNhY2hlLl9jaGlsZHJlbltpZF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgQ2FjaGUucHJvdG90eXBlLnVubWVyZ2UgPSBmdW5jdGlvbiAoY2FjaGUpIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IGNhY2hlLl9rZXlzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGlkID0gX2FbX2ldO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoY2FjaGUuX2NoaWxkcmVuW2lkXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBDYWNoZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FjaGUodGhpcy5oYXNoKS5tZXJnZSh0aGlzKTtcbiAgICB9O1xuICAgIHJldHVybiBDYWNoZTtcbn0oKSk7XG5leHBvcnRzLkNhY2hlID0gQ2FjaGU7XG4vKipcbiAqIFNlbGVjdG9yIGlzIGEgZHVtYiBjbGFzcyBtYWRlIHRvIHJlcHJlc2VudCBuZXN0ZWQgQ1NTIHNlbGVjdG9ycy5cbiAqL1xudmFyIFNlbGVjdG9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNlbGVjdG9yKHNlbGVjdG9yLCBoYXNoLCBpZCwgcGlkKSB7XG4gICAgICAgIGlmIChpZCA9PT0gdm9pZCAwKSB7IGlkID0gXCJzXCIgKyBoYXNoKHNlbGVjdG9yKTsgfVxuICAgICAgICBpZiAocGlkID09PSB2b2lkIDApIHsgcGlkID0gJyc7IH1cbiAgICAgICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICB0aGlzLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMucGlkID0gcGlkO1xuICAgIH1cbiAgICBTZWxlY3Rvci5wcm90b3R5cGUuZ2V0U3R5bGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RvcjtcbiAgICB9O1xuICAgIFNlbGVjdG9yLnByb3RvdHlwZS5nZXRJZGVudGlmaWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5waWQgKyBcIi5cIiArIHRoaXMuc2VsZWN0b3I7XG4gICAgfTtcbiAgICBTZWxlY3Rvci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2VsZWN0b3IodGhpcy5zZWxlY3RvciwgdGhpcy5oYXNoLCB0aGlzLmlkLCB0aGlzLnBpZCk7XG4gICAgfTtcbiAgICByZXR1cm4gU2VsZWN0b3I7XG59KCkpO1xuZXhwb3J0cy5TZWxlY3RvciA9IFNlbGVjdG9yO1xuLyoqXG4gKiBUaGUgc3R5bGUgY29udGFpbmVyIHJlZ2lzdGVycyBhIHN0eWxlIHN0cmluZyB3aXRoIHNlbGVjdG9ycy5cbiAqL1xudmFyIFN0eWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTdHlsZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTdHlsZShzdHlsZSwgaGFzaCwgaWQpIHtcbiAgICAgICAgaWYgKGlkID09PSB2b2lkIDApIHsgaWQgPSBcImNcIiArIGhhc2goc3R5bGUpOyB9XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGhhc2gpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnN0eWxlID0gc3R5bGU7XG4gICAgICAgIF90aGlzLmhhc2ggPSBoYXNoO1xuICAgICAgICBfdGhpcy5pZCA9IGlkO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFN0eWxlLnByb3RvdHlwZS5nZXRTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWV0LmpvaW4oJywnKSArIFwie1wiICsgdGhpcy5zdHlsZSArIFwifVwiO1xuICAgIH07XG4gICAgU3R5bGUucHJvdG90eXBlLmdldElkZW50aWZpZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0eWxlO1xuICAgIH07XG4gICAgU3R5bGUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFN0eWxlKHRoaXMuc3R5bGUsIHRoaXMuaGFzaCwgdGhpcy5pZCkubWVyZ2UodGhpcyk7XG4gICAgfTtcbiAgICByZXR1cm4gU3R5bGU7XG59KENhY2hlKSk7XG5leHBvcnRzLlN0eWxlID0gU3R5bGU7XG4vKipcbiAqIEltcGxlbWVudCBydWxlIGxvZ2ljIGZvciBzdHlsZSBvdXRwdXQuXG4gKi9cbnZhciBSdWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhSdWxlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFJ1bGUocnVsZSwgc3R5bGUsIGhhc2gsIGlkLCBwaWQpIHtcbiAgICAgICAgaWYgKHN0eWxlID09PSB2b2lkIDApIHsgc3R5bGUgPSAnJzsgfVxuICAgICAgICBpZiAoaWQgPT09IHZvaWQgMCkgeyBpZCA9IFwiYVwiICsgaGFzaChydWxlICsgXCIuXCIgKyBzdHlsZSk7IH1cbiAgICAgICAgaWYgKHBpZCA9PT0gdm9pZCAwKSB7IHBpZCA9ICcnOyB9XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGhhc2gpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnJ1bGUgPSBydWxlO1xuICAgICAgICBfdGhpcy5zdHlsZSA9IHN0eWxlO1xuICAgICAgICBfdGhpcy5oYXNoID0gaGFzaDtcbiAgICAgICAgX3RoaXMuaWQgPSBpZDtcbiAgICAgICAgX3RoaXMucGlkID0gcGlkO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFJ1bGUucHJvdG90eXBlLmdldFN0eWxlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVsZSArIFwie1wiICsgdGhpcy5zdHlsZSArIGpvaW4odGhpcy5zaGVldCkgKyBcIn1cIjtcbiAgICB9O1xuICAgIFJ1bGUucHJvdG90eXBlLmdldElkZW50aWZpZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpZCArIFwiLlwiICsgdGhpcy5ydWxlICsgXCIuXCIgKyB0aGlzLnN0eWxlO1xuICAgIH07XG4gICAgUnVsZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUnVsZSh0aGlzLnJ1bGUsIHRoaXMuc3R5bGUsIHRoaXMuaGFzaCwgdGhpcy5pZCwgdGhpcy5waWQpLm1lcmdlKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIFJ1bGU7XG59KENhY2hlKSk7XG5leHBvcnRzLlJ1bGUgPSBSdWxlO1xuLyoqXG4gKiBUaGUgRnJlZVN0eWxlIGNsYXNzIGltcGxlbWVudHMgdGhlIEFQSSBmb3IgZXZlcnl0aGluZyBlbHNlLlxuICovXG52YXIgRnJlZVN0eWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhGcmVlU3R5bGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gRnJlZVN0eWxlKGhhc2gsIGRlYnVnLCBpZCwgY2hhbmdlcykge1xuICAgICAgICBpZiAoaGFzaCA9PT0gdm9pZCAwKSB7IGhhc2ggPSBzdHJpbmdIYXNoOyB9XG4gICAgICAgIGlmIChkZWJ1ZyA9PT0gdm9pZCAwKSB7IGRlYnVnID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52WydOT0RFX0VOViddICE9PSAncHJvZHVjdGlvbic7IH1cbiAgICAgICAgaWYgKGlkID09PSB2b2lkIDApIHsgaWQgPSBcImZcIiArICgrK3VuaXF1ZUlkKS50b1N0cmluZygzNik7IH1cbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgaGFzaCwgY2hhbmdlcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuaGFzaCA9IGhhc2g7XG4gICAgICAgIF90aGlzLmRlYnVnID0gZGVidWc7XG4gICAgICAgIF90aGlzLmlkID0gaWQ7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgRnJlZVN0eWxlLnByb3RvdHlwZS5yZWdpc3RlclN0eWxlID0gZnVuY3Rpb24gKHN0eWxlcywgZGlzcGxheU5hbWUpIHtcbiAgICAgICAgdmFyIGRlYnVnTmFtZSA9IHRoaXMuZGVidWcgPyBkaXNwbGF5TmFtZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIF9hID0gY29tcG9zZVN0eWxlcyh0aGlzLCAnJicsIHN0eWxlcywgdHJ1ZSwgZGVidWdOYW1lKSwgY2FjaGUgPSBfYS5jYWNoZSwgaWQgPSBfYS5pZDtcbiAgICAgICAgdGhpcy5tZXJnZShjYWNoZSk7XG4gICAgICAgIHJldHVybiBpZDtcbiAgICB9O1xuICAgIEZyZWVTdHlsZS5wcm90b3R5cGUucmVnaXN0ZXJLZXlmcmFtZXMgPSBmdW5jdGlvbiAoa2V5ZnJhbWVzLCBkaXNwbGF5TmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWdpc3Rlckhhc2hSdWxlKCdAa2V5ZnJhbWVzJywga2V5ZnJhbWVzLCBkaXNwbGF5TmFtZSk7XG4gICAgfTtcbiAgICBGcmVlU3R5bGUucHJvdG90eXBlLnJlZ2lzdGVySGFzaFJ1bGUgPSBmdW5jdGlvbiAocHJlZml4LCBzdHlsZXMsIGRpc3BsYXlOYW1lKSB7XG4gICAgICAgIHZhciBkZWJ1Z05hbWUgPSB0aGlzLmRlYnVnID8gZGlzcGxheU5hbWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBfYSA9IGNvbXBvc2VTdHlsZXModGhpcywgJycsIHN0eWxlcywgZmFsc2UsIGRlYnVnTmFtZSksIGNhY2hlID0gX2EuY2FjaGUsIHBpZCA9IF9hLnBpZCwgaWQgPSBfYS5pZDtcbiAgICAgICAgdmFyIHJ1bGUgPSBuZXcgUnVsZShwcmVmaXggKyBcIiBcIiArIGV4cG9ydHMuZXNjYXBlKGlkKSwgdW5kZWZpbmVkLCB0aGlzLmhhc2gsIHVuZGVmaW5lZCwgcGlkKTtcbiAgICAgICAgdGhpcy5hZGQocnVsZS5tZXJnZShjYWNoZSkpO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfTtcbiAgICBGcmVlU3R5bGUucHJvdG90eXBlLnJlZ2lzdGVyUnVsZSA9IGZ1bmN0aW9uIChydWxlLCBzdHlsZXMpIHtcbiAgICAgICAgdGhpcy5tZXJnZShjb21wb3NlU3R5bGVzKHRoaXMsIHJ1bGUsIHN0eWxlcywgZmFsc2UpLmNhY2hlKTtcbiAgICB9O1xuICAgIEZyZWVTdHlsZS5wcm90b3R5cGUucmVnaXN0ZXJDc3MgPSBmdW5jdGlvbiAoc3R5bGVzKSB7XG4gICAgICAgIHRoaXMubWVyZ2UoY29tcG9zZVN0eWxlcyh0aGlzLCAnJywgc3R5bGVzLCBmYWxzZSkuY2FjaGUpO1xuICAgIH07XG4gICAgRnJlZVN0eWxlLnByb3RvdHlwZS5nZXRTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBqb2luKHRoaXMuc2hlZXQpO1xuICAgIH07XG4gICAgRnJlZVN0eWxlLnByb3RvdHlwZS5nZXRJZGVudGlmaWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICB9O1xuICAgIEZyZWVTdHlsZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRnJlZVN0eWxlKHRoaXMuaGFzaCwgdGhpcy5kZWJ1ZywgdGhpcy5pZCwgdGhpcy5jaGFuZ2VzKS5tZXJnZSh0aGlzKTtcbiAgICB9O1xuICAgIHJldHVybiBGcmVlU3R5bGU7XG59KENhY2hlKSk7XG5leHBvcnRzLkZyZWVTdHlsZSA9IEZyZWVTdHlsZTtcbi8qKlxuICogRXhwb3J0cyBhIHNpbXBsZSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZShoYXNoLCBkZWJ1ZywgY2hhbmdlcykge1xuICAgIHJldHVybiBuZXcgRnJlZVN0eWxlKGhhc2gsIGRlYnVnLCB1bmRlZmluZWQsIGNoYW5nZXMpO1xufVxuZXhwb3J0cy5jcmVhdGUgPSBjcmVhdGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1mcmVlLXN0eWxlLmpzLm1hcCIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyAgQ29tbW9uLnRzeCAtIEdidGNcclxuLy9cclxuLy8gIENvcHlyaWdodCDCqSAyMDE4LCBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UuICBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4vL1xyXG4vLyAgTGljZW5zZWQgdG8gdGhlIEdyaWQgUHJvdGVjdGlvbiBBbGxpYW5jZSAoR1BBKSB1bmRlciBvbmUgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuIFNlZVxyXG4vLyAgdGhlIE5PVElDRSBmaWxlIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLlxyXG4vLyAgVGhlIEdQQSBsaWNlbnNlcyB0aGlzIGZpbGUgdG8geW91IHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgdGhlIFwiTGljZW5zZVwiOyB5b3UgbWF5IG5vdCB1c2UgdGhpc1xyXG4vLyAgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXQ6XHJcbi8vXHJcbi8vICAgICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4vL1xyXG4vLyAgVW5sZXNzIGFncmVlZCB0byBpbiB3cml0aW5nLCB0aGUgc3ViamVjdCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhblxyXG4vLyAgXCJBUy1JU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gUmVmZXIgdG8gdGhlXHJcbi8vICBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucy5cclxuLy9cclxuLy8gIENvZGUgTW9kaWZpY2F0aW9uIEhpc3Rvcnk6XHJcbi8vICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICAxMC8xMy8yMDIwIC0gQy4gTGFja25lclxyXG4vLyAgICAgICBHZW5lcmF0ZWQgb3JpZ2luYWwgdmVyc2lvbiBvZiBzb3VyY2UgY29kZS5cclxuLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgc3R5bGUgfSBmcm9tIFwidHlwZXN0eWxlXCJcclxuXHJcbi8vIHN0eWxlc1xyXG5leHBvcnQgY29uc3Qgb3V0ZXJEaXY6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgbWFyZ2luTGVmdDogJ2F1dG8nLFxyXG4gICAgbWFyZ2luUmlnaHQ6ICdhdXRvJyxcclxuICAgIG92ZXJmbG93WTogJ2hpZGRlbicsXHJcbiAgICBvdmVyZmxvd1g6ICdoaWRkZW4nLFxyXG4gICAgcGFkZGluZzogJzBlbScsXHJcbiAgICB6SW5kZXg6IDEwMDAsXHJcbiAgICBib3hTaGFkb3c6ICc0cHggNHB4IDJweCAjODg4ODg4JyxcclxuICAgIGJvcmRlcjogJzJweCBzb2xpZCBibGFjaycsXHJcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgIHRvcDogJzAnLFxyXG4gICAgbGVmdDogMCxcclxuICAgIGRpc3BsYXk6ICdub25lJyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGUgPSBzdHlsZSh7XHJcbiAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgaGVpZ2h0OiAnMjBweCcsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjODA4MDgwJyxcclxuICAgIGN1cnNvcjogJ21vdmUnLFxyXG4gICAgcGFkZGluZzogJzBlbSdcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgY2xvc2VCdXR0b24gPSBzdHlsZSh7XHJcbiAgICBiYWNrZ3JvdW5kOiAnZmlyZWJyaWNrJyxcclxuICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICB0b3A6IDAsXHJcbiAgICByaWdodDogMCxcclxuICAgIHdpZHRoOiAnMjBweCcsXHJcbiAgICBoZWlnaHQ6ICcyMHB4JyxcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICB2ZXJ0aWNhbEFsaWduOiAnbWlkZGxlJyxcclxuICAgIHBhZGRpbmc6IDAsXHJcbiAgICBib3JkZXI6IDAsXHJcbiAgICAkbmVzdDoge1xyXG4gICAgICAgIFwiJjpob3ZlclwiOiB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICdvcmFuZ2VyZWQnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbmludGVyZmFjZSBJd2luZG93UHJvcHMge1xyXG4gICAgc2hvdzogYm9vbGVhbixcclxuICAgIGNsb3NlOiAoKSA9PiB2b2lkLFxyXG4gICAgd2lkdGg6IG51bWJlcixcclxuICAgIG1heEhlaWdodDogbnVtYmVyLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgV2lkZ2V0V2luZG93OiBSZWFjdC5GdW5jdGlvbkNvbXBvbmVudDxJd2luZG93UHJvcHM+ID0gKHByb3BzKSA9PiB7XHJcbiAgICBjb25zdCByZWZXaW5kb3cgPSBSZWFjdC51c2VSZWYobnVsbCk7XHJcbiAgICBjb25zdCByZWZIYW5kbGUgPSBSZWFjdC51c2VSZWYobnVsbCk7XHJcblxyXG4gICAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcclxuICAgICAgICBpZiAocHJvcHMuc2hvdylcclxuICAgICAgICAgICAgKCQocmVmV2luZG93LmN1cnJlbnQpIGFzIGFueSkuZHJhZ2dhYmxlKHsgc2Nyb2xsOiBmYWxzZSwgaGFuZGxlOiByZWZIYW5kbGUuY3VycmVudCwgY29udGFpbm1lbnQ6ICcjY2hhcnRwYW5lbCcgfSk7XHJcbiAgICB9KVxyXG5cclxuICAgIGlmICghcHJvcHMuc2hvdylcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDwgZGl2IHJlZj17cmVmV2luZG93fSBjbGFzc05hbWU9XCJ1aS13aWRnZXQtY29udGVudFwiIHN0eWxlPXt7IC4uLm91dGVyRGl2LCB3aWR0aDogcHJvcHMud2lkdGgsIG1heEhlaWdodDogcHJvcHMubWF4SGVpZ2h0LCBkaXNwbGF5OiB1bmRlZmluZWQgfX0gPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlcjogJ2JsYWNrIHNvbGlkIDJweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHJlZj17cmVmSGFuZGxlfSBjbGFzc05hbWU9e2hhbmRsZX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiBwcm9wcy53aWR0aCAtIDYsIG1heEhlaWdodDogcHJvcHMubWF4SGVpZ2h0IC0gMjQgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAge3Byb3BzLmNoaWxkcmVufVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17Y2xvc2VCdXR0b259IG9uQ2xpY2s9eygpID0+IHByb3BzLmNsb3NlKCl9Plg8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG59IiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gIEhhcm1vbmljU3RhdHMudHN4IC0gR2J0Y1xyXG4vL1xyXG4vLyAgQ29weXJpZ2h0IMKpIDIwMTgsIEdyaWQgUHJvdGVjdGlvbiBBbGxpYW5jZS4gIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbi8vXHJcbi8vICBMaWNlbnNlZCB0byB0aGUgR3JpZCBQcm90ZWN0aW9uIEFsbGlhbmNlIChHUEEpIHVuZGVyIG9uZSBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gU2VlXHJcbi8vICB0aGUgTk9USUNFIGZpbGUgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuXHJcbi8vICBUaGUgR1BBIGxpY2Vuc2VzIHRoaXMgZmlsZSB0byB5b3UgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCB0aGUgXCJMaWNlbnNlXCI7IHlvdSBtYXkgbm90IHVzZSB0aGlzXHJcbi8vICBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdDpcclxuLy9cclxuLy8gICAgICBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbi8vXHJcbi8vICBVbmxlc3MgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHRoZSBzdWJqZWN0IHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuXHJcbi8vICBcIkFTLUlTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBSZWZlciB0byB0aGVcclxuLy8gIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zLlxyXG4vL1xyXG4vLyAgQ29kZSBNb2RpZmljYXRpb24gSGlzdG9yeTpcclxuLy8gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gIDA1LzE0LzIwMTggLSBCaWxseSBFcm5lc3RcclxuLy8gICAgICAgR2VuZXJhdGVkIG9yaWdpbmFsIHZlcnNpb24gb2Ygc291cmNlIGNvZGUuXHJcbi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IG91dGVyRGl2LCBoYW5kbGUsIGNsb3NlQnV0dG9uLCBXaWRnZXRXaW5kb3cgfSBmcm9tICcuL0NvbW1vbic7XHJcblxyXG5pbnRlcmZhY2UgSXByb3BzIHsgY2xvc2VDYWxsYmFjazogKCkgPT4gdm9pZCwgZXhwb3J0Q2FsbGJhY2s6ICgpID0+IHZvaWQsIGV2ZW50SWQ6IG51bWJlciwgaXNPcGVuOiBib29sZWFuIH1cclxuXHJcbmNvbnN0IEhhcm1vbmljU3RhdHNXaWRnZXQgPSAocHJvcHM6IElwcm9wcykgPT4ge1xyXG5cclxuICAgIGNvbnN0IFt0YmxEYXRhLCBzZXRUYmxEYXRhXSA9IFJlYWN0LnVzZVN0YXRlPEFycmF5PEpTWC5FbGVtZW50Pj4oW10pO1xyXG5cclxuICAgIFxyXG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcclxuICAgICAgICBsZXQgaGFuZGxlID0gZ2V0RGF0YSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gKCkgPT4geyBpZiAoaGFuZGxlICE9IHVuZGVmaW5lZCAmJiBoYW5kbGUuYWJvcnQgIT0gdW5kZWZpbmVkKSBoYW5kbGUuYWJvcnQoKTsgfVxyXG4gICAgfSwgW3Byb3BzLmV2ZW50SWRdKVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldERhdGEoKTogSlF1ZXJ5LmpxWEhSIHtcclxuICAgICAgICBsZXQgaGFuZGxlID0gJC5hamF4KHtcclxuICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgdXJsOiBgJHtob21lUGF0aH1hcGkvT3BlblNFRS9HZXRIYXJtb25pY3M/ZXZlbnRJZD0ke3Byb3BzLmV2ZW50SWR9YCxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZSxcclxuICAgICAgICAgICAgYXN5bmM6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaGFuZGxlLmRvbmUoKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgbGV0IHJvd3MgPSBbXTtcclxuICAgICAgICAgICAgcm93cy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aCBjb2xTcGFuPXsxfT48YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1wcmltYXJ5JyBzdHlsZT17eyB3aWR0aDogNzUgfX0gb25DbGljaz17KCkgPT4gcHJvcHMuZXhwb3J0Q2FsbGJhY2soKX0+RXhwb3J0PC9idXR0b24+PC90aD5cclxuICAgICAgICAgICAgICAgICAgICB7ZGF0YS5tYXAoKGtleSxpKSA9PiA8dGggY29sU3Bhbj17Mn0gc2NvcGU9J2NvbGdyb3VwJyBrZXk9e2l9PntrZXkuQ2hhbm5lbH08L3RoPil9XHJcbiAgICAgICAgICAgICAgICA8L3RyPilcclxuXHJcbiAgICAgICAgICAgIHJvd3MucHVzaChcclxuICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICA8dGg+SGFybW9uaWM8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIHtkYXRhLm1hcCgoaXRlbSwgaW5kZXgpID0+IDxSZWFjdC5GcmFnbWVudCBrZXk9e2luZGV4fT48dGg+TWFnPC90aD4gPHRoPkFuZzwvdGg+IDwvUmVhY3QuRnJhZ21lbnQ+KX1cclxuICAgICAgICAgICAgICAgIDwvdHI+KVxyXG5cclxuXHJcbiAgICAgICAgICAgIGxldCBudW1DaGFubmVscyA9IGRhdGEubGVuZ3RoO1xyXG4gICAgICAgICAgICBsZXQganNvbnMgPSBkYXRhLm1hcCh4ID0+IEpTT04ucGFyc2UoeC5TcGVjdHJhbERhdGEpKTtcclxuICAgICAgICAgICAgbGV0IG51bUhhcm1vbmljcyA9IE1hdGgubWF4KC4uLmpzb25zLm1hcCh4ID0+IE9iamVjdC5rZXlzKHgpLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8PSBudW1IYXJtb25pY3M7ICsraW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ZHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCBsYWJlbCA9ICdIJyArIGluZGV4XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUNoYW5uZWxzOyArK2opIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQga2V5ID0gZGF0YVtqXS5DaGFubmVsICsgbGFiZWxcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbnNbal1bbGFiZWxdICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZHMucHVzaCg8dGQga2V5PXtrZXkgKyAnTWFnJ30+e2pzb25zW2pdW2xhYmVsXS5NYWduaXR1ZGUudG9GaXhlZCgyKX08L3RkPik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRkcy5wdXNoKDx0ZCBrZXk9e2tleSArICdBbmcnfT57anNvbnNbal1bbGFiZWxdLkFuZ2xlLnRvRml4ZWQoMil9PC90ZD4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGRzLnB1c2goPHRkIGtleT17a2V5ICsgJ01hZyd9PjwvdGQ+KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGRzLnB1c2goPHRkIGtleT17a2V5ICsgJ0FuZyd9PjwvdGQ+KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgPHRyIHN0eWxlPXt7IGRpc3BsYXk6ICd0YWJsZScsIHRhYmxlTGF5b3V0OiAnZml4ZWQnLCB3aWR0aDogJzEwMCUnIH19IGtleT17bGFiZWx9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e2xhYmVsfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0ZHN9XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldFRibERhdGEocm93cyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBoYW5kbGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8V2lkZ2V0V2luZG93IHNob3c9e3Byb3BzLmlzT3Blbn0gY2xvc2U9e3Byb3BzLmNsb3NlQ2FsbGJhY2t9IG1heEhlaWdodD17NjAwfSB3aWR0aD17MTcwNn0+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWF4V2lkdGg6IDE3MDAgfX0+XHJcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidGFibGVcIiBzdHlsZT17eyBmb250U2l6ZTogJ2xhcmdlJywgbWFyZ2luQm90dG9tOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZCBzdHlsZT17eyBkaXNwbGF5OiAndGFibGUnLCB0YWJsZUxheW91dDogJ2ZpeGVkJywgd2lkdGg6ICdjYWxjKDEwMCUgLSAxZW0pJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3RibERhdGFbMF19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0YmxEYXRhWzFdfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5IHN0eWxlPXt7IGZvbnRTaXplOiAnbWVkaXVtJywgaGVpZ2h0OiA1MDAsIG1heEhlaWdodDogNTAwLCBvdmVyZmxvd1k6ICdhdXRvJywgZGlzcGxheTogJ2Jsb2NrJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3RibERhdGEuc2xpY2UoMil9XHJcbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvV2lkZ2V0V2luZG93PlxyXG4gICAgKTtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEhhcm1vbmljU3RhdHNXaWRnZXQ7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgVHlwZVN0eWxlIH0gZnJvbSAnLi9pbnRlcm5hbC90eXBlc3R5bGUnO1xyXG5leHBvcnQgeyBUeXBlU3R5bGUgfTtcclxuLyoqXHJcbiAqIEFsbCB0aGUgQ1NTIHR5cGVzIGluIHRoZSAndHlwZXMnIG5hbWVzcGFjZVxyXG4gKi9cclxuaW1wb3J0ICogYXMgdHlwZXMgZnJvbSAnLi90eXBlcyc7XHJcbmV4cG9ydCB7IHR5cGVzIH07XHJcbi8qKlxyXG4gKiBFeHBvcnQgY2VydGFpbiB1dGlsaXRpZXNcclxuICovXHJcbmV4cG9ydCB7IGV4dGVuZCwgY2xhc3NlcywgbWVkaWEgfSBmcm9tICcuL2ludGVybmFsL3V0aWxpdGllcyc7XHJcbi8qKiBaZXJvIGNvbmZpZ3VyYXRpb24sIGRlZmF1bHQgaW5zdGFuY2Ugb2YgVHlwZVN0eWxlICovXHJcbnZhciB0cyA9IG5ldyBUeXBlU3R5bGUoeyBhdXRvR2VuZXJhdGVUYWc6IHRydWUgfSk7XHJcbi8qKiBTZXRzIHRoZSB0YXJnZXQgdGFnIHdoZXJlIHdlIHdyaXRlIHRoZSBjc3Mgb24gc3R5bGUgdXBkYXRlcyAqL1xyXG5leHBvcnQgdmFyIHNldFN0eWxlc1RhcmdldCA9IHRzLnNldFN0eWxlc1RhcmdldDtcclxuLyoqXHJcbiAqIEluc2VydCBgcmF3YCBDU1MgYXMgYSBzdHJpbmcuIFRoaXMgaXMgdXNlZnVsIGZvciBlLmcuXHJcbiAqIC0gdGhpcmQgcGFydHkgQ1NTIHRoYXQgeW91IGFyZSBjdXN0b21pemluZyB3aXRoIHRlbXBsYXRlIHN0cmluZ3NcclxuICogLSBnZW5lcmF0aW5nIHJhdyBDU1MgaW4gSmF2YVNjcmlwdFxyXG4gKiAtIHJlc2V0IGxpYnJhcmllcyBsaWtlIG5vcm1hbGl6ZS5jc3MgdGhhdCB5b3UgY2FuIHVzZSB3aXRob3V0IGxvYWRlcnNcclxuICovXHJcbmV4cG9ydCB2YXIgY3NzUmF3ID0gdHMuY3NzUmF3O1xyXG4vKipcclxuICogVGFrZXMgQ1NTUHJvcGVydGllcyBhbmQgcmVnaXN0ZXJzIGl0IHRvIGEgZ2xvYmFsIHNlbGVjdG9yIChib2R5LCBodG1sLCBldGMuKVxyXG4gKi9cclxuZXhwb3J0IHZhciBjc3NSdWxlID0gdHMuY3NzUnVsZTtcclxuLyoqXHJcbiAqIFJlbmRlcnMgc3R5bGVzIHRvIHRoZSBzaW5nbGV0b24gdGFnIGltZWRpYXRlbHlcclxuICogTk9URTogWW91IHNob3VsZCBvbmx5IGNhbGwgaXQgb24gaW5pdGlhbCByZW5kZXIgdG8gcHJldmVudCBhbnkgbm9uIENTUyBmbGFzaC5cclxuICogQWZ0ZXIgdGhhdCBpdCBpcyBrZXB0IHN5bmMgdXNpbmcgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgYW5kIHdlIGhhdmVuJ3Qgbm90aWNlZCBhbnkgYmFkIGZsYXNoZXMuXHJcbiAqKi9cclxuZXhwb3J0IHZhciBmb3JjZVJlbmRlclN0eWxlcyA9IHRzLmZvcmNlUmVuZGVyU3R5bGVzO1xyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiB0byByZWdpc3RlciBhbiBAZm9udC1mYWNlXHJcbiAqL1xyXG5leHBvcnQgdmFyIGZvbnRGYWNlID0gdHMuZm9udEZhY2U7XHJcbi8qKlxyXG4gKiBBbGxvd3MgdXNlIHRvIHVzZSB0aGUgc3R5bGVzaGVldCBpbiBhIG5vZGUuanMgZW52aXJvbm1lbnRcclxuICovXHJcbmV4cG9ydCB2YXIgZ2V0U3R5bGVzID0gdHMuZ2V0U3R5bGVzO1xyXG4vKipcclxuICogVGFrZXMga2V5ZnJhbWVzIGFuZCByZXR1cm5zIGEgZ2VuZXJhdGVkIGFuaW1hdGlvbk5hbWVcclxuICovXHJcbmV4cG9ydCB2YXIga2V5ZnJhbWVzID0gdHMua2V5ZnJhbWVzO1xyXG4vKipcclxuICogSGVscHMgd2l0aCB0ZXN0aW5nLiBSZWluaXRpYWxpemVzIEZyZWVTdHlsZSArIHJhd1xyXG4gKi9cclxuZXhwb3J0IHZhciByZWluaXQgPSB0cy5yZWluaXQ7XHJcbi8qKlxyXG4gKiBUYWtlcyBDU1NQcm9wZXJ0aWVzIGFuZCByZXR1cm4gYSBnZW5lcmF0ZWQgY2xhc3NOYW1lIHlvdSBjYW4gdXNlIG9uIHlvdXIgY29tcG9uZW50XHJcbiAqL1xyXG5leHBvcnQgdmFyIHN0eWxlID0gdHMuc3R5bGU7XHJcbi8qKlxyXG4gKiBUYWtlcyBhbiBvYmplY3Qgd2hlcmUgcHJvcGVydHkgbmFtZXMgYXJlIGlkZWFsIGNsYXNzIG5hbWVzIGFuZCBwcm9wZXJ0eSB2YWx1ZXMgYXJlIENTU1Byb3BlcnRpZXMsIGFuZFxyXG4gKiByZXR1cm5zIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgdGhlIHNhbWUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHRoZSBwcm9wZXJ0eSB2YWx1ZXMgYXJlXHJcbiAqIHRoZSBhY3R1YWwgZ2VuZXJhdGVkIGNsYXNzIG5hbWVzIHVzaW5nIHRoZSBpZGVhbCBjbGFzcyBuYW1lIGFzIHRoZSAkZGVidWdOYW1lXHJcbiAqL1xyXG5leHBvcnQgdmFyIHN0eWxlc2hlZXQgPSB0cy5zdHlsZXNoZWV0O1xyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBUeXBlU3R5bGUgc2VwYXJhdGUgZnJvbSB0aGUgZGVmYXVsdCBpbnN0YW5jZS5cclxuICpcclxuICogLSBVc2UgdGhpcyBmb3IgY3JlYXRpbmcgYSBkaWZmZXJlbnQgdHlwZXN0eWxlIGluc3RhbmNlIGZvciBhIHNoYWRvdyBkb20gY29tcG9uZW50LlxyXG4gKiAtIFVzZSB0aGlzIGlmIHlvdSBkb24ndCB3YW50IGFuIGF1dG8gdGFnIGdlbmVyYXRlZCBhbmQgeW91IGp1c3Qgd2FudCB0byBjb2xsZWN0IHRoZSBDU1MuXHJcbiAqXHJcbiAqIE5PVEU6IHN0eWxlcyBhcmVuJ3Qgc2hhcmVkIGJldHdlZW4gZGlmZmVyZW50IGluc3RhbmNlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUeXBlU3R5bGUodGFyZ2V0KSB7XHJcbiAgICB2YXIgaW5zdGFuY2UgPSBuZXcgVHlwZVN0eWxlKHsgYXV0b0dlbmVyYXRlVGFnOiBmYWxzZSB9KTtcclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBpbnN0YW5jZS5zZXRTdHlsZXNUYXJnZXQodGFyZ2V0KTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBGcmVlU3R5bGUgZnJvbSAnZnJlZS1zdHlsZSc7XHJcbi8qKlxyXG4gKiBXZSBuZWVkIHRvIGRvIHRoZSBmb2xsb3dpbmcgdG8gKm91ciogb2JqZWN0cyBiZWZvcmUgcGFzc2luZyB0byBmcmVlc3R5bGU6XHJcbiAqIC0gRm9yIGFueSBgJG5lc3RgIGRpcmVjdGl2ZSBtb3ZlIHVwIHRvIEZyZWVTdHlsZSBzdHlsZSBuZXN0aW5nXHJcbiAqIC0gRm9yIGFueSBgJHVuaXF1ZWAgZGlyZWN0aXZlIG1hcCB0byBGcmVlU3R5bGUgVW5pcXVlXHJcbiAqIC0gRm9yIGFueSBgJGRlYnVnTmFtZWAgZGlyZWN0aXZlIHJldHVybiB0aGUgZGVidWcgbmFtZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVN0cmluZ09iaihvYmplY3QpIHtcclxuICAgIC8qKiBUaGUgZmluYWwgcmVzdWx0IHdlIHdpbGwgcmV0dXJuICovXHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICB2YXIgZGVidWdOYW1lID0gJyc7XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgLyoqIEdyYWIgdGhlIHZhbHVlIHVwZnJvbnQgKi9cclxuICAgICAgICB2YXIgdmFsID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgLyoqIFR5cGVTdHlsZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgKi9cclxuICAgICAgICBpZiAoa2V5ID09PSAnJHVuaXF1ZScpIHtcclxuICAgICAgICAgICAgcmVzdWx0W0ZyZWVTdHlsZS5JU19VTklRVUVdID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICckbmVzdCcpIHtcclxuICAgICAgICAgICAgdmFyIG5lc3RlZCA9IHZhbDtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0b3IgaW4gbmVzdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3VicHJvcGVydGllcyA9IG5lc3RlZFtzZWxlY3Rvcl07XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbc2VsZWN0b3JdID0gZW5zdXJlU3RyaW5nT2JqKHN1YnByb3BlcnRpZXMpLnJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICckZGVidWdOYW1lJykge1xyXG4gICAgICAgICAgICBkZWJ1Z05hbWUgPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHJlc3VsdCwgZGVidWdOYW1lOiBkZWJ1Z05hbWUgfTtcclxufVxyXG4vLyB0b2RvOiBiZXR0ZXIgbmFtZSBoZXJlXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBsb2RlS2V5ZnJhbWVzKGZyYW1lcykge1xyXG4gICAgdmFyIHJlc3VsdCA9IHsgJGRlYnVnTmFtZTogdW5kZWZpbmVkLCBrZXlmcmFtZXM6IHt9IH07XHJcbiAgICBmb3IgKHZhciBvZmZzZXQgaW4gZnJhbWVzKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IGZyYW1lc1tvZmZzZXRdO1xyXG4gICAgICAgIGlmIChvZmZzZXQgPT09ICckZGVidWdOYW1lJykge1xyXG4gICAgICAgICAgICByZXN1bHQuJGRlYnVnTmFtZSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5rZXlmcmFtZXNbb2Zmc2V0XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbiIsImltcG9ydCAqIGFzIEZyZWVTdHlsZSBmcm9tIFwiZnJlZS1zdHlsZVwiO1xyXG5pbXBvcnQgeyBlbnN1cmVTdHJpbmdPYmosIGV4cGxvZGVLZXlmcmFtZXMgfSBmcm9tICcuL2Zvcm1hdHRpbmcnO1xyXG5pbXBvcnQgeyBleHRlbmQsIHJhZiB9IGZyb20gJy4vdXRpbGl0aWVzJztcclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZnJlZSBzdHlsZSB3aXRoIG91ciBvcHRpb25zXHJcbiAqL1xyXG52YXIgY3JlYXRlRnJlZVN0eWxlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gRnJlZVN0eWxlLmNyZWF0ZShcclxuLyoqIFVzZSB0aGUgZGVmYXVsdCBoYXNoIGZ1bmN0aW9uICovXHJcbnVuZGVmaW5lZCwgXHJcbi8qKiBQcmVzZXJ2ZSAkZGVidWdOYW1lIHZhbHVlcyAqL1xyXG50cnVlKTsgfTtcclxuLyoqXHJcbiAqIE1haW50YWlucyBhIHNpbmdsZSBzdHlsZXNoZWV0IGFuZCBrZWVwcyBpdCBpbiBzeW5jIHdpdGggcmVxdWVzdGVkIHN0eWxlc1xyXG4gKi9cclxudmFyIFR5cGVTdHlsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFR5cGVTdHlsZShfYSkge1xyXG4gICAgICAgIHZhciBhdXRvR2VuZXJhdGVUYWcgPSBfYS5hdXRvR2VuZXJhdGVUYWc7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbnNlcnQgYHJhd2AgQ1NTIGFzIGEgc3RyaW5nLiBUaGlzIGlzIHVzZWZ1bCBmb3IgZS5nLlxyXG4gICAgICAgICAqIC0gdGhpcmQgcGFydHkgQ1NTIHRoYXQgeW91IGFyZSBjdXN0b21pemluZyB3aXRoIHRlbXBsYXRlIHN0cmluZ3NcclxuICAgICAgICAgKiAtIGdlbmVyYXRpbmcgcmF3IENTUyBpbiBKYXZhU2NyaXB0XHJcbiAgICAgICAgICogLSByZXNldCBsaWJyYXJpZXMgbGlrZSBub3JtYWxpemUuY3NzIHRoYXQgeW91IGNhbiB1c2Ugd2l0aG91dCBsb2FkZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jc3NSYXcgPSBmdW5jdGlvbiAobXVzdEJlVmFsaWRDU1MpIHtcclxuICAgICAgICAgICAgaWYgKCFtdXN0QmVWYWxpZENTUykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9yYXcgKz0gbXVzdEJlVmFsaWRDU1MgfHwgJyc7XHJcbiAgICAgICAgICAgIF90aGlzLl9wZW5kaW5nUmF3Q2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgX3RoaXMuX3N0eWxlVXBkYXRlZCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMgQ1NTUHJvcGVydGllcyBhbmQgcmVnaXN0ZXJzIGl0IHRvIGEgZ2xvYmFsIHNlbGVjdG9yIChib2R5LCBodG1sLCBldGMuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY3NzUnVsZSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgb2JqZWN0c1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0gZW5zdXJlU3RyaW5nT2JqKGV4dGVuZC5hcHBseSh2b2lkIDAsIG9iamVjdHMpKS5yZXN1bHQ7XHJcbiAgICAgICAgICAgIF90aGlzLl9mcmVlU3R5bGUucmVnaXN0ZXJSdWxlKHNlbGVjdG9yLCBvYmplY3QpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbmRlcnMgc3R5bGVzIHRvIHRoZSBzaW5nbGV0b24gdGFnIGltZWRpYXRlbHlcclxuICAgICAgICAgKiBOT1RFOiBZb3Ugc2hvdWxkIG9ubHkgY2FsbCBpdCBvbiBpbml0aWFsIHJlbmRlciB0byBwcmV2ZW50IGFueSBub24gQ1NTIGZsYXNoLlxyXG4gICAgICAgICAqIEFmdGVyIHRoYXQgaXQgaXMga2VwdCBzeW5jIHVzaW5nIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGFuZCB3ZSBoYXZlbid0IG5vdGljZWQgYW55IGJhZCBmbGFzaGVzLlxyXG4gICAgICAgICAqKi9cclxuICAgICAgICB0aGlzLmZvcmNlUmVuZGVyU3R5bGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gX3RoaXMuX2dldFRhZygpO1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRhcmdldC50ZXh0Q29udGVudCA9IF90aGlzLmdldFN0eWxlcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXRpbGl0eSBmdW5jdGlvbiB0byByZWdpc3RlciBhbiBAZm9udC1mYWNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5mb250RmFjZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGZvbnRGYWNlID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb250RmFjZVtfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBmcmVlU3R5bGUgPSBfdGhpcy5fZnJlZVN0eWxlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIF9iID0gZm9udEZhY2U7IF9hIDwgX2IubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmFjZSA9IF9iW19hXTtcclxuICAgICAgICAgICAgICAgIGZyZWVTdHlsZS5yZWdpc3RlclJ1bGUoJ0Bmb250LWZhY2UnLCBmYWNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsbG93cyB1c2UgdG8gdXNlIHRoZSBzdHlsZXNoZWV0IGluIGEgbm9kZS5qcyBlbnZpcm9ubWVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZ2V0U3R5bGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKF90aGlzLl9yYXcgfHwgJycpICsgX3RoaXMuX2ZyZWVTdHlsZS5nZXRTdHlsZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRha2VzIGtleWZyYW1lcyBhbmQgcmV0dXJucyBhIGdlbmVyYXRlZCBhbmltYXRpb25OYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5rZXlmcmFtZXMgPSBmdW5jdGlvbiAoZnJhbWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBfYSA9IGV4cGxvZGVLZXlmcmFtZXMoZnJhbWVzKSwga2V5ZnJhbWVzID0gX2Eua2V5ZnJhbWVzLCAkZGVidWdOYW1lID0gX2EuJGRlYnVnTmFtZTtcclxuICAgICAgICAgICAgLy8gVE9ETzogcmVwbGFjZSAkZGVidWdOYW1lIHdpdGggZGlzcGxheSBuYW1lXHJcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25OYW1lID0gX3RoaXMuX2ZyZWVTdHlsZS5yZWdpc3RlcktleWZyYW1lcyhrZXlmcmFtZXMsICRkZWJ1Z05hbWUpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25OYW1lO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGVscHMgd2l0aCB0ZXN0aW5nLiBSZWluaXRpYWxpemVzIEZyZWVTdHlsZSArIHJhd1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucmVpbml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvKiogcmVpbml0IGZyZWVzdHlsZSAqL1xyXG4gICAgICAgICAgICB2YXIgZnJlZVN0eWxlID0gY3JlYXRlRnJlZVN0eWxlKCk7XHJcbiAgICAgICAgICAgIF90aGlzLl9mcmVlU3R5bGUgPSBmcmVlU3R5bGU7XHJcbiAgICAgICAgICAgIF90aGlzLl9sYXN0RnJlZVN0eWxlQ2hhbmdlSWQgPSBmcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgICAgIC8qKiByZWluaXQgcmF3ICovXHJcbiAgICAgICAgICAgIF90aGlzLl9yYXcgPSAnJztcclxuICAgICAgICAgICAgX3RoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgLyoqIENsZWFyIGFueSBzdHlsZXMgdGhhdCB3ZXJlIGZsdXNoZWQgKi9cclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IF90aGlzLl9nZXRUYWcoKTtcclxuICAgICAgICAgICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKiBTZXRzIHRoZSB0YXJnZXQgdGFnIHdoZXJlIHdlIHdyaXRlIHRoZSBjc3Mgb24gc3R5bGUgdXBkYXRlcyAqL1xyXG4gICAgICAgIHRoaXMuc2V0U3R5bGVzVGFyZ2V0ID0gZnVuY3Rpb24gKHRhZykge1xyXG4gICAgICAgICAgICAvKiogQ2xlYXIgYW55IGRhdGEgaW4gYW55IHByZXZpb3VzIHRhZyAqL1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMuX3RhZykge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX3RhZy50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl90YWcgPSB0YWc7XHJcbiAgICAgICAgICAgIC8qKiBUaGlzIHNwZWNpYWwgdGltZSBidWZmZXIgaW1tZWRpYXRlbHkgKi9cclxuICAgICAgICAgICAgX3RoaXMuZm9yY2VSZW5kZXJTdHlsZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRha2VzIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHByb3BlcnR5IHZhbHVlcyBhcmUgQ1NTUHJvcGVydGllcywgYW5kXHJcbiAgICAgICAgICogcmV0dXJucyBhbiBvYmplY3Qgd2hlcmUgcHJvcGVydHkgbmFtZXMgYXJlIHRoZSBzYW1lIGlkZWFsIGNsYXNzIG5hbWVzIGFuZCB0aGUgcHJvcGVydHkgdmFsdWVzIGFyZVxyXG4gICAgICAgICAqIHRoZSBhY3R1YWwgZ2VuZXJhdGVkIGNsYXNzIG5hbWVzIHVzaW5nIHRoZSBpZGVhbCBjbGFzcyBuYW1lIGFzIHRoZSAkZGVidWdOYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0ID0gZnVuY3Rpb24gKGNsYXNzZXMpIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjbGFzc2VzKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGNsYXNzTmFtZXNfMSA9IGNsYXNzTmFtZXM7IF9pIDwgY2xhc3NOYW1lc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzTmFtZXNfMVtfaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NEZWYgPSBjbGFzc2VzW2NsYXNzTmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xhc3NEZWYpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc0RlZi4kZGVidWdOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjbGFzc05hbWVdID0gX3RoaXMuc3R5bGUoY2xhc3NEZWYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZnJlZVN0eWxlID0gY3JlYXRlRnJlZVN0eWxlKCk7XHJcbiAgICAgICAgdGhpcy5fYXV0b0dlbmVyYXRlVGFnID0gYXV0b0dlbmVyYXRlVGFnO1xyXG4gICAgICAgIHRoaXMuX2ZyZWVTdHlsZSA9IGZyZWVTdHlsZTtcclxuICAgICAgICB0aGlzLl9sYXN0RnJlZVN0eWxlQ2hhbmdlSWQgPSBmcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZyA9IDA7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3JhdyA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3RhZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAvLyByZWJpbmQgcHJvdG90eXBlIHRvIFR5cGVTdHlsZS4gIEl0IG1pZ2h0IGJlIGJldHRlciB0byBkbyBhIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5zdHlsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpfVxyXG4gICAgICAgIHRoaXMuc3R5bGUgPSB0aGlzLnN0eWxlLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE9ubHkgY2FsbHMgY2IgYWxsIHN5bmMgb3BlcmF0aW9ucyBzZXR0bGVcclxuICAgICAqL1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5fYWZ0ZXJBbGxTeW5jID0gZnVuY3Rpb24gKGNiKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLl9wZW5kaW5nKys7XHJcbiAgICAgICAgdmFyIHBlbmRpbmcgPSB0aGlzLl9wZW5kaW5nO1xyXG4gICAgICAgIHJhZihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwZW5kaW5nICE9PSBfdGhpcy5fcGVuZGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5fZ2V0VGFnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl90YWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9HZW5lcmF0ZVRhZykge1xyXG4gICAgICAgICAgICB2YXIgdGFnID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCdcclxuICAgICAgICAgICAgICAgID8geyB0ZXh0Q29udGVudDogJycgfVxyXG4gICAgICAgICAgICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RhZyA9IHRhZztcclxuICAgICAgICAgICAgcmV0dXJuIHRhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICAvKiogQ2hlY2tzIGlmIHRoZSBzdHlsZSB0YWcgbmVlZHMgdXBkYXRpbmcgYW5kIGlmIHNvIHF1ZXVlcyB1cCB0aGUgY2hhbmdlICovXHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLl9zdHlsZVVwZGF0ZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgY2hhbmdlSWQgPSB0aGlzLl9mcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgdmFyIGxhc3RDaGFuZ2VJZCA9IHRoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZDtcclxuICAgICAgICBpZiAoIXRoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgJiYgY2hhbmdlSWQgPT09IGxhc3RDaGFuZ2VJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZCA9IGNoYW5nZUlkO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9hZnRlckFsbFN5bmMoZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMuZm9yY2VSZW5kZXJTdHlsZXMoKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5zdHlsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZnJlZVN0eWxlID0gdGhpcy5fZnJlZVN0eWxlO1xyXG4gICAgICAgIHZhciBfYSA9IGVuc3VyZVN0cmluZ09iaihleHRlbmQuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKSwgcmVzdWx0ID0gX2EucmVzdWx0LCBkZWJ1Z05hbWUgPSBfYS5kZWJ1Z05hbWU7XHJcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGRlYnVnTmFtZSA/IGZyZWVTdHlsZS5yZWdpc3RlclN0eWxlKHJlc3VsdCwgZGVidWdOYW1lKSA6IGZyZWVTdHlsZS5yZWdpc3RlclN0eWxlKHJlc3VsdCk7XHJcbiAgICAgICAgdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVHlwZVN0eWxlO1xyXG59KCkpO1xyXG5leHBvcnQgeyBUeXBlU3R5bGUgfTtcclxuIiwiLyoqIFJhZiBmb3Igbm9kZSArIGJyb3dzZXIgKi9cclxuZXhwb3J0IHZhciByYWYgPSB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSAndW5kZWZpbmVkJ1xyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHN1cmUgc2V0VGltZW91dCBpcyBhbHdheXMgaW52b2tlZCB3aXRoXHJcbiAgICAgKiBgdGhpc2Agc2V0IHRvIGB3aW5kb3dgIG9yIGBnbG9iYWxgIGF1dG9tYXRpY2FsbHlcclxuICAgICAqKi9cclxuICAgID8gZnVuY3Rpb24gKGNiKSB7IHJldHVybiBzZXRUaW1lb3V0KGNiKTsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHN1cmUgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSBpcyBhbHdheXMgaW52b2tlZCB3aXRoIGB0aGlzYCB3aW5kb3dcclxuICAgICAqIFdlIG1pZ2h0IGhhdmUgcmFmIHdpdGhvdXQgd2luZG93IGluIGNhc2Ugb2YgYHJhZi9wb2x5ZmlsbGAgKHJlY29tbWVuZGVkIGJ5IFJlYWN0KVxyXG4gICAgICoqL1xyXG4gICAgOiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xyXG4gICAgICAgID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbiAgICAgICAgOiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpO1xyXG4vKipcclxuICogVXRpbGl0eSB0byBqb2luIGNsYXNzZXMgY29uZGl0aW9uYWxseVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzZXMoKSB7XHJcbiAgICB2YXIgY2xhc3NlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBjbGFzc2VzW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2xhc3Nlcy5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuICEhYzsgfSkuam9pbignICcpO1xyXG59XHJcbi8qKlxyXG4gKiBNZXJnZXMgdmFyaW91cyBzdHlsZXMgaW50byBhIHNpbmdsZSBzdHlsZSBvYmplY3QuXHJcbiAqIE5vdGU6IGlmIHR3byBvYmplY3RzIGhhdmUgdGhlIHNhbWUgcHJvcGVydHkgdGhlIGxhc3Qgb25lIHdpbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoKSB7XHJcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBvYmplY3RzW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICAvKiogVGhlIGZpbmFsIHJlc3VsdCB3ZSB3aWxsIHJldHVybiAqL1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgX2EgPSAwLCBvYmplY3RzXzEgPSBvYmplY3RzOyBfYSA8IG9iamVjdHNfMS5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICB2YXIgb2JqZWN0ID0gb2JqZWN0c18xW19hXTtcclxuICAgICAgICBpZiAob2JqZWN0ID09IG51bGwgfHwgb2JqZWN0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICAvKiogRmFsc3kgdmFsdWVzIGV4Y2VwdCBhIGV4cGxpY2l0IDAgaXMgaWdub3JlZCAqL1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgICAgIGlmICghdmFsICYmIHZhbCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyoqIGlmIG5lc3RlZCBtZWRpYSBvciBwc2V1ZG8gc2VsZWN0b3IgKi9cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJyRuZXN0JyAmJiB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gcmVzdWx0WyckbmVzdCddID8gZXh0ZW5kKHJlc3VsdFsnJG5lc3QnXSwgdmFsKSA6IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgoa2V5LmluZGV4T2YoJyYnKSAhPT0gLTEgfHwga2V5LmluZGV4T2YoJ0BtZWRpYScpID09PSAwKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSByZXN1bHRba2V5XSA/IGV4dGVuZChyZXN1bHRba2V5XSwgdmFsKSA6IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vKipcclxuICogVXRpbGl0eSB0byBoZWxwIGN1c3RvbWl6ZSBzdHlsZXMgd2l0aCBtZWRpYSBxdWVyaWVzLiBlLmcuXHJcbiAqIGBgYFxyXG4gKiBzdHlsZShcclxuICogIG1lZGlhKHttYXhXaWR0aDo1MDB9LCB7Y29sb3I6J3JlZCd9KVxyXG4gKiApXHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IHZhciBtZWRpYSA9IGZ1bmN0aW9uIChtZWRpYVF1ZXJ5KSB7XHJcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBvYmplY3RzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgdmFyIG1lZGlhUXVlcnlTZWN0aW9ucyA9IFtdO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkudHlwZSlcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChtZWRpYVF1ZXJ5LnR5cGUpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkub3JpZW50YXRpb24pXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIob3JpZW50YXRpb246IFwiICsgbWVkaWFRdWVyeS5vcmllbnRhdGlvbiArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1pbldpZHRoKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1pbi13aWR0aDogXCIgKyBtZWRpYUxlbmd0aChtZWRpYVF1ZXJ5Lm1pbldpZHRoKSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1heFdpZHRoKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1heC13aWR0aDogXCIgKyBtZWRpYUxlbmd0aChtZWRpYVF1ZXJ5Lm1heFdpZHRoKSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1pbkhlaWdodClcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihtaW4taGVpZ2h0OiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWluSGVpZ2h0KSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1heEhlaWdodClcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihtYXgtaGVpZ2h0OiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWF4SGVpZ2h0KSArIFwiKVwiKTtcclxuICAgIHZhciBzdHJpbmdNZWRpYVF1ZXJ5ID0gXCJAbWVkaWEgXCIgKyBtZWRpYVF1ZXJ5U2VjdGlvbnMuam9pbignIGFuZCAnKTtcclxuICAgIHZhciBvYmplY3QgPSB7XHJcbiAgICAgICAgJG5lc3Q6IChfYSA9IHt9LFxyXG4gICAgICAgICAgICBfYVtzdHJpbmdNZWRpYVF1ZXJ5XSA9IGV4dGVuZC5hcHBseSh2b2lkIDAsIG9iamVjdHMpLFxyXG4gICAgICAgICAgICBfYSlcclxuICAgIH07XHJcbiAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgdmFyIF9hO1xyXG59O1xyXG52YXIgbWVkaWFMZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiB2YWx1ZSArIFwicHhcIjtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBSZWFjdDsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9TY3JpcHRzL1RTWC9qUXVlcnlVSSBXaWRnZXRzL0hhcm1vbmljU3RhdHMudHN4XCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9