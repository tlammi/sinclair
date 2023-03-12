(function () {
  'use strict';

  var A_MALE = 0.751945030;
  var B_MALE = 175.508;
  var A_FEMALE = 0.783497476;
  var B_FEMALE = 153.655;
  var LOG10_BASE = Math.log(10);
  var log10 = function (x) {
    return Math.log(x) / LOG10_BASE;
  };
  var sqrt = Math.sqrt;
  var pow = Math.pow;
  var Sex;
  (function (Sex) {
    Sex[Sex["Male"] = 0] = "Male";
    Sex[Sex["Female"] = 1] = "Female";
  })(Sex || (Sex = {}));
  function sinclair_coeff_a_and_b(sex) {
    if (sex == Sex.Male) return [A_MALE, B_MALE];
    return [A_FEMALE, B_FEMALE];
  }
  /**
   * 10^(a*X^2) where X is log10(body_weight/b)
  * */
  function sinclair_coeff(a, b, body_weight) {
    if (body_weight > b) return 1.0;
    var exp = a * pow(log10(body_weight / b), 2);
    return pow(10, exp);
  }
  function sinclair_coeff_by_sex(sex, body_weight) {
    var _a = sinclair_coeff_a_and_b(sex),
      a = _a[0],
      b = _a[1];
    return sinclair_coeff(a, b, body_weight);
  }
  /**
   * (kg, sinclair_score) -> body_weight
  * */
  function sinclair_bw(sex) {
    return function (kg, score) {
      var _a = sinclair_coeff_a_and_b(sex),
        a = _a[0],
        b = _a[1];
      var tolerance = 0.01;
      if (kg >= score - tolerance) return b;
      var exp = log10(b) - sqrt(log10(score / kg) / a);
      return pow(10, exp);
    };
  }

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

  html.extend = function extendHtml () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return html.bind.apply(html, [ this ].concat( args ));
  };

  var __spreadArray = this && this.__spreadArray || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  function line() {
    var elems = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      elems[_i] = arguments[_i];
    }
    var tds = [];
    elems.forEach(function (elem) {
      tds.push(el("td", elem));
    });
    return el.apply(void 0, __spreadArray(["tr"], tds, false));
  }
  function table() {
    var rows = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      rows[_i] = arguments[_i];
    }
    var tbody = el.apply(void 0, __spreadArray(["tbody"], rows, false));
    return el("table", tbody);
  }
  function radio(group, option) {
    var id = group + "-" + option;
    var rdio = el("input", {
      name: group,
      id: id,
      type: "radio",
      value: option
    });
    var lbl = el("label", option, {
      "for": id
    });
    return [rdio, lbl];
  }
  function radio_group(group, onclick) {
    var options = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      options[_i - 2] = arguments[_i];
    }
    var members = [];
    var idx = 0;
    function make_cb(i) {
      return function () {
        onclick(i);
      };
    }
    options.forEach(function (opt) {
      var _a = radio(group, opt),
        rdio = _a[0],
        lbl = _a[1];
      rdio.addEventListener("click", make_cb(idx));
      members.push(rdio, lbl);
      ++idx;
    });
    return members;
  }
  function button(label, onclick) {
    if (onclick === void 0) {
      onclick = null;
    }
    var btn = el("button", label);
    if (onclick) {
      btn.addEventListener("click", onclick);
    }
    return btn;
  }
  function input(initial_value) {
    var ipt = el("input", {
      type: "text",
      value: initial_value
    });
    return ipt;
  }
  /**
   * Populate a sinclair calculator section
   *
   * @param {section_id} HTML id to populate
   * @param {input1} Name of the 1st input field
   * @param {input2} Name of the 2nd input field
   * @param {output} Name of the output field
  * */
  function populate_section(section_id, input1, input2, output, output_fn) {
    var obj = document.getElementById(section_id);
    if (!obj) {
      console.log("Could not find " + section_id);
      return;
    }
    var ipt_1 = input("");
    var ipt_2 = input("");
    var coeff = el("p");
    var out = el("p");
    var sex = Sex.Male;
    var populate_result_fields = function () {
      var val_1 = Number(ipt_1.value);
      var val_2 = Number(ipt_2.value);
      var _a = output_fn(sex, val_1, val_2),
        coeff_val = _a[0],
        out_val = _a[1];
      coeff.innerHTML = coeff_val;
      out.innerHTML = out_val;
    };
    var cb = function (e) {
      if (e.type == "click" || e.type == "keypress" && e.key == "Enter") {
        populate_result_fields();
      }
    };
    var btn = button("Laske", cb);
    ipt_1.addEventListener("keypress", cb);
    ipt_2.addEventListener("keypress", cb);
    var rd_grp = radio_group("formula", function (value) {
      if (value == 1) sex = Sex.Female;else sex = Sex.Male;
      console.log(value);
    }, "mies", "nainen", "nainen miesten pisteillä");
    var lines = [line("Laskentakaava:", rd_grp), line(input1, ipt_1), line(input2, ipt_2), line(btn), line("Sinclair-kerroin: ", coeff), line(output, out)];
    var tbl = table.apply(void 0, lines);
    mount(obj, tbl);
  }
  //const sinclair_score_obj = document.getElementById("sinclair_score");
  //const sinclair_kg_obj = document.getElementById("sinclair_kg");
  //const sinclair_bw_obj = document.getElementById("sinclair_bw");
  var out_fn_score = function (sex, kg, bw) {
    var coeff = sinclair_coeff_by_sex(sex, bw);
    var score = coeff * kg;
    return [coeff, score];
  };
  populate_section("sinclair_score", "Tulos:", "Paino:", "Pisteet:", out_fn_score);
  var out_fn_kg = function (sex, score, bw) {
    var coeff = sinclair_coeff_by_sex(sex, bw);
    var kg = score / coeff;
    return [coeff, kg];
  };
  populate_section("sinclair_kg", "Pisteet:", "Paino:", "Tulos:", out_fn_kg);
  var out_fn_bw = function (sex, score, kg) {
    var bw = sinclair_bw(sex)(kg, score);
    var coeff = sinclair_coeff_by_sex(sex, bw);
    return [coeff, bw];
  };
  populate_section("sinclair_bw", "Pisteet:", "Tulos:", "Paino:", out_fn_bw);

})();
