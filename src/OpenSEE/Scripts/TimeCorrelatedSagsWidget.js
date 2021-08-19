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

/***/ "./Scripts/TSX/jQueryUI Widgets/TimeCorrelatedSags.tsx":
/*!*************************************************************!*\
  !*** ./Scripts/TSX/jQueryUI Widgets/TimeCorrelatedSags.tsx ***!
  \*************************************************************/
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
var React = __importStar(__webpack_require__(/*! react */ "react"));
var Common_1 = __webpack_require__(/*! ./Common */ "./Scripts/TSX/jQueryUI Widgets/Common.tsx");
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
/******/ 	var __webpack_exports__ = __webpack_require__("./Scripts/TSX/jQueryUI Widgets/TimeCorrelatedSags.tsx");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkOzs7Ozs7Ozs7O0FDMWNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUNPO0FBQ1A7QUFDQSxxQkFBcUIsdUJBQXVCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakdBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5zZWUvLi9ub2RlX21vZHVsZXMvZnJlZS1zdHlsZS9kaXN0L2ZyZWUtc3R5bGUuanMiLCJ3ZWJwYWNrOi8vb3BlbnNlZS8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vb3BlbnNlZS8uL1NjcmlwdHMvVFNYL2pRdWVyeVVJIFdpZGdldHMvQ29tbW9uLnRzeCIsIndlYnBhY2s6Ly9vcGVuc2VlLy4vU2NyaXB0cy9UU1gvalF1ZXJ5VUkgV2lkZ2V0cy9UaW1lQ29ycmVsYXRlZFNhZ3MudHN4Iiwid2VicGFjazovL29wZW5zZWUvLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vb3BlbnNlZS8uL25vZGVfbW9kdWxlcy90eXBlc3R5bGUvbGliLmVzMjAxNS9pbnRlcm5hbC9mb3JtYXR0aW5nLmpzIiwid2VicGFjazovL29wZW5zZWUvLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvdHlwZXN0eWxlLmpzIiwid2VicGFjazovL29wZW5zZWUvLi9ub2RlX21vZHVsZXMvdHlwZXN0eWxlL2xpYi5lczIwMTUvaW50ZXJuYWwvdXRpbGl0aWVzLmpzIiwid2VicGFjazovL29wZW5zZWUvZXh0ZXJuYWwgXCJSZWFjdFwiIiwid2VicGFjazovL29wZW5zZWUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb3BlbnNlZS93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9vcGVuc2VlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vcGVuc2VlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vb3BlbnNlZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29wZW5zZWUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9vcGVuc2VlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9vcGVuc2VlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBUaGUgdW5pcXVlIGlkIGlzIHVzZWQgZm9yIHVuaXF1ZSBoYXNoZXMuXG4gKi9cbnZhciB1bmlxdWVJZCA9IDA7XG4vKipcbiAqIFRhZyBzdHlsZXMgd2l0aCB0aGlzIHN0cmluZyB0byBnZXQgdW5pcXVlIGhhc2hlcy5cbiAqL1xuZXhwb3J0cy5JU19VTklRVUUgPSAnX19ET19OT1RfREVEVVBFX1NUWUxFX18nO1xudmFyIHVwcGVyQ2FzZVBhdHRlcm4gPSAvW0EtWl0vZztcbnZhciBtc1BhdHRlcm4gPSAvXm1zLS87XG52YXIgaW50ZXJwb2xhdGVQYXR0ZXJuID0gLyYvZztcbnZhciBlc2NhcGVQYXR0ZXJuID0gL1sgISMkJSYoKSorLC4vOzw9Pj9AW1xcXV5ge3x9flwiJ1xcXFxdL2c7XG52YXIgcHJvcExvd2VyID0gZnVuY3Rpb24gKG0pIHsgcmV0dXJuIFwiLVwiICsgbS50b0xvd2VyQ2FzZSgpOyB9O1xuLyoqXG4gKiBDU1MgcHJvcGVydGllcyB0aGF0IGFyZSB2YWxpZCB1bml0LWxlc3MgbnVtYmVycy5cbiAqL1xudmFyIGNzc051bWJlclByb3BlcnRpZXMgPSBbXG4gICAgJ2FuaW1hdGlvbi1pdGVyYXRpb24tY291bnQnLFxuICAgICdib3gtZmxleCcsXG4gICAgJ2JveC1mbGV4LWdyb3VwJyxcbiAgICAnY29sdW1uLWNvdW50JyxcbiAgICAnY291bnRlci1pbmNyZW1lbnQnLFxuICAgICdjb3VudGVyLXJlc2V0JyxcbiAgICAnZmxleCcsXG4gICAgJ2ZsZXgtZ3JvdycsXG4gICAgJ2ZsZXgtcG9zaXRpdmUnLFxuICAgICdmbGV4LXNocmluaycsXG4gICAgJ2ZsZXgtbmVnYXRpdmUnLFxuICAgICdmb250LXdlaWdodCcsXG4gICAgJ2xpbmUtY2xhbXAnLFxuICAgICdsaW5lLWhlaWdodCcsXG4gICAgJ29wYWNpdHknLFxuICAgICdvcmRlcicsXG4gICAgJ29ycGhhbnMnLFxuICAgICd0YWItc2l6ZScsXG4gICAgJ3dpZG93cycsXG4gICAgJ3otaW5kZXgnLFxuICAgICd6b29tJyxcbiAgICAvLyBTVkcgcHJvcGVydGllcy5cbiAgICAnZmlsbC1vcGFjaXR5JyxcbiAgICAnc3Ryb2tlLWRhc2hvZmZzZXQnLFxuICAgICdzdHJva2Utb3BhY2l0eScsXG4gICAgJ3N0cm9rZS13aWR0aCdcbl07XG4vKipcbiAqIE1hcCBvZiBjc3MgbnVtYmVyIHByb3BlcnRpZXMuXG4gKi9cbnZhciBDU1NfTlVNQkVSID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbi8vIEFkZCB2ZW5kb3IgcHJlZml4ZXMgdG8gYWxsIHVuaXQtbGVzcyBwcm9wZXJ0aWVzLlxuZm9yICh2YXIgX2kgPSAwLCBfYSA9IFsnLXdlYmtpdC0nLCAnLW1zLScsICctbW96LScsICctby0nLCAnJ107IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgdmFyIHByZWZpeCA9IF9hW19pXTtcbiAgICBmb3IgKHZhciBfYiA9IDAsIGNzc051bWJlclByb3BlcnRpZXNfMSA9IGNzc051bWJlclByb3BlcnRpZXM7IF9iIDwgY3NzTnVtYmVyUHJvcGVydGllc18xLmxlbmd0aDsgX2IrKykge1xuICAgICAgICB2YXIgcHJvcGVydHkgPSBjc3NOdW1iZXJQcm9wZXJ0aWVzXzFbX2JdO1xuICAgICAgICBDU1NfTlVNQkVSW3ByZWZpeCArIHByb3BlcnR5XSA9IHRydWU7XG4gICAgfVxufVxuLyoqXG4gKiBFc2NhcGUgYSBDU1MgY2xhc3MgbmFtZS5cbiAqL1xuZXhwb3J0cy5lc2NhcGUgPSBmdW5jdGlvbiAoc3RyKSB7IHJldHVybiBzdHIucmVwbGFjZShlc2NhcGVQYXR0ZXJuLCAnXFxcXCQmJyk7IH07XG4vKipcbiAqIFRyYW5zZm9ybSBhIEphdmFTY3JpcHQgcHJvcGVydHkgaW50byBhIENTUyBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gaHlwaGVuYXRlKHByb3BlcnR5TmFtZSkge1xuICAgIHJldHVybiBwcm9wZXJ0eU5hbWVcbiAgICAgICAgLnJlcGxhY2UodXBwZXJDYXNlUGF0dGVybiwgcHJvcExvd2VyKVxuICAgICAgICAucmVwbGFjZShtc1BhdHRlcm4sICctbXMtJyk7IC8vIEludGVybmV0IEV4cGxvcmVyIHZlbmRvciBwcmVmaXguXG59XG5leHBvcnRzLmh5cGhlbmF0ZSA9IGh5cGhlbmF0ZTtcbi8qKlxuICogR2VuZXJhdGUgYSBoYXNoIHZhbHVlIGZyb20gYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ0hhc2goc3RyKSB7XG4gICAgdmFyIHZhbHVlID0gNTM4MTtcbiAgICB2YXIgbGVuID0gc3RyLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuLS0pXG4gICAgICAgIHZhbHVlID0gKHZhbHVlICogMzMpIF4gc3RyLmNoYXJDb2RlQXQobGVuKTtcbiAgICByZXR1cm4gKHZhbHVlID4+PiAwKS50b1N0cmluZygzNik7XG59XG5leHBvcnRzLnN0cmluZ0hhc2ggPSBzdHJpbmdIYXNoO1xuLyoqXG4gKiBUcmFuc2Zvcm0gYSBzdHlsZSBzdHJpbmcgdG8gYSBDU1Mgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBzdHlsZVRvU3RyaW5nKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiB2YWx1ZSAhPT0gMCAmJiAhQ1NTX05VTUJFUltrZXldKSB7XG4gICAgICAgIHJldHVybiBrZXkgKyBcIjpcIiArIHZhbHVlICsgXCJweFwiO1xuICAgIH1cbiAgICByZXR1cm4ga2V5ICsgXCI6XCIgKyB2YWx1ZTtcbn1cbi8qKlxuICogU29ydCBhbiBhcnJheSBvZiB0dXBsZXMgYnkgZmlyc3QgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHNvcnRUdXBsZXModmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYVswXSA+IGJbMF0gPyAxIDogLTE7IH0pO1xufVxuLyoqXG4gKiBDYXRlZ29yaXplIHVzZXIgc3R5bGVzLlxuICovXG5mdW5jdGlvbiBwYXJzZVN0eWxlcyhzdHlsZXMsIGhhc05lc3RlZFN0eWxlcykge1xuICAgIHZhciBwcm9wZXJ0aWVzID0gW107XG4gICAgdmFyIG5lc3RlZFN0eWxlcyA9IFtdO1xuICAgIHZhciBpc1VuaXF1ZSA9IGZhbHNlO1xuICAgIC8vIFNvcnQga2V5cyBiZWZvcmUgYWRkaW5nIHRvIHN0eWxlcy5cbiAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoc3R5bGVzKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcbiAgICAgICAgdmFyIHZhbHVlID0gc3R5bGVzW2tleV07XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBleHBvcnRzLklTX1VOSVFVRSkge1xuICAgICAgICAgICAgICAgIGlzVW5pcXVlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkU3R5bGVzLnB1c2goW2tleS50cmltKCksIHZhbHVlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2goW2h5cGhlbmF0ZShrZXkudHJpbSgpKSwgdmFsdWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzdHlsZVN0cmluZzogc3RyaW5naWZ5UHJvcGVydGllcyhzb3J0VHVwbGVzKHByb3BlcnRpZXMpKSxcbiAgICAgICAgbmVzdGVkU3R5bGVzOiBoYXNOZXN0ZWRTdHlsZXMgPyBuZXN0ZWRTdHlsZXMgOiBzb3J0VHVwbGVzKG5lc3RlZFN0eWxlcyksXG4gICAgICAgIGlzVW5pcXVlOiBpc1VuaXF1ZVxuICAgIH07XG59XG4vKipcbiAqIFN0cmluZ2lmeSBhbiBhcnJheSBvZiBwcm9wZXJ0eSB0dXBsZXMuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIHJldHVybiBwcm9wZXJ0aWVzLm1hcChmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBfYVswXSwgdmFsdWUgPSBfYVsxXTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgICAgIHJldHVybiBzdHlsZVRvU3RyaW5nKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4gc3R5bGVUb1N0cmluZyhuYW1lLCB4KTsgfSkuam9pbignOycpO1xuICAgIH0pLmpvaW4oJzsnKTtcbn1cbi8qKlxuICogSW50ZXJwb2xhdGUgQ1NTIHNlbGVjdG9ycy5cbiAqL1xuZnVuY3Rpb24gaW50ZXJwb2xhdGUoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgIGlmIChzZWxlY3Rvci5pbmRleE9mKCcmJykgPiAtMSkge1xuICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVwbGFjZShpbnRlcnBvbGF0ZVBhdHRlcm4sIHBhcmVudCk7XG4gICAgfVxuICAgIHJldHVybiBwYXJlbnQgKyBcIiBcIiArIHNlbGVjdG9yO1xufVxuLyoqXG4gKiBSZWN1cnNpdmUgbG9vcCBidWlsZGluZyBzdHlsZXMgd2l0aCBkZWZlcnJlZCBzZWxlY3RvcnMuXG4gKi9cbmZ1bmN0aW9uIHN0eWxpemUoY2FjaGUsIHNlbGVjdG9yLCBzdHlsZXMsIGxpc3QsIHBhcmVudCkge1xuICAgIHZhciBfYSA9IHBhcnNlU3R5bGVzKHN0eWxlcywgISFzZWxlY3RvciksIHN0eWxlU3RyaW5nID0gX2Euc3R5bGVTdHJpbmcsIG5lc3RlZFN0eWxlcyA9IF9hLm5lc3RlZFN0eWxlcywgaXNVbmlxdWUgPSBfYS5pc1VuaXF1ZTtcbiAgICB2YXIgcGlkID0gc3R5bGVTdHJpbmc7XG4gICAgaWYgKHNlbGVjdG9yLmNoYXJDb2RlQXQoMCkgPT09IDY0IC8qIEAgKi8pIHtcbiAgICAgICAgdmFyIHJ1bGUgPSBjYWNoZS5hZGQobmV3IFJ1bGUoc2VsZWN0b3IsIHBhcmVudCA/IHVuZGVmaW5lZCA6IHN0eWxlU3RyaW5nLCBjYWNoZS5oYXNoKSk7XG4gICAgICAgIC8vIE5lc3RlZCBzdHlsZXMgc3VwcG9ydCAoZS5nLiBgLmZvbyA+IEBtZWRpYSA+IC5iYXJgKS5cbiAgICAgICAgaWYgKHN0eWxlU3RyaW5nICYmIHBhcmVudCkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gcnVsZS5hZGQobmV3IFN0eWxlKHN0eWxlU3RyaW5nLCBydWxlLmhhc2gsIGlzVW5pcXVlID8gXCJ1XCIgKyAoKyt1bmlxdWVJZCkudG9TdHJpbmcoMzYpIDogdW5kZWZpbmVkKSk7XG4gICAgICAgICAgICBsaXN0LnB1c2goW3BhcmVudCwgc3R5bGVdKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIG5lc3RlZFN0eWxlc18xID0gbmVzdGVkU3R5bGVzOyBfaSA8IG5lc3RlZFN0eWxlc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIF9iID0gbmVzdGVkU3R5bGVzXzFbX2ldLCBuYW1lID0gX2JbMF0sIHZhbHVlID0gX2JbMV07XG4gICAgICAgICAgICBwaWQgKz0gbmFtZSArIHN0eWxpemUocnVsZSwgbmFtZSwgdmFsdWUsIGxpc3QsIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBrZXkgPSBwYXJlbnQgPyBpbnRlcnBvbGF0ZShzZWxlY3RvciwgcGFyZW50KSA6IHNlbGVjdG9yO1xuICAgICAgICBpZiAoc3R5bGVTdHJpbmcpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGNhY2hlLmFkZChuZXcgU3R5bGUoc3R5bGVTdHJpbmcsIGNhY2hlLmhhc2gsIGlzVW5pcXVlID8gXCJ1XCIgKyAoKyt1bmlxdWVJZCkudG9TdHJpbmcoMzYpIDogdW5kZWZpbmVkKSk7XG4gICAgICAgICAgICBsaXN0LnB1c2goW2tleSwgc3R5bGVdKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBfYyA9IDAsIG5lc3RlZFN0eWxlc18yID0gbmVzdGVkU3R5bGVzOyBfYyA8IG5lc3RlZFN0eWxlc18yLmxlbmd0aDsgX2MrKykge1xuICAgICAgICAgICAgdmFyIF9kID0gbmVzdGVkU3R5bGVzXzJbX2NdLCBuYW1lID0gX2RbMF0sIHZhbHVlID0gX2RbMV07XG4gICAgICAgICAgICBwaWQgKz0gbmFtZSArIHN0eWxpemUoY2FjaGUsIG5hbWUsIHZhbHVlLCBsaXN0LCBrZXkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwaWQ7XG59XG4vKipcbiAqIFJlZ2lzdGVyIGFsbCBzdHlsZXMsIGJ1dCBjb2xsZWN0IGZvciBzZWxlY3RvciBpbnRlcnBvbGF0aW9uIHVzaW5nIHRoZSBoYXNoLlxuICovXG5mdW5jdGlvbiBjb21wb3NlU3R5bGVzKGNvbnRhaW5lciwgc2VsZWN0b3IsIHN0eWxlcywgaXNTdHlsZSwgZGlzcGxheU5hbWUpIHtcbiAgICB2YXIgY2FjaGUgPSBuZXcgQ2FjaGUoY29udGFpbmVyLmhhc2gpO1xuICAgIHZhciBsaXN0ID0gW107XG4gICAgdmFyIHBpZCA9IHN0eWxpemUoY2FjaGUsIHNlbGVjdG9yLCBzdHlsZXMsIGxpc3QpO1xuICAgIHZhciBoYXNoID0gXCJmXCIgKyBjYWNoZS5oYXNoKHBpZCk7XG4gICAgdmFyIGlkID0gZGlzcGxheU5hbWUgPyBkaXNwbGF5TmFtZSArIFwiX1wiICsgaGFzaCA6IGhhc2g7XG4gICAgZm9yICh2YXIgX2kgPSAwLCBsaXN0XzEgPSBsaXN0OyBfaSA8IGxpc3RfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIF9hID0gbGlzdF8xW19pXSwgc2VsZWN0b3JfMSA9IF9hWzBdLCBzdHlsZSA9IF9hWzFdO1xuICAgICAgICB2YXIga2V5ID0gaXNTdHlsZSA/IGludGVycG9sYXRlKHNlbGVjdG9yXzEsIFwiLlwiICsgZXhwb3J0cy5lc2NhcGUoaWQpKSA6IHNlbGVjdG9yXzE7XG4gICAgICAgIHN0eWxlLmFkZChuZXcgU2VsZWN0b3Ioa2V5LCBzdHlsZS5oYXNoLCB1bmRlZmluZWQsIHBpZCkpO1xuICAgIH1cbiAgICByZXR1cm4geyBjYWNoZTogY2FjaGUsIHBpZDogcGlkLCBpZDogaWQgfTtcbn1cbi8qKlxuICogQ2FjaGUgdG8gbGlzdCB0byBzdHlsZXMuXG4gKi9cbmZ1bmN0aW9uIGpvaW4oYXJyKSB7XG4gICAgdmFyIHJlcyA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKVxuICAgICAgICByZXMgKz0gYXJyW2ldO1xuICAgIHJldHVybiByZXM7XG59XG4vKipcbiAqIE5vb3AgY2hhbmdlcy5cbiAqL1xudmFyIG5vb3BDaGFuZ2VzID0ge1xuICAgIGFkZDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9LFxuICAgIGNoYW5nZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG59O1xuLyoqXG4gKiBJbXBsZW1lbnQgYSBjYWNoZS9ldmVudCBlbWl0dGVyLlxuICovXG52YXIgQ2FjaGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FjaGUoaGFzaCwgY2hhbmdlcykge1xuICAgICAgICBpZiAoaGFzaCA9PT0gdm9pZCAwKSB7IGhhc2ggPSBzdHJpbmdIYXNoOyB9XG4gICAgICAgIGlmIChjaGFuZ2VzID09PSB2b2lkIDApIHsgY2hhbmdlcyA9IG5vb3BDaGFuZ2VzOyB9XG4gICAgICAgIHRoaXMuaGFzaCA9IGhhc2g7XG4gICAgICAgIHRoaXMuY2hhbmdlcyA9IGNoYW5nZXM7XG4gICAgICAgIHRoaXMuc2hlZXQgPSBbXTtcbiAgICAgICAgdGhpcy5jaGFuZ2VJZCA9IDA7XG4gICAgICAgIHRoaXMuX2tleXMgPSBbXTtcbiAgICAgICAgdGhpcy5fY2hpbGRyZW4gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9jb3VudGVycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgfVxuICAgIENhY2hlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdIHx8IDA7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5fY2hpbGRyZW5bc3R5bGUuaWRdIHx8IHN0eWxlLmNsb25lKCk7XG4gICAgICAgIHRoaXMuX2NvdW50ZXJzW3N0eWxlLmlkXSA9IGNvdW50ICsgMTtcbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZHJlbltpdGVtLmlkXSA9IGl0ZW07XG4gICAgICAgICAgICB0aGlzLl9rZXlzLnB1c2goaXRlbS5pZCk7XG4gICAgICAgICAgICB0aGlzLnNoZWV0LnB1c2goaXRlbS5nZXRTdHlsZXMoKSk7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUlkKys7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZXMuYWRkKGl0ZW0sIHRoaXMuX2tleXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBjb250ZW50cyBhcmUgZGlmZmVyZW50LlxuICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0SWRlbnRpZmllcigpICE9PSBzdHlsZS5nZXRJZGVudGlmaWVyKCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSGFzaCBjb2xsaXNpb246IFwiICsgc3R5bGUuZ2V0U3R5bGVzKCkgKyBcIiA9PT0gXCIgKyBpdGVtLmdldFN0eWxlcygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvbGRJbmRleCA9IHRoaXMuX2tleXMuaW5kZXhPZihzdHlsZS5pZCk7XG4gICAgICAgICAgICB2YXIgbmV3SW5kZXggPSB0aGlzLl9rZXlzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB2YXIgcHJldkNoYW5nZUlkID0gdGhpcy5jaGFuZ2VJZDtcbiAgICAgICAgICAgIGlmIChvbGRJbmRleCAhPT0gbmV3SW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzLnNwbGljZShvbGRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5wdXNoKHN0eWxlLmlkKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUlkKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIENhY2hlICYmIHN0eWxlIGluc3RhbmNlb2YgQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJldkNoYW5nZUlkXzEgPSBpdGVtLmNoYW5nZUlkO1xuICAgICAgICAgICAgICAgIGl0ZW0ubWVyZ2Uoc3R5bGUpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmNoYW5nZUlkICE9PSBwcmV2Q2hhbmdlSWRfMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUlkKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuY2hhbmdlSWQgIT09IHByZXZDaGFuZ2VJZCkge1xuICAgICAgICAgICAgICAgIGlmIChvbGRJbmRleCA9PT0gbmV3SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2Uob2xkSW5kZXgsIDEsIGl0ZW0uZ2V0U3R5bGVzKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2Uob2xkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWV0LnNwbGljZShuZXdJbmRleCwgMCwgaXRlbS5nZXRTdHlsZXMoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlcy5jaGFuZ2UoaXRlbSwgb2xkSW5kZXgsIG5ld0luZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICB9O1xuICAgIENhY2hlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gdGhpcy5fY291bnRlcnNbc3R5bGUuaWRdO1xuICAgICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF0gPSBjb3VudCAtIDE7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2NoaWxkcmVuW3N0eWxlLmlkXTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2tleXMuaW5kZXhPZihpdGVtLmlkKTtcbiAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9jb3VudGVyc1tzdHlsZS5pZF07XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2NoaWxkcmVuW3N0eWxlLmlkXTtcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGVldC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlSWQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZXMucmVtb3ZlKGl0ZW0sIGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0gaW5zdGFuY2VvZiBDYWNoZSAmJiBzdHlsZSBpbnN0YW5jZW9mIENhY2hlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZDaGFuZ2VJZCA9IGl0ZW0uY2hhbmdlSWQ7XG4gICAgICAgICAgICAgICAgaXRlbS51bm1lcmdlKHN0eWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jaGFuZ2VJZCAhPT0gcHJldkNoYW5nZUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlZXQuc3BsaWNlKGluZGV4LCAxLCBpdGVtLmdldFN0eWxlcygpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VJZCsrO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZXMuY2hhbmdlKGl0ZW0sIGluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBDYWNoZS5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbiAoY2FjaGUpIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IGNhY2hlLl9rZXlzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGlkID0gX2FbX2ldO1xuICAgICAgICAgICAgdGhpcy5hZGQoY2FjaGUuX2NoaWxkcmVuW2lkXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBDYWNoZS5wcm90b3R5cGUudW5tZXJnZSA9IGZ1bmN0aW9uIChjYWNoZSkge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gY2FjaGUuX2tleXM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgaWQgPSBfYVtfaV07XG4gICAgICAgICAgICB0aGlzLnJlbW92ZShjYWNoZS5fY2hpbGRyZW5baWRdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIENhY2hlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYWNoZSh0aGlzLmhhc2gpLm1lcmdlKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIENhY2hlO1xufSgpKTtcbmV4cG9ydHMuQ2FjaGUgPSBDYWNoZTtcbi8qKlxuICogU2VsZWN0b3IgaXMgYSBkdW1iIGNsYXNzIG1hZGUgdG8gcmVwcmVzZW50IG5lc3RlZCBDU1Mgc2VsZWN0b3JzLlxuICovXG52YXIgU2VsZWN0b3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2VsZWN0b3Ioc2VsZWN0b3IsIGhhc2gsIGlkLCBwaWQpIHtcbiAgICAgICAgaWYgKGlkID09PSB2b2lkIDApIHsgaWQgPSBcInNcIiArIGhhc2goc2VsZWN0b3IpOyB9XG4gICAgICAgIGlmIChwaWQgPT09IHZvaWQgMCkgeyBwaWQgPSAnJzsgfVxuICAgICAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIHRoaXMuaGFzaCA9IGhhc2g7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5waWQgPSBwaWQ7XG4gICAgfVxuICAgIFNlbGVjdG9yLnByb3RvdHlwZS5nZXRTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdG9yO1xuICAgIH07XG4gICAgU2VsZWN0b3IucHJvdG90eXBlLmdldElkZW50aWZpZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpZCArIFwiLlwiICsgdGhpcy5zZWxlY3RvcjtcbiAgICB9O1xuICAgIFNlbGVjdG9yLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTZWxlY3Rvcih0aGlzLnNlbGVjdG9yLCB0aGlzLmhhc2gsIHRoaXMuaWQsIHRoaXMucGlkKTtcbiAgICB9O1xuICAgIHJldHVybiBTZWxlY3Rvcjtcbn0oKSk7XG5leHBvcnRzLlNlbGVjdG9yID0gU2VsZWN0b3I7XG4vKipcbiAqIFRoZSBzdHlsZSBjb250YWluZXIgcmVnaXN0ZXJzIGEgc3R5bGUgc3RyaW5nIHdpdGggc2VsZWN0b3JzLlxuICovXG52YXIgU3R5bGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFN0eWxlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFN0eWxlKHN0eWxlLCBoYXNoLCBpZCkge1xuICAgICAgICBpZiAoaWQgPT09IHZvaWQgMCkgeyBpZCA9IFwiY1wiICsgaGFzaChzdHlsZSk7IH1cbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgaGFzaCkgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuc3R5bGUgPSBzdHlsZTtcbiAgICAgICAgX3RoaXMuaGFzaCA9IGhhc2g7XG4gICAgICAgIF90aGlzLmlkID0gaWQ7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgU3R5bGUucHJvdG90eXBlLmdldFN0eWxlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hlZXQuam9pbignLCcpICsgXCJ7XCIgKyB0aGlzLnN0eWxlICsgXCJ9XCI7XG4gICAgfTtcbiAgICBTdHlsZS5wcm90b3R5cGUuZ2V0SWRlbnRpZmllciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3R5bGU7XG4gICAgfTtcbiAgICBTdHlsZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3R5bGUodGhpcy5zdHlsZSwgdGhpcy5oYXNoLCB0aGlzLmlkKS5tZXJnZSh0aGlzKTtcbiAgICB9O1xuICAgIHJldHVybiBTdHlsZTtcbn0oQ2FjaGUpKTtcbmV4cG9ydHMuU3R5bGUgPSBTdHlsZTtcbi8qKlxuICogSW1wbGVtZW50IHJ1bGUgbG9naWMgZm9yIHN0eWxlIG91dHB1dC5cbiAqL1xudmFyIFJ1bGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFJ1bGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gUnVsZShydWxlLCBzdHlsZSwgaGFzaCwgaWQsIHBpZCkge1xuICAgICAgICBpZiAoc3R5bGUgPT09IHZvaWQgMCkgeyBzdHlsZSA9ICcnOyB9XG4gICAgICAgIGlmIChpZCA9PT0gdm9pZCAwKSB7IGlkID0gXCJhXCIgKyBoYXNoKHJ1bGUgKyBcIi5cIiArIHN0eWxlKTsgfVxuICAgICAgICBpZiAocGlkID09PSB2b2lkIDApIHsgcGlkID0gJyc7IH1cbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgaGFzaCkgfHwgdGhpcztcbiAgICAgICAgX3RoaXMucnVsZSA9IHJ1bGU7XG4gICAgICAgIF90aGlzLnN0eWxlID0gc3R5bGU7XG4gICAgICAgIF90aGlzLmhhc2ggPSBoYXNoO1xuICAgICAgICBfdGhpcy5pZCA9IGlkO1xuICAgICAgICBfdGhpcy5waWQgPSBwaWQ7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgUnVsZS5wcm90b3R5cGUuZ2V0U3R5bGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ydWxlICsgXCJ7XCIgKyB0aGlzLnN0eWxlICsgam9pbih0aGlzLnNoZWV0KSArIFwifVwiO1xuICAgIH07XG4gICAgUnVsZS5wcm90b3R5cGUuZ2V0SWRlbnRpZmllciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGlkICsgXCIuXCIgKyB0aGlzLnJ1bGUgKyBcIi5cIiArIHRoaXMuc3R5bGU7XG4gICAgfTtcbiAgICBSdWxlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSdWxlKHRoaXMucnVsZSwgdGhpcy5zdHlsZSwgdGhpcy5oYXNoLCB0aGlzLmlkLCB0aGlzLnBpZCkubWVyZ2UodGhpcyk7XG4gICAgfTtcbiAgICByZXR1cm4gUnVsZTtcbn0oQ2FjaGUpKTtcbmV4cG9ydHMuUnVsZSA9IFJ1bGU7XG4vKipcbiAqIFRoZSBGcmVlU3R5bGUgY2xhc3MgaW1wbGVtZW50cyB0aGUgQVBJIGZvciBldmVyeXRoaW5nIGVsc2UuXG4gKi9cbnZhciBGcmVlU3R5bGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEZyZWVTdHlsZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBGcmVlU3R5bGUoaGFzaCwgZGVidWcsIGlkLCBjaGFuZ2VzKSB7XG4gICAgICAgIGlmIChoYXNoID09PSB2b2lkIDApIHsgaGFzaCA9IHN0cmluZ0hhc2g7IH1cbiAgICAgICAgaWYgKGRlYnVnID09PSB2b2lkIDApIHsgZGVidWcgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnZbJ05PREVfRU5WJ10gIT09ICdwcm9kdWN0aW9uJzsgfVxuICAgICAgICBpZiAoaWQgPT09IHZvaWQgMCkgeyBpZCA9IFwiZlwiICsgKCsrdW5pcXVlSWQpLnRvU3RyaW5nKDM2KTsgfVxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBoYXNoLCBjaGFuZ2VzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5oYXNoID0gaGFzaDtcbiAgICAgICAgX3RoaXMuZGVidWcgPSBkZWJ1ZztcbiAgICAgICAgX3RoaXMuaWQgPSBpZDtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBGcmVlU3R5bGUucHJvdG90eXBlLnJlZ2lzdGVyU3R5bGUgPSBmdW5jdGlvbiAoc3R5bGVzLCBkaXNwbGF5TmFtZSkge1xuICAgICAgICB2YXIgZGVidWdOYW1lID0gdGhpcy5kZWJ1ZyA/IGRpc3BsYXlOYW1lIDogdW5kZWZpbmVkO1xuICAgICAgICB2YXIgX2EgPSBjb21wb3NlU3R5bGVzKHRoaXMsICcmJywgc3R5bGVzLCB0cnVlLCBkZWJ1Z05hbWUpLCBjYWNoZSA9IF9hLmNhY2hlLCBpZCA9IF9hLmlkO1xuICAgICAgICB0aGlzLm1lcmdlKGNhY2hlKTtcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgIH07XG4gICAgRnJlZVN0eWxlLnByb3RvdHlwZS5yZWdpc3RlcktleWZyYW1lcyA9IGZ1bmN0aW9uIChrZXlmcmFtZXMsIGRpc3BsYXlOYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVySGFzaFJ1bGUoJ0BrZXlmcmFtZXMnLCBrZXlmcmFtZXMsIGRpc3BsYXlOYW1lKTtcbiAgICB9O1xuICAgIEZyZWVTdHlsZS5wcm90b3R5cGUucmVnaXN0ZXJIYXNoUnVsZSA9IGZ1bmN0aW9uIChwcmVmaXgsIHN0eWxlcywgZGlzcGxheU5hbWUpIHtcbiAgICAgICAgdmFyIGRlYnVnTmFtZSA9IHRoaXMuZGVidWcgPyBkaXNwbGF5TmFtZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIF9hID0gY29tcG9zZVN0eWxlcyh0aGlzLCAnJywgc3R5bGVzLCBmYWxzZSwgZGVidWdOYW1lKSwgY2FjaGUgPSBfYS5jYWNoZSwgcGlkID0gX2EucGlkLCBpZCA9IF9hLmlkO1xuICAgICAgICB2YXIgcnVsZSA9IG5ldyBSdWxlKHByZWZpeCArIFwiIFwiICsgZXhwb3J0cy5lc2NhcGUoaWQpLCB1bmRlZmluZWQsIHRoaXMuaGFzaCwgdW5kZWZpbmVkLCBwaWQpO1xuICAgICAgICB0aGlzLmFkZChydWxlLm1lcmdlKGNhY2hlKSk7XG4gICAgICAgIHJldHVybiBpZDtcbiAgICB9O1xuICAgIEZyZWVTdHlsZS5wcm90b3R5cGUucmVnaXN0ZXJSdWxlID0gZnVuY3Rpb24gKHJ1bGUsIHN0eWxlcykge1xuICAgICAgICB0aGlzLm1lcmdlKGNvbXBvc2VTdHlsZXModGhpcywgcnVsZSwgc3R5bGVzLCBmYWxzZSkuY2FjaGUpO1xuICAgIH07XG4gICAgRnJlZVN0eWxlLnByb3RvdHlwZS5yZWdpc3RlckNzcyA9IGZ1bmN0aW9uIChzdHlsZXMpIHtcbiAgICAgICAgdGhpcy5tZXJnZShjb21wb3NlU3R5bGVzKHRoaXMsICcnLCBzdHlsZXMsIGZhbHNlKS5jYWNoZSk7XG4gICAgfTtcbiAgICBGcmVlU3R5bGUucHJvdG90eXBlLmdldFN0eWxlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGpvaW4odGhpcy5zaGVldCk7XG4gICAgfTtcbiAgICBGcmVlU3R5bGUucHJvdG90eXBlLmdldElkZW50aWZpZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xuICAgIH07XG4gICAgRnJlZVN0eWxlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmVlU3R5bGUodGhpcy5oYXNoLCB0aGlzLmRlYnVnLCB0aGlzLmlkLCB0aGlzLmNoYW5nZXMpLm1lcmdlKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIEZyZWVTdHlsZTtcbn0oQ2FjaGUpKTtcbmV4cG9ydHMuRnJlZVN0eWxlID0gRnJlZVN0eWxlO1xuLyoqXG4gKiBFeHBvcnRzIGEgc2ltcGxlIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlKGhhc2gsIGRlYnVnLCBjaGFuZ2VzKSB7XG4gICAgcmV0dXJuIG5ldyBGcmVlU3R5bGUoaGFzaCwgZGVidWcsIHVuZGVmaW5lZCwgY2hhbmdlcyk7XG59XG5leHBvcnRzLmNyZWF0ZSA9IGNyZWF0ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZyZWUtc3R5bGUuanMubWFwIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vICBDb21tb24udHN4IC0gR2J0Y1xyXG4vL1xyXG4vLyAgQ29weXJpZ2h0IMKpIDIwMTgsIEdyaWQgUHJvdGVjdGlvbiBBbGxpYW5jZS4gIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbi8vXHJcbi8vICBMaWNlbnNlZCB0byB0aGUgR3JpZCBQcm90ZWN0aW9uIEFsbGlhbmNlIChHUEEpIHVuZGVyIG9uZSBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gU2VlXHJcbi8vICB0aGUgTk9USUNFIGZpbGUgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuXHJcbi8vICBUaGUgR1BBIGxpY2Vuc2VzIHRoaXMgZmlsZSB0byB5b3UgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCB0aGUgXCJMaWNlbnNlXCI7IHlvdSBtYXkgbm90IHVzZSB0aGlzXHJcbi8vICBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdDpcclxuLy9cclxuLy8gICAgICBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbi8vXHJcbi8vICBVbmxlc3MgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHRoZSBzdWJqZWN0IHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuXHJcbi8vICBcIkFTLUlTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBSZWZlciB0byB0aGVcclxuLy8gIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zLlxyXG4vL1xyXG4vLyAgQ29kZSBNb2RpZmljYXRpb24gSGlzdG9yeTpcclxuLy8gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gIDEwLzEzLzIwMjAgLSBDLiBMYWNrbmVyXHJcbi8vICAgICAgIEdlbmVyYXRlZCBvcmlnaW5hbCB2ZXJzaW9uIG9mIHNvdXJjZSBjb2RlLlxyXG4vL1xyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBzdHlsZSB9IGZyb20gXCJ0eXBlc3R5bGVcIlxyXG5cclxuLy8gc3R5bGVzXHJcbmV4cG9ydCBjb25zdCBvdXRlckRpdjogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICBtYXJnaW5MZWZ0OiAnYXV0bycsXHJcbiAgICBtYXJnaW5SaWdodDogJ2F1dG8nLFxyXG4gICAgb3ZlcmZsb3dZOiAnaGlkZGVuJyxcclxuICAgIG92ZXJmbG93WDogJ2hpZGRlbicsXHJcbiAgICBwYWRkaW5nOiAnMGVtJyxcclxuICAgIHpJbmRleDogMTAwMCxcclxuICAgIGJveFNoYWRvdzogJzRweCA0cHggMnB4ICM4ODg4ODgnLFxyXG4gICAgYm9yZGVyOiAnMnB4IHNvbGlkIGJsYWNrJyxcclxuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgdG9wOiAnMCcsXHJcbiAgICBsZWZ0OiAwLFxyXG4gICAgZGlzcGxheTogJ25vbmUnLFxyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZSA9IHN0eWxlKHtcclxuICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICBoZWlnaHQ6ICcyMHB4JyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyM4MDgwODAnLFxyXG4gICAgY3Vyc29yOiAnbW92ZScsXHJcbiAgICBwYWRkaW5nOiAnMGVtJ1xyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBjbG9zZUJ1dHRvbiA9IHN0eWxlKHtcclxuICAgIGJhY2tncm91bmQ6ICdmaXJlYnJpY2snLFxyXG4gICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgIHRvcDogMCxcclxuICAgIHJpZ2h0OiAwLFxyXG4gICAgd2lkdGg6ICcyMHB4JyxcclxuICAgIGhlaWdodDogJzIwcHgnLFxyXG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgIHZlcnRpY2FsQWxpZ246ICdtaWRkbGUnLFxyXG4gICAgcGFkZGluZzogMCxcclxuICAgIGJvcmRlcjogMCxcclxuICAgICRuZXN0OiB7XHJcbiAgICAgICAgXCImOmhvdmVyXCI6IHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogJ29yYW5nZXJlZCdcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuaW50ZXJmYWNlIEl3aW5kb3dQcm9wcyB7XHJcbiAgICBzaG93OiBib29sZWFuLFxyXG4gICAgY2xvc2U6ICgpID0+IHZvaWQsXHJcbiAgICB3aWR0aDogbnVtYmVyLFxyXG4gICAgbWF4SGVpZ2h0OiBudW1iZXIsXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBXaWRnZXRXaW5kb3c6IFJlYWN0LkZ1bmN0aW9uQ29tcG9uZW50PEl3aW5kb3dQcm9wcz4gPSAocHJvcHMpID0+IHtcclxuICAgIGNvbnN0IHJlZldpbmRvdyA9IFJlYWN0LnVzZVJlZihudWxsKTtcclxuICAgIGNvbnN0IHJlZkhhbmRsZSA9IFJlYWN0LnVzZVJlZihudWxsKTtcclxuXHJcbiAgICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xyXG4gICAgICAgIGlmIChwcm9wcy5zaG93KVxyXG4gICAgICAgICAgICAoJChyZWZXaW5kb3cuY3VycmVudCkgYXMgYW55KS5kcmFnZ2FibGUoeyBzY3JvbGw6IGZhbHNlLCBoYW5kbGU6IHJlZkhhbmRsZS5jdXJyZW50LCBjb250YWlubWVudDogJyNjaGFydHBhbmVsJyB9KTtcclxuICAgIH0pXHJcblxyXG4gICAgaWYgKCFwcm9wcy5zaG93KVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG5cclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPCBkaXYgcmVmPXtyZWZXaW5kb3d9IGNsYXNzTmFtZT1cInVpLXdpZGdldC1jb250ZW50XCIgc3R5bGU9e3sgLi4ub3V0ZXJEaXYsIHdpZHRoOiBwcm9wcy53aWR0aCwgbWF4SGVpZ2h0OiBwcm9wcy5tYXhIZWlnaHQsIGRpc3BsYXk6IHVuZGVmaW5lZCB9fSA+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyOiAnYmxhY2sgc29saWQgMnB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgcmVmPXtyZWZIYW5kbGV9IGNsYXNzTmFtZT17aGFuZGxlfT48L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6IHByb3BzLndpZHRoIC0gNiwgbWF4SGVpZ2h0OiBwcm9wcy5tYXhIZWlnaHQgLSAyNCB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7cHJvcHMuY2hpbGRyZW59XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPXtjbG9zZUJ1dHRvbn0gb25DbGljaz17KCkgPT4gcHJvcHMuY2xvc2UoKX0+WDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICApXHJcbn0iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyAgVGltZUNvcnJlbGF0ZWRTYWdzLnRzeCAtIEdidGNcclxuLy9cclxuLy8gIENvcHlyaWdodCDCqSAyMDE4LCBHcmlkIFByb3RlY3Rpb24gQWxsaWFuY2UuICBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4vL1xyXG4vLyAgTGljZW5zZWQgdG8gdGhlIEdyaWQgUHJvdGVjdGlvbiBBbGxpYW5jZSAoR1BBKSB1bmRlciBvbmUgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuIFNlZVxyXG4vLyAgdGhlIE5PVElDRSBmaWxlIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLlxyXG4vLyAgVGhlIEdQQSBsaWNlbnNlcyB0aGlzIGZpbGUgdG8geW91IHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgdGhlIFwiTGljZW5zZVwiOyB5b3UgbWF5IG5vdCB1c2UgdGhpc1xyXG4vLyAgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXQ6XHJcbi8vXHJcbi8vICAgICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4vL1xyXG4vLyAgVW5sZXNzIGFncmVlZCB0byBpbiB3cml0aW5nLCB0aGUgc3ViamVjdCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhblxyXG4vLyAgXCJBUy1JU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gUmVmZXIgdG8gdGhlXHJcbi8vICBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucy5cclxuLy9cclxuLy8gIENvZGUgTW9kaWZpY2F0aW9uIEhpc3Rvcnk6XHJcbi8vICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICAwMi8wNS8yMDE5IC0gU3RlcGhlbiBDLiBXaWxsc1xyXG4vLyAgICAgICBHZW5lcmF0ZWQgb3JpZ2luYWwgdmVyc2lvbiBvZiBzb3VyY2UgY29kZS5cclxuLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgV2lkZ2V0V2luZG93IH0gZnJvbSAnLi9Db21tb24nO1xyXG5cclxuXHJcbmludGVyZmFjZSBJcHJvcHMgeyBjbG9zZUNhbGxiYWNrOiAoKSA9PiB2b2lkLCBleHBvcnRDYWxsYmFjazogKCkgPT4gdm9pZCwgZXZlbnRJZDogbnVtYmVyLCBpc09wZW46IGJvb2xlYW4gfVxyXG5cclxuY29uc3QgVGltZUNvcnJlbGF0ZWRTYWdzV2lkZ2V0ID0gKHByb3BzOiBJcHJvcHMpID0+IHtcclxuICAgIGNvbnN0IFt0YmxEYXRhLCBzZXRUYmxEYXRhXSA9IFJlYWN0LnVzZVN0YXRlPEFycmF5PEpTWC5FbGVtZW50Pj4oW10pO1xyXG5cclxuICAgIFxyXG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcclxuICAgICAgICBsZXQgaGFuZGxlID0gZ2V0RGF0YSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gKCkgPT4geyBpZiAoaGFuZGxlICE9IHVuZGVmaW5lZCAmJiBoYW5kbGUuYWJvcnQgIT0gdW5kZWZpbmVkKSBoYW5kbGUuYWJvcnQoKTsgfVxyXG4gICAgfSwgW3Byb3BzLmV2ZW50SWRdKVxyXG5cclxuICAgIGNvbnN0IHJvd1N0eWxlID0geyBwYWRkaW5nTGVmdDogNSwgcGFkZGluZ1JpZ2h0OiA1LCBwYWRkaW5nVG9wOiAwLCBwYWRkaW5nQm90dG9tOiA1IH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXREYXRhKCk6IEpRdWVyeS5qcVhIUiB7XHJcblxyXG4gICAgICAgIGxldCBoYW5kbGUgPSAkLmFqYXgoe1xyXG4gICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICB1cmw6IGAke2hvbWVQYXRofWFwaS9PcGVuU0VFL0dldFRpbWVDb3JyZWxhdGVkU2Fncz9ldmVudElkPSR7cHJvcHMuZXZlbnRJZH1gLFxyXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlLFxyXG4gICAgICAgICAgICBhc3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgaGFuZGxlLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgc2V0VGJsRGF0YShkLm1hcChyb3cgPT5cclxuICAgICAgICAgICAgICAgIDx0ciBzdHlsZT17eyBkaXNwbGF5OiAndGFibGUnLCB0YWJsZUxheW91dDogJ2ZpeGVkJywgYmFja2dyb3VuZDogKHJvdy5FdmVudElEID09IHByb3BzLmV2ZW50SWQ/ICdsaWdodHllbGxvdycgOiAnZGVmYXVsdCcpIH19IGtleT17cm93LkV2ZW50SUR9PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB3aWR0aDogNjAsIC4uLnJvd1N0eWxlIH19ID48YSBpZD1cImV2ZW50TGlua1wiIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9eycuLz9ldmVudGlkPScgKyByb3cuRXZlbnRJRH0+PGRpdiBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJyB9fT57cm93LkV2ZW50SUR9PC9kaXY+PC9hPjwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHdpZHRoOiA4MCwgLi4ucm93U3R5bGUgfX0gPntyb3cuRXZlbnRUeXBlfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHdpZHRoOiA4MCwgLi4ucm93U3R5bGUgfX0gPntyb3cuU2FnTWFnbml0dWRlUGVyY2VudH0lPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgd2lkdGg6IDIwMCwgLi4ucm93U3R5bGUgfX0+e3Jvdy5TYWdEdXJhdGlvbk1pbGxpc2Vjb25kc30gbXMgKHtyb3cuU2FnRHVyYXRpb25DeWNsZXN9IGN5Y2xlcyk8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB3aWR0aDogMjIwLCAuLi5yb3dTdHlsZSB9fT57cm93LlN0YXJ0VGltZX08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB3aWR0aDogMjAwLCAuLi5yb3dTdHlsZSB9fT57cm93Lk1ldGVyTmFtZX08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB3aWR0aDogMzAwLCAuLi5yb3dTdHlsZSB9fT57cm93LkFzc2V0TmFtZX08L3RkPlxyXG4gICAgICAgICAgICAgICAgPC90cj4pKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxXaWRnZXRXaW5kb3cgc2hvdz17cHJvcHMuaXNPcGVufSBjbG9zZT17cHJvcHMuY2xvc2VDYWxsYmFja30gbWF4SGVpZ2h0PXs1NTB9IHdpZHRoPXs5OTZ9PlxyXG4gICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidGFibGVcIiBzdHlsZT17eyBmb250U2l6ZTogJ3NtYWxsJywgbWFyZ2luQm90dG9tOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGRpc3BsYXk6ICd0YWJsZScsIHRhYmxlTGF5b3V0OiAnZml4ZWQnLCBtYXJnaW5Cb3R0b206IDAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgd2lkdGg6IDYwLCAuLi5yb3dTdHlsZSB9fT5FdmVudCBJRDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB3aWR0aDogODAsIC4uLnJvd1N0eWxlIH19PkV2ZW50IFR5cGU8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgd2lkdGg6IDgwLCAuLi5yb3dTdHlsZSB9fT5NYWduaXR1ZGU8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgd2lkdGg6IDIwMCwgLi4ucm93U3R5bGUgfX0+RHVyYXRpb248L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgd2lkdGg6IDIyMCwgLi4ucm93U3R5bGUgfX0+U3RhcnQgVGltZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB3aWR0aDogMjAwLCAuLi5yb3dTdHlsZSB9fT5NZXRlciBOYW1lPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHdpZHRoOiAzMDAsIC4uLnJvd1N0eWxlIH19PkFzc2V0IE5hbWUmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDs8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXsoKSA9PiBwcm9wcy5leHBvcnRDYWxsYmFjaygpfT5FeHBvcnQoY3N2KTwvYnV0dG9uPjwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8dGJvZHkgc3R5bGU9e3sgbWF4SGVpZ2h0OiA1MDAsIG92ZXJmbG93WTogJ2F1dG8nLCBkaXNwbGF5OiAnYmxvY2snIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHt0YmxEYXRhfVxyXG4gICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICA8L1dpZGdldFdpbmRvdz5cclxuICAgICk7XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUaW1lQ29ycmVsYXRlZFNhZ3NXaWRnZXRcclxuXHJcbiIsImltcG9ydCB7IFR5cGVTdHlsZSB9IGZyb20gJy4vaW50ZXJuYWwvdHlwZXN0eWxlJztcclxuZXhwb3J0IHsgVHlwZVN0eWxlIH07XHJcbi8qKlxyXG4gKiBBbGwgdGhlIENTUyB0eXBlcyBpbiB0aGUgJ3R5cGVzJyBuYW1lc3BhY2VcclxuICovXHJcbmltcG9ydCAqIGFzIHR5cGVzIGZyb20gJy4vdHlwZXMnO1xyXG5leHBvcnQgeyB0eXBlcyB9O1xyXG4vKipcclxuICogRXhwb3J0IGNlcnRhaW4gdXRpbGl0aWVzXHJcbiAqL1xyXG5leHBvcnQgeyBleHRlbmQsIGNsYXNzZXMsIG1lZGlhIH0gZnJvbSAnLi9pbnRlcm5hbC91dGlsaXRpZXMnO1xyXG4vKiogWmVybyBjb25maWd1cmF0aW9uLCBkZWZhdWx0IGluc3RhbmNlIG9mIFR5cGVTdHlsZSAqL1xyXG52YXIgdHMgPSBuZXcgVHlwZVN0eWxlKHsgYXV0b0dlbmVyYXRlVGFnOiB0cnVlIH0pO1xyXG4vKiogU2V0cyB0aGUgdGFyZ2V0IHRhZyB3aGVyZSB3ZSB3cml0ZSB0aGUgY3NzIG9uIHN0eWxlIHVwZGF0ZXMgKi9cclxuZXhwb3J0IHZhciBzZXRTdHlsZXNUYXJnZXQgPSB0cy5zZXRTdHlsZXNUYXJnZXQ7XHJcbi8qKlxyXG4gKiBJbnNlcnQgYHJhd2AgQ1NTIGFzIGEgc3RyaW5nLiBUaGlzIGlzIHVzZWZ1bCBmb3IgZS5nLlxyXG4gKiAtIHRoaXJkIHBhcnR5IENTUyB0aGF0IHlvdSBhcmUgY3VzdG9taXppbmcgd2l0aCB0ZW1wbGF0ZSBzdHJpbmdzXHJcbiAqIC0gZ2VuZXJhdGluZyByYXcgQ1NTIGluIEphdmFTY3JpcHRcclxuICogLSByZXNldCBsaWJyYXJpZXMgbGlrZSBub3JtYWxpemUuY3NzIHRoYXQgeW91IGNhbiB1c2Ugd2l0aG91dCBsb2FkZXJzXHJcbiAqL1xyXG5leHBvcnQgdmFyIGNzc1JhdyA9IHRzLmNzc1JhdztcclxuLyoqXHJcbiAqIFRha2VzIENTU1Byb3BlcnRpZXMgYW5kIHJlZ2lzdGVycyBpdCB0byBhIGdsb2JhbCBzZWxlY3RvciAoYm9keSwgaHRtbCwgZXRjLilcclxuICovXHJcbmV4cG9ydCB2YXIgY3NzUnVsZSA9IHRzLmNzc1J1bGU7XHJcbi8qKlxyXG4gKiBSZW5kZXJzIHN0eWxlcyB0byB0aGUgc2luZ2xldG9uIHRhZyBpbWVkaWF0ZWx5XHJcbiAqIE5PVEU6IFlvdSBzaG91bGQgb25seSBjYWxsIGl0IG9uIGluaXRpYWwgcmVuZGVyIHRvIHByZXZlbnQgYW55IG5vbiBDU1MgZmxhc2guXHJcbiAqIEFmdGVyIHRoYXQgaXQgaXMga2VwdCBzeW5jIHVzaW5nIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGFuZCB3ZSBoYXZlbid0IG5vdGljZWQgYW55IGJhZCBmbGFzaGVzLlxyXG4gKiovXHJcbmV4cG9ydCB2YXIgZm9yY2VSZW5kZXJTdHlsZXMgPSB0cy5mb3JjZVJlbmRlclN0eWxlcztcclxuLyoqXHJcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gcmVnaXN0ZXIgYW4gQGZvbnQtZmFjZVxyXG4gKi9cclxuZXhwb3J0IHZhciBmb250RmFjZSA9IHRzLmZvbnRGYWNlO1xyXG4vKipcclxuICogQWxsb3dzIHVzZSB0byB1c2UgdGhlIHN0eWxlc2hlZXQgaW4gYSBub2RlLmpzIGVudmlyb25tZW50XHJcbiAqL1xyXG5leHBvcnQgdmFyIGdldFN0eWxlcyA9IHRzLmdldFN0eWxlcztcclxuLyoqXHJcbiAqIFRha2VzIGtleWZyYW1lcyBhbmQgcmV0dXJucyBhIGdlbmVyYXRlZCBhbmltYXRpb25OYW1lXHJcbiAqL1xyXG5leHBvcnQgdmFyIGtleWZyYW1lcyA9IHRzLmtleWZyYW1lcztcclxuLyoqXHJcbiAqIEhlbHBzIHdpdGggdGVzdGluZy4gUmVpbml0aWFsaXplcyBGcmVlU3R5bGUgKyByYXdcclxuICovXHJcbmV4cG9ydCB2YXIgcmVpbml0ID0gdHMucmVpbml0O1xyXG4vKipcclxuICogVGFrZXMgQ1NTUHJvcGVydGllcyBhbmQgcmV0dXJuIGEgZ2VuZXJhdGVkIGNsYXNzTmFtZSB5b3UgY2FuIHVzZSBvbiB5b3VyIGNvbXBvbmVudFxyXG4gKi9cclxuZXhwb3J0IHZhciBzdHlsZSA9IHRzLnN0eWxlO1xyXG4vKipcclxuICogVGFrZXMgYW4gb2JqZWN0IHdoZXJlIHByb3BlcnR5IG5hbWVzIGFyZSBpZGVhbCBjbGFzcyBuYW1lcyBhbmQgcHJvcGVydHkgdmFsdWVzIGFyZSBDU1NQcm9wZXJ0aWVzLCBhbmRcclxuICogcmV0dXJucyBhbiBvYmplY3Qgd2hlcmUgcHJvcGVydHkgbmFtZXMgYXJlIHRoZSBzYW1lIGlkZWFsIGNsYXNzIG5hbWVzIGFuZCB0aGUgcHJvcGVydHkgdmFsdWVzIGFyZVxyXG4gKiB0aGUgYWN0dWFsIGdlbmVyYXRlZCBjbGFzcyBuYW1lcyB1c2luZyB0aGUgaWRlYWwgY2xhc3MgbmFtZSBhcyB0aGUgJGRlYnVnTmFtZVxyXG4gKi9cclxuZXhwb3J0IHZhciBzdHlsZXNoZWV0ID0gdHMuc3R5bGVzaGVldDtcclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgVHlwZVN0eWxlIHNlcGFyYXRlIGZyb20gdGhlIGRlZmF1bHQgaW5zdGFuY2UuXHJcbiAqXHJcbiAqIC0gVXNlIHRoaXMgZm9yIGNyZWF0aW5nIGEgZGlmZmVyZW50IHR5cGVzdHlsZSBpbnN0YW5jZSBmb3IgYSBzaGFkb3cgZG9tIGNvbXBvbmVudC5cclxuICogLSBVc2UgdGhpcyBpZiB5b3UgZG9uJ3Qgd2FudCBhbiBhdXRvIHRhZyBnZW5lcmF0ZWQgYW5kIHlvdSBqdXN0IHdhbnQgdG8gY29sbGVjdCB0aGUgQ1NTLlxyXG4gKlxyXG4gKiBOT1RFOiBzdHlsZXMgYXJlbid0IHNoYXJlZCBiZXR3ZWVuIGRpZmZlcmVudCBpbnN0YW5jZXMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHlwZVN0eWxlKHRhcmdldCkge1xyXG4gICAgdmFyIGluc3RhbmNlID0gbmV3IFR5cGVTdHlsZSh7IGF1dG9HZW5lcmF0ZVRhZzogZmFsc2UgfSk7XHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgaW5zdGFuY2Uuc2V0U3R5bGVzVGFyZ2V0KHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgRnJlZVN0eWxlIGZyb20gJ2ZyZWUtc3R5bGUnO1xyXG4vKipcclxuICogV2UgbmVlZCB0byBkbyB0aGUgZm9sbG93aW5nIHRvICpvdXIqIG9iamVjdHMgYmVmb3JlIHBhc3NpbmcgdG8gZnJlZXN0eWxlOlxyXG4gKiAtIEZvciBhbnkgYCRuZXN0YCBkaXJlY3RpdmUgbW92ZSB1cCB0byBGcmVlU3R5bGUgc3R5bGUgbmVzdGluZ1xyXG4gKiAtIEZvciBhbnkgYCR1bmlxdWVgIGRpcmVjdGl2ZSBtYXAgdG8gRnJlZVN0eWxlIFVuaXF1ZVxyXG4gKiAtIEZvciBhbnkgYCRkZWJ1Z05hbWVgIGRpcmVjdGl2ZSByZXR1cm4gdGhlIGRlYnVnIG5hbWVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVTdHJpbmdPYmoob2JqZWN0KSB7XHJcbiAgICAvKiogVGhlIGZpbmFsIHJlc3VsdCB3ZSB3aWxsIHJldHVybiAqL1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgdmFyIGRlYnVnTmFtZSA9ICcnO1xyXG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xyXG4gICAgICAgIC8qKiBHcmFiIHRoZSB2YWx1ZSB1cGZyb250ICovXHJcbiAgICAgICAgdmFyIHZhbCA9IG9iamVjdFtrZXldO1xyXG4gICAgICAgIC8qKiBUeXBlU3R5bGUgY29uZmlndXJhdGlvbiBvcHRpb25zICovXHJcbiAgICAgICAgaWYgKGtleSA9PT0gJyR1bmlxdWUnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFtGcmVlU3R5bGUuSVNfVU5JUVVFXSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnJG5lc3QnKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXN0ZWQgPSB2YWw7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdG9yIGluIG5lc3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN1YnByb3BlcnRpZXMgPSBuZXN0ZWRbc2VsZWN0b3JdO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W3NlbGVjdG9yXSA9IGVuc3VyZVN0cmluZ09iaihzdWJwcm9wZXJ0aWVzKS5yZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnJGRlYnVnTmFtZScpIHtcclxuICAgICAgICAgICAgZGVidWdOYW1lID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiByZXN1bHQsIGRlYnVnTmFtZTogZGVidWdOYW1lIH07XHJcbn1cclxuLy8gdG9kbzogYmV0dGVyIG5hbWUgaGVyZVxyXG5leHBvcnQgZnVuY3Rpb24gZXhwbG9kZUtleWZyYW1lcyhmcmFtZXMpIHtcclxuICAgIHZhciByZXN1bHQgPSB7ICRkZWJ1Z05hbWU6IHVuZGVmaW5lZCwga2V5ZnJhbWVzOiB7fSB9O1xyXG4gICAgZm9yICh2YXIgb2Zmc2V0IGluIGZyYW1lcykge1xyXG4gICAgICAgIHZhciB2YWwgPSBmcmFtZXNbb2Zmc2V0XTtcclxuICAgICAgICBpZiAob2Zmc2V0ID09PSAnJGRlYnVnTmFtZScpIHtcclxuICAgICAgICAgICAgcmVzdWx0LiRkZWJ1Z05hbWUgPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHQua2V5ZnJhbWVzW29mZnNldF0gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBGcmVlU3R5bGUgZnJvbSBcImZyZWUtc3R5bGVcIjtcclxuaW1wb3J0IHsgZW5zdXJlU3RyaW5nT2JqLCBleHBsb2RlS2V5ZnJhbWVzIH0gZnJvbSAnLi9mb3JtYXR0aW5nJztcclxuaW1wb3J0IHsgZXh0ZW5kLCByYWYgfSBmcm9tICcuL3V0aWxpdGllcyc7XHJcbi8qKlxyXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGZyZWUgc3R5bGUgd2l0aCBvdXIgb3B0aW9uc1xyXG4gKi9cclxudmFyIGNyZWF0ZUZyZWVTdHlsZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEZyZWVTdHlsZS5jcmVhdGUoXHJcbi8qKiBVc2UgdGhlIGRlZmF1bHQgaGFzaCBmdW5jdGlvbiAqL1xyXG51bmRlZmluZWQsIFxyXG4vKiogUHJlc2VydmUgJGRlYnVnTmFtZSB2YWx1ZXMgKi9cclxudHJ1ZSk7IH07XHJcbi8qKlxyXG4gKiBNYWludGFpbnMgYSBzaW5nbGUgc3R5bGVzaGVldCBhbmQga2VlcHMgaXQgaW4gc3luYyB3aXRoIHJlcXVlc3RlZCBzdHlsZXNcclxuICovXHJcbnZhciBUeXBlU3R5bGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBUeXBlU3R5bGUoX2EpIHtcclxuICAgICAgICB2YXIgYXV0b0dlbmVyYXRlVGFnID0gX2EuYXV0b0dlbmVyYXRlVGFnO1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSW5zZXJ0IGByYXdgIENTUyBhcyBhIHN0cmluZy4gVGhpcyBpcyB1c2VmdWwgZm9yIGUuZy5cclxuICAgICAgICAgKiAtIHRoaXJkIHBhcnR5IENTUyB0aGF0IHlvdSBhcmUgY3VzdG9taXppbmcgd2l0aCB0ZW1wbGF0ZSBzdHJpbmdzXHJcbiAgICAgICAgICogLSBnZW5lcmF0aW5nIHJhdyBDU1MgaW4gSmF2YVNjcmlwdFxyXG4gICAgICAgICAqIC0gcmVzZXQgbGlicmFyaWVzIGxpa2Ugbm9ybWFsaXplLmNzcyB0aGF0IHlvdSBjYW4gdXNlIHdpdGhvdXQgbG9hZGVyc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY3NzUmF3ID0gZnVuY3Rpb24gKG11c3RCZVZhbGlkQ1NTKSB7XHJcbiAgICAgICAgICAgIGlmICghbXVzdEJlVmFsaWRDU1MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5fcmF3ICs9IG11c3RCZVZhbGlkQ1NTIHx8ICcnO1xyXG4gICAgICAgICAgICBfdGhpcy5fcGVuZGluZ1Jhd0NoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgICAgIF90aGlzLl9zdHlsZVVwZGF0ZWQoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRha2VzIENTU1Byb3BlcnRpZXMgYW5kIHJlZ2lzdGVycyBpdCB0byBhIGdsb2JhbCBzZWxlY3RvciAoYm9keSwgaHRtbCwgZXRjLilcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNzc1J1bGUgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgICAgICAgdmFyIG9iamVjdHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIG9iamVjdHNbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIG9iamVjdCA9IGVuc3VyZVN0cmluZ09iaihleHRlbmQuYXBwbHkodm9pZCAwLCBvYmplY3RzKSkucmVzdWx0O1xyXG4gICAgICAgICAgICBfdGhpcy5fZnJlZVN0eWxlLnJlZ2lzdGVyUnVsZShzZWxlY3Rvciwgb2JqZWN0KTtcclxuICAgICAgICAgICAgX3RoaXMuX3N0eWxlVXBkYXRlZCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW5kZXJzIHN0eWxlcyB0byB0aGUgc2luZ2xldG9uIHRhZyBpbWVkaWF0ZWx5XHJcbiAgICAgICAgICogTk9URTogWW91IHNob3VsZCBvbmx5IGNhbGwgaXQgb24gaW5pdGlhbCByZW5kZXIgdG8gcHJldmVudCBhbnkgbm9uIENTUyBmbGFzaC5cclxuICAgICAgICAgKiBBZnRlciB0aGF0IGl0IGlzIGtlcHQgc3luYyB1c2luZyBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBhbmQgd2UgaGF2ZW4ndCBub3RpY2VkIGFueSBiYWQgZmxhc2hlcy5cclxuICAgICAgICAgKiovXHJcbiAgICAgICAgdGhpcy5mb3JjZVJlbmRlclN0eWxlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IF90aGlzLl9nZXRUYWcoKTtcclxuICAgICAgICAgICAgaWYgKCF0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0YXJnZXQudGV4dENvbnRlbnQgPSBfdGhpcy5nZXRTdHlsZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gcmVnaXN0ZXIgYW4gQGZvbnQtZmFjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZm9udEZhY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBmb250RmFjZSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgZm9udEZhY2VbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZnJlZVN0eWxlID0gX3RoaXMuX2ZyZWVTdHlsZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2EgPSAwLCBfYiA9IGZvbnRGYWNlOyBfYSA8IF9iLmxlbmd0aDsgX2ErKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZhY2UgPSBfYltfYV07XHJcbiAgICAgICAgICAgICAgICBmcmVlU3R5bGUucmVnaXN0ZXJSdWxlKCdAZm9udC1mYWNlJywgZmFjZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX3N0eWxlVXBkYXRlZCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBbGxvd3MgdXNlIHRvIHVzZSB0aGUgc3R5bGVzaGVldCBpbiBhIG5vZGUuanMgZW52aXJvbm1lbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmdldFN0eWxlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChfdGhpcy5fcmF3IHx8ICcnKSArIF90aGlzLl9mcmVlU3R5bGUuZ2V0U3R5bGVzKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUYWtlcyBrZXlmcmFtZXMgYW5kIHJldHVybnMgYSBnZW5lcmF0ZWQgYW5pbWF0aW9uTmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMua2V5ZnJhbWVzID0gZnVuY3Rpb24gKGZyYW1lcykge1xyXG4gICAgICAgICAgICB2YXIgX2EgPSBleHBsb2RlS2V5ZnJhbWVzKGZyYW1lcyksIGtleWZyYW1lcyA9IF9hLmtleWZyYW1lcywgJGRlYnVnTmFtZSA9IF9hLiRkZWJ1Z05hbWU7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHJlcGxhY2UgJGRlYnVnTmFtZSB3aXRoIGRpc3BsYXkgbmFtZVxyXG4gICAgICAgICAgICB2YXIgYW5pbWF0aW9uTmFtZSA9IF90aGlzLl9mcmVlU3R5bGUucmVnaXN0ZXJLZXlmcmFtZXMoa2V5ZnJhbWVzLCAkZGVidWdOYW1lKTtcclxuICAgICAgICAgICAgX3RoaXMuX3N0eWxlVXBkYXRlZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gYW5pbWF0aW9uTmFtZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhlbHBzIHdpdGggdGVzdGluZy4gUmVpbml0aWFsaXplcyBGcmVlU3R5bGUgKyByYXdcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlaW5pdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLyoqIHJlaW5pdCBmcmVlc3R5bGUgKi9cclxuICAgICAgICAgICAgdmFyIGZyZWVTdHlsZSA9IGNyZWF0ZUZyZWVTdHlsZSgpO1xyXG4gICAgICAgICAgICBfdGhpcy5fZnJlZVN0eWxlID0gZnJlZVN0eWxlO1xyXG4gICAgICAgICAgICBfdGhpcy5fbGFzdEZyZWVTdHlsZUNoYW5nZUlkID0gZnJlZVN0eWxlLmNoYW5nZUlkO1xyXG4gICAgICAgICAgICAvKiogcmVpbml0IHJhdyAqL1xyXG4gICAgICAgICAgICBfdGhpcy5fcmF3ID0gJyc7XHJcbiAgICAgICAgICAgIF90aGlzLl9wZW5kaW5nUmF3Q2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8qKiBDbGVhciBhbnkgc3R5bGVzIHRoYXQgd2VyZSBmbHVzaGVkICovXHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBfdGhpcy5fZ2V0VGFnKCk7XHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKiogU2V0cyB0aGUgdGFyZ2V0IHRhZyB3aGVyZSB3ZSB3cml0ZSB0aGUgY3NzIG9uIHN0eWxlIHVwZGF0ZXMgKi9cclxuICAgICAgICB0aGlzLnNldFN0eWxlc1RhcmdldCA9IGZ1bmN0aW9uICh0YWcpIHtcclxuICAgICAgICAgICAgLyoqIENsZWFyIGFueSBkYXRhIGluIGFueSBwcmV2aW91cyB0YWcgKi9cclxuICAgICAgICAgICAgaWYgKF90aGlzLl90YWcpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLl90YWcudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5fdGFnID0gdGFnO1xyXG4gICAgICAgICAgICAvKiogVGhpcyBzcGVjaWFsIHRpbWUgYnVmZmVyIGltbWVkaWF0ZWx5ICovXHJcbiAgICAgICAgICAgIF90aGlzLmZvcmNlUmVuZGVyU3R5bGVzKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUYWtlcyBhbiBvYmplY3Qgd2hlcmUgcHJvcGVydHkgbmFtZXMgYXJlIGlkZWFsIGNsYXNzIG5hbWVzIGFuZCBwcm9wZXJ0eSB2YWx1ZXMgYXJlIENTU1Byb3BlcnRpZXMsIGFuZFxyXG4gICAgICAgICAqIHJldHVybnMgYW4gb2JqZWN0IHdoZXJlIHByb3BlcnR5IG5hbWVzIGFyZSB0aGUgc2FtZSBpZGVhbCBjbGFzcyBuYW1lcyBhbmQgdGhlIHByb3BlcnR5IHZhbHVlcyBhcmVcclxuICAgICAgICAgKiB0aGUgYWN0dWFsIGdlbmVyYXRlZCBjbGFzcyBuYW1lcyB1c2luZyB0aGUgaWRlYWwgY2xhc3MgbmFtZSBhcyB0aGUgJGRlYnVnTmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc3R5bGVzaGVldCA9IGZ1bmN0aW9uIChjbGFzc2VzKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY2xhc3Nlcyk7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBjbGFzc05hbWVzXzEgPSBjbGFzc05hbWVzOyBfaSA8IGNsYXNzTmFtZXNfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzXzFbX2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsYXNzRGVmID0gY2xhc3Nlc1tjbGFzc05hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzRGVmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NEZWYuJGRlYnVnTmFtZSA9IGNsYXNzTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2xhc3NOYW1lXSA9IF90aGlzLnN0eWxlKGNsYXNzRGVmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGZyZWVTdHlsZSA9IGNyZWF0ZUZyZWVTdHlsZSgpO1xyXG4gICAgICAgIHRoaXMuX2F1dG9HZW5lcmF0ZVRhZyA9IGF1dG9HZW5lcmF0ZVRhZztcclxuICAgICAgICB0aGlzLl9mcmVlU3R5bGUgPSBmcmVlU3R5bGU7XHJcbiAgICAgICAgdGhpcy5fbGFzdEZyZWVTdHlsZUNoYW5nZUlkID0gZnJlZVN0eWxlLmNoYW5nZUlkO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmcgPSAwO1xyXG4gICAgICAgIHRoaXMuX3BlbmRpbmdSYXdDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9yYXcgPSAnJztcclxuICAgICAgICB0aGlzLl90YWcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgLy8gcmViaW5kIHByb3RvdHlwZSB0byBUeXBlU3R5bGUuICBJdCBtaWdodCBiZSBiZXR0ZXIgdG8gZG8gYSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuc3R5bGUuYXBwbHkodGhpcywgYXJndW1lbnRzKX1cclxuICAgICAgICB0aGlzLnN0eWxlID0gdGhpcy5zdHlsZS5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBPbmx5IGNhbGxzIGNiIGFsbCBzeW5jIG9wZXJhdGlvbnMgc2V0dGxlXHJcbiAgICAgKi9cclxuICAgIFR5cGVTdHlsZS5wcm90b3R5cGUuX2FmdGVyQWxsU3luYyA9IGZ1bmN0aW9uIChjYikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZysrO1xyXG4gICAgICAgIHZhciBwZW5kaW5nID0gdGhpcy5fcGVuZGluZztcclxuICAgICAgICByYWYoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGVuZGluZyAhPT0gX3RoaXMuX3BlbmRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFR5cGVTdHlsZS5wcm90b3R5cGUuX2dldFRhZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fdGFnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90YWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9hdXRvR2VuZXJhdGVUYWcpIHtcclxuICAgICAgICAgICAgdmFyIHRhZyA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnXHJcbiAgICAgICAgICAgICAgICA/IHsgdGV4dENvbnRlbnQ6ICcnIH1cclxuICAgICAgICAgICAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGFnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl90YWcgPSB0YWc7XHJcbiAgICAgICAgICAgIHJldHVybiB0YWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG4gICAgLyoqIENoZWNrcyBpZiB0aGUgc3R5bGUgdGFnIG5lZWRzIHVwZGF0aW5nIGFuZCBpZiBzbyBxdWV1ZXMgdXAgdGhlIGNoYW5nZSAqL1xyXG4gICAgVHlwZVN0eWxlLnByb3RvdHlwZS5fc3R5bGVVcGRhdGVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGNoYW5nZUlkID0gdGhpcy5fZnJlZVN0eWxlLmNoYW5nZUlkO1xyXG4gICAgICAgIHZhciBsYXN0Q2hhbmdlSWQgPSB0aGlzLl9sYXN0RnJlZVN0eWxlQ2hhbmdlSWQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wZW5kaW5nUmF3Q2hhbmdlICYmIGNoYW5nZUlkID09PSBsYXN0Q2hhbmdlSWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sYXN0RnJlZVN0eWxlQ2hhbmdlSWQgPSBjaGFuZ2VJZDtcclxuICAgICAgICB0aGlzLl9wZW5kaW5nUmF3Q2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fYWZ0ZXJBbGxTeW5jKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF90aGlzLmZvcmNlUmVuZGVyU3R5bGVzKCk7IH0pO1xyXG4gICAgfTtcclxuICAgIFR5cGVTdHlsZS5wcm90b3R5cGUuc3R5bGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGZyZWVTdHlsZSA9IHRoaXMuX2ZyZWVTdHlsZTtcclxuICAgICAgICB2YXIgX2EgPSBlbnN1cmVTdHJpbmdPYmooZXh0ZW5kLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSksIHJlc3VsdCA9IF9hLnJlc3VsdCwgZGVidWdOYW1lID0gX2EuZGVidWdOYW1lO1xyXG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBkZWJ1Z05hbWUgPyBmcmVlU3R5bGUucmVnaXN0ZXJTdHlsZShyZXN1bHQsIGRlYnVnTmFtZSkgOiBmcmVlU3R5bGUucmVnaXN0ZXJTdHlsZShyZXN1bHQpO1xyXG4gICAgICAgIHRoaXMuX3N0eWxlVXBkYXRlZCgpO1xyXG4gICAgICAgIHJldHVybiBjbGFzc05hbWU7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFR5cGVTdHlsZTtcclxufSgpKTtcclxuZXhwb3J0IHsgVHlwZVN0eWxlIH07XHJcbiIsIi8qKiBSYWYgZm9yIG5vZGUgKyBicm93c2VyICovXHJcbmV4cG9ydCB2YXIgcmFmID0gdHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PT0gJ3VuZGVmaW5lZCdcclxuICAgIC8qKlxyXG4gICAgICogTWFrZSBzdXJlIHNldFRpbWVvdXQgaXMgYWx3YXlzIGludm9rZWQgd2l0aFxyXG4gICAgICogYHRoaXNgIHNldCB0byBgd2luZG93YCBvciBgZ2xvYmFsYCBhdXRvbWF0aWNhbGx5XHJcbiAgICAgKiovXHJcbiAgICA/IGZ1bmN0aW9uIChjYikgeyByZXR1cm4gc2V0VGltZW91dChjYik7IH1cclxuICAgIC8qKlxyXG4gICAgICogTWFrZSBzdXJlIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgaXMgYWx3YXlzIGludm9rZWQgd2l0aCBgdGhpc2Agd2luZG93XHJcbiAgICAgKiBXZSBtaWdodCBoYXZlIHJhZiB3aXRob3V0IHdpbmRvdyBpbiBjYXNlIG9mIGByYWYvcG9seWZpbGxgIChyZWNvbW1lbmRlZCBieSBSZWFjdClcclxuICAgICAqKi9cclxuICAgIDogdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCdcclxuICAgICAgICA/IHJlcXVlc3RBbmltYXRpb25GcmFtZVxyXG4gICAgICAgIDogcmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KTtcclxuLyoqXHJcbiAqIFV0aWxpdHkgdG8gam9pbiBjbGFzc2VzIGNvbmRpdGlvbmFsbHlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2VzKCkge1xyXG4gICAgdmFyIGNsYXNzZXMgPSBbXTtcclxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgY2xhc3Nlc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNsYXNzZXMuZmlsdGVyKGZ1bmN0aW9uIChjKSB7IHJldHVybiAhIWM7IH0pLmpvaW4oJyAnKTtcclxufVxyXG4vKipcclxuICogTWVyZ2VzIHZhcmlvdXMgc3R5bGVzIGludG8gYSBzaW5nbGUgc3R5bGUgb2JqZWN0LlxyXG4gKiBOb3RlOiBpZiB0d28gb2JqZWN0cyBoYXZlIHRoZSBzYW1lIHByb3BlcnR5IHRoZSBsYXN0IG9uZSB3aW5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKCkge1xyXG4gICAgdmFyIG9iamVjdHMgPSBbXTtcclxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgb2JqZWN0c1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgLyoqIFRoZSBmaW5hbCByZXN1bHQgd2Ugd2lsbCByZXR1cm4gKi9cclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGZvciAodmFyIF9hID0gMCwgb2JqZWN0c18xID0gb2JqZWN0czsgX2EgPCBvYmplY3RzXzEubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgdmFyIG9iamVjdCA9IG9iamVjdHNfMVtfYV07XHJcbiAgICAgICAgaWYgKG9iamVjdCA9PSBudWxsIHx8IG9iamVjdCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcclxuICAgICAgICAgICAgLyoqIEZhbHN5IHZhbHVlcyBleGNlcHQgYSBleHBsaWNpdCAwIGlzIGlnbm9yZWQgKi9cclxuICAgICAgICAgICAgdmFyIHZhbCA9IG9iamVjdFtrZXldO1xyXG4gICAgICAgICAgICBpZiAoIXZhbCAmJiB2YWwgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qKiBpZiBuZXN0ZWQgbWVkaWEgb3IgcHNldWRvIHNlbGVjdG9yICovXHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICckbmVzdCcgJiYgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHJlc3VsdFsnJG5lc3QnXSA/IGV4dGVuZChyZXN1bHRbJyRuZXN0J10sIHZhbCkgOiB2YWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoKGtleS5pbmRleE9mKCcmJykgIT09IC0xIHx8IGtleS5pbmRleE9mKCdAbWVkaWEnKSA9PT0gMCkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gcmVzdWx0W2tleV0gPyBleHRlbmQocmVzdWx0W2tleV0sIHZhbCkgOiB2YWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqIFV0aWxpdHkgdG8gaGVscCBjdXN0b21pemUgc3R5bGVzIHdpdGggbWVkaWEgcXVlcmllcy4gZS5nLlxyXG4gKiBgYGBcclxuICogc3R5bGUoXHJcbiAqICBtZWRpYSh7bWF4V2lkdGg6NTAwfSwge2NvbG9yOidyZWQnfSlcclxuICogKVxyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCB2YXIgbWVkaWEgPSBmdW5jdGlvbiAobWVkaWFRdWVyeSkge1xyXG4gICAgdmFyIG9iamVjdHMgPSBbXTtcclxuICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgb2JqZWN0c1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIHZhciBtZWRpYVF1ZXJ5U2VjdGlvbnMgPSBbXTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5LnR5cGUpXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2gobWVkaWFRdWVyeS50eXBlKTtcclxuICAgIGlmIChtZWRpYVF1ZXJ5Lm9yaWVudGF0aW9uKVxyXG4gICAgICAgIG1lZGlhUXVlcnlTZWN0aW9ucy5wdXNoKFwiKG9yaWVudGF0aW9uOiBcIiArIG1lZGlhUXVlcnkub3JpZW50YXRpb24gKyBcIilcIik7XHJcbiAgICBpZiAobWVkaWFRdWVyeS5taW5XaWR0aClcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihtaW4td2lkdGg6IFwiICsgbWVkaWFMZW5ndGgobWVkaWFRdWVyeS5taW5XaWR0aCkgKyBcIilcIik7XHJcbiAgICBpZiAobWVkaWFRdWVyeS5tYXhXaWR0aClcclxuICAgICAgICBtZWRpYVF1ZXJ5U2VjdGlvbnMucHVzaChcIihtYXgtd2lkdGg6IFwiICsgbWVkaWFMZW5ndGgobWVkaWFRdWVyeS5tYXhXaWR0aCkgKyBcIilcIik7XHJcbiAgICBpZiAobWVkaWFRdWVyeS5taW5IZWlnaHQpXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIobWluLWhlaWdodDogXCIgKyBtZWRpYUxlbmd0aChtZWRpYVF1ZXJ5Lm1pbkhlaWdodCkgKyBcIilcIik7XHJcbiAgICBpZiAobWVkaWFRdWVyeS5tYXhIZWlnaHQpXHJcbiAgICAgICAgbWVkaWFRdWVyeVNlY3Rpb25zLnB1c2goXCIobWF4LWhlaWdodDogXCIgKyBtZWRpYUxlbmd0aChtZWRpYVF1ZXJ5Lm1heEhlaWdodCkgKyBcIilcIik7XHJcbiAgICB2YXIgc3RyaW5nTWVkaWFRdWVyeSA9IFwiQG1lZGlhIFwiICsgbWVkaWFRdWVyeVNlY3Rpb25zLmpvaW4oJyBhbmQgJyk7XHJcbiAgICB2YXIgb2JqZWN0ID0ge1xyXG4gICAgICAgICRuZXN0OiAoX2EgPSB7fSxcclxuICAgICAgICAgICAgX2Fbc3RyaW5nTWVkaWFRdWVyeV0gPSBleHRlbmQuYXBwbHkodm9pZCAwLCBvYmplY3RzKSxcclxuICAgICAgICAgICAgX2EpXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG9iamVjdDtcclxuICAgIHZhciBfYTtcclxufTtcclxudmFyIG1lZGlhTGVuZ3RoID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogdmFsdWUgKyBcInB4XCI7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gUmVhY3Q7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vU2NyaXB0cy9UU1gvalF1ZXJ5VUkgV2lkZ2V0cy9UaW1lQ29ycmVsYXRlZFNhZ3MudHN4XCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9