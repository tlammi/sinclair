'use strict';

function createElement (query, ns) {
  var ref = parse(query);
  var tag = ref.tag;
  var id = ref.id;
  var className = ref.className;
  var element = ns ? document.createElementNS(ns, tag) : document.createElement(tag);

  if (id) {
    element.id = id;
  }

  if (className) {
    if (ns) {
      element.setAttribute('class', className);
    } else {
      element.className = className;
    }
  }

  return element;
}

function parse (query) {
  var chunks = query.split(/([.#])/);
  var className = '';
  var id = '';

  for (var i = 1; i < chunks.length; i += 2) {
    switch (chunks[i]) {
      case '.':
        className += " " + (chunks[i + 1]);
        break;

      case '#':
        id = chunks[i + 1];
    }
  }

  return {
    className: className.trim(),
    tag: chunks[0] || 'div',
    id: id
  };
}

function unmount (parent, child) {
  var parentEl = getEl(parent);
  var childEl = getEl(child);

  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }

  if (childEl.parentNode) {
    doUnmount(child, childEl, parentEl);

    parentEl.removeChild(childEl);
  }

  return child;
}

function doUnmount (child, childEl, parentEl) {
  var hooks = childEl.__redom_lifecycle;

  if (hooksAreEmpty(hooks)) {
    childEl.__redom_lifecycle = {};
    return;
  }

  var traverse = parentEl;

  if (childEl.__redom_mounted) {
    trigger(childEl, 'onunmount');
  }

  while (traverse) {
    var parentHooks = traverse.__redom_lifecycle || {};

    for (var hook in hooks) {
      if (parentHooks[hook]) {
        parentHooks[hook] -= hooks[hook];
      }
    }

    if (hooksAreEmpty(parentHooks)) {
      traverse.__redom_lifecycle = null;
    }

    traverse = traverse.parentNode;
  }
}

function hooksAreEmpty (hooks) {
  if (hooks == null) {
    return true;
  }
  for (var key in hooks) {
    if (hooks[key]) {
      return false;
    }
  }
  return true;
}

/* global Node, ShadowRoot */

var hookNames = ['onmount', 'onremount', 'onunmount'];
var shadowRootAvailable = typeof window !== 'undefined' && 'ShadowRoot' in window;

function mount (parent, child, before, replace) {
  var parentEl = getEl(parent);
  var childEl = getEl(child);

  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }

  if (child !== childEl) {
    childEl.__redom_view = child;
  }

  var wasMounted = childEl.__redom_mounted;
  var oldParent = childEl.parentNode;

  if (wasMounted && (oldParent !== parentEl)) {
    doUnmount(child, childEl, oldParent);
  }

  if (before != null) {
    if (replace) {
      var beforeEl = getEl(before);

      if (beforeEl.__redom_mounted) {
        trigger(beforeEl, 'onunmount');
      }

      parentEl.replaceChild(childEl, beforeEl);
    } else {
      parentEl.insertBefore(childEl, getEl(before));
    }
  } else {
    parentEl.appendChild(childEl);
  }

  doMount(child, childEl, parentEl, oldParent);

  return child;
}

function trigger (el, eventName) {
  if (eventName === 'onmount' || eventName === 'onremount') {
    el.__redom_mounted = true;
  } else if (eventName === 'onunmount') {
    el.__redom_mounted = false;
  }

  var hooks = el.__redom_lifecycle;

  if (!hooks) {
    return;
  }

  var view = el.__redom_view;
  var hookCount = 0;

  view && view[eventName] && view[eventName]();

  for (var hook in hooks) {
    if (hook) {
      hookCount++;
    }
  }

  if (hookCount) {
    var traverse = el.firstChild;

    while (traverse) {
      var next = traverse.nextSibling;

      trigger(traverse, eventName);

      traverse = next;
    }
  }
}

function doMount (child, childEl, parentEl, oldParent) {
  var hooks = childEl.__redom_lifecycle || (childEl.__redom_lifecycle = {});
  var remount = (parentEl === oldParent);
  var hooksFound = false;

  for (var i = 0, list = hookNames; i < list.length; i += 1) {
    var hookName = list[i];

    if (!remount) { // if already mounted, skip this phase
      if (child !== childEl) { // only Views can have lifecycle events
        if (hookName in child) {
          hooks[hookName] = (hooks[hookName] || 0) + 1;
        }
      }
    }
    if (hooks[hookName]) {
      hooksFound = true;
    }
  }

  if (!hooksFound) {
    childEl.__redom_lifecycle = {};
    return;
  }

  var traverse = parentEl;
  var triggered = false;

  if (remount || (traverse && traverse.__redom_mounted)) {
    trigger(childEl, remount ? 'onremount' : 'onmount');
    triggered = true;
  }

  while (traverse) {
    var parent = traverse.parentNode;
    var parentHooks = traverse.__redom_lifecycle || (traverse.__redom_lifecycle = {});

    for (var hook in hooks) {
      parentHooks[hook] = (parentHooks[hook] || 0) + hooks[hook];
    }

    if (triggered) {
      break;
    } else {
      if (traverse.nodeType === Node.DOCUMENT_NODE ||
        (shadowRootAvailable && (traverse instanceof ShadowRoot)) ||
        (parent && parent.__redom_mounted)
      ) {
        trigger(traverse, remount ? 'onremount' : 'onmount');
        triggered = true;
      }
      traverse = parent;
    }
  }
}

function setStyle (view, arg1, arg2) {
  var el = getEl(view);

  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setStyleValue(el, key, arg1[key]);
    }
  } else {
    setStyleValue(el, arg1, arg2);
  }
}

function setStyleValue (el, key, value) {
  el.style[key] = value == null ? '' : value;
}

/* global SVGElement */

var xlinkns = 'http://www.w3.org/1999/xlink';

function setAttr (view, arg1, arg2) {
  setAttrInternal(view, arg1, arg2);
}

function setAttrInternal (view, arg1, arg2, initial) {
  var el = getEl(view);

  var isObj = typeof arg1 === 'object';

  if (isObj) {
    for (var key in arg1) {
      setAttrInternal(el, key, arg1[key], initial);
    }
  } else {
    var isSVG = el instanceof SVGElement;
    var isFunc = typeof arg2 === 'function';

    if (arg1 === 'style' && typeof arg2 === 'object') {
      setStyle(el, arg2);
    } else if (isSVG && isFunc) {
      el[arg1] = arg2;
    } else if (arg1 === 'dataset') {
      setData(el, arg2);
    } else if (!isSVG && (arg1 in el || isFunc) && (arg1 !== 'list')) {
      el[arg1] = arg2;
    } else {
      if (isSVG && (arg1 === 'xlink')) {
        setXlink(el, arg2);
        return;
      }
      if (initial && arg1 === 'class') {
        arg2 = el.className + ' ' + arg2;
      }
      if (arg2 == null) {
        el.removeAttribute(arg1);
      } else {
        el.setAttribute(arg1, arg2);
      }
    }
  }
}

function setXlink (el, arg1, arg2) {
  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setXlink(el, key, arg1[key]);
    }
  } else {
    if (arg2 != null) {
      el.setAttributeNS(xlinkns, arg1, arg2);
    } else {
      el.removeAttributeNS(xlinkns, arg1, arg2);
    }
  }
}

function setData (el, arg1, arg2) {
  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setData(el, key, arg1[key]);
    }
  } else {
    if (arg2 != null) {
      el.dataset[arg1] = arg2;
    } else {
      delete el.dataset[arg1];
    }
  }
}

function text (str) {
  return document.createTextNode((str != null) ? str : '');
}

function parseArgumentsInternal (element, args, initial) {
  for (var i = 0, list = args; i < list.length; i += 1) {
    var arg = list[i];

    if (arg !== 0 && !arg) {
      continue;
    }

    var type = typeof arg;

    if (type === 'function') {
      arg(element);
    } else if (type === 'string' || type === 'number') {
      element.appendChild(text(arg));
    } else if (isNode(getEl(arg))) {
      mount(element, arg);
    } else if (arg.length) {
      parseArgumentsInternal(element, arg, initial);
    } else if (type === 'object') {
      setAttrInternal(element, arg, null, initial);
    }
  }
}

function ensureEl (parent) {
  return typeof parent === 'string' ? html(parent) : getEl(parent);
}

function getEl (parent) {
  return (parent.nodeType && parent) || (!parent.el && parent) || getEl(parent.el);
}

function isNode (arg) {
  return arg && arg.nodeType;
}

function html (query) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var element;

  var type = typeof query;

  if (type === 'string') {
    element = createElement(query);
  } else if (type === 'function') {
    var Query = query;
    element = new (Function.prototype.bind.apply( Query, [ null ].concat( args) ));
  } else {
    throw new Error('At least one argument required');
  }

  parseArgumentsInternal(getEl(element), args, true);

  return element;
}

var el = html;
var h = html;

html.extend = function extendHtml () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return html.bind.apply(html, [ this ].concat( args ));
};

function setChildren (parent) {
  var children = [], len = arguments.length - 1;
  while ( len-- > 0 ) children[ len ] = arguments[ len + 1 ];

  var parentEl = getEl(parent);
  var current = traverse(parent, children, parentEl.firstChild);

  while (current) {
    var next = current.nextSibling;

    unmount(parent, current);

    current = next;
  }
}

function traverse (parent, children, _current) {
  var current = _current;

  var childEls = Array(children.length);

  for (var i = 0; i < children.length; i++) {
    childEls[i] = children[i] && getEl(children[i]);
  }

  for (var i$1 = 0; i$1 < children.length; i$1++) {
    var child = children[i$1];

    if (!child) {
      continue;
    }

    var childEl = childEls[i$1];

    if (childEl === current) {
      current = current.nextSibling;
      continue;
    }

    if (isNode(childEl)) {
      var next = current && current.nextSibling;
      var exists = child.__redom_index != null;
      var replace = exists && next === childEls[i$1 + 1];

      mount(parent, child, current, replace);

      if (replace) {
        current = next;
      }

      continue;
    }

    if (child.length != null) {
      current = traverse(parent, child, current);
    }
  }

  return current;
}

function listPool (View, key, initData) {
  return new ListPool(View, key, initData);
}

var ListPool = function ListPool (View, key, initData) {
  this.View = View;
  this.initData = initData;
  this.oldLookup = {};
  this.lookup = {};
  this.oldViews = [];
  this.views = [];

  if (key != null) {
    this.key = typeof key === 'function' ? key : propKey(key);
  }
};

ListPool.prototype.update = function update (data, context) {
  var ref = this;
    var View = ref.View;
    var key = ref.key;
    var initData = ref.initData;
  var keySet = key != null;

  var oldLookup = this.lookup;
  var newLookup = {};

  var newViews = Array(data.length);
  var oldViews = this.views;

  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var view = (void 0);

    if (keySet) {
      var id = key(item);

      view = oldLookup[id] || new View(initData, item, i, data);
      newLookup[id] = view;
      view.__redom_id = id;
    } else {
      view = oldViews[i] || new View(initData, item, i, data);
    }
    view.update && view.update(item, i, data, context);

    var el = getEl(view.el);

    el.__redom_view = view;
    newViews[i] = view;
  }

  this.oldViews = oldViews;
  this.views = newViews;

  this.oldLookup = oldLookup;
  this.lookup = newLookup;
};

function propKey (key) {
  return function (item) {
    return item[key];
  };
}

function list (parent, View, key, initData) {
  return new List(parent, View, key, initData);
}

var List = function List (parent, View, key, initData) {
  this.View = View;
  this.initData = initData;
  this.views = [];
  this.pool = new ListPool(View, key, initData);
  this.el = ensureEl(parent);
  this.keySet = key != null;
};

List.prototype.update = function update (data, context) {
    if ( data === void 0 ) data = [];

  var ref = this;
    var keySet = ref.keySet;
  var oldViews = this.views;

  this.pool.update(data, context);

  var ref$1 = this.pool;
    var views = ref$1.views;
    var lookup = ref$1.lookup;

  if (keySet) {
    for (var i = 0; i < oldViews.length; i++) {
      var oldView = oldViews[i];
      var id = oldView.__redom_id;

      if (lookup[id] == null) {
        oldView.__redom_index = null;
        unmount(this, oldView);
      }
    }
  }

  for (var i$1 = 0; i$1 < views.length; i$1++) {
    var view = views[i$1];

    view.__redom_index = i$1;
  }

  setChildren(this, views);

  if (keySet) {
    this.lookup = lookup;
  }
  this.views = views;
};

List.extend = function extendList (parent, View, key, initData) {
  return List.bind(List, parent, View, key, initData);
};

list.extend = List.extend;

/* global Node */

function place (View, initData) {
  return new Place(View, initData);
}

var Place = function Place (View, initData) {
  this.el = text('');
  this.visible = false;
  this.view = null;
  this._placeholder = this.el;

  if (View instanceof Node) {
    this._el = View;
  } else if (View.el instanceof Node) {
    this._el = View;
    this.view = View;
  } else {
    this._View = View;
  }

  this._initData = initData;
};

Place.prototype.update = function update (visible, data) {
  var placeholder = this._placeholder;
  var parentNode = this.el.parentNode;

  if (visible) {
    if (!this.visible) {
      if (this._el) {
        mount(parentNode, this._el, placeholder);
        unmount(parentNode, placeholder);

        this.el = getEl(this._el);
        this.visible = visible;
      } else {
        var View = this._View;
        var view = new View(this._initData);

        this.el = getEl(view);
        this.view = view;

        mount(parentNode, view, placeholder);
        unmount(parentNode, placeholder);
      }
    }
    this.view && this.view.update && this.view.update(data);
  } else {
    if (this.visible) {
      if (this._el) {
        mount(parentNode, placeholder, this._el);
        unmount(parentNode, this._el);

        this.el = placeholder;
        this.visible = visible;

        return;
      }
      mount(parentNode, placeholder, this.view);
      unmount(parentNode, this.view);

      this.el = placeholder;
      this.view = null;
    }
  }
  this.visible = visible;
};

/* global Node */

function router (parent, Views, initData) {
  return new Router(parent, Views, initData);
}

var Router = function Router (parent, Views, initData) {
  this.el = ensureEl(parent);
  this.Views = Views;
  this.initData = initData;
};

Router.prototype.update = function update (route, data) {
  if (route !== this.route) {
    var Views = this.Views;
    var View = Views[route];

    this.route = route;

    if (View && (View instanceof Node || View.el instanceof Node)) {
      this.view = View;
    } else {
      this.view = View && new View(this.initData, data);
    }

    setChildren(this.el, [this.view]);
  }
  this.view && this.view.update && this.view.update(data, route);
};

var ns = 'http://www.w3.org/2000/svg';

function svg (query) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var element;

  var type = typeof query;

  if (type === 'string') {
    element = createElement(query, ns);
  } else if (type === 'function') {
    var Query = query;
    element = new (Function.prototype.bind.apply( Query, [ null ].concat( args) ));
  } else {
    throw new Error('At least one argument required');
  }

  parseArgumentsInternal(getEl(element), args, true);

  return element;
}

var s = svg;

svg.extend = function extendSvg () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return svg.bind.apply(svg, [ this ].concat( args ));
};

svg.ns = ns;

var redom_es = /*#__PURE__*/Object.freeze({
  __proto__: null,
  List: List,
  ListPool: ListPool,
  Place: Place,
  Router: Router,
  el: el,
  h: h,
  html: html,
  list: list,
  listPool: listPool,
  mount: mount,
  place: place,
  router: router,
  s: s,
  setAttr: setAttr,
  setChildren: setChildren,
  setData: setData,
  setStyle: setStyle,
  setXlink: setXlink,
  svg: svg,
  text: text,
  unmount: unmount
});

// License: Any of the licenses in https://github.com/tlammi/sinclair/tree/licenses
/**
 * Extended and standard sinclair formula implementations
 *
 * Standard sinclair coefficient is calculated with formula
 * 10^(A*log10(bw/b))
 * where
 * A is a constant coefficient
 * b is the world record holder's weight in heavy weight class
 * bw is the lifter's body weight
 *
 * The extended formula uses additional coefficients to take into account the lifter's age and sex.
 *
 * Sex is adjusted with a constant. Female points can be converted to male points by
 * multiplying with a constant and otherway around. The lifter's age is taken into
 * account by using age-specific coefficients. Lifters age 30 and under have
 * a coefficient of 1.0.
 * */
var sinclair;
(function (sinclair) {
  var min = Math.min;
  var max = Math.max;
  var log10 = Math.log10;
  var pow = Math.pow;
  var sqrt = Math.sqrt;
  // Coefficient for converting female to male Sinclair points
  var FEMALE_TO_MALE_COEFF = 1.354;
  /**
   * Age coefficients for ages 30-90
   * */
  var MELTZER_FABER = [1.0, 1.016, 1.031, 1.046, 1.059, 1.072, 1.083, 1.096, 1.109, 1.122, 1.135, 1.149, 1.162, 1.176, 1.189, 1.203, 1.218, 1.233, 1.248, 1.263, 1.279, 1.297, 1.316, 1.338, 1.361, 1.385, 1.411, 1.437, 1.462, 1.488, 1.514, 1.541, 1.568, 1.598, 1.629, 1.663, 1.699, 1.738, 1.779, 1.823, 1.867, 1.91, 1.953, 2.004, 2.06, 2.117, 2.181, 2.255, 2.336, 2.419, 2.504, 2.597, 2.702, 2.831, 2.981, 3.153, 3.352, 3.58, 3.843, 4.145, 4.493];
  var Sex;
  (function (Sex) {
    Sex[Sex["Male"] = 0] = "Male";
    Sex[Sex["Female"] = 1] = "Female";
  })(Sex = sinclair.Sex || (sinclair.Sex = {}));
  // Standard "A" coefficient for sinclair coefficient
  function coeff_a(s) {
    switch (s) {
      case Sex.Male:
        return 0.75194503;
      case Sex.Female:
        return 0.783497476;
    }
  }
  sinclair.coeff_a = coeff_a;
  // Standard "b" coefficient for sinclair coefficient
  function coeff_b(s) {
    switch (s) {
      case Sex.Male:
        return 175.508;
      case Sex.Female:
        return 153.655;
    }
  }
  sinclair.coeff_b = coeff_b;
  // Sex projection coefficient
  function coeff_sex(real, projected) {
    if (real === projected) return 1.0;
    if (real === Sex.Male) return 1 / FEMALE_TO_MALE_COEFF;
    return FEMALE_TO_MALE_COEFF;
  }
  sinclair.coeff_sex = coeff_sex;
  // Age coefficient
  function coeff_age(age) {
    var idx = max(0, min(age - 30, MELTZER_FABER.length - 1));
    return MELTZER_FABER[idx];
  }
  sinclair.coeff_age = coeff_age;
  /**
   * Extended sinclair coefficient
   *
   * @param a Sinclair A
   * @param b Sinclair b
   * @param c Sex or age coefficient. Interchangeable with d
   * @param d Sex or age coefficient. interchangeable with c
   * @param bw Body weight
   * */
  function coeff_extended(a, b, c, d, bw) {
    if (bw < b) {
      var exp = a * pow(log10(bw / b), 2);
      return c * d * pow(10, exp);
    }
    return c * d;
  }
  sinclair.coeff_extended = coeff_extended;
  /**
   * Normal sinclair coefficient
   * */
  function coeff(a, b, bw) {
    return coeff_extended(a, b, 1.0, 1.0, bw);
  }
  sinclair.coeff = coeff;
  /// Extended sinclair score
  function score_extended(a, b, sex_coeff, age_coeff, bw, result) {
    return coeff_extended(a, b, sex_coeff, age_coeff, bw) * result;
  }
  sinclair.score_extended = score_extended;
  /// Standard sinclair score
  function score(a, b, bw, result) {
    return coeff(a, b, bw) * result;
  }
  sinclair.score = score;
  /// Extended sinclair formula for calculating lifted weight
  function weight_extended(a, b, sex_coeff, age_coeff, bw, score) {
    return score / coeff_extended(a, b, sex_coeff, age_coeff, bw);
  }
  sinclair.weight_extended = weight_extended;
  /// Standard sinclair formula for calculating lifted weight
  function weight(a, b, bw, score) {
    return score / coeff(a, b, bw);
  }
  sinclair.weight = weight;
  /// Extended sinclair formula for calculating lifter weight
  function body_weight_extended(a, b, sex_coeff, age_coeff, weight, score) {
    // Cannot deduce weight in this case
    if (score <= sex_coeff * age_coeff * weight) return b;
    var exp = -sqrt(log10(score / (sex_coeff * age_coeff * weight)) / a);
    return b * pow(10, exp);
  }
  sinclair.body_weight_extended = body_weight_extended;
  /// Standard sinclair formula for calculating lifter weight
  function body_weight(a, b, weight, score) {
    return body_weight_extended(a, b, 1.0, 1.0, weight, score);
  }
  sinclair.body_weight = body_weight;
})(sinclair || (sinclair = {}));

// License: Any of the licenses in https://github.com/tlammi/sinclair/tree/licenses
var app;
(function (app) {
  // Decimal separator
  var DecSep;
  (function (DecSep) {
    DecSep[DecSep["None"] = 0] = "None";
    DecSep[DecSep["Comma"] = 1] = "Comma";
    DecSep[DecSep["Dot"] = 2] = "Dot";
  })(DecSep || (DecSep = {}));
  /**
   * Decide, based on multiple values, if the output should use comma or dot
   */
  function use_comma() {
    for (var _len = arguments.length, seps = new Array(_len), _key = 0; _key < _len; _key++) {
      seps[_key] = arguments[_key];
    }
    for (var _i = 0, _seps = seps; _i < _seps.length; _i++) {
      var sep = _seps[_i];
      if (sep === DecSep.Comma) return true;else if (sep === DecSep.Dot) return false;
    }
    return false;
  }
  /// Output precision
  var DECIMAL_DIGITS = 3;
  /// Valued type used for testing or for discarding values
  var Null = function Null() {
    this.value = '';
  };
  app.Null = Null;
  /**
   * Arguments passed to the application
   *
   * These act as both inputs and outputs for the
   * application depending on the performed calculation
   */
  var Args = function Args() {
    // Lifted weight in kg
    this.lifted_weight = new Null();
    // Lifter's body weight in kg
    this.body_weight = new Null();
    // Acts as an output where the calculated Sinclair coefficient is placed in
    this.coeff = new Null();
    // Sinclair score
    this.score = new Null();
    // Sex of the lifter
    this.sex = sinclair.Sex.Male;
    // "projected sex" for the lifter. This can be used to convert
    // male points to female points or other way around
    this.sex_projected = sinclair.Sex.Male;
    // Lifter age in years. Used for age coefficients.
    // This has effect only after 30.
    this.age = 0;
  };
  app.Args = Args;
  var ParsedArgs = function ParsedArgs() {
    this.a = 0;
    this.b = 0;
    this.coeff_sex = 0;
    this.coeff_age = 0;
  };
  function parse_args(args) {
    var out = new ParsedArgs();
    out.a = sinclair.coeff_a(args.sex);
    out.b = sinclair.coeff_b(args.sex);
    out.coeff_sex = sinclair.coeff_sex(args.sex, args.sex_projected);
    out.coeff_age = sinclair.coeff_age(args.age);
    return out;
  }
  /**
   * convert string to (number, separator)
   *
   * "1.0" -> (1.0, false)
   * "10,2" -> (10.2, true)
   */
  function to_number(input) {
    var has_comma = input.value.indexOf(',') !== -1;
    var has_dot = input.value.indexOf('.') !== -1;
    var val = input.value.replace(',', '.');
    var sep = DecSep.None;
    if (has_comma) sep = DecSep.Comma;else if (has_dot) sep = DecSep.Dot;
    return [Number(val), sep];
  }
  function to_string(input, comma) {
    var str = input.toFixed(DECIMAL_DIGITS);
    if (comma) {
      return str.replace('.', ',');
    }
    return str;
  }
  function extended_sinclair_score(args) {
    var _to_number = to_number(args.lifted_weight),
      lw = _to_number[0],
      sep_lw = _to_number[1];
    var _to_number2 = to_number(args.body_weight),
      bw = _to_number2[0],
      sep_bw = _to_number2[1];
    var comma = use_comma(sep_lw, sep_bw);
    var parsed = parse_args(args);
    var score = sinclair.score_extended(parsed.a, parsed.b, parsed.coeff_sex, parsed.coeff_age, bw, lw);
    var coeff = sinclair.coeff_extended(parsed.a, parsed.b, parsed.coeff_sex, parsed.coeff_age, bw);
    args.coeff.value = to_string(coeff, comma);
    args.score.value = to_string(score, comma);
  }
  app.extended_sinclair_score = extended_sinclair_score;
  function extended_sinclair_lifted_weight(args) {
    var _to_number3 = to_number(args.score),
      score = _to_number3[0],
      sep_sc = _to_number3[1];
    var _to_number4 = to_number(args.body_weight),
      bw = _to_number4[0],
      sep_bw = _to_number4[1];
    var comma = use_comma(sep_sc, sep_bw);
    var parsed = parse_args(args);
    var weight = sinclair.weight_extended(parsed.a, parsed.b, parsed.coeff_sex, parsed.coeff_age, bw, score);
    var coeff = sinclair.coeff_extended(parsed.a, parsed.b, parsed.coeff_sex, parsed.coeff_age, bw);
    args.coeff.value = to_string(coeff, comma);
    args.lifted_weight.value = to_string(weight, comma);
  }
  app.extended_sinclair_lifted_weight = extended_sinclair_lifted_weight;
  function extended_sinclair_body_weight(args) {
    var _to_number5 = to_number(args.lifted_weight),
      lw = _to_number5[0],
      sep_lw = _to_number5[1];
    var _to_number6 = to_number(args.score),
      sc = _to_number6[0],
      sep_sc = _to_number6[1];
    var comma = use_comma(sep_lw, sep_sc);
    var parsed = parse_args(args);
    var bw = sinclair.body_weight_extended(parsed.a, parsed.b, parsed.coeff_sex, parsed.coeff_age, lw, sc);
    var coeff = sinclair.coeff_extended(parsed.a, parsed.b, parsed.coeff_sex, parsed.coeff_age, bw);
    args.coeff.value = to_string(coeff, comma);
    args.body_weight.value = to_string(bw, comma);
  }
  app.extended_sinclair_body_weight = extended_sinclair_body_weight;
})(app || (app = {}));

// License: Any of the licenses in https://github.com/tlammi/sinclair/tree/licenses
/**
 * Generate an array row
 * */
function row() {
  var tds = [];
  for (var _len = arguments.length, elems = new Array(_len), _key = 0; _key < _len; _key++) {
    elems[_key] = arguments[_key];
  }
  elems.forEach(function (elem) {
    tds.push(redom_es.el('td', elem));
  });
  return redom_es.el.apply(void 0, ['tr'].concat(tds));
}
/**
 * Generate a table
 * */
function table() {
  for (var _len2 = arguments.length, rows = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    rows[_key2] = arguments[_key2];
  }
  var tbody = redom_es.el.apply(void 0, ['tbody'].concat(rows));
  return redom_es.el('table', tbody);
}
/**
 * Create a radio button
 * */
function radio(group, option) {
  var id = group + '-' + option;
  var rdio = redom_es.el('input', {
    name: group,
    id: id,
    type: 'radio',
    value: option
  });
  var lbl = redom_es.el('label', option, {
    "for": id
  });
  return [rdio, lbl];
}
/**
 * Create a group of radio buttons for controlling a single state
 * */
function radio_group(group, onclick) {
  var members = [];
  var idx = 0;
  function make_cb(i) {
    return function () {
      onclick(i);
    };
  }
  for (var _len3 = arguments.length, options = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    options[_key3 - 2] = arguments[_key3];
  }
  options.forEach(function (opt) {
    var _radio = radio(group, opt),
      rdio = _radio[0],
      lbl = _radio[1];
    rdio.addEventListener('click', make_cb(idx));
    members.push(rdio, lbl, redom_es.el('br'));
    ++idx;
  });
  members[0].checked = true;
  return members;
}
/**
 * HTML button
 * */
function button(label, onclick) {
  if (onclick === void 0) {
    onclick = null;
  }
  var btn = redom_es.el('button', label);
  if (onclick) {
    btn.addEventListener('click', onclick);
  }
  return btn;
}
/**
 * HTML input field
 * */
function input(initial_value, readonly) {
  if (readonly === void 0) {
    readonly = null;
  }
  var ipt = redom_es.el('input', {
    type: 'text',
    value: initial_value,
    readonly: readonly
  });
  return ipt;
}
/**
 * Generic calculator element population
 * */
function populate_calculator(id, calculator, populator) {
  var root = document.getElementById(id);
  if (!root) {
    console.log("Could not find element with id \"" + id + "\"");
    return;
  }
  var args = new app.Args();
  var formula_line = row('Laskentakaava:', radio_group(id + '-formula', function (value) {
    switch (value) {
      case 0:
        args.sex = sinclair.Sex.Male;
        args.sex_projected = sinclair.Sex.Male;
        break;
      case 1:
        args.sex = sinclair.Sex.Female;
        args.sex_projected = sinclair.Sex.Female;
        break;
      case 2:
        args.sex = sinclair.Sex.Female;
        args.sex_projected = sinclair.Sex.Male;
        break;
      default:
        console.warn('Unknown setting in formula radio: ' + value);
    }
    console.log('radio: ' + value);
  }, 'mies', 'nainen', "nainen \u2192 mies *"));
  var _populator = populator(args, calculator),
    in1 = _populator[0],
    in2 = _populator[1],
    out = _populator[2];
  var btn_line = row(button('Laske', function () {
    calculator(args);
  }));
  var coeff_o = input('', true);
  args.coeff = coeff_o;
  var coeff_line = row('Sinclair-kerroin:', coeff_o);
  var tbl = table(formula_line, in1, in2, btn_line, coeff_line, out);
  redom_es.mount(root, tbl);
}
function populate_info(id) {
  var root = document.getElementById(id);
  if (!root) {
    console.log("Could not find element with id \"" + id + "\"");
    return;
  }
  var p = redom_es.el('p', '* Muunnos naisten pisteistä miesten pisteiksi');
  redom_es.mount(root, p);
}
function handle_keypress(args, calculator) {
  return function (e) {
    if (e.key === 'Enter') calculator(args);
  };
}
function score_populator(args, calculator) {
  var w_i = input('');
  var bw_i = input('');
  var score_o = input('', true);
  w_i.addEventListener('keypress', handle_keypress(args, calculator));
  bw_i.addEventListener('keypress', handle_keypress(args, calculator));
  args.lifted_weight = w_i;
  args.body_weight = bw_i;
  args.score = score_o;
  return [row('Tulos:', w_i), row('Paino:', bw_i), row('Pisteet:', score_o)];
}
populate_calculator('sinclair_score', app.extended_sinclair_score, score_populator);
function populate_lw(args, calculator) {
  var s_i = input('');
  var bw_i = input('');
  var w_o = input('', true);
  s_i.addEventListener('keypress', handle_keypress(args, calculator));
  bw_i.addEventListener('keypress', handle_keypress(args, calculator));
  args.score = s_i;
  args.body_weight = bw_i;
  args.lifted_weight = w_o;
  return [row('Pisteet:', s_i), row('Paino:', bw_i), row('Tulos:', w_o)];
}
populate_calculator('sinclair_weight', app.extended_sinclair_lifted_weight, populate_lw);
function populate_bw(args, calculator) {
  var s_i = input('');
  var w_i = input('');
  var bw_o = input('', true);
  s_i.addEventListener('keypress', handle_keypress(args, calculator));
  w_i.addEventListener('keypress', handle_keypress(args, calculator));
  args.score = s_i;
  args.lifted_weight = w_i;
  args.body_weight = bw_o;
  return [row('Pisteet:', s_i), row('Tulos', w_i), row('Paino:', bw_o)];
}
populate_calculator('sinclair_bw', app.extended_sinclair_body_weight, populate_bw);
populate_info('sinclair_info');
