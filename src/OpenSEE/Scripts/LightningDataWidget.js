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

/***/ "./Scripts/TSX/jQueryUI Widgets/LightningData.tsx":
/*!********************************************************!*\
  !*** ./Scripts/TSX/jQueryUI Widgets/LightningData.tsx ***!
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
var moment_1 = __webpack_require__(/*! moment */ "moment");
var Common_1 = __webpack_require__(/*! ./Common */ "./Scripts/TSX/jQueryUI Widgets/Common.tsx");
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
            result.push.apply(result, __spreadArray([], __read(arr.map(function (row, index) {
                return React.createElement("tr", { style: { display: 'table', tableLayout: 'fixed', width: '100%' }, key: "row" + index }, Object.keys(row).map(function (key) { return React.createElement("td", { key: "row" + index + key }, row[key]); }));
            }))));
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

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = moment;

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
/******/ 	var __webpack_exports__ = __webpack_require__("./Scripts/TSX/jQueryUI Widgets/LightningData.tsx");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlnaHRuaW5nRGF0YVdpZGdldC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFhO0FBQ2I7QUFDQTtBQUNBLFdBQVcsZ0JBQWdCLHNDQUFzQyxrQkFBa0I7QUFDbkYsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBLENBQUM7QUFDRCw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLFdBQVcsRUFBRTtBQUNqRCwrQkFBK0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0VBQWdFLGdCQUFnQjtBQUNoRjtBQUNBLGtFQUFrRSxtQ0FBbUM7QUFDckc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLG9CQUFvQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUM7QUFDckM7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsOEJBQThCO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxnQkFBZ0I7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsZ0NBQWdDLFNBQVM7QUFDakYsS0FBSyxTQUFTO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCw0QkFBNEI7QUFDcEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0QsNEJBQTRCO0FBQ3BGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxvQkFBb0I7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixtQkFBbUI7QUFDMUMsMEJBQTBCLG1CQUFtQjtBQUM3QywwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsZ0JBQWdCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxnQkFBZ0I7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxtQkFBbUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDLDZCQUE2QjtBQUM3Qiw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHNDQUFzQztBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0I7QUFDL0IsZ0NBQWdDLGVBQWUsT0FBTyxvQkFBb0IsYUFBdUI7QUFDakcsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDs7Ozs7Ozs7OztBQzFjQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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eEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5zZWUvLi9ub2RlX21vZHVsZXMvZnJlZS1zdHlsZS9kaXN0L2ZyZWUtc3R5bGUuanMiLCJ3ZWJwYWNrOi8vb3BlbnNlZS8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vb3BlbnNlZS8uL1NjcmlwdHMvVFNYL2pRdWVyeVVJIFdpZGdldHMvQ29tbW9uLnRzeCIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vU2NyaXB0cy9UU1gvalF1ZXJ5VUkgV2lkZ2V0cy9MaWdodG5pbmdEYXRhLnRzeCIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vbm9kZV9tb2R1bGVzL3R5cGVzdHlsZS9saWIuZXMyMDE1L2luZGV4LmpzIiwid2VicGFjazovL29wZW5zZWUvLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvZm9ybWF0dGluZy5qcyIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vbm9kZV9tb2R1bGVzL3R5cGVzdHlsZS9saWIuZXMyMDE1L2ludGVybmFsL3R5cGVzdHlsZS5qcyIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vbm9kZV9tb2R1bGVzL3R5cGVzdHlsZS9saWIuZXMyMDE1L2ludGVybmFsL3V0aWxpdGllcy5qcyIsIndlYnBhY2s6Ly9vcGVuc2VlL2V4dGVybmFsIFwiUmVhY3RcIiIsIndlYnBhY2s6Ly9vcGVuc2VlL2V4dGVybmFsIFwibW9tZW50XCIiLCJ3ZWJwYWNrOi8vb3BlbnNlZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vcGVuc2VlL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL29wZW5zZWUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL29wZW5zZWUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vcGVuc2VlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vb3BlbnNlZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL29wZW5zZWUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL29wZW5zZWUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIFRoZSB1bmlxdWUgaWQgaXMgdXNlZCBmb3IgdW5pcXVlIGhhc2hlcy5cbiAqL1xudmFyIHVuaXF1ZUlkID0gMDtcbi8qKlxuICogVGFnIHN0eWxlcyB3aXRoIHRoaXMgc3RyaW5nIHRvIGdldCB1bmlxdWUgaGFzaGVzLlxuICovXG5leHBvcnRzLklTX1VOSVFVRSA9ICdfX0RPX05PVF9ERURVUEVfU1RZTEVfXyc7XG52YXIgdXBwZXJDYXNlUGF0dGVybiA9IC9bQS1aXS9nO1xudmFyIG1zUGF0dGVybiA9IC9ebXMtLztcbnZhciBpbnRlcnBvbGF0ZVBhdHRlcm4gPSAvJi9nO1xudmFyIGVzY2FwZVBhdHRlcm4gPSAvWyAhIyQlJigpKissLi87PD0+P0BbXFxdXmB7fH1+XCInXFxcXF0vZztcbnZhciBwcm9wTG93ZXIgPSBmdW5jdGlvbiAobSkgeyByZXR1cm4gXCItXCIgKyBtLnRvTG93ZXJDYXNlKCk7IH07XG4vKipcbiAqIENTUyBwcm9wZXJ0aWVzIHRoYXQgYXJlIHZhbGlkIHVuaXQtbGVzcyBudW1iZXJzLlxuICovXG52YXIgY3NzTnVtYmVyUHJvcGVydGllcyA9IFtcbiAgICAnYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudCcsXG4gICAgJ2JveC1mbGV4JyxcbiAgICAnYm94LWZsZXgtZ3JvdXAnLFxuICAgICdjb2x1bW4tY291bnQnLFxuICAgICdjb3VudGVyLWluY3JlbWVudCcsXG4gICAgJ2NvdW50ZXItcmVzZXQnLFxuICAgICdmbGV4JyxcbiAgICAnZmxleC1ncm93JyxcbiAgICAnZmxleC1wb3NpdGl2ZScsXG4gICAgJ2ZsZXgtc2hyaW5rJyxcbiAgICAnZmxleC1uZWdhdGl2ZScsXG4gICAgJ2ZvbnQtd2VpZ2h0JyxcbiAgICAnbGluZS1jbGFtcCcsXG4gICAgJ2xpbmUtaGVpZ2h0JyxcbiAgICAnb3BhY2l0eScsXG4gICAgJ29yZGVyJyxcbiAgICAnb3JwaGFucycsXG4gICAgJ3RhYi1zaXplJyxcbiAgICAnd2lkb3dzJyxcbiAgICAnei1pbmRleCcsXG4gICAgJ3pvb20nLFxuICAgIC8vIFNWRyBwcm9wZXJ0aWVzLlxuICAgICdmaWxsLW9wYWNpdHknLFxuICAgICdzdHJva2UtZGFzaG9mZnNldCcsXG4gICAgJ3N0cm9rZS1vcGFjaXR5JyxcbiAgICAnc3Ryb2tlLXdpZHRoJ1xuXTtcbi8qKlxuICogTWFwIG9mIGNzcyBudW1iZXIgcHJvcGVydGllcy5cbiAqL1xudmFyIENTU19OVU1CRVIgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuLy8gQWRkIHZlbmRvciBwcmVmaXhlcyB0byBhbGwgdW5pdC1sZXNzIHByb3BlcnRpZXMuXG5mb3IgKHZhciBfaSA9IDAsIF9hID0gWyctd2Via2l0LScsICctbXMtJywgJy1tb3otJywgJy1vLScsICcnXTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICB2YXIgcHJlZml4ID0gX2FbX2ldO1xuICAgIGZvciAodmFyIF9iID0gMCwgY3NzTnVtYmVyUHJvcGVydGllc18xID0gY3NzTnVtYmVyUHJvcGVydGllczsgX2IgPCBjc3NOdW1iZXJQcm9wZXJ0aWVzXzEubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eSA9IGNzc051bWJlclByb3BlcnRpZXNfMVtfYl07XG4gICAgICAgIENTU19OVU1CRVJbcHJlZml4ICsgcHJvcGVydHldID0gdHJ1ZTtcbiAgICB9XG59XG4vKipcbiAqIEVzY2FwZSBhIENTUyBjbGFzcyBuYW1lLlxuICovXG5leHBvcnRzLmVzY2FwZSA9IGZ1bmN0aW9uIChzdHIpIHsgcmV0dXJuIHN0ci5yZXBsYWNlKGVzY2FwZVBhdHRlcm4sICdcXFxcJCYnKTsgfTtcbi8qKlxuICogVHJhbnNmb3JtIGEgSmF2YVNjcmlwdCBwcm9wZXJ0eSBpbnRvIGEgQ1NTIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBoeXBoZW5hdGUocHJvcGVydHlOYW1lKSB7XG4gICAgcmV0dXJuIHByb3BlcnR5TmFtZVxuICAgICAgICAucmVwbGFjZSh1cHBlckNhc2VQYXR0ZXJuLCBwcm9wTG93ZXIpXG4gICAgICAgIC5yZXBsYWNlKG1zUGF0dGVybiwgJy1tcy0nKTsgLy8gSW50ZXJuZXQgRXhwbG9yZXIgdmVuZG9yIHByZWZpeC5cbn1cbmV4cG9ydHMuaHlwaGVuYXRlID0gaHlwaGVuYXRlO1xuLyoqXG4gKiBHZW5lcmF0ZSBhIGhhc2ggdmFsdWUgZnJvbSBhIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gc3RyaW5nSGFzaChzdHIpIHtcbiAgICB2YXIgdmFsdWUgPSA1MzgxO1xuICAgIHZhciBsZW4gPSBzdHIubGVuZ3RoO1xuICAgIHdoaWxlIChsZW4tLSlcbiAgICAgICAgdmFsdWUgPSAodmFsdWUgKiAzMykgXiBzdHIuY2hhckNvZGVBdChsZW4pO1xuICAgIHJldHVybiAodmFsdWUgPj4+IDApLnRvU3RyaW5nKDM2KTtcbn1cbmV4cG9ydHMuc3RyaW5nSGFzaCA9IHN0cmluZ0hhc2g7XG4vKipcbiAqIFRyYW5zZm9ybSBhIHN0eWxlIHN0cmluZyB0byBhIENTUyBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHN0eWxlVG9TdHJpbmcoa2V5LCB2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIHZhbHVlICE9PSAwICYmICFDU1NfTlVNQkVSW2tleV0pIHtcbiAgICAgICAgcmV0dXJuIGtleSArIFwiOlwiICsgdmFsdWUgKyBcInB4XCI7XG4gICAgfVxuICAgIHJldHVybiBrZXkgKyBcIjpcIiArIHZhbHVlO1xufVxuLyoqXG4gKiBTb3J0IGFuIGFycmF5IG9mIHR1cGxlcyBieSBmaXJzdCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc29ydFR1cGxlcyh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhWzBdID4gYlswXSA/IDEgOiAtMTsgfSk7XG59XG4vKipcbiAqIENhdGVnb3JpemUgdXNlciBzdHlsZXMuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlU3R5bGVzKHN0eWxlcywgaGFzTmVzdGVkU3R5bGVzKSB7XG4gICAgdmFyIHByb3BlcnRpZXMgPSBbXTtcbiAgICB2YXIgbmVzdGVkU3R5bGVzID0gW107XG4gICAgdmFyIGlzVW5pcXVlID0gZmFsc2U7XG4gICAgLy8gU29ydCBrZXlzIGJlZm9yZSBhZGRpbmcgdG8gc3R5bGVzLlxuICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3Qua2V5cyhzdHlsZXMpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIga2V5ID0gX2FbX2ldO1xuICAgICAgICB2YXIgdmFsdWUgPSBzdHlsZXNba2V5XTtcbiAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IGV4cG9ydHMuSVNfVU5JUVVFKSB7XG4gICAgICAgICAgICAgICAgaXNVbmlxdWUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRTdHlsZXMucHVzaChba2V5LnRyaW0oKSwgdmFsdWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaChbaHlwaGVuYXRlKGtleS50cmltKCkpLCB2YWx1ZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHN0eWxlU3RyaW5nOiBzdHJpbmdpZnlQcm9wZXJ0aWVzKHNvcnRUdXBsZXMocHJvcGVydGllcykpLFxuICAgICAgICBuZXN0ZWRTdHlsZXM6IGhhc05lc3RlZFN0eWxlcyA/IG5lc3RlZFN0eWxlcyA6IHNvcnRUdXBsZXMobmVzdGVkU3R5bGVzKSxcbiAgICAgICAgaXNVbmlxdWU6IGlzVW5pcXVlXG4gICAgfTtcbn1cbi8qKlxuICogU3RyaW5naWZ5IGFuIGFycmF5IG9mIHByb3BlcnR5IHR1cGxlcy5cbiAqL1xuZnVuY3Rpb24gc3RyaW5naWZ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgcmV0dXJuIHByb3BlcnRpZXMubWFwKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICB2YXIgbmFtZSA9IF9hWzBdLCB2YWx1ZSA9IF9hWzFdO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIHN0eWxlVG9TdHJpbmcobmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdmFsdWUubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiBzdHlsZVRvU3RyaW5nKG5hbWUsIHgpOyB9KS5qb2luKCc7Jyk7XG4gICAgfSkuam9pbignOycpO1xufVxuLyoqXG4gKiBJbnRlcnBvbGF0ZSBDU1Mgc2VsZWN0b3JzLlxuICovXG5mdW5jdGlvbiBpbnRlcnBvbGF0ZShzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgaWYgKHNlbGVjdG9yLmluZGV4T2YoJyYnKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKGludGVycG9sYXRlUGF0dGVybiwgcGFyZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudCArIFwiIFwiICsgc2VsZWN0b3I7XG59XG4vKipcbiAqIFJlY3Vyc2l2ZSBsb29wIGJ1aWxkaW5nIHN0eWxlcyB3aXRoIGRlZmVycmVkIHNlbGVjdG9ycy5cbiAqL1xuZnVuY3Rpb24gc3R5bGl6ZShjYWNoZSwgc2VsZWN0b3IsIHN0eWxlcywgbGlzdCwgcGFyZW50KSB7XG4gICAgdmFyIF9hID0gcGFyc2VTdHlsZXMoc3R5bGVzLCAhIXNlbGVjdG9yKSwgc3R5bGVTdHJpbmcgPSBfYS5zdHlsZVN0cmluZywgbmVzdGVkU3R5bGVzID0gX2EubmVzdGVkU3R5bGVzLCBpc1VuaXF1ZSA9IF9hLmlzVW5pcXVlO1xuICAgIHZhciBwaWQgPSBzdHlsZVN0cmluZztcbiAgICBpZiAoc2VsZWN0b3IuY2hhckNvZGVBdCgwKSA9PT0gNjQgLyogQCAqLykge1xuICAgICAgICB2YXIgcnVsZSA9IGNhY2hlLmFkZChuZXcgUnVsZShzZWxlY3RvciwgcGFyZW50ID8gdW5kZWZpbmVkIDogc3R5bGVTdHJpbmcsIGNhY2hlLmhhc2gpKTtcbiAgICAgICAgLy8gTmVzdGVkIHN0eWxlcyBzdXBwb3J0IChlLmcuIGAuZm9vID4gQG1lZGlhID4gLmJhcmApLlxuICAgICAgICBpZiAoc3R5bGVTdHJpbmcgJiYgcGFyZW50KSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBydWxlLmFkZChuZXcgU3R5bGUoc3R5bGVTdHJpbmcsIHJ1bGUuaGFzaCwgaXNVbmlxdWUgPyBcInVcIiArICgrK3VuaXF1ZUlkKS50b1N0cmluZygzNikgOiB1bmRlZmluZWQpKTtcbiAgICAgICAgICAgIGxpc3QucHVzaChbcGFyZW50LCBzdHlsZV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgbmVzdGVkU3R5bGVzXzEgPSBuZXN0ZWRTdHlsZXM7IF9pIDwgbmVzdGVkU3R5bGVzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2IgPSBuZXN0ZWRTdHlsZXNfMVtfaV0sIG5hbWUgPSBfYlswXSwgdmFsdWUgPSBfYlsxXTtcbiAgICAgICAgICAgIHBpZCArPSBuYW1lICsgc3R5bGl6ZShydWxlLCBuYW1lLCB2YWx1ZSwgbGlzdCwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIGtleSA9IHBhcmVudCA/IGludGVycG9sYXRlKHNlbGVjdG9yLCBwYXJlbnQpIDogc2VsZWN0b3I7XG4gICAgICAgIGlmIChzdHlsZVN0cmluZykge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gY2FjaGUuYWRkKG5ldyBTdHlsZShzdHlsZVN0cmluZywgY2FjaGUuaGFzaCwgaXNVbmlxdWUgPyBcInVcIiArICgrK3VuaXF1ZUlkKS50b1N0cmluZygzNikgOiB1bmRlZmluZWQpKTtcbiAgICAgICAgICAgIGxpc3QucHVzaChba2V5LCBzdHlsZV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIF9jID0gMCwgbmVzdGVkU3R5bGVzXzIgPSBuZXN0ZWRTdHlsZXM7IF9jIDwgbmVzdGVkU3R5bGVzXzIubGVuZ3RoOyBfYysrKSB7XG4gICAgICAgICAgICB2YXIgX2QgPSBuZXN0ZWRTdHlsZXNfMltfY10sIG5hbWUgPSBfZFswXSwgdmFsdWUgPSBfZFsxXTtcbiAgICAgICAgICAgIHBpZCArPSBuYW1lICsgc3R5bGl6ZShjYWNoZSwgbmFtZSwgdmFsdWUsIGxpc3QsIGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBpZDtcbn1cbi8qKlxuICogUmVnaXN0ZXIgYWxsIHN0eWxlcywgYnV0IGNvbGxlY3QgZm9yIHNlbGVjdG9yIGludGVycG9sYXRpb24gdXNpbmcgdGhlIGhhc2guXG4gKi9cbmZ1bmN0aW9uIGNvbXBvc2VTdHlsZXMoY29udGFpbmVyLCBzZWxlY3Rvciwgc3R5bGVzLCBpc1N0eWxlLCBkaXNwbGF5TmFtZSkge1xuICAgIHZhciBjYWNoZSA9IG5ldyBDYWNoZShjb250YWluZXIuaGFzaCk7XG4gICAgdmFyIGxpc3QgPSBbXTtcbiAgICB2YXIgcGlkID0gc3R5bGl6ZShjYWNoZSwgc2VsZWN0b3IsIHN0eWxlcywgbGlzdCk7XG4gICAgdmFyIGhhc2ggPSBcImZcIiArIGNhY2hlLmhhc2gocGlkKTtcbiAgICB2YXIgaWQgPSBkaXNwbGF5TmFtZSA/IGRpc3BsYXlOYW1lICsgXCJfXCIgKyBoYXNoIDogaGFzaDtcbiAgICBmb3IgKHZhciBfaSA9IDAsIGxpc3RfMSA9IGxpc3Q7IF9pIDwgbGlzdF8xLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgX2EgPSBsaXN0XzFbX2ldLCBzZWxlY3Rvcl8xID0gX2FbMF0sIHN0eWxlID0gX2FbMV07XG4gICAgICAgIHZhciBrZXkgPSBpc1N0eWxlID8gaW50ZXJwb2xhdGUoc2VsZWN0b3JfMSwgXCIuXCIgKyBleHBvcnRzLmVzY2FwZShpZCkpIDogc2VsZWN0b3JfMTtcbiAgICAgICAgc3R5bGUuYWRkKG5ldyBTZWxlY3RvcihrZXksIHN0eWxlLmhhc2gsIHVuZGVmaW5lZCwgcGlkKSk7XG4gICAgfVxuICAgIHJldHVybiB7IGNhY2hlOiBjYWNoZSwgcGlkOiBwaWQsIGlkOiBpZCB9O1xufVxuLyoqXG4gKiBDYWNoZSB0byBsaXN0IHRvIHN0eWxlcy5cbiAqL1xuZnVuY3Rpb24gam9pbihhcnIpIHtcbiAgICB2YXIgcmVzID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlcyArPSBhcnJbaV07XG4gICAgcmV0dXJuIHJlcztcbn1cbi8qKlxuICogTm9vcCBjaGFuZ2VzLlxuICovXG52YXIgbm9vcENoYW5nZXMgPSB7XG4gICAgYWRkOiBmdW5jdGlvbiAoKSB7IHJldHVybiB1bmRlZmluZWQ7IH0sXG4gICAgY2hhbmdlOiBmdW5jdGlvbiAoKSB7IHJldHVybiB1bmRlZmluZWQ7IH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbn07XG4vKipcbiAqIEltcGxlbWVudCBhIGNhY2hlL2V2ZW50IGVtaXR0ZXIuXG4gKi9cbnZhciBDYWNoZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWNoZShoYXNoLCBjaGFuZ2VzKSB7XG4gICAgICAgIGlmIChoYXNoID09PSB2b2lkIDApIHsgaGFzaCA9IHN0cmluZ0hhc2g7IH1cbiAgICAgICAgaWYgKGNoYW5nZXMgPT09IHZvaWQgMCkgeyBjaGFuZ2VzID0gbm9vcENoYW5nZXM7IH1cbiAgICAgICAgdGhpcy5oYXNoID0gaGFzaDtcbiAgICAgICAgdGhpcy5jaGFuZ2VzID0gY2hhbmdlcztcbiAgICAgICAgdGhpcy5zaGVldCA9IFtdO1xuICAgICAgICB0aGlzLmNoYW5nZUlkID0gMDtcbiAgICAgICAgdGhpcy5fa2V5cyA9IFtdO1xuICAgICAgICB0aGlzLl9jaGlsZHJlbiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2NvdW50ZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9XG4gICAgQ2FjaGUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgICB2YXIgY291bnQgPSB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF0gfHwgMDtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9jaGlsZHJlbltzdHlsZS5pZF0gfHwgc3R5bGUuY2xvbmUoKTtcbiAgICAgICAgdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdID0gY291bnQgKyAxO1xuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuW2l0ZW0uaWRdID0gaXRlbTtcbiAgICAgICAgICAgIHRoaXMuX2tleXMucHVzaChpdGVtLmlkKTtcbiAgICAgICAgICAgIHRoaXMuc2hlZXQucHVzaChpdGVtLmdldFN0eWxlcygpKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlSWQrKztcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlcy5hZGQoaXRlbSwgdGhpcy5fa2V5cy5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGNvbnRlbnRzIGFyZSBkaWZmZXJlbnQuXG4gICAgICAgICAgICBpZiAoaXRlbS5nZXRJZGVudGlmaWVyKCkgIT09IHN0eWxlLmdldElkZW50aWZpZXIoKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJIYXNoIGNvbGxpc2lvbjogXCIgKyBzdHlsZS5nZXRTdHlsZXMoKSArIFwiID09PSBcIiArIGl0ZW0uZ2V0U3R5bGVzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9sZEluZGV4ID0gdGhpcy5fa2V5cy5pbmRleE9mKHN0eWxlLmlkKTtcbiAgICAgICAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuX2tleXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHZhciBwcmV2Q2hhbmdlSWQgPSB0aGlzLmNoYW5nZUlkO1xuICAgICAgICAgICAgaWYgKG9sZEluZGV4ICE9PSBuZXdJbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2tleXMuc3BsaWNlKG9sZEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzLnB1c2goc3R5bGUuaWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlSWQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgQ2FjaGUgJiYgc3R5bGUgaW5zdGFuY2VvZiBDYWNoZSkge1xuICAgICAgICAgICAgICAgIHZhciBwcmV2Q2hhbmdlSWRfMSA9IGl0ZW0uY2hhbmdlSWQ7XG4gICAgICAgICAgICAgICAgaXRlbS5tZXJnZShzdHlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uY2hhbmdlSWQgIT09IHByZXZDaGFuZ2VJZF8xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlSWQrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5jaGFuZ2VJZCAhPT0gcHJldkNoYW5nZUlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZEluZGV4ID09PSBuZXdJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShvbGRJbmRleCwgMSwgaXRlbS5nZXRTdHlsZXMoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShvbGRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlZXQuc3BsaWNlKG5ld0luZGV4LCAwLCBpdGVtLmdldFN0eWxlcygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VzLmNoYW5nZShpdGVtLCBvbGRJbmRleCwgbmV3SW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH07XG4gICAgQ2FjaGUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgICB2YXIgY291bnQgPSB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF07XG4gICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXSA9IGNvdW50IC0gMTtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5fY2hpbGRyZW5bc3R5bGUuaWRdO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fa2V5cy5pbmRleE9mKGl0ZW0uaWQpO1xuICAgICAgICAgICAgaWYgKGNvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fY2hpbGRyZW5bc3R5bGUuaWRdO1xuICAgICAgICAgICAgICAgIHRoaXMuX2tleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VJZCsrO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlcy5yZW1vdmUoaXRlbSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXRlbSBpbnN0YW5jZW9mIENhY2hlICYmIHN0eWxlIGluc3RhbmNlb2YgQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJldkNoYW5nZUlkID0gaXRlbS5jaGFuZ2VJZDtcbiAgICAgICAgICAgICAgICBpdGVtLnVubWVyZ2Uoc3R5bGUpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmNoYW5nZUlkICE9PSBwcmV2Q2hhbmdlSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2UoaW5kZXgsIDEsIGl0ZW0uZ2V0U3R5bGVzKCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUlkKys7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlcy5jaGFuZ2UoaXRlbSwgaW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIENhY2hlLnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uIChjYWNoZSkge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gY2FjaGUuX2tleXM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgaWQgPSBfYVtfaV07XG4gICAgICAgICAgICB0aGlzLmFkZChjYWNoZS5fY2hpbGRyZW5baWRdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIENhY2hlLnByb3RvdHlwZS51bm1lcmdlID0gZnVuY3Rpb24gKGNhY2hlKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBjYWNoZS5fa2V5czsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBpZCA9IF9hW19pXTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKGNhY2hlLl9jaGlsZHJlbltpZF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgQ2FjaGUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IENhY2hlKHRoaXMuaGFzaCkubWVyZ2UodGhpcyk7XG4gICAgfTtcbiAgICByZXR1cm4gQ2FjaGU7XG59KCkpO1xuZXhwb3J0cy5DYWNoZSA9IENhY2hlO1xuLyoqXG4gKiBTZWxlY3RvciBpcyBhIGR1bWIgY2xhc3MgbWFkZSB0byByZXByZXNlbnQgbmVzdGVkIENTUyBzZWxlY3RvcnMuXG4gKi9cbnZhciBTZWxlY3RvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTZWxlY3RvcihzZWxlY3RvciwgaGFzaCwgaWQsIHBpZCkge1xuICAgICAgICBpZiAoaWQgPT09IHZvaWQgMCkgeyBpZCA9IFwic1wiICsgaGFzaChzZWxlY3Rvcik7IH1cbiAgICAgICAgaWYgKHBpZCA9PT0gdm9pZCAwKSB7IHBpZCA9ICcnOyB9XG4gICAgICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgdGhpcy5oYXNoID0gaGFzaDtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnBpZCA9IHBpZDtcbiAgICB9XG4gICAgU2VsZWN0b3IucHJvdG90eXBlLmdldFN0eWxlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0b3I7XG4gICAgfTtcbiAgICBTZWxlY3Rvci5wcm90b3R5cGUuZ2V0SWRlbnRpZmllciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGlkICsgXCIuXCIgKyB0aGlzLnNlbGVjdG9yO1xuICAgIH07XG4gICAgU2VsZWN0b3IucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFNlbGVjdG9yKHRoaXMuc2VsZWN0b3IsIHRoaXMuaGFzaCwgdGhpcy5pZCwgdGhpcy5waWQpO1xuICAgIH07XG4gICAgcmV0dXJuIFNlbGVjdG9yO1xufSgpKTtcbmV4cG9ydHMuU2VsZWN0b3IgPSBTZWxlY3Rvcjtcbi8qKlxuICogVGhlIHN0eWxlIGNvbnRhaW5lciByZWdpc3RlcnMgYSBzdHlsZSBzdHJpbmcgd2l0aCBzZWxlY3RvcnMuXG4gKi9cbnZhciBTdHlsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU3R5bGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU3R5bGUoc3R5bGUsIGhhc2gsIGlkKSB7XG4gICAgICAgIGlmIChpZCA9PT0gdm9pZCAwKSB7IGlkID0gXCJjXCIgKyBoYXNoKHN0eWxlKTsgfVxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBoYXNoKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5zdHlsZSA9IHN0eWxlO1xuICAgICAgICBfdGhpcy5oYXNoID0gaGFzaDtcbiAgICAgICAgX3RoaXMuaWQgPSBpZDtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBTdHlsZS5wcm90b3R5cGUuZ2V0U3R5bGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGVldC5qb2luKCcsJykgKyBcIntcIiArIHRoaXMuc3R5bGUgKyBcIn1cIjtcbiAgICB9O1xuICAgIFN0eWxlLnByb3RvdHlwZS5nZXRJZGVudGlmaWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdHlsZTtcbiAgICB9O1xuICAgIFN0eWxlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHlsZSh0aGlzLnN0eWxlLCB0aGlzLmhhc2gsIHRoaXMuaWQpLm1lcmdlKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIFN0eWxlO1xufShDYWNoZSkpO1xuZXhwb3J0cy5TdHlsZSA9IFN0eWxlO1xuLyoqXG4gKiBJbXBsZW1lbnQgcnVsZSBsb2dpYyBmb3Igc3R5bGUgb3V0cHV0LlxuICovXG52YXIgUnVsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoUnVsZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBSdWxlKHJ1bGUsIHN0eWxlLCBoYXNoLCBpZCwgcGlkKSB7XG4gICAgICAgIGlmIChzdHlsZSA9PT0gdm9pZCAwKSB7IHN0eWxlID0gJyc7IH1cbiAgICAgICAgaWYgKGlkID09PSB2b2lkIDApIHsgaWQgPSBcImFcIiArIGhhc2gocnVsZSArIFwiLlwiICsgc3R5bGUpOyB9XG4gICAgICAgIGlmIChwaWQgPT09IHZvaWQgMCkgeyBwaWQgPSAnJzsgfVxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBoYXNoKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5ydWxlID0gcnVsZTtcbiAgICAgICAgX3RoaXMuc3R5bGUgPSBzdHlsZTtcbiAgICAgICAgX3RoaXMuaGFzaCA9IGhhc2g7XG4gICAgICAgIF90aGlzLmlkID0gaWQ7XG4gICAgICAgIF90aGlzLnBpZCA9IHBpZDtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBSdWxlLnByb3RvdHlwZS5nZXRTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1bGUgKyBcIntcIiArIHRoaXMuc3R5bGUgKyBqb2luKHRoaXMuc2hlZXQpICsgXCJ9XCI7XG4gICAgfTtcbiAgICBSdWxlLnByb3RvdHlwZS5nZXRJZGVudGlmaWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5waWQgKyBcIi5cIiArIHRoaXMucnVsZSArIFwiLlwiICsgdGhpcy5zdHlsZTtcbiAgICB9O1xuICAgIFJ1bGUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFJ1bGUodGhpcy5ydWxlLCB0aGlzLnN0eWxlLCB0aGlzLmhhc2gsIHRoaXMuaWQsIHRoaXMucGlkKS5tZXJnZSh0aGlzKTtcbiAgICB9O1xuICAgIHJldHVybiBSdWxlO1xufShDYWNoZSkpO1xuZXhwb3J0cy5SdWxlID0gUnVsZTtcbi8qKlxuICogVGhlIEZyZWVTdHlsZSBjbGFzcyBpbXBsZW1lbnRzIHRoZSBBUEkgZm9yIGV2ZXJ5dGhpbmcgZWxzZS5cbiAqL1xudmFyIEZyZWVTdHlsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoRnJlZVN0eWxlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEZyZWVTdHlsZShoYXNoLCBkZWJ1ZywgaWQsIGNoYW5nZXMpIHtcbiAgICAgICAgaWYgKGhhc2ggPT09IHZvaWQgMCkgeyBoYXNoID0gc3RyaW5nSGFzaDsgfVxuICAgICAgICBpZiAoZGVidWcgPT09IHZvaWQgMCkgeyBkZWJ1ZyA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudlsnTk9ERV9FTlYnXSAhPT0gJ3Byb2R1Y3Rpb24nOyB9XG4gICAgICAgIGlmIChpZCA9PT0gdm9pZCAwKSB7IGlkID0gXCJmXCIgKyAoKyt1bmlxdWVJZCkudG9TdHJpbmcoMzYpOyB9XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGhhc2gsIGNoYW5nZXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmhhc2ggPSBoYXNoO1xuICAgICAgICBfdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICAgICAgICBfdGhpcy5pZCA9IGlkO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIEZyZWVTdHlsZS5wcm90b3R5cGUucmVnaXN0ZXJTdHlsZSA9IGZ1bmN0aW9uIChzdHlsZXMsIGRpc3BsYXlOYW1lKSB7XG4gICAgICAgIHZhciBkZWJ1Z05hbWUgPSB0aGlzLmRlYnVnID8gZGlzcGxheU5hbWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBfYSA9IGNvbXBvc2VTdHlsZXModGhpcywgJyYnLCBzdHlsZXMsIHRydWUsIGRlYnVnTmFtZSksIGNhY2hlID0gX2EuY2FjaGUsIGlkID0gX2EuaWQ7XG4gICAgICAgIHRoaXMubWVyZ2UoY2FjaGUpO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfTtcbiAgICBGcmVlU3R5bGUucHJvdG90eXBlLnJlZ2lzdGVyS2V5ZnJhbWVzID0gZnVuY3Rpb24gKGtleWZyYW1lcywgZGlzcGxheU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJIYXNoUnVsZSgnQGtleWZyYW1lcycsIGtleWZyYW1lcywgZGlzcGxheU5hbWUpO1xuICAgIH07XG4gICAgRnJlZVN0eWxlLnByb3RvdHlwZS5yZWdpc3Rlckhhc2hSdWxlID0gZnVuY3Rpb24gKHByZWZpeCwgc3R5bGVzLCBkaXNwbGF5TmFtZSkge1xuICAgICAgICB2YXIgZGVidWdOYW1lID0gdGhpcy5kZWJ1ZyA/IGRpc3BsYXlOYW1lIDogdW5kZWZpbmVkO1xuICAgICAgICB2YXIgX2EgPSBjb21wb3NlU3R5bGVzKHRoaXMsICcnLCBzdHlsZXMsIGZhbHNlLCBkZWJ1Z05hbWUpLCBjYWNoZSA9IF9hLmNhY2hlLCBwaWQgPSBfYS5waWQsIGlkID0gX2EuaWQ7XG4gICAgICAgIHZhciBydWxlID0gbmV3IFJ1bGUocHJlZml4ICsgXCIgXCIgKyBleHBvcnRzLmVzY2FwZShpZCksIHVuZGVmaW5lZCwgdGhpcy5oYXNoLCB1bmRlZmluZWQsIHBpZCk7XG4gICAgICAgIHRoaXMuYWRkKHJ1bGUubWVyZ2UoY2FjaGUpKTtcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgIH07XG4gICAgRnJlZVN0eWxlLnByb3RvdHlwZS5yZWdpc3RlclJ1bGUgPSBmdW5jdGlvbiAocnVsZSwgc3R5bGVzKSB7XG4gICAgICAgIHRoaXMubWVyZ2UoY29tcG9zZVN0eWxlcyh0aGlzLCBydWxlLCBzdHlsZXMsIGZhbHNlKS5jYWNoZSk7XG4gICAgfTtcbiAgICBGcmVlU3R5bGUucHJvdG90eXBlLnJlZ2lzdGVyQ3NzID0gZnVuY3Rpb24gKHN0eWxlcykge1xuICAgICAgICB0aGlzLm1lcmdlKGNvbXBvc2VTdHlsZXModGhpcywgJycsIHN0eWxlcywgZmFsc2UpLmNhY2hlKTtcbiAgICB9O1xuICAgIEZyZWVTdHlsZS5wcm90b3R5cGUuZ2V0U3R5bGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gam9pbih0aGlzLnNoZWV0KTtcbiAgICB9O1xuICAgIEZyZWVTdHlsZS5wcm90b3R5cGUuZ2V0SWRlbnRpZmllciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XG4gICAgfTtcbiAgICBGcmVlU3R5bGUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IEZyZWVTdHlsZSh0aGlzLmhhc2gsIHRoaXMuZGVidWcsIHRoaXMuaWQsIHRoaXMuY2hhbmdlcykubWVyZ2UodGhpcyk7XG4gICAgfTtcbiAgICByZXR1cm4gRnJlZVN0eWxlO1xufShDYWNoZSkpO1xuZXhwb3J0cy5GcmVlU3R5bGUgPSBGcmVlU3R5bGU7XG4vKipcbiAqIEV4cG9ydHMgYSBzaW1wbGUgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBjcmVhdGUoaGFzaCwgZGVidWcsIGNoYW5nZXMpIHtcbiAgICByZXR1cm4gbmV3IEZyZWVTdHlsZShoYXNoLCBkZWJ1ZywgdW5kZWZpbmVkLCBjaGFuZ2VzKTtcbn1cbmV4cG9ydHMuY3JlYXRlID0gY3JlYXRlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZnJlZS1zdHlsZS5qcy5tYXAiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gIENvbW1vbi50c3ggLSBHYnRjXHJcbi8vXHJcbi8vICBDb3B5cmlnaHQgwqkgMjAxOCwgR3JpZCBQcm90ZWN0aW9uIEFsbGlhbmNlLiAgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuLy9cclxuLy8gIExpY2Vuc2VkIHRvIHRoZSBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UgKEdQQSkgdW5kZXIgb25lIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiBTZWVcclxuLy8gIHRoZSBOT1RJQ0UgZmlsZSBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC5cclxuLy8gIFRoZSBHUEEgbGljZW5zZXMgdGhpcyBmaWxlIHRvIHlvdSB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHRoZSBcIkxpY2Vuc2VcIjsgeW91IG1heSBub3QgdXNlIHRoaXNcclxuLy8gIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0OlxyXG4vL1xyXG4vLyAgICAgIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuLy9cclxuLy8gIFVubGVzcyBhZ3JlZWQgdG8gaW4gd3JpdGluZywgdGhlIHN1YmplY3Qgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW5cclxuLy8gIFwiQVMtSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFJlZmVyIHRvIHRoZVxyXG4vLyAgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMuXHJcbi8vXHJcbi8vICBDb2RlIE1vZGlmaWNhdGlvbiBIaXN0b3J5OlxyXG4vLyAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAgMTAvMTMvMjAyMCAtIEMuIExhY2tuZXJcclxuLy8gICAgICAgR2VuZXJhdGVkIG9yaWdpbmFsIHZlcnNpb24gb2Ygc291cmNlIGNvZGUuXHJcbi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHN0eWxlIH0gZnJvbSBcInR5cGVzdHlsZVwiXHJcblxyXG4vLyBzdHlsZXNcclxuZXhwb3J0IGNvbnN0IG91dGVyRGl2OiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgIG1hcmdpbkxlZnQ6ICdhdXRvJyxcclxuICAgIG1hcmdpblJpZ2h0OiAnYXV0bycsXHJcbiAgICBvdmVyZmxvd1k6ICdoaWRkZW4nLFxyXG4gICAgb3ZlcmZsb3dYOiAnaGlkZGVuJyxcclxuICAgIHBhZGRpbmc6ICcwZW0nLFxyXG4gICAgekluZGV4OiAxMDAwLFxyXG4gICAgYm94U2hhZG93OiAnNHB4IDRweCAycHggIzg4ODg4OCcsXHJcbiAgICBib3JkZXI6ICcycHggc29saWQgYmxhY2snLFxyXG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICB0b3A6ICcwJyxcclxuICAgIGxlZnQ6IDAsXHJcbiAgICBkaXNwbGF5OiAnbm9uZScsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlID0gc3R5bGUoe1xyXG4gICAgd2lkdGg6ICcxMDAlJyxcclxuICAgIGhlaWdodDogJzIwcHgnLFxyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnIzgwODA4MCcsXHJcbiAgICBjdXJzb3I6ICdtb3ZlJyxcclxuICAgIHBhZGRpbmc6ICcwZW0nXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNsb3NlQnV0dG9uID0gc3R5bGUoe1xyXG4gICAgYmFja2dyb3VuZDogJ2ZpcmVicmljaycsXHJcbiAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgdG9wOiAwLFxyXG4gICAgcmlnaHQ6IDAsXHJcbiAgICB3aWR0aDogJzIwcHgnLFxyXG4gICAgaGVpZ2h0OiAnMjBweCcsXHJcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgdmVydGljYWxBbGlnbjogJ21pZGRsZScsXHJcbiAgICBwYWRkaW5nOiAwLFxyXG4gICAgYm9yZGVyOiAwLFxyXG4gICAgJG5lc3Q6IHtcclxuICAgICAgICBcIiY6aG92ZXJcIjoge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnb3JhbmdlcmVkJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5pbnRlcmZhY2UgSXdpbmRvd1Byb3BzIHtcclxuICAgIHNob3c6IGJvb2xlYW4sXHJcbiAgICBjbG9zZTogKCkgPT4gdm9pZCxcclxuICAgIHdpZHRoOiBudW1iZXIsXHJcbiAgICBtYXhIZWlnaHQ6IG51bWJlcixcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFdpZGdldFdpbmRvdzogUmVhY3QuRnVuY3Rpb25Db21wb25lbnQ8SXdpbmRvd1Byb3BzPiA9IChwcm9wcykgPT4ge1xyXG4gICAgY29uc3QgcmVmV2luZG93ID0gUmVhY3QudXNlUmVmKG51bGwpO1xyXG4gICAgY29uc3QgcmVmSGFuZGxlID0gUmVhY3QudXNlUmVmKG51bGwpO1xyXG5cclxuICAgIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHByb3BzLnNob3cpXHJcbiAgICAgICAgICAgICgkKHJlZldpbmRvdy5jdXJyZW50KSBhcyBhbnkpLmRyYWdnYWJsZSh7IHNjcm9sbDogZmFsc2UsIGhhbmRsZTogcmVmSGFuZGxlLmN1cnJlbnQsIGNvbnRhaW5tZW50OiAnI2NoYXJ0cGFuZWwnIH0pO1xyXG4gICAgfSlcclxuXHJcbiAgICBpZiAoIXByb3BzLnNob3cpXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8IGRpdiByZWY9e3JlZldpbmRvd30gY2xhc3NOYW1lPVwidWktd2lkZ2V0LWNvbnRlbnRcIiBzdHlsZT17eyAuLi5vdXRlckRpdiwgd2lkdGg6IHByb3BzLndpZHRoLCBtYXhIZWlnaHQ6IHByb3BzLm1heEhlaWdodCwgZGlzcGxheTogdW5kZWZpbmVkIH19ID5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXI6ICdibGFjayBzb2xpZCAycHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiByZWY9e3JlZkhhbmRsZX0gY2xhc3NOYW1lPXtoYW5kbGV9PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogcHJvcHMud2lkdGggLSA2LCBtYXhIZWlnaHQ6IHByb3BzLm1heEhlaWdodCAtIDI0IH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHtwcm9wcy5jaGlsZHJlbn1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9e2Nsb3NlQnV0dG9ufSBvbkNsaWNrPXsoKSA9PiBwcm9wcy5jbG9zZSgpfT5YPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIClcclxufSIsIi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vICBMaWdodG5pbmdEYXRhLnRzeCAtIEdidGNcclxuLy9cclxuLy8gIENvcHlyaWdodCDCqSAyMDE4LCBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UuICBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4vL1xyXG4vLyAgTGljZW5zZWQgdG8gdGhlIEdyaWQgUHJvdGVjdGlvbiBBbGxpYW5jZSAoR1BBKSB1bmRlciBvbmUgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuIFNlZVxyXG4vLyAgdGhlIE5PVElDRSBmaWxlIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLlxyXG4vLyAgVGhlIEdQQSBsaWNlbnNlcyB0aGlzIGZpbGUgdG8geW91IHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgdGhlIFwiTGljZW5zZVwiOyB5b3UgbWF5IG5vdCB1c2UgdGhpc1xyXG4vLyAgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXQ6XHJcbi8vXHJcbi8vICAgICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4vL1xyXG4vLyAgVW5sZXNzIGFncmVlZCB0byBpbiB3cml0aW5nLCB0aGUgc3ViamVjdCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhblxyXG4vLyAgXCJBUy1JU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gUmVmZXIgdG8gdGhlXHJcbi8vICBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucy5cclxuLy9cclxuLy8gIENvZGUgTW9kaWZpY2F0aW9uIEhpc3Rvcnk6XHJcbi8vICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICAwMy8xMy8yMDE5IC0gU3RlcGhlbiBDLiBXaWxsc1xyXG4vLyAgICAgICBHZW5lcmF0ZWQgb3JpZ2luYWwgdmVyc2lvbiBvZiBzb3VyY2UgY29kZS5cclxuLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXRjIH0gZnJvbSAnbW9tZW50JztcclxuaW1wb3J0IHsgb3V0ZXJEaXYsIGhhbmRsZSwgY2xvc2VCdXR0b24sIFdpZGdldFdpbmRvdyB9IGZyb20gJy4vQ29tbW9uJztcclxuXHJcblxyXG5pbnRlcmZhY2UgSXByb3BzIHsgY2xvc2VDYWxsYmFjazogKCkgPT4gdm9pZCwgZXZlbnRJZDogbnVtYmVyLCBpc09wZW46IGJvb2xlYW4gfVxyXG5kZWNsYXJlIHZhciB3aW5kb3c6IGFueVxyXG5cclxuY29uc3QgTGlnaHRuaW5nRGF0YVdpZGdldCA9IChwcm9wczogSXByb3BzKSA9PiB7XHJcbiAgICBjb25zdCBbdGJsRGF0YSwgc2V0VEJMRGF0YV0gPSBSZWFjdC51c2VTdGF0ZTxBcnJheTxKU1guRWxlbWVudD4+KFtdKTtcclxuXHJcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgICAgIGxldCBoYW5kbGUgPSBnZXREYXRhKCk7XHJcblxyXG4gICAgICAgIHJldHVybiAoKSA9PiB7IGlmIChoYW5kbGUgIT0gdW5kZWZpbmVkICYmIGhhbmRsZS5hYm9ydCAhPSB1bmRlZmluZWQpIGhhbmRsZS5hYm9ydCgpOyB9XHJcbiAgICB9LCBbcHJvcHMuZXZlbnRJZF0pXHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RGF0YSgpOiBKUXVlcnkuanFYSFIge1xyXG4gICAgICAgIHZhciBsaWdodG5pbmdRdWVyeSA9IHdpbmRvdy5MaWdodG5pbmdRdWVyeTtcclxuXHJcbiAgICAgICAgaWYgKGxpZ2h0bmluZ1F1ZXJ5ID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVUYWJsZSA9IGRpc3BsYXlEYXRhID0+IHtcclxuICAgICAgICAgICAgbGV0IGFyciA9IEFycmF5LmlzQXJyYXkoZGlzcGxheURhdGEpID8gZGlzcGxheURhdGEgOiBbZGlzcGxheURhdGFdO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFxyXG4gICAgICAgICAgICAgICAgPHRyIGtleT0nSGVhZGVyJz5cclxuICAgICAgICAgICAgICAgICAgICB7T2JqZWN0LmtleXMoYXJyWzBdKS5tYXAoa2V5ID0+IDx0aCBrZXk9e2tleX0+e2tleX08L3RoPil9XHJcbiAgICAgICAgICAgICAgICA8L3RyPilcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goLi4uYXJyLm1hcCgocm93LGluZGV4KSA9PiBcclxuICAgICAgICAgICAgICAgIDx0ciBzdHlsZT17eyBkaXNwbGF5OiAndGFibGUnLCB0YWJsZUxheW91dDogJ2ZpeGVkJywgd2lkdGg6ICcxMDAlJyB9fSBrZXk9e1wicm93XCIgKyBpbmRleH0+XHJcbiAgICAgICAgICAgICAgICAgICAge09iamVjdC5rZXlzKHJvdykubWFwKGtleSA9PiA8dGQga2V5PXtcInJvd1wiICsgaW5kZXggKyBrZXl9Pntyb3dba2V5XX08L3RkPil9XHJcbiAgICAgICAgICAgICAgICA8L3RyPikpXHJcbiAgICAgICAgICAgIHNldFRCTERhdGEocmVzdWx0KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgZXJySGFuZGxlciA9IGVyciA9PiB7XHJcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJVbmtub3duIGVycm9yXCI7XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIChlcnIpID09PSBcInN0cmluZ1wiKVxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGVycjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXJyICYmIHR5cGVvZiAoZXJyLm1lc3NhZ2UpID09PSBcInN0cmluZ1wiICYmIGVyci5tZXNzYWdlICE9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlO1xyXG5cclxuICAgICAgICAgICAgdXBkYXRlVGFibGUoeyBFcnJvcjogbWVzc2FnZSB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB1cGRhdGVUYWJsZSh7IFN0YXRlOiBcIkxvYWRpbmcuLi5cIiB9KTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgbGV0IGhhbmRsZSA9ICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICB1cmw6IGAke2hvbWVQYXRofWFwaS9PcGVuU0VFL0dldExpZ2h0bmluZ1BhcmFtZXRlcnM/ZXZlbnRJZD0ke3Byb3BzLmV2ZW50SWR9YCxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZSxcclxuICAgICAgICAgICAgYXN5bmM6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaGFuZGxlLmRvbmUobGlnaHRuaW5nUGFyYW1ldGVycyA9PiB7XHJcbiAgICAgICAgICAgIGxldCBub0RhdGEgPSB7IFN0YXRlOiBcIk5vIERhdGFcIiB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGxpbmVLZXkgPSBsaWdodG5pbmdQYXJhbWV0ZXJzLkxpbmVLZXk7XHJcbiAgICAgICAgICAgIGxldCBzdGFydFRpbWUgPSB1dGMobGlnaHRuaW5nUGFyYW1ldGVycy5TdGFydFRpbWUpLnRvRGF0ZSgpO1xyXG4gICAgICAgICAgICBsZXQgZW5kVGltZSA9IHV0YyhsaWdodG5pbmdQYXJhbWV0ZXJzLkVuZFRpbWUpLnRvRGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFsaW5lS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVUYWJsZShub0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsaWdodG5pbmdRdWVyeS5xdWVyeUxpbmVHZW9tZXRyeShsaW5lS2V5LCBsaW5lR2VvbWV0cnkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGlnaHRuaW5nUXVlcnkucXVlcnlMaW5lQnVmZmVyR2VvbWV0cnkobGluZUdlb21ldHJ5LCBsaW5lQnVmZmVyR2VvbWV0cnkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpZ2h0bmluZ1F1ZXJ5LnF1ZXJ5TGlnaHRuaW5nRGF0YShsaW5lQnVmZmVyR2VvbWV0cnksIHN0YXJ0VGltZSwgZW5kVGltZSwgbGlnaHRuaW5nRGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXNwbGF5RGF0YSA9IChsaWdodG5pbmdEYXRhLmxlbmd0aCAhPT0gMCkgPyBsaWdodG5pbmdEYXRhIDogbm9EYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVUYWJsZShkaXNwbGF5RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZXJySGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB9LCBlcnJIYW5kbGVyKTtcclxuICAgICAgICAgICAgfSwgZXJySGFuZGxlcik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBoYW5kbGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxXaWRnZXRXaW5kb3cgc2hvdz17cHJvcHMuaXNPcGVufSBjbG9zZT17cHJvcHMuY2xvc2VDYWxsYmFja30gbWF4SGVpZ2h0PXs1MDB9IHdpZHRoPXs4MDB9PlxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInRhYmxlXCIgc3R5bGU9e3sgZm9udFNpemU6ICdzbWFsbCcsIG1hcmdpbkJvdHRvbTogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQgc3R5bGU9e3sgZGlzcGxheTogJ3RhYmxlJywgdGFibGVMYXlvdXQ6ICdmaXhlZCcsIHdpZHRoOiAnY2FsYygxMDAlIC0gMWVtKScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0YmxEYXRhWzBdfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5IHN0eWxlPXt7IG1heEhlaWdodDogNDEwLCBvdmVyZmxvd1k6ICdhdXRvJywgZGlzcGxheTogJ2Jsb2NrJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3RibERhdGEuc2xpY2UoMSl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgPC9XaWRnZXRXaW5kb3c+XHJcbiAgICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMaWdodG5pbmdEYXRhV2lkZ2V0O1xyXG5cclxuIiwiaW1wb3J0IHsgVHlwZVN0eWxlIH0gZnJvbSAnLi9pbnRlcm5hbC90eXBlc3R5bGUnO1xyXG5leHBvcnQgeyBUeXBlU3R5bGUgfTtcclxuLyoqXHJcbiAqIEFsbCB0aGUgQ1NTIHR5cGVzIGluIHRoZSAndHlwZXMnIG5hbWVzcGFjZVxyXG4gKi9cclxuaW1wb3J0ICogYXMgdHlwZXMgZnJvbSAnLi90eXBlcyc7XHJcbmV4cG9ydCB7IHR5cGVzIH07XHJcbi8qKlxyXG4gKiBFeHBvcnQgY2VydGFpbiB1dGlsaXRpZXNcclxuICovXHJcbmV4cG9ydCB7IGV4dGVuZCwgY2xhc3NlcywgbWVkaWEgfSBmcm9tICcuL2ludGVybmFsL3V0aWxpdGllcyc7XHJcbi8qKiBaZXJvIGNvbmZpZ3VyYXRpb24sIGRlZmF1bHQgaW5zdGFuY2Ugb2YgVHlwZVN0eWxlICovXHJcbnZhciB0cyA9IG5ldyBUeXBlU3R5bGUoeyBhdXRvR2VuZXJhdGVUYWc6IHRydWUgfSk7XHJcbi8qKiBTZXRzIHRoZSB0YXJnZXQgdGFnIHdoZXJlIHdlIHdyaXRlIHRoZSBjc3Mgb24gc3R5bGUgdXBkYXRlcyAqL1xyXG5leHBvcnQgdmFyIHNldFN0eWxlc1RhcmdldCA9IHRzLnNldFN0eWxlc1RhcmdldDtcclxuLyoqXHJcbiAqIEluc2VydCBgcmF3YCBDU1MgYXMgYSBzdHJpbmcuIFRoaXMgaXMgdXNlZnVsIGZvciBlLmcuXHJcbiAqIC0gdGhpcmQgcGFydHkgQ1NTIHRoYXQgeW91IGFyZSBjdXN0b21pemluZyB3aXRoIHRlbXBsYXRlIHN0cmluZ3NcclxuICogLSBnZW5lcmF0aW5nIHJhdyBDU1MgaW4gSmF2YVNjcmlwdFxyXG4gKiAtIHJlc2V0IGxpYnJhcmllcyBsaWtlIG5vcm1hbGl6ZS5jc3MgdGhhdCB5b3UgY2FuIHVzZSB3aXRob3V0IGxvYWRlcnNcclxuICovXHJcbmV4cG9ydCB2YXIgY3NzUmF3ID0gdHMuY3NzUmF3O1xyXG4vKipcclxuICogVGFrZXMgQ1NTUHJvcGVydGllcyBhbmQgcmVnaXN0ZXJzIGl0IHRvIGEgZ2xvYmFsIHNlbGVjdG9yIChib2R5LCBodG1sLCBldGMuKVxyXG4gKi9cclxuZXhwb3J0IHZhciBjc3NSdWxlID0gdHMuY3NzUnVsZTtcclxuLyoqXHJcbiAqIFJlbmRlcnMgc3R5bGVzIHRvIHRoZSBzaW5nbGV0b24gdGFnIGltZWRpYXRlbHlcclxuICogTk9URTogWW91IHNob3VsZCBvbmx5IGNhbGwgaXQgb24gaW5pdGlhbCByZW5kZXIgdG8gcHJldmVudCBhbnkgbm9uIENTUyBmbGFzaC5cclxuICogQWZ0ZXIgdGhhdCBpdCBpcyBrZXB0IHN5bmMgdXNpbmcgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgYW5kIHdlIGhhdmVuJ3Qgbm90aWNlZCBhbnkgYmFkIGZsYXNoZXMuXHJcbiAqKi9cclxuZXhwb3J0IHZhciBmb3JjZVJlbmRlclN0eWxlcyA9IHRzLmZvcmNlUmVuZGVyU3R5bGVzO1xyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiB0byByZWdpc3RlciBhbiBAZm9udC1mYWNlXHJcbiAqL1xyXG5leHBvcnQgdmFyIGZvbnRGYWNlID0gdHMuZm9udEZhY2U7XHJcbi8qKlxyXG4gKiBBbGxvd3MgdXNlIHRvIHVzZSB0aGUgc3R5bGVzaGVldCBpbiBhIG5vZGUuanMgZW52aXJvbm1lbnRcclxuICovXHJcbmV4cG9ydCB2YXIgZ2V0U3R5bGVzID0gdHMuZ2V0U3R5bGVzO1xyXG4vKipcclxuICogVGFrZXMga2V5ZnJhbWVzIGFuZCByZXR1cm5zIGEgZ2VuZXJhdGVkIGFuaW1hdGlvbk5hbWVcclxuICovXHJcbmV4cG9ydCB2YXIga2V5ZnJhbWVzID0gdHMua2V5ZnJhbWVzO1xyXG4vKipcclxuICogSGVscHMgd2l0aCB0ZXN0aW5nLiBSZWluaXRpYWxpemVzIEZyZWVTdHlsZSArIHJhd1xyXG4gKi9cclxuZXhwb3J0IHZhciByZWluaXQgPSB0cy5yZWluaXQ7XHJcbi8qKlxyXG4gKiBUYWtlcyBDU1NQcm9wZXJ0aWVzIGFuZCByZXR1cm4gYSBnZW5lcmF0ZWQgY2xhc3NOYW1lIHlvdSBjYW4gdXNlIG9uIHlvdXIgY29tcG9uZW50XHJcbiAqL1xyXG5leHBvcnQgdmFyIHN0eWxlID0gdHMuc3R5bGU7XHJcbi8qKlxyXG4gKiBUYWtlcyBhbiBvYmplY3Qgd2hlcmUgcHJvcGVydHkgbmFtZXMgYXJlIGlkZWFsIGNsYXNzIG5hbWVzIGFuZCBwcm9wZXJ0eSB2YWx1ZXMgYXJlIENTU1Byb3BlcnRpZXMsIGFuZFxyXG4gKiByZXR1cm5zIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgdGhlIHNhbWUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHRoZSBwcm9wZXJ0eSB2YWx1ZXMgYXJlXHJcbiAqIHRoZSBhY3R1YWwgZ2VuZXJhdGVkIGNsYXNzIG5hbWVzIHVzaW5nIHRoZSBpZGVhbCBjbGFzcyBuYW1lIGFzIHRoZSAkZGVidWdOYW1lXHJcbiAqL1xyXG5leHBvcnQgdmFyIHN0eWxlc2hlZXQgPSB0cy5zdHlsZXNoZWV0O1xyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBUeXBlU3R5bGUgc2VwYXJhdGUgZnJvbSB0aGUgZGVmYXVsdCBpbnN0YW5jZS5cclxuICpcclxuICogLSBVc2UgdGhpcyBmb3IgY3JlYXRpbmcgYSBkaWZmZXJlbnQgdHlwZXN0eWxlIGluc3RhbmNlIGZvciBhIHNoYWRvdyBkb20gY29tcG9uZW50LlxyXG4gKiAtIFVzZSB0aGlzIGlmIHlvdSBkb24ndCB3YW50IGFuIGF1dG8gdGFnIGdlbmVyYXRlZCBhbmQgeW91IGp1c3Qgd2FudCB0byBjb2xsZWN0IHRoZSBDU1MuXHJcbiAqXHJcbiAqIE5PVEU6IHN0eWxlcyBhcmVuJ3Qgc2hhcmVkIGJldHdlZW4gZGlmZmVyZW50IGluc3RhbmNlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUeXBlU3R5bGUodGFyZ2V0KSB7XHJcbiAgICB2YXIgaW5zdGFuY2UgPSBuZXcgVHlwZVN0eWxlKHsgYXV0b0dlbmVyYXRlVGFnOiBmYWxzZSB9KTtcclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBpbnN0YW5jZS5zZXRTdHlsZXNUYXJnZXQodGFyZ2V0KTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBGcmVlU3R5bGUgZnJvbSAnZnJlZS1zdHlsZSc7XHJcbi8qKlxyXG4gKiBXZSBuZWVkIHRvIGRvIHRoZSBmb2xsb3dpbmcgdG8gKm91ciogb2JqZWN0cyBiZWZvcmUgcGFzc2luZyB0byBmcmVlc3R5bGU6XHJcbiAqIC0gRm9yIGFueSBgJG5lc3RgIGRpcmVjdGl2ZSBtb3ZlIHVwIHRvIEZyZWVTdHlsZSBzdHlsZSBuZXN0aW5nXHJcbiAqIC0gRm9yIGFueSBgJHVuaXF1ZWAgZGlyZWN0aXZlIG1hcCB0byBGcmVlU3R5bGUgVW5pcXVlXHJcbiAqIC0gRm9yIGFueSBgJGRlYnVnTmFtZWAgZGlyZWN0aXZlIHJldHVybiB0aGUgZGVidWcgbmFtZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVN0cmluZ09iaihvYmplY3QpIHtcclxuICAgIC8qKiBUaGUgZmluYWwgcmVzdWx0IHdlIHdpbGwgcmV0dXJuICovXHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICB2YXIgZGVidWdOYW1lID0gJyc7XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgLyoqIEdyYWIgdGhlIHZhbHVlIHVwZnJvbnQgKi9cclxuICAgICAgICB2YXIgdmFsID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgLyoqIFR5cGVTdHlsZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgKi9cclxuICAgICAgICBpZiAoa2V5ID09PSAnJHVuaXF1ZScpIHtcclxuICAgICAgICAgICAgcmVzdWx0W0ZyZWVTdHlsZS5JU19VTklRVUVdID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICckbmVzdCcpIHtcclxuICAgICAgICAgICAgdmFyIG5lc3RlZCA9IHZhbDtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0b3IgaW4gbmVzdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3VicHJvcGVydGllcyA9IG5lc3RlZFtzZWxlY3Rvcl07XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbc2VsZWN0b3JdID0gZW5zdXJlU3RyaW5nT2JqKHN1YnByb3BlcnRpZXMpLnJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICckZGVidWdOYW1lJykge1xyXG4gICAgICAgICAgICBkZWJ1Z05hbWUgPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHJlc3VsdCwgZGVidWdOYW1lOiBkZWJ1Z05hbWUgfTtcclxufVxyXG4vLyB0b2RvOiBiZXR0ZXIgbmFtZSBoZXJlXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBsb2RlS2V5ZnJhbWVzKGZyYW1lcykge1xyXG4gICAgdmFyIHJlc3VsdCA9IHsgJGRlYnVnTmFtZTogdW5kZWZpbmVkLCBrZXlmcmFtZXM6IHt9IH07XHJcbiAgICBmb3IgKHZhciBvZmZzZXQgaW4gZnJhbWVzKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IGZyYW1lc1tvZmZzZXRdO1xyXG4gICAgICAgIGlmIChvZmZzZXQgPT09ICckZGVidWdOYW1lJykge1xyXG4gICAgICAgICAgICByZXN1bHQuJGRlYnVnTmFtZSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5rZXlmcmFtZXNbb2Zmc2V0XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbiIsImltcG9ydCAqIGFzIEZyZWVTdHlsZSBmcm9tIFwiZnJlZS1zdHlsZVwiO1xyXG5pbXBvcnQgeyBlbnN1cmVTdHJpbmdPYmosIGV4cGxvZGVLZXlmcmFtZXMgfSBmcm9tICcuL2Zvcm1hdHRpbmcnO1xyXG5pbXBvcnQgeyBleHRlbmQsIHJhZiB9IGZyb20gJy4vdXRpbGl0aWVzJztcclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZnJlZSBzdHlsZSB3aXRoIG91ciBvcHRpb25zXHJcbiAqL1xyXG52YXIgY3JlYXRlRnJlZVN0eWxlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gRnJlZVN0eWxlLmNyZWF0ZShcclxuLyoqIFVzZSB0aGUgZGVmYXVsdCBoYXNoIGZ1bmN0aW9uICovXHJcbnVuZGVmaW5lZCwgXHJcbi8qKiBQcmVzZXJ2ZSAkZGVidWdOYW1lIHZhbHVlcyAqL1xyXG50cnVlKTsgfTtcclxuLyoqXHJcbiAqIE1haW50YWlucyBhIHNpbmdsZSBzdHlsZXNoZWV0IGFuZCBrZWVwcyBpdCBpbiBzeW5jIHdpdGggcmVxdWVzdGVkIHN0eWxlc1xyXG4gKi9cclxudmFyIFR5cGVTdHlsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFR5cGVTdHlsZShfYSkge1xyXG4gICAgICAgIHZhciBhdXRvR2VuZXJhdGVUYWcgPSBfYS5hdXRvR2VuZXJhdGVUYWc7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbnNlcnQgYHJhd2AgQ1NTIGFzIGEgc3RyaW5nLiBUaGlzIGlzIHVzZWZ1bCBmb3IgZS5nLlxyXG4gICAgICAgICAqIC0gdGhpcmQgcGFydHkgQ1NTIHRoYXQgeW91IGFyZSBjdXN0b21pemluZyB3aXRoIHRlbXBsYXRlIHN0cmluZ3NcclxuICAgICAgICAgKiAtIGdlbmVyYXRpbmcgcmF3IENTUyBpbiBKYXZhU2NyaXB0XHJcbiAgICAgICAgICogLSByZXNldCBsaWJyYXJpZXMgbGlrZSBub3JtYWxpemUuY3NzIHRoYXQgeW91IGNhbiB1c2Ugd2l0aG91dCBsb2FkZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jc3NSYXcgPSBmdW5jdGlvbiAobXVzdEJlVmFsaWRDU1MpIHtcclxuICAgICAgICAgICAgaWYgKCFtdXN0QmVWYWxpZENTUykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9yYXcgKz0gbXVzdEJlVmFsaWRDU1MgfHwgJyc7XHJcbiAgICAgICAgICAgIF90aGlzLl9wZW5kaW5nUmF3Q2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgX3RoaXMuX3N0eWxlVXBkYXRlZCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMgQ1NTUHJvcGVydGllcyBhbmQgcmVnaXN0ZXJzIGl0IHRvIGEgZ2xvYmFsIHNlbGVjdG9yIChib2R5LCBodG1sLCBldGMuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY3NzUnVsZSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgb2JqZWN0c1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0gZW5zdXJlU3RyaW5nT2JqKGV4dGVuZC5hcHBseSh2b2lkIDAsIG9iamVjdHMpKS5yZXN1bHQ7XHJcbiAgICAgICAgICAgIF90aGlzLl9mcmVlU3R5bGUucmVnaXN0ZXJSdWxlKHNlbGVjdG9yLCBvYmplY3QpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbmRlcnMgc3R5bGVzIHRvIHRoZSBzaW5nbGV0b24gdGFnIGltZWRpYXRlbHlcclxuICAgICAgICAgKiBOT1RFOiBZb3Ugc2hvdWxkIG9ubHkgY2FsbCBpdCBvbiBpbml0aWFsIHJlbmRlciB0byBwcmV2ZW50IGFueSBub24gQ1NTIGZsYXNoLlxyXG4gICAgICAgICAqIEFmdGVyIHRoYXQgaXQgaXMga2VwdCBzeW5jIHVzaW5nIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGFuZCB3ZSBoYXZlbid0IG5vdGljZWQgYW55IGJhZCBmbGFzaGVzLlxyXG4gICAgICAgICAqKi9cclxuICAgICAgICB0aGlzLmZvcmNlUmVuZGVyU3R5bGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gX3RoaXMuX2dldFRhZygpO1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRhcmdldC50ZXh0Q29udGVudCA9IF90aGlzLmdldFN0eWxlcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXRpbGl0eSBmdW5jdGlvbiB0byByZWdpc3RlciBhbiBAZm9udC1mYWNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5mb250RmFjZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGZvbnRGYWNlID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb250RmFjZVtfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBmcmVlU3R5bGUgPSBfdGhpcy5fZnJlZVN0eWxlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIF9iID0gZm9udEZhY2U7IF9hIDwgX2IubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmFjZSA9IF9iW19hXTtcclxuICAgICAgICAgICAgICAgIGZyZWVTdHlsZS5yZWdpc3RlclJ1bGUoJ0Bmb250LWZhY2UnLCBmYWNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsbG93cyB1c2UgdG8gdXNlIHRoZSBzdHlsZXNoZWV0IGluIGEgbm9kZS5qcyBlbnZpcm9ubWVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZ2V0U3R5bGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKF90aGlzLl9yYXcgfHwgJycpICsgX3RoaXMuX2ZyZWVTdHlsZS5nZXRTdHlsZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRha2VzIGtleWZyYW1lcyBhbmQgcmV0dXJucyBhIGdlbmVyYXRlZCBhbmltYXRpb25OYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5rZXlmcmFtZXMgPSBmdW5jdGlvbiAoZnJhbWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBfYSA9IGV4cGxvZGVLZXlmcmFtZXMoZnJhbWVzKSwga2V5ZnJhbWVzID0gX2Eua2V5ZnJhbWVzLCAkZGVidWdOYW1lID0gX2EuJGRlYnVnTmFtZTtcclxuICAgICAgICAgICAgLy8gVE9ETzogcmVwbGFjZSAkZGVidWdOYW1lIHdpdGggZGlzcGxheSBuYW1lXHJcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25OYW1lID0gX3RoaXMuX2ZyZWVTdHlsZS5yZWdpc3RlcktleWZyYW1lcyhrZXlmcmFtZXMsICRkZWJ1Z05hbWUpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25OYW1lO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGVscHMgd2l0aCB0ZXN0aW5nLiBSZWluaXRpYWxpemVzIEZyZWVTdHlsZSArIHJhd1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucmVpbml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvKiogcmVpbml0IGZyZWVzdHlsZSAqL1xyXG4gICAgICAgICAgICB2YXIgZnJlZVN0eWxlID0gY3JlYXRlRnJlZVN0eWxlKCk7XHJcbiAgICAgICAgICAgIF90aGlzLl9mcmVlU3R5bGUgPSBmcmVlU3R5bGU7XHJcbiAgICAgICAgICAgIF90aGlzLl9sYXN0RnJlZVN0eWxlQ2hhbmdlSWQgPSBmcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgICAgIC8qKiByZWluaXQgcmF3ICovXHJcbiAgICAgICAgICAgIF90aGlzLl9yYXcgPSAnJztcclxuICAgICAgICAgICAgX3RoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgLyoqIENsZWFyIGFueSBzdHlsZXMgdGhhdCB3ZXJlIGZsdXNoZWQgKi9cclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IF90aGlzLl9nZXRUYWcoKTtcclxuICAgICAgICAgICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKiBTZXRzIHRoZSB0YXJnZXQgdGFnIHdoZXJlIHdlIHdyaXRlIHRoZSBjc3Mgb24gc3R5bGUgdXBkYXRlcyAqL1xyXG4gICAgICAgIHRoaXMuc2V0U3R5bGVzVGFyZ2V0ID0gZnVuY3Rpb24gKHRhZykge1xyXG4gICAgICAgICAgICAvKiogQ2xlYXIgYW55IGRhdGEgaW4gYW55IHByZXZpb3VzIHRhZyAqL1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMuX3RhZykge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX3RhZy50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl90YWcgPSB0YWc7XHJcbiAgICAgICAgICAgIC8qKiBUaGlzIHNwZWNpYWwgdGltZSBidWZmZXIgaW1tZWRpYXRlbHkgKi9cclxuICAgICAgICAgICAgX3RoaXMuZm9yY2VSZW5kZXJTdHlsZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRha2VzIGFuIG9iamVjdCB3aGVyZSBwcm9wZXJ0eSBuYW1lcyBhcmUgaWRlYWwgY2xhc3MgbmFtZXMgYW5kIHByb3BlcnR5IHZhbHVlcyBhcmUgQ1NTUHJvcGVydGllcywgYW5kXHJcbiAgICAgICAgICogcmV0dXJucyBhbiBvYmplY3Qgd2hlcmUgcHJvcGVydHkgbmFtZXMgYXJlIHRoZSBzYW1lIGlkZWFsIGNsYXNzIG5hbWVzIGFuZCB0aGUgcHJvcGVydHkgdmFsdWVzIGFyZVxyXG4gICAgICAgICAqIHRoZSBhY3R1YWwgZ2VuZXJhdGVkIGNsYXNzIG5hbWVzIHVzaW5nIHRoZSBpZGVhbCBjbGFzcyBuYW1lIGFzIHRoZSAkZGVidWdOYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0ID0gZnVuY3Rpb24gKGNsYXNzZXMpIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjbGFzc2VzKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGNsYXNzTmFtZXNfMSA9IGNsYXNzTmFtZXM7IF9pIDwgY2xhc3NOYW1lc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzTmFtZXNfMVtfaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NEZWYgPSBjbGFzc2VzW2NsYXNzTmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xhc3NEZWYpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc0RlZi4kZGVidWdOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjbGFzc05hbWVdID0gX3RoaXMuc3R5bGUoY2xhc3NEZWYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZnJlZVN0eWxlID0gY3JlYXRlRnJlZVN0eWxlKCk7XHJcbiAgICAgICAgdGhpcy5fYXV0b0dlbmVyYXRlVGFnID0gYXV0b0dlbmVyYXRlVGFnO1xyXG4gICAgICAgIHRoaXMuX2ZyZWVTdHlsZSA9IGZyZWVTdHlsZTtcclxuICAgICAgICB0aGlzLl9sYXN0RnJlZVN0eWxlQ2hhbmdlSWQgPSBmcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZyA9IDA7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3JhdyA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3RhZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAvLyByZWJpbmQgcHJvdG90eXBlIHRvIFR5cGVTdHlsZS4gIEl0IG1pZ2h0IGJlIGJldHRlciB0byBkbyBhIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5zdHlsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpfVxyXG4gICAgICAgIHRoaXMuc3R5bGUgPSB0aGlzLnN0eWxlLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE9ubHkgY2FsbHMgY2IgYWxsIHN5bmMgb3BlcmF0aW9ucyBzZXR0bGVcclxuICAgICAqL1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5fYWZ0ZXJBbGxTeW5jID0gZnVuY3Rpb24gKGNiKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLl9wZW5kaW5nKys7XHJcbiAgICAgICAgdmFyIHBlbmRpbmcgPSB0aGlzLl9wZW5kaW5nO1xyXG4gICAgICAgIHJhZihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwZW5kaW5nICE9PSBfdGhpcy5fcGVuZGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5fZ2V0VGFnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl90YWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9HZW5lcmF0ZVRhZykge1xyXG4gICAgICAgICAgICB2YXIgdGFnID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCdcclxuICAgICAgICAgICAgICAgID8geyB0ZXh0Q29udGVudDogJycgfVxyXG4gICAgICAgICAgICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RhZyA9IHRhZztcclxuICAgICAgICAgICAgcmV0dXJuIHRhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICAvKiogQ2hlY2tzIGlmIHRoZSBzdHlsZSB0YWcgbmVlZHMgdXBkYXRpbmcgYW5kIGlmIHNvIHF1ZXVlcyB1cCB0aGUgY2hhbmdlICovXHJcbiAgICBUeXBlU3R5bGUucHJvdG90eXBlLl9zdHlsZVVwZGF0ZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgY2hhbmdlSWQgPSB0aGlzLl9mcmVlU3R5bGUuY2hhbmdlSWQ7XHJcbiAgICAgICAgdmFyIGxhc3RDaGFuZ2VJZCA9IHRoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZDtcclxuICAgICAgICBpZiAoIXRoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgJiYgY2hhbmdlSWQgPT09IGxhc3RDaGFuZ2VJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xhc3RGcmVlU3R5bGVDaGFuZ2VJZCA9IGNoYW5nZUlkO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9hZnRlckFsbFN5bmMoZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMuZm9yY2VSZW5kZXJTdHlsZXMoKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5zdHlsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZnJlZVN0eWxlID0gdGhpcy5fZnJlZVN0eWxlO1xyXG4gICAgICAgIHZhciBfYSA9IGVuc3VyZVN0cmluZ09iaihleHRlbmQuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKSwgcmVzdWx0ID0gX2EucmVzdWx0LCBkZWJ1Z05hbWUgPSBfYS5kZWJ1Z05hbWU7XHJcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGRlYnVnTmFtZSA/IGZyZWVTdHlsZS5yZWdpc3RlclN0eWxlKHJlc3VsdCwgZGVidWdOYW1lKSA6IGZyZWVTdHlsZS5yZWdpc3RlclN0eWxlKHJlc3VsdCk7XHJcbiAgICAgICAgdGhpcy5fc3R5bGVVcGRhdGVkKCk7XHJcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVHlwZVN0eWxlO1xyXG59KCkpO1xyXG5leHBvcnQgeyBUeXBlU3R5bGUgfTtcclxuIiwiLyoqIFJhZiBmb3Igbm9kZSArIGJyb3dzZXIgKi9cclxuZXhwb3J0IHZhciByYWYgPSB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSAndW5kZWZpbmVkJ1xyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHN1cmUgc2V0VGltZW91dCBpcyBhbHdheXMgaW52b2tlZCB3aXRoXHJcbiAgICAgKiBgdGhpc2Agc2V0IHRvIGB3aW5kb3dgIG9yIGBnbG9iYWxgIGF1dG9tYXRpY2FsbHlcclxuICAgICAqKi9cclxuICAgID8gZnVuY3Rpb24gKGNiKSB7IHJldHVybiBzZXRUaW1lb3V0KGNiKTsgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHN1cmUgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSBpcyBhbHdheXMgaW52b2tlZCB3aXRoIGB0aGlzYCB3aW5kb3dcclxuICAgICAqIFdlIG1pZ2h0IGhhdmUgcmFmIHdpdGhvdXQgd2luZG93IGluIGNhc2Ugb2YgYHJhZi9wb2x5ZmlsbGAgKHJlY29tbWVuZGVkIGJ5IFJlYWN0KVxyXG4gICAgICoqL1xyXG4gICAgOiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xyXG4gICAgICAgID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbiAgICAgICAgOiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpO1xyXG4vKipcclxuICogVXRpbGl0eSB0byBqb2luIGNsYXNzZXMgY29uZGl0aW9uYWxseVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzZXMoKSB7XHJcbiAgICB2YXIgY2xhc3NlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBjbGFzc2VzW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2xhc3Nlcy5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuICEhYzsgfSkuam9pbignICcpO1xyXG59XHJcbi8qKlxyXG4gKiBNZXJnZXMgdmFyaW91cyBzdHlsZXMgaW50byBhIHNpbmdsZSBzdHlsZSBvYmplY3QuXHJcbiAqIE5vdGU6IGlmIHR3byBvYmplY3RzIGhhdmUgdGhlIHNhbWUgcHJvcGVydHkgdGhlIGxhc3Qgb25lIHdpbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoKSB7XHJcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBvYmplY3RzW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICAvKiogVGhlIGZpbmFsIHJlc3VsdCB3ZSB3aWxsIHJldHVybiAqL1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgX2EgPSAwLCBvYmplY3RzXzEgPSBvYmplY3RzOyBfYSA8IG9iamVjdHNfMS5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICB2YXIgb2JqZWN0ID0gb2JqZWN0c18xW19hXTtcclxuICAgICAgICBpZiAob2JqZWN0ID09IG51bGwgfHwgb2JqZWN0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICAvKiogRmFsc3kgdmFsdWVzIGV4Y2VwdCBhIGV4cGxpY2l0IDAgaXMgaWdub3JlZCAqL1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgICAgIGlmICghdmFsICYmIHZhbCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyoqIGlmIG5lc3RlZCBtZWRpYSBvciBwc2V1ZG8gc2VsZWN0b3IgKi9cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJyRuZXN0JyAmJiB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gcmVzdWx0WyckbmVzdCddID8gZXh0ZW5kKHJlc3VsdFsnJG5lc3QnXSwgdmFsKSA6IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgoa2V5LmluZGV4T2YoJyYnKSAhPT0gLTEgfHwga2V5LmluZGV4T2YoJ0BtZWRpYScpID09PSAwKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSByZXN1bHRba2V5XSA/IGV4dGVuZChyZXN1bHRba2V5XSwgdmFsKSA6IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vKipcclxuICogVXRpbGl0eSB0byBoZWxwIGN1c3RvbWl6ZSBzdHlsZXMgd2l0aCBtZWRpYSBxdWVyaWVzLiBlLmcuXHJcbiAqIGBgYFxyXG4gKiBzdHlsZShcclxuICogIG1lZGlhKHttYXhXaWR0aDo1MDB9LCB7Y29sb3I6J3JlZCd9KVxyXG4gKiApXHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IHZhciBtZWRpYSA9IGZ1bmN0aW9uIChtZWRpYVF1ZXJ5KSB7XHJcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBvYmplY3RzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgdmFyIG1lZGlhUXVlcnlTZWN0aW9ucyA9IFtdO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkudHlwZSlcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChtZWRpYVF1ZXJ5LnR5cGUpO1xyXG4gICAgaWYgKG1lZGlhUXVlcnkub3JpZW50YXRpb24pXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIob3JpZW50YXRpb246IFwiICsgbWVkaWFRdWVyeS5vcmllbnRhdGlvbiArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1pbldpZHRoKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1pbi13aWR0aDogXCIgKyBtZWRpYUxlbmd0aChtZWRpYVF1ZXJ5Lm1pbldpZHRoKSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1heFdpZHRoKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG1heC13aWR0aDogXCIgKyBtZWRpYUxlbmd0aChtZWRpYVF1ZXJ5Lm1heFdpZHRoKSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1pbkhlaWdodClcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihtaW4taGVpZ2h0OiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWluSGVpZ2h0KSArIFwiKVwiKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm1heEhlaWdodClcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihtYXgtaGVpZ2h0OiBcIiArIG1lZGlhTGVuZ3RoKG1lZGlhUXVlcnkubWF4SGVpZ2h0KSArIFwiKVwiKTtcclxuICAgIHZhciBzdHJpbmdNZWRpYVF1ZXJ5ID0gXCJAbWVkaWEgXCIgKyBtZWRpYVF1ZXJ5U2VjdGlvbnMuam9pbignIGFuZCAnKTtcclxuICAgIHZhciBvYmplY3QgPSB7XHJcbiAgICAgICAgJG5lc3Q6IChfYSA9IHt9LFxyXG4gICAgICAgICAgICBfYVtzdHJpbmdNZWRpYVF1ZXJ5XSA9IGV4dGVuZC5hcHBseSh2b2lkIDAsIG9iamVjdHMpLFxyXG4gICAgICAgICAgICBfYSlcclxuICAgIH07XHJcbiAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgdmFyIF9hO1xyXG59O1xyXG52YXIgbWVkaWFMZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiB2YWx1ZSArIFwicHhcIjtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBSZWFjdDsiLCJtb2R1bGUuZXhwb3J0cyA9IG1vbWVudDsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9TY3JpcHRzL1RTWC9qUXVlcnlVSSBXaWRnZXRzL0xpZ2h0bmluZ0RhdGEudHN4XCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9