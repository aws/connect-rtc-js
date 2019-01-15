(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":17}],2:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":18}],3:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":19}],4:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":20}],5:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":21}],6:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":22}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":23}],8:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":24}],9:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _promise = require("../core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new _promise2.default(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return _promise2.default.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};
},{"../core-js/promise":6}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":2}],12:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = require("../core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("../core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};
},{"../core-js/object/get-own-property-descriptor":3,"../core-js/object/get-prototype-of":4}],13:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":1,"../core-js/object/set-prototype-of":5,"../helpers/typeof":15}],14:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":15}],15:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":7,"../core-js/symbol/iterator":8}],16:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":114}],17:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":32,"../../modules/es6.object.create":100}],18:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":32,"../../modules/es6.object.define-property":101}],19:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};

},{"../../modules/_core":32,"../../modules/es6.object.get-own-property-descriptor":102}],20:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;

},{"../../modules/_core":32,"../../modules/es6.object.get-prototype-of":103}],21:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;

},{"../../modules/_core":32,"../../modules/es6.object.set-prototype-of":104}],22:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
require('../modules/es7.promise.finally');
require('../modules/es7.promise.try');
module.exports = require('../modules/_core').Promise;

},{"../modules/_core":32,"../modules/es6.object.to-string":105,"../modules/es6.promise":106,"../modules/es6.string.iterator":107,"../modules/es7.promise.finally":109,"../modules/es7.promise.try":110,"../modules/web.dom.iterable":113}],23:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":32,"../../modules/es6.object.to-string":105,"../../modules/es6.symbol":108,"../../modules/es7.symbol.async-iterator":111,"../../modules/es7.symbol.observable":112}],24:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":96,"../../modules/es6.string.iterator":107,"../../modules/web.dom.iterable":113}],25:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],26:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],27:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],28:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":51}],29:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":87,"./_to-iobject":89,"./_to-length":90}],30:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":31,"./_wks":97}],31:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],32:[function(require,module,exports){
var core = module.exports = { version: '2.6.2' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],33:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":25}],34:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],35:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":40}],36:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":42,"./_is-object":51}],37:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],38:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":68,"./_object-keys":71,"./_object-pie":72}],39:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":32,"./_ctx":33,"./_global":42,"./_has":43,"./_hide":44}],40:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],41:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":28,"./_ctx":33,"./_is-array-iter":49,"./_iter-call":52,"./_to-length":90,"./core.get-iterator-method":98}],42:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],43:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],44:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":35,"./_object-dp":63,"./_property-desc":76}],45:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":42}],46:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":35,"./_dom-create":36,"./_fails":40}],47:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],48:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":31}],49:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":57,"./_wks":97}],50:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":31}],51:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],52:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":28}],53:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":44,"./_object-create":62,"./_property-desc":76,"./_set-to-string-tag":81,"./_wks":97}],54:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":39,"./_hide":44,"./_iter-create":53,"./_iterators":57,"./_library":58,"./_object-gpo":69,"./_redefine":78,"./_set-to-string-tag":81,"./_wks":97}],55:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":97}],56:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],57:[function(require,module,exports){
module.exports = {};

},{}],58:[function(require,module,exports){
module.exports = true;

},{}],59:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":40,"./_has":43,"./_is-object":51,"./_object-dp":63,"./_uid":93}],60:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":31,"./_global":42,"./_task":86}],61:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":25}],62:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":28,"./_dom-create":36,"./_enum-bug-keys":37,"./_html":45,"./_object-dps":64,"./_shared-key":82}],63:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":28,"./_descriptors":35,"./_ie8-dom-define":46,"./_to-primitive":92}],64:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":28,"./_descriptors":35,"./_object-dp":63,"./_object-keys":71}],65:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":35,"./_has":43,"./_ie8-dom-define":46,"./_object-pie":72,"./_property-desc":76,"./_to-iobject":89,"./_to-primitive":92}],66:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":67,"./_to-iobject":89}],67:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":37,"./_object-keys-internal":70}],68:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],69:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":43,"./_shared-key":82,"./_to-object":91}],70:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":29,"./_has":43,"./_shared-key":82,"./_to-iobject":89}],71:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":37,"./_object-keys-internal":70}],72:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],73:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":32,"./_export":39,"./_fails":40}],74:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],75:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":28,"./_is-object":51,"./_new-promise-capability":61}],76:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],77:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":44}],78:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":44}],79:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":28,"./_ctx":33,"./_is-object":51,"./_object-gopd":65}],80:[function(require,module,exports){
'use strict';
var global = require('./_global');
var core = require('./_core');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_core":32,"./_descriptors":35,"./_global":42,"./_object-dp":63,"./_wks":97}],81:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":43,"./_object-dp":63,"./_wks":97}],82:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":83,"./_uid":93}],83:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":32,"./_global":42,"./_library":58}],84:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":25,"./_an-object":28,"./_wks":97}],85:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":34,"./_to-integer":88}],86:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":31,"./_ctx":33,"./_dom-create":36,"./_global":42,"./_html":45,"./_invoke":47}],87:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":88}],88:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],89:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":34,"./_iobject":48}],90:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":88}],91:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":34}],92:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":51}],93:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],94:[function(require,module,exports){
var global = require('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":42}],95:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":32,"./_global":42,"./_library":58,"./_object-dp":63,"./_wks-ext":96}],96:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":97}],97:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":42,"./_shared":83,"./_uid":93}],98:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":30,"./_core":32,"./_iterators":57,"./_wks":97}],99:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":26,"./_iter-define":54,"./_iter-step":56,"./_iterators":57,"./_to-iobject":89}],100:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":39,"./_object-create":62}],101:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":35,"./_export":39,"./_object-dp":63}],102:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./_to-iobject');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":65,"./_object-sap":73,"./_to-iobject":89}],103:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":69,"./_object-sap":73,"./_to-object":91}],104:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":39,"./_set-proto":79}],105:[function(require,module,exports){

},{}],106:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var userAgent = require('./_user-agent');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":25,"./_an-instance":27,"./_classof":30,"./_core":32,"./_ctx":33,"./_export":39,"./_for-of":41,"./_global":42,"./_is-object":51,"./_iter-detect":55,"./_library":58,"./_microtask":60,"./_new-promise-capability":61,"./_perform":74,"./_promise-resolve":75,"./_redefine-all":77,"./_set-species":80,"./_set-to-string-tag":81,"./_species-constructor":84,"./_task":86,"./_user-agent":94,"./_wks":97}],107:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":54,"./_string-at":85}],108:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":28,"./_descriptors":35,"./_enum-keys":38,"./_export":39,"./_fails":40,"./_global":42,"./_has":43,"./_hide":44,"./_is-array":50,"./_is-object":51,"./_library":58,"./_meta":59,"./_object-create":62,"./_object-dp":63,"./_object-gopd":65,"./_object-gopn":67,"./_object-gopn-ext":66,"./_object-gops":68,"./_object-keys":71,"./_object-pie":72,"./_property-desc":76,"./_redefine":78,"./_set-to-string-tag":81,"./_shared":83,"./_to-iobject":89,"./_to-primitive":92,"./_uid":93,"./_wks":97,"./_wks-define":95,"./_wks-ext":96}],109:[function(require,module,exports){
// https://github.com/tc39/proposal-promise-finally
'use strict';
var $export = require('./_export');
var core = require('./_core');
var global = require('./_global');
var speciesConstructor = require('./_species-constructor');
var promiseResolve = require('./_promise-resolve');

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

},{"./_core":32,"./_export":39,"./_global":42,"./_promise-resolve":75,"./_species-constructor":84}],110:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = require('./_export');
var newPromiseCapability = require('./_new-promise-capability');
var perform = require('./_perform');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

},{"./_export":39,"./_new-promise-capability":61,"./_perform":74}],111:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":95}],112:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":95}],113:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":42,"./_hide":44,"./_iterators":57,"./_wks":97,"./es6.array.iterator":99}],114:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

},{"./runtime":115}],115:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

},{}],116:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parts[1],
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress); // was: relAddr
    sdp.push('rport');
    sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
}

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
          ? '/' + headerExtension.direction
          : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      params.push(param + '=' + codec.parameters[param]);
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
}

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  caps.headerExtensions.forEach(function(extension) {
    sdp += SDPUtils.writeExtmap(extension);
  });
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.split(' ');
    parts.shift();
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
        rtx: {
          ssrc: secondarySsrc
        }
      };
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(5), 10);
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  var cname;
  // Gets the first SSRC. Note that with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
      .map(function(line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function(obj) {
        return obj.attribute === 'cname';
      })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'msid';
  });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

SDPUtils.writeSessionBoilerplate = function() {
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

// Expose public methods.
module.exports = SDPUtils;

},{}],117:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;

},{}],118:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],119:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":117,"./lib/rng":118}],120:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

// Shimming starts here.
(function() {
  // Utils.
  var logging = require('./utils').log;
  var browserDetails = require('./utils').browserDetails;
  // Export to the adapter global object visible in the browser.
  module.exports.browserDetails = browserDetails;
  module.exports.extractVersion = require('./utils').extractVersion;
  module.exports.disableLog = require('./utils').disableLog;

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'opera': // fallthrough as it uses chrome shims
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection) {
        logging('Chrome shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = chromeShim;

      chromeShim.shimGetUserMedia();
      chromeShim.shimMediaStream();
      chromeShim.shimSourceObject();
      chromeShim.shimPeerConnection();
      chromeShim.shimOnTrack();
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection) {
        logging('Firefox shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = firefoxShim;

      firefoxShim.shimGetUserMedia();
      firefoxShim.shimSourceObject();
      firefoxShim.shimPeerConnection();
      firefoxShim.shimOnTrack();
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection) {
        logging('MS edge shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = edgeShim;

      edgeShim.shimGetUserMedia();
      edgeShim.shimPeerConnection();
      break;
    case 'safari':
      if (!safariShim) {
        logging('Safari shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = safariShim;

      safariShim.shimGetUserMedia();
      break;
    default:
      logging('Unsupported browser!');
  }
})();

},{"./chrome/chrome_shim":121,"./edge/edge_shim":123,"./firefox/firefox_shim":125,"./safari/safari_shim":127,"./utils":128}],121:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;
var browserDetails = require('../utils.js').browserDetails;

var chromeShim = {
  shimMediaStream: function() {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          var self = this;
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var event = new Event('track');
              event.track = te.track;
              event.receiver = {track: te.track};
              event.streams = [e.stream];
              self.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    // The RTCPeerConnection object.
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      // Translate iceTransportPolicy to iceTransports,
      // see https://code.google.com/p/webrtc/issues/detail?id=4869
      logging('PeerConnection');
      if (pcConfig && pcConfig.iceTransportPolicy) {
        pcConfig.iceTransports = pcConfig.iceTransportPolicy;
      }

      var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
      var origGetStats = pc.getStats.bind(pc);
      pc.getStats = function(selector, successCallback, errorCallback) {
        var self = this;
        var args = arguments;

        // If selector is a function then we are in the old style stats so just
        // pass back the original getStats format to avoid breaking old users.
        if (arguments.length > 0 && typeof selector === 'function') {
          return origGetStats(selector, successCallback);
        }

        var fixChromeStats_ = function(response) {
          var standardReport = {};
          var reports = response.result();
          reports.forEach(function(report) {
            var standardStats = {
              id: report.id,
              timestamp: report.timestamp,
              type: report.type
            };
            report.names().forEach(function(name) {
              standardStats[name] = report.stat(name);
            });
            standardReport[standardStats.id] = standardStats;
          });

          return standardReport;
        };

        // shim getStats with maplike support
        var makeMapStats = function(stats, legacyStats) {
          var map = new Map(Object.keys(stats).map(function(key) {
            return[key, stats[key]];
          }));
          legacyStats = legacyStats || stats;
          Object.keys(legacyStats).forEach(function(key) {
            map[key] = legacyStats[key];
          });
          return map;
        };

        if (arguments.length >= 2) {
          var successCallbackWrapper_ = function(response) {
            args[1](makeMapStats(fixChromeStats_(response)));
          };

          return origGetStats.apply(this, [successCallbackWrapper_,
              arguments[0]]);
        }

        // promise-support
        return new Promise(function(resolve, reject) {
          if (args.length === 1 && typeof selector === 'object') {
            origGetStats.apply(self, [
              function(response) {
                resolve(makeMapStats(fixChromeStats_(response)));
              }, reject]);
          } else {
            // Preserve legacy chrome stats only on legacy access of stats obj
            origGetStats.apply(self, [
              function(response) {
                resolve(makeMapStats(fixChromeStats_(response),
                    response.result()));
              }, reject]);
          }
        }).then(successCallback, errorCallback);
      };

      return pc;
    };
    window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

    // wrap static methods. Currently just generateCertificate.
    if (webkitRTCPeerConnection.generateCertificate) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return webkitRTCPeerConnection.generateCertificate;
        }
      });
    }

    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = webkitRTCPeerConnection.prototype[method];
      webkitRTCPeerConnection.prototype[method] = function() {
        var self = this;
        if (arguments.length < 1 || (arguments.length === 1 &&
            typeof arguments[0] === 'object')) {
          var opts = arguments.length === 1 ? arguments[0] : undefined;
          return new Promise(function(resolve, reject) {
            nativeMethod.apply(self, [resolve, reject, opts]);
          });
        }
        return nativeMethod.apply(this, arguments);
      };
    });

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = webkitRTCPeerConnection.prototype[method];
            webkitRTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var self = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(self, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = webkitRTCPeerConnection.prototype[method];
          webkitRTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null)
    var nativeAddIceCandidate =
        RTCPeerConnection.prototype.addIceCandidate;
    RTCPeerConnection.prototype.addIceCandidate = function() {
      if (arguments[0] === null) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }
};


// Expose public methods.
module.exports = {
  shimMediaStream: chromeShim.shimMediaStream,
  shimOnTrack: chromeShim.shimOnTrack,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils.js":128,"./getusermedia":122}],122:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;

// Expose public methods.
module.exports = function() {
  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && constraints.audio) {
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile, where it defaults to "user".
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode)) {
        delete constraints.video.facingMode;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          // Look for "back" in label, or use last cam (typically back cam).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var back = devices.find(function(d) {
              return d.label.toLowerCase().indexOf('back') !== -1;
            }) || (devices.length && devices[devices.length - 1]);
            if (back) {
              constraints.video.deviceId = face.exact ? {exact: back.deviceId} :
                                                        {ideal: back.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        ConstraintNotSatisfiedError: 'OverconstrainedError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        onError(shimError_(e));
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: ''};
            }));
          });
        });
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":128}],123:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var browserDetails = require('../utils').browserDetails;

var edgeShim = {
  shimPeerConnection: function() {
    if (window.RTCIceGatherer) {
      // ORTC defines an RTCIceCandidate object but no constructor.
      // Not implemented in Edge.
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      // ORTC does not have a session description object but
      // other browsers (i.e. Chrome) that will support both PC and ORTC
      // in the future might have this defined already.
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed.
      var origMSTEnabled = Object.getOwnPropertyDescriptor(
          MediaStreamTrack.prototype, 'enabled');
      Object.defineProperty(MediaStreamTrack.prototype, 'enabled', {
        set: function(value) {
          origMSTEnabled.set.call(this, value);
          var ev = new Event('enabled');
          ev.enabled = value;
          this.dispatchEvent(ev);
        }
      });
    }

    window.RTCPeerConnection = function(config) {
      var self = this;

      var _eventTarget = document.createDocumentFragment();
      ['addEventListener', 'removeEventListener', 'dispatchEvent']
          .forEach(function(method) {
            self[method] = _eventTarget[method].bind(_eventTarget);
          });

      this.onicecandidate = null;
      this.onaddstream = null;
      this.ontrack = null;
      this.onremovestream = null;
      this.onsignalingstatechange = null;
      this.oniceconnectionstatechange = null;
      this.onnegotiationneeded = null;
      this.ondatachannel = null;

      this.localStreams = [];
      this.remoteStreams = [];
      this.getLocalStreams = function() {
        return self.localStreams;
      };
      this.getRemoteStreams = function() {
        return self.remoteStreams;
      };

      this.localDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.remoteDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.signalingState = 'stable';
      this.iceConnectionState = 'new';
      this.iceGatheringState = 'new';

      this.iceOptions = {
        gatherPolicy: 'all',
        iceServers: []
      };
      if (config && config.iceTransportPolicy) {
        switch (config.iceTransportPolicy) {
          case 'all':
          case 'relay':
            this.iceOptions.gatherPolicy = config.iceTransportPolicy;
            break;
          case 'none':
            // FIXME: remove once implementation and spec have added this.
            throw new TypeError('iceTransportPolicy "none" not supported');
          default:
            // don't set iceTransportPolicy.
            break;
        }
      }
      this.usingBundle = config && config.bundlePolicy === 'max-bundle';

      if (config && config.iceServers) {
        // Edge does not like
        // 1) stun:
        // 2) turn: that does not have all of turn:host:port?transport=udp
        // 3) turn: with ipv6 addresses
        var iceServers = JSON.parse(JSON.stringify(config.iceServers));
        this.iceOptions.iceServers = iceServers.filter(function(server) {
          if (server && server.urls) {
            var urls = server.urls;
            if (typeof urls === 'string') {
              urls = [urls];
            }
            urls = urls.filter(function(url) {
              return (url.indexOf('turn:') === 0 &&
                  url.indexOf('transport=udp') !== -1 &&
                  url.indexOf('turn:[') === -1) ||
                  (url.indexOf('stun:') === 0 &&
                    browserDetails.version >= 14393);
            })[0];
            return !!urls;
          }
          return false;
        });
      }
      this._config = config;

      // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
      // everything that is needed to describe a SDP m-line.
      this.transceivers = [];

      // since the iceGatherer is currently created in createOffer but we
      // must not emit candidates until after setLocalDescription we buffer
      // them in this array.
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
      var self = this;
      var sections = SDPUtils.splitSections(self.localDescription.sdp);
      // FIXME: need to apply ice candidates in a way which is async but
      // in-order
      this._localIceCandidatesBuffer.forEach(function(event) {
        var end = !event.candidate || Object.keys(event.candidate).length === 0;
        if (end) {
          for (var j = 1; j < sections.length; j++) {
            if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
              sections[j] += 'a=end-of-candidates\r\n';
            }
          }
        } else if (event.candidate.candidate.indexOf('typ endOfCandidates')
            === -1) {
          sections[event.candidate.sdpMLineIndex + 1] +=
              'a=' + event.candidate.candidate + '\r\n';
        }
        self.localDescription.sdp = sections.join('');
        self.dispatchEvent(event);
        if (self.onicecandidate !== null) {
          self.onicecandidate(event);
        }
        if (!event.candidate && self.iceGatheringState !== 'complete') {
          var complete = self.transceivers.every(function(transceiver) {
            return transceiver.iceGatherer &&
                transceiver.iceGatherer.state === 'completed';
          });
          if (complete) {
            self.iceGatheringState = 'complete';
          }
        }
      });
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype.getConfiguration = function() {
      return this._config;
    };

    window.RTCPeerConnection.prototype.addStream = function(stream) {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      this.localStreams.push(clonedStream);
      this._maybeFireNegotiationNeeded();
    };

    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var idx = this.localStreams.indexOf(stream);
      if (idx > -1) {
        this.localStreams.splice(idx, 1);
        this._maybeFireNegotiationNeeded();
      }
    };

    window.RTCPeerConnection.prototype.getSenders = function() {
      return this.transceivers.filter(function(transceiver) {
        return !!transceiver.rtpSender;
      })
      .map(function(transceiver) {
        return transceiver.rtpSender;
      });
    };

    window.RTCPeerConnection.prototype.getReceivers = function() {
      return this.transceivers.filter(function(transceiver) {
        return !!transceiver.rtpReceiver;
      })
      .map(function(transceiver) {
        return transceiver.rtpReceiver;
      });
    };

    // Determines the intersection of local and remote capabilities.
    window.RTCPeerConnection.prototype._getCommonCapabilities =
        function(localCapabilities, remoteCapabilities) {
          var commonCapabilities = {
            codecs: [],
            headerExtensions: [],
            fecMechanisms: []
          };
          localCapabilities.codecs.forEach(function(lCodec) {
            for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
              var rCodec = remoteCapabilities.codecs[i];
              if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                  lCodec.clockRate === rCodec.clockRate) {
                // number of channels is the highest common number of channels
                rCodec.numChannels = Math.min(lCodec.numChannels,
                    rCodec.numChannels);
                // push rCodec so we reply with offerer payload type
                commonCapabilities.codecs.push(rCodec);

                // determine common feedback mechanisms
                rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
                  for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                    if (lCodec.rtcpFeedback[j].type === fb.type &&
                        lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                      return true;
                    }
                  }
                  return false;
                });
                // FIXME: also need to determine .parameters
                //  see https://github.com/openpeer/ortc/issues/569
                break;
              }
            }
          });

          localCapabilities.headerExtensions
              .forEach(function(lHeaderExtension) {
                for (var i = 0; i < remoteCapabilities.headerExtensions.length;
                     i++) {
                  var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                  if (lHeaderExtension.uri === rHeaderExtension.uri) {
                    commonCapabilities.headerExtensions.push(rHeaderExtension);
                    break;
                  }
                }
              });

          // FIXME: fecMechanisms
          return commonCapabilities;
        };

    // Create ICE gatherer, ICE transport and DTLS transport.
    window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
        function(mid, sdpMLineIndex) {
          var self = this;
          var iceGatherer = new RTCIceGatherer(self.iceOptions);
          var iceTransport = new RTCIceTransport(iceGatherer);
          iceGatherer.onlocalcandidate = function(evt) {
            var event = new Event('icecandidate');
            event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

            var cand = evt.candidate;
            var end = !cand || Object.keys(cand).length === 0;
            // Edge emits an empty object for RTCIceCandidateComplete‥
            if (end) {
              // polyfill since RTCIceGatherer.state is not implemented in
              // Edge 10547 yet.
              if (iceGatherer.state === undefined) {
                iceGatherer.state = 'completed';
              }

              // Emit a candidate with type endOfCandidates to make the samples
              // work. Edge requires addIceCandidate with this empty candidate
              // to start checking. The real solution is to signal
              // end-of-candidates to the other side when getting the null
              // candidate but some apps (like the samples) don't do that.
              event.candidate.candidate =
                  'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
            } else {
              // RTCIceCandidate doesn't have a component, needs to be added
              cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
              event.candidate.candidate = SDPUtils.writeCandidate(cand);
            }

            // update local description.
            var sections = SDPUtils.splitSections(self.localDescription.sdp);
            if (event.candidate.candidate.indexOf('typ endOfCandidates')
                === -1) {
              sections[event.candidate.sdpMLineIndex + 1] +=
                  'a=' + event.candidate.candidate + '\r\n';
            } else {
              sections[event.candidate.sdpMLineIndex + 1] +=
                  'a=end-of-candidates\r\n';
            }
            self.localDescription.sdp = sections.join('');

            var complete = self.transceivers.every(function(transceiver) {
              return transceiver.iceGatherer &&
                  transceiver.iceGatherer.state === 'completed';
            });

            // Emit candidate if localDescription is set.
            // Also emits null candidate when all gatherers are complete.
            switch (self.iceGatheringState) {
              case 'new':
                self._localIceCandidatesBuffer.push(event);
                if (end && complete) {
                  self._localIceCandidatesBuffer.push(
                      new Event('icecandidate'));
                }
                break;
              case 'gathering':
                self._emitBufferedCandidates();
                self.dispatchEvent(event);
                if (self.onicecandidate !== null) {
                  self.onicecandidate(event);
                }
                if (complete) {
                  self.dispatchEvent(new Event('icecandidate'));
                  if (self.onicecandidate !== null) {
                    self.onicecandidate(new Event('icecandidate'));
                  }
                  self.iceGatheringState = 'complete';
                }
                break;
              case 'complete':
                // should not happen... currently!
                break;
              default: // no-op.
                break;
            }
          };
          iceTransport.onicestatechange = function() {
            self._updateConnectionState();
          };

          var dtlsTransport = new RTCDtlsTransport(iceTransport);
          dtlsTransport.ondtlsstatechange = function() {
            self._updateConnectionState();
          };
          dtlsTransport.onerror = function() {
            // onerror does not set state to failed by itself.
            dtlsTransport.state = 'failed';
            self._updateConnectionState();
          };

          return {
            iceGatherer: iceGatherer,
            iceTransport: iceTransport,
            dtlsTransport: dtlsTransport
          };
        };

    // Start the RTP Sender and Receiver for a transceiver.
    window.RTCPeerConnection.prototype._transceive = function(transceiver,
        send, recv) {
      var params = this._getCommonCapabilities(transceiver.localCapabilities,
          transceiver.remoteCapabilities);
      if (send && transceiver.rtpSender) {
        params.encodings = transceiver.sendEncodingParameters;
        params.rtcp = {
          cname: SDPUtils.localCName
        };
        if (transceiver.recvEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
        }
        transceiver.rtpSender.send(params);
      }
      if (recv && transceiver.rtpReceiver) {
        // remove RTX field in Edge 14942
        if (transceiver.kind === 'video'
            && transceiver.recvEncodingParameters) {
          transceiver.recvEncodingParameters.forEach(function(p) {
            delete p.rtx;
          });
        }
        params.encodings = transceiver.recvEncodingParameters;
        params.rtcp = {
          cname: transceiver.cname
        };
        if (transceiver.sendEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
        }
        transceiver.rtpReceiver.receive(params);
      }
    };

    window.RTCPeerConnection.prototype.setLocalDescription =
        function(description) {
          var self = this;
          var sections;
          var sessionpart;
          if (description.type === 'offer') {
            // FIXME: What was the purpose of this empty if statement?
            // if (!this._pendingOffer) {
            // } else {
            if (this._pendingOffer) {
              // VERY limited support for SDP munging. Limited to:
              // * changing the order of codecs
              sections = SDPUtils.splitSections(description.sdp);
              sessionpart = sections.shift();
              sections.forEach(function(mediaSection, sdpMLineIndex) {
                var caps = SDPUtils.parseRtpParameters(mediaSection);
                self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
              });
              this.transceivers = this._pendingOffer;
              delete this._pendingOffer;
            }
          } else if (description.type === 'answer') {
            sections = SDPUtils.splitSections(self.remoteDescription.sdp);
            sessionpart = sections.shift();
            var isIceLite = SDPUtils.matchPrefix(sessionpart,
                'a=ice-lite').length > 0;
            sections.forEach(function(mediaSection, sdpMLineIndex) {
              var transceiver = self.transceivers[sdpMLineIndex];
              var iceGatherer = transceiver.iceGatherer;
              var iceTransport = transceiver.iceTransport;
              var dtlsTransport = transceiver.dtlsTransport;
              var localCapabilities = transceiver.localCapabilities;
              var remoteCapabilities = transceiver.remoteCapabilities;

              var rejected = mediaSection.split('\n', 1)[0]
                  .split(' ', 2)[1] === '0';

              if (!rejected && !transceiver.isDatachannel) {
                var remoteIceParameters = SDPUtils.getIceParameters(
                    mediaSection, sessionpart);
                if (isIceLite) {
                  var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                  .map(function(cand) {
                    return SDPUtils.parseCandidate(cand);
                  })
                  .filter(function(cand) {
                    return cand.component === '1';
                  });
                  // ice-lite only includes host candidates in the SDP so we can
                  // use setRemoteCandidates (which implies an
                  // RTCIceCandidateComplete)
                  if (cands.length) {
                    iceTransport.setRemoteCandidates(cands);
                  }
                }
                var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                    mediaSection, sessionpart);
                if (isIceLite) {
                  remoteDtlsParameters.role = 'server';
                }

                if (!self.usingBundle || sdpMLineIndex === 0) {
                  iceTransport.start(iceGatherer, remoteIceParameters,
                      isIceLite ? 'controlling' : 'controlled');
                  dtlsTransport.start(remoteDtlsParameters);
                }

                // Calculate intersection of capabilities.
                var params = self._getCommonCapabilities(localCapabilities,
                    remoteCapabilities);

                // Start the RTCRtpSender. The RTCRtpReceiver for this
                // transceiver has already been started in setRemoteDescription.
                self._transceive(transceiver,
                    params.codecs.length > 0,
                    false);
              }
            });
          }

          this.localDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-local-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }

          // If a success callback was provided, emit ICE candidates after it
          // has been executed. Otherwise, emit callback after the Promise is
          // resolved.
          var hasCallback = arguments.length > 1 &&
            typeof arguments[1] === 'function';
          if (hasCallback) {
            var cb = arguments[1];
            window.setTimeout(function() {
              cb();
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              self._emitBufferedCandidates();
            }, 0);
          }
          var p = Promise.resolve();
          p.then(function() {
            if (!hasCallback) {
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              // Usually candidates will be emitted earlier.
              window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
            }
          });
          return p;
        };

    window.RTCPeerConnection.prototype.setRemoteDescription =
        function(description) {
          var self = this;
          var stream = new MediaStream();
          var receiverList = [];
          var sections = SDPUtils.splitSections(description.sdp);
          var sessionpart = sections.shift();
          var isIceLite = SDPUtils.matchPrefix(sessionpart,
              'a=ice-lite').length > 0;
          this.usingBundle = SDPUtils.matchPrefix(sessionpart,
              'a=group:BUNDLE ').length > 0;
          sections.forEach(function(mediaSection, sdpMLineIndex) {
            var lines = SDPUtils.splitLines(mediaSection);
            var mline = lines[0].substr(2).split(' ');
            var kind = mline[0];
            var rejected = mline[1] === '0';
            var direction = SDPUtils.getDirection(mediaSection, sessionpart);

            var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
            if (mid.length) {
              mid = mid[0].substr(6);
            } else {
              mid = SDPUtils.generateIdentifier();
            }

            // Reject datachannels which are not implemented yet.
            if (kind === 'application' && mline[2] === 'DTLS/SCTP') {
              self.transceivers[sdpMLineIndex] = {
                mid: mid,
                isDatachannel: true
              };
              return;
            }

            var transceiver;
            var iceGatherer;
            var iceTransport;
            var dtlsTransport;
            var rtpSender;
            var rtpReceiver;
            var sendEncodingParameters;
            var recvEncodingParameters;
            var localCapabilities;

            var track;
            // FIXME: ensure the mediaSection has rtcp-mux set.
            var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
            var remoteIceParameters;
            var remoteDtlsParameters;
            if (!rejected) {
              remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                  sessionpart);
              remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                  sessionpart);
              remoteDtlsParameters.role = 'client';
            }
            recvEncodingParameters =
                SDPUtils.parseRtpEncodingParameters(mediaSection);

            var cname;
            // Gets the first SSRC. Note that with RTX there might be multiple
            // SSRCs.
            var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                .map(function(line) {
                  return SDPUtils.parseSsrcMedia(line);
                })
                .filter(function(obj) {
                  return obj.attribute === 'cname';
                })[0];
            if (remoteSsrc) {
              cname = remoteSsrc.value;
            }

            var isComplete = SDPUtils.matchPrefix(mediaSection,
                'a=end-of-candidates', sessionpart).length > 0;
            var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                .map(function(cand) {
                  return SDPUtils.parseCandidate(cand);
                })
                .filter(function(cand) {
                  return cand.component === '1';
                });
            if (description.type === 'offer' && !rejected) {
              var transports = self.usingBundle && sdpMLineIndex > 0 ? {
                iceGatherer: self.transceivers[0].iceGatherer,
                iceTransport: self.transceivers[0].iceTransport,
                dtlsTransport: self.transceivers[0].dtlsTransport
              } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

              if (isComplete) {
                transports.iceTransport.setRemoteCandidates(cands);
              }

              localCapabilities = RTCRtpReceiver.getCapabilities(kind);

              // filter RTX until additional stuff needed for RTX is implemented
              // in adapter.js
              localCapabilities.codecs = localCapabilities.codecs.filter(
                  function(codec) {
                    return codec.name !== 'rtx';
                  });

              sendEncodingParameters = [{
                ssrc: (2 * sdpMLineIndex + 2) * 1001
              }];

              rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

              track = rtpReceiver.track;
              receiverList.push([track, rtpReceiver]);
              // FIXME: not correct when there are multiple streams but that is
              // not currently supported in this shim.
              stream.addTrack(track);

              // FIXME: look at direction.
              if (self.localStreams.length > 0 &&
                  self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                var localTrack;
                if (kind === 'audio') {
                  localTrack = self.localStreams[0].getAudioTracks()[0];
                } else if (kind === 'video') {
                  localTrack = self.localStreams[0].getVideoTracks()[0];
                }
                if (localTrack) {
                  rtpSender = new RTCRtpSender(localTrack,
                      transports.dtlsTransport);
                }
              }

              self.transceivers[sdpMLineIndex] = {
                iceGatherer: transports.iceGatherer,
                iceTransport: transports.iceTransport,
                dtlsTransport: transports.dtlsTransport,
                localCapabilities: localCapabilities,
                remoteCapabilities: remoteCapabilities,
                rtpSender: rtpSender,
                rtpReceiver: rtpReceiver,
                kind: kind,
                mid: mid,
                cname: cname,
                sendEncodingParameters: sendEncodingParameters,
                recvEncodingParameters: recvEncodingParameters
              };
              // Start the RTCRtpReceiver now. The RTPSender is started in
              // setLocalDescription.
              self._transceive(self.transceivers[sdpMLineIndex],
                  false,
                  direction === 'sendrecv' || direction === 'sendonly');
            } else if (description.type === 'answer' && !rejected) {
              transceiver = self.transceivers[sdpMLineIndex];
              iceGatherer = transceiver.iceGatherer;
              iceTransport = transceiver.iceTransport;
              dtlsTransport = transceiver.dtlsTransport;
              rtpSender = transceiver.rtpSender;
              rtpReceiver = transceiver.rtpReceiver;
              sendEncodingParameters = transceiver.sendEncodingParameters;
              localCapabilities = transceiver.localCapabilities;

              self.transceivers[sdpMLineIndex].recvEncodingParameters =
                  recvEncodingParameters;
              self.transceivers[sdpMLineIndex].remoteCapabilities =
                  remoteCapabilities;
              self.transceivers[sdpMLineIndex].cname = cname;

              if ((isIceLite || isComplete) && cands.length) {
                iceTransport.setRemoteCandidates(cands);
              }
              if (!self.usingBundle || sdpMLineIndex === 0) {
                iceTransport.start(iceGatherer, remoteIceParameters,
                    'controlling');
                dtlsTransport.start(remoteDtlsParameters);
              }

              self._transceive(transceiver,
                  direction === 'sendrecv' || direction === 'recvonly',
                  direction === 'sendrecv' || direction === 'sendonly');

              if (rtpReceiver &&
                  (direction === 'sendrecv' || direction === 'sendonly')) {
                track = rtpReceiver.track;
                receiverList.push([track, rtpReceiver]);
                stream.addTrack(track);
              } else {
                // FIXME: actually the receiver should be created later.
                delete transceiver.rtpReceiver;
              }
            }
          });

          this.remoteDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-remote-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }
          if (stream.getTracks().length) {
            self.remoteStreams.push(stream);
            window.setTimeout(function() {
              var event = new Event('addstream');
              event.stream = stream;
              self.dispatchEvent(event);
              if (self.onaddstream !== null) {
                window.setTimeout(function() {
                  self.onaddstream(event);
                }, 0);
              }

              receiverList.forEach(function(item) {
                var track = item[0];
                var receiver = item[1];
                var trackEvent = new Event('track');
                trackEvent.track = track;
                trackEvent.receiver = receiver;
                trackEvent.streams = [stream];
                self.dispatchEvent(event);
                if (self.ontrack !== null) {
                  window.setTimeout(function() {
                    self.ontrack(trackEvent);
                  }, 0);
                }
              });
            }, 0);
          }
          if (arguments.length > 1 && typeof arguments[1] === 'function') {
            window.setTimeout(arguments[1], 0);
          }
          return Promise.resolve();
        };

    window.RTCPeerConnection.prototype.close = function() {
      this.transceivers.forEach(function(transceiver) {
        /* not yet
        if (transceiver.iceGatherer) {
          transceiver.iceGatherer.close();
        }
        */
        if (transceiver.iceTransport) {
          transceiver.iceTransport.stop();
        }
        if (transceiver.dtlsTransport) {
          transceiver.dtlsTransport.stop();
        }
        if (transceiver.rtpSender) {
          transceiver.rtpSender.stop();
        }
        if (transceiver.rtpReceiver) {
          transceiver.rtpReceiver.stop();
        }
      });
      // FIXME: clean up tracks, local streams, remote streams, etc
      this._updateSignalingState('closed');
    };

    // Update the signaling state.
    window.RTCPeerConnection.prototype._updateSignalingState =
        function(newState) {
          this.signalingState = newState;
          var event = new Event('signalingstatechange');
          this.dispatchEvent(event);
          if (this.onsignalingstatechange !== null) {
            this.onsignalingstatechange(event);
          }
        };

    // Determine whether to fire the negotiationneeded event.
    window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
        function() {
          // Fire away (for now).
          var event = new Event('negotiationneeded');
          this.dispatchEvent(event);
          if (this.onnegotiationneeded !== null) {
            this.onnegotiationneeded(event);
          }
        };

    // Update the connection state.
    window.RTCPeerConnection.prototype._updateConnectionState = function() {
      var self = this;
      var newState;
      var states = {
        'new': 0,
        closed: 0,
        connecting: 0,
        checking: 0,
        connected: 0,
        completed: 0,
        failed: 0
      };
      this.transceivers.forEach(function(transceiver) {
        states[transceiver.iceTransport.state]++;
        states[transceiver.dtlsTransport.state]++;
      });
      // ICETransport.completed and connected are the same for this purpose.
      states.connected += states.completed;

      newState = 'new';
      if (states.failed > 0) {
        newState = 'failed';
      } else if (states.connecting > 0 || states.checking > 0) {
        newState = 'connecting';
      } else if (states.disconnected > 0) {
        newState = 'disconnected';
      } else if (states.new > 0) {
        newState = 'new';
      } else if (states.connected > 0 || states.completed > 0) {
        newState = 'connected';
      }

      if (newState !== self.iceConnectionState) {
        self.iceConnectionState = newState;
        var event = new Event('iceconnectionstatechange');
        this.dispatchEvent(event);
        if (this.oniceconnectionstatechange !== null) {
          this.oniceconnectionstatechange(event);
        }
      }
    };

    window.RTCPeerConnection.prototype.createOffer = function() {
      var self = this;
      if (this._pendingOffer) {
        throw new Error('createOffer called while there is a pending offer.');
      }
      var offerOptions;
      if (arguments.length === 1 && typeof arguments[0] !== 'function') {
        offerOptions = arguments[0];
      } else if (arguments.length === 3) {
        offerOptions = arguments[2];
      }

      var tracks = [];
      var numAudioTracks = 0;
      var numVideoTracks = 0;
      // Default to sendrecv.
      if (this.localStreams.length) {
        numAudioTracks = this.localStreams[0].getAudioTracks().length;
        numVideoTracks = this.localStreams[0].getVideoTracks().length;
      }
      // Determine number of audio and video tracks we need to send/recv.
      if (offerOptions) {
        // Reject Chrome legacy constraints.
        if (offerOptions.mandatory || offerOptions.optional) {
          throw new TypeError(
              'Legacy mandatory/optional constraints not supported.');
        }
        if (offerOptions.offerToReceiveAudio !== undefined) {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
        if (offerOptions.offerToReceiveVideo !== undefined) {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
      if (this.localStreams.length) {
        // Push local streams.
        this.localStreams[0].getTracks().forEach(function(track) {
          tracks.push({
            kind: track.kind,
            track: track,
            wantReceive: track.kind === 'audio' ?
                numAudioTracks > 0 : numVideoTracks > 0
          });
          if (track.kind === 'audio') {
            numAudioTracks--;
          } else if (track.kind === 'video') {
            numVideoTracks--;
          }
        });
      }
      // Create M-lines for recvonly streams.
      while (numAudioTracks > 0 || numVideoTracks > 0) {
        if (numAudioTracks > 0) {
          tracks.push({
            kind: 'audio',
            wantReceive: true
          });
          numAudioTracks--;
        }
        if (numVideoTracks > 0) {
          tracks.push({
            kind: 'video',
            wantReceive: true
          });
          numVideoTracks--;
        }
      }

      var sdp = SDPUtils.writeSessionBoilerplate();
      var transceivers = [];
      tracks.forEach(function(mline, sdpMLineIndex) {
        // For each track, create an ice gatherer, ice transport,
        // dtls transport, potentially rtpsender and rtpreceiver.
        var track = mline.track;
        var kind = mline.kind;
        var mid = SDPUtils.generateIdentifier();

        var transports = self.usingBundle && sdpMLineIndex > 0 ? {
          iceGatherer: transceivers[0].iceGatherer,
          iceTransport: transceivers[0].iceTransport,
          dtlsTransport: transceivers[0].dtlsTransport
        } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

        var localCapabilities = RTCRtpSender.getCapabilities(kind);
        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
        localCapabilities.codecs.forEach(function(codec) {
          // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
          // by adding level-asymmetry-allowed=1
          if (codec.name === 'H264' &&
              codec.parameters['level-asymmetry-allowed'] === undefined) {
            codec.parameters['level-asymmetry-allowed'] = '1';
          }
        });

        var rtpSender;
        var rtpReceiver;

        // generate an ssrc now, to be used later in rtpSender.send
        var sendEncodingParameters = [{
          ssrc: (2 * sdpMLineIndex + 1) * 1001
        }];
        if (track) {
          rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
        }

        if (mline.wantReceive) {
          rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
        }

        transceivers[sdpMLineIndex] = {
          iceGatherer: transports.iceGatherer,
          iceTransport: transports.iceTransport,
          dtlsTransport: transports.dtlsTransport,
          localCapabilities: localCapabilities,
          remoteCapabilities: null,
          rtpSender: rtpSender,
          rtpReceiver: rtpReceiver,
          kind: kind,
          mid: mid,
          sendEncodingParameters: sendEncodingParameters,
          recvEncodingParameters: null
        };
      });
      if (this.usingBundle) {
        sdp += 'a=group:BUNDLE ' + transceivers.map(function(t) {
          return t.mid;
        }).join(' ') + '\r\n';
      }
      tracks.forEach(function(mline, sdpMLineIndex) {
        var transceiver = transceivers[sdpMLineIndex];
        sdp += SDPUtils.writeMediaSection(transceiver,
            transceiver.localCapabilities, 'offer', self.localStreams[0]);
      });

      this._pendingOffer = transceivers;
      var desc = new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.createAnswer = function() {
      var self = this;

      var sdp = SDPUtils.writeSessionBoilerplate();
      if (this.usingBundle) {
        sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
          return t.mid;
        }).join(' ') + '\r\n';
      }
      this.transceivers.forEach(function(transceiver) {
        if (transceiver.isDatachannel) {
          sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
              'c=IN IP4 0.0.0.0\r\n' +
              'a=mid:' + transceiver.mid + '\r\n';
          return;
        }
        // Calculate intersection of capabilities.
        var commonCapabilities = self._getCommonCapabilities(
            transceiver.localCapabilities,
            transceiver.remoteCapabilities);

        sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
            'answer', self.localStreams[0]);
      });

      var desc = new RTCSessionDescription({
        type: 'answer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
      if (candidate === null) {
        this.transceivers.forEach(function(transceiver) {
          transceiver.iceTransport.addRemoteCandidate({});
        });
      } else {
        var mLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < this.transceivers.length; i++) {
            if (this.transceivers[i].mid === candidate.sdpMid) {
              mLineIndex = i;
              break;
            }
          }
        }
        var transceiver = this.transceivers[mLineIndex];
        if (transceiver) {
          var cand = Object.keys(candidate.candidate).length > 0 ?
              SDPUtils.parseCandidate(candidate.candidate) : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
            return;
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component !== '1') {
            return;
          }
          // A dirty hack to make samples work.
          if (cand.type === 'endOfCandidates') {
            cand = {};
          }
          transceiver.iceTransport.addRemoteCandidate(cand);

          // update the remoteDescription.
          var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
          sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim()
              : 'a=end-of-candidates') + '\r\n';
          this.remoteDescription.sdp = sections.join('');
        }
      }
      if (arguments.length > 1 && typeof arguments[1] === 'function') {
        window.setTimeout(arguments[1], 0);
      }
      return Promise.resolve();
    };

    window.RTCPeerConnection.prototype.getStats = function() {
      var promises = [];
      this.transceivers.forEach(function(transceiver) {
        ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
            'dtlsTransport'].forEach(function(method) {
              if (transceiver[method]) {
                promises.push(transceiver[method].getStats());
              }
            });
      });
      var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
          arguments[1];
      return new Promise(function(resolve) {
        // shim getStats with maplike support
        var results = new Map();
        Promise.all(promises).then(function(res) {
          res.forEach(function(result) {
            Object.keys(result).forEach(function(id) {
              results.set(id, result[id]);
              results[id] = result[id];
            });
          });
          if (cb) {
            window.setTimeout(cb, 0, results);
          }
          resolve(results);
        });
      });
    };
  }
};

// Expose public methods.
module.exports = {
  shimPeerConnection: edgeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":128,"./getusermedia":124,"sdp":116}],124:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};

},{}],125:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var browserDetails = require('../utils').browserDetails;

var firefoxShim = {
  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = mozRTCSessionDescription;
      window.RTCIceCandidate = mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null)
    var nativeAddIceCandidate =
        RTCPeerConnection.prototype.addIceCandidate;
    RTCPeerConnection.prototype.addIceCandidate = function() {
      if (arguments[0] === null) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var nativeGetStats = RTCPeerConnection.prototype.getStats;
    RTCPeerConnection.prototype.getStats = function(selector, onSucc, onErr) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          return makeMapStats(stats);
        })
        .then(onSucc, onErr);
    };
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":128,"./getusermedia":126}],126:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
    return {
      name: {
        SecurityError: 'NotAllowedError',
        PermissionDeniedError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    console.warn('navigator.getUserMedia has been replaced by ' +
                 'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":128}],127:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests
  // shimOnTrack: function() { },

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimGetUserMedia: function() {
    navigator.getUserMedia = navigator.webkitGetUserMedia;
  }
};

// Expose public methods.
module.exports = {
  shimGetUserMedia: safariShim.shimGetUserMedia
  // TODO
  // shimOnTrack: safariShim.shimOnTrack,
  // shimPeerConnection: safariShim.shimPeerConnection
};

},{}],128:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;

// Utility methods.
var utils = {
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function() {
    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = this.extractVersion(navigator.userAgent,
          /Firefox\/([0-9]+)\./, 1);

    // all webkit-based browsers
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome';
        result.version = this.extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/([0-9]+)\./, 2);

      // Safari or unknown webkit-based
      // for the time being Safari has support for MediaStreams but not webRTC
      } else {
        // Safari UA substrings of interest for reference:
        // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
        // - safari UI version:        Version/9.0.3 (unique to Safari)
        // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
        //
        // if the webkit version and safari UI webkit versions are equals,
        // ... this is a stable version.
        //
        // only the internal webkit version is important today to know if
        // media streams are supported
        //
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = this.extractVersion(navigator.userAgent,
            /AppleWebKit\/([0-9]+)\./, 1);

        // unknown webkit-based browser
        } else {
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
      }

    // Edge.
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
      result.browser = 'edge';
      result.version = this.extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);

    // Default fallthrough: not supported.
    } else {
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }
};

// Export.
module.exports = {
  log: utils.log,
  disableLog: utils.disableLog,
  browserDetails: utils.detectBrowser(),
  extractVersion: utils.extractVersion
};

},{}],129:[function(require,module,exports){
(function (global){
'use strict';

require('webrtc-adapter');

var _rtc_session = require('./rtc_session');

var _rtc_session2 = _interopRequireDefault(_rtc_session);

var _rtc_const = require('./rtc_const');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @license
 * License info for uuid module assembled into js bundle:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2010-2016 Robert Kieffer and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
global.connect = global.connect || {}; /**
                                        * @license
                                        * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
                                        *
                                        * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
                                        *
                                        *   http://aws.amazon.com/asl/
                                        *
                                        * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
                                        */
/**
 * @license
 * License info for webrtc-adapter module assembled into js bundle:
 *
 * Copyright (c) 2014, The WebRTC project authors. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of Google nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @license
 * License info for sdp module assembled into js bundle:
 *
 * See https://www.npmjs.com/package/sdp
 */

global.connect.RTCSession = _rtc_session2.default;
global.connect.RTCErrors = _rtc_const.RTC_ERRORS;

global.lily = global.lily || {};
global.lily.RTCSession = _rtc_session2.default;
global.lily.RTCErrors = _rtc_const.RTC_ERRORS;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./rtc_const":131,"./rtc_session":132,"webrtc-adapter":120}],130:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UnknownSignalingError = exports.UnknownSignalingErrorName = exports.CallNotFoundException = exports.CallNotFoundExceptionName = exports.BusyException = exports.BusyExceptionName = exports.UnsupportedOperation = exports.UnsupportedOperationExceptionName = exports.IllegalState = exports.IllegalStateExceptionName = exports.IllegalParameters = exports.IllegalParametersExceptionName = exports.GumTimeout = exports.GumTimeoutExceptionName = exports.Timeout = exports.TimeoutExceptionName = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
var TimeoutExceptionName = exports.TimeoutExceptionName = 'Timeout';

var Timeout = exports.Timeout = function (_Error) {
    (0, _inherits3.default)(Timeout, _Error);

    function Timeout(msg) {
        (0, _classCallCheck3.default)(this, Timeout);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Timeout.__proto__ || Object.getPrototypeOf(Timeout)).call(this, msg));

        _this.name = TimeoutExceptionName;
        return _this;
    }

    return Timeout;
}(Error);

var GumTimeoutExceptionName = exports.GumTimeoutExceptionName = 'GumTimeout';

var GumTimeout = exports.GumTimeout = function (_Timeout) {
    (0, _inherits3.default)(GumTimeout, _Timeout);

    function GumTimeout(msg) {
        (0, _classCallCheck3.default)(this, GumTimeout);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (GumTimeout.__proto__ || Object.getPrototypeOf(GumTimeout)).call(this, msg));

        _this2.name = GumTimeoutExceptionName;
        return _this2;
    }

    return GumTimeout;
}(Timeout);

var IllegalParametersExceptionName = exports.IllegalParametersExceptionName = 'IllegalParameters';

var IllegalParameters = exports.IllegalParameters = function (_Error2) {
    (0, _inherits3.default)(IllegalParameters, _Error2);

    function IllegalParameters(msg) {
        (0, _classCallCheck3.default)(this, IllegalParameters);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, (IllegalParameters.__proto__ || Object.getPrototypeOf(IllegalParameters)).call(this, msg));

        _this3.name = IllegalParametersExceptionName;
        return _this3;
    }

    return IllegalParameters;
}(Error);

var IllegalStateExceptionName = exports.IllegalStateExceptionName = 'IllegalState';

var IllegalState = exports.IllegalState = function (_Error3) {
    (0, _inherits3.default)(IllegalState, _Error3);

    function IllegalState(msg) {
        (0, _classCallCheck3.default)(this, IllegalState);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, (IllegalState.__proto__ || Object.getPrototypeOf(IllegalState)).call(this, msg));

        _this4.name = IllegalStateExceptionName;
        return _this4;
    }

    return IllegalState;
}(Error);

var UnsupportedOperationExceptionName = exports.UnsupportedOperationExceptionName = 'UnsupportedOperation';

var UnsupportedOperation = exports.UnsupportedOperation = function (_Error4) {
    (0, _inherits3.default)(UnsupportedOperation, _Error4);

    function UnsupportedOperation(msg) {
        (0, _classCallCheck3.default)(this, UnsupportedOperation);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, (UnsupportedOperation.__proto__ || Object.getPrototypeOf(UnsupportedOperation)).call(this, msg));

        _this5.name = UnsupportedOperationExceptionName;
        return _this5;
    }

    return UnsupportedOperation;
}(Error);

var BusyExceptionName = exports.BusyExceptionName = 'BusyException';

var BusyException = exports.BusyException = function (_Error5) {
    (0, _inherits3.default)(BusyException, _Error5);

    function BusyException(msg) {
        (0, _classCallCheck3.default)(this, BusyException);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (BusyException.__proto__ || Object.getPrototypeOf(BusyException)).call(this, msg));

        _this6.name = BusyExceptionName;
        return _this6;
    }

    return BusyException;
}(Error);

var CallNotFoundExceptionName = exports.CallNotFoundExceptionName = 'CallNotFoundException';

var CallNotFoundException = exports.CallNotFoundException = function (_Error6) {
    (0, _inherits3.default)(CallNotFoundException, _Error6);

    function CallNotFoundException(msg) {
        (0, _classCallCheck3.default)(this, CallNotFoundException);

        var _this7 = (0, _possibleConstructorReturn3.default)(this, (CallNotFoundException.__proto__ || Object.getPrototypeOf(CallNotFoundException)).call(this, msg));

        _this7.name = CallNotFoundExceptionName;
        return _this7;
    }

    return CallNotFoundException;
}(Error);

var UnknownSignalingErrorName = exports.UnknownSignalingErrorName = 'UnknownSignalingError';

var UnknownSignalingError = exports.UnknownSignalingError = function (_Error7) {
    (0, _inherits3.default)(UnknownSignalingError, _Error7);

    function UnknownSignalingError() {
        (0, _classCallCheck3.default)(this, UnknownSignalingError);

        var _this8 = (0, _possibleConstructorReturn3.default)(this, (UnknownSignalingError.__proto__ || Object.getPrototypeOf(UnknownSignalingError)).call(this));

        _this8.name = UnknownSignalingErrorName;
        return _this8;
    }

    return UnknownSignalingError;
}(Error);

},{"babel-runtime/helpers/classCallCheck":10,"babel-runtime/helpers/inherits":13,"babel-runtime/helpers/possibleConstructorReturn":14}],131:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Timeout waiting for server response to accept/hangup request.
 */
var MAX_ACCEPT_BYE_DELAY_MS = exports.MAX_ACCEPT_BYE_DELAY_MS = 2000;
/**
 * Timeout waiting for server response to invite.
 */
var MAX_INVITE_DELAY_MS = exports.MAX_INVITE_DELAY_MS = 5000;
/**
 *  Default timeout on opening WebSocket connection.
 */
var DEFAULT_CONNECT_TIMEOUT_MS = exports.DEFAULT_CONNECT_TIMEOUT_MS = 10000;
/**
 * Default ice collection timeout in milliseconds.
 */
var DEFAULT_ICE_TIMEOUT_MS = exports.DEFAULT_ICE_TIMEOUT_MS = 8000;
/**
 * Default gum timeout in milliseconds to be enforced during start of a call.
 */
var DEFAULT_GUM_TIMEOUT_MS = exports.DEFAULT_GUM_TIMEOUT_MS = 10000;

/**
 * RTC error names.
 */
var RTC_ERRORS = exports.RTC_ERRORS = {
  ICE_COLLECTION_TIMEOUT: 'Ice Collection Timeout',
  USER_BUSY: 'User Busy',
  SIGNALLING_CONNECTION_FAILURE: 'Signalling Connection Failure',
  SIGNALLING_HANDSHAKE_FAILURE: 'Signalling Handshake Failure',
  SET_REMOTE_DESCRIPTION_FAILURE: 'Set Remote Description Failure',
  CREATE_OFFER_FAILURE: 'Create Offer Failure',
  SET_LOCAL_DESCRIPTION_FAILURE: 'Set Local Description Failure',
  INVALID_REMOTE_SDP: 'Invalid Remote SDP',
  NO_REMOTE_ICE_CANDIDATE: 'No Remote ICE Candidate',
  GUM_TIMEOUT_FAILURE: 'GUM Timeout Failure',
  GUM_OTHER_FAILURE: 'GUM Other Failure',
  CALL_NOT_FOUND: 'Call Not Found'
};

},{}],132:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FailedState = exports.DisconnectedState = exports.CleanUpState = exports.TalkingState = exports.AcceptState = exports.InviteAnswerState = exports.ConnectSignalingAndIceCollectionState = exports.SetLocalSessionDescriptionState = exports.CreateOfferState = exports.GrabLocalMediaState = exports.RTCSessionState = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

var _session_report = require('./session_report');

var _rtc_const = require('./rtc_const');

var _exceptions = require('./exceptions');

var _signaling = require('./signaling');

var _signaling2 = _interopRequireDefault(_signaling);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _rtpStats = require('./rtp-stats');

var _sdp = require('sdp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
var RTCSessionState = exports.RTCSessionState = function () {
    /**
     *
     * @param {RtcSession} rtcSession
     */
    function RTCSessionState(rtcSession) {
        (0, _classCallCheck3.default)(this, RTCSessionState);

        this._rtcSession = rtcSession;
    }

    (0, _createClass3.default)(RTCSessionState, [{
        key: 'onEnter',
        value: function onEnter() {}
    }, {
        key: 'onExit',
        value: function onExit() {}
    }, {
        key: '_isCurrentState',
        value: function _isCurrentState() {
            return this._rtcSession._state === this;
        }
    }, {
        key: 'transit',
        value: function transit(nextState) {
            if (this._isCurrentState()) {
                this._rtcSession.transit(nextState);
            }
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this.transit(new FailedState(this._rtcSession));
        }
    }, {
        key: 'onIceCandidate',
        value: function onIceCandidate(evt) {// eslint-disable-line no-unused-vars
            //ignore candidate by default, ConnectSignalingAndIceCollectionState will override to collect candidates, but collecting process could last much longer than ConnectSignalingAndIceCollectionState
            //we don't want to spam the console log
        }
    }, {
        key: 'onRemoteHungup',
        value: function onRemoteHungup() {
            throw new _exceptions.UnsupportedOperation('onRemoteHungup not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingConnected',
        value: function onSignalingConnected() {
            throw new _exceptions.UnsupportedOperation('onSignalingConnected not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingHandshaked',
        value: function onSignalingHandshaked() {
            throw new _exceptions.UnsupportedOperation('onSignalingHandshaked not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('onSignalingFailed not implemented by ' + this.name);
        }
    }, {
        key: 'onIceStateChange',
        value: function onIceStateChange(evt) {// eslint-disable-line no-unused-vars
        }
    }, {
        key: 'logger',
        get: function get() {
            return this._rtcSession._logger;
        }
    }, {
        key: 'name',
        get: function get() {
            return "RTCSessionState";
        }
    }]);
    return RTCSessionState;
}();

var GrabLocalMediaState = exports.GrabLocalMediaState = function (_RTCSessionState) {
    (0, _inherits3.default)(GrabLocalMediaState, _RTCSessionState);

    function GrabLocalMediaState() {
        (0, _classCallCheck3.default)(this, GrabLocalMediaState);
        return (0, _possibleConstructorReturn3.default)(this, (GrabLocalMediaState.__proto__ || Object.getPrototypeOf(GrabLocalMediaState)).apply(this, arguments));
    }

    (0, _createClass3.default)(GrabLocalMediaState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var startTime = Date.now();
            if (self._rtcSession._userAudioStream) {
                self.transit(new CreateOfferState(self._rtcSession));
            } else {
                var gumTimeoutPromise = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new _exceptions.GumTimeout('Local media has not been initialized yet.'));
                    }, self._rtcSession._gumTimeoutMillis);
                });
                var sessionGumPromise = self._gUM(self._rtcSession._buildMediaConstraints());

                Promise.race([sessionGumPromise, gumTimeoutPromise]).then(function (stream) {
                    self._rtcSession._sessionReport.gumTimeMillis = Date.now() - startTime;
                    self._rtcSession._onGumSuccess(self._rtcSession);
                    self._rtcSession._localStream = stream;
                    self._rtcSession._sessionReport.gumOtherFailure = false;
                    self._rtcSession._sessionReport.gumTimeoutFailure = false;
                    self.transit(new CreateOfferState(self._rtcSession));
                }).catch(function (e) {
                    self._rtcSession._sessionReport.gumTimeMillis = Date.now() - startTime;
                    var errorReason;
                    if (e instanceof _exceptions.GumTimeout) {
                        errorReason = _rtc_const.RTC_ERRORS.GUM_TIMEOUT_FAILURE;
                        self._rtcSession._sessionReport.gumTimeoutFailure = true;
                        self._rtcSession._sessionReport.gumOtherFailure = false;
                    } else {
                        errorReason = _rtc_const.RTC_ERRORS.GUM_OTHER_FAILURE;
                        self._rtcSession._sessionReport.gumOtherFailure = true;
                        self._rtcSession._sessionReport.gumTimeoutFailure = false;
                    }
                    self.logger.error('Local media initialization failed', e);
                    self._rtcSession._onGumError(self._rtcSession);
                    self.transit(new FailedState(self._rtcSession, errorReason));
                });
            }
        }
    }, {
        key: '_gUM',
        value: function _gUM(constraints) {
            return navigator.mediaDevices.getUserMedia(constraints);
        }
    }, {
        key: 'name',
        get: function get() {
            return "GrabLocalMediaState";
        }
    }]);
    return GrabLocalMediaState;
}(RTCSessionState);

var CreateOfferState = exports.CreateOfferState = function (_RTCSessionState2) {
    (0, _inherits3.default)(CreateOfferState, _RTCSessionState2);

    function CreateOfferState() {
        (0, _classCallCheck3.default)(this, CreateOfferState);
        return (0, _possibleConstructorReturn3.default)(this, (CreateOfferState.__proto__ || Object.getPrototypeOf(CreateOfferState)).apply(this, arguments));
    }

    (0, _createClass3.default)(CreateOfferState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var stream = self._rtcSession._localStream;
            self._rtcSession._pc.addStream(stream);
            self._rtcSession._onLocalStreamAdded(self._rtcSession, stream);
            self._rtcSession._pc.createOffer().then(function (rtcSessionDescription) {
                self._rtcSession._localSessionDescription = rtcSessionDescription;
                self._rtcSession._sessionReport.createOfferFailure = false;
                self.transit(new SetLocalSessionDescriptionState(self._rtcSession));
            }).catch(function (e) {
                self.logger.error('CreateOffer failed', e);
                self._rtcSession._sessionReport.createOfferFailure = true;
                self.transit(new FailedState(self._rtcSession, _rtc_const.RTC_ERRORS.CREATE_OFFER_FAILURE));
            });
        }
    }, {
        key: 'name',
        get: function get() {
            return "CreateOfferState";
        }
    }]);
    return CreateOfferState;
}(RTCSessionState);

var SetLocalSessionDescriptionState = exports.SetLocalSessionDescriptionState = function (_RTCSessionState3) {
    (0, _inherits3.default)(SetLocalSessionDescriptionState, _RTCSessionState3);

    function SetLocalSessionDescriptionState() {
        (0, _classCallCheck3.default)(this, SetLocalSessionDescriptionState);
        return (0, _possibleConstructorReturn3.default)(this, (SetLocalSessionDescriptionState.__proto__ || Object.getPrototypeOf(SetLocalSessionDescriptionState)).apply(this, arguments));
    }

    (0, _createClass3.default)(SetLocalSessionDescriptionState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;

            // fix/modify SDP as needed here, before setLocalDescription
            var localDescription = self._rtcSession._localSessionDescription;
            var sdpOptions = new _utils.SdpOptions();
            // Set audio codec.
            if (self._rtcSession._forceAudioCodec) {
                sdpOptions.forceCodec['audio'] = self._rtcSession._forceAudioCodec;
            }
            // Set video codec.
            if (self._rtcSession._forceVideoCodec) {
                sdpOptions.forceCodec['video'] = self._rtcSession._forceVideoCodec;
            }
            sdpOptions.enableOpusDtx = self._rtcSession._enableOpusDtx;

            var transformedSdp = (0, _utils.transformSdp)(localDescription.sdp, sdpOptions);
            localDescription.sdp = transformedSdp.sdp;

            self.logger.info('LocalSD', self._rtcSession._localSessionDescription);
            self._rtcSession._pc.setLocalDescription(self._rtcSession._localSessionDescription).then(function () {
                var initializationTime = Date.now() - self._rtcSession._connectTimeStamp;
                self._rtcSession._sessionReport.initializationTimeMillis = initializationTime;
                self._rtcSession._onSessionInitialized(self._rtcSession, initializationTime);
                self._rtcSession._sessionReport.setLocalDescriptionFailure = false;
                self.transit(new ConnectSignalingAndIceCollectionState(self._rtcSession, transformedSdp.mLines));
            }).catch(function (e) {
                self.logger.error('SetLocalDescription failed', e);
                self._rtcSession._sessionReport.setLocalDescriptionFailure = true;
                self.transit(new FailedState(self._rtcSession, _rtc_const.RTC_ERRORS.SET_LOCAL_DESCRIPTION_FAILURE));
            });
        }
    }, {
        key: 'name',
        get: function get() {
            return "SetLocalSessionDescriptionState";
        }
    }]);
    return SetLocalSessionDescriptionState;
}(RTCSessionState);

/**
 * Kick off signaling connection. Wait until signaling connects and ICE collection (which already started in previous state) completes.
 * ICE collection times out after user specified amount of time (default to DEFAULT_ICE_TIMEOUT_MS) in case user has complex network environment that blackholes STUN/TURN requests. In this case at least one candidate is required to move forward.
 * ICE collection could also wrap up before timeout if it's determined that RTP candidates from same TURN server have been collected for all m lines.
 */


var ConnectSignalingAndIceCollectionState = exports.ConnectSignalingAndIceCollectionState = function (_RTCSessionState4) {
    (0, _inherits3.default)(ConnectSignalingAndIceCollectionState, _RTCSessionState4);

    /**
     * Create ConnectSignalingAndIceCollectionState object.
     * @param {RtcSession} rtcSession
     * @param {number} mLines Number of m lines in SDP
     */
    function ConnectSignalingAndIceCollectionState(rtcSession, mLines) {
        (0, _classCallCheck3.default)(this, ConnectSignalingAndIceCollectionState);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, (ConnectSignalingAndIceCollectionState.__proto__ || Object.getPrototypeOf(ConnectSignalingAndIceCollectionState)).call(this, rtcSession));

        _this4._iceCandidates = [];
        _this4._iceCandidateFoundationsMap = {};
        _this4._mLines = mLines;
        return _this4;
    }

    (0, _createClass3.default)(ConnectSignalingAndIceCollectionState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            self._startTime = Date.now();
            setTimeout(function () {
                if (self._isCurrentState() && !self._iceCompleted) {
                    self.logger.warn('ICE collection timed out');
                    self._reportIceCompleted(true);
                }
            }, self._rtcSession._iceTimeoutMillis);
            self._rtcSession._createSignalingChannel().connect();
        }
    }, {
        key: 'onSignalingConnected',
        value: function onSignalingConnected() {
            this._rtcSession._signallingConnectTimestamp = Date.now();
            this._rtcSession._sessionReport.signallingConnectTimeMillis = this._rtcSession._signallingConnectTimestamp - this._startTime;
            this._signalingConnected = true;
            this._rtcSession._onSignalingConnected(this._rtcSession);
            this._rtcSession._sessionReport.signallingConnectionFailure = false;
            this._checkAndTransit();
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            this._rtcSession._sessionReport.signallingConnectTimeMillis = Date.now() - this._startTime;
            this.logger.error('Failed connecting to signaling server', e);
            this._rtcSession._sessionReport.signallingConnectionFailure = true;
            this.transit(new FailedState(this._rtcSession, _rtc_const.RTC_ERRORS.SIGNALLING_CONNECTION_FAILURE));
        }
    }, {
        key: '_createLocalCandidate',
        value: function _createLocalCandidate(initDict) {
            return new RTCIceCandidate(initDict);
        }
    }, {
        key: 'onIceCandidate',
        value: function onIceCandidate(evt) {
            var candidate = evt.candidate;
            this.logger.log('onicecandidate ' + JSON.stringify(candidate));
            if (candidate) {
                this._iceCandidates.push(this._createLocalCandidate(candidate));

                if (!this._iceCompleted) {
                    this._checkCandidatesSufficient(candidate);
                }
            } else {
                this._reportIceCompleted(false);
            }
        }
    }, {
        key: '_checkCandidatesSufficient',
        value: function _checkCandidatesSufficient(candidate) {
            //check if we collected sufficient candidates from single media server to start the call
            var candidateObj = (0, _sdp.parseCandidate)(candidate.candidate);
            if (candidateObj.component != 1) {
                return;
            }
            var candidateFoundation = candidateObj.foundation;
            var candidateMLineIndex = candidate.sdpMLineIndex;
            if (candidateFoundation && candidateMLineIndex >= 0 && candidateMLineIndex < this._mLines) {
                var mIndexList = this._iceCandidateFoundationsMap[candidateFoundation] || [];
                if (!mIndexList.includes(candidateMLineIndex)) {
                    mIndexList.push(candidateMLineIndex);
                }
                this._iceCandidateFoundationsMap[candidateFoundation] = mIndexList;

                if (this._mLines == mIndexList.length) {
                    this._reportIceCompleted(false);
                }
            }
        }
    }, {
        key: '_reportIceCompleted',
        value: function _reportIceCompleted(isTimeout) {
            this._rtcSession._sessionReport.iceCollectionTimeMillis = Date.now() - this._startTime;
            this._iceCompleted = true;
            this._rtcSession._onIceCollectionComplete(this._rtcSession, isTimeout, this._iceCandidates.length);
            if (this._iceCandidates.length > 0) {
                this._rtcSession._sessionReport.iceCollectionFailure = false;
                this._checkAndTransit();
            } else {
                this.logger.error('No ICE candidate');
                this._rtcSession._sessionReport.iceCollectionFailure = true;
                this.transit(new FailedState(this._rtcSession, _rtc_const.RTC_ERRORS.ICE_COLLECTION_TIMEOUT));
            }
        }
    }, {
        key: '_checkAndTransit',
        value: function _checkAndTransit() {
            if (this._iceCompleted && this._signalingConnected) {
                this.transit(new InviteAnswerState(this._rtcSession, this._iceCandidates));
            } else if (!this._iceCompleted) {
                this.logger.log('Pending ICE collection');
            } else {
                //implies _signalingConnected == false
                this.logger.log('Pending signaling connection');
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "ConnectSignalingAndIceCollectionState";
        }
    }]);
    return ConnectSignalingAndIceCollectionState;
}(RTCSessionState);

var InviteAnswerState = exports.InviteAnswerState = function (_RTCSessionState5) {
    (0, _inherits3.default)(InviteAnswerState, _RTCSessionState5);

    function InviteAnswerState(rtcSession, iceCandidates) {
        (0, _classCallCheck3.default)(this, InviteAnswerState);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, (InviteAnswerState.__proto__ || Object.getPrototypeOf(InviteAnswerState)).call(this, rtcSession));

        _this5._iceCandidates = iceCandidates;
        return _this5;
    }

    (0, _createClass3.default)(InviteAnswerState, [{
        key: 'onEnter',
        value: function onEnter() {
            var rtcSession = this._rtcSession;
            rtcSession._onSignalingStarted(rtcSession);
            rtcSession._signalingChannel.invite(rtcSession._localSessionDescription.sdp, this._iceCandidates);
        }
    }, {
        key: 'onSignalingAnswered',
        value: function onSignalingAnswered(sdp, candidates) {
            this._rtcSession._sessionReport.userBusyFailure = false;
            this._rtcSession._sessionReport.handshakingFailure = false;
            this.transit(new AcceptState(this._rtcSession, sdp, candidates));
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            var reason;
            if (e.name == _exceptions.BusyExceptionName) {
                this.logger.error('User Busy, possibly multiple CCP windows open', e);
                this._rtcSession._sessionReport.userBusyFailure = true;
                this._rtcSession._sessionReport.handshakingFailure = true;
                reason = _rtc_const.RTC_ERRORS.USER_BUSY;
            } else if (e.name == _exceptions.CallNotFoundExceptionName) {
                this.logger.error('Call not found. One of the participant probably hungup.', e);
                reason = _rtc_const.RTC_ERRORS.CALL_NOT_FOUND;
                this._rtcSession._sessionReport.handshakingFailure = true;
            } else {
                this.logger.error('Failed handshaking with signaling server', e);
                this._rtcSession._sessionReport.userBusyFailure = false;
                this._rtcSession._sessionReport.handshakingFailure = true;
                reason = _rtc_const.RTC_ERRORS.SIGNALLING_HANDSHAKE_FAILURE;
            }
            this.transit(new FailedState(this._rtcSession, reason));
        }
    }, {
        key: 'name',
        get: function get() {
            return "InviteAnswerState";
        }
    }]);
    return InviteAnswerState;
}(RTCSessionState);

var AcceptState = exports.AcceptState = function (_RTCSessionState6) {
    (0, _inherits3.default)(AcceptState, _RTCSessionState6);

    function AcceptState(rtcSession, sdp, candidates) {
        (0, _classCallCheck3.default)(this, AcceptState);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (AcceptState.__proto__ || Object.getPrototypeOf(AcceptState)).call(this, rtcSession));

        _this6._sdp = sdp;
        _this6._candidates = candidates;
        return _this6;
    }

    (0, _createClass3.default)(AcceptState, [{
        key: '_createSessionDescription',
        value: function _createSessionDescription(initDict) {
            return new RTCSessionDescription(initDict);
        }
    }, {
        key: '_createRemoteCandidate',
        value: function _createRemoteCandidate(initDict) {
            return new RTCIceCandidate(initDict);
        }
    }, {
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var rtcSession = self._rtcSession;

            if (!self._sdp) {
                self.logger.error('Invalid remote SDP');
                rtcSession._stopSession();
                rtcSession._sessionReport.invalidRemoteSDPFailure = true;
                self.transit(new FailedState(rtcSession, _rtc_const.RTC_ERRORS.INVALID_REMOTE_SDP));
                return;
            } else if (!self._candidates || self._candidates.length < 1) {
                self.logger.error('No remote ICE candidate');
                rtcSession._stopSession();
                rtcSession._sessionReport.noRemoteIceCandidateFailure = true;
                self.transit(new FailedState(rtcSession, _rtc_const.RTC_ERRORS.NO_REMOTE_ICE_CANDIDATE));
                return;
            }

            rtcSession._sessionReport.invalidRemoteSDPFailure = false;
            rtcSession._sessionReport.noRemoteIceCandidateFailure = false;
            var setRemoteDescriptionPromise = rtcSession._pc.setRemoteDescription(self._createSessionDescription({
                type: 'answer',
                sdp: self._sdp
            }));
            setRemoteDescriptionPromise.catch(function (e) {
                self.logger.error('SetRemoteDescription failed', e);
            });
            setRemoteDescriptionPromise.then(function () {
                var remoteCandidatePromises = Promise.all(self._candidates.map(function (candidate) {
                    var remoteCandidate = self._createRemoteCandidate(candidate);
                    self.logger.info('Adding remote candidate', remoteCandidate);
                    return rtcSession._pc.addIceCandidate(remoteCandidate);
                }));
                remoteCandidatePromises.catch(function (reason) {
                    self.logger.warn('Error adding remote candidate', reason);
                });
                return remoteCandidatePromises;
            }).then(function () {
                rtcSession._sessionReport.setRemoteDescriptionFailure = false;
                self._remoteDescriptionSet = true;
                self._checkAndTransit();
            }).catch(function () {
                rtcSession._stopSession();
                rtcSession._sessionReport.setRemoteDescriptionFailure = true;
                self.transit(new FailedState(rtcSession, _rtc_const.RTC_ERRORS.SET_REMOTE_DESCRIPTION_FAILURE));
            });
        }
    }, {
        key: 'onSignalingHandshaked',
        value: function onSignalingHandshaked() {
            this._rtcSession._sessionReport.handshakingTimeMillis = Date.now() - this._rtcSession._signallingConnectTimestamp;
            this._signalingHandshaked = true;
            this._checkAndTransit();
        }
    }, {
        key: '_checkAndTransit',
        value: function _checkAndTransit() {
            if (this._signalingHandshaked && this._remoteDescriptionSet) {
                this.transit(new TalkingState(this._rtcSession));
            } else if (!this._signalingHandshaked) {
                this.logger.log('Pending handshaking');
            } else {
                //implies _remoteDescriptionSet == false
                this.logger.log('Pending setting remote description');
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "AcceptState";
        }
    }]);
    return AcceptState;
}(RTCSessionState);

var TalkingState = exports.TalkingState = function (_RTCSessionState7) {
    (0, _inherits3.default)(TalkingState, _RTCSessionState7);

    function TalkingState() {
        (0, _classCallCheck3.default)(this, TalkingState);
        return (0, _possibleConstructorReturn3.default)(this, (TalkingState.__proto__ || Object.getPrototypeOf(TalkingState)).apply(this, arguments));
    }

    (0, _createClass3.default)(TalkingState, [{
        key: 'onEnter',
        value: function onEnter() {
            this._startTime = Date.now();
            this._rtcSession._sessionReport.preTalkingTimeMillis = this._startTime - this._rtcSession._connectTimeStamp;
            this._rtcSession._onSessionConnected(this._rtcSession);
        }
    }, {
        key: 'onSignalingReconnected',
        value: function onSignalingReconnected() {}
    }, {
        key: 'onRemoteHungup',
        value: function onRemoteHungup() {
            this._rtcSession._signalingChannel.hangup();
            this.transit(new DisconnectedState(this._rtcSession));
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this._rtcSession._signalingChannel.hangup();
            this.transit(new DisconnectedState(this._rtcSession));
        }
    }, {
        key: 'onIceStateChange',
        value: function onIceStateChange(evt) {
            if (evt.currentTarget.iceConnectionState == 'disconnected') {
                this.logger.info('Lost ICE connection');
                this._rtcSession._sessionReport.iceConnectionsLost += 1;
            }
        }
    }, {
        key: 'onExit',
        value: function onExit() {
            this._rtcSession._sessionReport.talkingTimeMillis = Date.now() - this._startTime;
            this._rtcSession._detachMedia();
            this._rtcSession._sessionReport.sessionEndTime = new Date();
            this._rtcSession._onSessionCompleted(this._rtcSession);
        }
    }, {
        key: 'name',
        get: function get() {
            return "TalkingState";
        }
    }]);
    return TalkingState;
}(RTCSessionState);

var CleanUpState = exports.CleanUpState = function (_RTCSessionState8) {
    (0, _inherits3.default)(CleanUpState, _RTCSessionState8);

    function CleanUpState() {
        (0, _classCallCheck3.default)(this, CleanUpState);
        return (0, _possibleConstructorReturn3.default)(this, (CleanUpState.__proto__ || Object.getPrototypeOf(CleanUpState)).apply(this, arguments));
    }

    (0, _createClass3.default)(CleanUpState, [{
        key: 'onEnter',
        value: function onEnter() {
            this._startTime = Date.now();
            this._rtcSession._stopSession();
            this._rtcSession._sessionReport.cleanupTimeMillis = Date.now() - this._startTime;
            this._rtcSession._onSessionDestroyed(this._rtcSession, this._rtcSession._sessionReport);
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            //do nothing, already at the end of lifecycle
        }
    }, {
        key: 'name',
        get: function get() {
            return "CleanUpState";
        }
    }]);
    return CleanUpState;
}(RTCSessionState);

var DisconnectedState = exports.DisconnectedState = function (_CleanUpState) {
    (0, _inherits3.default)(DisconnectedState, _CleanUpState);

    function DisconnectedState() {
        (0, _classCallCheck3.default)(this, DisconnectedState);
        return (0, _possibleConstructorReturn3.default)(this, (DisconnectedState.__proto__ || Object.getPrototypeOf(DisconnectedState)).apply(this, arguments));
    }

    (0, _createClass3.default)(DisconnectedState, [{
        key: 'name',
        get: function get() {
            return "DisconnectedState";
        }
    }]);
    return DisconnectedState;
}(CleanUpState);

var FailedState = exports.FailedState = function (_CleanUpState2) {
    (0, _inherits3.default)(FailedState, _CleanUpState2);

    function FailedState(rtcSession, failureReason) {
        (0, _classCallCheck3.default)(this, FailedState);

        var _this10 = (0, _possibleConstructorReturn3.default)(this, (FailedState.__proto__ || Object.getPrototypeOf(FailedState)).call(this, rtcSession));

        _this10._failureReason = failureReason;
        return _this10;
    }

    (0, _createClass3.default)(FailedState, [{
        key: 'onEnter',
        value: function onEnter() {
            this._rtcSession._sessionReport.sessionEndTime = new Date();
            this._rtcSession._onSessionFailed(this._rtcSession, this._failureReason);
            (0, _get3.default)(FailedState.prototype.__proto__ || Object.getPrototypeOf(FailedState.prototype), 'onEnter', this).call(this);
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailedState";
        }
    }]);
    return FailedState;
}(CleanUpState);

var RtcSession = function () {
    /**
     * Build an AmazonConnect RTC session.
     * @param {*} signalingUri
     * @param {*} iceServers Array of ice servers
     * @param {*} contactToken A string representing the contact token (optional)
     * @param {*} logger An object provides logging functions, such as console
     * @param {*} contactId Must be UUID, uniquely identifies the session.
     */
    function RtcSession(signalingUri, iceServers, contactToken, logger, contactId) {
        (0, _classCallCheck3.default)(this, RtcSession);

        if (typeof signalingUri !== 'string' || signalingUri.trim().length === 0) {
            throw new _exceptions.IllegalParameters('signalingUri required');
        }
        if (!iceServers) {
            throw new _exceptions.IllegalParameters('iceServers required');
        }
        if ((typeof logger === 'undefined' ? 'undefined' : (0, _typeof3.default)(logger)) !== 'object') {
            throw new _exceptions.IllegalParameters('logger required');
        }
        if (!contactId) {
            this._callId = (0, _v2.default)();
        } else {
            this._callId = contactId;
        }

        this._sessionReport = new _session_report.SessionReport();
        this._signalingUri = signalingUri;
        this._iceServers = iceServers;
        this._contactToken = contactToken;
        this._originalLogger = logger;
        this._logger = (0, _utils.wrapLogger)(this._originalLogger, this._callId, 'SESSION');
        this._iceTimeoutMillis = _rtc_const.DEFAULT_ICE_TIMEOUT_MS;
        this._gumTimeoutMillis = _rtc_const.DEFAULT_GUM_TIMEOUT_MS;

        this._enableAudio = true;
        this._enableVideo = false;
        this._facingMode = 'user';

        /**
         * user may provide the stream to the RtcSession directly to connect to the other end.
         * user may also acquire the stream from the local device.
         * This flag is used to track where the stream is acquired.
         * If it's acquired from local devices, then we must close the stream when the session ends.
         * If it's provided by user (rather than local camera/microphone), then we should leave it open when the
         * session ends.
         */
        this._userProvidedStream = false;

        this._onGumError = this._onGumSuccess = this._onLocalStreamAdded = this._onSessionFailed = this._onSessionInitialized = this._onSignalingConnected = this._onIceCollectionComplete = this._onSignalingStarted = this._onSessionConnected = this._onRemoteStreamAdded = this._onSessionCompleted = this._onSessionDestroyed = function () {};
    }

    (0, _createClass3.default)(RtcSession, [{
        key: 'pauseLocalVideo',
        value: function pauseLocalVideo() {
            if (this._localStream) {
                var videoTrack = this._localStream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeLocalVideo',
        value: function resumeLocalVideo() {
            if (this._localStream) {
                var videoTrack = this._localStream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseRemoteVideo',
        value: function pauseRemoteVideo() {
            if (this._remoteVideoStream) {
                var videoTrack = this._remoteVideoStream.getTracks()[1];
                if (videoTrack) {
                    videoTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeRemoteVideo',
        value: function resumeRemoteVideo() {
            if (this._remoteVideoStream) {
                var videoTrack = this._remoteVideoStream.getTracks()[1];
                if (videoTrack) {
                    videoTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseLocalAudio',
        value: function pauseLocalAudio() {
            if (this._localStream) {
                var audioTrack = this._localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeLocalAudio',
        value: function resumeLocalAudio() {
            if (this._localStream) {
                var audioTrack = this._localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseRemoteAudio',
        value: function pauseRemoteAudio() {
            if (this._remoteAudioStream) {
                var audioTrack = this._remoteAudioStream.getTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeRemoteAudio',
        value: function resumeRemoteAudio() {
            if (this._remoteAudioStream) {
                var audioTrack = this._remoteAudioStream.getTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = true;
                }
            }
        }
        /**
         * Callback when gUM succeeds.
         * First param is RtcSession object.
         */

    }, {
        key: 'transit',
        value: function transit(nextState) {
            try {
                this._logger.info((this._state ? this._state.name : 'null') + ' => ' + nextState.name);
                if (this._state && this._state.onExit) {
                    this._state.onExit();
                }
            } finally {
                this._state = nextState;
                if (nextState.onEnter) {
                    try {
                        nextState.onEnter();
                    } catch (e) {
                        this._logger.warn(nextState.name + '#onEnter failed', e);
                        throw e; // eslint-disable-line no-unsafe-finally
                    }
                }
            }
        }
    }, {
        key: '_createSignalingChannel',
        value: function _createSignalingChannel() {
            var signalingChannel = new _signaling2.default(this._callId, this._signalingUri, this._contactToken, this._originalLogger, this._signalingConnectTimeout);
            signalingChannel.onConnected = (0, _utils.hitch)(this, this._signalingConnected);
            signalingChannel.onAnswered = (0, _utils.hitch)(this, this._signalingAnswered);
            signalingChannel.onHandshaked = (0, _utils.hitch)(this, this._signalingHandshaked);
            signalingChannel.onRemoteHungup = (0, _utils.hitch)(this, this._signalingRemoteHungup);
            signalingChannel.onFailed = (0, _utils.hitch)(this, this._signalingFailed);
            signalingChannel.onDisconnected = (0, _utils.hitch)(this, this._signalingDisconnected);

            this._signalingChannel = signalingChannel;

            return signalingChannel;
        }
    }, {
        key: '_signalingConnected',
        value: function _signalingConnected() {
            this._state.onSignalingConnected();
        }
    }, {
        key: '_signalingAnswered',
        value: function _signalingAnswered(sdp, candidates) {
            this._state.onSignalingAnswered(sdp, candidates);
        }
    }, {
        key: '_signalingHandshaked',
        value: function _signalingHandshaked() {
            this._state.onSignalingHandshaked();
        }
    }, {
        key: '_signalingRemoteHungup',
        value: function _signalingRemoteHungup() {
            this._state.onRemoteHungup();
        }
    }, {
        key: '_signalingFailed',
        value: function _signalingFailed(e) {
            this._state.onSignalingFailed(e);
        }
    }, {
        key: '_signalingDisconnected',
        value: function _signalingDisconnected() {}
    }, {
        key: '_createPeerConnection',
        value: function _createPeerConnection(configuration) {
            return new RTCPeerConnection(configuration);
        }
    }, {
        key: 'connect',
        value: function connect() {
            var self = this;
            var now = new Date();
            self._sessionReport.sessionStartTime = now;
            self._connectTimeStamp = now.getTime();

            self._pc = self._createPeerConnection({
                iceServers: self._iceServers,
                iceTransportPolicy: 'relay',
                rtcpMuxPolicy: 'require',
                bundlePolicy: 'balanced',
                sdpSemantics: 'plan-b'
            }, {
                optional: [{
                    googDscp: true
                }]
            });

            self._pc.ontrack = (0, _utils.hitch)(self, self._ontrack);
            self._pc.onicecandidate = (0, _utils.hitch)(self, self._onIceCandidate);
            self._pc.oniceconnectionstatechange = (0, _utils.hitch)(self, self._onIceStateChange);

            self.transit(new GrabLocalMediaState(self));
        }
    }, {
        key: 'accept',
        value: function accept() {
            throw new _exceptions.UnsupportedOperation('accept does not go through signaling channel at this moment');
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this._state.hangup();
        }

        /**
         * Get a promise containing an object with two named lists of audio stats, one for each channel on each
         * media type of 'video' and 'audio'.
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         */

    }, {
        key: 'getStats',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var _this11 = this;

                var timestamp, impl, statsResult, rttReducer, audioInputRttMilliseconds, videoInputRttMilliseconds;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                timestamp = new Date();

                                impl = function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(stream, streamType) {
                                        var tracks;
                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        tracks = [];

                                                        if (stream) {
                                                            _context2.next = 3;
                                                            break;
                                                        }

                                                        return _context2.abrupt('return', []);

                                                    case 3:
                                                        _context2.t0 = streamType;
                                                        _context2.next = _context2.t0 === 'audio_input' ? 6 : _context2.t0 === 'audio_output' ? 6 : _context2.t0 === 'video_input' ? 8 : _context2.t0 === 'video_output' ? 8 : 10;
                                                        break;

                                                    case 6:
                                                        tracks = stream.getAudioTracks();
                                                        return _context2.abrupt('break', 11);

                                                    case 8:
                                                        tracks = stream.getVideoTracks();
                                                        return _context2.abrupt('break', 11);

                                                    case 10:
                                                        throw new Error('Unsupported stream type while trying to get stats: ' + streamType);

                                                    case 11:
                                                        _context2.next = 13;
                                                        return Promise.all(tracks.map(function () {
                                                            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(track) {
                                                                var rawStats, digestedStats;
                                                                return _regenerator2.default.wrap(function _callee$(_context) {
                                                                    while (1) {
                                                                        switch (_context.prev = _context.next) {
                                                                            case 0:
                                                                                _context.next = 2;
                                                                                return _this11._pc.getStats(track);

                                                                            case 2:
                                                                                rawStats = _context.sent;
                                                                                digestedStats = (0, _rtpStats.extractMediaStatsFromStats)(timestamp, rawStats, streamType);

                                                                                if (digestedStats) {
                                                                                    _context.next = 6;
                                                                                    break;
                                                                                }

                                                                                throw new Error('Failed to extract MediaRtpStats from RTCStatsReport for stream type ' + streamType);

                                                                            case 6:
                                                                                return _context.abrupt('return', digestedStats);

                                                                            case 7:
                                                                            case 'end':
                                                                                return _context.stop();
                                                                        }
                                                                    }
                                                                }, _callee, _this11);
                                                            }));

                                                            return function (_x3) {
                                                                return _ref3.apply(this, arguments);
                                                            };
                                                        }()));

                                                    case 13:
                                                        return _context2.abrupt('return', _context2.sent);

                                                    case 14:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this11);
                                    }));

                                    return function impl(_x, _x2) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }();

                                if (!(this._pc && this._pc.signalingState === 'stable')) {
                                    _context3.next = 26;
                                    break;
                                }

                                _context3.next = 5;
                                return impl(this._remoteAudioStream, 'audio_input');

                            case 5:
                                _context3.t0 = _context3.sent;
                                _context3.next = 8;
                                return impl(this._localStream, 'audio_output');

                            case 8:
                                _context3.t1 = _context3.sent;
                                _context3.t2 = {
                                    input: _context3.t0,
                                    output: _context3.t1
                                };
                                _context3.next = 12;
                                return impl(this._remoteVideoStream, 'video_input');

                            case 12:
                                _context3.t3 = _context3.sent;
                                _context3.next = 15;
                                return impl(this._localStream, 'video_output');

                            case 15:
                                _context3.t4 = _context3.sent;
                                _context3.t5 = {
                                    input: _context3.t3,
                                    output: _context3.t4
                                };
                                statsResult = {
                                    audio: _context3.t2,
                                    video: _context3.t5
                                };

                                // For consistency's sake, coalesce rttMilliseconds into the output for audio and video.
                                rttReducer = function rttReducer(acc, stats) {
                                    if (stats.rttMilliseconds !== null && (acc === null || stats.rttMilliseconds > acc)) {
                                        acc = stats.rttMilliseconds;
                                    }
                                    stats._rttMilliseconds = null;
                                    return acc;
                                };

                                audioInputRttMilliseconds = statsResult.audio.input.reduce(rttReducer, null);
                                videoInputRttMilliseconds = statsResult.video.input.reduce(rttReducer, null);


                                if (audioInputRttMilliseconds !== null) {
                                    statsResult.audio.output.forEach(function (stats) {
                                        stats._rttMilliseconds = audioInputRttMilliseconds;
                                    });
                                }

                                if (videoInputRttMilliseconds !== null) {
                                    statsResult.video.output.forEach(function (stats) {
                                        stats._rttMilliseconds = videoInputRttMilliseconds;
                                    });
                                }

                                return _context3.abrupt('return', statsResult);

                            case 26:
                                return _context3.abrupt('return', Promise.reject(new _exceptions.IllegalState()));

                            case 27:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function getStats() {
                return _ref.apply(this, arguments);
            }

            return getStats;
        }()

        /**
         * Get a promise of MediaRtpStats object for remote audio (from Amazon Connect to client).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         * @deprecated in favor of getStats()
         */

    }, {
        key: 'getRemoteAudioStats',
        value: function getRemoteAudioStats() {
            return this.getStats().then(function (stats) {
                if (stats.audio.output.length > 0) {
                    return stats.audio.output[0];
                } else {
                    return Promise.reject(new _exceptions.IllegalState());
                }
            });
        }

        /**
         * Get a promise of MediaRtpStats object for user audio (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         * @deprecated in favor of getStats()
         */

    }, {
        key: 'getUserAudioStats',
        value: function getUserAudioStats() {
            return this.getStats().then(function (stats) {
                if (stats.audio.input.length > 0) {
                    return stats.audio.input[0];
                } else {
                    return Promise.reject(new _exceptions.IllegalState());
                }
            });
        }

        /**
         * Get a promise of MediaRtpStats object for user video (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         * @deprecated in favor of getStats()
         */

    }, {
        key: 'getRemoteVideoStats',
        value: function getRemoteVideoStats() {
            return this.getStats().then(function (stats) {
                if (stats.video.output.length > 0) {
                    return stats.video.output[0];
                } else {
                    return Promise.reject(new _exceptions.IllegalState());
                }
            });
        }

        /**
         * Get a promise of MediaRtpStats object for user video (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         * @deprecated in favor of getStats()
         */

    }, {
        key: 'getUserVideoStats',
        value: function getUserVideoStats() {
            return this.getStats().then(function (stats) {
                if (stats.video.input.length > 0) {
                    return stats.video.input[0];
                } else {
                    return Promise.reject(new _exceptions.IllegalState());
                }
            });
        }
    }, {
        key: '_onIceCandidate',
        value: function _onIceCandidate(evt) {
            this._state.onIceCandidate(evt);
        }
    }, {
        key: '_onIceStateChange',
        value: function _onIceStateChange(evt) {
            this._state.onIceStateChange(evt);
        }

        /**
         * Attach remote media stream to web element.
         */

    }, {
        key: '_ontrack',
        value: function _ontrack(evt) {
            if (evt.streams.length > 1) {
                this._logger.warn('Found more than 1 streams for ' + evt.track.kind + ' track ' + evt.track.id + ' : ' + evt.streams.map(function (stream) {
                    return stream.id;
                }).join(','));
            }
            if (evt.track.kind === 'video' && this._remoteVideoElement) {
                this._remoteVideoElement.srcObject = evt.streams[0];
                this._remoteVideoStream = evt.streams[0];
            } else if (evt.track.kind === 'audio' && this._remoteAudioElement) {
                this._remoteAudioElement.srcObject = evt.streams[0];
                this._remoteAudioStream = evt.streams[0];
            }
            this._onRemoteStreamAdded(this, evt.streams[0]);
        }
    }, {
        key: '_detachMedia',
        value: function _detachMedia() {
            if (this._remoteVideoElement) {
                this._remoteVideoElement.srcObject = null;
            }
            if (this._remoteAudioElement) {
                this._remoteAudioElement.srcObject = null;
                this._remoteAudioStream = null;
            }
        }
    }, {
        key: '_stopSession',
        value: function _stopSession() {
            try {
                if (this._localStream && !this._userProvidedStream) {
                    (0, _utils.closeStream)(this._localStream);
                    this._localStream = null;
                    this._userProvidedStream = false;
                }
            } finally {
                try {
                    if (this._pc) {
                        this._pc.close();
                    }
                } catch (e) {
                    // eat exception
                } finally {
                    this._pc = null;
                }
            }
        }
    }, {
        key: '_buildMediaConstraints',
        value: function _buildMediaConstraints() {
            var self = this;
            var mediaConstraints = {};

            if (self._enableAudio) {
                var audioConstraints = {};
                if (typeof self._echoCancellation !== 'undefined') {
                    audioConstraints.echoCancellation = !!self._echoCancellation;
                }
                if (Object.keys(audioConstraints).length > 0) {
                    mediaConstraints.audio = audioConstraints;
                } else {
                    mediaConstraints.audio = true;
                }
            } else {
                mediaConstraints.audio = false;
            }

            if (self._enableVideo) {
                var videoConstraints = {};
                var widthConstraints = {};
                var heightConstraints = {};
                var frameRateConstraints = {};

                //build video width constraints
                if (typeof self._idealVideoWidth !== 'undefined') {
                    widthConstraints.ideal = self._idealVideoWidth;
                }
                if (typeof self._maxVideoWidth !== 'undefined') {
                    widthConstraints.max = self._maxVideoWidth;
                }
                if (typeof self._minVideoWidth !== 'undefined') {
                    widthConstraints.min = self._minVideoWidth;
                }
                // build video height constraints
                if (typeof self._idealVideoHeight !== 'undefined') {
                    heightConstraints.ideal = self._idealVideoHeight;
                }
                if (typeof self._maxVideoHeight !== 'undefined') {
                    heightConstraints.max = self._maxVideoHeight;
                }
                if (typeof self._minVideoHeight !== 'undefined') {
                    heightConstraints.min = self._minVideoHeight;
                }
                if (Object.keys(widthConstraints).length > 0 && Object.keys(heightConstraints).length > 0) {
                    videoConstraints.width = widthConstraints;
                    videoConstraints.height = heightConstraints;
                }
                // build frame rate constraints
                if (typeof self._videoFrameRate !== 'undefined') {
                    frameRateConstraints.ideal = self._videoFrameRate;
                }
                if (typeof self._minVideoFrameRate !== 'undefined') {
                    frameRateConstraints.min = self._minVideoFrameRate;
                }
                if (typeof self._maxVideoFrameRate !== 'undefined') {
                    frameRateConstraints.max = self._maxVideoFrameRate;
                }
                if (Object.keys(frameRateConstraints).length > 0) {
                    videoConstraints.frameRate = frameRateConstraints;
                }

                // build facing mode constraints
                if (self._facingMode !== 'user' && self._facingMode !== "environment") {
                    self._facingMode = 'user';
                }
                videoConstraints.facingMode = self._facingMode;

                // set video constraints
                if (Object.keys(videoConstraints).length > 0) {
                    mediaConstraints.video = videoConstraints;
                } else {
                    mediaConstraints.video = true;
                }
            }

            return mediaConstraints;
        }
    }, {
        key: 'sessionReport',
        get: function get() {
            return this._sessionReport;
        }
    }, {
        key: 'callId',
        get: function get() {
            return this._callId;
        }
        /**
         * getMediaStream returns the local stream, which may be acquired from local device or from user provided stream.
         * Rather than getting a stream by calling getUserMedia (which gets a stream from local device such as camera),
         * user could also provide the stream to the RtcSession directly to connect to the other end.
         */

    }, {
        key: 'mediaStream',
        get: function get() {
            return this._localStream;
        },

        /**
         * Optional. RtcSession will grab input device if this is not specified.
         * Please note: this RtcSession class only support single audio track and/or single video track.
         */
        set: function set(input) {
            this._localStream = input;
            this._userProvidedStream = true;
        }
        /**
         * Needed, expect an audio element that can be used to play remote audio stream.
         */

    }, {
        key: 'remoteVideoStream',
        get: function get() {
            return this._remoteVideoStream;
        }
    }, {
        key: 'onGumSuccess',
        set: function set(handler) {
            this._onGumSuccess = handler;
        }
        /**
         * Callback when gUM fails.
         * First param is RtcSession object.
         * Second param is the error.
         */

    }, {
        key: 'onGumError',
        set: function set(handler) {
            this._onGumError = handler;
        }
        /**
         * Callback if failed initializing local resources
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionFailed',
        set: function set(handler) {
            this._onSessionFailed = handler;
        }
        /**
         * Callback after local user media stream is added to the session.
         * First param is RtcSession object.
         * Second param is media stream
         */

    }, {
        key: 'onLocalStreamAdded',
        set: function set(handler) {
            this._onLocalStreamAdded = handler;
        }
        /**
         * Callback when all local resources are ready. Establishing signaling chanel and ICE collection happens at the same time after this.
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionInitialized',
        set: function set(handler) {
            this._onSessionInitialized = handler;
        }
        /**
         * Callback when signaling channel is established.
         * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
         *
         * First param is RtcSession object.
         */

    }, {
        key: 'onSignalingConnected',
        set: function set(handler) {
            this._onSignalingConnected = handler;
        }
        /**
         * Callback when ICE collection completes either because there is no more candidate or collection timed out.
         * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
         *
         * First param is RtcSession object.
         * Second param is boolean, TRUE - ICE collection timed out.
         * Third param is number of candidates collected.
         */

    }, {
        key: 'onIceCollectionComplete',
        set: function set(handler) {
            this._onIceCollectionComplete = handler;
        }
        /**
         * Callback when signaling channel is established and ICE collection completed with at least one candidate.
         * First param is RtcSession object.
         */

    }, {
        key: 'onSignalingStarted',
        set: function set(handler) {
            this._onSignalingStarted = handler;
        }
        /**
         * Callback when the call is established (handshaked and media stream should be flowing)
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionConnected',
        set: function set(handler) {
            this._onSessionConnected = handler;
        }
        /**
         * Callback after remote media stream is added to the session.
         * This could be called multiple times with the same stream if multiple tracks are included in the same stream.
         *
         * First param is RtcSession object.
         * Second param is media stream track.
         */

    }, {
        key: 'onRemoteStreamAdded',
        set: function set(handler) {
            this._onRemoteStreamAdded = handler;
        }
        /**
         * Callback when the hangup is initiated (implies the call was successfully established).
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionCompleted',
        set: function set(handler) {
            this._onSessionCompleted = handler;
        }
        /**
         * Callback after session is cleaned up, no matter if the call was successfully established or not.
         * First param is RtcSession object.
         * Second param is SessionReport object.
         */

    }, {
        key: 'onSessionDestroyed',
        set: function set(handler) {
            this._onSessionDestroyed = handler;
        }
    }, {
        key: 'enableAudio',
        set: function set(flag) {
            this._enableAudio = flag;
        }
    }, {
        key: 'echoCancellation',
        set: function set(flag) {
            this._echoCancellation = flag;
        }
    }, {
        key: 'enableVideo',
        set: function set(flag) {
            this._enableVideo = flag;
        }
    }, {
        key: 'maxVideoFrameRate',
        set: function set(frameRate) {
            this._maxVideoFrameRate = frameRate;
        }
    }, {
        key: 'minVideoFrameRate',
        set: function set(frameRate) {
            this._minVideoFrameRate = frameRate;
        }
    }, {
        key: 'videoFrameRate',
        set: function set(frameRate) {
            this._videoFrameRate = frameRate;
        }
    }, {
        key: 'maxVideoWidth',
        set: function set(width) {
            this._maxVideoWidth = width;
        }
    }, {
        key: 'minVideoWidth',
        set: function set(width) {
            this._minVideoWidth = width;
        }
    }, {
        key: 'idealVideoWidth',
        set: function set(width) {
            this._idealVideoWidth = width;
        }
    }, {
        key: 'maxVideoHeight',
        set: function set(height) {
            this._maxVideoHeight = height;
        }
    }, {
        key: 'minVideoHeight',
        set: function set(height) {
            this._minVideoHeight = height;
        }
    }, {
        key: 'idealVideoHeight',
        set: function set(height) {
            this._idealVideoHeight = height;
        }
    }, {
        key: 'facingMode',
        set: function set(mode) {
            this._facingMode = mode;
        }
    }, {
        key: 'remoteAudioElement',
        set: function set(element) {
            this._remoteAudioElement = element;
        }
    }, {
        key: 'remoteVideoElement',
        set: function set(element) {
            this._remoteVideoElement = element;
        }
        /**
         * Override the default signaling connect time out.
         */

    }, {
        key: 'signalingConnectTimeout',
        set: function set(ms) {
            this._signalingConnectTimeout = ms;
        }
        /**
         * Override the default ICE collection time limit.
         */

    }, {
        key: 'iceTimeoutMillis',
        set: function set(timeoutMillis) {
            this._iceTimeoutMillis = timeoutMillis;
        }

        /**
         * Override the default GUM timeout time limit.
         */

    }, {
        key: 'gumTimeoutMillis',
        set: function set(timeoutMillis) {
            this._gumTimeoutMillis = timeoutMillis;
        }

        /**
         * connect-rtc-js initiate the handshaking with all browser supported codec by default, Amazon Connect service will choose the codec according to its preference setting.
         * Setting this attribute will force connect-rtc-js to only use specified codec.
         * WARNING: Setting this to unsupported codec will cause the failure of handshaking.
         * Supported audio codecs: opus.
         */

    }, {
        key: 'forceAudioCodec',
        set: function set(audioCodec) {
            this._forceAudioCodec = audioCodec;
        }

        /**
         * connect-rtc-js initiate the handshaking with all browser supported codec by default, Amazon Connect service will choose the codec according to its preference setting.
         * Setting this attribute will force connect-rtc-js to only use specified codec.
         * WARNING: Setting this to unsupported codec will cause the failure of handshaking.
         * Supported video codecs: VP8, VP9, H264.
         */

    }, {
        key: 'forceVideoCodec',
        set: function set(videoCodec) {
            this._forceVideoCodec = videoCodec;
        }

        /**
         * connect-rtc-js disables OPUS DTX by default because it harms audio quality.
         * @param flag boolean
         */

    }, {
        key: 'enableOpusDtx',
        set: function set(flag) {
            this._enableOpusDtx = flag;
        }
    }]);
    return RtcSession;
}();

exports.default = RtcSession;

},{"./exceptions":130,"./rtc_const":131,"./rtp-stats":133,"./session_report":134,"./signaling":135,"./utils":136,"babel-runtime/helpers/asyncToGenerator":9,"babel-runtime/helpers/classCallCheck":10,"babel-runtime/helpers/createClass":11,"babel-runtime/helpers/get":12,"babel-runtime/helpers/inherits":13,"babel-runtime/helpers/possibleConstructorReturn":14,"babel-runtime/helpers/typeof":15,"babel-runtime/regenerator":16,"sdp":116,"uuid/v4":119}],133:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.extractMediaStatsFromStats = extractMediaStatsFromStats;

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extractMediaStatsFromStats(timestamp, stats, streamType) {
    var extractedStats = null;

    for (var key in stats) {
        var statsReport = stats[key];
        if (statsReport) {
            if (statsReport.type === 'ssrc') {
                //chrome, opera case. chrome reports stats for all streams, not just the stream passed in.
                if ((0, _utils.is_defined)(statsReport.packetsSent) && statsReport.mediaType == 'audio' && streamType === 'audio_input') {
                    extractedStats = {
                        timestamp: timestamp,
                        packetsCount: statsReport.packetsSent,
                        bytesSent: statsReport.bytesSent,
                        audioLevel: (0, _utils.when_defined)(statsReport.audioInputLevel),
                        packetsLost: (0, _utils.is_defined)(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        procMilliseconds: (0, _utils.is_defined)(statsReport.googCurrentDelayMs),
                        rttMilliseconds: (0, _utils.when_defined)(statsReport.googRtt)
                    };
                } else if ((0, _utils.is_defined)(statsReport.packetsReceived) && statsReport.mediaType == 'audio' && streamType === 'audio_output') {
                    extractedStats = {
                        timestamp: timestamp,
                        packetsCount: statsReport.packetsReceived,
                        bytesReceived: statsReport.bytesReceived,
                        audioLevel: (0, _utils.when_defined)(statsReport.audioOutputLevel),
                        packetsLost: (0, _utils.is_defined)(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        procMilliseconds: (0, _utils.is_defined)(statsReport.googCurrentDelayMs),
                        jbMilliseconds: (0, _utils.when_defined)(statsReport.googJitterBufferMs)
                    };
                } else if ((0, _utils.is_defined)(statsReport.packetsSent) && statsReport.mediaType == 'video' && streamType === 'video_input') {
                    extractedStats = {
                        timestamp: timestamp,
                        packetsCount: statsReport.packetsSent,
                        bytesSent: statsReport.bytesSent,
                        packetsLost: (0, _utils.is_defined)(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        rttMilliseconds: (0, _utils.when_defined)(statsReport.googRtt),
                        procMilliseconds: (0, _utils.is_defined)(statsReport.googCurrentDelayMs),
                        frameRateSent: (0, _utils.when_defined)(statsReport.googFrameRateSent)
                    };
                } else if (typeof statsReport.packetsReceived !== 'undefined' && statsReport.mediaType == 'video' && streamType === 'video_output') {
                    extractedStats = {
                        timestamp: timestamp,
                        packetsCount: statsReport.packetsSent,
                        bytesReceived: statsReport.bytesReceived,
                        packetsLost: (0, _utils.is_defined)(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        frameRateReceived: (0, _utils.when_defined)(statsReport.googFrameRateReceived),
                        procMilliseconds: (0, _utils.is_defined)(statsReport.googCurrentDelayMs),
                        jbMilliseconds: (0, _utils.when_defined)(statsReport.googJitterBufferMs)
                    };
                }
            } else if (statsReport.type === 'inboundrtp') {
                // Firefox case. Firefox reports packetsLost parameter only in inboundrtp type, and doesn't report in outboundrtp type.
                // So we only pull from inboundrtp. Firefox reports only stats for the stream passed in.
                if ((0, _utils.is_defined)(statsReport.packetsLost) && (0, _utils.is_defined)(statsReport.packetsReceived)) {
                    extractedStats = {
                        packetsLost: statsReport.packetsLost,
                        packetsCount: statsReport.packetsReceived,
                        audioLevel: (0, _utils.when_defined)(statsReport.audioInputLevel),
                        rttMilliseconds: streamType === 'audio_ouptut' || streamType === 'video_output' ? (0, _utils.when_defined)(statsReport.roundTripTime) : null,
                        jbMilliseconds: streamType === 'audio_output' || streamType === 'video_output' ? (0, _utils.when_defined)(statsReport.jitter, 0) * 1000 : null
                    };
                }
            }
        }
    }

    return extractedStats ? new MediaRtpStats(extractedStats, statsReport.type, streamType) : null;
}

/**
* Basic RTP statistics object, represents statistics of an audio or video stream.
*/
/**
* Extract rtp stats of specified stream from RTCStatsReport
* Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
* StreamType is passed only to pull right stream stats audio_input or audio_output.
*/

var MediaRtpStats = function () {
    function MediaRtpStats(paramsIn, statsReportType, streamType) {
        (0, _classCallCheck3.default)(this, MediaRtpStats);

        var params = paramsIn || {};

        this._timestamp = params.timestamp || new Date().getTime();
        this._packetsLost = (0, _utils.when_defined)(params.packetsLost);
        this._packetsCount = (0, _utils.when_defined)(params.packetsCount);
        this._audioLevel = (0, _utils.when_defined)(params.audioLevel);
        this._rttMilliseconds = (0, _utils.when_defined)(params.rttMilliseconds);
        this._jbMilliseconds = (0, _utils.when_defined)(params.jbMilliseconds);
        this._bytesSent = (0, _utils.when_defined)(params.bytesSent);
        this._bytesReceived = (0, _utils.when_defined)(params.bytesReceived);
        this._framesEncoded = (0, _utils.when_defined)(params.framesEncoded);
        this._framesDecoded = (0, _utils.when_defined)(params.framesDecoded);
        this._frameRateSent = (0, _utils.when_defined)(params.frameRateSent);
        this._frameRateReceived = (0, _utils.when_defined)(params.frameRateReceived);
        this._statsReportType = statsReportType || params._statsReportType || "unknown";
        this._streamType = streamType || params.streamType || "unknown";
    }

    /** {number} number of packets sent to the channel */


    (0, _createClass3.default)(MediaRtpStats, [{
        key: 'packetsCount',
        get: function get() {
            return this._packetsCount;
        }
        /** {number} number of packets lost after travelling through the channel */

    }, {
        key: 'packetsLost',
        get: function get() {
            return this._packetsLost;
        }
        /** {number} number of packets lost after travelling through the channel */

    }, {
        key: 'packetLossPercentage',
        get: function get() {
            return this._packetsCount > 0 ? this._packetsLost / this._packetsCount : 0;
        }
        /** Audio volume level
        * Currently firefox doesn't provide audio level in rtp stats.
        */

    }, {
        key: 'audioLevel',
        get: function get() {
            return this._audioLevel;
        }
        /** Timestamp when stats are collected. */

    }, {
        key: 'timestamp',
        get: function get() {
            return this._timestamp;
        }
        /** {number} Round trip time calculated with RTCP reports */

    }, {
        key: 'rttMilliseconds',
        get: function get() {
            return this._rttMilliseconds;
        }
        /** {number} Browser/client side jitter buffer length */

    }, {
        key: 'jbMilliseconds',
        get: function get() {
            return this._jbMilliseconds;
        }
        /** {number} number of bytes sent to the channel*/

    }, {
        key: 'bytesSent',
        get: function get() {
            return this._bytesSent;
        }
        /** {number} number of bytes received from the channel*/

    }, {
        key: 'bytesReceived',
        get: function get() {
            return this._bytesReceived;
        }
        /** {number} number of video frames encoded*/

    }, {
        key: 'framesEncoded',
        get: function get() {
            return this._framesEncoded;
        }
        /** {number} number of video frames decoded*/

    }, {
        key: 'framesDecoded',
        get: function get() {
            return this._framesDecoded;
        }
        /** {number} frames per second sent to the channel*/

    }, {
        key: 'frameRateSent',
        get: function get() {
            return this._frameRateSent;
        }
        /** {number} frames per second received from the channel*/

    }, {
        key: 'frameRateReceived',
        get: function get() {
            return this._frameRateReceived;
        }
        /** {string} the type of the stats report */

    }, {
        key: 'statsReportType',
        get: function get() {
            return this._statsReportType;
        }
        /** {string} the type of the stream */

    }, {
        key: 'streamType',
        get: function get() {
            return this._streamType;
        }
    }]);
    return MediaRtpStats;
}();

},{"./utils":136,"babel-runtime/helpers/classCallCheck":10,"babel-runtime/helpers/createClass":11}],134:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SessionReport = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

var SessionReport = exports.SessionReport = function () {
    /**
     * @class Prototype for tracking various RTC session report
     * @constructs
     */
    function SessionReport() {
        (0, _classCallCheck3.default)(this, SessionReport);

        this._sessionStartTime = null;
        this._sessionEndTime = null;
        this._gumTimeMillis = null;
        this._initializationTimeMillis = null;
        this._iceCollectionTimeMillis = null;
        this._signallingConnectTimeMillis = null;
        this._handshakingTimeMillis = null;
        this._preTalkingTimeMillis = null;
        this._talkingTimeMillis = null;
        this._iceConnectionsLost = 0;
        this._cleanupTimeMillis = null;
        this._iceCollectionFailure = null;
        this._signallingConnectionFailure = null;
        this._handshakingFailure = null;
        this._gumOtherFailure = null;
        this._gumTimeoutFailure = null;
        this._createOfferFailure = null;
        this._setLocalDescriptionFailure = null;
        this._userBusyFailure = null;
        this._invalidRemoteSDPFailure = null;
        this._noRemoteIceCandidateFailure = null;
        this._setRemoteDescriptionFailure = null;
        this._streamStats = [];
    }
    /**
     *Timestamp when RTCSession started.
     */


    (0, _createClass3.default)(SessionReport, [{
        key: "sessionStartTime",
        get: function get() {
            return this._sessionStartTime;
        }
        /**
         * Timestamp when RTCSession ended.
         */
        ,
        set: function set(value) {
            this._sessionStartTime = value;
        }
    }, {
        key: "sessionEndTime",
        get: function get() {
            return this._sessionEndTime;
        }
        /**
         * Time taken for grabbing user microphone at the time of connecting RTCSession.
         */
        ,
        set: function set(value) {
            this._sessionEndTime = value;
        }
    }, {
        key: "gumTimeMillis",
        get: function get() {
            return this._gumTimeMillis;
        }
        /**
         * Time taken for session initialization in millis. Includes time spent in GrabLocalMedia, SetLocalSDP states.
         */
        ,
        set: function set(value) {
            this._gumTimeMillis = value;
        }
    }, {
        key: "initializationTimeMillis",
        get: function get() {
            return this._initializationTimeMillis;
        }
        /**
         * Time spent on ICECollection in millis.
         */
        ,
        set: function set(value) {
            this._initializationTimeMillis = value;
        }
    }, {
        key: "iceCollectionTimeMillis",
        get: function get() {
            return this._iceCollectionTimeMillis;
        }
        /**
         * Time taken for connecting the signalling in millis.
         */
        ,
        set: function set(value) {
            this._iceCollectionTimeMillis = value;
        }
    }, {
        key: "signallingConnectTimeMillis",
        get: function get() {
            return this._signallingConnectTimeMillis;
        }
        /**
         * Times spent from RTCSession connection until entering Talking state in millis.
         */
        ,
        set: function set(value) {
            this._signallingConnectTimeMillis = value;
        }
    }, {
        key: "preTalkingTimeMillis",
        get: function get() {
            return this._preTalkingTimeMillis;
        }
        /**
         *  Times spent in completing handshaking process of the RTCSession in millis.
         */
        ,
        set: function set(value) {
            this._preTalkingTimeMillis = value;
        }
    }, {
        key: "handshakingTimeMillis",
        get: function get() {
            return this._handshakingTimeMillis;
        }
        /**
         *  Times spent in Talking state in millis.
         */
        ,
        set: function set(value) {
            this._handshakingTimeMillis = value;
        }
    }, {
        key: "talkingTimeMillis",
        get: function get() {
            return this._talkingTimeMillis;
        }
        /**
         * How many times the RTCSession has lost ICE connection in talking state.
         */
        ,
        set: function set(value) {
            this._talkingTimeMillis = value;
        }
    }, {
        key: "iceConnectionsLost",
        get: function get() {
            return this._iceConnectionsLost;
        }
        /**
         * Times spent in Cleanup state in millis
         */
        ,
        set: function set(value) {
            this._iceConnectionsLost = value;
        }
    }, {
        key: "cleanupTimeMillis",
        get: function get() {
            return this._cleanupTimeMillis;
        }
        /**
         * Tells if the RTCSession fails in ICECollection.
         */
        ,
        set: function set(value) {
            this._cleanupTimeMillis = value;
        }
    }, {
        key: "iceCollectionFailure",
        get: function get() {
            return this._iceCollectionFailure;
        }
        /**
         * Tells if the RTCSession failed in signalling connect stage.
         */
        ,
        set: function set(value) {
            this._iceCollectionFailure = value;
        }
    }, {
        key: "signallingConnectionFailure",
        get: function get() {
            return this._signallingConnectionFailure;
        }
        /**
         * Handshaking failure of the RTCSession
         */
        ,
        set: function set(value) {
            this._signallingConnectionFailure = value;
        }
    }, {
        key: "handshakingFailure",
        get: function get() {
            return this._handshakingFailure;
        }
        /**
         * Gum failed due to timeout at the time of new RTCSession connection
         */
        ,
        set: function set(value) {
            this._handshakingFailure = value;
        }
    }, {
        key: "gumTimeoutFailure",
        get: function get() {
            return this._gumTimeoutFailure;
        }
        /**
         * Gum failed due to other reasons (other than Timeout)
         */
        ,
        set: function set(value) {
            this._gumTimeoutFailure = value;
        }
    }, {
        key: "gumOtherFailure",
        get: function get() {
            return this._gumOtherFailure;
        }
        /**
         * RTC Session failed in create Offer state.
         */
        ,
        set: function set(value) {
            this._gumOtherFailure = value;
        }
    }, {
        key: "createOfferFailure",
        get: function get() {
            return this._createOfferFailure;
        }
        /**
         * Tells if setLocalDescription failed for the RTC Session.
         */
        ,
        set: function set(value) {
            this._createOfferFailure = value;
        }
    }, {
        key: "setLocalDescriptionFailure",
        get: function get() {
            return this._setLocalDescriptionFailure;
        }
        /**
         * Tells if handshaking failed due to user busy case,
         * happens when multiple softphone calls are initiated at same time.
         */
        ,
        set: function set(value) {
            this._setLocalDescriptionFailure = value;
        }
    }, {
        key: "userBusyFailure",
        get: function get() {
            return this._userBusyFailure;
        }
        /**
         * Tells it remote SDP is invalid.
         */
        ,
        set: function set(value) {
            this._userBusyFailure = value;
        }
    }, {
        key: "invalidRemoteSDPFailure",
        get: function get() {
            return this._invalidRemoteSDPFailure;
        }
        /**
         * Tells if the setRemoteDescription failed for the RTC Session.
         */
        ,
        set: function set(value) {
            this._invalidRemoteSDPFailure = value;
        }
    }, {
        key: "setRemoteDescriptionFailure",
        get: function get() {
            return this._setRemoteDescriptionFailure;
        }
        /**
         * A failure case when there is no RemoteIceCandidate.
         */
        ,
        set: function set(value) {
            this._setRemoteDescriptionFailure = value;
        }
    }, {
        key: "noRemoteIceCandidateFailure",
        get: function get() {
            return this._noRemoteIceCandidateFailure;
        }
        /**
         * Statistics for each stream(audio-in, audio-out, video-in, video-out) of the RTCSession.
         */
        ,
        set: function set(value) {
            this._noRemoteIceCandidateFailure = value;
        }
    }, {
        key: "streamStats",
        get: function get() {
            return this._streamStats;
        },
        set: function set(value) {
            this._streamStats = value;
        }
    }]);
    return SessionReport;
}();

},{"babel-runtime/helpers/classCallCheck":10,"babel-runtime/helpers/createClass":11}],135:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FailedState = exports.DisconnectedState = exports.PendingLocalHangupState = exports.PendingRemoteHangupState = exports.PendingReconnectState = exports.TalkingState = exports.PendingAcceptAckState = exports.PendingAcceptState = exports.PendingAnswerState = exports.PendingInviteState = exports.PendingConnectState = exports.FailOnTimeoutState = exports.SignalingState = undefined;

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

var _rtc_const = require('./rtc_const');

var _exceptions = require('./exceptions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reqIdSeq = 1; /**
                   * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
                   *
                   * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
                   *
                   *   http://aws.amazon.com/asl/
                   *
                   * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
                   */

var CONNECT_MAX_RETRIES = 3;

/**
 * Abstract signaling state class.
 */

var SignalingState = exports.SignalingState = function () {
    /**
     * @param {AmznRtcSignaling} signaling Signaling object.
     */
    function SignalingState(signaling) {
        (0, _classCallCheck3.default)(this, SignalingState);

        this._signaling = signaling;
        this._createTime = new Date().getTime();
    }

    (0, _createClass3.default)(SignalingState, [{
        key: 'setStateTimeout',
        value: function setStateTimeout(timeoutMs) {
            setTimeout((0, _utils.hitch)(this, this._onTimeoutChecked), timeoutMs);
        }
    }, {
        key: 'onEnter',
        value: function onEnter() {}
    }, {
        key: '_onTimeoutChecked',
        value: function _onTimeoutChecked() {
            if (this.isCurrentState) {
                this.onTimeout();
            }
        }
    }, {
        key: 'onTimeout',
        value: function onTimeout() {
            throw new _exceptions.UnsupportedOperation();
        }
    }, {
        key: 'transit',
        value: function transit(newState) {
            this._signaling.transit(newState);
        }
    }, {
        key: 'onExit',
        value: function onExit() {}
    }, {
        key: 'onOpen',
        value: function onOpen() {
            throw new _exceptions.UnsupportedOperation('onOpen not supported by ' + this.name);
        }
    }, {
        key: 'onError',
        value: function onError() {
            this.channelDown();
        }
    }, {
        key: 'onClose',
        value: function onClose() {
            this.channelDown();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            throw new _exceptions.UnsupportedOperation('channelDown not supported by ' + this.name);
        }
    }, {
        key: 'onRpcMsg',
        value: function onRpcMsg(rpcMsg) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('onRpcMsg not supported by ' + this.name);
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('invite not supported by ' + this.name);
        }
    }, {
        key: 'accept',
        value: function accept() {
            throw new _exceptions.UnsupportedOperation('accept not supported by ' + this.name);
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            throw new _exceptions.UnsupportedOperation('hangup not supported by ' + this.name);
        }
    }, {
        key: 'isCurrentState',
        get: function get() {
            return this === this._signaling.state;
        }
    }, {
        key: 'name',
        get: function get() {
            return "SignalingState";
        }
    }, {
        key: 'logger',
        get: function get() {
            return this._signaling._logger;
        }
    }]);
    return SignalingState;
}();

var FailOnTimeoutState = exports.FailOnTimeoutState = function (_SignalingState) {
    (0, _inherits3.default)(FailOnTimeoutState, _SignalingState);

    function FailOnTimeoutState(signaling, timeoutMs) {
        (0, _classCallCheck3.default)(this, FailOnTimeoutState);

        var _this = (0, _possibleConstructorReturn3.default)(this, (FailOnTimeoutState.__proto__ || Object.getPrototypeOf(FailOnTimeoutState)).call(this, signaling));

        _this._timeoutMs = timeoutMs;
        return _this;
    }

    (0, _createClass3.default)(FailOnTimeoutState, [{
        key: 'onEnter',
        value: function onEnter() {
            this.setStateTimeout(this._timeoutMs);
        }
    }, {
        key: 'onTimeout',
        value: function onTimeout() {
            this.transit(new FailedState(this._signaling, new _exceptions.Timeout()));
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailOnTimeoutState";
        }
    }]);
    return FailOnTimeoutState;
}(SignalingState);

var PendingConnectState = exports.PendingConnectState = function (_FailOnTimeoutState) {
    (0, _inherits3.default)(PendingConnectState, _FailOnTimeoutState);

    function PendingConnectState(signaling, timeoutMs, initialStartTimeIn, retriesIn) {
        (0, _classCallCheck3.default)(this, PendingConnectState);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (PendingConnectState.__proto__ || Object.getPrototypeOf(PendingConnectState)).call(this, signaling, timeoutMs));

        _this2._initialStartTime = initialStartTimeIn || new Date().getTime();
        _this2._retries = retriesIn || 0;
        return _this2;
    }

    (0, _createClass3.default)(PendingConnectState, [{
        key: 'onOpen',
        value: function onOpen() {
            this.transit(new PendingInviteState(this._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            var now = new Date().getTime();
            var untilTimeoutMs = this._initialStartTime + this._timeoutMs - now;
            if (untilTimeoutMs > 0 && ++this._retries < CONNECT_MAX_RETRIES) {
                this._signaling._connect();
                this.transit(new PendingConnectState(this._signaling, untilTimeoutMs, this._initialStartTime, this._retries));
            } else {
                this.transit(new FailedState(this._signaling, new Error('channelDown')));
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingConnectState";
        }
    }]);
    return PendingConnectState;
}(FailOnTimeoutState);

var PendingInviteState = exports.PendingInviteState = function (_SignalingState2) {
    (0, _inherits3.default)(PendingInviteState, _SignalingState2);

    function PendingInviteState() {
        (0, _classCallCheck3.default)(this, PendingInviteState);
        return (0, _possibleConstructorReturn3.default)(this, (PendingInviteState.__proto__ || Object.getPrototypeOf(PendingInviteState)).apply(this, arguments));
    }

    (0, _createClass3.default)(PendingInviteState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyConnected(resolve) {
                self._signaling._connectedHandler();
                resolve();
            });
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            var self = this;
            var inviteId = reqIdSeq++;

            var inviteParams = {
                sdp: sdp,
                candidates: iceCandidates
            };
            self.logger.log('Sending SDP', sdp);
            self._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                method: 'invite',
                params: inviteParams,
                id: inviteId
            }));
            self.transit(new PendingAnswerState(self._signaling, inviteId));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingInviteState";
        }
    }]);
    return PendingInviteState;
}(SignalingState);

var PendingAnswerState = exports.PendingAnswerState = function (_FailOnTimeoutState2) {
    (0, _inherits3.default)(PendingAnswerState, _FailOnTimeoutState2);

    function PendingAnswerState(signaling, inviteId) {
        (0, _classCallCheck3.default)(this, PendingAnswerState);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, (PendingAnswerState.__proto__ || Object.getPrototypeOf(PendingAnswerState)).call(this, signaling, _rtc_const.MAX_INVITE_DELAY_MS));

        _this4._inviteId = inviteId;
        return _this4;
    }

    (0, _createClass3.default)(PendingAnswerState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            var self = this;
            if (msg.id === this._inviteId) {
                if (msg.error || !msg.result) {
                    this.transit(new FailedState(this._signaling, self.translateInviteError(msg)));
                } else {
                    new Promise(function notifyAnswered(resolve) {
                        self.logger.log('Received SDP', msg.result.sdp);
                        self._signaling._answeredHandler(msg.result.sdp, msg.result.candidates);
                        resolve();
                    });
                    this.transit(new PendingAcceptState(this._signaling, this._signaling._autoAnswer));
                }
            }
        }
    }, {
        key: 'translateInviteError',
        value: function translateInviteError(msg) {
            if (msg.error && msg.error.code == 486) {
                return new _exceptions.BusyException(msg.error.message);
            } else if (msg.error && msg.error.code == 404) {
                return new _exceptions.CallNotFoundException(msg.error.message);
            } else {
                return new _exceptions.UnknownSignalingError();
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingAnswerState";
        }
    }]);
    return PendingAnswerState;
}(FailOnTimeoutState);

var PendingAcceptState = exports.PendingAcceptState = function (_SignalingState3) {
    (0, _inherits3.default)(PendingAcceptState, _SignalingState3);

    function PendingAcceptState(signaling, autoAnswer) {
        (0, _classCallCheck3.default)(this, PendingAcceptState);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, (PendingAcceptState.__proto__ || Object.getPrototypeOf(PendingAcceptState)).call(this, signaling));

        _this5._autoAnswer = autoAnswer;
        return _this5;
    }

    (0, _createClass3.default)(PendingAcceptState, [{
        key: 'onEnter',
        value: function onEnter() {
            if (this._autoAnswer) {
                this.accept();
            }
        }
    }, {
        key: 'accept',
        value: function accept() {
            var acceptId = reqIdSeq++;
            this._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                method: 'accept',
                params: {},
                id: acceptId
            }));
            this.transit(new PendingAcceptAckState(this._signaling, acceptId));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingAcceptState";
        }
    }]);
    return PendingAcceptState;
}(SignalingState);

var PendingAcceptAckState = exports.PendingAcceptAckState = function (_FailOnTimeoutState3) {
    (0, _inherits3.default)(PendingAcceptAckState, _FailOnTimeoutState3);

    function PendingAcceptAckState(signaling, acceptId) {
        (0, _classCallCheck3.default)(this, PendingAcceptAckState);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (PendingAcceptAckState.__proto__ || Object.getPrototypeOf(PendingAcceptAckState)).call(this, signaling, _rtc_const.MAX_ACCEPT_BYE_DELAY_MS));

        _this6._acceptId = acceptId;
        return _this6;
    }

    (0, _createClass3.default)(PendingAcceptAckState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.id === this._acceptId) {
                if (msg.error) {
                    this.transit(new FailedState(this._signaling));
                } else {
                    this._signaling._clientToken = msg.result.clientToken;
                    this.transit(new TalkingState(this._signaling));
                }
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingAcceptAckState";
        }
    }]);
    return PendingAcceptAckState;
}(FailOnTimeoutState);

var TalkingState = exports.TalkingState = function (_SignalingState4) {
    (0, _inherits3.default)(TalkingState, _SignalingState4);

    function TalkingState() {
        (0, _classCallCheck3.default)(this, TalkingState);
        return (0, _possibleConstructorReturn3.default)(this, (TalkingState.__proto__ || Object.getPrototypeOf(TalkingState)).apply(this, arguments));
    }

    (0, _createClass3.default)(TalkingState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyHandshaked(resolve) {
                self._signaling._handshakedHandler();
                resolve();
            });
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            var byeId = reqIdSeq++;
            this._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                method: 'bye',
                params: {},
                id: byeId
            }));
            this.transit(new PendingRemoteHangupState(this._signaling, byeId));
        }
    }, {
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.method === 'bye') {
                this.transit(new PendingLocalHangupState(this._signaling, msg.id));
            } else if (msg.method === 'renewClientToken') {
                this._signaling._clientToken = msg.params.clientToken;
            }
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this._signaling._reconnect();
            this._signaling.transit(new PendingReconnectState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "TalkingState";
        }
    }]);
    return TalkingState;
}(SignalingState);

var PendingReconnectState = exports.PendingReconnectState = function (_FailOnTimeoutState4) {
    (0, _inherits3.default)(PendingReconnectState, _FailOnTimeoutState4);

    function PendingReconnectState(signaling) {
        (0, _classCallCheck3.default)(this, PendingReconnectState);
        return (0, _possibleConstructorReturn3.default)(this, (PendingReconnectState.__proto__ || Object.getPrototypeOf(PendingReconnectState)).call(this, signaling, _rtc_const.DEFAULT_CONNECT_TIMEOUT_MS));
    }

    (0, _createClass3.default)(PendingReconnectState, [{
        key: 'onOpen',
        value: function onOpen() {
            this.transit(new TalkingState(this._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingReconnectState";
        }
    }]);
    return PendingReconnectState;
}(FailOnTimeoutState);

var PendingRemoteHangupState = exports.PendingRemoteHangupState = function (_FailOnTimeoutState5) {
    (0, _inherits3.default)(PendingRemoteHangupState, _FailOnTimeoutState5);

    function PendingRemoteHangupState(signaling, byeId) {
        (0, _classCallCheck3.default)(this, PendingRemoteHangupState);

        var _this9 = (0, _possibleConstructorReturn3.default)(this, (PendingRemoteHangupState.__proto__ || Object.getPrototypeOf(PendingRemoteHangupState)).call(this, signaling, _rtc_const.MAX_ACCEPT_BYE_DELAY_MS));

        _this9._byeId = byeId;
        return _this9;
    }

    (0, _createClass3.default)(PendingRemoteHangupState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.id === this._byeId) {
                this.transit(new DisconnectedState(this._signaling));
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingRemoteHangupState";
        }
    }]);
    return PendingRemoteHangupState;
}(FailOnTimeoutState);

var PendingLocalHangupState = exports.PendingLocalHangupState = function (_SignalingState5) {
    (0, _inherits3.default)(PendingLocalHangupState, _SignalingState5);

    function PendingLocalHangupState(signaling, byeId) {
        (0, _classCallCheck3.default)(this, PendingLocalHangupState);

        var _this10 = (0, _possibleConstructorReturn3.default)(this, (PendingLocalHangupState.__proto__ || Object.getPrototypeOf(PendingLocalHangupState)).call(this, signaling));

        _this10._byeId = byeId;
        return _this10;
    }

    (0, _createClass3.default)(PendingLocalHangupState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyRemoteHungup(resolve) {
                self._signaling._remoteHungupHandler();
                resolve();
            });
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            var self = this;
            self._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                result: {},
                id: self._byeId
            }));
            self.transit(new DisconnectedState(self._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new DisconnectedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingLocalHangupState";
        }
    }]);
    return PendingLocalHangupState;
}(SignalingState);

var DisconnectedState = exports.DisconnectedState = function (_SignalingState6) {
    (0, _inherits3.default)(DisconnectedState, _SignalingState6);

    function DisconnectedState() {
        (0, _classCallCheck3.default)(this, DisconnectedState);
        return (0, _possibleConstructorReturn3.default)(this, (DisconnectedState.__proto__ || Object.getPrototypeOf(DisconnectedState)).apply(this, arguments));
    }

    (0, _createClass3.default)(DisconnectedState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyDisconnected(resolve) {
                self._signaling._disconnectedHandler();
                resolve();
            });
            this._signaling._wss.close();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            //Do nothing
        }
    }, {
        key: 'name',
        get: function get() {
            return "DisconnectedState";
        }
    }]);
    return DisconnectedState;
}(SignalingState);

var FailedState = exports.FailedState = function (_SignalingState7) {
    (0, _inherits3.default)(FailedState, _SignalingState7);

    function FailedState(signaling, exception) {
        (0, _classCallCheck3.default)(this, FailedState);

        var _this12 = (0, _possibleConstructorReturn3.default)(this, (FailedState.__proto__ || Object.getPrototypeOf(FailedState)).call(this, signaling));

        _this12._exception = exception;
        return _this12;
    }

    (0, _createClass3.default)(FailedState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyFailed(resolve) {
                self._signaling._failedHandler(self._exception);
                resolve();
            });
            this._signaling._wss.close();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            //Do nothing
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailedState";
        }
    }, {
        key: 'exception',
        get: function get() {
            return this._exception;
        }
    }]);
    return FailedState;
}(SignalingState);

var AmznRtcSignaling = function () {
    function AmznRtcSignaling(callId, signalingUri, contactToken, logger, connectTimeoutMs) {
        (0, _classCallCheck3.default)(this, AmznRtcSignaling);

        this._callId = callId;
        this._connectTimeoutMs = connectTimeoutMs || _rtc_const.DEFAULT_CONNECT_TIMEOUT_MS;
        this._autoAnswer = true;
        this._signalingUri = signalingUri;
        this._contactToken = contactToken;
        this._logger = (0, _utils.wrapLogger)(logger, callId, 'SIGNALING');

        //empty event handlers
        this._connectedHandler = this._answeredHandler = this._handshakedHandler = this._reconnectedHandler = this._remoteHungupHandler = this._disconnectedHandler = this._failedHandler = function noOp() {};
    }

    (0, _createClass3.default)(AmznRtcSignaling, [{
        key: 'connect',
        value: function connect() {
            this._connect();
            this.transit(new PendingConnectState(this, this._connectTimeoutMs));
        }
    }, {
        key: '_connect',
        value: function _connect() {
            this._wss = this._connectWebSocket(this._buildInviteUri());
        }
    }, {
        key: 'transit',
        value: function transit(nextState) {
            try {
                this._logger.info((this._state ? this._state.name : 'null') + ' => ' + nextState.name);
                if (this.state && this.state.onExit) {
                    this.state.onExit();
                }
            } finally {
                this._state = nextState;
                if (this._state.onEnter) {
                    this._state.onEnter();
                }
            }
        }
    }, {
        key: '_connectWebSocket',
        value: function _connectWebSocket(uri) {
            var wsConnection = new WebSocket(uri);
            wsConnection.onopen = (0, _utils.hitch)(this, this._onOpen);
            wsConnection.onmessage = (0, _utils.hitch)(this, this._onMessage);
            wsConnection.onerror = (0, _utils.hitch)(this, this._onError);
            wsConnection.onclose = (0, _utils.hitch)(this, this._onClose);
            return wsConnection;
        }
    }, {
        key: '_buildInviteUri',
        value: function _buildInviteUri() {
            if (this._contactToken) {
                return this._buildUriBase() + '&contactCtx=' + encodeURIComponent(this._contactToken);
            } else {
                return this._buildUriBase();
            }
        }
    }, {
        key: '_buildReconnectUri',
        value: function _buildReconnectUri() {
            return this._buildUriBase() + '&clientToken=' + encodeURIComponent(this._clientToken);
        }
    }, {
        key: '_buildUriBase',
        value: function _buildUriBase() {
            var separator = '?';
            if (this._signalingUri.indexOf(separator) > -1) {
                separator = '&';
            }
            return this._signalingUri + separator + 'callId=' + encodeURIComponent(this._callId);
        }
    }, {
        key: '_onMessage',
        value: function _onMessage(evt) {
            this.state.onRpcMsg(JSON.parse(evt.data));
        }
    }, {
        key: '_onOpen',
        value: function _onOpen(evt) {
            this.state.onOpen(evt);
        }
    }, {
        key: '_onError',
        value: function _onError(evt) {
            this.state.onError(evt);
        }
    }, {
        key: '_onClose',
        value: function _onClose(evt) {
            this._logger.log('WebSocket onclose code=' + evt.code + ', reason=' + evt.reason);
            this.state.onClose(evt);
        }
    }, {
        key: '_reconnect',
        value: function _reconnect() {
            this._wss = this._connectWebSocket(this._buildReconnectUri());
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            this.state.invite(sdp, iceCandidates);
        }
    }, {
        key: 'accept',
        value: function accept() {
            this.state.accept();
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this.state.hangup();
        }
    }, {
        key: 'callId',
        get: function get() {
            return this._callId;
        }
    }, {
        key: 'onConnected',
        set: function set(connectedHandler) {
            this._connectedHandler = connectedHandler;
        }
    }, {
        key: 'onAnswered',
        set: function set(answeredHandler) {
            this._answeredHandler = answeredHandler;
        }
    }, {
        key: 'onHandshaked',
        set: function set(handshakedHandler) {
            this._handshakedHandler = handshakedHandler;
        }
    }, {
        key: 'onReconnected',
        set: function set(reconnectedHandler) {
            this._reconnectedHandler = reconnectedHandler;
        }
    }, {
        key: 'onRemoteHungup',
        set: function set(remoteHungupHandler) {
            this._remoteHungupHandler = remoteHungupHandler;
        }
    }, {
        key: 'onDisconnected',
        set: function set(disconnectedHandler) {
            this._disconnectedHandler = disconnectedHandler;
        }
    }, {
        key: 'onFailed',
        set: function set(failedHandler) {
            this._failedHandler = failedHandler;
        }
    }, {
        key: 'state',
        get: function get() {
            return this._state;
        }
    }]);
    return AmznRtcSignaling;
}();

exports.default = AmznRtcSignaling;

},{"./exceptions":130,"./rtc_const":131,"./utils":136,"babel-runtime/helpers/classCallCheck":10,"babel-runtime/helpers/createClass":11,"babel-runtime/helpers/inherits":13,"babel-runtime/helpers/possibleConstructorReturn":14}],136:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SdpOptions = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.hitch = hitch;
exports.wrapLogger = wrapLogger;
exports.closeStream = closeStream;
exports.transformSdp = transformSdp;
exports.is_defined = is_defined;
exports.when_defined = when_defined;

var _exceptions = require('./exceptions');

var _sdp = require('sdp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * All logging methods used by connect-rtc.
 */
/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

var logMethods = ['log', 'info', 'warn', 'error'];

/**
* Binds the given instance object as the context for
* the method provided.
*
* @param scope The instance object to be set as the scope
*    of the function.
* @param method The method to be encapsulated.
*
* All other arguments, if any, are bound to the method
* invocation inside the closure.
*
* @return A closure encapsulating the invocation of the
*    method provided in context of the given instance.
*/
function hitch() {
    var args = Array.prototype.slice.call(arguments);
    var scope = args.shift();
    var method = args.shift();

    if (!scope) {
        throw new _exceptions.IllegalParameters('utils.hitch(): scope is required!');
    }

    if (!method) {
        throw new _exceptions.IllegalParameters('utils.hitch(): method is required!');
    }

    if (typeof method !== 'function') {
        throw new _exceptions.IllegalParameters('utils.hitch(): method is not a function!');
    }

    return function _hitchedFunction() {
        var closureArgs = Array.prototype.slice.call(arguments);
        return method.apply(scope, args.concat(closureArgs));
    };
}

function wrapLogger(logger, callId, logCategory) {
    var _logger = {};
    logMethods.forEach(function (logMethod) {
        if (!logger[logMethod]) {
            throw new Error('Logging method ' + logMethod + ' required');
        }
        _logger[logMethod] = hitch(logger, logger[logMethod], callId, logCategory);
    });
    return _logger;
}

function closeStream(stream) {
    if (stream) {
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            try {
                track.stop();
            } catch (e) {
                // eat exception
            }
        }
    }
}

/**
 * A parameter of transformSdp.
 * This defines all the SDP options connect-rtc-js supports.
 */

var SdpOptions = exports.SdpOptions = function () {
    function SdpOptions() {
        (0, _classCallCheck3.default)(this, SdpOptions);

        this._forceCodec = {};
    }

    (0, _createClass3.default)(SdpOptions, [{
        key: '_shouldDeleteCodec',


        /**
         * Test if given codec should be removed from SDP.
         * @param mediaType audio|video
         * @param codecName case insensitive
         * @return TRUE - should remove
         */
        value: function _shouldDeleteCodec(mediaType, codecName) {
            var upperCaseCodecName = codecName.toUpperCase();
            return this._forceCodec[mediaType] && upperCaseCodecName !== this._forceCodec[mediaType].toUpperCase() && upperCaseCodecName !== 'TELEPHONE-EVENT';
        }
    }, {
        key: 'enableOpusDtx',
        get: function get() {
            return this._enableOpusDtx;
        }

        /**
         * By default transformSdp disables dtx for OPUS codec.
         * Setting this to true would force it to turn on DTX.
         */
        ,
        set: function set(flag) {
            this._enableOpusDtx = flag;
        }

        /**
         * A map from media type (audio/video) to codec (case insensitive).
         * Add entry for force connect-rtc-js to use specified codec for certain media type.
         * For example: sdpOptions.forceCodec['audio'] = 'opus';
         */

    }, {
        key: 'forceCodec',
        get: function get() {
            return this._forceCodec;
        }
    }]);
    return SdpOptions;
}();

/**
 * Modifies input SDP according to sdpOptions.
 * See SdpOptions for available options.
 * @param sdp original SDP
 * @param sdpOptions defines changes to be applied to SDP
 * @returns a map with 'sdp' containing the transformed SDP and 'mLines' containing the number of m lines in SDP
 */


function transformSdp(sdp, sdpOptions) {
    var sections = (0, _sdp.splitSections)(sdp);
    for (var i = 1; i < sections.length; i++) {
        var mediaType = (0, _sdp.getKind)(sections[i]);
        var rtpParams = (0, _sdp.parseRtpParameters)(sections[i]);
        // a map from payload type (string) to codec object
        var codecMap = rtpParams.codecs.reduce(function (map, codec) {
            map['' + codec.payloadType] = codec;
            return map;
        }, {});
        sections[i] = (0, _sdp.splitLines)(sections[i]).map(function (line) {
            if (line.startsWith('m=')) {
                // modify m= line if SdpOptions#forceCodec specifies codec for current media type
                if (sdpOptions.forceCodec[mediaType]) {
                    var targetCodecPts = Object.keys(codecMap).filter(function (pt) {
                        return !sdpOptions._shouldDeleteCodec(mediaType, codecMap[pt].name);
                    });
                    return (/.*RTP\/S?AVPF? /.exec(line) + targetCodecPts.join(' ')
                    );
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtpmap:')) {
                var rtpMap = (0, _sdp.parseRtpMap)(line);
                var currentCodec = codecMap[rtpMap.payloadType];

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                // append a=fmtp line immediately if current codec is OPUS (to explicitly specify OPUS parameters)
                if (currentCodec.name.toUpperCase() === 'OPUS') {
                    currentCodec.parameters.usedtx = sdpOptions.enableOpusDtx ? 1 : 0;
                    // generate fmtp line immediately after rtpmap line, and remove original fmtp line once we see it
                    return (line + "\r\n" + (0, _sdp.writeFmtp)(currentCodec)).trim();
                } else {
                    return line;
                }
            } else if (line.startsWith('a=fmtp:')) {
                var pt = line.substring('a=fmtp:'.length, line.indexOf(' '));
                var currentCodec = codecMap[pt]; // eslint-disable-line no-redeclare

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                if (currentCodec.name.toUpperCase() === 'OPUS') {
                    // this is a line for OPUS, remove it because FMTP line is already generated when rtpmap line is processed
                    return null;
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtcp-fb:')) {
                var pt = line.substring(line.indexOf(':') + 1, line.indexOf(' ')); // eslint-disable-line no-redeclare
                var currentCodec = codecMap[pt]; // eslint-disable-line no-redeclare

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                } else {
                    return line;
                }
            } else {
                return line;
            }
        }).filter(function (line) {
            return line !== null;
        }).join('\r\n');
    }
    return {
        sdp: sections.map(function (section) {
            return section.trim();
        }).join('\r\n') + '\r\n',
        mLines: sections.length - 1 // first section is session description, the rest are media descriptions
    };
}

function is_defined(v) {
    return typeof v !== 'undefined';
}

function when_defined(v, alternativeIn) {
    var alternative = is_defined(alternativeIn) ? alternativeIn : null;
    return is_defined(v) ? v : alternative;
}

},{"./exceptions":130,"babel-runtime/helpers/classCallCheck":10,"babel-runtime/helpers/createClass":11,"sdp":116}]},{},[129])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2wvaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvZ2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbmhlcml0cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvcG9zc2libGVDb25zdHJ1Y3RvclJldHVybi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvcmVnZW5lcmF0b3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2EtZnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FkZC10by11bnNjb3BhYmxlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4taW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FuLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NsYXNzb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY3R4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kZWZpbmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZW51bS1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19leHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2ZhaWxzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2dsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGFzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19odG1sLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faW52b2tlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWNhbGwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1kZXRlY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItc3RlcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlcmF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19saWJyYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19tZXRhLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19taWNyb3Rhc2suanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX25ldy1wcm9taXNlLWNhcGFiaWxpdHkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BuLWV4dC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ3BvLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1waWUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1zYXAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3BlcmZvcm0uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb21pc2UtcmVzb2x2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUtYWxsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19yZWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LXByb3RvLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NoYXJlZC1rZXkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NoYXJlZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc3BlY2llcy1jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc3RyaW5nLWF0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190YXNrLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdWlkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL191c2VyLWFnZW50LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MtZXh0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcucHJvbWlzZS5maW5hbGx5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5wcm9taXNlLnRyeS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcuc3ltYm9sLmFzeW5jLWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zeW1ib2wub2JzZXJ2YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS1tb2R1bGUuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL3NkcC9zZHAuanMiLCJub2RlX21vZHVsZXMvdXVpZC9saWIvYnl0ZXNUb1V1aWQuanMiLCJub2RlX21vZHVsZXMvdXVpZC9saWIvcm5nLWJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXVpZC92NC5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvYWRhcHRlcl9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9jaHJvbWUvY2hyb21lX3NoaW0uanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2Nocm9tZS9nZXR1c2VybWVkaWEuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2VkZ2UvZWRnZV9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9lZGdlL2dldHVzZXJtZWRpYS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZmlyZWZveC9maXJlZm94X3NoaW0uanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZ2V0dXNlcm1lZGlhLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9zYWZhcmkvc2FmYXJpX3NoaW0uanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL3V0aWxzLmpzIiwic3JjL2pzL2Nvbm5lY3QtcnRjLmpzIiwic3JjL2pzL2V4Y2VwdGlvbnMuanMiLCJzcmMvanMvcnRjX2NvbnN0LmpzIiwic3JjL2pzL3J0Y19zZXNzaW9uLmpzIiwic3JjL2pzL3J0cC1zdGF0cy5qcyIsInNyYy9qcy9zZXNzaW9uX3JlcG9ydC5qcyIsInNyYy9qcy9zaWduYWxpbmcuanMiLCJzcmMvanMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZtQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUssU0FBUyxHQUFULENBQWE7QUFBQSxtQkFBVyxRQUFRLElBQVIsRUFBWDtBQUFBLFNBQWIsRUFBd0MsSUFBeEMsQ0FBNkMsTUFBN0MsSUFBdUQsTUFEekQ7QUFFSCxnQkFBUSxTQUFTLE1BQVQsR0FBa0IsQ0FGdkIsQ0FFeUI7QUFGekIsS0FBUDtBQUlIOztBQUVNLFNBQVMsVUFBVCxDQUFvQixDQUFwQixFQUF1QjtBQUMxQixXQUFPLE9BQU8sQ0FBUCxLQUFhLFdBQXBCO0FBQ0g7O0FBRU0sU0FBUyxZQUFULENBQXNCLENBQXRCLEVBQXlCLGFBQXpCLEVBQXdDO0FBQzNDLFFBQUksY0FBYyxXQUFXLGFBQVgsSUFBNEIsYUFBNUIsR0FBNEMsSUFBOUQ7QUFDQSxXQUFPLFdBQVcsQ0FBWCxJQUFnQixDQUFoQixHQUFvQixXQUEzQjtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtcHJvdG90eXBlLW9mXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3Byb21pc2VcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX3Byb21pc2UgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9wcm9taXNlXCIpO1xuXG52YXIgX3Byb21pc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvbWlzZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW4gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBuZXcgX3Byb21pc2UyLmRlZmF1bHQoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gc3RlcChrZXksIGFyZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBfcHJvbWlzZTIuZGVmYXVsdC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc3RlcChcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHN0ZXAoXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGVwKFwibmV4dFwiKTtcbiAgICB9KTtcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2RlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcIi4uL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWZpbmVQcm9wZXJ0eSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAoMCwgX2RlZmluZVByb3BlcnR5Mi5kZWZhdWx0KSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2dldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4uL2NvcmUtanMvb2JqZWN0L2dldC1wcm90b3R5cGUtb2ZcIik7XG5cbnZhciBfZ2V0UHJvdG90eXBlT2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2V0UHJvdG90eXBlT2YpO1xuXG52YXIgX2dldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JcIik7XG5cbnZhciBfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2dldE93blByb3BlcnR5RGVzY3JpcHRvcik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gIHZhciBkZXNjID0gKDAsIF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IyLmRlZmF1bHQpKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgcGFyZW50ID0gKDAsIF9nZXRQcm90b3R5cGVPZjIuZGVmYXVsdCkob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICB9XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX3NldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4uL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIik7XG5cbnZhciBfc2V0UHJvdG90eXBlT2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2V0UHJvdG90eXBlT2YpO1xuXG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9jcmVhdGVcIik7XG5cbnZhciBfY3JlYXRlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZSk7XG5cbnZhciBfdHlwZW9mMiA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL3R5cGVvZlwiKTtcblxudmFyIF90eXBlb2YzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdHlwZW9mMik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyAodHlwZW9mIHN1cGVyQ2xhc3MgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogKDAsIF90eXBlb2YzLmRlZmF1bHQpKHN1cGVyQ2xhc3MpKSk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSAoMCwgX2NyZWF0ZTIuZGVmYXVsdCkoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZjIuZGVmYXVsdCA/ICgwLCBfc2V0UHJvdG90eXBlT2YyLmRlZmF1bHQpKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX3R5cGVvZjIgPSByZXF1aXJlKFwiLi4vaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBfdHlwZW9mMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGVvZjIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAoKHR5cGVvZiBjYWxsID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMy5kZWZhdWx0KShjYWxsKSkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfaXRlcmF0b3IgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9zeW1ib2wvaXRlcmF0b3JcIik7XG5cbnZhciBfaXRlcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXRlcmF0b3IpO1xuXG52YXIgX3N5bWJvbCA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL3N5bWJvbFwiKTtcblxudmFyIF9zeW1ib2wyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3ltYm9sKTtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBfaXRlcmF0b3IyLmRlZmF1bHQgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBfc3ltYm9sMi5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBfc3ltYm9sMi5kZWZhdWx0ICYmIG9iaiAhPT0gX3N5bWJvbDIuZGVmYXVsdC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBfdHlwZW9mKF9pdGVyYXRvcjIuZGVmYXVsdCkgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2Yob2JqKTtcbn0gOiBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IF9zeW1ib2wyLmRlZmF1bHQgJiYgb2JqICE9PSBfc3ltYm9sMi5kZWZhdWx0LnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2Yob2JqKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5jcmVhdGUnKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpIHtcbiAgcmV0dXJuICRPYmplY3QuY3JlYXRlKFAsIEQpO1xufTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHknKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYykge1xuICByZXR1cm4gJE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKTtcbn07XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KSB7XG4gIHJldHVybiAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KTtcbn07XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdC5zZXRQcm90b3R5cGVPZjtcbiIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5wcm9taXNlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNy5wcm9taXNlLmZpbmFsbHknKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnByb21pc2UudHJ5Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5Qcm9taXNlO1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNy5zeW1ib2wuYXN5bmMtaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3LnN5bWJvbC5vYnNlcnZhYmxlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5TeW1ib2w7XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL193a3MtZXh0JykuZignaXRlcmF0b3InKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICh0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJykgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIENvbnN0cnVjdG9yLCBuYW1lLCBmb3JiaWRkZW5GaWVsZCkge1xuICBpZiAoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB8fCAoZm9yYmlkZGVuRmllbGQgIT09IHVuZGVmaW5lZCAmJiBmb3JiaWRkZW5GaWVsZCBpbiBpdCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IobmFtZSArICc6IGluY29ycmVjdCBpbnZvY2F0aW9uIScpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG4iLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4vX3RvLWFic29sdXRlLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTykge1xuICAgICAgaWYgKE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcbiIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIEFSRyA9IGNvZihmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcbiIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcbiIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7IHZlcnNpb246ICcyLjYuMicgfTtcbmlmICh0eXBlb2YgX19lID09ICdudW1iZXInKSBfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4iLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG4iLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcbiIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpO1xuIiwiLy8gYWxsIGVudW1lcmFibGUgb2JqZWN0IGtleXMsIGluY2x1ZGVzIHN5bWJvbHNcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BTID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKTtcbnZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgcmVzdWx0ID0gZ2V0S2V5cyhpdCk7XG4gIHZhciBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICBpZiAoZ2V0U3ltYm9scykge1xuICAgIHZhciBzeW1ib2xzID0gZ2V0U3ltYm9scyhpdCk7XG4gICAgdmFyIGlzRW51bSA9IHBJRS5mO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChzeW1ib2xzLmxlbmd0aCA+IGkpIGlmIChpc0VudW0uY2FsbChpdCwga2V5ID0gc3ltYm9sc1tpKytdKSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHNvdXJjZSkge1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRjtcbiAgdmFyIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0Lkc7XG4gIHZhciBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TO1xuICB2YXIgSVNfUFJPVE8gPSB0eXBlICYgJGV4cG9ydC5QO1xuICB2YXIgSVNfQklORCA9IHR5cGUgJiAkZXhwb3J0LkI7XG4gIHZhciBJU19XUkFQID0gdHlwZSAmICRleHBvcnQuVztcbiAgdmFyIGV4cG9ydHMgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgdmFyIGV4cFByb3RvID0gZXhwb3J0c1tQUk9UT1RZUEVdO1xuICB2YXIgdGFyZ2V0ID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXTtcbiAgdmFyIGtleSwgb3duLCBvdXQ7XG4gIGlmIChJU19HTE9CQUwpIHNvdXJjZSA9IG5hbWU7XG4gIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgaWYgKG93biAmJiBoYXMoZXhwb3J0cywga2V5KSkgY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbiAoQykge1xuICAgICAgdmFyIEYgPSBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIEMpIHtcbiAgICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIG5ldyBDKCk7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBuZXcgQyhhKTtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIG5ldyBDKGEsIGIpO1xuICAgICAgICAgIH0gcmV0dXJuIG5ldyBDKGEsIGIsIGMpO1xuICAgICAgICB9IHJldHVybiBDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5tZXRob2RzLiVOQU1FJVxuICAgIGlmIChJU19QUk9UTykge1xuICAgICAgKGV4cG9ydHMudmlydHVhbCB8fCAoZXhwb3J0cy52aXJ0dWFsID0ge30pKVtrZXldID0gb3V0O1xuICAgICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLnByb3RvdHlwZS4lTkFNRSVcbiAgICAgIGlmICh0eXBlICYgJGV4cG9ydC5SICYmIGV4cFByb3RvICYmICFleHBQcm90b1trZXldKSBoaWRlKGV4cFByb3RvLCBrZXksIG91dCk7XG4gICAgfVxuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuIiwidmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIGNhbGwgPSByZXF1aXJlKCcuL19pdGVyLWNhbGwnKTtcbnZhciBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJyk7XG52YXIgZ2V0SXRlckZuID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbnZhciBCUkVBSyA9IHt9O1xudmFyIFJFVFVSTiA9IHt9O1xudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQsIElURVJBVE9SKSB7XG4gIHZhciBpdGVyRm4gPSBJVEVSQVRPUiA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGl0ZXJhYmxlOyB9IDogZ2V0SXRlckZuKGl0ZXJhYmxlKTtcbiAgdmFyIGYgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSk7XG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yLCByZXN1bHQ7XG4gIGlmICh0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYgKGlzQXJyYXlJdGVyKGl0ZXJGbikpIGZvciAobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICByZXN1bHQgPSBlbnRyaWVzID8gZihhbk9iamVjdChzdGVwID0gaXRlcmFibGVbaW5kZXhdKVswXSwgc3RlcFsxXSkgOiBmKGl0ZXJhYmxlW2luZGV4XSk7XG4gICAgaWYgKHJlc3VsdCA9PT0gQlJFQUsgfHwgcmVzdWx0ID09PSBSRVRVUk4pIHJldHVybiByZXN1bHQ7XG4gIH0gZWxzZSBmb3IgKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7KSB7XG4gICAgcmVzdWx0ID0gY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gICAgaWYgKHJlc3VsdCA9PT0gQlJFQUsgfHwgcmVzdWx0ID09PSBSRVRVUk4pIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5leHBvcnRzLkJSRUFLID0gQlJFQUs7XG5leHBvcnRzLlJFVFVSTiA9IFJFVFVSTjtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmICh0eXBlb2YgX19nID09ICdudW1iZXInKSBfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG4iLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG4iLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsIi8vIGZhc3QgYXBwbHksIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIGFyZ3MsIHRoYXQpIHtcbiAgdmFyIHVuID0gdGhhdCA9PT0gdW5kZWZpbmVkO1xuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gIH0gcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xufTtcbiIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07XG4iLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTtcbiIsIi8vIDcuMi4yIElzQXJyYXkoYXJndW1lbnQpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG4iLCIvLyBjYWxsIHNvbWV0aGluZyBvbiBpdGVyYXRvciBzdGVwIHdpdGggc2FmZSBjbG9zaW5nIG9uIGVycm9yXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZiAocmV0ICE9PSB1bmRlZmluZWQpIGFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgZGVzY3JpcHRvciA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2hpZGUnKShJdGVyYXRvclByb3RvdHlwZSwgcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCkge1xuICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBjcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHsgbmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KSB9KTtcbiAgc2V0VG9TdHJpbmdUYWcoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyICRpdGVyQ3JlYXRlID0gcmVxdWlyZSgnLi9faXRlci1jcmVhdGUnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuL19vYmplY3QtZ3BvJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBCVUdHWSA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKTsgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxudmFyIEZGX0lURVJBVE9SID0gJ0BAaXRlcmF0b3InO1xudmFyIEtFWVMgPSAna2V5cyc7XG52YXIgVkFMVUVTID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKSB7XG4gICRpdGVyQ3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uIChraW5kKSB7XG4gICAgaWYgKCFCVUdHWSAmJiBraW5kIGluIHByb3RvKSByZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCkgeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpIHsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfTtcbiAgdmFyIFRBRyA9IE5BTUUgKyAnIEl0ZXJhdG9yJztcbiAgdmFyIERFRl9WQUxVRVMgPSBERUZBVUxUID09IFZBTFVFUztcbiAgdmFyIFZBTFVFU19CVUcgPSBmYWxzZTtcbiAgdmFyIHByb3RvID0gQmFzZS5wcm90b3R5cGU7XG4gIHZhciAkbmF0aXZlID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdO1xuICB2YXIgJGRlZmF1bHQgPSAkbmF0aXZlIHx8IGdldE1ldGhvZChERUZBVUxUKTtcbiAgdmFyICRlbnRyaWVzID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZDtcbiAgdmFyICRhbnlOYXRpdmUgPSBOQU1FID09ICdBcnJheScgPyBwcm90by5lbnRyaWVzIHx8ICRuYXRpdmUgOiAkbmF0aXZlO1xuICB2YXIgbWV0aG9kcywga2V5LCBJdGVyYXRvclByb3RvdHlwZTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZiAoJGFueU5hdGl2ZSkge1xuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoJGFueU5hdGl2ZS5jYWxsKG5ldyBCYXNlKCkpKTtcbiAgICBpZiAoSXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgSXRlcmF0b3JQcm90b3R5cGUubmV4dCkge1xuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgICAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgICAvLyBmaXggZm9yIHNvbWUgb2xkIGVuZ2luZXNcbiAgICAgIGlmICghTElCUkFSWSAmJiB0eXBlb2YgSXRlcmF0b3JQcm90b3R5cGVbSVRFUkFUT1JdICE9ICdmdW5jdGlvbicpIGhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZiAoREVGX1ZBTFVFUyAmJiAkbmF0aXZlICYmICRuYXRpdmUubmFtZSAhPT0gVkFMVUVTKSB7XG4gICAgVkFMVUVTX0JVRyA9IHRydWU7XG4gICAgJGRlZmF1bHQgPSBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmICgoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSkge1xuICAgIGhpZGUocHJvdG8sIElURVJBVE9SLCAkZGVmYXVsdCk7XG4gIH1cbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSAkZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gPSByZXR1cm5UaGlzO1xuICBpZiAoREVGQVVMVCkge1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6IERFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogSVNfU0VUID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAkZW50cmllc1xuICAgIH07XG4gICAgaWYgKEZPUkNFRCkgZm9yIChrZXkgaW4gbWV0aG9kcykge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3RvKSkgcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTtcbiIsInZhciBJVEVSQVRPUiA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpO1xudmFyIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uICgpIHsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRocm93LWxpdGVyYWxcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24gKCkgeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjLCBza2lwQ2xvc2luZykge1xuICBpZiAoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpIHJldHVybiBmYWxzZTtcbiAgdmFyIHNhZmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gWzddO1xuICAgIHZhciBpdGVyID0gYXJyW0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHsgZG9uZTogc2FmZSA9IHRydWUgfTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaXRlcjsgfTtcbiAgICBleGVjKGFycik7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkb25lLCB2YWx1ZSkge1xuICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZSB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge307XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7XG4iLCJ2YXIgTUVUQSA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBzZXREZXNjID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBpZCA9IDA7XG52YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBpc0V4dGVuc2libGUoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHt9KSk7XG59KTtcbnZhciBzZXRNZXRhID0gZnVuY3Rpb24gKGl0KSB7XG4gIHNldERlc2MoaXQsIE1FVEEsIHsgdmFsdWU6IHtcbiAgICBpOiAnTycgKyArK2lkLCAvLyBvYmplY3QgSURcbiAgICB3OiB7fSAgICAgICAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IH0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gb2JqZWN0IElEXG4gIH0gcmV0dXJuIGl0W01FVEFdLmk7XG59O1xudmFyIGdldFdlYWsgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuIHRydWU7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSkgc2V0TWV0YShpdCk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgbWV0YSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBLRVk6IE1FVEEsXG4gIE5FRUQ6IGZhbHNlLFxuICBmYXN0S2V5OiBmYXN0S2V5LFxuICBnZXRXZWFrOiBnZXRXZWFrLFxuICBvbkZyZWV6ZTogb25GcmVlemVcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgbWFjcm90YXNrID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldDtcbnZhciBPYnNlcnZlciA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciBQcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XG52YXIgaXNOb2RlID0gcmVxdWlyZSgnLi9fY29mJykocHJvY2VzcykgPT0gJ3Byb2Nlc3MnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhlYWQsIGxhc3QsIG5vdGlmeTtcblxuICB2YXIgZmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudCwgZm47XG4gICAgaWYgKGlzTm9kZSAmJiAocGFyZW50ID0gcHJvY2Vzcy5kb21haW4pKSBwYXJlbnQuZXhpdCgpO1xuICAgIHdoaWxlIChoZWFkKSB7XG4gICAgICBmbiA9IGhlYWQuZm47XG4gICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm4oKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGhlYWQpIG5vdGlmeSgpO1xuICAgICAgICBlbHNlIGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBsYXN0ID0gdW5kZWZpbmVkO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5lbnRlcigpO1xuICB9O1xuXG4gIC8vIE5vZGUuanNcbiAgaWYgKGlzTm9kZSkge1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG4gIC8vIGJyb3dzZXJzIHdpdGggTXV0YXRpb25PYnNlcnZlciwgZXhjZXB0IGlPUyBTYWZhcmkgLSBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMzM5XG4gIH0gZWxzZSBpZiAoT2JzZXJ2ZXIgJiYgIShnbG9iYWwubmF2aWdhdG9yICYmIGdsb2JhbC5uYXZpZ2F0b3Iuc3RhbmRhbG9uZSkpIHtcbiAgICB2YXIgdG9nZ2xlID0gdHJ1ZTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBuZXcgT2JzZXJ2ZXIoZmx1c2gpLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG5vZGUuZGF0YSA9IHRvZ2dsZSA9ICF0b2dnbGU7XG4gICAgfTtcbiAgLy8gZW52aXJvbm1lbnRzIHdpdGggbWF5YmUgbm9uLWNvbXBsZXRlbHkgY29ycmVjdCwgYnV0IGV4aXN0ZW50IFByb21pc2VcbiAgfSBlbHNlIGlmIChQcm9taXNlICYmIFByb21pc2UucmVzb2x2ZSkge1xuICAgIC8vIFByb21pc2UucmVzb2x2ZSB3aXRob3V0IGFuIGFyZ3VtZW50IHRocm93cyBhbiBlcnJvciBpbiBMRyBXZWJPUyAyXG4gICAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBwcm9taXNlLnRoZW4oZmx1c2gpO1xuICAgIH07XG4gIC8vIGZvciBvdGhlciBlbnZpcm9ubWVudHMgLSBtYWNyb3Rhc2sgYmFzZWQgb246XG4gIC8vIC0gc2V0SW1tZWRpYXRlXG4gIC8vIC0gTWVzc2FnZUNoYW5uZWxcbiAgLy8gLSB3aW5kb3cucG9zdE1lc3NhZ1xuICAvLyAtIG9ucmVhZHlzdGF0ZWNoYW5nZVxuICAvLyAtIHNldFRpbWVvdXRcbiAgfSBlbHNlIHtcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgICBtYWNyb3Rhc2suY2FsbChnbG9iYWwsIGZsdXNoKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChmbikge1xuICAgIHZhciB0YXNrID0geyBmbjogZm4sIG5leHQ6IHVuZGVmaW5lZCB9O1xuICAgIGlmIChsYXN0KSBsYXN0Lm5leHQgPSB0YXNrO1xuICAgIGlmICghaGVhZCkge1xuICAgICAgaGVhZCA9IHRhc2s7XG4gICAgICBub3RpZnkoKTtcbiAgICB9IGxhc3QgPSB0YXNrO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIDI1LjQuMS41IE5ld1Byb21pc2VDYXBhYmlsaXR5KEMpXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xuXG5mdW5jdGlvbiBQcm9taXNlQ2FwYWJpbGl0eShDKSB7XG4gIHZhciByZXNvbHZlLCByZWplY3Q7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBDKGZ1bmN0aW9uICgkJHJlc29sdmUsICQkcmVqZWN0KSB7XG4gICAgaWYgKHJlc29sdmUgIT09IHVuZGVmaW5lZCB8fCByZWplY3QgIT09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKCdCYWQgUHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIHJlc29sdmUgPSAkJHJlc29sdmU7XG4gICAgcmVqZWN0ID0gJCRyZWplY3Q7XG4gIH0pO1xuICB0aGlzLnJlc29sdmUgPSBhRnVuY3Rpb24ocmVzb2x2ZSk7XG4gIHRoaXMucmVqZWN0ID0gYUZ1bmN0aW9uKHJlamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiAoQykge1xuICByZXR1cm4gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xufTtcbiIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgZFBzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnaWZyYW1lJyk7XG4gIHZhciBpID0gZW51bUJ1Z0tleXMubGVuZ3RoO1xuICB2YXIgbHQgPSAnPCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgJ3NjcmlwdCcgKyBndCArICdkb2N1bWVudC5GPU9iamVjdCcgKyBsdCArICcvc2NyaXB0JyArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlIChpLS0pIGRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGRQID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBnZXRLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIFA7XG4gIHdoaWxlIChsZW5ndGggPiBpKSBkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpO1xudmFyIGdPUEQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZ09QRCA6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKSB7XG4gIE8gPSB0b0lPYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBnT1BEKE8sIFApO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKGhhcyhPLCBQKSkgcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgZ09QTiA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZjtcbnZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIHdpbmRvdyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdPUE4oaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59O1xuIiwiLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xuXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGhpZGRlbktleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4iLCIvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG52YXIgT2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiAoTykge1xuICBPID0gdG9PYmplY3QoTyk7XG4gIGlmIChoYXMoTywgSUVfUFJPVE8pKSByZXR1cm4gT1tJRV9QUk9UT107XG4gIGlmICh0eXBlb2YgTy5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xuICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0lPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pIGlmIChrZXkgIT0gSUVfUFJPVE8pIGhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIGlmIChoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpIHtcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuIiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoS0VZLCBleGVjKSB7XG4gIHZhciBmbiA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXTtcbiAgdmFyIGV4cCA9IHt9O1xuICBleHBbS0VZXSA9IGV4ZWMoZm4pO1xuICAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqIGZhaWxzKGZ1bmN0aW9uICgpIHsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHsgZTogZmFsc2UsIHY6IGV4ZWMoKSB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHsgZTogdHJ1ZSwgdjogZSB9O1xuICB9XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eSA9IHJlcXVpcmUoJy4vX25ldy1wcm9taXNlLWNhcGFiaWxpdHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQywgeCkge1xuICBhbk9iamVjdChDKTtcbiAgaWYgKGlzT2JqZWN0KHgpICYmIHguY29uc3RydWN0b3IgPT09IEMpIHJldHVybiB4O1xuICB2YXIgcHJvbWlzZUNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eS5mKEMpO1xuICB2YXIgcmVzb2x2ZSA9IHByb21pc2VDYXBhYmlsaXR5LnJlc29sdmU7XG4gIHJlc29sdmUoeCk7XG4gIHJldHVybiBwcm9taXNlQ2FwYWJpbGl0eS5wcm9taXNlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJpdG1hcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG4iLCJ2YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRhcmdldCwgc3JjLCBzYWZlKSB7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIHtcbiAgICBpZiAoc2FmZSAmJiB0YXJnZXRba2V5XSkgdGFyZ2V0W2tleV0gPSBzcmNba2V5XTtcbiAgICBlbHNlIGhpZGUodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcbiAgfSByZXR1cm4gdGFyZ2V0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faGlkZScpO1xuIiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBjaGVjayA9IGZ1bmN0aW9uIChPLCBwcm90bykge1xuICBhbk9iamVjdChPKTtcbiAgaWYgKCFpc09iamVjdChwcm90bykgJiYgcHJvdG8gIT09IG51bGwpIHRocm93IFR5cGVFcnJvcihwcm90byArIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGZ1bmN0aW9uICh0ZXN0LCBidWdneSwgc2V0KSB7XG4gICAgICB0cnkge1xuICAgICAgICBzZXQgPSByZXF1aXJlKCcuL19jdHgnKShGdW5jdGlvbi5jYWxsLCByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmYoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgIHNldCh0ZXN0LCBbXSk7XG4gICAgICAgIGJ1Z2d5ID0gISh0ZXN0IGluc3RhbmNlb2YgQXJyYXkpO1xuICAgICAgfSBjYXRjaCAoZSkgeyBidWdneSA9IHRydWU7IH1cbiAgICAgIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90bykge1xuICAgICAgICBjaGVjayhPLCBwcm90byk7XG4gICAgICAgIGlmIChidWdneSkgTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xuICAgICAgICByZXR1cm4gTztcbiAgICAgIH07XG4gICAgfSh7fSwgZmFsc2UpIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEtFWSkge1xuICB2YXIgQyA9IHR5cGVvZiBjb3JlW0tFWV0gPT0gJ2Z1bmN0aW9uJyA/IGNvcmVbS0VZXSA6IGdsb2JhbFtLRVldO1xuICBpZiAoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSkgZFAuZihDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG4iLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIHRhZywgc3RhdCkge1xuICBpZiAoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkgZGVmKGl0LCBUQUcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnIH0pO1xufTtcbiIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiBjb3JlLnZlcnNpb24sXG4gIG1vZGU6IHJlcXVpcmUoJy4vX2xpYnJhcnknKSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDE5IERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG4iLCIvLyA3LjMuMjAgU3BlY2llc0NvbnN0cnVjdG9yKE8sIGRlZmF1bHRDb25zdHJ1Y3RvcilcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBTUEVDSUVTID0gcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIEQpIHtcbiAgdmFyIEMgPSBhbk9iamVjdChPKS5jb25zdHJ1Y3RvcjtcbiAgdmFyIFM7XG4gIHJldHVybiBDID09PSB1bmRlZmluZWQgfHwgKFMgPSBhbk9iamVjdChDKVtTUEVDSUVTXSkgPT0gdW5kZWZpbmVkID8gRCA6IGFGdW5jdGlvbihTKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVE9fU1RSSU5HKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGhhdCwgcG9zKSB7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSk7XG4gICAgdmFyIGkgPSB0b0ludGVnZXIocG9zKTtcbiAgICB2YXIgbCA9IHMubGVuZ3RoO1xuICAgIHZhciBhLCBiO1xuICAgIGlmIChpIDwgMCB8fCBpID49IGwpIHJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59O1xuIiwidmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIGludm9rZSA9IHJlcXVpcmUoJy4vX2ludm9rZScpO1xudmFyIGh0bWwgPSByZXF1aXJlKCcuL19odG1sJyk7XG52YXIgY2VsID0gcmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciBzZXRUYXNrID0gZ2xvYmFsLnNldEltbWVkaWF0ZTtcbnZhciBjbGVhclRhc2sgPSBnbG9iYWwuY2xlYXJJbW1lZGlhdGU7XG52YXIgTWVzc2FnZUNoYW5uZWwgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWw7XG52YXIgRGlzcGF0Y2ggPSBnbG9iYWwuRGlzcGF0Y2g7XG52YXIgY291bnRlciA9IDA7XG52YXIgcXVldWUgPSB7fTtcbnZhciBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJztcbnZhciBkZWZlciwgY2hhbm5lbCwgcG9ydDtcbnZhciBydW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpZCA9ICt0aGlzO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gIGlmIChxdWV1ZS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgICBmbigpO1xuICB9XG59O1xudmFyIGxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xufTtcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcbmlmICghc2V0VGFzayB8fCAhY2xlYXJUYXNrKSB7XG4gIHNldFRhc2sgPSBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoZm4pIHtcbiAgICB2YXIgYXJncyA9IFtdO1xuICAgIHZhciBpID0gMTtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICAgICAgaW52b2tlKHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nID8gZm4gOiBGdW5jdGlvbihmbiksIGFyZ3MpO1xuICAgIH07XG4gICAgZGVmZXIoY291bnRlcik7XG4gICAgcmV0dXJuIGNvdW50ZXI7XG4gIH07XG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGlkKSB7XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgfTtcbiAgLy8gTm9kZS5qcyAwLjgtXG4gIGlmIChyZXF1aXJlKCcuL19jb2YnKShwcm9jZXNzKSA9PSAncHJvY2VzcycpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjdHgocnVuLCBpZCwgMSkpO1xuICAgIH07XG4gIC8vIFNwaGVyZSAoSlMgZ2FtZSBlbmdpbmUpIERpc3BhdGNoIEFQSVxuICB9IGVsc2UgaWYgKERpc3BhdGNoICYmIERpc3BhdGNoLm5vdykge1xuICAgIGRlZmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBEaXNwYXRjaC5ub3coY3R4KHJ1biwgaWQsIDEpKTtcbiAgICB9O1xuICAvLyBCcm93c2VycyB3aXRoIE1lc3NhZ2VDaGFubmVsLCBpbmNsdWRlcyBXZWJXb3JrZXJzXG4gIH0gZWxzZSBpZiAoTWVzc2FnZUNoYW5uZWwpIHtcbiAgICBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgcG9ydCA9IGNoYW5uZWwucG9ydDI7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0ZW5lcjtcbiAgICBkZWZlciA9IGN0eChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBwb3N0TWVzc2FnZSwgc2tpcCBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzICdvYmplY3QnXG4gIH0gZWxzZSBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgdHlwZW9mIHBvc3RNZXNzYWdlID09ICdmdW5jdGlvbicgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzKSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShpZCArICcnLCAnKicpO1xuICAgIH07XG4gICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAvLyBJRTgtXG4gIH0gZWxzZSBpZiAoT05SRUFEWVNUQVRFQ0hBTkdFIGluIGNlbCgnc2NyaXB0JykpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgaHRtbC5hcHBlbmRDaGlsZChjZWwoJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICBydW4uY2FsbChpZCk7XG4gICAgICB9O1xuICAgIH07XG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXG4gIH0gZWxzZSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcbiAgICB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBzZXRUYXNrLFxuICBjbGVhcjogY2xlYXJUYXNrXG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07XG4iLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTtcbiIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG4iLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcbiIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuIiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIFMpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwidmFyIGlkID0gMDtcbnZhciBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgbmF2aWdhdG9yID0gZ2xvYmFsLm5hdmlnYXRvcjtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyICRTeW1ib2wgPSBjb3JlLlN5bWJvbCB8fCAoY29yZS5TeW1ib2wgPSBMSUJSQVJZID8ge30gOiBnbG9iYWwuU3ltYm9sIHx8IHt9KTtcbiAgaWYgKG5hbWUuY2hhckF0KDApICE9ICdfJyAmJiAhKG5hbWUgaW4gJFN5bWJvbCkpIGRlZmluZVByb3BlcnR5KCRTeW1ib2wsIG5hbWUsIHsgdmFsdWU6IHdrc0V4dC5mKG5hbWUpIH0pO1xufTtcbiIsImV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX3drcycpO1xuIiwidmFyIHN0b3JlID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbDtcbnZhciBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fY29yZScpLmdldEl0ZXJhdG9yTWV0aG9kID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCAhPSB1bmRlZmluZWQpIHJldHVybiBpdFtJVEVSQVRPUl1cbiAgICB8fCBpdFsnQEBpdGVyYXRvciddXG4gICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYWRkVG9VbnNjb3BhYmxlcyA9IHJlcXVpcmUoJy4vX2FkZC10by11bnNjb3BhYmxlcycpO1xudmFyIHN0ZXAgPSByZXF1aXJlKCcuL19pdGVyLXN0ZXAnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24gKGl0ZXJhdGVkLCBraW5kKSB7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgTyA9IHRoaXMuX3Q7XG4gIHZhciBraW5kID0gdGhpcy5faztcbiAgdmFyIGluZGV4ID0gdGhpcy5faSsrO1xuICBpZiAoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpIHtcbiAgICB0aGlzLl90ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmIChraW5kID09ICdrZXlzJykgcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZiAoa2luZCA9PSAndmFsdWVzJykgcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpO1xuIiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7IGNyZWF0ZTogcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpIH0pO1xuIiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbi8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpLCAnT2JqZWN0JywgeyBkZWZpbmVQcm9wZXJ0eTogcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZiB9KTtcbiIsIi8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BkJykuZjtcblxucmVxdWlyZSgnLi9fb2JqZWN0LXNhcCcpKCdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3InLCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSkge1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvSU9iamVjdChpdCksIGtleSk7XG4gIH07XG59KTtcbiIsIi8vIDE5LjEuMi45IE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgJGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdwbycpO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldFByb3RvdHlwZU9mJywgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpIHtcbiAgICByZXR1cm4gJGdldFByb3RvdHlwZU9mKHRvT2JqZWN0KGl0KSk7XG4gIH07XG59KTtcbiIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7IHNldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuL19zZXQtcHJvdG8nKS5zZXQgfSk7XG4iLCIiLCIndXNlIHN0cmljdCc7XG52YXIgTElCUkFSWSA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKTtcbnZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xudmFyIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vX3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciB0YXNrID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldDtcbnZhciBtaWNyb3Rhc2sgPSByZXF1aXJlKCcuL19taWNyb3Rhc2snKSgpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlID0gcmVxdWlyZSgnLi9fbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuL19wZXJmb3JtJyk7XG52YXIgdXNlckFnZW50ID0gcmVxdWlyZSgnLi9fdXNlci1hZ2VudCcpO1xudmFyIHByb21pc2VSZXNvbHZlID0gcmVxdWlyZSgnLi9fcHJvbWlzZS1yZXNvbHZlJyk7XG52YXIgUFJPTUlTRSA9ICdQcm9taXNlJztcbnZhciBUeXBlRXJyb3IgPSBnbG9iYWwuVHlwZUVycm9yO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciB2ZXJzaW9ucyA9IHByb2Nlc3MgJiYgcHJvY2Vzcy52ZXJzaW9ucztcbnZhciB2OCA9IHZlcnNpb25zICYmIHZlcnNpb25zLnY4IHx8ICcnO1xudmFyICRQcm9taXNlID0gZ2xvYmFsW1BST01JU0VdO1xudmFyIGlzTm9kZSA9IGNsYXNzb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnO1xudmFyIGVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIEludGVybmFsLCBuZXdHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHksIE93blByb21pc2VDYXBhYmlsaXR5LCBXcmFwcGVyO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3R2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZjtcblxudmFyIFVTRV9OQVRJVkUgPSAhIWZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICAvLyBjb3JyZWN0IHN1YmNsYXNzaW5nIHdpdGggQEBzcGVjaWVzIHN1cHBvcnRcbiAgICB2YXIgcHJvbWlzZSA9ICRQcm9taXNlLnJlc29sdmUoMSk7XG4gICAgdmFyIEZha2VQcm9taXNlID0gKHByb21pc2UuY29uc3RydWN0b3IgPSB7fSlbcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKV0gPSBmdW5jdGlvbiAoZXhlYykge1xuICAgICAgZXhlYyhlbXB0eSwgZW1wdHkpO1xuICAgIH07XG4gICAgLy8gdW5oYW5kbGVkIHJlamVjdGlvbnMgdHJhY2tpbmcgc3VwcG9ydCwgTm9kZUpTIFByb21pc2Ugd2l0aG91dCBpdCBmYWlscyBAQHNwZWNpZXMgdGVzdFxuICAgIHJldHVybiAoaXNOb2RlIHx8IHR5cGVvZiBQcm9taXNlUmVqZWN0aW9uRXZlbnQgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICYmIHByb21pc2UudGhlbihlbXB0eSkgaW5zdGFuY2VvZiBGYWtlUHJvbWlzZVxuICAgICAgLy8gdjggNi42IChOb2RlIDEwIGFuZCBDaHJvbWUgNjYpIGhhdmUgYSBidWcgd2l0aCByZXNvbHZpbmcgY3VzdG9tIHRoZW5hYmxlc1xuICAgICAgLy8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9ODMwNTY1XG4gICAgICAvLyB3ZSBjYW4ndCBkZXRlY3QgaXQgc3luY2hyb25vdXNseSwgc28ganVzdCBjaGVjayB2ZXJzaW9uc1xuICAgICAgJiYgdjguaW5kZXhPZignNi42JykgIT09IDBcbiAgICAgICYmIHVzZXJBZ2VudC5pbmRleE9mKCdDaHJvbWUvNjYnKSA9PT0gLTE7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxufSgpO1xuXG4vLyBoZWxwZXJzXG52YXIgaXNUaGVuYWJsZSA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgdGhlbjtcbiAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiB0eXBlb2YgKHRoZW4gPSBpdC50aGVuKSA9PSAnZnVuY3Rpb24nID8gdGhlbiA6IGZhbHNlO1xufTtcbnZhciBub3RpZnkgPSBmdW5jdGlvbiAocHJvbWlzZSwgaXNSZWplY3QpIHtcbiAgaWYgKHByb21pc2UuX24pIHJldHVybjtcbiAgcHJvbWlzZS5fbiA9IHRydWU7XG4gIHZhciBjaGFpbiA9IHByb21pc2UuX2M7XG4gIG1pY3JvdGFzayhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gcHJvbWlzZS5fdjtcbiAgICB2YXIgb2sgPSBwcm9taXNlLl9zID09IDE7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBydW4gPSBmdW5jdGlvbiAocmVhY3Rpb24pIHtcbiAgICAgIHZhciBoYW5kbGVyID0gb2sgPyByZWFjdGlvbi5vayA6IHJlYWN0aW9uLmZhaWw7XG4gICAgICB2YXIgcmVzb2x2ZSA9IHJlYWN0aW9uLnJlc29sdmU7XG4gICAgICB2YXIgcmVqZWN0ID0gcmVhY3Rpb24ucmVqZWN0O1xuICAgICAgdmFyIGRvbWFpbiA9IHJlYWN0aW9uLmRvbWFpbjtcbiAgICAgIHZhciByZXN1bHQsIHRoZW4sIGV4aXRlZDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgaWYgKCFvaykge1xuICAgICAgICAgICAgaWYgKHByb21pc2UuX2ggPT0gMikgb25IYW5kbGVVbmhhbmRsZWQocHJvbWlzZSk7XG4gICAgICAgICAgICBwcm9taXNlLl9oID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhbmRsZXIgPT09IHRydWUpIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRvbWFpbikgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyKHZhbHVlKTsgLy8gbWF5IHRocm93XG4gICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgICAgIGV4aXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXN1bHQgPT09IHJlYWN0aW9uLnByb21pc2UpIHtcbiAgICAgICAgICAgIHJlamVjdChUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGVuID0gaXNUaGVuYWJsZShyZXN1bHQpKSB7XG4gICAgICAgICAgICB0aGVuLmNhbGwocmVzdWx0LCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSByZWplY3QodmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZG9tYWluICYmICFleGl0ZWQpIGRvbWFpbi5leGl0KCk7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGggPiBpKSBydW4oY2hhaW5baSsrXSk7IC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXG4gICAgcHJvbWlzZS5fYyA9IFtdO1xuICAgIHByb21pc2UuX24gPSBmYWxzZTtcbiAgICBpZiAoaXNSZWplY3QgJiYgIXByb21pc2UuX2gpIG9uVW5oYW5kbGVkKHByb21pc2UpO1xuICB9KTtcbn07XG52YXIgb25VbmhhbmRsZWQgPSBmdW5jdGlvbiAocHJvbWlzZSkge1xuICB0YXNrLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gcHJvbWlzZS5fdjtcbiAgICB2YXIgdW5oYW5kbGVkID0gaXNVbmhhbmRsZWQocHJvbWlzZSk7XG4gICAgdmFyIHJlc3VsdCwgaGFuZGxlciwgY29uc29sZTtcbiAgICBpZiAodW5oYW5kbGVkKSB7XG4gICAgICByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGlzTm9kZSkge1xuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPSBnbG9iYWwub251bmhhbmRsZWRyZWplY3Rpb24pIHtcbiAgICAgICAgICBoYW5kbGVyKHsgcHJvbWlzZTogcHJvbWlzZSwgcmVhc29uOiB2YWx1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICgoY29uc29sZSA9IGdsb2JhbC5jb25zb2xlKSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIEJyb3dzZXJzIHNob3VsZCBub3QgdHJpZ2dlciBgcmVqZWN0aW9uSGFuZGxlZGAgZXZlbnQgaWYgaXQgd2FzIGhhbmRsZWQgaGVyZSwgTm9kZUpTIC0gc2hvdWxkXG4gICAgICBwcm9taXNlLl9oID0gaXNOb2RlIHx8IGlzVW5oYW5kbGVkKHByb21pc2UpID8gMiA6IDE7XG4gICAgfSBwcm9taXNlLl9hID0gdW5kZWZpbmVkO1xuICAgIGlmICh1bmhhbmRsZWQgJiYgcmVzdWx0LmUpIHRocm93IHJlc3VsdC52O1xuICB9KTtcbn07XG52YXIgaXNVbmhhbmRsZWQgPSBmdW5jdGlvbiAocHJvbWlzZSkge1xuICByZXR1cm4gcHJvbWlzZS5faCAhPT0gMSAmJiAocHJvbWlzZS5fYSB8fCBwcm9taXNlLl9jKS5sZW5ndGggPT09IDA7XG59O1xudmFyIG9uSGFuZGxlVW5oYW5kbGVkID0gZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBoYW5kbGVyO1xuICAgIGlmIChpc05vZGUpIHtcbiAgICAgIHByb2Nlc3MuZW1pdCgncmVqZWN0aW9uSGFuZGxlZCcsIHByb21pc2UpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9IGdsb2JhbC5vbnJlamVjdGlvbmhhbmRsZWQpIHtcbiAgICAgIGhhbmRsZXIoeyBwcm9taXNlOiBwcm9taXNlLCByZWFzb246IHByb21pc2UuX3YgfSk7XG4gICAgfVxuICB9KTtcbn07XG52YXIgJHJlamVjdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gIGlmIChwcm9taXNlLl9kKSByZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgcHJvbWlzZS5fdiA9IHZhbHVlO1xuICBwcm9taXNlLl9zID0gMjtcbiAgaWYgKCFwcm9taXNlLl9hKSBwcm9taXNlLl9hID0gcHJvbWlzZS5fYy5zbGljZSgpO1xuICBub3RpZnkocHJvbWlzZSwgdHJ1ZSk7XG59O1xudmFyICRyZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBwcm9taXNlID0gdGhpcztcbiAgdmFyIHRoZW47XG4gIGlmIChwcm9taXNlLl9kKSByZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgdHJ5IHtcbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHRocm93IFR5cGVFcnJvcihcIlByb21pc2UgY2FuJ3QgYmUgcmVzb2x2ZWQgaXRzZWxmXCIpO1xuICAgIGlmICh0aGVuID0gaXNUaGVuYWJsZSh2YWx1ZSkpIHtcbiAgICAgIG1pY3JvdGFzayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3cmFwcGVyID0geyBfdzogcHJvbWlzZSwgX2Q6IGZhbHNlIH07IC8vIHdyYXBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eCgkcmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eCgkcmVqZWN0LCB3cmFwcGVyLCAxKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAkcmVqZWN0LmNhbGwod3JhcHBlciwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9taXNlLl92ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zID0gMTtcbiAgICAgIG5vdGlmeShwcm9taXNlLCBmYWxzZSk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgJHJlamVjdC5jYWxsKHsgX3c6IHByb21pc2UsIF9kOiBmYWxzZSB9LCBlKTsgLy8gd3JhcFxuICB9XG59O1xuXG4vLyBjb25zdHJ1Y3RvciBwb2x5ZmlsbFxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXG4gICRQcm9taXNlID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuICAgIGFuSW5zdGFuY2UodGhpcywgJFByb21pc2UsIFBST01JU0UsICdfaCcpO1xuICAgIGFGdW5jdGlvbihleGVjdXRvcik7XG4gICAgSW50ZXJuYWwuY2FsbCh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCB0aGlzLCAxKSwgY3R4KCRyZWplY3QsIHRoaXMsIDEpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICRyZWplY3QuY2FsbCh0aGlzLCBlcnIpO1xuICAgIH1cbiAgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gIEludGVybmFsID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuICAgIHRoaXMuX2MgPSBbXTsgICAgICAgICAgICAgLy8gPC0gYXdhaXRpbmcgcmVhY3Rpb25zXG4gICAgdGhpcy5fYSA9IHVuZGVmaW5lZDsgICAgICAvLyA8LSBjaGVja2VkIGluIGlzVW5oYW5kbGVkIHJlYWN0aW9uc1xuICAgIHRoaXMuX3MgPSAwOyAgICAgICAgICAgICAgLy8gPC0gc3RhdGVcbiAgICB0aGlzLl9kID0gZmFsc2U7ICAgICAgICAgIC8vIDwtIGRvbmVcbiAgICB0aGlzLl92ID0gdW5kZWZpbmVkOyAgICAgIC8vIDwtIHZhbHVlXG4gICAgdGhpcy5faCA9IDA7ICAgICAgICAgICAgICAvLyA8LSByZWplY3Rpb24gc3RhdGUsIDAgLSBkZWZhdWx0LCAxIC0gaGFuZGxlZCwgMiAtIHVuaGFuZGxlZFxuICAgIHRoaXMuX24gPSBmYWxzZTsgICAgICAgICAgLy8gPC0gbm90aWZ5XG4gIH07XG4gIEludGVybmFsLnByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpKCRQcm9taXNlLnByb3RvdHlwZSwge1xuICAgIC8vIDI1LjQuNS4zIFByb21pc2UucHJvdG90eXBlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgICAgdmFyIHJlYWN0aW9uID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoc3BlY2llc0NvbnN0cnVjdG9yKHRoaXMsICRQcm9taXNlKSk7XG4gICAgICByZWFjdGlvbi5vayA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiB0cnVlO1xuICAgICAgcmVhY3Rpb24uZmFpbCA9IHR5cGVvZiBvblJlamVjdGVkID09ICdmdW5jdGlvbicgJiYgb25SZWplY3RlZDtcbiAgICAgIHJlYWN0aW9uLmRvbWFpbiA9IGlzTm9kZSA/IHByb2Nlc3MuZG9tYWluIDogdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fYy5wdXNoKHJlYWN0aW9uKTtcbiAgICAgIGlmICh0aGlzLl9hKSB0aGlzLl9hLnB1c2gocmVhY3Rpb24pO1xuICAgICAgaWYgKHRoaXMuX3MpIG5vdGlmeSh0aGlzLCBmYWxzZSk7XG4gICAgICByZXR1cm4gcmVhY3Rpb24ucHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gIH0pO1xuICBPd25Qcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBJbnRlcm5hbCgpO1xuICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gICAgdGhpcy5yZXNvbHZlID0gY3R4KCRyZXNvbHZlLCBwcm9taXNlLCAxKTtcbiAgICB0aGlzLnJlamVjdCA9IGN0eCgkcmVqZWN0LCBwcm9taXNlLCAxKTtcbiAgfTtcbiAgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZiA9IG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKEMpIHtcbiAgICByZXR1cm4gQyA9PT0gJFByb21pc2UgfHwgQyA9PT0gV3JhcHBlclxuICAgICAgPyBuZXcgT3duUHJvbWlzZUNhcGFiaWxpdHkoQylcbiAgICAgIDogbmV3R2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5KEMpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7IFByb21pc2U6ICRQcm9taXNlIH0pO1xucmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKSgkUHJvbWlzZSwgUFJPTUlTRSk7XG5yZXF1aXJlKCcuL19zZXQtc3BlY2llcycpKFBST01JU0UpO1xuV3JhcHBlciA9IHJlcXVpcmUoJy4vX2NvcmUnKVtQUk9NSVNFXTtcblxuLy8gc3RhdGljc1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxuICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyKSB7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eSh0aGlzKTtcbiAgICB2YXIgJCRyZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAkJHJlamVjdChyKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKExJQlJBUlkgfHwgIVVTRV9OQVRJVkUpLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKHgpIHtcbiAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoTElCUkFSWSAmJiB0aGlzID09PSBXcmFwcGVyID8gJFByb21pc2UgOiB0aGlzLCB4KTtcbiAgfVxufSk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICEoVVNFX05BVElWRSAmJiByZXF1aXJlKCcuL19pdGVyLWRldGVjdCcpKGZ1bmN0aW9uIChpdGVyKSB7XG4gICRQcm9taXNlLmFsbChpdGVyKVsnY2F0Y2gnXShlbXB0eSk7XG59KSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXG4gIGFsbDogZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKSB7XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICB2YXIgcmVtYWluaW5nID0gMTtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgdmFyICRpbmRleCA9IGluZGV4Kys7XG4gICAgICAgIHZhciBhbHJlYWR5Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAoYWxyZWFkeUNhbGxlZCkgcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgIHZhbHVlc1skaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5lKSByZWplY3QocmVzdWx0LnYpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH0sXG4gIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSkge1xuICAgIHZhciBDID0gdGhpcztcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICB2YXIgcmVzdWx0ID0gcGVyZm9ybShmdW5jdGlvbiAoKSB7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGNhcGFiaWxpdHkucmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQuZSkgcmVqZWN0KHJlc3VsdC52KTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkYXQgPSByZXF1aXJlKCcuL19zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbiAoaXRlcmF0ZWQpIHtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgTyA9IHRoaXMuX3Q7XG4gIHZhciBpbmRleCA9IHRoaXMuX2k7XG4gIHZhciBwb2ludDtcbiAgaWYgKGluZGV4ID49IE8ubGVuZ3RoKSByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7IHZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2UgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKTtcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIE1FVEEgPSByZXF1aXJlKCcuL19tZXRhJykuS0VZO1xudmFyICRmYWlscyA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIHdrcyA9IHJlcXVpcmUoJy4vX3drcycpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciB3a3NEZWZpbmUgPSByZXF1aXJlKCcuL193a3MtZGVmaW5lJyk7XG52YXIgZW51bUtleXMgPSByZXF1aXJlKCcuL19lbnVtLWtleXMnKTtcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi9faXMtYXJyYXknKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciBfY3JlYXRlID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpO1xudmFyIGdPUE5FeHQgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbi1leHQnKTtcbnZhciAkR09QRCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BkJyk7XG52YXIgJERQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xudmFyIGdPUEQgPSAkR09QRC5mO1xudmFyIGRQID0gJERQLmY7XG52YXIgZ09QTiA9IGdPUE5FeHQuZjtcbnZhciAkU3ltYm9sID0gZ2xvYmFsLlN5bWJvbDtcbnZhciAkSlNPTiA9IGdsb2JhbC5KU09OO1xudmFyIF9zdHJpbmdpZnkgPSAkSlNPTiAmJiAkSlNPTi5zdHJpbmdpZnk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgSElEREVOID0gd2tzKCdfaGlkZGVuJyk7XG52YXIgVE9fUFJJTUlUSVZFID0gd2tzKCd0b1ByaW1pdGl2ZScpO1xudmFyIGlzRW51bSA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xudmFyIFN5bWJvbFJlZ2lzdHJ5ID0gc2hhcmVkKCdzeW1ib2wtcmVnaXN0cnknKTtcbnZhciBBbGxTeW1ib2xzID0gc2hhcmVkKCdzeW1ib2xzJyk7XG52YXIgT1BTeW1ib2xzID0gc2hhcmVkKCdvcC1zeW1ib2xzJyk7XG52YXIgT2JqZWN0UHJvdG8gPSBPYmplY3RbUFJPVE9UWVBFXTtcbnZhciBVU0VfTkFUSVZFID0gdHlwZW9mICRTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcbnZhciBRT2JqZWN0ID0gZ2xvYmFsLlFPYmplY3Q7XG4vLyBEb24ndCB1c2Ugc2V0dGVycyBpbiBRdCBTY3JpcHQsIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8xNzNcbnZhciBzZXR0ZXIgPSAhUU9iamVjdCB8fCAhUU9iamVjdFtQUk9UT1RZUEVdIHx8ICFRT2JqZWN0W1BST1RPVFlQRV0uZmluZENoaWxkO1xuXG4vLyBmYWxsYmFjayBmb3Igb2xkIEFuZHJvaWQsIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD02ODdcbnZhciBzZXRTeW1ib2xEZXNjID0gREVTQ1JJUFRPUlMgJiYgJGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIF9jcmVhdGUoZFAoe30sICdhJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZFAodGhpcywgJ2EnLCB7IHZhbHVlOiA3IH0pLmE7IH1cbiAgfSkpLmEgIT0gNztcbn0pID8gZnVuY3Rpb24gKGl0LCBrZXksIEQpIHtcbiAgdmFyIHByb3RvRGVzYyA9IGdPUEQoT2JqZWN0UHJvdG8sIGtleSk7XG4gIGlmIChwcm90b0Rlc2MpIGRlbGV0ZSBPYmplY3RQcm90b1trZXldO1xuICBkUChpdCwga2V5LCBEKTtcbiAgaWYgKHByb3RvRGVzYyAmJiBpdCAhPT0gT2JqZWN0UHJvdG8pIGRQKE9iamVjdFByb3RvLCBrZXksIHByb3RvRGVzYyk7XG59IDogZFA7XG5cbnZhciB3cmFwID0gZnVuY3Rpb24gKHRhZykge1xuICB2YXIgc3ltID0gQWxsU3ltYm9sc1t0YWddID0gX2NyZWF0ZSgkU3ltYm9sW1BST1RPVFlQRV0pO1xuICBzeW0uX2sgPSB0YWc7XG4gIHJldHVybiBzeW07XG59O1xuXG52YXIgaXNTeW1ib2wgPSBVU0VfTkFUSVZFICYmIHR5cGVvZiAkU3ltYm9sLml0ZXJhdG9yID09ICdzeW1ib2wnID8gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCc7XG59IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCBpbnN0YW5jZW9mICRTeW1ib2w7XG59O1xuXG52YXIgJGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCkge1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvKSAkZGVmaW5lUHJvcGVydHkoT1BTeW1ib2xzLCBrZXksIEQpO1xuICBhbk9iamVjdChpdCk7XG4gIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEQpO1xuICBpZiAoaGFzKEFsbFN5bWJvbHMsIGtleSkpIHtcbiAgICBpZiAoIUQuZW51bWVyYWJsZSkge1xuICAgICAgaWYgKCFoYXMoaXQsIEhJRERFTikpIGRQKGl0LCBISURERU4sIGNyZWF0ZURlc2MoMSwge30pKTtcbiAgICAgIGl0W0hJRERFTl1ba2V5XSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSBpdFtISURERU5dW2tleV0gPSBmYWxzZTtcbiAgICAgIEQgPSBfY3JlYXRlKEQsIHsgZW51bWVyYWJsZTogY3JlYXRlRGVzYygwLCBmYWxzZSkgfSk7XG4gICAgfSByZXR1cm4gc2V0U3ltYm9sRGVzYyhpdCwga2V5LCBEKTtcbiAgfSByZXR1cm4gZFAoaXQsIGtleSwgRCk7XG59O1xudmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCkge1xuICBhbk9iamVjdChpdCk7XG4gIHZhciBrZXlzID0gZW51bUtleXMoUCA9IHRvSU9iamVjdChQKSk7XG4gIHZhciBpID0gMDtcbiAgdmFyIGwgPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKGwgPiBpKSAkZGVmaW5lUHJvcGVydHkoaXQsIGtleSA9IGtleXNbaSsrXSwgUFtrZXldKTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciAkY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGl0LCBQKSB7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyBfY3JlYXRlKGl0KSA6ICRkZWZpbmVQcm9wZXJ0aWVzKF9jcmVhdGUoaXQpLCBQKTtcbn07XG52YXIgJHByb3BlcnR5SXNFbnVtZXJhYmxlID0gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KSB7XG4gIHZhciBFID0gaXNFbnVtLmNhbGwodGhpcywga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKSk7XG4gIGlmICh0aGlzID09PSBPYmplY3RQcm90byAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhaGFzKE9QU3ltYm9scywga2V5KSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gRSB8fCAhaGFzKHRoaXMsIGtleSkgfHwgIWhhcyhBbGxTeW1ib2xzLCBrZXkpIHx8IGhhcyh0aGlzLCBISURERU4pICYmIHRoaXNbSElEREVOXVtrZXldID8gRSA6IHRydWU7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSkge1xuICBpdCA9IHRvSU9iamVjdChpdCk7XG4gIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSk7XG4gIGlmIChpdCA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybjtcbiAgdmFyIEQgPSBnT1BEKGl0LCBrZXkpO1xuICBpZiAoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKSBELmVudW1lcmFibGUgPSB0cnVlO1xuICByZXR1cm4gRDtcbn07XG52YXIgJGdldE93blByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHZhciBuYW1lcyA9IGdPUE4odG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmICghaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4gJiYga2V5ICE9IE1FVEEpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgJGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCkge1xuICB2YXIgSVNfT1AgPSBpdCA9PT0gT2JqZWN0UHJvdG87XG4gIHZhciBuYW1lcyA9IGdPUE4oSVNfT1AgPyBPUFN5bWJvbHMgOiB0b0lPYmplY3QoaXQpKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaSA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSB7XG4gICAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiAoSVNfT1AgPyBoYXMoT2JqZWN0UHJvdG8sIGtleSkgOiB0cnVlKSkgcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXG5pZiAoIVVTRV9OQVRJVkUpIHtcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbCgpIHtcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mICRTeW1ib2wpIHRocm93IFR5cGVFcnJvcignU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yIScpO1xuICAgIHZhciB0YWcgPSB1aWQoYXJndW1lbnRzLmxlbmd0aCA+IDAgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQpO1xuICAgIHZhciAkc2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8pICRzZXQuY2FsbChPUFN5bWJvbHMsIHZhbHVlKTtcbiAgICAgIGlmIChoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKSB0aGlzW0hJRERFTl1bdGFnXSA9IGZhbHNlO1xuICAgICAgc2V0U3ltYm9sRGVzYyh0aGlzLCB0YWcsIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbiAgICB9O1xuICAgIGlmIChERVNDUklQVE9SUyAmJiBzZXR0ZXIpIHNldFN5bWJvbERlc2MoT2JqZWN0UHJvdG8sIHRhZywgeyBjb25maWd1cmFibGU6IHRydWUsIHNldDogJHNldCB9KTtcbiAgICByZXR1cm4gd3JhcCh0YWcpO1xuICB9O1xuICByZWRlZmluZSgkU3ltYm9sW1BST1RPVFlQRV0sICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9rO1xuICB9KTtcblxuICAkR09QRC5mID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgJERQLmYgPSAkZGVmaW5lUHJvcGVydHk7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZiA9IGdPUE5FeHQuZiA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICByZXF1aXJlKCcuL19vYmplY3QtcGllJykuZiA9ICRwcm9wZXJ0eUlzRW51bWVyYWJsZTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKS5mID0gJGdldE93blByb3BlcnR5U3ltYm9scztcblxuICBpZiAoREVTQ1JJUFRPUlMgJiYgIXJlcXVpcmUoJy4vX2xpYnJhcnknKSkge1xuICAgIHJlZGVmaW5lKE9iamVjdFByb3RvLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCAkcHJvcGVydHlJc0VudW1lcmFibGUsIHRydWUpO1xuICB9XG5cbiAgd2tzRXh0LmYgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB3cmFwKHdrcyhuYW1lKSk7XG4gIH07XG59XG5cbiRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsIHsgU3ltYm9sOiAkU3ltYm9sIH0pO1xuXG5mb3IgKHZhciBlczZTeW1ib2xzID0gKFxuICAvLyAxOS40LjIuMiwgMTkuNC4yLjMsIDE5LjQuMi40LCAxOS40LjIuNiwgMTkuNC4yLjgsIDE5LjQuMi45LCAxOS40LjIuMTAsIDE5LjQuMi4xMSwgMTkuNC4yLjEyLCAxOS40LjIuMTMsIDE5LjQuMi4xNFxuICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLHNwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXG4pLnNwbGl0KCcsJyksIGogPSAwOyBlczZTeW1ib2xzLmxlbmd0aCA+IGo7KXdrcyhlczZTeW1ib2xzW2orK10pO1xuXG5mb3IgKHZhciB3ZWxsS25vd25TeW1ib2xzID0gJGtleXMod2tzLnN0b3JlKSwgayA9IDA7IHdlbGxLbm93blN5bWJvbHMubGVuZ3RoID4gazspIHdrc0RlZmluZSh3ZWxsS25vd25TeW1ib2xzW2srK10pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnU3ltYm9sJywge1xuICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcbiAgJ2Zvcic6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXG4gICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cbiAgICAgIDogU3ltYm9sUmVnaXN0cnlba2V5XSA9ICRTeW1ib2woa2V5KTtcbiAgfSxcbiAgLy8gMTkuNC4yLjUgU3ltYm9sLmtleUZvcihzeW0pXG4gIGtleUZvcjogZnVuY3Rpb24ga2V5Rm9yKHN5bSkge1xuICAgIGlmICghaXNTeW1ib2woc3ltKSkgdGhyb3cgVHlwZUVycm9yKHN5bSArICcgaXMgbm90IGEgc3ltYm9sIScpO1xuICAgIGZvciAodmFyIGtleSBpbiBTeW1ib2xSZWdpc3RyeSkgaWYgKFN5bWJvbFJlZ2lzdHJ5W2tleV0gPT09IHN5bSkgcmV0dXJuIGtleTtcbiAgfSxcbiAgdXNlU2V0dGVyOiBmdW5jdGlvbiAoKSB7IHNldHRlciA9IHRydWU7IH0sXG4gIHVzZVNpbXBsZTogZnVuY3Rpb24gKCkgeyBzZXR0ZXIgPSBmYWxzZTsgfVxufSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi4yIE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiAkY3JlYXRlLFxuICAvLyAxOS4xLjIuNCBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6ICRkZWZpbmVQcm9wZXJ0eSxcbiAgLy8gMTkuMS4yLjMgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcbiAgZGVmaW5lUHJvcGVydGllczogJGRlZmluZVByb3BlcnRpZXMsXG4gIC8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHNcbn0pO1xuXG4vLyAyNC4zLjIgSlNPTi5zdHJpbmdpZnkodmFsdWUgWywgcmVwbGFjZXIgWywgc3BhY2VdXSlcbiRKU09OICYmICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKCFVU0VfTkFUSVZFIHx8ICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHZhciBTID0gJFN5bWJvbCgpO1xuICAvLyBNUyBFZGdlIGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyB7fVxuICAvLyBXZWJLaXQgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIG51bGxcbiAgLy8gVjggdGhyb3dzIG9uIGJveGVkIHN5bWJvbHNcbiAgcmV0dXJuIF9zdHJpbmdpZnkoW1NdKSAhPSAnW251bGxdJyB8fCBfc3RyaW5naWZ5KHsgYTogUyB9KSAhPSAne30nIHx8IF9zdHJpbmdpZnkoT2JqZWN0KFMpKSAhPSAne30nO1xufSkpLCAnSlNPTicsIHtcbiAgc3RyaW5naWZ5OiBmdW5jdGlvbiBzdHJpbmdpZnkoaXQpIHtcbiAgICB2YXIgYXJncyA9IFtpdF07XG4gICAgdmFyIGkgPSAxO1xuICAgIHZhciByZXBsYWNlciwgJHJlcGxhY2VyO1xuICAgIHdoaWxlIChhcmd1bWVudHMubGVuZ3RoID4gaSkgYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICAkcmVwbGFjZXIgPSByZXBsYWNlciA9IGFyZ3NbMV07XG4gICAgaWYgKCFpc09iamVjdChyZXBsYWNlcikgJiYgaXQgPT09IHVuZGVmaW5lZCB8fCBpc1N5bWJvbChpdCkpIHJldHVybjsgLy8gSUU4IHJldHVybnMgc3RyaW5nIG9uIHVuZGVmaW5lZFxuICAgIGlmICghaXNBcnJheShyZXBsYWNlcikpIHJlcGxhY2VyID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2YgJHJlcGxhY2VyID09ICdmdW5jdGlvbicpIHZhbHVlID0gJHJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWx1ZSk7XG4gICAgICBpZiAoIWlzU3ltYm9sKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gICAgYXJnc1sxXSA9IHJlcGxhY2VyO1xuICAgIHJldHVybiBfc3RyaW5naWZ5LmFwcGx5KCRKU09OLCBhcmdzKTtcbiAgfVxufSk7XG5cbi8vIDE5LjQuMy40IFN5bWJvbC5wcm90b3R5cGVbQEB0b1ByaW1pdGl2ZV0oaGludClcbiRTeW1ib2xbUFJPVE9UWVBFXVtUT19QUklNSVRJVkVdIHx8IHJlcXVpcmUoJy4vX2hpZGUnKSgkU3ltYm9sW1BST1RPVFlQRV0sIFRPX1BSSU1JVElWRSwgJFN5bWJvbFtQUk9UT1RZUEVdLnZhbHVlT2YpO1xuLy8gMTkuNC4zLjUgU3ltYm9sLnByb3RvdHlwZVtAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoJFN5bWJvbCwgJ1N5bWJvbCcpO1xuLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoTWF0aCwgJ01hdGgnLCB0cnVlKTtcbi8vIDI0LjMuMyBKU09OW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhnbG9iYWwuSlNPTiwgJ0pTT04nLCB0cnVlKTtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLXByb21pc2UtZmluYWxseVxuJ3VzZSBzdHJpY3QnO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vX3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciBwcm9taXNlUmVzb2x2ZSA9IHJlcXVpcmUoJy4vX3Byb21pc2UtcmVzb2x2ZScpO1xuXG4kZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuUiwgJ1Byb21pc2UnLCB7ICdmaW5hbGx5JzogZnVuY3Rpb24gKG9uRmluYWxseSkge1xuICB2YXIgQyA9IHNwZWNpZXNDb25zdHJ1Y3Rvcih0aGlzLCBjb3JlLlByb21pc2UgfHwgZ2xvYmFsLlByb21pc2UpO1xuICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiBvbkZpbmFsbHkgPT0gJ2Z1bmN0aW9uJztcbiAgcmV0dXJuIHRoaXMudGhlbihcbiAgICBpc0Z1bmN0aW9uID8gZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZShDLCBvbkZpbmFsbHkoKSkudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiB4OyB9KTtcbiAgICB9IDogb25GaW5hbGx5LFxuICAgIGlzRnVuY3Rpb24gPyBmdW5jdGlvbiAoZSkge1xuICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlKEMsIG9uRmluYWxseSgpKS50aGVuKGZ1bmN0aW9uICgpIHsgdGhyb3cgZTsgfSk7XG4gICAgfSA6IG9uRmluYWxseVxuICApO1xufSB9KTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLXByb21pc2UtdHJ5XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gcmVxdWlyZSgnLi9fbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuL19wZXJmb3JtJyk7XG5cbiRleHBvcnQoJGV4cG9ydC5TLCAnUHJvbWlzZScsIHsgJ3RyeSc6IGZ1bmN0aW9uIChjYWxsYmFja2ZuKSB7XG4gIHZhciBwcm9taXNlQ2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5LmYodGhpcyk7XG4gIHZhciByZXN1bHQgPSBwZXJmb3JtKGNhbGxiYWNrZm4pO1xuICAocmVzdWx0LmUgPyBwcm9taXNlQ2FwYWJpbGl0eS5yZWplY3QgOiBwcm9taXNlQ2FwYWJpbGl0eS5yZXNvbHZlKShyZXN1bHQudik7XG4gIHJldHVybiBwcm9taXNlQ2FwYWJpbGl0eS5wcm9taXNlO1xufSB9KTtcbiIsInJlcXVpcmUoJy4vX3drcy1kZWZpbmUnKSgnYXN5bmNJdGVyYXRvcicpO1xuIiwicmVxdWlyZSgnLi9fd2tzLWRlZmluZScpKCdvYnNlcnZhYmxlJyk7XG4iLCJyZXF1aXJlKCcuL2VzNi5hcnJheS5pdGVyYXRvcicpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG52YXIgVE9fU1RSSU5HX1RBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG52YXIgRE9NSXRlcmFibGVzID0gKCdDU1NSdWxlTGlzdCxDU1NTdHlsZURlY2xhcmF0aW9uLENTU1ZhbHVlTGlzdCxDbGllbnRSZWN0TGlzdCxET01SZWN0TGlzdCxET01TdHJpbmdMaXN0LCcgK1xuICAnRE9NVG9rZW5MaXN0LERhdGFUcmFuc2Zlckl0ZW1MaXN0LEZpbGVMaXN0LEhUTUxBbGxDb2xsZWN0aW9uLEhUTUxDb2xsZWN0aW9uLEhUTUxGb3JtRWxlbWVudCxIVE1MU2VsZWN0RWxlbWVudCwnICtcbiAgJ01lZGlhTGlzdCxNaW1lVHlwZUFycmF5LE5hbWVkTm9kZU1hcCxOb2RlTGlzdCxQYWludFJlcXVlc3RMaXN0LFBsdWdpbixQbHVnaW5BcnJheSxTVkdMZW5ndGhMaXN0LFNWR051bWJlckxpc3QsJyArXG4gICdTVkdQYXRoU2VnTGlzdCxTVkdQb2ludExpc3QsU1ZHU3RyaW5nTGlzdCxTVkdUcmFuc2Zvcm1MaXN0LFNvdXJjZUJ1ZmZlckxpc3QsU3R5bGVTaGVldExpc3QsVGV4dFRyYWNrQ3VlTGlzdCwnICtcbiAgJ1RleHRUcmFja0xpc3QsVG91Y2hMaXN0Jykuc3BsaXQoJywnKTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCBET01JdGVyYWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgdmFyIE5BTUUgPSBET01JdGVyYWJsZXNbaV07XG4gIHZhciBDb2xsZWN0aW9uID0gZ2xvYmFsW05BTUVdO1xuICB2YXIgcHJvdG8gPSBDb2xsZWN0aW9uICYmIENvbGxlY3Rpb24ucHJvdG90eXBlO1xuICBpZiAocHJvdG8gJiYgIXByb3RvW1RPX1NUUklOR19UQUddKSBoaWRlKHByb3RvLCBUT19TVFJJTkdfVEFHLCBOQU1FKTtcbiAgSXRlcmF0b3JzW05BTUVdID0gSXRlcmF0b3JzLkFycmF5O1xufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vLyBUaGlzIG1ldGhvZCBvZiBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QgbmVlZHMgdG8gYmVcbi8vIGtlcHQgaWRlbnRpY2FsIHRvIHRoZSB3YXkgaXQgaXMgb2J0YWluZWQgaW4gcnVudGltZS5qc1xudmFyIGcgPSAoZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzIH0pKCkgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpO1xuXG4vLyBVc2UgYGdldE93blByb3BlcnR5TmFtZXNgIGJlY2F1c2Ugbm90IGFsbCBicm93c2VycyBzdXBwb3J0IGNhbGxpbmdcbi8vIGBoYXNPd25Qcm9wZXJ0eWAgb24gdGhlIGdsb2JhbCBgc2VsZmAgb2JqZWN0IGluIGEgd29ya2VyLiBTZWUgIzE4My5cbnZhciBoYWRSdW50aW1lID0gZy5yZWdlbmVyYXRvclJ1bnRpbWUgJiZcbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZykuaW5kZXhPZihcInJlZ2VuZXJhdG9yUnVudGltZVwiKSA+PSAwO1xuXG4vLyBTYXZlIHRoZSBvbGQgcmVnZW5lcmF0b3JSdW50aW1lIGluIGNhc2UgaXQgbmVlZHMgdG8gYmUgcmVzdG9yZWQgbGF0ZXIuXG52YXIgb2xkUnVudGltZSA9IGhhZFJ1bnRpbWUgJiYgZy5yZWdlbmVyYXRvclJ1bnRpbWU7XG5cbi8vIEZvcmNlIHJlZXZhbHV0YXRpb24gb2YgcnVudGltZS5qcy5cbmcucmVnZW5lcmF0b3JSdW50aW1lID0gdW5kZWZpbmVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3J1bnRpbWVcIik7XG5cbmlmIChoYWRSdW50aW1lKSB7XG4gIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHJ1bnRpbWUuXG4gIGcucmVnZW5lcmF0b3JSdW50aW1lID0gb2xkUnVudGltZTtcbn0gZWxzZSB7XG4gIC8vIFJlbW92ZSB0aGUgZ2xvYmFsIHByb3BlcnR5IGFkZGVkIGJ5IHJ1bnRpbWUuanMuXG4gIHRyeSB7XG4gICAgZGVsZXRlIGcucmVnZW5lcmF0b3JSdW50aW1lO1xuICB9IGNhdGNoKGUpIHtcbiAgICBnLnJlZ2VuZXJhdG9yUnVudGltZSA9IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4hKGZ1bmN0aW9uKGdsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIHZhciBpbk1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCI7XG4gIHZhciBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgaWYgKHJ1bnRpbWUpIHtcbiAgICBpZiAoaW5Nb2R1bGUpIHtcbiAgICAgIC8vIElmIHJlZ2VuZXJhdG9yUnVudGltZSBpcyBkZWZpbmVkIGdsb2JhbGx5IGFuZCB3ZSdyZSBpbiBhIG1vZHVsZSxcbiAgICAgIC8vIG1ha2UgdGhlIGV4cG9ydHMgb2JqZWN0IGlkZW50aWNhbCB0byByZWdlbmVyYXRvclJ1bnRpbWUuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IHJ1bnRpbWU7XG4gICAgfVxuICAgIC8vIERvbid0IGJvdGhlciBldmFsdWF0aW5nIHRoZSByZXN0IG9mIHRoaXMgZmlsZSBpZiB0aGUgcnVudGltZSB3YXNcbiAgICAvLyBhbHJlYWR5IGRlZmluZWQgZ2xvYmFsbHkuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRGVmaW5lIHRoZSBydW50aW1lIGdsb2JhbGx5IChhcyBleHBlY3RlZCBieSBnZW5lcmF0ZWQgY29kZSkgYXMgZWl0aGVyXG4gIC8vIG1vZHVsZS5leHBvcnRzIChpZiB3ZSdyZSBpbiBhIG1vZHVsZSkgb3IgYSBuZXcsIGVtcHR5IG9iamVjdC5cbiAgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWUgPSBpbk1vZHVsZSA/IG1vZHVsZS5leHBvcnRzIDoge307XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgcnVudGltZS53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgSXRlcmF0b3JQcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGVbdG9TdHJpbmdUYWdTeW1ib2xdID1cbiAgICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBwcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBydW50aW1lLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGlmICghKHRvU3RyaW5nVGFnU3ltYm9sIGluIGdlbkZ1bikpIHtcbiAgICAgICAgZ2VuRnVuW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgcnVudGltZS5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uIElmIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkLCBob3dldmVyLCB0aGVcbiAgICAgICAgICAvLyByZXN1bHQgZm9yIHRoaXMgaXRlcmF0aW9uIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCB0aGUgc2FtZVxuICAgICAgICAgIC8vIHJlYXNvbi4gTm90ZSB0aGF0IHJlamVjdGlvbnMgb2YgeWllbGRlZCBQcm9taXNlcyBhcmUgbm90XG4gICAgICAgICAgLy8gdGhyb3duIGJhY2sgaW50byB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uLCBhcyBpcyB0aGUgY2FzZVxuICAgICAgICAgIC8vIHdoZW4gYW4gYXdhaXRlZCBQcm9taXNlIGlzIHJlamVjdGVkLiBUaGlzIGRpZmZlcmVuY2UgaW5cbiAgICAgICAgICAvLyBiZWhhdmlvciBiZXR3ZWVuIHlpZWxkIGFuZCBhd2FpdCBpcyBpbXBvcnRhbnQsIGJlY2F1c2UgaXRcbiAgICAgICAgICAvLyBhbGxvd3MgdGhlIGNvbnN1bWVyIHRvIGRlY2lkZSB3aGF0IHRvIGRvIHdpdGggdGhlIHlpZWxkZWRcbiAgICAgICAgICAvLyByZWplY3Rpb24gKHN3YWxsb3cgaXQgYW5kIGNvbnRpbnVlLCBtYW51YWxseSAudGhyb3cgaXQgYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGdlbmVyYXRvciwgYWJhbmRvbiBpdGVyYXRpb24sIHdoYXRldmVyKS4gV2l0aFxuICAgICAgICAgIC8vIGF3YWl0LCBieSBjb250cmFzdCwgdGhlcmUgaXMgbm8gb3Bwb3J0dW5pdHkgdG8gZXhhbWluZSB0aGVcbiAgICAgICAgICAvLyByZWplY3Rpb24gcmVhc29uIG91dHNpZGUgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgc28gdGhlXG4gICAgICAgICAgLy8gb25seSBvcHRpb24gaXMgdG8gdGhyb3cgaXQgZnJvbSB0aGUgYXdhaXQgZXhwcmVzc2lvbiwgYW5kXG4gICAgICAgICAgLy8gbGV0IHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24gaGFuZGxlIHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBydW50aW1lLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdClcbiAgICApO1xuXG4gICAgcmV0dXJuIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBHcFt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvclwiO1xuXG4gIC8vIEEgR2VuZXJhdG9yIHNob3VsZCBhbHdheXMgcmV0dXJuIGl0c2VsZiBhcyB0aGUgaXRlcmF0b3Igb2JqZWN0IHdoZW4gdGhlXG4gIC8vIEBAaXRlcmF0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIG9uIGl0LiBTb21lIGJyb3dzZXJzJyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlXG4gIC8vIGl0ZXJhdG9yIHByb3RvdHlwZSBjaGFpbiBpbmNvcnJlY3RseSBpbXBsZW1lbnQgdGhpcywgY2F1c2luZyB0aGUgR2VuZXJhdG9yXG4gIC8vIG9iamVjdCB0byBub3QgYmUgcmV0dXJuZWQgZnJvbSB0aGlzIGNhbGwuIFRoaXMgZW5zdXJlcyB0aGF0IGRvZXNuJ3QgaGFwcGVuLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL2lzc3Vlcy8yNzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIHJ1bnRpbWUua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBydW50aW1lLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG5cbiAgICAgICAgaWYgKGNhdWdodCkge1xuICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICEhIGNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gdGhpcy5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xufSkoXG4gIC8vIEluIHNsb3BweSBtb2RlLCB1bmJvdW5kIGB0aGlzYCByZWZlcnMgdG8gdGhlIGdsb2JhbCBvYmplY3QsIGZhbGxiYWNrIHRvXG4gIC8vIEZ1bmN0aW9uIGNvbnN0cnVjdG9yIGlmIHdlJ3JlIGluIGdsb2JhbCBzdHJpY3QgbW9kZS4gVGhhdCBpcyBzYWRseSBhIGZvcm1cbiAgLy8gb2YgaW5kaXJlY3QgZXZhbCB3aGljaCB2aW9sYXRlcyBDb250ZW50IFNlY3VyaXR5IFBvbGljeS5cbiAgKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyB9KSgpIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKVxuKTtcbiIsIiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gU0RQIGhlbHBlcnMuXG52YXIgU0RQVXRpbHMgPSB7fTtcblxuLy8gR2VuZXJhdGUgYW4gYWxwaGFudW1lcmljIGlkZW50aWZpZXIgZm9yIGNuYW1lIG9yIG1pZHMuXG4vLyBUT0RPOiB1c2UgVVVJRHMgaW5zdGVhZD8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVkLzk4Mjg4M1xuU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgMTApO1xufTtcblxuLy8gVGhlIFJUQ1AgQ05BTUUgdXNlZCBieSBhbGwgcGVlcmNvbm5lY3Rpb25zIGZyb20gdGhlIHNhbWUgSlMuXG5TRFBVdGlscy5sb2NhbENOYW1lID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG5cbi8vIFNwbGl0cyBTRFAgaW50byBsaW5lcywgZGVhbGluZyB3aXRoIGJvdGggQ1JMRiBhbmQgTEYuXG5TRFBVdGlscy5zcGxpdExpbmVzID0gZnVuY3Rpb24oYmxvYikge1xuICByZXR1cm4gYmxvYi50cmltKCkuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUudHJpbSgpO1xuICB9KTtcbn07XG4vLyBTcGxpdHMgU0RQIGludG8gc2Vzc2lvbnBhcnQgYW5kIG1lZGlhc2VjdGlvbnMuIEVuc3VyZXMgQ1JMRi5cblNEUFV0aWxzLnNwbGl0U2VjdGlvbnMgPSBmdW5jdGlvbihibG9iKSB7XG4gIHZhciBwYXJ0cyA9IGJsb2Iuc3BsaXQoJ1xcbm09Jyk7XG4gIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCwgaW5kZXgpIHtcbiAgICByZXR1cm4gKGluZGV4ID4gMCA/ICdtPScgKyBwYXJ0IDogcGFydCkudHJpbSgpICsgJ1xcclxcbic7XG4gIH0pO1xufTtcblxuLy8gUmV0dXJucyBsaW5lcyB0aGF0IHN0YXJ0IHdpdGggYSBjZXJ0YWluIHByZWZpeC5cblNEUFV0aWxzLm1hdGNoUHJlZml4ID0gZnVuY3Rpb24oYmxvYiwgcHJlZml4KSB7XG4gIHJldHVybiBTRFBVdGlscy5zcGxpdExpbmVzKGJsb2IpLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUuaW5kZXhPZihwcmVmaXgpID09PSAwO1xuICB9KTtcbn07XG5cbi8vIFBhcnNlcyBhbiBJQ0UgY2FuZGlkYXRlIGxpbmUuIFNhbXBsZSBpbnB1dDpcbi8vIGNhbmRpZGF0ZTo3MDI3ODYzNTAgMiB1ZHAgNDE4MTk5MDIgOC44LjguOCA2MDc2OSB0eXAgcmVsYXkgcmFkZHIgOC44LjguOFxuLy8gcnBvcnQgNTU5OTZcIlxuU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cztcbiAgLy8gUGFyc2UgYm90aCB2YXJpYW50cy5cbiAgaWYgKGxpbmUuaW5kZXhPZignYT1jYW5kaWRhdGU6JykgPT09IDApIHtcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEyKS5zcGxpdCgnICcpO1xuICB9IGVsc2Uge1xuICAgIHBhcnRzID0gbGluZS5zdWJzdHJpbmcoMTApLnNwbGl0KCcgJyk7XG4gIH1cblxuICB2YXIgY2FuZGlkYXRlID0ge1xuICAgIGZvdW5kYXRpb246IHBhcnRzWzBdLFxuICAgIGNvbXBvbmVudDogcGFydHNbMV0sXG4gICAgcHJvdG9jb2w6IHBhcnRzWzJdLnRvTG93ZXJDYXNlKCksXG4gICAgcHJpb3JpdHk6IHBhcnNlSW50KHBhcnRzWzNdLCAxMCksXG4gICAgaXA6IHBhcnRzWzRdLFxuICAgIHBvcnQ6IHBhcnNlSW50KHBhcnRzWzVdLCAxMCksXG4gICAgLy8gc2tpcCBwYXJ0c1s2XSA9PSAndHlwJ1xuICAgIHR5cGU6IHBhcnRzWzddXG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHN3aXRjaCAocGFydHNbaV0pIHtcbiAgICAgIGNhc2UgJ3JhZGRyJzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jwb3J0JzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRQb3J0ID0gcGFyc2VJbnQocGFydHNbaSArIDFdLCAxMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndGNwdHlwZSc6XG4gICAgICAgIGNhbmRpZGF0ZS50Y3BUeXBlID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vIGV4dGVuc2lvbiBoYW5kbGluZywgaW4gcGFydGljdWxhciB1ZnJhZ1xuICAgICAgICBjYW5kaWRhdGVbcGFydHNbaV1dID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZTtcbn07XG5cbi8vIFRyYW5zbGF0ZXMgYSBjYW5kaWRhdGUgb2JqZWN0IGludG8gU0RQIGNhbmRpZGF0ZSBhdHRyaWJ1dGUuXG5TRFBVdGlscy53cml0ZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICB2YXIgc2RwID0gW107XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5mb3VuZGF0aW9uKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmNvbXBvbmVudCk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wcm90b2NvbC50b1VwcGVyQ2FzZSgpKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnByaW9yaXR5KTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmlwKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnBvcnQpO1xuXG4gIHZhciB0eXBlID0gY2FuZGlkYXRlLnR5cGU7XG4gIHNkcC5wdXNoKCd0eXAnKTtcbiAgc2RwLnB1c2godHlwZSk7XG4gIGlmICh0eXBlICE9PSAnaG9zdCcgJiYgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzICYmXG4gICAgICBjYW5kaWRhdGUucmVsYXRlZFBvcnQpIHtcbiAgICBzZHAucHVzaCgncmFkZHInKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MpOyAvLyB3YXM6IHJlbEFkZHJcbiAgICBzZHAucHVzaCgncnBvcnQnKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUucmVsYXRlZFBvcnQpOyAvLyB3YXM6IHJlbFBvcnRcbiAgfVxuICBpZiAoY2FuZGlkYXRlLnRjcFR5cGUgJiYgY2FuZGlkYXRlLnByb3RvY29sLnRvTG93ZXJDYXNlKCkgPT09ICd0Y3AnKSB7XG4gICAgc2RwLnB1c2goJ3RjcHR5cGUnKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUudGNwVHlwZSk7XG4gIH1cbiAgcmV0dXJuICdjYW5kaWRhdGU6JyArIHNkcC5qb2luKCcgJyk7XG59O1xuXG4vLyBQYXJzZXMgYW4gaWNlLW9wdGlvbnMgbGluZSwgcmV0dXJucyBhbiBhcnJheSBvZiBvcHRpb24gdGFncy5cbi8vIGE9aWNlLW9wdGlvbnM6Zm9vIGJhclxuU0RQVXRpbHMucGFyc2VJY2VPcHRpb25zID0gZnVuY3Rpb24obGluZSkge1xuICByZXR1cm4gbGluZS5zdWJzdHIoMTQpLnNwbGl0KCcgJyk7XG59XG5cbi8vIFBhcnNlcyBhbiBydHBtYXAgbGluZSwgcmV0dXJucyBSVENSdHBDb2RkZWNQYXJhbWV0ZXJzLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPXJ0cG1hcDoxMTEgb3B1cy80ODAwMC8yXG5TRFBVdGlscy5wYXJzZVJ0cE1hcCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcbiAgdmFyIHBhcnNlZCA9IHtcbiAgICBwYXlsb2FkVHlwZTogcGFyc2VJbnQocGFydHMuc2hpZnQoKSwgMTApIC8vIHdhczogaWRcbiAgfTtcblxuICBwYXJ0cyA9IHBhcnRzWzBdLnNwbGl0KCcvJyk7XG5cbiAgcGFyc2VkLm5hbWUgPSBwYXJ0c1swXTtcbiAgcGFyc2VkLmNsb2NrUmF0ZSA9IHBhcnNlSW50KHBhcnRzWzFdLCAxMCk7IC8vIHdhczogY2xvY2tyYXRlXG4gIC8vIHdhczogY2hhbm5lbHNcbiAgcGFyc2VkLm51bUNoYW5uZWxzID0gcGFydHMubGVuZ3RoID09PSAzID8gcGFyc2VJbnQocGFydHNbMl0sIDEwKSA6IDE7XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZSBhbiBhPXJ0cG1hcCBsaW5lIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yXG4vLyBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cE1hcCA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgcmV0dXJuICdhPXJ0cG1hcDonICsgcHQgKyAnICcgKyBjb2RlYy5uYW1lICsgJy8nICsgY29kZWMuY2xvY2tSYXRlICtcbiAgICAgIChjb2RlYy5udW1DaGFubmVscyAhPT0gMSA/ICcvJyArIGNvZGVjLm51bUNoYW5uZWxzIDogJycpICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgYW4gYT1leHRtYXAgbGluZSAoaGVhZGVyZXh0ZW5zaW9uIGZyb20gUkZDIDUyODUpLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPWV4dG1hcDoyIHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnRvZmZzZXRcbi8vIGE9ZXh0bWFwOjIvc2VuZG9ubHkgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6dG9mZnNldFxuU0RQVXRpbHMucGFyc2VFeHRtYXAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDkpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgaWQ6IHBhcnNlSW50KHBhcnRzWzBdLCAxMCksXG4gICAgZGlyZWN0aW9uOiBwYXJ0c1swXS5pbmRleE9mKCcvJykgPiAwID8gcGFydHNbMF0uc3BsaXQoJy8nKVsxXSA6ICdzZW5kcmVjdicsXG4gICAgdXJpOiBwYXJ0c1sxXVxuICB9O1xufTtcblxuLy8gR2VuZXJhdGVzIGE9ZXh0bWFwIGxpbmUgZnJvbSBSVENSdHBIZWFkZXJFeHRlbnNpb25QYXJhbWV0ZXJzIG9yXG4vLyBSVENSdHBIZWFkZXJFeHRlbnNpb24uXG5TRFBVdGlscy53cml0ZUV4dG1hcCA9IGZ1bmN0aW9uKGhlYWRlckV4dGVuc2lvbikge1xuICByZXR1cm4gJ2E9ZXh0bWFwOicgKyAoaGVhZGVyRXh0ZW5zaW9uLmlkIHx8IGhlYWRlckV4dGVuc2lvbi5wcmVmZXJyZWRJZCkgK1xuICAgICAgKGhlYWRlckV4dGVuc2lvbi5kaXJlY3Rpb24gJiYgaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvbiAhPT0gJ3NlbmRyZWN2J1xuICAgICAgICAgID8gJy8nICsgaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvblxuICAgICAgICAgIDogJycpICtcbiAgICAgICcgJyArIGhlYWRlckV4dGVuc2lvbi51cmkgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBmdG1wIGxpbmUsIHJldHVybnMgZGljdGlvbmFyeS4gU2FtcGxlIGlucHV0OlxuLy8gYT1mbXRwOjk2IHZicj1vbjtjbmc9b25cbi8vIEFsc28gZGVhbHMgd2l0aCB2YnI9b247IGNuZz1vblxuU0RQVXRpbHMucGFyc2VGbXRwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrdjtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIobGluZS5pbmRleE9mKCcgJykgKyAxKS5zcGxpdCgnOycpO1xuICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAga3YgPSBwYXJ0c1tqXS50cmltKCkuc3BsaXQoJz0nKTtcbiAgICBwYXJzZWRba3ZbMF0udHJpbSgpXSA9IGt2WzFdO1xuICB9XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZXMgYW4gYT1mdG1wIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVGbXRwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIGxpbmUgPSAnJztcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICBpZiAoY29kZWMucGFyYW1ldGVycyAmJiBPYmplY3Qua2V5cyhjb2RlYy5wYXJhbWV0ZXJzKS5sZW5ndGgpIHtcbiAgICB2YXIgcGFyYW1zID0gW107XG4gICAgT2JqZWN0LmtleXMoY29kZWMucGFyYW1ldGVycykuZm9yRWFjaChmdW5jdGlvbihwYXJhbSkge1xuICAgICAgcGFyYW1zLnB1c2gocGFyYW0gKyAnPScgKyBjb2RlYy5wYXJhbWV0ZXJzW3BhcmFtXSk7XG4gICAgfSk7XG4gICAgbGluZSArPSAnYT1mbXRwOicgKyBwdCArICcgJyArIHBhcmFtcy5qb2luKCc7JykgKyAnXFxyXFxuJztcbiAgfVxuICByZXR1cm4gbGluZTtcbn07XG5cbi8vIFBhcnNlcyBhbiBydGNwLWZiIGxpbmUsIHJldHVybnMgUlRDUFJ0Y3BGZWVkYmFjayBvYmplY3QuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRjcC1mYjo5OCBuYWNrIHJwc2lcblNEUFV0aWxzLnBhcnNlUnRjcEZiID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogcGFydHMuc2hpZnQoKSxcbiAgICBwYXJhbWV0ZXI6IHBhcnRzLmpvaW4oJyAnKVxuICB9O1xufTtcbi8vIEdlbmVyYXRlIGE9cnRjcC1mYiBsaW5lcyBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvciBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0Y3BGYiA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBsaW5lcyA9ICcnO1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIGlmIChjb2RlYy5ydGNwRmVlZGJhY2sgJiYgY29kZWMucnRjcEZlZWRiYWNrLmxlbmd0aCkge1xuICAgIC8vIEZJWE1FOiBzcGVjaWFsIGhhbmRsaW5nIGZvciB0cnItaW50P1xuICAgIGNvZGVjLnJ0Y3BGZWVkYmFjay5mb3JFYWNoKGZ1bmN0aW9uKGZiKSB7XG4gICAgICBsaW5lcyArPSAnYT1ydGNwLWZiOicgKyBwdCArICcgJyArIGZiLnR5cGUgK1xuICAgICAgKGZiLnBhcmFtZXRlciAmJiBmYi5wYXJhbWV0ZXIubGVuZ3RoID8gJyAnICsgZmIucGFyYW1ldGVyIDogJycpICtcbiAgICAgICAgICAnXFxyXFxuJztcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbGluZXM7XG59O1xuXG4vLyBQYXJzZXMgYW4gUkZDIDU1NzYgc3NyYyBtZWRpYSBhdHRyaWJ1dGUuIFNhbXBsZSBpbnB1dDpcbi8vIGE9c3NyYzozNzM1OTI4NTU5IGNuYW1lOnNvbWV0aGluZ1xuU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBzcCA9IGxpbmUuaW5kZXhPZignICcpO1xuICB2YXIgcGFydHMgPSB7XG4gICAgc3NyYzogcGFyc2VJbnQobGluZS5zdWJzdHIoNywgc3AgLSA3KSwgMTApXG4gIH07XG4gIHZhciBjb2xvbiA9IGxpbmUuaW5kZXhPZignOicsIHNwKTtcbiAgaWYgKGNvbG9uID4gLTEpIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEsIGNvbG9uIC0gc3AgLSAxKTtcbiAgICBwYXJ0cy52YWx1ZSA9IGxpbmUuc3Vic3RyKGNvbG9uICsgMSk7XG4gIH0gZWxzZSB7XG4gICAgcGFydHMuYXR0cmlidXRlID0gbGluZS5zdWJzdHIoc3AgKyAxKTtcbiAgfVxuICByZXR1cm4gcGFydHM7XG59O1xuXG4vLyBFeHRyYWN0cyB0aGUgTUlEIChSRkMgNTg4OCkgZnJvbSBhIG1lZGlhIHNlY3Rpb24uXG4vLyByZXR1cm5zIHRoZSBNSUQgb3IgdW5kZWZpbmVkIGlmIG5vIG1pZCBsaW5lIHdhcyBmb3VuZC5cblNEUFV0aWxzLmdldE1pZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgbWlkID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1taWQ6JylbMF07XG4gIGlmIChtaWQpIHtcbiAgICByZXR1cm4gbWlkLnN1YnN0cig2KTtcbiAgfVxufVxuXG5TRFBVdGlscy5wYXJzZUZpbmdlcnByaW50ID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cigxNCkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICBhbGdvcml0aG06IHBhcnRzWzBdLnRvTG93ZXJDYXNlKCksIC8vIGFsZ29yaXRobSBpcyBjYXNlLXNlbnNpdGl2ZSBpbiBFZGdlLlxuICAgIHZhbHVlOiBwYXJ0c1sxXVxuICB9O1xufTtcblxuLy8gRXh0cmFjdHMgRFRMUyBwYXJhbWV0ZXJzIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBmaW5nZXJwcmludCBsaW5lIGFzIGlucHV0LiBTZWUgYWxzbyBnZXRJY2VQYXJhbWV0ZXJzLlxuU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiArIHNlc3Npb25wYXJ0LFxuICAgICAgJ2E9ZmluZ2VycHJpbnQ6Jyk7XG4gIC8vIE5vdGU6IGE9c2V0dXAgbGluZSBpcyBpZ25vcmVkIHNpbmNlIHdlIHVzZSB0aGUgJ2F1dG8nIHJvbGUuXG4gIC8vIE5vdGUyOiAnYWxnb3JpdGhtJyBpcyBub3QgY2FzZSBzZW5zaXRpdmUgZXhjZXB0IGluIEVkZ2UuXG4gIHJldHVybiB7XG4gICAgcm9sZTogJ2F1dG8nLFxuICAgIGZpbmdlcnByaW50czogbGluZXMubWFwKFNEUFV0aWxzLnBhcnNlRmluZ2VycHJpbnQpXG4gIH07XG59O1xuXG4vLyBTZXJpYWxpemVzIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zLCBzZXR1cFR5cGUpIHtcbiAgdmFyIHNkcCA9ICdhPXNldHVwOicgKyBzZXR1cFR5cGUgKyAnXFxyXFxuJztcbiAgcGFyYW1zLmZpbmdlcnByaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGZwKSB7XG4gICAgc2RwICs9ICdhPWZpbmdlcnByaW50OicgKyBmcC5hbGdvcml0aG0gKyAnICcgKyBmcC52YWx1ZSArICdcXHJcXG4nO1xuICB9KTtcbiAgcmV0dXJuIHNkcDtcbn07XG4vLyBQYXJzZXMgSUNFIGluZm9ybWF0aW9uIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBpY2UtdWZyYWcgYW5kIGljZS1wd2QgbGluZXMgYXMgaW5wdXQuXG5TRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIC8vIFNlYXJjaCBpbiBzZXNzaW9uIHBhcnQsIHRvby5cbiAgbGluZXMgPSBsaW5lcy5jb25jYXQoU0RQVXRpbHMuc3BsaXRMaW5lcyhzZXNzaW9ucGFydCkpO1xuICB2YXIgaWNlUGFyYW1ldGVycyA9IHtcbiAgICB1c2VybmFtZUZyYWdtZW50OiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtdWZyYWc6JykgPT09IDA7XG4gICAgfSlbMF0uc3Vic3RyKDEyKSxcbiAgICBwYXNzd29yZDogbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHJldHVybiBsaW5lLmluZGV4T2YoJ2E9aWNlLXB3ZDonKSA9PT0gMDtcbiAgICB9KVswXS5zdWJzdHIoMTApXG4gIH07XG4gIHJldHVybiBpY2VQYXJhbWV0ZXJzO1xufTtcblxuLy8gU2VyaWFsaXplcyBJQ0UgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgcmV0dXJuICdhPWljZS11ZnJhZzonICsgcGFyYW1zLnVzZXJuYW1lRnJhZ21lbnQgKyAnXFxyXFxuJyArXG4gICAgICAnYT1pY2UtcHdkOicgKyBwYXJhbXMucGFzc3dvcmQgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgUlRDUnRwUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgZGVzY3JpcHRpb24gPSB7XG4gICAgY29kZWNzOiBbXSxcbiAgICBoZWFkZXJFeHRlbnNpb25zOiBbXSxcbiAgICBmZWNNZWNoYW5pc21zOiBbXSxcbiAgICBydGNwOiBbXVxuICB9O1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBtbGluZSA9IGxpbmVzWzBdLnNwbGl0KCcgJyk7XG4gIGZvciAodmFyIGkgPSAzOyBpIDwgbWxpbmUubGVuZ3RoOyBpKyspIHsgLy8gZmluZCBhbGwgY29kZWNzIGZyb20gbWxpbmVbMy4uXVxuICAgIHZhciBwdCA9IG1saW5lW2ldO1xuICAgIHZhciBydHBtYXBsaW5lID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRwbWFwOicgKyBwdCArICcgJylbMF07XG4gICAgaWYgKHJ0cG1hcGxpbmUpIHtcbiAgICAgIHZhciBjb2RlYyA9IFNEUFV0aWxzLnBhcnNlUnRwTWFwKHJ0cG1hcGxpbmUpO1xuICAgICAgdmFyIGZtdHBzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1mbXRwOicgKyBwdCArICcgJyk7XG4gICAgICAvLyBPbmx5IHRoZSBmaXJzdCBhPWZtdHA6PHB0PiBpcyBjb25zaWRlcmVkLlxuICAgICAgY29kZWMucGFyYW1ldGVycyA9IGZtdHBzLmxlbmd0aCA/IFNEUFV0aWxzLnBhcnNlRm10cChmbXRwc1swXSkgOiB7fTtcbiAgICAgIGNvZGVjLnJ0Y3BGZWVkYmFjayA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1mYjonICsgcHQgKyAnICcpXG4gICAgICAgIC5tYXAoU0RQVXRpbHMucGFyc2VSdGNwRmIpO1xuICAgICAgZGVzY3JpcHRpb24uY29kZWNzLnB1c2goY29kZWMpO1xuICAgICAgLy8gcGFyc2UgRkVDIG1lY2hhbmlzbXMgZnJvbSBydHBtYXAgbGluZXMuXG4gICAgICBzd2l0Y2ggKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICBjYXNlICdSRUQnOlxuICAgICAgICBjYXNlICdVTFBGRUMnOlxuICAgICAgICAgIGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMucHVzaChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiAvLyBvbmx5IFJFRCBhbmQgVUxQRkVDIGFyZSByZWNvZ25pemVkIGFzIEZFQyBtZWNoYW5pc21zLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWV4dG1hcDonKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBkZXNjcmlwdGlvbi5oZWFkZXJFeHRlbnNpb25zLnB1c2goU0RQVXRpbHMucGFyc2VFeHRtYXAobGluZSkpO1xuICB9KTtcbiAgLy8gRklYTUU6IHBhcnNlIHJ0Y3AuXG4gIHJldHVybiBkZXNjcmlwdGlvbjtcbn07XG5cbi8vIEdlbmVyYXRlcyBwYXJ0cyBvZiB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gZGVzY3JpYmluZyB0aGUgY2FwYWJpbGl0aWVzIC9cbi8vIHBhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uID0gZnVuY3Rpb24oa2luZCwgY2Fwcykge1xuICB2YXIgc2RwID0gJyc7XG5cbiAgLy8gQnVpbGQgdGhlIG1saW5lLlxuICBzZHAgKz0gJ209JyArIGtpbmQgKyAnICc7XG4gIHNkcCArPSBjYXBzLmNvZGVjcy5sZW5ndGggPiAwID8gJzknIDogJzAnOyAvLyByZWplY3QgaWYgbm8gY29kZWNzLlxuICBzZHAgKz0gJyBVRFAvVExTL1JUUC9TQVZQRiAnO1xuICBzZHAgKz0gY2Fwcy5jb2RlY3MubWFwKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvZGVjLnBheWxvYWRUeXBlO1xuICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcblxuICBzZHAgKz0gJ2M9SU4gSVA0IDAuMC4wLjBcXHJcXG4nO1xuICBzZHAgKz0gJ2E9cnRjcDo5IElOIElQNCAwLjAuMC4wXFxyXFxuJztcblxuICAvLyBBZGQgYT1ydHBtYXAgbGluZXMgZm9yIGVhY2ggY29kZWMuIEFsc28gZm10cCBhbmQgcnRjcC1mYi5cbiAgY2Fwcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZVJ0cE1hcChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlRm10cChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRjcEZiKGNvZGVjKTtcbiAgfSk7XG4gIHZhciBtYXhwdGltZSA9IDA7XG4gIGNhcHMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMubWF4cHRpbWUgPiBtYXhwdGltZSkge1xuICAgICAgbWF4cHRpbWUgPSBjb2RlYy5tYXhwdGltZTtcbiAgICB9XG4gIH0pO1xuICBpZiAobWF4cHRpbWUgPiAwKSB7XG4gICAgc2RwICs9ICdhPW1heHB0aW1lOicgKyBtYXhwdGltZSArICdcXHJcXG4nO1xuICB9XG4gIHNkcCArPSAnYT1ydGNwLW11eFxcclxcbic7XG5cbiAgY2Fwcy5oZWFkZXJFeHRlbnNpb25zLmZvckVhY2goZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlRXh0bWFwKGV4dGVuc2lvbik7XG4gIH0pO1xuICAvLyBGSVhNRTogd3JpdGUgZmVjTWVjaGFuaXNtcy5cbiAgcmV0dXJuIHNkcDtcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgYW4gYXJyYXkgb2Zcbi8vIFJUQ1J0cEVuY29kaW5nUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBlbmNvZGluZ1BhcmFtZXRlcnMgPSBbXTtcbiAgdmFyIGRlc2NyaXB0aW9uID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBoYXNSZWQgPSBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLmluZGV4T2YoJ1JFRCcpICE9PSAtMTtcbiAgdmFyIGhhc1VscGZlYyA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignVUxQRkVDJykgIT09IC0xO1xuXG4gIC8vIGZpbHRlciBhPXNzcmM6Li4uIGNuYW1lOiwgaWdub3JlIFBsYW5CLW1zaWRcbiAgdmFyIHNzcmNzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgfSlcbiAgLmZpbHRlcihmdW5jdGlvbihwYXJ0cykge1xuICAgIHJldHVybiBwYXJ0cy5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XG4gIH0pO1xuICB2YXIgcHJpbWFyeVNzcmMgPSBzc3Jjcy5sZW5ndGggPiAwICYmIHNzcmNzWzBdLnNzcmM7XG4gIHZhciBzZWNvbmRhcnlTc3JjO1xuXG4gIHZhciBmbG93cyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYy1ncm91cDpGSUQnKVxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCcgJyk7XG4gICAgcGFydHMuc2hpZnQoKTtcbiAgICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChwYXJ0LCAxMCk7XG4gICAgfSk7XG4gIH0pO1xuICBpZiAoZmxvd3MubGVuZ3RoID4gMCAmJiBmbG93c1swXS5sZW5ndGggPiAxICYmIGZsb3dzWzBdWzBdID09PSBwcmltYXJ5U3NyYykge1xuICAgIHNlY29uZGFyeVNzcmMgPSBmbG93c1swXVsxXTtcbiAgfVxuXG4gIGRlc2NyaXB0aW9uLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSA9PT0gJ1JUWCcgJiYgY29kZWMucGFyYW1ldGVycy5hcHQpIHtcbiAgICAgIHZhciBlbmNQYXJhbSA9IHtcbiAgICAgICAgc3NyYzogcHJpbWFyeVNzcmMsXG4gICAgICAgIGNvZGVjUGF5bG9hZFR5cGU6IHBhcnNlSW50KGNvZGVjLnBhcmFtZXRlcnMuYXB0LCAxMCksXG4gICAgICAgIHJ0eDoge1xuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmNcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKGVuY1BhcmFtKTtcbiAgICAgIGlmIChoYXNSZWQpIHtcbiAgICAgICAgZW5jUGFyYW0gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVuY1BhcmFtKSk7XG4gICAgICAgIGVuY1BhcmFtLmZlYyA9IHtcbiAgICAgICAgICBzc3JjOiBzZWNvbmRhcnlTc3JjLFxuICAgICAgICAgIG1lY2hhbmlzbTogaGFzVWxwZmVjID8gJ3JlZCt1bHBmZWMnIDogJ3JlZCdcbiAgICAgICAgfTtcbiAgICAgICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goZW5jUGFyYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGlmIChlbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoID09PSAwICYmIHByaW1hcnlTc3JjKSB7XG4gICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goe1xuICAgICAgc3NyYzogcHJpbWFyeVNzcmNcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHdlIHN1cHBvcnQgYm90aCBiPUFTIGFuZCBiPVRJQVMgYnV0IGludGVycHJldCBBUyBhcyBUSUFTLlxuICB2YXIgYmFuZHdpZHRoID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYj0nKTtcbiAgaWYgKGJhbmR3aWR0aC5sZW5ndGgpIHtcbiAgICBpZiAoYmFuZHdpZHRoWzBdLmluZGV4T2YoJ2I9VElBUzonKSA9PT0gMCkge1xuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig3KSwgMTApO1xuICAgIH0gZWxzZSBpZiAoYmFuZHdpZHRoWzBdLmluZGV4T2YoJ2I9QVM6JykgPT09IDApIHtcbiAgICAgIGJhbmR3aWR0aCA9IHBhcnNlSW50KGJhbmR3aWR0aFswXS5zdWJzdHIoNSksIDEwKTtcbiAgICB9XG4gICAgZW5jb2RpbmdQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICBwYXJhbXMubWF4Qml0cmF0ZSA9IGJhbmR3aWR0aDtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZW5jb2RpbmdQYXJhbWV0ZXJzO1xufTtcblxuLy8gcGFyc2VzIGh0dHA6Ly9kcmFmdC5vcnRjLm9yZy8jcnRjcnRjcHBhcmFtZXRlcnMqXG5TRFBVdGlscy5wYXJzZVJ0Y3BQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBydGNwUGFyYW1ldGVycyA9IHt9O1xuXG4gIHZhciBjbmFtZTtcbiAgLy8gR2V0cyB0aGUgZmlyc3QgU1NSQy4gTm90ZSB0aGF0IHdpdGggUlRYIHRoZXJlIG1pZ2h0IGJlIG11bHRpcGxlXG4gIC8vIFNTUkNzLlxuICB2YXIgcmVtb3RlU3NyYyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAgICAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgICAgIH0pWzBdO1xuICBpZiAocmVtb3RlU3NyYykge1xuICAgIHJ0Y3BQYXJhbWV0ZXJzLmNuYW1lID0gcmVtb3RlU3NyYy52YWx1ZTtcbiAgICBydGNwUGFyYW1ldGVycy5zc3JjID0gcmVtb3RlU3NyYy5zc3JjO1xuICB9XG5cbiAgLy8gRWRnZSB1c2VzIHRoZSBjb21wb3VuZCBhdHRyaWJ1dGUgaW5zdGVhZCBvZiByZWR1Y2VkU2l6ZVxuICAvLyBjb21wb3VuZCBpcyAhcmVkdWNlZFNpemVcbiAgdmFyIHJzaXplID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1ydGNwLXJzaXplJyk7XG4gIHJ0Y3BQYXJhbWV0ZXJzLnJlZHVjZWRTaXplID0gcnNpemUubGVuZ3RoID4gMDtcbiAgcnRjcFBhcmFtZXRlcnMuY29tcG91bmQgPSByc2l6ZS5sZW5ndGggPT09IDA7XG5cbiAgLy8gcGFyc2VzIHRoZSBydGNwLW11eCBhdHRy0ZZidXRlLlxuICAvLyBOb3RlIHRoYXQgRWRnZSBkb2VzIG5vdCBzdXBwb3J0IHVubXV4ZWQgUlRDUC5cbiAgdmFyIG11eCA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1tdXgnKTtcbiAgcnRjcFBhcmFtZXRlcnMubXV4ID0gbXV4Lmxlbmd0aCA+IDA7XG5cbiAgcmV0dXJuIHJ0Y3BQYXJhbWV0ZXJzO1xufTtcblxuLy8gcGFyc2VzIGVpdGhlciBhPW1zaWQ6IG9yIGE9c3NyYzouLi4gbXNpZCBsaW5lcyBhbmQgcmV0dXJuc1xuLy8gdGhlIGlkIG9mIHRoZSBNZWRpYVN0cmVhbSBhbmQgTWVkaWFTdHJlYW1UcmFjay5cblNEUFV0aWxzLnBhcnNlTXNpZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgcGFydHM7XG4gIHZhciBzcGVjID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1tc2lkOicpO1xuICBpZiAoc3BlYy5sZW5ndGggPT09IDEpIHtcbiAgICBwYXJ0cyA9IHNwZWNbMF0uc3Vic3RyKDcpLnNwbGl0KCcgJyk7XG4gICAgcmV0dXJuIHtzdHJlYW06IHBhcnRzWzBdLCB0cmFjazogcGFydHNbMV19O1xuICB9XG4gIHZhciBwbGFuQiA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XG4gIH0pXG4gIC5maWx0ZXIoZnVuY3Rpb24ocGFydHMpIHtcbiAgICByZXR1cm4gcGFydHMuYXR0cmlidXRlID09PSAnbXNpZCc7XG4gIH0pO1xuICBpZiAocGxhbkIubGVuZ3RoID4gMCkge1xuICAgIHBhcnRzID0gcGxhbkJbMF0udmFsdWUuc3BsaXQoJyAnKTtcbiAgICByZXR1cm4ge3N0cmVhbTogcGFydHNbMF0sIHRyYWNrOiBwYXJ0c1sxXX07XG4gIH1cbn07XG5cblNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIEZJWE1FOiBzZXNzLWlkIHNob3VsZCBiZSBhbiBOVFAgdGltZXN0YW1wLlxuICByZXR1cm4gJ3Y9MFxcclxcbicgK1xuICAgICAgJ289dGhpc2lzYWRhcHRlcm9ydGMgODE2OTYzOTkxNTY0Njk0MzEzNyAyIElOIElQNCAxMjcuMC4wLjFcXHJcXG4nICtcbiAgICAgICdzPS1cXHJcXG4nICtcbiAgICAgICd0PTAgMFxcclxcbic7XG59O1xuXG5TRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbiA9IGZ1bmN0aW9uKHRyYW5zY2VpdmVyLCBjYXBzLCB0eXBlLCBzdHJlYW0pIHtcbiAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24odHJhbnNjZWl2ZXIua2luZCwgY2Fwcyk7XG5cbiAgLy8gTWFwIElDRSBwYXJhbWV0ZXJzICh1ZnJhZywgcHdkKSB0byBTRFAuXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMoXG4gICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5nZXRMb2NhbFBhcmFtZXRlcnMoKSk7XG5cbiAgLy8gTWFwIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzKFxuICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5nZXRMb2NhbFBhcmFtZXRlcnMoKSxcbiAgICAgIHR5cGUgPT09ICdvZmZlcicgPyAnYWN0cGFzcycgOiAnYWN0aXZlJyk7XG5cbiAgc2RwICs9ICdhPW1pZDonICsgdHJhbnNjZWl2ZXIubWlkICsgJ1xcclxcbic7XG5cbiAgaWYgKHRyYW5zY2VpdmVyLmRpcmVjdGlvbikge1xuICAgIHNkcCArPSAnYT0nICsgdHJhbnNjZWl2ZXIuZGlyZWN0aW9uICsgJ1xcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgc2RwICs9ICdhPXNlbmRyZWN2XFxyXFxuJztcbiAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICBzZHAgKz0gJ2E9c2VuZG9ubHlcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgc2RwICs9ICdhPXJlY3Zvbmx5XFxyXFxuJztcbiAgfSBlbHNlIHtcbiAgICBzZHAgKz0gJ2E9aW5hY3RpdmVcXHJcXG4nO1xuICB9XG5cbiAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgIC8vIHNwZWMuXG4gICAgdmFyIG1zaWQgPSAnbXNpZDonICsgc3RyZWFtLmlkICsgJyAnICtcbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnRyYWNrLmlkICsgJ1xcclxcbic7XG4gICAgc2RwICs9ICdhPScgKyBtc2lkO1xuXG4gICAgLy8gZm9yIENocm9tZS5cbiAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICtcbiAgICAgICAgJyAnICsgbXNpZDtcbiAgICBpZiAodHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcbiAgICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcbiAgICAgICAgICAnICcgKyBtc2lkO1xuICAgICAgc2RwICs9ICdhPXNzcmMtZ3JvdXA6RklEICcgK1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArICcgJyArXG4gICAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHguc3NyYyArXG4gICAgICAgICAgJ1xcclxcbic7XG4gICAgfVxuICB9XG4gIC8vIEZJWE1FOiB0aGlzIHNob3VsZCBiZSB3cml0dGVuIGJ5IHdyaXRlUnRwRGVzY3JpcHRpb24uXG4gIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xuICAgICAgJyBjbmFtZTonICsgU0RQVXRpbHMubG9jYWxDTmFtZSArICdcXHJcXG4nO1xuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyICYmIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4KSB7XG4gICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4LnNzcmMgK1xuICAgICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XG4gIH1cbiAgcmV0dXJuIHNkcDtcbn07XG5cbi8vIEdldHMgdGhlIGRpcmVjdGlvbiBmcm9tIHRoZSBtZWRpYVNlY3Rpb24gb3IgdGhlIHNlc3Npb25wYXJ0LlxuU0RQVXRpbHMuZ2V0RGlyZWN0aW9uID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICAvLyBMb29rIGZvciBzZW5kcmVjdiwgc2VuZG9ubHksIHJlY3Zvbmx5LCBpbmFjdGl2ZSwgZGVmYXVsdCB0byBzZW5kcmVjdi5cbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc3dpdGNoIChsaW5lc1tpXSkge1xuICAgICAgY2FzZSAnYT1zZW5kcmVjdic6XG4gICAgICBjYXNlICdhPXNlbmRvbmx5JzpcbiAgICAgIGNhc2UgJ2E9cmVjdm9ubHknOlxuICAgICAgY2FzZSAnYT1pbmFjdGl2ZSc6XG4gICAgICAgIHJldHVybiBsaW5lc1tpXS5zdWJzdHIoMik7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBGSVhNRTogV2hhdCBzaG91bGQgaGFwcGVuIGhlcmU/XG4gICAgfVxuICB9XG4gIGlmIChzZXNzaW9ucGFydCkge1xuICAgIHJldHVybiBTRFBVdGlscy5nZXREaXJlY3Rpb24oc2Vzc2lvbnBhcnQpO1xuICB9XG4gIHJldHVybiAnc2VuZHJlY3YnO1xufTtcblxuU0RQVXRpbHMuZ2V0S2luZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBtbGluZSA9IGxpbmVzWzBdLnNwbGl0KCcgJyk7XG4gIHJldHVybiBtbGluZVswXS5zdWJzdHIoMik7XG59O1xuXG5TRFBVdGlscy5pc1JlamVjdGVkID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHJldHVybiBtZWRpYVNlY3Rpb24uc3BsaXQoJyAnLCAyKVsxXSA9PT0gJzAnO1xufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBTRFBVdGlscztcbiIsIi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xudmFyIGJ5dGVUb0hleCA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvVXVpZChidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuICB2YXIgYnRoID0gYnl0ZVRvSGV4O1xuICAvLyBqb2luIHVzZWQgdG8gZml4IG1lbW9yeSBpc3N1ZSBjYXVzZWQgYnkgY29uY2F0ZW5hdGlvbjogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzE3NSNjNFxuICByZXR1cm4gKFtidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBcblx0YnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCAnLScsXG5cdGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJyxcblx0YnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dXSkuam9pbignJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnl0ZXNUb1V1aWQ7XG4iLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiAgSW4gdGhlXG4vLyBicm93c2VyIHRoaXMgaXMgYSBsaXR0bGUgY29tcGxpY2F0ZWQgZHVlIHRvIHVua25vd24gcXVhbGl0eSBvZiBNYXRoLnJhbmRvbSgpXG4vLyBhbmQgaW5jb25zaXN0ZW50IHN1cHBvcnQgZm9yIHRoZSBgY3J5cHRvYCBBUEkuICBXZSBkbyB0aGUgYmVzdCB3ZSBjYW4gdmlhXG4vLyBmZWF0dXJlLWRldGVjdGlvblxuXG4vLyBnZXRSYW5kb21WYWx1ZXMgbmVlZHMgdG8gYmUgaW52b2tlZCBpbiBhIGNvbnRleHQgd2hlcmUgXCJ0aGlzXCIgaXMgYSBDcnlwdG9cbi8vIGltcGxlbWVudGF0aW9uLiBBbHNvLCBmaW5kIHRoZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiBjcnlwdG8gb24gSUUxMS5cbnZhciBnZXRSYW5kb21WYWx1ZXMgPSAodHlwZW9mKGNyeXB0bykgIT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQoY3J5cHRvKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAodHlwZW9mKG1zQ3J5cHRvKSAhPSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93Lm1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PSAnZnVuY3Rpb24nICYmIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKG1zQ3J5cHRvKSk7XG5cbmlmIChnZXRSYW5kb21WYWx1ZXMpIHtcbiAgLy8gV0hBVFdHIGNyeXB0byBSTkcgLSBodHRwOi8vd2lraS53aGF0d2cub3JnL3dpa2kvQ3J5cHRvXG4gIHZhciBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gd2hhdHdnUk5HKCkge1xuICAgIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG4gICAgcmV0dXJuIHJuZHM4O1xuICB9O1xufSBlbHNlIHtcbiAgLy8gTWF0aC5yYW5kb20oKS1iYXNlZCAoUk5HKVxuICAvL1xuICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAvLyBxdWFsaXR5LlxuICB2YXIgcm5kcyA9IG5ldyBBcnJheSgxNik7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtYXRoUk5HKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCByOyBpIDwgMTY7IGkrKykge1xuICAgICAgaWYgKChpICYgMHgwMykgPT09IDApIHIgPSBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDA7XG4gICAgICBybmRzW2ldID0gciA+Pj4gKChpICYgMHgwMykgPDwgMykgJiAweGZmO1xuICAgIH1cblxuICAgIHJldHVybiBybmRzO1xuICB9O1xufVxuIiwidmFyIHJuZyA9IHJlcXVpcmUoJy4vbGliL3JuZycpO1xudmFyIGJ5dGVzVG9VdWlkID0gcmVxdWlyZSgnLi9saWIvYnl0ZXNUb1V1aWQnKTtcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgIGJ1ZiA9IG9wdGlvbnMgPT09ICdiaW5hcnknID8gbmV3IEFycmF5KDE2KSA6IG51bGw7XG4gICAgb3B0aW9ucyA9IG51bGw7XG4gIH1cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdmFyIHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpO1xuXG4gIC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcbiAgcm5kc1s2XSA9IChybmRzWzZdICYgMHgwZikgfCAweDQwO1xuICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG4gIGlmIChidWYpIHtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7ICsraWkpIHtcbiAgICAgIGJ1ZltpICsgaWldID0gcm5kc1tpaV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZiB8fCBieXRlc1RvVXVpZChybmRzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2NDtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIFNoaW1taW5nIHN0YXJ0cyBoZXJlLlxuKGZ1bmN0aW9uKCkge1xuICAvLyBVdGlscy5cbiAgdmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuL3V0aWxzJykubG9nO1xuICB2YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG4gIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJEZXRhaWxzID0gYnJvd3NlckRldGFpbHM7XG4gIG1vZHVsZS5leHBvcnRzLmV4dHJhY3RWZXJzaW9uID0gcmVxdWlyZSgnLi91dGlscycpLmV4dHJhY3RWZXJzaW9uO1xuICBtb2R1bGUuZXhwb3J0cy5kaXNhYmxlTG9nID0gcmVxdWlyZSgnLi91dGlscycpLmRpc2FibGVMb2c7XG5cbiAgLy8gVW5jb21tZW50IHRoZSBsaW5lIGJlbG93IGlmIHlvdSB3YW50IGxvZ2dpbmcgdG8gb2NjdXIsIGluY2x1ZGluZyBsb2dnaW5nXG4gIC8vIGZvciB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvdy4gQ2FuIGFsc28gYmUgdHVybmVkIG9uIGluIHRoZSBicm93c2VyIHZpYVxuICAvLyBhZGFwdGVyLmRpc2FibGVMb2coZmFsc2UpLCBidXQgdGhlbiBsb2dnaW5nIGZyb20gdGhlIHN3aXRjaCBzdGF0ZW1lbnQgYmVsb3dcbiAgLy8gd2lsbCBub3QgYXBwZWFyLlxuICAvLyByZXF1aXJlKCcuL3V0aWxzJykuZGlzYWJsZUxvZyhmYWxzZSk7XG5cbiAgLy8gQnJvd3NlciBzaGltcy5cbiAgdmFyIGNocm9tZVNoaW0gPSByZXF1aXJlKCcuL2Nocm9tZS9jaHJvbWVfc2hpbScpIHx8IG51bGw7XG4gIHZhciBlZGdlU2hpbSA9IHJlcXVpcmUoJy4vZWRnZS9lZGdlX3NoaW0nKSB8fCBudWxsO1xuICB2YXIgZmlyZWZveFNoaW0gPSByZXF1aXJlKCcuL2ZpcmVmb3gvZmlyZWZveF9zaGltJykgfHwgbnVsbDtcbiAgdmFyIHNhZmFyaVNoaW0gPSByZXF1aXJlKCcuL3NhZmFyaS9zYWZhcmlfc2hpbScpIHx8IG51bGw7XG5cbiAgLy8gU2hpbSBicm93c2VyIGlmIGZvdW5kLlxuICBzd2l0Y2ggKGJyb3dzZXJEZXRhaWxzLmJyb3dzZXIpIHtcbiAgICBjYXNlICdvcGVyYSc6IC8vIGZhbGx0aHJvdWdoIGFzIGl0IHVzZXMgY2hyb21lIHNoaW1zXG4gICAgY2FzZSAnY2hyb21lJzpcbiAgICAgIGlmICghY2hyb21lU2hpbSB8fCAhY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgbG9nZ2luZygnQ2hyb21lIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGNocm9tZS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGNocm9tZVNoaW07XG5cbiAgICAgIGNocm9tZVNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltTWVkaWFTdHJlYW0oKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbVNvdXJjZU9iamVjdCgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbU9uVHJhY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZpcmVmb3gnOlxuICAgICAgaWYgKCFmaXJlZm94U2hpbSB8fCAhZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ0ZpcmVmb3ggc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZmlyZWZveC4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGZpcmVmb3hTaGltO1xuXG4gICAgICBmaXJlZm94U2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltU291cmNlT2JqZWN0KCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1PblRyYWNrKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdlZGdlJzpcbiAgICAgIGlmICghZWRnZVNoaW0gfHwgIWVkZ2VTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdNUyBlZGdlIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGVkZ2UuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBlZGdlU2hpbTtcblxuICAgICAgZWRnZVNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzYWZhcmknOlxuICAgICAgaWYgKCFzYWZhcmlTaGltKSB7XG4gICAgICAgIGxvZ2dpbmcoJ1NhZmFyaSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBzYWZhcmkuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBzYWZhcmlTaGltO1xuXG4gICAgICBzYWZhcmlTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsb2dnaW5nKCdVbnN1cHBvcnRlZCBicm93c2VyIScpO1xuICB9XG59KSgpO1xuIiwiXG4vKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5sb2c7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmJyb3dzZXJEZXRhaWxzO1xuXG52YXIgY2hyb21lU2hpbSA9IHtcbiAgc2hpbU1lZGlhU3RyZWFtOiBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuTWVkaWFTdHJlYW0gPSB3aW5kb3cuTWVkaWFTdHJlYW0gfHwgd2luZG93LndlYmtpdE1lZGlhU3RyZWFtO1xuICB9LFxuXG4gIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmICEoJ29udHJhY2snIGluXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29udHJhY2snLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX29udHJhY2s7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZikge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2spO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIC8vIG9uYWRkc3RyZWFtIGRvZXMgbm90IGZpcmUgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIHRvIGFuIGV4aXN0aW5nXG4gICAgICAgICAgICAvLyBzdHJlYW0uIEJ1dCBzdHJlYW0ub25hZGR0cmFjayBpcyBpbXBsZW1lbnRlZCBzbyB3ZSB1c2UgdGhhdC5cbiAgICAgICAgICAgIGUuc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24odGUpIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRlLnRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdGUudHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZS5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAod2luZG93LkhUTUxNZWRpYUVsZW1lbnQgJiZcbiAgICAgICAgISgnc3JjT2JqZWN0JyBpbiB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIC8vIFNoaW0gdGhlIHNyY09iamVjdCBwcm9wZXJ0eSwgb25jZSwgd2hlbiBIVE1MTWVkaWFFbGVtZW50IGlzIGZvdW5kLlxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCAnc3JjT2JqZWN0Jywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3JjT2JqZWN0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIC8vIFVzZSBfc3JjT2JqZWN0IGFzIGEgcHJpdmF0ZSBwcm9wZXJ0eSBmb3IgdGhpcyBzaGltXG4gICAgICAgICAgICB0aGlzLl9zcmNPYmplY3QgPSBzdHJlYW07XG4gICAgICAgICAgICBpZiAodGhpcy5zcmMpIHtcbiAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnNyYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghc3RyZWFtKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3JjID0gJyc7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byByZWNyZWF0ZSB0aGUgYmxvYiB1cmwgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIG9yXG4gICAgICAgICAgICAvLyByZW1vdmVkLiBEb2luZyBpdCBtYW51YWxseSBzaW5jZSB3ZSB3YW50IHRvIGF2b2lkIGEgcmVjdXJzaW9uLlxuICAgICAgICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChzZWxmLnNyYykge1xuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoc2VsZi5zcmMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcigncmVtb3ZldHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChzZWxmLnNyYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoZSBSVENQZWVyQ29ubmVjdGlvbiBvYmplY3QuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgIC8vIFRyYW5zbGF0ZSBpY2VUcmFuc3BvcnRQb2xpY3kgdG8gaWNlVHJhbnNwb3J0cyxcbiAgICAgIC8vIHNlZSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3dlYnJ0Yy9pc3N1ZXMvZGV0YWlsP2lkPTQ4NjlcbiAgICAgIGxvZ2dpbmcoJ1BlZXJDb25uZWN0aW9uJyk7XG4gICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgIHBjQ29uZmlnLmljZVRyYW5zcG9ydHMgPSBwY0NvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3k7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYyA9IG5ldyB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cyk7XG4gICAgICB2YXIgb3JpZ0dldFN0YXRzID0gcGMuZ2V0U3RhdHMuYmluZChwYyk7XG4gICAgICBwYy5nZXRTdGF0cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICAvLyBJZiBzZWxlY3RvciBpcyBhIGZ1bmN0aW9uIHRoZW4gd2UgYXJlIGluIHRoZSBvbGQgc3R5bGUgc3RhdHMgc28ganVzdFxuICAgICAgICAvLyBwYXNzIGJhY2sgdGhlIG9yaWdpbmFsIGdldFN0YXRzIGZvcm1hdCB0byBhdm9pZCBicmVha2luZyBvbGQgdXNlcnMuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzKHNlbGVjdG9yLCBzdWNjZXNzQ2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpeENocm9tZVN0YXRzXyA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgdmFyIHN0YW5kYXJkUmVwb3J0ID0ge307XG4gICAgICAgICAgdmFyIHJlcG9ydHMgPSByZXNwb25zZS5yZXN1bHQoKTtcbiAgICAgICAgICByZXBvcnRzLmZvckVhY2goZnVuY3Rpb24ocmVwb3J0KSB7XG4gICAgICAgICAgICB2YXIgc3RhbmRhcmRTdGF0cyA9IHtcbiAgICAgICAgICAgICAgaWQ6IHJlcG9ydC5pZCxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiByZXBvcnQudGltZXN0YW1wLFxuICAgICAgICAgICAgICB0eXBlOiByZXBvcnQudHlwZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcG9ydC5uYW1lcygpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgICBzdGFuZGFyZFN0YXRzW25hbWVdID0gcmVwb3J0LnN0YXQobmFtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0YW5kYXJkUmVwb3J0W3N0YW5kYXJkU3RhdHMuaWRdID0gc3RhbmRhcmRTdGF0cztcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBzdGFuZGFyZFJlcG9ydDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBzaGltIGdldFN0YXRzIHdpdGggbWFwbGlrZSBzdXBwb3J0XG4gICAgICAgIHZhciBtYWtlTWFwU3RhdHMgPSBmdW5jdGlvbihzdGF0cywgbGVnYWN5U3RhdHMpIHtcbiAgICAgICAgICB2YXIgbWFwID0gbmV3IE1hcChPYmplY3Qua2V5cyhzdGF0cykubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuW2tleSwgc3RhdHNba2V5XV07XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGxlZ2FjeVN0YXRzID0gbGVnYWN5U3RhdHMgfHwgc3RhdHM7XG4gICAgICAgICAgT2JqZWN0LmtleXMobGVnYWN5U3RhdHMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBtYXBba2V5XSA9IGxlZ2FjeVN0YXRzW2tleV07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgdmFyIHN1Y2Nlc3NDYWxsYmFja1dyYXBwZXJfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGFyZ3NbMV0obWFrZU1hcFN0YXRzKGZpeENocm9tZVN0YXRzXyhyZXNwb25zZSkpKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIG9yaWdHZXRTdGF0cy5hcHBseSh0aGlzLCBbc3VjY2Vzc0NhbGxiYWNrV3JhcHBlcl8sXG4gICAgICAgICAgICAgIGFyZ3VtZW50c1swXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcHJvbWlzZS1zdXBwb3J0XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIHNlbGVjdG9yID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgb3JpZ0dldFN0YXRzLmFwcGx5KHNlbGYsIFtcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG1ha2VNYXBTdGF0cyhmaXhDaHJvbWVTdGF0c18ocmVzcG9uc2UpKSk7XG4gICAgICAgICAgICAgIH0sIHJlamVjdF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBQcmVzZXJ2ZSBsZWdhY3kgY2hyb21lIHN0YXRzIG9ubHkgb24gbGVnYWN5IGFjY2VzcyBvZiBzdGF0cyBvYmpcbiAgICAgICAgICAgIG9yaWdHZXRTdGF0cy5hcHBseShzZWxmLCBbXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShtYWtlTWFwU3RhdHMoZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UucmVzdWx0KCkpKTtcbiAgICAgICAgICAgICAgfSwgcmVqZWN0XSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gcGM7XG4gICAgfTtcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgLy8gd3JhcCBzdGF0aWMgbWV0aG9kcy4gQ3VycmVudGx5IGp1c3QgZ2VuZXJhdGVDZXJ0aWZpY2F0ZS5cbiAgICBpZiAod2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwgJ2dlbmVyYXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIFsnY3JlYXRlT2ZmZXInLCAnY3JlYXRlQW5zd2VyJ10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxIHx8IChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmXG4gICAgICAgICAgICB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICB2YXIgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbmF0aXZlTWV0aG9kLmFwcGx5KHNlbGYsIFtyZXNvbHZlLCByZWplY3QsIG9wdHNdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gYWRkIHByb21pc2Ugc3VwcG9ydCAtLSBuYXRpdmVseSBhdmFpbGFibGUgaW4gQ2hyb21lIDUxXG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA1MSkge1xuICAgICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgICB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIG5hdGl2ZU1ldGhvZC5hcHBseShzZWxmLCBbYXJnc1swXSwgcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhcmdzWzFdLmFwcGx5KG51bGwsIFtdKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgICAgICAgIGFyZ3NbMl0uYXBwbHkobnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHNoaW0gaW1wbGljaXQgY3JlYXRpb24gb2YgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uL1JUQ0ljZUNhbmRpZGF0ZVxuICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG5ldyAoKG1ldGhvZCA9PT0gJ2FkZEljZUNhbmRpZGF0ZScpID9cbiAgICAgICAgICAgICAgICBSVENJY2VDYW5kaWRhdGUgOiBSVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBhZGRJY2VDYW5kaWRhdGUobnVsbClcbiAgICB2YXIgbmF0aXZlQWRkSWNlQ2FuZGlkYXRlID1cbiAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZTtcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoYXJndW1lbnRzWzBdID09PSBudWxsKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHNbMV0pIHtcbiAgICAgICAgICBhcmd1bWVudHNbMV0uYXBwbHkobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdGl2ZUFkZEljZUNhbmRpZGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cbn07XG5cblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1NZWRpYVN0cmVhbTogY2hyb21lU2hpbS5zaGltTWVkaWFTdHJlYW0sXG4gIHNoaW1PblRyYWNrOiBjaHJvbWVTaGltLnNoaW1PblRyYWNrLFxuICBzaGltU291cmNlT2JqZWN0OiBjaHJvbWVTaGltLnNoaW1Tb3VyY2VPYmplY3QsXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJylcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5sb2c7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjb25zdHJhaW50c1RvQ2hyb21lXyA9IGZ1bmN0aW9uKGMpIHtcbiAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMubWFuZGF0b3J5IHx8IGMub3B0aW9uYWwpIHtcbiAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICB2YXIgY2MgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHIgPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID8gY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xuICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygci5leGFjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgci5taW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICB9XG4gICAgICB2YXIgb2xkbmFtZV8gPSBmdW5jdGlvbihwcmVmaXgsIG5hbWUpIHtcbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgIHJldHVybiBwcmVmaXggKyBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5hbWUgPT09ICdkZXZpY2VJZCcpID8gJ3NvdXJjZUlkJyA6IG5hbWU7XG4gICAgICB9O1xuICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjYy5vcHRpb25hbCA9IGNjLm9wdGlvbmFsIHx8IFtdO1xuICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgaWYgKHR5cGVvZiByLmlkZWFsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIG9jW29sZG5hbWVfKCdtaW4nLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgICAgb2MgPSB7fTtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnbWF4Jywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9jW29sZG5hbWVfKCcnLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHIuZXhhY3QgIT09ICdudW1iZXInKSB7XG4gICAgICAgIGNjLm1hbmRhdG9yeSA9IGNjLm1hbmRhdG9yeSB8fCB7fTtcbiAgICAgICAgY2MubWFuZGF0b3J5W29sZG5hbWVfKCcnLCBrZXkpXSA9IHIuZXhhY3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBbJ21pbicsICdtYXgnXS5mb3JFYWNoKGZ1bmN0aW9uKG1peCkge1xuICAgICAgICAgIGlmIChyW21peF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xuICAgICAgICAgICAgY2MubWFuZGF0b3J5W29sZG5hbWVfKG1peCwga2V5KV0gPSByW21peF07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoYy5hZHZhbmNlZCkge1xuICAgICAgY2Mub3B0aW9uYWwgPSAoY2Mub3B0aW9uYWwgfHwgW10pLmNvbmNhdChjLmFkdmFuY2VkKTtcbiAgICB9XG4gICAgcmV0dXJuIGNjO1xuICB9O1xuXG4gIHZhciBzaGltQ29uc3RyYWludHNfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIGZ1bmMpIHtcbiAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICBpZiAoY29uc3RyYWludHMgJiYgY29uc3RyYWludHMuYXVkaW8pIHtcbiAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMuYXVkaW8pO1xuICAgIH1cbiAgICBpZiAoY29uc3RyYWludHMgJiYgdHlwZW9mIGNvbnN0cmFpbnRzLnZpZGVvID09PSAnb2JqZWN0Jykge1xuICAgICAgLy8gU2hpbSBmYWNpbmdNb2RlIGZvciBtb2JpbGUsIHdoZXJlIGl0IGRlZmF1bHRzIHRvIFwidXNlclwiLlxuICAgICAgdmFyIGZhY2UgPSBjb25zdHJhaW50cy52aWRlby5mYWNpbmdNb2RlO1xuICAgICAgZmFjZSA9IGZhY2UgJiYgKCh0eXBlb2YgZmFjZSA9PT0gJ29iamVjdCcpID8gZmFjZSA6IHtpZGVhbDogZmFjZX0pO1xuXG4gICAgICBpZiAoKGZhY2UgJiYgKGZhY2UuZXhhY3QgPT09ICd1c2VyJyB8fCBmYWNlLmV4YWN0ID09PSAnZW52aXJvbm1lbnQnIHx8XG4gICAgICAgICAgICAgICAgICAgIGZhY2UuaWRlYWwgPT09ICd1c2VyJyB8fCBmYWNlLmlkZWFsID09PSAnZW52aXJvbm1lbnQnKSkgJiZcbiAgICAgICAgICAhKG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0U3VwcG9ydGVkQ29uc3RyYWludHMgJiZcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0U3VwcG9ydGVkQ29uc3RyYWludHMoKS5mYWNpbmdNb2RlKSkge1xuICAgICAgICBkZWxldGUgY29uc3RyYWludHMudmlkZW8uZmFjaW5nTW9kZTtcbiAgICAgICAgaWYgKGZhY2UuZXhhY3QgPT09ICdlbnZpcm9ubWVudCcgfHwgZmFjZS5pZGVhbCA9PT0gJ2Vudmlyb25tZW50Jykge1xuICAgICAgICAgIC8vIExvb2sgZm9yIFwiYmFja1wiIGluIGxhYmVsLCBvciB1c2UgbGFzdCBjYW0gKHR5cGljYWxseSBiYWNrIGNhbSkuXG4gICAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcygpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGV2aWNlcykge1xuICAgICAgICAgICAgZGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGQua2luZCA9PT0gJ3ZpZGVvaW5wdXQnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYmFjayA9IGRldmljZXMuZmluZChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkLmxhYmVsLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignYmFjaycpICE9PSAtMTtcbiAgICAgICAgICAgIH0pIHx8IChkZXZpY2VzLmxlbmd0aCAmJiBkZXZpY2VzW2RldmljZXMubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgaWYgKGJhY2spIHtcbiAgICAgICAgICAgICAgY29uc3RyYWludHMudmlkZW8uZGV2aWNlSWQgPSBmYWNlLmV4YWN0ID8ge2V4YWN0OiBiYWNrLmRldmljZUlkfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpZGVhbDogYmFjay5kZXZpY2VJZH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICAgICAgICAgIGxvZ2dpbmcoJ2Nocm9tZTogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICAgICAgICByZXR1cm4gZnVuYyhjb25zdHJhaW50cyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMudmlkZW8pO1xuICAgIH1cbiAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIHJldHVybiBmdW5jKGNvbnN0cmFpbnRzKTtcbiAgfTtcblxuICB2YXIgc2hpbUVycm9yXyA9IGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZToge1xuICAgICAgICBQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InLFxuICAgICAgICBDb25zdHJhaW50Tm90U2F0aXNmaWVkRXJyb3I6ICdPdmVyY29uc3RyYWluZWRFcnJvcidcbiAgICAgIH1bZS5uYW1lXSB8fCBlLm5hbWUsXG4gICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXG4gICAgICBjb25zdHJhaW50OiBlLmNvbnN0cmFpbnROYW1lLFxuICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgKHRoaXMubWVzc2FnZSAmJiAnOiAnKSArIHRoaXMubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIHZhciBnZXRVc2VyTWVkaWFfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIHNoaW1Db25zdHJhaW50c18oY29uc3RyYWludHMsIGZ1bmN0aW9uKGMpIHtcbiAgICAgIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEoYywgb25TdWNjZXNzLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIG9uRXJyb3Ioc2hpbUVycm9yXyhlKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZ2V0VXNlck1lZGlhXztcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cbiAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9O1xuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7XG4gICAgICBnZXRVc2VyTWVkaWE6IGdldFVzZXJNZWRpYVByb21pc2VfLFxuICAgICAgZW51bWVyYXRlRGV2aWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGtpbmRzID0ge2F1ZGlvOiAnYXVkaW9pbnB1dCcsIHZpZGVvOiAndmlkZW9pbnB1dCd9O1xuICAgICAgICAgIHJldHVybiBNZWRpYVN0cmVhbVRyYWNrLmdldFNvdXJjZXMoZnVuY3Rpb24oZGV2aWNlcykge1xuICAgICAgICAgICAgcmVzb2x2ZShkZXZpY2VzLm1hcChmdW5jdGlvbihkZXZpY2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtsYWJlbDogZGV2aWNlLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IGtpbmRzW2RldmljZS5raW5kXSxcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VJZDogZGV2aWNlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ6ICcnfTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIEEgc2hpbSBmb3IgZ2V0VXNlck1lZGlhIG1ldGhvZCBvbiB0aGUgbWVkaWFEZXZpY2VzIG9iamVjdC5cbiAgLy8gVE9ETyhLYXB0ZW5KYW5zc29uKSByZW1vdmUgb25jZSBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgc3RhYmxlLlxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgICAgcmV0dXJuIGdldFVzZXJNZWRpYVByb21pc2VfKGNvbnN0cmFpbnRzKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIEV2ZW4gdGhvdWdoIENocm9tZSA0NSBoYXMgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyBhbmQgYSBnZXRVc2VyTWVkaWFcbiAgICAvLyBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgUHJvbWlzZSwgaXQgZG9lcyBub3QgYWNjZXB0IHNwZWMtc3R5bGVcbiAgICAvLyBjb25zdHJhaW50cy5cbiAgICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxuICAgICAgICBiaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY3MpIHtcbiAgICAgIHJldHVybiBzaGltQ29uc3RyYWludHNfKGNzLCBmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBvcmlnR2V0VXNlck1lZGlhKGMpLnRoZW4oZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgaWYgKGMuYXVkaW8gJiYgIXN0cmVhbS5nZXRBdWRpb1RyYWNrcygpLmxlbmd0aCB8fFxuICAgICAgICAgICAgICBjLnZpZGVvICYmICFzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHRyYWNrLnN0b3AoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignJywgJ05vdEZvdW5kRXJyb3InKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChzaGltRXJyb3JfKGUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgLy8gRHVtbXkgZGV2aWNlY2hhbmdlIGV2ZW50IG1ldGhvZHMuXG4gIC8vIFRPRE8oS2FwdGVuSmFuc3NvbikgcmVtb3ZlIG9uY2UgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIHN0YWJsZS5cbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBsb2dnaW5nKCdEdW1teSBtZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciBjYWxsZWQuJyk7XG4gICAgfTtcbiAgfVxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5tZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTRFBVdGlscyA9IHJlcXVpcmUoJ3NkcCcpO1xudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcblxudmFyIGVkZ2VTaGltID0ge1xuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh3aW5kb3cuUlRDSWNlR2F0aGVyZXIpIHtcbiAgICAgIC8vIE9SVEMgZGVmaW5lcyBhbiBSVENJY2VDYW5kaWRhdGUgb2JqZWN0IGJ1dCBubyBjb25zdHJ1Y3Rvci5cbiAgICAgIC8vIE5vdCBpbXBsZW1lbnRlZCBpbiBFZGdlLlxuICAgICAgaWYgKCF3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlKSB7XG4gICAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBPUlRDIGRvZXMgbm90IGhhdmUgYSBzZXNzaW9uIGRlc2NyaXB0aW9uIG9iamVjdCBidXRcbiAgICAgIC8vIG90aGVyIGJyb3dzZXJzIChpLmUuIENocm9tZSkgdGhhdCB3aWxsIHN1cHBvcnQgYm90aCBQQyBhbmQgT1JUQ1xuICAgICAgLy8gaW4gdGhlIGZ1dHVyZSBtaWdodCBoYXZlIHRoaXMgZGVmaW5lZCBhbHJlYWR5LlxuICAgICAgaWYgKCF3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKSB7XG4gICAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyB0aGlzIGFkZHMgYW4gYWRkaXRpb25hbCBldmVudCBsaXN0ZW5lciB0byBNZWRpYVN0cmFja1RyYWNrIHRoYXQgc2lnbmFsc1xuICAgICAgLy8gd2hlbiBhIHRyYWNrcyBlbmFibGVkIHByb3BlcnR5IHdhcyBjaGFuZ2VkLlxuICAgICAgdmFyIG9yaWdNU1RFbmFibGVkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihcbiAgICAgICAgICBNZWRpYVN0cmVhbVRyYWNrLnByb3RvdHlwZSwgJ2VuYWJsZWQnKTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShNZWRpYVN0cmVhbVRyYWNrLnByb3RvdHlwZSwgJ2VuYWJsZWQnLCB7XG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBvcmlnTVNURW5hYmxlZC5zZXQuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgdmFyIGV2ID0gbmV3IEV2ZW50KCdlbmFibGVkJyk7XG4gICAgICAgICAgZXYuZW5hYmxlZCA9IHZhbHVlO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgX2V2ZW50VGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgWydhZGRFdmVudExpc3RlbmVyJywgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLCAnZGlzcGF0Y2hFdmVudCddXG4gICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBzZWxmW21ldGhvZF0gPSBfZXZlbnRUYXJnZXRbbWV0aG9kXS5iaW5kKF9ldmVudFRhcmdldCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgIHRoaXMub25pY2VjYW5kaWRhdGUgPSBudWxsO1xuICAgICAgdGhpcy5vbmFkZHN0cmVhbSA9IG51bGw7XG4gICAgICB0aGlzLm9udHJhY2sgPSBudWxsO1xuICAgICAgdGhpcy5vbnJlbW92ZXN0cmVhbSA9IG51bGw7XG4gICAgICB0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQgPSBudWxsO1xuICAgICAgdGhpcy5vbmRhdGFjaGFubmVsID0gbnVsbDtcblxuICAgICAgdGhpcy5sb2NhbFN0cmVhbXMgPSBbXTtcbiAgICAgIHRoaXMucmVtb3RlU3RyZWFtcyA9IFtdO1xuICAgICAgdGhpcy5nZXRMb2NhbFN0cmVhbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYubG9jYWxTdHJlYW1zO1xuICAgICAgfTtcbiAgICAgIHRoaXMuZ2V0UmVtb3RlU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5yZW1vdGVTdHJlYW1zO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICcnLFxuICAgICAgICBzZHA6ICcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24gPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHNkcDogJydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zaWduYWxpbmdTdGF0ZSA9ICdzdGFibGUnO1xuICAgICAgdGhpcy5pY2VDb25uZWN0aW9uU3RhdGUgPSAnbmV3JztcbiAgICAgIHRoaXMuaWNlR2F0aGVyaW5nU3RhdGUgPSAnbmV3JztcblxuICAgICAgdGhpcy5pY2VPcHRpb25zID0ge1xuICAgICAgICBnYXRoZXJQb2xpY3k6ICdhbGwnLFxuICAgICAgICBpY2VTZXJ2ZXJzOiBbXVxuICAgICAgfTtcbiAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICBzd2l0Y2ggKGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgICBjYXNlICdhbGwnOlxuICAgICAgICAgIGNhc2UgJ3JlbGF5JzpcbiAgICAgICAgICAgIHRoaXMuaWNlT3B0aW9ucy5nYXRoZXJQb2xpY3kgPSBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAvLyBGSVhNRTogcmVtb3ZlIG9uY2UgaW1wbGVtZW50YXRpb24gYW5kIHNwZWMgaGF2ZSBhZGRlZCB0aGlzLlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaWNlVHJhbnNwb3J0UG9saWN5IFwibm9uZVwiIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gZG9uJ3Qgc2V0IGljZVRyYW5zcG9ydFBvbGljeS5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnVzaW5nQnVuZGxlID0gY29uZmlnICYmIGNvbmZpZy5idW5kbGVQb2xpY3kgPT09ICdtYXgtYnVuZGxlJztcblxuICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuaWNlU2VydmVycykge1xuICAgICAgICAvLyBFZGdlIGRvZXMgbm90IGxpa2VcbiAgICAgICAgLy8gMSkgc3R1bjpcbiAgICAgICAgLy8gMikgdHVybjogdGhhdCBkb2VzIG5vdCBoYXZlIGFsbCBvZiB0dXJuOmhvc3Q6cG9ydD90cmFuc3BvcnQ9dWRwXG4gICAgICAgIC8vIDMpIHR1cm46IHdpdGggaXB2NiBhZGRyZXNzZXNcbiAgICAgICAgdmFyIGljZVNlcnZlcnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbmZpZy5pY2VTZXJ2ZXJzKSk7XG4gICAgICAgIHRoaXMuaWNlT3B0aW9ucy5pY2VTZXJ2ZXJzID0gaWNlU2VydmVycy5maWx0ZXIoZnVuY3Rpb24oc2VydmVyKSB7XG4gICAgICAgICAgaWYgKHNlcnZlciAmJiBzZXJ2ZXIudXJscykge1xuICAgICAgICAgICAgdmFyIHVybHMgPSBzZXJ2ZXIudXJscztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdXJscyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgdXJscyA9IFt1cmxzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVybHMgPSB1cmxzLmZpbHRlcihmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICh1cmwuaW5kZXhPZigndHVybjonKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgdXJsLmluZGV4T2YoJ3RyYW5zcG9ydD11ZHAnKSAhPT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgIHVybC5pbmRleE9mKCd0dXJuOlsnKSA9PT0gLTEpIHx8XG4gICAgICAgICAgICAgICAgICAodXJsLmluZGV4T2YoJ3N0dW46JykgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgYnJvd3NlckRldGFpbHMudmVyc2lvbiA+PSAxNDM5Myk7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIHJldHVybiAhIXVybHM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG5cbiAgICAgIC8vIHBlci10cmFjayBpY2VHYXRoZXJzLCBpY2VUcmFuc3BvcnRzLCBkdGxzVHJhbnNwb3J0cywgcnRwU2VuZGVycywgLi4uXG4gICAgICAvLyBldmVyeXRoaW5nIHRoYXQgaXMgbmVlZGVkIHRvIGRlc2NyaWJlIGEgU0RQIG0tbGluZS5cbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzID0gW107XG5cbiAgICAgIC8vIHNpbmNlIHRoZSBpY2VHYXRoZXJlciBpcyBjdXJyZW50bHkgY3JlYXRlZCBpbiBjcmVhdGVPZmZlciBidXQgd2VcbiAgICAgIC8vIG11c3Qgbm90IGVtaXQgY2FuZGlkYXRlcyB1bnRpbCBhZnRlciBzZXRMb2NhbERlc2NyaXB0aW9uIHdlIGJ1ZmZlclxuICAgICAgLy8gdGhlbSBpbiB0aGlzIGFycmF5LlxuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyID0gW107XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAvLyBGSVhNRTogbmVlZCB0byBhcHBseSBpY2UgY2FuZGlkYXRlcyBpbiBhIHdheSB3aGljaCBpcyBhc3luYyBidXRcbiAgICAgIC8vIGluLW9yZGVyXG4gICAgICB0aGlzLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZW5kID0gIWV2ZW50LmNhbmRpZGF0ZSB8fCBPYmplY3Qua2V5cyhldmVudC5jYW5kaWRhdGUpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgaWYgKGVuZCkge1xuICAgICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgc2VjdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChzZWN0aW9uc1tqXS5pbmRleE9mKCdcXHJcXG5hPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHNlY3Rpb25zW2pdICs9ICdhPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZS5pbmRleE9mKCd0eXAgZW5kT2ZDYW5kaWRhdGVzJylcbiAgICAgICAgICAgID09PSAtMSkge1xuICAgICAgICAgIHNlY3Rpb25zW2V2ZW50LmNhbmRpZGF0ZS5zZHBNTGluZUluZGV4ICsgMV0gKz1cbiAgICAgICAgICAgICAgJ2E9JyArIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgKyAnXFxyXFxuJztcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwID0gc2VjdGlvbnMuam9pbignJyk7XG4gICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFldmVudC5jYW5kaWRhdGUgJiYgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgIHZhciBjb21wbGV0ZSA9IHNlbGYudHJhbnNjZWl2ZXJzLmV2ZXJ5KGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyID0gW107XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIC8vIENsb25lIGlzIG5lY2Vzc2FyeSBmb3IgbG9jYWwgZGVtb3MgbW9zdGx5LCBhdHRhY2hpbmcgZGlyZWN0bHlcbiAgICAgIC8vIHRvIHR3byBkaWZmZXJlbnQgc2VuZGVycyBkb2VzIG5vdCB3b3JrIChidWlsZCAxMDU0NykuXG4gICAgICB2YXIgY2xvbmVkU3RyZWFtID0gc3RyZWFtLmNsb25lKCk7XG4gICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaywgaWR4KSB7XG4gICAgICAgIHZhciBjbG9uZWRUcmFjayA9IGNsb25lZFN0cmVhbS5nZXRUcmFja3MoKVtpZHhdO1xuICAgICAgICB0cmFjay5hZGRFdmVudExpc3RlbmVyKCdlbmFibGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBjbG9uZWRUcmFjay5lbmFibGVkID0gZXZlbnQuZW5hYmxlZDtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubG9jYWxTdHJlYW1zLnB1c2goY2xvbmVkU3RyZWFtKTtcbiAgICAgIHRoaXMuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkKCk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICB2YXIgaWR4ID0gdGhpcy5sb2NhbFN0cmVhbXMuaW5kZXhPZihzdHJlYW0pO1xuICAgICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICAgIHRoaXMubG9jYWxTdHJlYW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFNlbmRlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zY2VpdmVycy5maWx0ZXIoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgcmV0dXJuICEhdHJhbnNjZWl2ZXIucnRwU2VuZGVyO1xuICAgICAgfSlcbiAgICAgIC5tYXAoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLnJ0cFNlbmRlcjtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFJlY2VpdmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNjZWl2ZXJzLmZpbHRlcihmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICByZXR1cm4gISF0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgIH0pXG4gICAgICAubWFwKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBEZXRlcm1pbmVzIHRoZSBpbnRlcnNlY3Rpb24gb2YgbG9jYWwgYW5kIHJlbW90ZSBjYXBhYmlsaXRpZXMuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzID1cbiAgICAgICAgZnVuY3Rpb24obG9jYWxDYXBhYmlsaXRpZXMsIHJlbW90ZUNhcGFiaWxpdGllcykge1xuICAgICAgICAgIHZhciBjb21tb25DYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgICAgICBjb2RlY3M6IFtdLFxuICAgICAgICAgICAgaGVhZGVyRXh0ZW5zaW9uczogW10sXG4gICAgICAgICAgICBmZWNNZWNoYW5pc21zOiBbXVxuICAgICAgICAgIH07XG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24obENvZGVjKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHJDb2RlYyA9IHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3NbaV07XG4gICAgICAgICAgICAgIGlmIChsQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpID09PSByQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpICYmXG4gICAgICAgICAgICAgICAgICBsQ29kZWMuY2xvY2tSYXRlID09PSByQ29kZWMuY2xvY2tSYXRlKSB7XG4gICAgICAgICAgICAgICAgLy8gbnVtYmVyIG9mIGNoYW5uZWxzIGlzIHRoZSBoaWdoZXN0IGNvbW1vbiBudW1iZXIgb2YgY2hhbm5lbHNcbiAgICAgICAgICAgICAgICByQ29kZWMubnVtQ2hhbm5lbHMgPSBNYXRoLm1pbihsQ29kZWMubnVtQ2hhbm5lbHMsXG4gICAgICAgICAgICAgICAgICAgIHJDb2RlYy5udW1DaGFubmVscyk7XG4gICAgICAgICAgICAgICAgLy8gcHVzaCByQ29kZWMgc28gd2UgcmVwbHkgd2l0aCBvZmZlcmVyIHBheWxvYWQgdHlwZVxuICAgICAgICAgICAgICAgIGNvbW1vbkNhcGFiaWxpdGllcy5jb2RlY3MucHVzaChyQ29kZWMpO1xuXG4gICAgICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIGNvbW1vbiBmZWVkYmFjayBtZWNoYW5pc21zXG4gICAgICAgICAgICAgICAgckNvZGVjLnJ0Y3BGZWVkYmFjayA9IHJDb2RlYy5ydGNwRmVlZGJhY2suZmlsdGVyKGZ1bmN0aW9uKGZiKSB7XG4gICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxDb2RlYy5ydGNwRmVlZGJhY2subGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxDb2RlYy5ydGNwRmVlZGJhY2tbal0udHlwZSA9PT0gZmIudHlwZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbENvZGVjLnJ0Y3BGZWVkYmFja1tqXS5wYXJhbWV0ZXIgPT09IGZiLnBhcmFtZXRlcikge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGFsc28gbmVlZCB0byBkZXRlcm1pbmUgLnBhcmFtZXRlcnNcbiAgICAgICAgICAgICAgICAvLyAgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVucGVlci9vcnRjL2lzc3Vlcy81NjlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihsSGVhZGVyRXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICBpKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBySGVhZGVyRXh0ZW5zaW9uID0gcmVtb3RlQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICAgICAgICBpZiAobEhlYWRlckV4dGVuc2lvbi51cmkgPT09IHJIZWFkZXJFeHRlbnNpb24udXJpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbkNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zLnB1c2gockhlYWRlckV4dGVuc2lvbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBGSVhNRTogZmVjTWVjaGFuaXNtc1xuICAgICAgICAgIHJldHVybiBjb21tb25DYXBhYmlsaXRpZXM7XG4gICAgICAgIH07XG5cbiAgICAvLyBDcmVhdGUgSUNFIGdhdGhlcmVyLCBJQ0UgdHJhbnNwb3J0IGFuZCBEVExTIHRyYW5zcG9ydC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyA9XG4gICAgICAgIGZ1bmN0aW9uKG1pZCwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICB2YXIgaWNlR2F0aGVyZXIgPSBuZXcgUlRDSWNlR2F0aGVyZXIoc2VsZi5pY2VPcHRpb25zKTtcbiAgICAgICAgICB2YXIgaWNlVHJhbnNwb3J0ID0gbmV3IFJUQ0ljZVRyYW5zcG9ydChpY2VHYXRoZXJlcik7XG4gICAgICAgICAgaWNlR2F0aGVyZXIub25sb2NhbGNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKTtcbiAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZSA9IHtzZHBNaWQ6IG1pZCwgc2RwTUxpbmVJbmRleDogc2RwTUxpbmVJbmRleH07XG5cbiAgICAgICAgICAgIHZhciBjYW5kID0gZXZ0LmNhbmRpZGF0ZTtcbiAgICAgICAgICAgIHZhciBlbmQgPSAhY2FuZCB8fCBPYmplY3Qua2V5cyhjYW5kKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICAvLyBFZGdlIGVtaXRzIGFuIGVtcHR5IG9iamVjdCBmb3IgUlRDSWNlQ2FuZGlkYXRlQ29tcGxldGXigKVcbiAgICAgICAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgICAgICAgLy8gcG9seWZpbGwgc2luY2UgUlRDSWNlR2F0aGVyZXIuc3RhdGUgaXMgbm90IGltcGxlbWVudGVkIGluXG4gICAgICAgICAgICAgIC8vIEVkZ2UgMTA1NDcgeWV0LlxuICAgICAgICAgICAgICBpZiAoaWNlR2F0aGVyZXIuc3RhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGljZUdhdGhlcmVyLnN0YXRlID0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBFbWl0IGEgY2FuZGlkYXRlIHdpdGggdHlwZSBlbmRPZkNhbmRpZGF0ZXMgdG8gbWFrZSB0aGUgc2FtcGxlc1xuICAgICAgICAgICAgICAvLyB3b3JrLiBFZGdlIHJlcXVpcmVzIGFkZEljZUNhbmRpZGF0ZSB3aXRoIHRoaXMgZW1wdHkgY2FuZGlkYXRlXG4gICAgICAgICAgICAgIC8vIHRvIHN0YXJ0IGNoZWNraW5nLiBUaGUgcmVhbCBzb2x1dGlvbiBpcyB0byBzaWduYWxcbiAgICAgICAgICAgICAgLy8gZW5kLW9mLWNhbmRpZGF0ZXMgdG8gdGhlIG90aGVyIHNpZGUgd2hlbiBnZXR0aW5nIHRoZSBudWxsXG4gICAgICAgICAgICAgIC8vIGNhbmRpZGF0ZSBidXQgc29tZSBhcHBzIChsaWtlIHRoZSBzYW1wbGVzKSBkb24ndCBkbyB0aGF0LlxuICAgICAgICAgICAgICBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlID1cbiAgICAgICAgICAgICAgICAgICdjYW5kaWRhdGU6MSAxIHVkcCAxIDAuMC4wLjAgOSB0eXAgZW5kT2ZDYW5kaWRhdGVzJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFJUQ0ljZUNhbmRpZGF0ZSBkb2Vzbid0IGhhdmUgYSBjb21wb25lbnQsIG5lZWRzIHRvIGJlIGFkZGVkXG4gICAgICAgICAgICAgIGNhbmQuY29tcG9uZW50ID0gaWNlVHJhbnNwb3J0LmNvbXBvbmVudCA9PT0gJ1JUQ1AnID8gMiA6IDE7XG4gICAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgPSBTRFBVdGlscy53cml0ZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdXBkYXRlIGxvY2FsIGRlc2NyaXB0aW9uLlxuICAgICAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgIGlmIChldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlLmluZGV4T2YoJ3R5cCBlbmRPZkNhbmRpZGF0ZXMnKVxuICAgICAgICAgICAgICAgID09PSAtMSkge1xuICAgICAgICAgICAgICBzZWN0aW9uc1tldmVudC5jYW5kaWRhdGUuc2RwTUxpbmVJbmRleCArIDFdICs9XG4gICAgICAgICAgICAgICAgICAnYT0nICsgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSArICdcXHJcXG4nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXggKyAxXSArPVxuICAgICAgICAgICAgICAgICAgJ2E9ZW5kLW9mLWNhbmRpZGF0ZXNcXHJcXG4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCA9IHNlY3Rpb25zLmpvaW4oJycpO1xuXG4gICAgICAgICAgICB2YXIgY29tcGxldGUgPSBzZWxmLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLnN0YXRlID09PSAnY29tcGxldGVkJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBFbWl0IGNhbmRpZGF0ZSBpZiBsb2NhbERlc2NyaXB0aW9uIGlzIHNldC5cbiAgICAgICAgICAgIC8vIEFsc28gZW1pdHMgbnVsbCBjYW5kaWRhdGUgd2hlbiBhbGwgZ2F0aGVyZXJzIGFyZSBjb21wbGV0ZS5cbiAgICAgICAgICAgIHN3aXRjaCAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSkge1xuICAgICAgICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kICYmIGNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2dhdGhlcmluZyc6XG4gICAgICAgICAgICAgICAgc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcygpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUobmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2NvbXBsZXRlJzpcbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgbm90IGhhcHBlbi4uLiBjdXJyZW50bHkhXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG5vLW9wLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWNlVHJhbnNwb3J0Lm9uaWNlc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydCA9IG5ldyBSVENEdGxzVHJhbnNwb3J0KGljZVRyYW5zcG9ydCk7XG4gICAgICAgICAgZHRsc1RyYW5zcG9ydC5vbmR0bHNzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIG9uZXJyb3IgZG9lcyBub3Qgc2V0IHN0YXRlIHRvIGZhaWxlZCBieSBpdHNlbGYuXG4gICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXRlID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGljZUdhdGhlcmVyOiBpY2VHYXRoZXJlcixcbiAgICAgICAgICAgIGljZVRyYW5zcG9ydDogaWNlVHJhbnNwb3J0LFxuICAgICAgICAgICAgZHRsc1RyYW5zcG9ydDogZHRsc1RyYW5zcG9ydFxuICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAvLyBTdGFydCB0aGUgUlRQIFNlbmRlciBhbmQgUmVjZWl2ZXIgZm9yIGEgdHJhbnNjZWl2ZXIuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdHJhbnNjZWl2ZSA9IGZ1bmN0aW9uKHRyYW5zY2VpdmVyLFxuICAgICAgICBzZW5kLCByZWN2KSB7XG4gICAgICB2YXIgcGFyYW1zID0gdGhpcy5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcyk7XG4gICAgICBpZiAoc2VuZCAmJiB0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgIHBhcmFtcy5ydGNwID0ge1xuICAgICAgICAgIGNuYW1lOiBTRFBVdGlscy5sb2NhbENOYW1lXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHBhcmFtcy5ydGNwLnNzcmMgPSB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmM7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnNlbmQocGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZWN2ICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgICAgIC8vIHJlbW92ZSBSVFggZmllbGQgaW4gRWRnZSAxNDk0MlxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ3ZpZGVvJ1xuICAgICAgICAgICAgJiYgdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycykge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICBkZWxldGUgcC5ydHg7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgIHBhcmFtcy5ydGNwID0ge1xuICAgICAgICAgIGNuYW1lOiB0cmFuc2NlaXZlci5jbmFtZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXJhbXMucnRjcC5zc3JjID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnJlY2VpdmUocGFyYW1zKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uID1cbiAgICAgICAgZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIHNlY3Rpb25zO1xuICAgICAgICAgIHZhciBzZXNzaW9ucGFydDtcbiAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJykge1xuICAgICAgICAgICAgLy8gRklYTUU6IFdoYXQgd2FzIHRoZSBwdXJwb3NlIG9mIHRoaXMgZW1wdHkgaWYgc3RhdGVtZW50P1xuICAgICAgICAgICAgLy8gaWYgKCF0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgICAgICAgIC8vIFZFUlkgbGltaXRlZCBzdXBwb3J0IGZvciBTRFAgbXVuZ2luZy4gTGltaXRlZCB0bzpcbiAgICAgICAgICAgICAgLy8gKiBjaGFuZ2luZyB0aGUgb3JkZXIgb2YgY29kZWNzXG4gICAgICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhcHMgPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9wZW5kaW5nT2ZmZXJbc2RwTUxpbmVJbmRleF0ubG9jYWxDYXBhYmlsaXRpZXMgPSBjYXBzO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy50cmFuc2NlaXZlcnMgPSB0aGlzLl9wZW5kaW5nT2ZmZXI7XG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wZW5kaW5nT2ZmZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJykge1xuICAgICAgICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHNlbGYucmVtb3RlRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBpc0ljZUxpdGUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChzZXNzaW9ucGFydCxcbiAgICAgICAgICAgICAgICAnYT1pY2UtbGl0ZScpLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICB2YXIgdHJhbnNjZWl2ZXIgPSBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgdmFyIGljZUdhdGhlcmVyID0gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHZhciByZW1vdGVDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXM7XG5cbiAgICAgICAgICAgICAgdmFyIHJlamVjdGVkID0gbWVkaWFTZWN0aW9uLnNwbGl0KCdcXG4nLCAxKVswXVxuICAgICAgICAgICAgICAgICAgLnNwbGl0KCcgJywgMilbMV0gPT09ICcwJztcblxuICAgICAgICAgICAgICBpZiAoIXJlamVjdGVkICYmICF0cmFuc2NlaXZlci5pc0RhdGFjaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUljZVBhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzKFxuICAgICAgICAgICAgICAgICAgICBtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNJY2VMaXRlKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgY2FuZHMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWNhbmRpZGF0ZTonKVxuICAgICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihjYW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbmQuY29tcG9uZW50ID09PSAnMSc7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIC8vIGljZS1saXRlIG9ubHkgaW5jbHVkZXMgaG9zdCBjYW5kaWRhdGVzIGluIHRoZSBTRFAgc28gd2UgY2FuXG4gICAgICAgICAgICAgICAgICAvLyB1c2Ugc2V0UmVtb3RlQ2FuZGlkYXRlcyAod2hpY2ggaW1wbGllcyBhblxuICAgICAgICAgICAgICAgICAgLy8gUlRDSWNlQ2FuZGlkYXRlQ29tcGxldGUpXG4gICAgICAgICAgICAgICAgICBpZiAoY2FuZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUR0bHNQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMoXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChpc0ljZUxpdGUpIHtcbiAgICAgICAgICAgICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzLnJvbGUgPSAnc2VydmVyJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXNlbGYudXNpbmdCdW5kbGUgfHwgc2RwTUxpbmVJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgIGlzSWNlTGl0ZSA/ICdjb250cm9sbGluZycgOiAnY29udHJvbGxlZCcpO1xuICAgICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGFydChyZW1vdGVEdGxzUGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGludGVyc2VjdGlvbiBvZiBjYXBhYmlsaXRpZXMuXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHNlbGYuX2dldENvbW1vbkNhcGFiaWxpdGllcyhsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzKTtcblxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBTZW5kZXIuIFRoZSBSVENSdHBSZWNlaXZlciBmb3IgdGhpc1xuICAgICAgICAgICAgICAgIC8vIHRyYW5zY2VpdmVyIGhhcyBhbHJlYWR5IGJlZW4gc3RhcnRlZCBpbiBzZXRSZW1vdGVEZXNjcmlwdGlvbi5cbiAgICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY29kZWNzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcbiAgICAgICAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXG4gICAgICAgICAgfTtcbiAgICAgICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ29mZmVyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2hhdmUtbG9jYWwtb2ZmZXInKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbnN3ZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5zdXBwb3J0ZWQgdHlwZSBcIicgKyBkZXNjcmlwdGlvbi50eXBlICtcbiAgICAgICAgICAgICAgICAgICdcIicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIGEgc3VjY2VzcyBjYWxsYmFjayB3YXMgcHJvdmlkZWQsIGVtaXQgSUNFIGNhbmRpZGF0ZXMgYWZ0ZXIgaXRcbiAgICAgICAgICAvLyBoYXMgYmVlbiBleGVjdXRlZC4gT3RoZXJ3aXNlLCBlbWl0IGNhbGxiYWNrIGFmdGVyIHRoZSBQcm9taXNlIGlzXG4gICAgICAgICAgLy8gcmVzb2x2ZWQuXG4gICAgICAgICAgdmFyIGhhc0NhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbic7XG4gICAgICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgY2IgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdnYXRoZXJpbmcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMoKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgIHAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdnYXRoZXJpbmcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFVzdWFsbHkgY2FuZGlkYXRlcyB3aWxsIGJlIGVtaXR0ZWQgZWFybGllci5cbiAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcy5iaW5kKHNlbGYpLCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRSZW1vdGVEZXNjcmlwdGlvbiA9XG4gICAgICAgIGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBzdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgICB2YXIgcmVjZWl2ZXJMaXN0ID0gW107XG4gICAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgIHZhciBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgdmFyIGlzSWNlTGl0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxuICAgICAgICAgICAgICAnYT1pY2UtbGl0ZScpLmxlbmd0aCA+IDA7XG4gICAgICAgICAgdGhpcy51c2luZ0J1bmRsZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxuICAgICAgICAgICAgICAnYT1ncm91cDpCVU5ETEUgJykubGVuZ3RoID4gMDtcbiAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgdmFyIG1saW5lID0gbGluZXNbMF0uc3Vic3RyKDIpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICB2YXIga2luZCA9IG1saW5lWzBdO1xuICAgICAgICAgICAgdmFyIHJlamVjdGVkID0gbWxpbmVbMV0gPT09ICcwJztcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBTRFBVdGlscy5nZXREaXJlY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG5cbiAgICAgICAgICAgIHZhciBtaWQgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPW1pZDonKTtcbiAgICAgICAgICAgIGlmIChtaWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG1pZCA9IG1pZFswXS5zdWJzdHIoNik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtaWQgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVqZWN0IGRhdGFjaGFubmVscyB3aGljaCBhcmUgbm90IGltcGxlbWVudGVkIHlldC5cbiAgICAgICAgICAgIGlmIChraW5kID09PSAnYXBwbGljYXRpb24nICYmIG1saW5lWzJdID09PSAnRFRMUy9TQ1RQJykge1xuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICAgICAgICBtaWQ6IG1pZCxcbiAgICAgICAgICAgICAgICBpc0RhdGFjaGFubmVsOiB0cnVlXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRyYW5zY2VpdmVyO1xuICAgICAgICAgICAgdmFyIGljZUdhdGhlcmVyO1xuICAgICAgICAgICAgdmFyIGljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgdmFyIHJ0cFNlbmRlcjtcbiAgICAgICAgICAgIHZhciBydHBSZWNlaXZlcjtcbiAgICAgICAgICAgIHZhciBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXM7XG5cbiAgICAgICAgICAgIHZhciB0cmFjaztcbiAgICAgICAgICAgIC8vIEZJWE1FOiBlbnN1cmUgdGhlIG1lZGlhU2VjdGlvbiBoYXMgcnRjcC1tdXggc2V0LlxuICAgICAgICAgICAgdmFyIHJlbW90ZUNhcGFiaWxpdGllcyA9IFNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgdmFyIHJlbW90ZUljZVBhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgcmVtb3RlRHRsc1BhcmFtZXRlcnM7XG4gICAgICAgICAgICBpZiAoIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHJlbW90ZUljZVBhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAgIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgcmVtb3RlRHRsc1BhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzLnJvbGUgPSAnY2xpZW50JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMgPVxuICAgICAgICAgICAgICAgIFNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBjbmFtZTtcbiAgICAgICAgICAgIC8vIEdldHMgdGhlIGZpcnN0IFNTUkMuIE5vdGUgdGhhdCB3aXRoIFJUWCB0aGVyZSBtaWdodCBiZSBtdWx0aXBsZVxuICAgICAgICAgICAgLy8gU1NSQ3MuXG4gICAgICAgICAgICB2YXIgcmVtb3RlU3NyYyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvYmouYXR0cmlidXRlID09PSAnY25hbWUnO1xuICAgICAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKHJlbW90ZVNzcmMpIHtcbiAgICAgICAgICAgICAgY25hbWUgPSByZW1vdGVTc3JjLnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaXNDb21wbGV0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAnYT1lbmQtb2YtY2FuZGlkYXRlcycsIHNlc3Npb25wYXJ0KS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgdmFyIGNhbmRzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1jYW5kaWRhdGU6JylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbmQuY29tcG9uZW50ID09PSAnMSc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJyAmJiAhcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSBzZWxmLnVzaW5nQnVuZGxlICYmIHNkcE1MaW5lSW5kZXggPiAwID8ge1xuICAgICAgICAgICAgICAgIGljZUdhdGhlcmVyOiBzZWxmLnRyYW5zY2VpdmVyc1swXS5pY2VHYXRoZXJlcixcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHNlbGYudHJhbnNjZWl2ZXJzWzBdLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0OiBzZWxmLnRyYW5zY2VpdmVyc1swXS5kdGxzVHJhbnNwb3J0XG4gICAgICAgICAgICAgIH0gOiBzZWxmLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyhtaWQsIHNkcE1MaW5lSW5kZXgpO1xuXG4gICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQuc2V0UmVtb3RlQ2FuZGlkYXRlcyhjYW5kcyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IFJUQ1J0cFJlY2VpdmVyLmdldENhcGFiaWxpdGllcyhraW5kKTtcblxuICAgICAgICAgICAgICAvLyBmaWx0ZXIgUlRYIHVudGlsIGFkZGl0aW9uYWwgc3R1ZmYgbmVlZGVkIGZvciBSVFggaXMgaW1wbGVtZW50ZWRcbiAgICAgICAgICAgICAgLy8gaW4gYWRhcHRlci5qc1xuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MgPSBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oY29kZWMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvZGVjLm5hbWUgIT09ICdydHgnO1xuICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IFt7XG4gICAgICAgICAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMikgKiAxMDAxXG4gICAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICAgIHJ0cFJlY2VpdmVyID0gbmV3IFJUQ1J0cFJlY2VpdmVyKHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCwga2luZCk7XG5cbiAgICAgICAgICAgICAgdHJhY2sgPSBydHBSZWNlaXZlci50cmFjaztcbiAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlcl0pO1xuICAgICAgICAgICAgICAvLyBGSVhNRTogbm90IGNvcnJlY3Qgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgc3RyZWFtcyBidXQgdGhhdCBpc1xuICAgICAgICAgICAgICAvLyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiB0aGlzIHNoaW0uXG4gICAgICAgICAgICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XG5cbiAgICAgICAgICAgICAgLy8gRklYTUU6IGxvb2sgYXQgZGlyZWN0aW9uLlxuICAgICAgICAgICAgICBpZiAoc2VsZi5sb2NhbFN0cmVhbXMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgc2VsZi5sb2NhbFN0cmVhbXNbMF0uZ2V0VHJhY2tzKCkubGVuZ3RoID49IHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxUcmFjaztcbiAgICAgICAgICAgICAgICBpZiAoa2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgICAgICAgbG9jYWxUcmFjayA9IHNlbGYubG9jYWxTdHJlYW1zWzBdLmdldEF1ZGlvVHJhY2tzKClbMF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgICAgICAgICBsb2NhbFRyYWNrID0gc2VsZi5sb2NhbFN0cmVhbXNbMF0uZ2V0VmlkZW9UcmFja3MoKVswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsVHJhY2spIHtcbiAgICAgICAgICAgICAgICAgIHJ0cFNlbmRlciA9IG5ldyBSVENSdHBTZW5kZXIobG9jYWxUcmFjayxcbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdID0ge1xuICAgICAgICAgICAgICAgIGljZUdhdGhlcmVyOiB0cmFuc3BvcnRzLmljZUdhdGhlcmVyLFxuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydDogdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQsXG4gICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydDogdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LFxuICAgICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzOiBsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXM6IHJlbW90ZUNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICBydHBTZW5kZXI6IHJ0cFNlbmRlcixcbiAgICAgICAgICAgICAgICBydHBSZWNlaXZlcjogcnRwUmVjZWl2ZXIsXG4gICAgICAgICAgICAgICAga2luZDoga2luZCxcbiAgICAgICAgICAgICAgICBtaWQ6IG1pZCxcbiAgICAgICAgICAgICAgICBjbmFtZTogY25hbWUsXG4gICAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVyczogc2VuZEVuY29kaW5nUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzOiByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBSZWNlaXZlciBub3cuIFRoZSBSVFBTZW5kZXIgaXMgc3RhcnRlZCBpblxuICAgICAgICAgICAgICAvLyBzZXRMb2NhbERlc2NyaXB0aW9uLlxuICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLFxuICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicgJiYgIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHRyYW5zY2VpdmVyID0gc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XG4gICAgICAgICAgICAgIGljZUdhdGhlcmVyID0gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICAgIGljZVRyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHJ0cFNlbmRlciA9IHRyYW5zY2VpdmVyLnJ0cFNlbmRlcjtcbiAgICAgICAgICAgICAgcnRwUmVjZWl2ZXIgPSB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXM7XG5cbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XG4gICAgICAgICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5yZW1vdGVDYXBhYmlsaXRpZXMgPVxuICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzO1xuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5jbmFtZSA9IGNuYW1lO1xuXG4gICAgICAgICAgICAgIGlmICgoaXNJY2VMaXRlIHx8IGlzQ29tcGxldGUpICYmIGNhbmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoIXNlbGYudXNpbmdCdW5kbGUgfHwgc2RwTUxpbmVJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zdGFydChpY2VHYXRoZXJlciwgcmVtb3RlSWNlUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRyb2xsaW5nJyk7XG4gICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGFydChyZW1vdGVEdGxzUGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3JlY3Zvbmx5JyxcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpO1xuXG4gICAgICAgICAgICAgIGlmIChydHBSZWNlaXZlciAmJlxuICAgICAgICAgICAgICAgICAgKGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpKSB7XG4gICAgICAgICAgICAgICAgdHJhY2sgPSBydHBSZWNlaXZlci50cmFjaztcbiAgICAgICAgICAgICAgICByZWNlaXZlckxpc3QucHVzaChbdHJhY2ssIHJ0cFJlY2VpdmVyXSk7XG4gICAgICAgICAgICAgICAgc3RyZWFtLmFkZFRyYWNrKHRyYWNrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogYWN0dWFsbHkgdGhlIHJlY2VpdmVyIHNob3VsZCBiZSBjcmVhdGVkIGxhdGVyLlxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLnR5cGUsXG4gICAgICAgICAgICBzZHA6IGRlc2NyaXB0aW9uLnNkcFxuICAgICAgICAgIH07XG4gICAgICAgICAgc3dpdGNoIChkZXNjcmlwdGlvbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdvZmZlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdoYXZlLXJlbW90ZS1vZmZlcicpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fuc3dlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdzdGFibGUnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bnN1cHBvcnRlZCB0eXBlIFwiJyArIGRlc2NyaXB0aW9uLnR5cGUgK1xuICAgICAgICAgICAgICAgICAgJ1wiJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdHJlYW0uZ2V0VHJhY2tzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWxmLnJlbW90ZVN0cmVhbXMucHVzaChzdHJlYW0pO1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnYWRkc3RyZWFtJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbSA9IHN0cmVhbTtcbiAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgaWYgKHNlbGYub25hZGRzdHJlYW0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYub25hZGRzdHJlYW0oZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciB0cmFjayA9IGl0ZW1bMF07XG4gICAgICAgICAgICAgICAgdmFyIHJlY2VpdmVyID0gaXRlbVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdHJhY2tFdmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC5yZWNlaXZlciA9IHJlY2VpdmVyO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQuc3RyZWFtcyA9IFtzdHJlYW1dO1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub250cmFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub250cmFjayh0cmFja0V2ZW50KTtcbiAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1sxXSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgLyogbm90IHlldFxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0KSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIEZJWE1FOiBjbGVhbiB1cCB0cmFja3MsIGxvY2FsIHN0cmVhbXMsIHJlbW90ZSBzdHJlYW1zLCBldGNcbiAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdjbG9zZWQnKTtcbiAgICB9O1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzaWduYWxpbmcgc3RhdGUuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlU2lnbmFsaW5nU3RhdGUgPVxuICAgICAgICBmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgICAgICAgIHRoaXMuc2lnbmFsaW5nU3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3NpZ25hbGluZ3N0YXRlY2hhbmdlJyk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICBpZiAodGhpcy5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGZpcmUgdGhlIG5lZ290aWF0aW9ubmVlZGVkIGV2ZW50LlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkID1cbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gRmlyZSBhd2F5IChmb3Igbm93KS5cbiAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ25lZ290aWF0aW9ubmVlZGVkJyk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICBpZiAodGhpcy5vbm5lZ290aWF0aW9ubmVlZGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgY29ubmVjdGlvbiBzdGF0ZS5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGVDb25uZWN0aW9uU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBuZXdTdGF0ZTtcbiAgICAgIHZhciBzdGF0ZXMgPSB7XG4gICAgICAgICduZXcnOiAwLFxuICAgICAgICBjbG9zZWQ6IDAsXG4gICAgICAgIGNvbm5lY3Rpbmc6IDAsXG4gICAgICAgIGNoZWNraW5nOiAwLFxuICAgICAgICBjb25uZWN0ZWQ6IDAsXG4gICAgICAgIGNvbXBsZXRlZDogMCxcbiAgICAgICAgZmFpbGVkOiAwXG4gICAgICB9O1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICBzdGF0ZXNbdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0YXRlXSsrO1xuICAgICAgICBzdGF0ZXNbdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5zdGF0ZV0rKztcbiAgICAgIH0pO1xuICAgICAgLy8gSUNFVHJhbnNwb3J0LmNvbXBsZXRlZCBhbmQgY29ubmVjdGVkIGFyZSB0aGUgc2FtZSBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgc3RhdGVzLmNvbm5lY3RlZCArPSBzdGF0ZXMuY29tcGxldGVkO1xuXG4gICAgICBuZXdTdGF0ZSA9ICduZXcnO1xuICAgICAgaWYgKHN0YXRlcy5mYWlsZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2ZhaWxlZCc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0aW5nID4gMCB8fCBzdGF0ZXMuY2hlY2tpbmcgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RpbmcnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuZGlzY29ubmVjdGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMubmV3ID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICduZXcnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGVkID4gMCB8fCBzdGF0ZXMuY29tcGxldGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgICAgfVxuXG4gICAgICBpZiAobmV3U3RhdGUgIT09IHNlbGYuaWNlQ29ubmVjdGlvblN0YXRlKSB7XG4gICAgICAgIHNlbGYuaWNlQ29ubmVjdGlvblN0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlJyk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIGlmICh0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZShldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVPZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgaWYgKHRoaXMuX3BlbmRpbmdPZmZlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWF0ZU9mZmVyIGNhbGxlZCB3aGlsZSB0aGVyZSBpcyBhIHBlbmRpbmcgb2ZmZXIuJyk7XG4gICAgICB9XG4gICAgICB2YXIgb2ZmZXJPcHRpb25zO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1swXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvZmZlck9wdGlvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgb2ZmZXJPcHRpb25zID0gYXJndW1lbnRzWzJdO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHJhY2tzID0gW107XG4gICAgICB2YXIgbnVtQXVkaW9UcmFja3MgPSAwO1xuICAgICAgdmFyIG51bVZpZGVvVHJhY2tzID0gMDtcbiAgICAgIC8vIERlZmF1bHQgdG8gc2VuZHJlY3YuXG4gICAgICBpZiAodGhpcy5sb2NhbFN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICAgIG51bUF1ZGlvVHJhY2tzID0gdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGg7XG4gICAgICAgIG51bVZpZGVvVHJhY2tzID0gdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0VmlkZW9UcmFja3MoKS5sZW5ndGg7XG4gICAgICB9XG4gICAgICAvLyBEZXRlcm1pbmUgbnVtYmVyIG9mIGF1ZGlvIGFuZCB2aWRlbyB0cmFja3Mgd2UgbmVlZCB0byBzZW5kL3JlY3YuXG4gICAgICBpZiAob2ZmZXJPcHRpb25zKSB7XG4gICAgICAgIC8vIFJlamVjdCBDaHJvbWUgbGVnYWN5IGNvbnN0cmFpbnRzLlxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm1hbmRhdG9yeSB8fCBvZmZlck9wdGlvbnMub3B0aW9uYWwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICAnTGVnYWN5IG1hbmRhdG9yeS9vcHRpb25hbCBjb25zdHJhaW50cyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbnVtQXVkaW9UcmFja3MgPSBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbztcbiAgICAgICAgfVxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG51bVZpZGVvVHJhY2tzID0gb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW87XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxvY2FsU3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgICAgLy8gUHVzaCBsb2NhbCBzdHJlYW1zLlxuICAgICAgICB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogdHJhY2sua2luZCxcbiAgICAgICAgICAgIHRyYWNrOiB0cmFjayxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cmFjay5raW5kID09PSAnYXVkaW8nID9cbiAgICAgICAgICAgICAgICBudW1BdWRpb1RyYWNrcyA+IDAgOiBudW1WaWRlb1RyYWNrcyA+IDBcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAodHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgbnVtQXVkaW9UcmFja3MtLTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRyYWNrLmtpbmQgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAgIG51bVZpZGVvVHJhY2tzLS07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIC8vIENyZWF0ZSBNLWxpbmVzIGZvciByZWN2b25seSBzdHJlYW1zLlxuICAgICAgd2hpbGUgKG51bUF1ZGlvVHJhY2tzID4gMCB8fCBudW1WaWRlb1RyYWNrcyA+IDApIHtcbiAgICAgICAgaWYgKG51bUF1ZGlvVHJhY2tzID4gMCkge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6ICdhdWRpbycsXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG51bUF1ZGlvVHJhY2tzLS07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG51bVZpZGVvVHJhY2tzID4gMCkge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6ICd2aWRlbycsXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG51bVZpZGVvVHJhY2tzLS07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlKCk7XG4gICAgICB2YXIgdHJhbnNjZWl2ZXJzID0gW107XG4gICAgICB0cmFja3MuZm9yRWFjaChmdW5jdGlvbihtbGluZSwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAvLyBGb3IgZWFjaCB0cmFjaywgY3JlYXRlIGFuIGljZSBnYXRoZXJlciwgaWNlIHRyYW5zcG9ydCxcbiAgICAgICAgLy8gZHRscyB0cmFuc3BvcnQsIHBvdGVudGlhbGx5IHJ0cHNlbmRlciBhbmQgcnRwcmVjZWl2ZXIuXG4gICAgICAgIHZhciB0cmFjayA9IG1saW5lLnRyYWNrO1xuICAgICAgICB2YXIga2luZCA9IG1saW5lLmtpbmQ7XG4gICAgICAgIHZhciBtaWQgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcblxuICAgICAgICB2YXIgdHJhbnNwb3J0cyA9IHNlbGYudXNpbmdCdW5kbGUgJiYgc2RwTUxpbmVJbmRleCA+IDAgPyB7XG4gICAgICAgICAgaWNlR2F0aGVyZXI6IHRyYW5zY2VpdmVyc1swXS5pY2VHYXRoZXJlcixcbiAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zY2VpdmVyc1swXS5pY2VUcmFuc3BvcnQsXG4gICAgICAgICAgZHRsc1RyYW5zcG9ydDogdHJhbnNjZWl2ZXJzWzBdLmR0bHNUcmFuc3BvcnRcbiAgICAgICAgfSA6IHNlbGYuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzKG1pZCwgc2RwTUxpbmVJbmRleCk7XG5cbiAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzID0gUlRDUnRwU2VuZGVyLmdldENhcGFiaWxpdGllcyhraW5kKTtcbiAgICAgICAgLy8gZmlsdGVyIFJUWCB1bnRpbCBhZGRpdGlvbmFsIHN0dWZmIG5lZWRlZCBmb3IgUlRYIGlzIGltcGxlbWVudGVkXG4gICAgICAgIC8vIGluIGFkYXB0ZXIuanNcbiAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzID0gbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZpbHRlcihcbiAgICAgICAgICAgIGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjb2RlYy5uYW1lICE9PSAncnR4JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgICAgICAgIC8vIHdvcmsgYXJvdW5kIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC93ZWJydGMvaXNzdWVzL2RldGFpbD9pZD02NTUyXG4gICAgICAgICAgLy8gYnkgYWRkaW5nIGxldmVsLWFzeW1tZXRyeS1hbGxvd2VkPTFcbiAgICAgICAgICBpZiAoY29kZWMubmFtZSA9PT0gJ0gyNjQnICYmXG4gICAgICAgICAgICAgIGNvZGVjLnBhcmFtZXRlcnNbJ2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkJ10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29kZWMucGFyYW1ldGVyc1snbGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQnXSA9ICcxJztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBydHBTZW5kZXI7XG4gICAgICAgIHZhciBydHBSZWNlaXZlcjtcblxuICAgICAgICAvLyBnZW5lcmF0ZSBhbiBzc3JjIG5vdywgdG8gYmUgdXNlZCBsYXRlciBpbiBydHBTZW5kZXIuc2VuZFxuICAgICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IFt7XG4gICAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMSkgKiAxMDAxXG4gICAgICAgIH1dO1xuICAgICAgICBpZiAodHJhY2spIHtcbiAgICAgICAgICBydHBTZW5kZXIgPSBuZXcgUlRDUnRwU2VuZGVyKHRyYWNrLCB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1saW5lLndhbnRSZWNlaXZlKSB7XG4gICAgICAgICAgcnRwUmVjZWl2ZXIgPSBuZXcgUlRDUnRwUmVjZWl2ZXIodHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LCBraW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICBpY2VHYXRoZXJlcjogdHJhbnNwb3J0cy5pY2VHYXRoZXJlcixcbiAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LFxuICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCxcbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllczogbG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzOiBudWxsLFxuICAgICAgICAgIHJ0cFNlbmRlcjogcnRwU2VuZGVyLFxuICAgICAgICAgIHJ0cFJlY2VpdmVyOiBydHBSZWNlaXZlcixcbiAgICAgICAgICBraW5kOiBraW5kLFxuICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM6IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMsXG4gICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVyczogbnVsbFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy51c2luZ0J1bmRsZSkge1xuICAgICAgICBzZHAgKz0gJ2E9Z3JvdXA6QlVORExFICcgKyB0cmFuc2NlaXZlcnMubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gdC5taWQ7XG4gICAgICAgIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuICAgICAgfVxuICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24obWxpbmUsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gdHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcywgJ29mZmVyJywgc2VsZi5sb2NhbFN0cmVhbXNbMF0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3BlbmRpbmdPZmZlciA9IHRyYW5zY2VpdmVycztcbiAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICdvZmZlcicsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzBdLCAwLCBkZXNjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVzYyk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSgpO1xuICAgICAgaWYgKHRoaXMudXNpbmdCdW5kbGUpIHtcbiAgICAgICAgc2RwICs9ICdhPWdyb3VwOkJVTkRMRSAnICsgdGhpcy50cmFuc2NlaXZlcnMubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gdC5taWQ7XG4gICAgICAgIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuICAgICAgfVxuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuaXNEYXRhY2hhbm5lbCkge1xuICAgICAgICAgIHNkcCArPSAnbT1hcHBsaWNhdGlvbiAwIERUTFMvU0NUUCA1MDAwXFxyXFxuJyArXG4gICAgICAgICAgICAgICdjPUlOIElQNCAwLjAuMC4wXFxyXFxuJyArXG4gICAgICAgICAgICAgICdhPW1pZDonICsgdHJhbnNjZWl2ZXIubWlkICsgJ1xcclxcbic7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxuICAgICAgICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0gc2VsZi5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xuXG4gICAgICAgIHNkcCArPSBTRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbih0cmFuc2NlaXZlciwgY29tbW9uQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgJ2Fuc3dlcicsIHNlbGYubG9jYWxTdHJlYW1zWzBdKTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnYW5zd2VyJyxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMF0sIDAsIGRlc2MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgICAgIGlmIChjYW5kaWRhdGUgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5hZGRSZW1vdGVDYW5kaWRhdGUoe30pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtTGluZUluZGV4ID0gY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXg7XG4gICAgICAgIGlmIChjYW5kaWRhdGUuc2RwTWlkKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYW5zY2VpdmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNjZWl2ZXJzW2ldLm1pZCA9PT0gY2FuZGlkYXRlLnNkcE1pZCkge1xuICAgICAgICAgICAgICBtTGluZUluZGV4ID0gaTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHRoaXMudHJhbnNjZWl2ZXJzW21MaW5lSW5kZXhdO1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgICB2YXIgY2FuZCA9IE9iamVjdC5rZXlzKGNhbmRpZGF0ZS5jYW5kaWRhdGUpLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kaWRhdGUuY2FuZGlkYXRlKSA6IHt9O1xuICAgICAgICAgIC8vIElnbm9yZSBDaHJvbWUncyBpbnZhbGlkIGNhbmRpZGF0ZXMgc2luY2UgRWRnZSBkb2VzIG5vdCBsaWtlIHRoZW0uXG4gICAgICAgICAgaWYgKGNhbmQucHJvdG9jb2wgPT09ICd0Y3AnICYmIChjYW5kLnBvcnQgPT09IDAgfHwgY2FuZC5wb3J0ID09PSA5KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZ25vcmUgUlRDUCBjYW5kaWRhdGVzLCB3ZSBhc3N1bWUgUlRDUC1NVVguXG4gICAgICAgICAgaWYgKGNhbmQuY29tcG9uZW50ICE9PSAnMScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQSBkaXJ0eSBoYWNrIHRvIG1ha2Ugc2FtcGxlcyB3b3JrLlxuICAgICAgICAgIGlmIChjYW5kLnR5cGUgPT09ICdlbmRPZkNhbmRpZGF0ZXMnKSB7XG4gICAgICAgICAgICBjYW5kID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5hZGRSZW1vdGVDYW5kaWRhdGUoY2FuZCk7XG5cbiAgICAgICAgICAvLyB1cGRhdGUgdGhlIHJlbW90ZURlc2NyaXB0aW9uLlxuICAgICAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnModGhpcy5yZW1vdGVEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgIHNlY3Rpb25zW21MaW5lSW5kZXggKyAxXSArPSAoY2FuZC50eXBlID8gY2FuZGlkYXRlLmNhbmRpZGF0ZS50cmltKClcbiAgICAgICAgICAgICAgOiAnYT1lbmQtb2YtY2FuZGlkYXRlcycpICsgJ1xcclxcbic7XG4gICAgICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbi5zZHAgPSBzZWN0aW9ucy5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzFdLCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIFsncnRwU2VuZGVyJywgJ3J0cFJlY2VpdmVyJywgJ2ljZUdhdGhlcmVyJywgJ2ljZVRyYW5zcG9ydCcsXG4gICAgICAgICAgICAnZHRsc1RyYW5zcG9ydCddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICAgIGlmICh0cmFuc2NlaXZlclttZXRob2RdKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0cmFuc2NlaXZlclttZXRob2RdLmdldFN0YXRzKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGNiID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgIGFyZ3VtZW50c1sxXTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgTWFwKCk7XG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMocmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMuc2V0KGlkLCByZXN1bHRbaWRdKTtcbiAgICAgICAgICAgICAgcmVzdWx0c1tpZF0gPSByZXN1bHRbaWRdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYiwgMCwgcmVzdWx0cyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzaGltRXJyb3JfID0gZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB7UGVybWlzc2lvbkRlbmllZEVycm9yOiAnTm90QWxsb3dlZEVycm9yJ31bZS5uYW1lXSB8fCBlLm5hbWUsXG4gICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXG4gICAgICBjb25zdHJhaW50OiBlLmNvbnN0cmFpbnQsXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBnZXRVc2VyTWVkaWEgZXJyb3Igc2hpbS5cbiAgdmFyIG9yaWdHZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYS5cbiAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBvcmlnR2V0VXNlck1lZGlhKGMpLmNhdGNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChzaGltRXJyb3JfKGUpKTtcbiAgICB9KTtcbiAgfTtcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcblxudmFyIGZpcmVmb3hTaGltID0ge1xuICBzaGltT25UcmFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJiAhKCdvbnRyYWNrJyBpblxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsICdvbnRyYWNrJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9vbnRyYWNrO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2spO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEZpcmVmb3ggaGFzIHN1cHBvcnRlZCBtb3pTcmNPYmplY3Qgc2luY2UgRkYyMiwgdW5wcmVmaXhlZCBpbiA0Mi5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudCAmJlxuICAgICAgICAhKCdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgLy8gU2hpbSB0aGUgc3JjT2JqZWN0IHByb3BlcnR5LCBvbmNlLCB3aGVuIEhUTUxNZWRpYUVsZW1lbnQgaXMgZm91bmQuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUsICdzcmNPYmplY3QnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1velNyY09iamVjdDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGlzLm1velNyY09iamVjdCA9IHN0cmVhbTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAnb2JqZWN0JyB8fCAhKHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiB8fFxuICAgICAgICB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24pKSB7XG4gICAgICByZXR1cm47IC8vIHByb2JhYmx5IG1lZGlhLnBlZXJjb25uZWN0aW9uLmVuYWJsZWQ9ZmFsc2UgaW4gYWJvdXQ6Y29uZmlnXG4gICAgfVxuICAgIC8vIFRoZSBSVENQZWVyQ29ubmVjdGlvbiBvYmplY3QuXG4gICAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKSB7XG4gICAgICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgICAgICAvLyAudXJscyBpcyBub3Qgc3VwcG9ydGVkIGluIEZGIDwgMzguXG4gICAgICAgICAgLy8gY3JlYXRlIFJUQ0ljZVNlcnZlcnMgd2l0aCBhIHNpbmdsZSB1cmwuXG4gICAgICAgICAgaWYgKHBjQ29uZmlnICYmIHBjQ29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgICAgIHZhciBuZXdJY2VTZXJ2ZXJzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBjQ29uZmlnLmljZVNlcnZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHNlcnZlciA9IHBjQ29uZmlnLmljZVNlcnZlcnNbaV07XG4gICAgICAgICAgICAgIGlmIChzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybHMnKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2VydmVyLnVybHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBuZXdTZXJ2ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmVyLnVybHNbal1cbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICBpZiAoc2VydmVyLnVybHNbal0uaW5kZXhPZigndHVybicpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1NlcnZlci51c2VybmFtZSA9IHNlcnZlci51c2VybmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VydmVyLmNyZWRlbnRpYWwgPSBzZXJ2ZXIuY3JlZGVudGlhbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChuZXdTZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2gocGNDb25maWcuaWNlU2VydmVyc1tpXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBjQ29uZmlnLmljZVNlcnZlcnMgPSBuZXdJY2VTZXJ2ZXJzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IG1velJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gbW96UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgICAvLyB3cmFwIHN0YXRpYyBtZXRob2RzLiBDdXJyZW50bHkganVzdCBnZW5lcmF0ZUNlcnRpZmljYXRlLlxuICAgICAgaWYgKG1velJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGUpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwgJ2dlbmVyYXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtb3pSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gPSBtb3pSVENTZXNzaW9uRGVzY3JpcHRpb247XG4gICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gbW96UlRDSWNlQ2FuZGlkYXRlO1xuICAgIH1cblxuICAgIC8vIHNoaW0gYXdheSBuZWVkIGZvciBvYnNvbGV0ZSBSVENJY2VDYW5kaWRhdGUvUlRDU2Vzc2lvbkRlc2NyaXB0aW9uLlxuICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG5ldyAoKG1ldGhvZCA9PT0gJ2FkZEljZUNhbmRpZGF0ZScpID9cbiAgICAgICAgICAgICAgICBSVENJY2VDYW5kaWRhdGUgOiBSVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBhZGRJY2VDYW5kaWRhdGUobnVsbClcbiAgICB2YXIgbmF0aXZlQWRkSWNlQ2FuZGlkYXRlID1cbiAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZTtcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoYXJndW1lbnRzWzBdID09PSBudWxsKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHNbMV0pIHtcbiAgICAgICAgICBhcmd1bWVudHNbMV0uYXBwbHkobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdGl2ZUFkZEljZUNhbmRpZGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICAvLyBzaGltIGdldFN0YXRzIHdpdGggbWFwbGlrZSBzdXBwb3J0XG4gICAgdmFyIG1ha2VNYXBTdGF0cyA9IGZ1bmN0aW9uKHN0YXRzKSB7XG4gICAgICB2YXIgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgT2JqZWN0LmtleXMoc3RhdHMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIG1hcC5zZXQoa2V5LCBzdGF0c1trZXldKTtcbiAgICAgICAgbWFwW2tleV0gPSBzdGF0c1trZXldO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbWFwO1xuICAgIH07XG5cbiAgICB2YXIgbmF0aXZlR2V0U3RhdHMgPSBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RhdHM7XG4gICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIG9uU3VjYywgb25FcnIpIHtcbiAgICAgIHJldHVybiBuYXRpdmVHZXRTdGF0cy5hcHBseSh0aGlzLCBbc2VsZWN0b3IgfHwgbnVsbF0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHN0YXRzKSB7XG4gICAgICAgICAgcmV0dXJuIG1ha2VNYXBTdGF0cyhzdGF0cyk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG9uU3VjYywgb25FcnIpO1xuICAgIH07XG4gIH1cbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltT25UcmFjazogZmlyZWZveFNoaW0uc2hpbU9uVHJhY2ssXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZpcmVmb3hTaGltLnNoaW1Tb3VyY2VPYmplY3QsXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5sb2c7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2hpbUVycm9yXyA9IGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZToge1xuICAgICAgICBTZWN1cml0eUVycm9yOiAnTm90QWxsb3dlZEVycm9yJyxcbiAgICAgICAgUGVybWlzc2lvbkRlbmllZEVycm9yOiAnTm90QWxsb3dlZEVycm9yJ1xuICAgICAgfVtlLm5hbWVdIHx8IGUubmFtZSxcbiAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgJ1RoZSBvcGVyYXRpb24gaXMgaW5zZWN1cmUuJzogJ1RoZSByZXF1ZXN0IGlzIG5vdCBhbGxvd2VkIGJ5IHRoZSAnICtcbiAgICAgICAgJ3VzZXIgYWdlbnQgb3IgdGhlIHBsYXRmb3JtIGluIHRoZSBjdXJyZW50IGNvbnRleHQuJ1xuICAgICAgfVtlLm1lc3NhZ2VdIHx8IGUubWVzc2FnZSxcbiAgICAgIGNvbnN0cmFpbnQ6IGUuY29uc3RyYWludCxcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICh0aGlzLm1lc3NhZ2UgJiYgJzogJykgKyB0aGlzLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBnZXRVc2VyTWVkaWEgY29uc3RyYWludHMgc2hpbS5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgdmFyIGNvbnN0cmFpbnRzVG9GRjM3XyA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5yZXF1aXJlKSB7XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfVxuICAgICAgdmFyIHJlcXVpcmUgPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHwga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gY1trZXldID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/XG4gICAgICAgICAgICBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICAgIGlmIChyLm1pbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICByLm1heCAhPT0gdW5kZWZpbmVkIHx8IHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJlcXVpcmUucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByLiBtaW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNba2V5XSA9IHIuZXhhY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSByLmV4YWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjLmFkdmFuY2VkID0gYy5hZHZhbmNlZCB8fCBbXTtcbiAgICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBvY1trZXldID0ge21pbjogci5pZGVhbCwgbWF4OiByLmlkZWFsfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Nba2V5XSA9IHIuaWRlYWw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGMuYWR2YW5jZWQucHVzaChvYyk7XG4gICAgICAgICAgZGVsZXRlIHIuaWRlYWw7XG4gICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhyKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChyZXF1aXJlLmxlbmd0aCkge1xuICAgICAgICBjLnJlcXVpcmUgPSByZXF1aXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGM7XG4gICAgfTtcbiAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICBsb2dnaW5nKCdzcGVjOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgICB9XG4gICAgICBpZiAoY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMudmlkZW8pO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnZmYzNzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgfVxuICAgIHJldHVybiBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIG9uRXJyb3Ioc2hpbUVycm9yXyhlKSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZ2V0VXNlck1lZGlhXyhjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBTaGltIGZvciBtZWRpYURldmljZXMgb24gb2xkZXIgdmVyc2lvbnMuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7Z2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9LFxuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH1cbiAgICB9O1xuICB9XG4gIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgfHwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGluZm9zID0gW1xuICAgICAgICAgICAge2tpbmQ6ICdhdWRpb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ30sXG4gICAgICAgICAgICB7a2luZDogJ3ZpZGVvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfVxuICAgICAgICAgIF07XG4gICAgICAgICAgcmVzb2x2ZShpbmZvcyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQxKSB7XG4gICAgLy8gV29yayBhcm91bmQgaHR0cDovL2J1Z3ppbC5sYS8xMTY5NjY1XG4gICAgdmFyIG9yZ0VudW1lcmF0ZURldmljZXMgPVxuICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMuYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBvcmdFbnVtZXJhdGVEZXZpY2VzKCkudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG4gIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDkpIHtcbiAgICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxuICAgICAgICBiaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYykudGhlbihmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgLy8gV29yayBhcm91bmQgaHR0cHM6Ly9idWd6aWwubGEvODAyMzI2XG4gICAgICAgIGlmIChjLmF1ZGlvICYmICFzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGggfHxcbiAgICAgICAgICAgIGMudmlkZW8gJiYgIXN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCkge1xuICAgICAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICB0cmFjay5zdG9wKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignVGhlIG9iamVjdCBjYW4gbm90IGJlIGZvdW5kIGhlcmUuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3RGb3VuZEVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHNoaW1FcnJvcl8oZSkpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDQpIHtcbiAgICAgIHJldHVybiBnZXRVc2VyTWVkaWFfKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICAgIH1cbiAgICAvLyBSZXBsYWNlIEZpcmVmb3ggNDQrJ3MgZGVwcmVjYXRpb24gd2FybmluZyB3aXRoIHVucHJlZml4ZWQgdmVyc2lvbi5cbiAgICBjb25zb2xlLndhcm4oJ25hdmlnYXRvci5nZXRVc2VyTWVkaWEgaGFzIGJlZW4gcmVwbGFjZWQgYnkgJyArXG4gICAgICAgICAgICAgICAgICduYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYScpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKS50aGVuKG9uU3VjY2Vzcywgb25FcnJvcik7XG4gIH07XG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgc2FmYXJpU2hpbSA9IHtcbiAgLy8gVE9ETzogRHJBbGV4LCBzaG91bGQgYmUgaGVyZSwgZG91YmxlIGNoZWNrIGFnYWluc3QgTGF5b3V0VGVzdHNcbiAgLy8gc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkgeyB9LFxuXG4gIC8vIFRPRE86IG9uY2UgdGhlIGJhY2stZW5kIGZvciB0aGUgbWFjIHBvcnQgaXMgZG9uZSwgYWRkLlxuICAvLyBUT0RPOiBjaGVjayBmb3Igd2Via2l0R1RLK1xuICAvLyBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkgeyB9LFxuXG4gIHNoaW1HZXRVc2VyTWVkaWE6IGZ1bmN0aW9uKCkge1xuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhO1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbUdldFVzZXJNZWRpYTogc2FmYXJpU2hpbS5zaGltR2V0VXNlck1lZGlhXG4gIC8vIFRPRE9cbiAgLy8gc2hpbU9uVHJhY2s6IHNhZmFyaVNoaW0uc2hpbU9uVHJhY2ssXG4gIC8vIHNoaW1QZWVyQ29ubmVjdGlvbjogc2FmYXJpU2hpbS5zaGltUGVlckNvbm5lY3Rpb25cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ0Rpc2FibGVkXyA9IHRydWU7XG5cbi8vIFV0aWxpdHkgbWV0aG9kcy5cbnZhciB1dGlscyA9IHtcbiAgZGlzYWJsZUxvZzogZnVuY3Rpb24oYm9vbCkge1xuICAgIGlmICh0eXBlb2YgYm9vbCAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcmd1bWVudCB0eXBlOiAnICsgdHlwZW9mIGJvb2wgK1xuICAgICAgICAgICcuIFBsZWFzZSB1c2UgYSBib29sZWFuLicpO1xuICAgIH1cbiAgICBsb2dEaXNhYmxlZF8gPSBib29sO1xuICAgIHJldHVybiAoYm9vbCkgPyAnYWRhcHRlci5qcyBsb2dnaW5nIGRpc2FibGVkJyA6XG4gICAgICAgICdhZGFwdGVyLmpzIGxvZ2dpbmcgZW5hYmxlZCc7XG4gIH0sXG5cbiAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChsb2dEaXNhYmxlZF8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgYnJvd3NlciB2ZXJzaW9uIG91dCBvZiB0aGUgcHJvdmlkZWQgdXNlciBhZ2VudCBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7IXN0cmluZ30gdWFzdHJpbmcgdXNlckFnZW50IHN0cmluZy5cbiAgICogQHBhcmFtIHshc3RyaW5nfSBleHByIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIGFzIG1hdGNoIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0geyFudW1iZXJ9IHBvcyBwb3NpdGlvbiBpbiB0aGUgdmVyc2lvbiBzdHJpbmcgdG8gYmUgcmV0dXJuZWQuXG4gICAqIEByZXR1cm4geyFudW1iZXJ9IGJyb3dzZXIgdmVyc2lvbi5cbiAgICovXG4gIGV4dHJhY3RWZXJzaW9uOiBmdW5jdGlvbih1YXN0cmluZywgZXhwciwgcG9zKSB7XG4gICAgdmFyIG1hdGNoID0gdWFzdHJpbmcubWF0Y2goZXhwcik7XG4gICAgcmV0dXJuIG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+PSBwb3MgJiYgcGFyc2VJbnQobWF0Y2hbcG9zXSwgMTApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBCcm93c2VyIGRldGVjdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHJlc3VsdCBjb250YWluaW5nIGJyb3dzZXIgYW5kIHZlcnNpb25cbiAgICogICAgIHByb3BlcnRpZXMuXG4gICAqL1xuICBkZXRlY3RCcm93c2VyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBSZXR1cm5lZCByZXN1bHQgb2JqZWN0LlxuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICByZXN1bHQuYnJvd3NlciA9IG51bGw7XG4gICAgcmVzdWx0LnZlcnNpb24gPSBudWxsO1xuXG4gICAgLy8gRmFpbCBlYXJseSBpZiBpdCdzIG5vdCBhIGJyb3dzZXJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgIXdpbmRvdy5uYXZpZ2F0b3IpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIGJyb3dzZXIuJztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gRmlyZWZveC5cbiAgICBpZiAobmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSkge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnZmlyZWZveCc7XG4gICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvRmlyZWZveFxcLyhbMC05XSspXFwuLywgMSk7XG5cbiAgICAvLyBhbGwgd2Via2l0LWJhc2VkIGJyb3dzZXJzXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhKSB7XG4gICAgICAvLyBDaHJvbWUsIENocm9taXVtLCBXZWJ2aWV3LCBPcGVyYSwgYWxsIHVzZSB0aGUgY2hyb21lIHNoaW0gZm9yIG5vd1xuICAgICAgaWYgKHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdjaHJvbWUnO1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvQ2hyb20oZXxpdW0pXFwvKFswLTldKylcXC4vLCAyKTtcblxuICAgICAgLy8gU2FmYXJpIG9yIHVua25vd24gd2Via2l0LWJhc2VkXG4gICAgICAvLyBmb3IgdGhlIHRpbWUgYmVpbmcgU2FmYXJpIGhhcyBzdXBwb3J0IGZvciBNZWRpYVN0cmVhbXMgYnV0IG5vdCB3ZWJSVENcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNhZmFyaSBVQSBzdWJzdHJpbmdzIG9mIGludGVyZXN0IGZvciByZWZlcmVuY2U6XG4gICAgICAgIC8vIC0gd2Via2l0IHZlcnNpb246ICAgICAgICAgICBBcHBsZVdlYktpdC82MDIuMS4yNSAoYWxzbyB1c2VkIGluIE9wLENyKVxuICAgICAgICAvLyAtIHNhZmFyaSBVSSB2ZXJzaW9uOiAgICAgICAgVmVyc2lvbi85LjAuMyAodW5pcXVlIHRvIFNhZmFyaSlcbiAgICAgICAgLy8gLSBzYWZhcmkgVUkgd2Via2l0IHZlcnNpb246IFNhZmFyaS82MDEuNC40IChhbHNvIHVzZWQgaW4gT3AsQ3IpXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGlmIHRoZSB3ZWJraXQgdmVyc2lvbiBhbmQgc2FmYXJpIFVJIHdlYmtpdCB2ZXJzaW9ucyBhcmUgZXF1YWxzLFxuICAgICAgICAvLyAuLi4gdGhpcyBpcyBhIHN0YWJsZSB2ZXJzaW9uLlxuICAgICAgICAvL1xuICAgICAgICAvLyBvbmx5IHRoZSBpbnRlcm5hbCB3ZWJraXQgdmVyc2lvbiBpcyBpbXBvcnRhbnQgdG9kYXkgdG8ga25vdyBpZlxuICAgICAgICAvLyBtZWRpYSBzdHJlYW1zIGFyZSBzdXBwb3J0ZWRcbiAgICAgICAgLy9cbiAgICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1ZlcnNpb25cXC8oXFxkKykuKFxcZCspLykpIHtcbiAgICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdzYWZhcmknO1xuICAgICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgL0FwcGxlV2ViS2l0XFwvKFswLTldKylcXC4vLCAxKTtcblxuICAgICAgICAvLyB1bmtub3duIHdlYmtpdC1iYXNlZCBicm93c2VyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnVW5zdXBwb3J0ZWQgd2Via2l0LWJhc2VkIGJyb3dzZXIgJyArXG4gICAgICAgICAgICAgICd3aXRoIEdVTSBzdXBwb3J0IGJ1dCBubyBXZWJSVEMgc3VwcG9ydC4nO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIC8vIEVkZ2UuXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzICYmXG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0VkZ2VcXC8oXFxkKykuKFxcZCspJC8pKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdlZGdlJztcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9FZGdlXFwvKFxcZCspLihcXGQrKSQvLCAyKTtcblxuICAgIC8vIERlZmF1bHQgZmFsbHRocm91Z2g6IG5vdCBzdXBwb3J0ZWQuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIHN1cHBvcnRlZCBicm93c2VyLic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5cbi8vIEV4cG9ydC5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2c6IHV0aWxzLmxvZyxcbiAgZGlzYWJsZUxvZzogdXRpbHMuZGlzYWJsZUxvZyxcbiAgYnJvd3NlckRldGFpbHM6IHV0aWxzLmRldGVjdEJyb3dzZXIoKSxcbiAgZXh0cmFjdFZlcnNpb246IHV0aWxzLmV4dHJhY3RWZXJzaW9uXG59O1xuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLyoqXG4gKiBAbGljZW5zZVxuICogTGljZW5zZSBpbmZvIGZvciB3ZWJydGMtYWRhcHRlciBtb2R1bGUgYXNzZW1ibGVkIGludG8ganMgYnVuZGxlOlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICpcbiAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogTmVpdGhlciB0aGUgbmFtZSBvZiBHb29nbGUgbm9yIHRoZSBuYW1lcyBvZiBpdHMgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQGxpY2Vuc2VcbiAqIExpY2Vuc2UgaW5mbyBmb3Igc2RwIG1vZHVsZSBhc3NlbWJsZWQgaW50byBqcyBidW5kbGU6XG4gKlxuICogU2VlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3NkcFxuICovXG5pbXBvcnQgJ3dlYnJ0Yy1hZGFwdGVyJztcbi8qKlxuICogQGxpY2Vuc2VcbiAqIExpY2Vuc2UgaW5mbyBmb3IgdXVpZCBtb2R1bGUgYXNzZW1ibGVkIGludG8ganMgYnVuZGxlOlxuICpcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMC0yMDE2IFJvYmVydCBLaWVmZmVyIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5pbXBvcnQgUnRjU2Vzc2lvbiBmcm9tICcuL3J0Y19zZXNzaW9uJztcbmltcG9ydCB7UlRDX0VSUk9SU30gZnJvbSAnLi9ydGNfY29uc3QnO1xuXG5nbG9iYWwuY29ubmVjdCA9IGdsb2JhbC5jb25uZWN0IHx8IHt9O1xuZ2xvYmFsLmNvbm5lY3QuUlRDU2Vzc2lvbiA9IFJ0Y1Nlc3Npb247XG5nbG9iYWwuY29ubmVjdC5SVENFcnJvcnMgPSBSVENfRVJST1JTO1xuXG5nbG9iYWwubGlseSA9IGdsb2JhbC5saWx5IHx8IHt9O1xuZ2xvYmFsLmxpbHkuUlRDU2Vzc2lvbiA9IFJ0Y1Nlc3Npb247XG5nbG9iYWwubGlseS5SVENFcnJvcnMgPSBSVENfRVJST1JTO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBbWF6b24gU29mdHdhcmUgTGljZW5zZSAodGhlIFwiTGljZW5zZVwiKS4gWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgaHR0cDovL2F3cy5hbWF6b24uY29tL2FzbC9cbiAqXG4gKiBvciBpbiB0aGUgXCJMSUNFTlNFXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5leHBvcnQgY29uc3QgVGltZW91dEV4Y2VwdGlvbk5hbWUgPSAnVGltZW91dCc7XG5leHBvcnQgY2xhc3MgVGltZW91dCBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gVGltZW91dEV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgR3VtVGltZW91dEV4Y2VwdGlvbk5hbWUgPSAnR3VtVGltZW91dCc7XG5leHBvcnQgY2xhc3MgR3VtVGltZW91dCBleHRlbmRzIFRpbWVvdXQge1xuICAgIGNvbnN0cnVjdG9yKG1zZykge1xuICAgICAgICBzdXBlcihtc2cpO1xuICAgICAgICB0aGlzLm5hbWUgPSBHdW1UaW1lb3V0RXhjZXB0aW9uTmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBJbGxlZ2FsUGFyYW1ldGVyc0V4Y2VwdGlvbk5hbWUgPSAnSWxsZWdhbFBhcmFtZXRlcnMnO1xuZXhwb3J0IGNsYXNzIElsbGVnYWxQYXJhbWV0ZXJzIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1zZykge1xuICAgICAgICBzdXBlcihtc2cpO1xuICAgICAgICB0aGlzLm5hbWUgPSBJbGxlZ2FsUGFyYW1ldGVyc0V4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgSWxsZWdhbFN0YXRlRXhjZXB0aW9uTmFtZSA9ICdJbGxlZ2FsU3RhdGUnO1xuZXhwb3J0IGNsYXNzIElsbGVnYWxTdGF0ZSBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gSWxsZWdhbFN0YXRlRXhjZXB0aW9uTmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBVbnN1cHBvcnRlZE9wZXJhdGlvbkV4Y2VwdGlvbk5hbWUgPSAnVW5zdXBwb3J0ZWRPcGVyYXRpb24nO1xuZXhwb3J0IGNsYXNzIFVuc3VwcG9ydGVkT3BlcmF0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1zZykge1xuICAgICAgICBzdXBlcihtc2cpO1xuICAgICAgICB0aGlzLm5hbWUgPSBVbnN1cHBvcnRlZE9wZXJhdGlvbkV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgQnVzeUV4Y2VwdGlvbk5hbWUgPSAnQnVzeUV4Y2VwdGlvbic7XG5leHBvcnQgY2xhc3MgQnVzeUV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gQnVzeUV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgQ2FsbE5vdEZvdW5kRXhjZXB0aW9uTmFtZSA9ICdDYWxsTm90Rm91bmRFeGNlcHRpb24nO1xuZXhwb3J0IGNsYXNzIENhbGxOb3RGb3VuZEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gQ2FsbE5vdEZvdW5kRXhjZXB0aW9uTmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBVbmtub3duU2lnbmFsaW5nRXJyb3JOYW1lID0gJ1Vua25vd25TaWduYWxpbmdFcnJvcic7XG5leHBvcnQgY2xhc3MgVW5rbm93blNpZ25hbGluZ0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm5hbWUgPSBVbmtub3duU2lnbmFsaW5nRXJyb3JOYW1lO1xuICAgIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIFRpbWVvdXQgd2FpdGluZyBmb3Igc2VydmVyIHJlc3BvbnNlIHRvIGFjY2VwdC9oYW5ndXAgcmVxdWVzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1BWF9BQ0NFUFRfQllFX0RFTEFZX01TID0gMjAwMDtcbi8qKlxuICogVGltZW91dCB3YWl0aW5nIGZvciBzZXJ2ZXIgcmVzcG9uc2UgdG8gaW52aXRlLlxuICovXG5leHBvcnQgY29uc3QgTUFYX0lOVklURV9ERUxBWV9NUyA9IDUwMDA7XG4vKipcbiAqICBEZWZhdWx0IHRpbWVvdXQgb24gb3BlbmluZyBXZWJTb2NrZXQgY29ubmVjdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09OTkVDVF9USU1FT1VUX01TID0gMTAwMDA7XG4vKipcbiAqIERlZmF1bHQgaWNlIGNvbGxlY3Rpb24gdGltZW91dCBpbiBtaWxsaXNlY29uZHMuXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0lDRV9USU1FT1VUX01TID0gODAwMDtcbi8qKlxuICogRGVmYXVsdCBndW0gdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYmUgZW5mb3JjZWQgZHVyaW5nIHN0YXJ0IG9mIGEgY2FsbC5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfR1VNX1RJTUVPVVRfTVMgPSAxMDAwMDtcblxuLyoqXG4gKiBSVEMgZXJyb3IgbmFtZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBSVENfRVJST1JTID0ge1xuICAgICBJQ0VfQ09MTEVDVElPTl9USU1FT1VUIDogJ0ljZSBDb2xsZWN0aW9uIFRpbWVvdXQnLFxuICAgICBVU0VSX0JVU1kgOiAnVXNlciBCdXN5JyxcbiAgICAgU0lHTkFMTElOR19DT05ORUNUSU9OX0ZBSUxVUkUgOiAnU2lnbmFsbGluZyBDb25uZWN0aW9uIEZhaWx1cmUnLFxuICAgICBTSUdOQUxMSU5HX0hBTkRTSEFLRV9GQUlMVVJFIDogJ1NpZ25hbGxpbmcgSGFuZHNoYWtlIEZhaWx1cmUnLFxuICAgICBTRVRfUkVNT1RFX0RFU0NSSVBUSU9OX0ZBSUxVUkUgOiAnU2V0IFJlbW90ZSBEZXNjcmlwdGlvbiBGYWlsdXJlJyxcbiAgICAgQ1JFQVRFX09GRkVSX0ZBSUxVUkUgOiAnQ3JlYXRlIE9mZmVyIEZhaWx1cmUnLFxuICAgICBTRVRfTE9DQUxfREVTQ1JJUFRJT05fRkFJTFVSRSA6ICdTZXQgTG9jYWwgRGVzY3JpcHRpb24gRmFpbHVyZScsXG4gICAgIElOVkFMSURfUkVNT1RFX1NEUCA6ICdJbnZhbGlkIFJlbW90ZSBTRFAnLFxuICAgICBOT19SRU1PVEVfSUNFX0NBTkRJREFURSA6ICdObyBSZW1vdGUgSUNFIENhbmRpZGF0ZScsXG4gICAgIEdVTV9USU1FT1VUX0ZBSUxVUkUgOiAnR1VNIFRpbWVvdXQgRmFpbHVyZScsXG4gICAgIEdVTV9PVEhFUl9GQUlMVVJFIDogJ0dVTSBPdGhlciBGYWlsdXJlJyxcbiAgICAgQ0FMTF9OT1RfRk9VTkQ6ICdDYWxsIE5vdCBGb3VuZCdcbn07IiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBbWF6b24gU29mdHdhcmUgTGljZW5zZSAodGhlIFwiTGljZW5zZVwiKS4gWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgaHR0cDovL2F3cy5hbWF6b24uY29tL2FzbC9cbiAqXG4gKiBvciBpbiB0aGUgXCJMSUNFTlNFXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5pbXBvcnQgeyBoaXRjaCwgd3JhcExvZ2dlciwgY2xvc2VTdHJlYW0sIFNkcE9wdGlvbnMsIHRyYW5zZm9ybVNkcCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgU2Vzc2lvblJlcG9ydCB9IGZyb20gJy4vc2Vzc2lvbl9yZXBvcnQnO1xuaW1wb3J0IHsgREVGQVVMVF9JQ0VfVElNRU9VVF9NUywgREVGQVVMVF9HVU1fVElNRU9VVF9NUywgUlRDX0VSUk9SUyB9IGZyb20gJy4vcnRjX2NvbnN0JztcbmltcG9ydCB7IFVuc3VwcG9ydGVkT3BlcmF0aW9uLCBJbGxlZ2FsUGFyYW1ldGVycywgSWxsZWdhbFN0YXRlLCBHdW1UaW1lb3V0LCBCdXN5RXhjZXB0aW9uTmFtZSwgQ2FsbE5vdEZvdW5kRXhjZXB0aW9uTmFtZSB9IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQgUnRjU2lnbmFsaW5nIGZyb20gJy4vc2lnbmFsaW5nJztcbmltcG9ydCB1dWlkIGZyb20gJ3V1aWQvdjQnO1xuaW1wb3J0IHtleHRyYWN0TWVkaWFTdGF0c0Zyb21TdGF0c30gZnJvbSAnLi9ydHAtc3RhdHMnO1xuaW1wb3J0IHsgcGFyc2VDYW5kaWRhdGUgfSBmcm9tICdzZHAnO1xuXG5leHBvcnQgY2xhc3MgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7UnRjU2Vzc2lvbn0gcnRjU2Vzc2lvblxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJ0Y1Nlc3Npb24pIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbiA9IHJ0Y1Nlc3Npb247XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgfVxuICAgIG9uRXhpdCgpIHtcbiAgICB9XG4gICAgX2lzQ3VycmVudFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnRjU2Vzc2lvbi5fc3RhdGUgPT09IHRoaXM7XG4gICAgfVxuICAgIHRyYW5zaXQobmV4dFN0YXRlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0N1cnJlbnRTdGF0ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLnRyYW5zaXQobmV4dFN0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgbG9nZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnRjU2Vzc2lvbi5fbG9nZ2VyO1xuICAgIH1cbiAgICBoYW5ndXAoKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fcnRjU2Vzc2lvbikpO1xuICAgIH1cbiAgICBvbkljZUNhbmRpZGF0ZShldnQpIHsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICAgIC8vaWdub3JlIGNhbmRpZGF0ZSBieSBkZWZhdWx0LCBDb25uZWN0U2lnbmFsaW5nQW5kSWNlQ29sbGVjdGlvblN0YXRlIHdpbGwgb3ZlcnJpZGUgdG8gY29sbGVjdCBjYW5kaWRhdGVzLCBidXQgY29sbGVjdGluZyBwcm9jZXNzIGNvdWxkIGxhc3QgbXVjaCBsb25nZXIgdGhhbiBDb25uZWN0U2lnbmFsaW5nQW5kSWNlQ29sbGVjdGlvblN0YXRlXG4gICAgICAgIC8vd2UgZG9uJ3Qgd2FudCB0byBzcGFtIHRoZSBjb25zb2xlIGxvZ1xuICAgIH1cbiAgICBvblJlbW90ZUh1bmd1cCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdvblJlbW90ZUh1bmd1cCBub3QgaW1wbGVtZW50ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJSVENTZXNzaW9uU3RhdGVcIjtcbiAgICB9XG4gICAgb25TaWduYWxpbmdDb25uZWN0ZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25TaWduYWxpbmdDb25uZWN0ZWQgbm90IGltcGxlbWVudGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBvblNpZ25hbGluZ0hhbmRzaGFrZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25TaWduYWxpbmdIYW5kc2hha2VkIG5vdCBpbXBsZW1lbnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgb25TaWduYWxpbmdGYWlsZWQoZSkgey8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdvblNpZ25hbGluZ0ZhaWxlZCBub3QgaW1wbGVtZW50ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIG9uSWNlU3RhdGVDaGFuZ2UoZXZ0KSB7Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBHcmFiTG9jYWxNZWRpYVN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAoc2VsZi5fcnRjU2Vzc2lvbi5fdXNlckF1ZGlvU3RyZWFtKSB7XG4gICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IENyZWF0ZU9mZmVyU3RhdGUoc2VsZi5fcnRjU2Vzc2lvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGd1bVRpbWVvdXRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEd1bVRpbWVvdXQoJ0xvY2FsIG1lZGlhIGhhcyBub3QgYmVlbiBpbml0aWFsaXplZCB5ZXQuJykpO1xuICAgICAgICAgICAgICAgIH0sIHNlbGYuX3J0Y1Nlc3Npb24uX2d1bVRpbWVvdXRNaWxsaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgc2Vzc2lvbkd1bVByb21pc2UgPSBzZWxmLl9nVU0oc2VsZi5fcnRjU2Vzc2lvbi5fYnVpbGRNZWRpYUNvbnN0cmFpbnRzKCkpO1xuXG4gICAgICAgICAgICBQcm9taXNlLnJhY2UoW3Nlc3Npb25HdW1Qcm9taXNlLCBndW1UaW1lb3V0UHJvbWlzZV0pXG4gICAgICAgICAgICAgICAgLnRoZW4oc3RyZWFtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1UaW1lTWlsbGlzID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fb25HdW1TdWNjZXNzKHNlbGYuX3J0Y1Nlc3Npb24pO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9sb2NhbFN0cmVhbSA9IHN0cmVhbTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1PdGhlckZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1UaW1lb3V0RmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IENyZWF0ZU9mZmVyU3RhdGUoc2VsZi5fcnRjU2Vzc2lvbikpO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lmd1bVRpbWVNaWxsaXMgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXJyb3JSZWFzb247XG4gICAgICAgICAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgR3VtVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JSZWFzb24gPSBSVENfRVJST1JTLkdVTV9USU1FT1VUX0ZBSUxVUkU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lmd1bVRpbWVvdXRGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuZ3VtT3RoZXJGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclJlYXNvbiA9IFJUQ19FUlJPUlMuR1VNX09USEVSX0ZBSUxVUkU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lmd1bU90aGVyRmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lmd1bVRpbWVvdXRGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2dnZXIuZXJyb3IoJ0xvY2FsIG1lZGlhIGluaXRpYWxpemF0aW9uIGZhaWxlZCcsIGUpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9vbkd1bUVycm9yKHNlbGYuX3J0Y1Nlc3Npb24pO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHNlbGYuX3J0Y1Nlc3Npb24sIGVycm9yUmVhc29uKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkdyYWJMb2NhbE1lZGlhU3RhdGVcIjtcbiAgICB9XG4gICAgX2dVTShjb25zdHJhaW50cykge1xuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDcmVhdGVPZmZlclN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzdHJlYW0gPSBzZWxmLl9ydGNTZXNzaW9uLl9sb2NhbFN0cmVhbTtcbiAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fcGMuYWRkU3RyZWFtKHN0cmVhbSk7XG4gICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX29uTG9jYWxTdHJlYW1BZGRlZChzZWxmLl9ydGNTZXNzaW9uLCBzdHJlYW0pO1xuICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9wYy5jcmVhdGVPZmZlcigpLnRoZW4ocnRjU2Vzc2lvbkRlc2NyaXB0aW9uID0+IHtcbiAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX2xvY2FsU2Vzc2lvbkRlc2NyaXB0aW9uID0gcnRjU2Vzc2lvbkRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5jcmVhdGVPZmZlckZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgU2V0TG9jYWxTZXNzaW9uRGVzY3JpcHRpb25TdGF0ZShzZWxmLl9ydGNTZXNzaW9uKSk7XG4gICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgc2VsZi5sb2dnZXIuZXJyb3IoJ0NyZWF0ZU9mZmVyIGZhaWxlZCcsIGUpO1xuICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5jcmVhdGVPZmZlckZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZShzZWxmLl9ydGNTZXNzaW9uLCBSVENfRVJST1JTLkNSRUFURV9PRkZFUl9GQUlMVVJFKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiQ3JlYXRlT2ZmZXJTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTZXRMb2NhbFNlc3Npb25EZXNjcmlwdGlvblN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8gZml4L21vZGlmeSBTRFAgYXMgbmVlZGVkIGhlcmUsIGJlZm9yZSBzZXRMb2NhbERlc2NyaXB0aW9uXG4gICAgICAgIHZhciBsb2NhbERlc2NyaXB0aW9uID0gc2VsZi5fcnRjU2Vzc2lvbi5fbG9jYWxTZXNzaW9uRGVzY3JpcHRpb247XG4gICAgICAgIHZhciBzZHBPcHRpb25zID0gbmV3IFNkcE9wdGlvbnMoKTtcbiAgICAgICAgLy8gU2V0IGF1ZGlvIGNvZGVjLlxuICAgICAgICBpZiAoc2VsZi5fcnRjU2Vzc2lvbi5fZm9yY2VBdWRpb0NvZGVjKSB7XG4gICAgICAgICAgICBzZHBPcHRpb25zLmZvcmNlQ29kZWNbJ2F1ZGlvJ10gPSBzZWxmLl9ydGNTZXNzaW9uLl9mb3JjZUF1ZGlvQ29kZWM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2V0IHZpZGVvIGNvZGVjLlxuICAgICAgICBpZiAoc2VsZi5fcnRjU2Vzc2lvbi5fZm9yY2VWaWRlb0NvZGVjKSB7XG4gICAgICAgICAgICBzZHBPcHRpb25zLmZvcmNlQ29kZWNbJ3ZpZGVvJ10gPSBzZWxmLl9ydGNTZXNzaW9uLl9mb3JjZVZpZGVvQ29kZWM7XG4gICAgICAgIH1cbiAgICAgICAgc2RwT3B0aW9ucy5lbmFibGVPcHVzRHR4ID0gc2VsZi5fcnRjU2Vzc2lvbi5fZW5hYmxlT3B1c0R0eDtcblxuICAgICAgICB2YXIgdHJhbnNmb3JtZWRTZHAgPSB0cmFuc2Zvcm1TZHAobG9jYWxEZXNjcmlwdGlvbi5zZHAsIHNkcE9wdGlvbnMpO1xuICAgICAgICBsb2NhbERlc2NyaXB0aW9uLnNkcCA9IHRyYW5zZm9ybWVkU2RwLnNkcDtcblxuICAgICAgICBzZWxmLmxvZ2dlci5pbmZvKCdMb2NhbFNEJywgc2VsZi5fcnRjU2Vzc2lvbi5fbG9jYWxTZXNzaW9uRGVzY3JpcHRpb24pO1xuICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9wYy5zZXRMb2NhbERlc2NyaXB0aW9uKHNlbGYuX3J0Y1Nlc3Npb24uX2xvY2FsU2Vzc2lvbkRlc2NyaXB0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHZhciBpbml0aWFsaXphdGlvblRpbWUgPSBEYXRlLm5vdygpIC0gc2VsZi5fcnRjU2Vzc2lvbi5fY29ubmVjdFRpbWVTdGFtcDtcbiAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaW5pdGlhbGl6YXRpb25UaW1lTWlsbGlzID0gaW5pdGlhbGl6YXRpb25UaW1lO1xuICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fb25TZXNzaW9uSW5pdGlhbGl6ZWQoc2VsZi5fcnRjU2Vzc2lvbiwgaW5pdGlhbGl6YXRpb25UaW1lKTtcbiAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgQ29ubmVjdFNpZ25hbGluZ0FuZEljZUNvbGxlY3Rpb25TdGF0ZShzZWxmLl9ydGNTZXNzaW9uLCB0cmFuc2Zvcm1lZFNkcC5tTGluZXMpKTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBzZWxmLmxvZ2dlci5lcnJvcignU2V0TG9jYWxEZXNjcmlwdGlvbiBmYWlsZWQnLCBlKTtcbiAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZShzZWxmLl9ydGNTZXNzaW9uLCBSVENfRVJST1JTLlNFVF9MT0NBTF9ERVNDUklQVElPTl9GQUlMVVJFKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiU2V0TG9jYWxTZXNzaW9uRGVzY3JpcHRpb25TdGF0ZVwiO1xuICAgIH1cbn1cblxuLyoqXG4gKiBLaWNrIG9mZiBzaWduYWxpbmcgY29ubmVjdGlvbi4gV2FpdCB1bnRpbCBzaWduYWxpbmcgY29ubmVjdHMgYW5kIElDRSBjb2xsZWN0aW9uICh3aGljaCBhbHJlYWR5IHN0YXJ0ZWQgaW4gcHJldmlvdXMgc3RhdGUpIGNvbXBsZXRlcy5cbiAqIElDRSBjb2xsZWN0aW9uIHRpbWVzIG91dCBhZnRlciB1c2VyIHNwZWNpZmllZCBhbW91bnQgb2YgdGltZSAoZGVmYXVsdCB0byBERUZBVUxUX0lDRV9USU1FT1VUX01TKSBpbiBjYXNlIHVzZXIgaGFzIGNvbXBsZXggbmV0d29yayBlbnZpcm9ubWVudCB0aGF0IGJsYWNraG9sZXMgU1RVTi9UVVJOIHJlcXVlc3RzLiBJbiB0aGlzIGNhc2UgYXQgbGVhc3Qgb25lIGNhbmRpZGF0ZSBpcyByZXF1aXJlZCB0byBtb3ZlIGZvcndhcmQuXG4gKiBJQ0UgY29sbGVjdGlvbiBjb3VsZCBhbHNvIHdyYXAgdXAgYmVmb3JlIHRpbWVvdXQgaWYgaXQncyBkZXRlcm1pbmVkIHRoYXQgUlRQIGNhbmRpZGF0ZXMgZnJvbSBzYW1lIFRVUk4gc2VydmVyIGhhdmUgYmVlbiBjb2xsZWN0ZWQgZm9yIGFsbCBtIGxpbmVzLlxuICovXG5leHBvcnQgY2xhc3MgQ29ubmVjdFNpZ25hbGluZ0FuZEljZUNvbGxlY3Rpb25TdGF0ZSBleHRlbmRzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIENvbm5lY3RTaWduYWxpbmdBbmRJY2VDb2xsZWN0aW9uU3RhdGUgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7UnRjU2Vzc2lvbn0gcnRjU2Vzc2lvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtTGluZXMgTnVtYmVyIG9mIG0gbGluZXMgaW4gU0RQXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocnRjU2Vzc2lvbiwgbUxpbmVzKSB7XG4gICAgICAgIHN1cGVyKHJ0Y1Nlc3Npb24pO1xuICAgICAgICB0aGlzLl9pY2VDYW5kaWRhdGVzID0gW107XG4gICAgICAgIHRoaXMuX2ljZUNhbmRpZGF0ZUZvdW5kYXRpb25zTWFwID0ge307XG4gICAgICAgIHRoaXMuX21MaW5lcyA9IG1MaW5lcztcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLl9zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9pc0N1cnJlbnRTdGF0ZSgpICYmICFzZWxmLl9pY2VDb21wbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmxvZ2dlci53YXJuKCdJQ0UgY29sbGVjdGlvbiB0aW1lZCBvdXQnKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZXBvcnRJY2VDb21wbGV0ZWQodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYuX3J0Y1Nlc3Npb24uX2ljZVRpbWVvdXRNaWxsaXMpO1xuICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9jcmVhdGVTaWduYWxpbmdDaGFubmVsKCkuY29ubmVjdCgpO1xuICAgIH1cbiAgICBvblNpZ25hbGluZ0Nvbm5lY3RlZCgpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2lnbmFsbGluZ0Nvbm5lY3RUaW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNpZ25hbGxpbmdDb25uZWN0VGltZU1pbGxpcyA9IHRoaXMuX3J0Y1Nlc3Npb24uX3NpZ25hbGxpbmdDb25uZWN0VGltZXN0YW1wIC0gdGhpcy5fc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9vblNpZ25hbGluZ0Nvbm5lY3RlZCh0aGlzLl9ydGNTZXNzaW9uKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zaWduYWxsaW5nQ29ubmVjdGlvbkZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY2hlY2tBbmRUcmFuc2l0KCk7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nRmFpbGVkKGUpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXMgPSBEYXRlLm5vdygpIC0gdGhpcy5fc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRmFpbGVkIGNvbm5lY3RpbmcgdG8gc2lnbmFsaW5nIHNlcnZlcicsIGUpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNpZ25hbGxpbmdDb25uZWN0aW9uRmFpbHVyZSA9IHRydWU7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fcnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5TSUdOQUxMSU5HX0NPTk5FQ1RJT05fRkFJTFVSRSkpO1xuICAgIH1cbiAgICBfY3JlYXRlTG9jYWxDYW5kaWRhdGUoaW5pdERpY3QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSVENJY2VDYW5kaWRhdGUoaW5pdERpY3QpO1xuICAgIH1cbiAgICBvbkljZUNhbmRpZGF0ZShldnQpIHtcbiAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IGV2dC5jYW5kaWRhdGU7XG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZygnb25pY2VjYW5kaWRhdGUgJyArIEpTT04uc3RyaW5naWZ5KGNhbmRpZGF0ZSkpO1xuICAgICAgICBpZiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9pY2VDYW5kaWRhdGVzLnB1c2godGhpcy5fY3JlYXRlTG9jYWxDYW5kaWRhdGUoY2FuZGlkYXRlKSk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5faWNlQ29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hlY2tDYW5kaWRhdGVzU3VmZmljaWVudChjYW5kaWRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBvcnRJY2VDb21wbGV0ZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9jaGVja0NhbmRpZGF0ZXNTdWZmaWNpZW50KGNhbmRpZGF0ZSkge1xuICAgICAgICAvL2NoZWNrIGlmIHdlIGNvbGxlY3RlZCBzdWZmaWNpZW50IGNhbmRpZGF0ZXMgZnJvbSBzaW5nbGUgbWVkaWEgc2VydmVyIHRvIHN0YXJ0IHRoZSBjYWxsXG4gICAgICAgIHZhciBjYW5kaWRhdGVPYmogPSBwYXJzZUNhbmRpZGF0ZShjYW5kaWRhdGUuY2FuZGlkYXRlKTtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZU9iai5jb21wb25lbnQgIT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjYW5kaWRhdGVGb3VuZGF0aW9uID0gY2FuZGlkYXRlT2JqLmZvdW5kYXRpb247XG4gICAgICAgIHZhciBjYW5kaWRhdGVNTGluZUluZGV4ID0gY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXg7XG4gICAgICAgIGlmIChjYW5kaWRhdGVGb3VuZGF0aW9uICYmIGNhbmRpZGF0ZU1MaW5lSW5kZXggPj0gMCAmJiBjYW5kaWRhdGVNTGluZUluZGV4IDwgdGhpcy5fbUxpbmVzKSB7XG4gICAgICAgICAgICB2YXIgbUluZGV4TGlzdCA9IHRoaXMuX2ljZUNhbmRpZGF0ZUZvdW5kYXRpb25zTWFwW2NhbmRpZGF0ZUZvdW5kYXRpb25dIHx8IFtdO1xuICAgICAgICAgICAgaWYgKCFtSW5kZXhMaXN0LmluY2x1ZGVzKGNhbmRpZGF0ZU1MaW5lSW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgbUluZGV4TGlzdC5wdXNoKGNhbmRpZGF0ZU1MaW5lSW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5faWNlQ2FuZGlkYXRlRm91bmRhdGlvbnNNYXBbY2FuZGlkYXRlRm91bmRhdGlvbl0gPSBtSW5kZXhMaXN0O1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fbUxpbmVzID09IG1JbmRleExpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVwb3J0SWNlQ29tcGxldGVkKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfcmVwb3J0SWNlQ29tcGxldGVkKGlzVGltZW91dCkge1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmljZUNvbGxlY3Rpb25UaW1lTWlsbGlzID0gRGF0ZS5ub3coKSAtIHRoaXMuX3N0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5faWNlQ29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fb25JY2VDb2xsZWN0aW9uQ29tcGxldGUodGhpcy5fcnRjU2Vzc2lvbiwgaXNUaW1lb3V0LCB0aGlzLl9pY2VDYW5kaWRhdGVzLmxlbmd0aCk7XG4gICAgICAgIGlmICh0aGlzLl9pY2VDYW5kaWRhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaWNlQ29sbGVjdGlvbkZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrQW5kVHJhbnNpdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ05vIElDRSBjYW5kaWRhdGUnKTtcbiAgICAgICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaWNlQ29sbGVjdGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9ydGNTZXNzaW9uLCBSVENfRVJST1JTLklDRV9DT0xMRUNUSU9OX1RJTUVPVVQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfY2hlY2tBbmRUcmFuc2l0KCkge1xuICAgICAgICBpZiAodGhpcy5faWNlQ29tcGxldGVkICYmIHRoaXMuX3NpZ25hbGluZ0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBJbnZpdGVBbnN3ZXJTdGF0ZSh0aGlzLl9ydGNTZXNzaW9uLCB0aGlzLl9pY2VDYW5kaWRhdGVzKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX2ljZUNvbXBsZXRlZCkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKCdQZW5kaW5nIElDRSBjb2xsZWN0aW9uJyk7XG4gICAgICAgIH0gZWxzZSB7Ly9pbXBsaWVzIF9zaWduYWxpbmdDb25uZWN0ZWQgPT0gZmFsc2VcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZygnUGVuZGluZyBzaWduYWxpbmcgY29ubmVjdGlvbicpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJDb25uZWN0U2lnbmFsaW5nQW5kSWNlQ29sbGVjdGlvblN0YXRlXCI7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW52aXRlQW5zd2VyU3RhdGUgZXh0ZW5kcyBSVENTZXNzaW9uU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJ0Y1Nlc3Npb24sIGljZUNhbmRpZGF0ZXMpIHtcbiAgICAgICAgc3VwZXIocnRjU2Vzc2lvbik7XG4gICAgICAgIHRoaXMuX2ljZUNhbmRpZGF0ZXMgPSBpY2VDYW5kaWRhdGVzO1xuICAgIH1cbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgcnRjU2Vzc2lvbiA9IHRoaXMuX3J0Y1Nlc3Npb247XG4gICAgICAgIHJ0Y1Nlc3Npb24uX29uU2lnbmFsaW5nU3RhcnRlZChydGNTZXNzaW9uKTtcbiAgICAgICAgcnRjU2Vzc2lvbi5fc2lnbmFsaW5nQ2hhbm5lbC5pbnZpdGUocnRjU2Vzc2lvbi5fbG9jYWxTZXNzaW9uRGVzY3JpcHRpb24uc2RwLFxuICAgICAgICAgICAgdGhpcy5faWNlQ2FuZGlkYXRlcyk7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nQW5zd2VyZWQoc2RwLCBjYW5kaWRhdGVzKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQudXNlckJ1c3lGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaGFuZHNoYWtpbmdGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgQWNjZXB0U3RhdGUodGhpcy5fcnRjU2Vzc2lvbiwgc2RwLCBjYW5kaWRhdGVzKSk7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nRmFpbGVkKGUpIHtcbiAgICAgICAgdmFyIHJlYXNvbjtcbiAgICAgICAgaWYgKGUubmFtZSA9PSBCdXN5RXhjZXB0aW9uTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1VzZXIgQnVzeSwgcG9zc2libHkgbXVsdGlwbGUgQ0NQIHdpbmRvd3Mgb3BlbicsIGUpO1xuICAgICAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC51c2VyQnVzeUZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5oYW5kc2hha2luZ0ZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgcmVhc29uID0gUlRDX0VSUk9SUy5VU0VSX0JVU1k7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5uYW1lID09IENhbGxOb3RGb3VuZEV4Y2VwdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdDYWxsIG5vdCBmb3VuZC4gT25lIG9mIHRoZSBwYXJ0aWNpcGFudCBwcm9iYWJseSBodW5ndXAuJywgZSk7XG4gICAgICAgICAgICByZWFzb24gPSBSVENfRVJST1JTLkNBTExfTk9UX0ZPVU5EO1xuICAgICAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5oYW5kc2hha2luZ0ZhaWx1cmUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0ZhaWxlZCBoYW5kc2hha2luZyB3aXRoIHNpZ25hbGluZyBzZXJ2ZXInLCBlKTtcbiAgICAgICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQudXNlckJ1c3lGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmhhbmRzaGFraW5nRmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICByZWFzb24gPSBSVENfRVJST1JTLlNJR05BTExJTkdfSEFORFNIQUtFX0ZBSUxVUkU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9ydGNTZXNzaW9uLCByZWFzb24pKTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkludml0ZUFuc3dlclN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEFjY2VwdFN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihydGNTZXNzaW9uLCBzZHAsIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgc3VwZXIocnRjU2Vzc2lvbik7XG4gICAgICAgIHRoaXMuX3NkcCA9IHNkcDtcbiAgICAgICAgdGhpcy5fY2FuZGlkYXRlcyA9IGNhbmRpZGF0ZXM7XG4gICAgfVxuICAgIF9jcmVhdGVTZXNzaW9uRGVzY3JpcHRpb24oaW5pdERpY3QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oaW5pdERpY3QpO1xuICAgIH1cbiAgICBfY3JlYXRlUmVtb3RlQ2FuZGlkYXRlKGluaXREaWN0KSB7XG4gICAgICAgIHJldHVybiBuZXcgUlRDSWNlQ2FuZGlkYXRlKGluaXREaWN0KTtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgcnRjU2Vzc2lvbiA9IHNlbGYuX3J0Y1Nlc3Npb247XG5cbiAgICAgICAgaWYgKCFzZWxmLl9zZHApIHtcbiAgICAgICAgICAgIHNlbGYubG9nZ2VyLmVycm9yKCdJbnZhbGlkIHJlbW90ZSBTRFAnKTtcbiAgICAgICAgICAgIHJ0Y1Nlc3Npb24uX3N0b3BTZXNzaW9uKCk7XG4gICAgICAgICAgICBydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmludmFsaWRSZW1vdGVTRFBGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUocnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5JTlZBTElEX1JFTU9URV9TRFApKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmICghc2VsZi5fY2FuZGlkYXRlcyB8fCBzZWxmLl9jYW5kaWRhdGVzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHNlbGYubG9nZ2VyLmVycm9yKCdObyByZW1vdGUgSUNFIGNhbmRpZGF0ZScpO1xuICAgICAgICAgICAgcnRjU2Vzc2lvbi5fc3RvcFNlc3Npb24oKTtcbiAgICAgICAgICAgIHJ0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQubm9SZW1vdGVJY2VDYW5kaWRhdGVGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUocnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5OT19SRU1PVEVfSUNFX0NBTkRJREFURSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5pbnZhbGlkUmVtb3RlU0RQRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICBydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lm5vUmVtb3RlSWNlQ2FuZGlkYXRlRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICB2YXIgc2V0UmVtb3RlRGVzY3JpcHRpb25Qcm9taXNlID0gcnRjU2Vzc2lvbi5fcGMuc2V0UmVtb3RlRGVzY3JpcHRpb24oc2VsZi5fY3JlYXRlU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6ICdhbnN3ZXInLFxuICAgICAgICAgICAgc2RwOiBzZWxmLl9zZHBcbiAgICAgICAgfSkpO1xuICAgICAgICBzZXRSZW1vdGVEZXNjcmlwdGlvblByb21pc2UuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBzZWxmLmxvZ2dlci5lcnJvcignU2V0UmVtb3RlRGVzY3JpcHRpb24gZmFpbGVkJywgZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzZXRSZW1vdGVEZXNjcmlwdGlvblByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB2YXIgcmVtb3RlQ2FuZGlkYXRlUHJvbWlzZXMgPSBQcm9taXNlLmFsbChzZWxmLl9jYW5kaWRhdGVzLm1hcChmdW5jdGlvbiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUNhbmRpZGF0ZSA9IHNlbGYuX2NyZWF0ZVJlbW90ZUNhbmRpZGF0ZShjYW5kaWRhdGUpO1xuICAgICAgICAgICAgICAgIHNlbGYubG9nZ2VyLmluZm8oJ0FkZGluZyByZW1vdGUgY2FuZGlkYXRlJywgcmVtb3RlQ2FuZGlkYXRlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnRjU2Vzc2lvbi5fcGMuYWRkSWNlQ2FuZGlkYXRlKHJlbW90ZUNhbmRpZGF0ZSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZW1vdGVDYW5kaWRhdGVQcm9taXNlcy5jYXRjaChyZWFzb24gPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYubG9nZ2VyLndhcm4oJ0Vycm9yIGFkZGluZyByZW1vdGUgY2FuZGlkYXRlJywgcmVhc29uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlbW90ZUNhbmRpZGF0ZVByb21pc2VzO1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJ0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2V0UmVtb3RlRGVzY3JpcHRpb25GYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLl9yZW1vdGVEZXNjcmlwdGlvblNldCA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLl9jaGVja0FuZFRyYW5zaXQoKTtcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgcnRjU2Vzc2lvbi5fc3RvcFNlc3Npb24oKTtcbiAgICAgICAgICAgIHJ0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2V0UmVtb3RlRGVzY3JpcHRpb25GYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUocnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5TRVRfUkVNT1RFX0RFU0NSSVBUSU9OX0ZBSUxVUkUpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nSGFuZHNoYWtlZCgpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5oYW5kc2hha2luZ1RpbWVNaWxsaXMgPSBEYXRlLm5vdygpIC0gdGhpcy5fcnRjU2Vzc2lvbi5fc2lnbmFsbGluZ0Nvbm5lY3RUaW1lc3RhbXA7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZ0hhbmRzaGFrZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9jaGVja0FuZFRyYW5zaXQoKTtcbiAgICB9XG4gICAgX2NoZWNrQW5kVHJhbnNpdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NpZ25hbGluZ0hhbmRzaGFrZWQgJiYgdGhpcy5fcmVtb3RlRGVzY3JpcHRpb25TZXQpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgVGFsa2luZ1N0YXRlKHRoaXMuX3J0Y1Nlc3Npb24pKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5fc2lnbmFsaW5nSGFuZHNoYWtlZCkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKCdQZW5kaW5nIGhhbmRzaGFraW5nJyk7XG4gICAgICAgIH0gZWxzZSB7Ly9pbXBsaWVzIF9yZW1vdGVEZXNjcmlwdGlvblNldCA9PSBmYWxzZVxuICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKCdQZW5kaW5nIHNldHRpbmcgcmVtb3RlIGRlc2NyaXB0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkFjY2VwdFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFRhbGtpbmdTdGF0ZSBleHRlbmRzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5wcmVUYWxraW5nVGltZU1pbGxpcyA9IHRoaXMuX3N0YXJ0VGltZSAtIHRoaXMuX3J0Y1Nlc3Npb24uX2Nvbm5lY3RUaW1lU3RhbXA7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX29uU2Vzc2lvbkNvbm5lY3RlZCh0aGlzLl9ydGNTZXNzaW9uKTtcbiAgICB9XG4gICAgb25TaWduYWxpbmdSZWNvbm5lY3RlZCgpIHtcbiAgICB9XG4gICAgb25SZW1vdGVIdW5ndXAoKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3NpZ25hbGluZ0NoYW5uZWwuaGFuZ3VwKCk7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRGlzY29ubmVjdGVkU3RhdGUodGhpcy5fcnRjU2Vzc2lvbikpO1xuICAgIH1cbiAgICBoYW5ndXAoKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3NpZ25hbGluZ0NoYW5uZWwuaGFuZ3VwKCk7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRGlzY29ubmVjdGVkU3RhdGUodGhpcy5fcnRjU2Vzc2lvbikpO1xuICAgIH1cbiAgICBvbkljZVN0YXRlQ2hhbmdlKGV2dCkge1xuICAgICAgICBpZiAoZXZ0LmN1cnJlbnRUYXJnZXQuaWNlQ29ubmVjdGlvblN0YXRlID09ICdkaXNjb25uZWN0ZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdMb3N0IElDRSBjb25uZWN0aW9uJyk7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmljZUNvbm5lY3Rpb25zTG9zdCArPSAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uRXhpdCgpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC50YWxraW5nVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSB0aGlzLl9zdGFydFRpbWU7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX2RldGFjaE1lZGlhKCk7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2Vzc2lvbkVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9vblNlc3Npb25Db21wbGV0ZWQodGhpcy5fcnRjU2Vzc2lvbik7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJUYWxraW5nU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQ2xlYW5VcFN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB0aGlzLl9zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zdG9wU2Vzc2lvbigpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmNsZWFudXBUaW1lTWlsbGlzID0gRGF0ZS5ub3coKSAtIHRoaXMuX3N0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fb25TZXNzaW9uRGVzdHJveWVkKHRoaXMuX3J0Y1Nlc3Npb24sIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiQ2xlYW5VcFN0YXRlXCI7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgLy9kbyBub3RoaW5nLCBhbHJlYWR5IGF0IHRoZSBlbmQgb2YgbGlmZWN5Y2xlXG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIERpc2Nvbm5lY3RlZFN0YXRlIGV4dGVuZHMgQ2xlYW5VcFN0YXRlIHtcbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiRGlzY29ubmVjdGVkU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRmFpbGVkU3RhdGUgZXh0ZW5kcyBDbGVhblVwU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJ0Y1Nlc3Npb24sIGZhaWx1cmVSZWFzb24pIHtcbiAgICAgICAgc3VwZXIocnRjU2Vzc2lvbik7XG4gICAgICAgIHRoaXMuX2ZhaWx1cmVSZWFzb24gPSBmYWlsdXJlUmVhc29uO1xuICAgIH1cbiAgICBvbkVudGVyKCkge1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNlc3Npb25FbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fb25TZXNzaW9uRmFpbGVkKHRoaXMuX3J0Y1Nlc3Npb24sIHRoaXMuX2ZhaWx1cmVSZWFzb24pO1xuICAgICAgICBzdXBlci5vbkVudGVyKCk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJGYWlsZWRTdGF0ZVwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnRjU2Vzc2lvbiB7XG4gICAgLyoqXG4gICAgICogQnVpbGQgYW4gQW1hem9uQ29ubmVjdCBSVEMgc2Vzc2lvbi5cbiAgICAgKiBAcGFyYW0geyp9IHNpZ25hbGluZ1VyaVxuICAgICAqIEBwYXJhbSB7Kn0gaWNlU2VydmVycyBBcnJheSBvZiBpY2Ugc2VydmVyc1xuICAgICAqIEBwYXJhbSB7Kn0gY29udGFjdFRva2VuIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY29udGFjdCB0b2tlbiAob3B0aW9uYWwpXG4gICAgICogQHBhcmFtIHsqfSBsb2dnZXIgQW4gb2JqZWN0IHByb3ZpZGVzIGxvZ2dpbmcgZnVuY3Rpb25zLCBzdWNoIGFzIGNvbnNvbGVcbiAgICAgKiBAcGFyYW0geyp9IGNvbnRhY3RJZCBNdXN0IGJlIFVVSUQsIHVuaXF1ZWx5IGlkZW50aWZpZXMgdGhlIHNlc3Npb24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2lnbmFsaW5nVXJpLCBpY2VTZXJ2ZXJzLCBjb250YWN0VG9rZW4sIGxvZ2dlciwgY29udGFjdElkKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2lnbmFsaW5nVXJpICE9PSAnc3RyaW5nJyB8fCBzaWduYWxpbmdVcmkudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxQYXJhbWV0ZXJzKCdzaWduYWxpbmdVcmkgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWljZVNlcnZlcnMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbGxlZ2FsUGFyYW1ldGVycygnaWNlU2VydmVycyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbG9nZ2VyICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxQYXJhbWV0ZXJzKCdsb2dnZXIgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbnRhY3RJZCkge1xuICAgICAgICAgICAgdGhpcy5fY2FsbElkID0gdXVpZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY2FsbElkID0gY29udGFjdElkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2Vzc2lvblJlcG9ydCA9IG5ldyBTZXNzaW9uUmVwb3J0KCk7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZ1VyaSA9IHNpZ25hbGluZ1VyaTtcbiAgICAgICAgdGhpcy5faWNlU2VydmVycyA9IGljZVNlcnZlcnM7XG4gICAgICAgIHRoaXMuX2NvbnRhY3RUb2tlbiA9IGNvbnRhY3RUb2tlbjtcbiAgICAgICAgdGhpcy5fb3JpZ2luYWxMb2dnZXIgPSBsb2dnZXI7XG4gICAgICAgIHRoaXMuX2xvZ2dlciA9IHdyYXBMb2dnZXIodGhpcy5fb3JpZ2luYWxMb2dnZXIsIHRoaXMuX2NhbGxJZCwgJ1NFU1NJT04nKTtcbiAgICAgICAgdGhpcy5faWNlVGltZW91dE1pbGxpcyA9IERFRkFVTFRfSUNFX1RJTUVPVVRfTVM7XG4gICAgICAgIHRoaXMuX2d1bVRpbWVvdXRNaWxsaXMgPSBERUZBVUxUX0dVTV9USU1FT1VUX01TO1xuXG4gICAgICAgIHRoaXMuX2VuYWJsZUF1ZGlvID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fZW5hYmxlVmlkZW8gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZmFjaW5nTW9kZSA9ICd1c2VyJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogdXNlciBtYXkgcHJvdmlkZSB0aGUgc3RyZWFtIHRvIHRoZSBSdGNTZXNzaW9uIGRpcmVjdGx5IHRvIGNvbm5lY3QgdG8gdGhlIG90aGVyIGVuZC5cbiAgICAgICAgICogdXNlciBtYXkgYWxzbyBhY3F1aXJlIHRoZSBzdHJlYW0gZnJvbSB0aGUgbG9jYWwgZGV2aWNlLlxuICAgICAgICAgKiBUaGlzIGZsYWcgaXMgdXNlZCB0byB0cmFjayB3aGVyZSB0aGUgc3RyZWFtIGlzIGFjcXVpcmVkLlxuICAgICAgICAgKiBJZiBpdCdzIGFjcXVpcmVkIGZyb20gbG9jYWwgZGV2aWNlcywgdGhlbiB3ZSBtdXN0IGNsb3NlIHRoZSBzdHJlYW0gd2hlbiB0aGUgc2Vzc2lvbiBlbmRzLlxuICAgICAgICAgKiBJZiBpdCdzIHByb3ZpZGVkIGJ5IHVzZXIgKHJhdGhlciB0aGFuIGxvY2FsIGNhbWVyYS9taWNyb3Bob25lKSwgdGhlbiB3ZSBzaG91bGQgbGVhdmUgaXQgb3BlbiB3aGVuIHRoZVxuICAgICAgICAgKiBzZXNzaW9uIGVuZHMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl91c2VyUHJvdmlkZWRTdHJlYW0gPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9vbkd1bUVycm9yID1cbiAgICAgICAgICAgIHRoaXMuX29uR3VtU3VjY2VzcyA9XG4gICAgICAgICAgICB0aGlzLl9vbkxvY2FsU3RyZWFtQWRkZWQgPVxuICAgICAgICAgICAgdGhpcy5fb25TZXNzaW9uRmFpbGVkID1cbiAgICAgICAgICAgIHRoaXMuX29uU2Vzc2lvbkluaXRpYWxpemVkID1cbiAgICAgICAgICAgIHRoaXMuX29uU2lnbmFsaW5nQ29ubmVjdGVkID1cbiAgICAgICAgICAgIHRoaXMuX29uSWNlQ29sbGVjdGlvbkNvbXBsZXRlID1cbiAgICAgICAgICAgIHRoaXMuX29uU2lnbmFsaW5nU3RhcnRlZCA9XG4gICAgICAgICAgICB0aGlzLl9vblNlc3Npb25Db25uZWN0ZWQgPVxuICAgICAgICAgICAgdGhpcy5fb25SZW1vdGVTdHJlYW1BZGRlZCA9XG4gICAgICAgICAgICB0aGlzLl9vblNlc3Npb25Db21wbGV0ZWQgPVxuICAgICAgICAgICAgdGhpcy5fb25TZXNzaW9uRGVzdHJveWVkID0gKCkgPT4ge1xuICAgICAgICAgICAgfTtcbiAgICB9XG4gICAgZ2V0IHNlc3Npb25SZXBvcnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXNzaW9uUmVwb3J0O1xuICAgIH1cbiAgICBnZXQgY2FsbElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FsbElkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBnZXRNZWRpYVN0cmVhbSByZXR1cm5zIHRoZSBsb2NhbCBzdHJlYW0sIHdoaWNoIG1heSBiZSBhY3F1aXJlZCBmcm9tIGxvY2FsIGRldmljZSBvciBmcm9tIHVzZXIgcHJvdmlkZWQgc3RyZWFtLlxuICAgICAqIFJhdGhlciB0aGFuIGdldHRpbmcgYSBzdHJlYW0gYnkgY2FsbGluZyBnZXRVc2VyTWVkaWEgKHdoaWNoIGdldHMgYSBzdHJlYW0gZnJvbSBsb2NhbCBkZXZpY2Ugc3VjaCBhcyBjYW1lcmEpLFxuICAgICAqIHVzZXIgY291bGQgYWxzbyBwcm92aWRlIHRoZSBzdHJlYW0gdG8gdGhlIFJ0Y1Nlc3Npb24gZGlyZWN0bHkgdG8gY29ubmVjdCB0byB0aGUgb3RoZXIgZW5kLlxuICAgICAqL1xuICAgIGdldCBtZWRpYVN0cmVhbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsU3RyZWFtO1xuICAgIH1cbiAgICBnZXQgcmVtb3RlVmlkZW9TdHJlYW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZW1vdGVWaWRlb1N0cmVhbTtcbiAgICB9XG4gICAgcGF1c2VMb2NhbFZpZGVvKCkge1xuICAgICAgICBpZih0aGlzLl9sb2NhbFN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIHZpZGVvVHJhY2sgPSB0aGlzLl9sb2NhbFN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdO1xuICAgICAgICAgICAgaWYodmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHZpZGVvVHJhY2suZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlc3VtZUxvY2FsVmlkZW8oKSB7XG4gICAgICAgIGlmKHRoaXMuX2xvY2FsU3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgdmlkZW9UcmFjayA9IHRoaXMuX2xvY2FsU3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF07XG4gICAgICAgICAgICBpZih2aWRlb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgdmlkZW9UcmFjay5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXVzZVJlbW90ZVZpZGVvKCkge1xuICAgICAgICBpZiAodGhpcy5fcmVtb3RlVmlkZW9TdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciB2aWRlb1RyYWNrID0gdGhpcy5fcmVtb3RlVmlkZW9TdHJlYW0uZ2V0VHJhY2tzKClbMV07XG4gICAgICAgICAgICBpZih2aWRlb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgdmlkZW9UcmFjay5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVzdW1lUmVtb3RlVmlkZW8oKSB7XG4gICAgICAgIGlmICh0aGlzLl9yZW1vdGVWaWRlb1N0cmVhbSkge1xuICAgICAgICAgICAgdmFyIHZpZGVvVHJhY2sgPSB0aGlzLl9yZW1vdGVWaWRlb1N0cmVhbS5nZXRUcmFja3MoKVsxXTtcbiAgICAgICAgICAgIGlmKHZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICB2aWRlb1RyYWNrLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHBhdXNlTG9jYWxBdWRpbygpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xvY2FsU3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgYXVkaW9UcmFjayA9IHRoaXMuX2xvY2FsU3RyZWFtLmdldEF1ZGlvVHJhY2tzKClbMF07XG4gICAgICAgICAgICBpZihhdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgYXVkaW9UcmFjay5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVzdW1lTG9jYWxBdWRpbygpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xvY2FsU3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgYXVkaW9UcmFjayA9IHRoaXMuX2xvY2FsU3RyZWFtLmdldEF1ZGlvVHJhY2tzKClbMF07XG4gICAgICAgICAgICBpZihhdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgYXVkaW9UcmFjay5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXVzZVJlbW90ZUF1ZGlvKCkge1xuICAgICAgICBpZiAodGhpcy5fcmVtb3RlQXVkaW9TdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBhdWRpb1RyYWNrID0gdGhpcy5fcmVtb3RlQXVkaW9TdHJlYW0uZ2V0VHJhY2tzKClbMF07XG4gICAgICAgICAgICBpZihhdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgYXVkaW9UcmFjay5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVzdW1lUmVtb3RlQXVkaW8oKSB7XG4gICAgICAgIGlmICh0aGlzLl9yZW1vdGVBdWRpb1N0cmVhbSkge1xuICAgICAgICAgICAgdmFyIGF1ZGlvVHJhY2sgPSB0aGlzLl9yZW1vdGVBdWRpb1N0cmVhbS5nZXRUcmFja3MoKVswXTtcbiAgICAgICAgICAgIGlmKGF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBhdWRpb1RyYWNrLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHdoZW4gZ1VNIHN1Y2NlZWRzLlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqL1xuICAgIHNldCBvbkd1bVN1Y2Nlc3MoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vbkd1bVN1Y2Nlc3MgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB3aGVuIGdVTSBmYWlscy5cbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKiBTZWNvbmQgcGFyYW0gaXMgdGhlIGVycm9yLlxuICAgICAqL1xuICAgIHNldCBvbkd1bUVycm9yKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25HdW1FcnJvciA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGlmIGZhaWxlZCBpbml0aWFsaXppbmcgbG9jYWwgcmVzb3VyY2VzXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2V0IG9uU2Vzc2lvbkZhaWxlZChoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uU2Vzc2lvbkZhaWxlZCA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIGxvY2FsIHVzZXIgbWVkaWEgc3RyZWFtIGlzIGFkZGVkIHRvIHRoZSBzZXNzaW9uLlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqIFNlY29uZCBwYXJhbSBpcyBtZWRpYSBzdHJlYW1cbiAgICAgKi9cbiAgICBzZXQgb25Mb2NhbFN0cmVhbUFkZGVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25Mb2NhbFN0cmVhbUFkZGVkID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgd2hlbiBhbGwgbG9jYWwgcmVzb3VyY2VzIGFyZSByZWFkeS4gRXN0YWJsaXNoaW5nIHNpZ25hbGluZyBjaGFuZWwgYW5kIElDRSBjb2xsZWN0aW9uIGhhcHBlbnMgYXQgdGhlIHNhbWUgdGltZSBhZnRlciB0aGlzLlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqL1xuICAgIHNldCBvblNlc3Npb25Jbml0aWFsaXplZChoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uU2Vzc2lvbkluaXRpYWxpemVkID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgd2hlbiBzaWduYWxpbmcgY2hhbm5lbCBpcyBlc3RhYmxpc2hlZC5cbiAgICAgKiBSVEMgc2Vzc2lvbiB3aWxsIG1vdmUgZm9yd2FyZCBvbmx5IGlmIG9uU2lnbmFsaW5nQ29ubmVjdGVkIGFuZCBvbkljZUNvbGxlY3Rpb25Db21wbGV0ZSBhcmUgYm90aCBjYWxsZWQuXG4gICAgICpcbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25TaWduYWxpbmdDb25uZWN0ZWQoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vblNpZ25hbGluZ0Nvbm5lY3RlZCA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHdoZW4gSUNFIGNvbGxlY3Rpb24gY29tcGxldGVzIGVpdGhlciBiZWNhdXNlIHRoZXJlIGlzIG5vIG1vcmUgY2FuZGlkYXRlIG9yIGNvbGxlY3Rpb24gdGltZWQgb3V0LlxuICAgICAqIFJUQyBzZXNzaW9uIHdpbGwgbW92ZSBmb3J3YXJkIG9ubHkgaWYgb25TaWduYWxpbmdDb25uZWN0ZWQgYW5kIG9uSWNlQ29sbGVjdGlvbkNvbXBsZXRlIGFyZSBib3RoIGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqIFNlY29uZCBwYXJhbSBpcyBib29sZWFuLCBUUlVFIC0gSUNFIGNvbGxlY3Rpb24gdGltZWQgb3V0LlxuICAgICAqIFRoaXJkIHBhcmFtIGlzIG51bWJlciBvZiBjYW5kaWRhdGVzIGNvbGxlY3RlZC5cbiAgICAgKi9cbiAgICBzZXQgb25JY2VDb2xsZWN0aW9uQ29tcGxldGUoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vbkljZUNvbGxlY3Rpb25Db21wbGV0ZSA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHdoZW4gc2lnbmFsaW5nIGNoYW5uZWwgaXMgZXN0YWJsaXNoZWQgYW5kIElDRSBjb2xsZWN0aW9uIGNvbXBsZXRlZCB3aXRoIGF0IGxlYXN0IG9uZSBjYW5kaWRhdGUuXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2V0IG9uU2lnbmFsaW5nU3RhcnRlZChoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uU2lnbmFsaW5nU3RhcnRlZCA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHdoZW4gdGhlIGNhbGwgaXMgZXN0YWJsaXNoZWQgKGhhbmRzaGFrZWQgYW5kIG1lZGlhIHN0cmVhbSBzaG91bGQgYmUgZmxvd2luZylcbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25TZXNzaW9uQ29ubmVjdGVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25TZXNzaW9uQ29ubmVjdGVkID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgYWZ0ZXIgcmVtb3RlIG1lZGlhIHN0cmVhbSBpcyBhZGRlZCB0byB0aGUgc2Vzc2lvbi5cbiAgICAgKiBUaGlzIGNvdWxkIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIHRoZSBzYW1lIHN0cmVhbSBpZiBtdWx0aXBsZSB0cmFja3MgYXJlIGluY2x1ZGVkIGluIHRoZSBzYW1lIHN0cmVhbS5cbiAgICAgKlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqIFNlY29uZCBwYXJhbSBpcyBtZWRpYSBzdHJlYW0gdHJhY2suXG4gICAgICovXG4gICAgc2V0IG9uUmVtb3RlU3RyZWFtQWRkZWQoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vblJlbW90ZVN0cmVhbUFkZGVkID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgd2hlbiB0aGUgaGFuZ3VwIGlzIGluaXRpYXRlZCAoaW1wbGllcyB0aGUgY2FsbCB3YXMgc3VjY2Vzc2Z1bGx5IGVzdGFibGlzaGVkKS5cbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25TZXNzaW9uQ29tcGxldGVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25TZXNzaW9uQ29tcGxldGVkID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgYWZ0ZXIgc2Vzc2lvbiBpcyBjbGVhbmVkIHVwLCBubyBtYXR0ZXIgaWYgdGhlIGNhbGwgd2FzIHN1Y2Nlc3NmdWxseSBlc3RhYmxpc2hlZCBvciBub3QuXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICogU2Vjb25kIHBhcmFtIGlzIFNlc3Npb25SZXBvcnQgb2JqZWN0LlxuICAgICAqL1xuICAgIHNldCBvblNlc3Npb25EZXN0cm95ZWQoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vblNlc3Npb25EZXN0cm95ZWQgPSBoYW5kbGVyO1xuICAgIH1cblxuICAgIHNldCBlbmFibGVBdWRpbyhmbGFnKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZUF1ZGlvID0gZmxhZztcbiAgICB9XG4gICAgc2V0IGVjaG9DYW5jZWxsYXRpb24oZmxhZykge1xuICAgICAgICB0aGlzLl9lY2hvQ2FuY2VsbGF0aW9uID0gZmxhZztcbiAgICB9XG4gICAgc2V0IGVuYWJsZVZpZGVvKGZsYWcpIHtcbiAgICAgICAgdGhpcy5fZW5hYmxlVmlkZW8gPSBmbGFnO1xuICAgIH1cbiAgICBzZXQgbWF4VmlkZW9GcmFtZVJhdGUoZnJhbWVSYXRlKSB7XG4gICAgICAgIHRoaXMuX21heFZpZGVvRnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuICAgIH1cbiAgICBzZXQgbWluVmlkZW9GcmFtZVJhdGUoZnJhbWVSYXRlKSB7XG4gICAgICAgIHRoaXMuX21pblZpZGVvRnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuICAgIH1cbiAgICBzZXQgdmlkZW9GcmFtZVJhdGUoZnJhbWVSYXRlKSB7XG4gICAgICAgIHRoaXMuX3ZpZGVvRnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuICAgIH1cbiAgICBzZXQgbWF4VmlkZW9XaWR0aCh3aWR0aCkge1xuICAgICAgICB0aGlzLl9tYXhWaWRlb1dpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIHNldCBtaW5WaWRlb1dpZHRoKHdpZHRoKSB7XG4gICAgICAgIHRoaXMuX21pblZpZGVvV2lkdGggPSB3aWR0aDtcbiAgICB9XG4gICAgc2V0IGlkZWFsVmlkZW9XaWR0aCh3aWR0aCkge1xuICAgICAgICB0aGlzLl9pZGVhbFZpZGVvV2lkdGggPSB3aWR0aDtcbiAgICB9XG4gICAgc2V0IG1heFZpZGVvSGVpZ2h0KGhlaWdodCkge1xuICAgICAgICB0aGlzLl9tYXhWaWRlb0hlaWdodCA9IGhlaWdodDtcbiAgICB9XG4gICAgc2V0IG1pblZpZGVvSGVpZ2h0KGhlaWdodCkge1xuICAgICAgICB0aGlzLl9taW5WaWRlb0hlaWdodCA9IGhlaWdodDtcbiAgICB9XG4gICAgc2V0IGlkZWFsVmlkZW9IZWlnaHQoaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuX2lkZWFsVmlkZW9IZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIHNldCBmYWNpbmdNb2RlKG1vZGUpIHtcbiAgICAgICAgdGhpcy5fZmFjaW5nTW9kZSA9IG1vZGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsLiBSdGNTZXNzaW9uIHdpbGwgZ3JhYiBpbnB1dCBkZXZpY2UgaWYgdGhpcyBpcyBub3Qgc3BlY2lmaWVkLlxuICAgICAqIFBsZWFzZSBub3RlOiB0aGlzIFJ0Y1Nlc3Npb24gY2xhc3Mgb25seSBzdXBwb3J0IHNpbmdsZSBhdWRpbyB0cmFjayBhbmQvb3Igc2luZ2xlIHZpZGVvIHRyYWNrLlxuICAgICAqL1xuICAgIHNldCBtZWRpYVN0cmVhbShpbnB1dCkge1xuICAgICAgICB0aGlzLl9sb2NhbFN0cmVhbSA9IGlucHV0O1xuICAgICAgICB0aGlzLl91c2VyUHJvdmlkZWRTdHJlYW0gPSB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBOZWVkZWQsIGV4cGVjdCBhbiBhdWRpbyBlbGVtZW50IHRoYXQgY2FuIGJlIHVzZWQgdG8gcGxheSByZW1vdGUgYXVkaW8gc3RyZWFtLlxuICAgICAqL1xuICAgIHNldCByZW1vdGVBdWRpb0VsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLl9yZW1vdGVBdWRpb0VsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cbiAgICBzZXQgcmVtb3RlVmlkZW9FbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fcmVtb3RlVmlkZW9FbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgc2lnbmFsaW5nIGNvbm5lY3QgdGltZSBvdXQuXG4gICAgICovXG4gICAgc2V0IHNpZ25hbGluZ0Nvbm5lY3RUaW1lb3V0KG1zKSB7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZ0Nvbm5lY3RUaW1lb3V0ID0gbXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IElDRSBjb2xsZWN0aW9uIHRpbWUgbGltaXQuXG4gICAgICovXG4gICAgc2V0IGljZVRpbWVvdXRNaWxsaXModGltZW91dE1pbGxpcykge1xuICAgICAgICB0aGlzLl9pY2VUaW1lb3V0TWlsbGlzID0gdGltZW91dE1pbGxpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGUgZGVmYXVsdCBHVU0gdGltZW91dCB0aW1lIGxpbWl0LlxuICAgICAqL1xuICAgIHNldCBndW1UaW1lb3V0TWlsbGlzKHRpbWVvdXRNaWxsaXMpIHtcbiAgICAgICAgdGhpcy5fZ3VtVGltZW91dE1pbGxpcyA9IHRpbWVvdXRNaWxsaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY29ubmVjdC1ydGMtanMgaW5pdGlhdGUgdGhlIGhhbmRzaGFraW5nIHdpdGggYWxsIGJyb3dzZXIgc3VwcG9ydGVkIGNvZGVjIGJ5IGRlZmF1bHQsIEFtYXpvbiBDb25uZWN0IHNlcnZpY2Ugd2lsbCBjaG9vc2UgdGhlIGNvZGVjIGFjY29yZGluZyB0byBpdHMgcHJlZmVyZW5jZSBzZXR0aW5nLlxuICAgICAqIFNldHRpbmcgdGhpcyBhdHRyaWJ1dGUgd2lsbCBmb3JjZSBjb25uZWN0LXJ0Yy1qcyB0byBvbmx5IHVzZSBzcGVjaWZpZWQgY29kZWMuXG4gICAgICogV0FSTklORzogU2V0dGluZyB0aGlzIHRvIHVuc3VwcG9ydGVkIGNvZGVjIHdpbGwgY2F1c2UgdGhlIGZhaWx1cmUgb2YgaGFuZHNoYWtpbmcuXG4gICAgICogU3VwcG9ydGVkIGF1ZGlvIGNvZGVjczogb3B1cy5cbiAgICAgKi9cbiAgICBzZXQgZm9yY2VBdWRpb0NvZGVjKGF1ZGlvQ29kZWMpIHtcbiAgICAgICAgdGhpcy5fZm9yY2VBdWRpb0NvZGVjID0gYXVkaW9Db2RlYztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjb25uZWN0LXJ0Yy1qcyBpbml0aWF0ZSB0aGUgaGFuZHNoYWtpbmcgd2l0aCBhbGwgYnJvd3NlciBzdXBwb3J0ZWQgY29kZWMgYnkgZGVmYXVsdCwgQW1hem9uIENvbm5lY3Qgc2VydmljZSB3aWxsIGNob29zZSB0aGUgY29kZWMgYWNjb3JkaW5nIHRvIGl0cyBwcmVmZXJlbmNlIHNldHRpbmcuXG4gICAgICogU2V0dGluZyB0aGlzIGF0dHJpYnV0ZSB3aWxsIGZvcmNlIGNvbm5lY3QtcnRjLWpzIHRvIG9ubHkgdXNlIHNwZWNpZmllZCBjb2RlYy5cbiAgICAgKiBXQVJOSU5HOiBTZXR0aW5nIHRoaXMgdG8gdW5zdXBwb3J0ZWQgY29kZWMgd2lsbCBjYXVzZSB0aGUgZmFpbHVyZSBvZiBoYW5kc2hha2luZy5cbiAgICAgKiBTdXBwb3J0ZWQgdmlkZW8gY29kZWNzOiBWUDgsIFZQOSwgSDI2NC5cbiAgICAgKi9cbiAgICBzZXQgZm9yY2VWaWRlb0NvZGVjKHZpZGVvQ29kZWMpIHtcbiAgICAgICAgdGhpcy5fZm9yY2VWaWRlb0NvZGVjID0gdmlkZW9Db2RlYztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjb25uZWN0LXJ0Yy1qcyBkaXNhYmxlcyBPUFVTIERUWCBieSBkZWZhdWx0IGJlY2F1c2UgaXQgaGFybXMgYXVkaW8gcXVhbGl0eS5cbiAgICAgKiBAcGFyYW0gZmxhZyBib29sZWFuXG4gICAgICovXG4gICAgc2V0IGVuYWJsZU9wdXNEdHgoZmxhZykge1xuICAgICAgICB0aGlzLl9lbmFibGVPcHVzRHR4ID0gZmxhZztcbiAgICB9XG5cbiAgICB0cmFuc2l0KG5leHRTdGF0ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLmluZm8oKHRoaXMuX3N0YXRlID8gdGhpcy5fc3RhdGUubmFtZSA6ICdudWxsJykgKyAnID0+ICcgKyBuZXh0U3RhdGUubmFtZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RhdGUgJiYgdGhpcy5fc3RhdGUub25FeGl0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUub25FeGl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IG5leHRTdGF0ZTtcbiAgICAgICAgICAgIGlmIChuZXh0U3RhdGUub25FbnRlcikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRTdGF0ZS5vbkVudGVyKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2dnZXIud2FybihuZXh0U3RhdGUubmFtZSArICcjb25FbnRlciBmYWlsZWQnLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnNhZmUtZmluYWxseVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVTaWduYWxpbmdDaGFubmVsKCkge1xuICAgICAgICB2YXIgc2lnbmFsaW5nQ2hhbm5lbCA9IG5ldyBSdGNTaWduYWxpbmcodGhpcy5fY2FsbElkLCB0aGlzLl9zaWduYWxpbmdVcmksIHRoaXMuX2NvbnRhY3RUb2tlbiwgdGhpcy5fb3JpZ2luYWxMb2dnZXIsIHRoaXMuX3NpZ25hbGluZ0Nvbm5lY3RUaW1lb3V0KTtcbiAgICAgICAgc2lnbmFsaW5nQ2hhbm5lbC5vbkNvbm5lY3RlZCA9IGhpdGNoKHRoaXMsIHRoaXMuX3NpZ25hbGluZ0Nvbm5lY3RlZCk7XG4gICAgICAgIHNpZ25hbGluZ0NoYW5uZWwub25BbnN3ZXJlZCA9IGhpdGNoKHRoaXMsIHRoaXMuX3NpZ25hbGluZ0Fuc3dlcmVkKTtcbiAgICAgICAgc2lnbmFsaW5nQ2hhbm5lbC5vbkhhbmRzaGFrZWQgPSBoaXRjaCh0aGlzLCB0aGlzLl9zaWduYWxpbmdIYW5kc2hha2VkKTtcbiAgICAgICAgc2lnbmFsaW5nQ2hhbm5lbC5vblJlbW90ZUh1bmd1cCA9IGhpdGNoKHRoaXMsIHRoaXMuX3NpZ25hbGluZ1JlbW90ZUh1bmd1cCk7XG4gICAgICAgIHNpZ25hbGluZ0NoYW5uZWwub25GYWlsZWQgPSBoaXRjaCh0aGlzLCB0aGlzLl9zaWduYWxpbmdGYWlsZWQpO1xuICAgICAgICBzaWduYWxpbmdDaGFubmVsLm9uRGlzY29ubmVjdGVkID0gaGl0Y2godGhpcywgdGhpcy5fc2lnbmFsaW5nRGlzY29ubmVjdGVkKTtcblxuICAgICAgICB0aGlzLl9zaWduYWxpbmdDaGFubmVsID0gc2lnbmFsaW5nQ2hhbm5lbDtcblxuICAgICAgICByZXR1cm4gc2lnbmFsaW5nQ2hhbm5lbDtcbiAgICB9XG5cbiAgICBfc2lnbmFsaW5nQ29ubmVjdGVkKCkge1xuICAgICAgICB0aGlzLl9zdGF0ZS5vblNpZ25hbGluZ0Nvbm5lY3RlZCgpO1xuICAgIH1cbiAgICBfc2lnbmFsaW5nQW5zd2VyZWQoc2RwLCBjYW5kaWRhdGVzKSB7XG4gICAgICAgIHRoaXMuX3N0YXRlLm9uU2lnbmFsaW5nQW5zd2VyZWQoc2RwLCBjYW5kaWRhdGVzKTtcbiAgICB9XG4gICAgX3NpZ25hbGluZ0hhbmRzaGFrZWQoKSB7XG4gICAgICAgIHRoaXMuX3N0YXRlLm9uU2lnbmFsaW5nSGFuZHNoYWtlZCgpO1xuICAgIH1cbiAgICBfc2lnbmFsaW5nUmVtb3RlSHVuZ3VwKCkge1xuICAgICAgICB0aGlzLl9zdGF0ZS5vblJlbW90ZUh1bmd1cCgpO1xuICAgIH1cbiAgICBfc2lnbmFsaW5nRmFpbGVkKGUpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUub25TaWduYWxpbmdGYWlsZWQoZSk7XG4gICAgfVxuICAgIF9zaWduYWxpbmdEaXNjb25uZWN0ZWQoKSB7XG4gICAgfVxuICAgIF9jcmVhdGVQZWVyQ29ubmVjdGlvbihjb25maWd1cmF0aW9uKSB7XG4gICAgICAgIHJldHVybiBuZXcgUlRDUGVlckNvbm5lY3Rpb24oY29uZmlndXJhdGlvbik7XG4gICAgfVxuICAgIGNvbm5lY3QoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHNlbGYuX3Nlc3Npb25SZXBvcnQuc2Vzc2lvblN0YXJ0VGltZSA9IG5vdztcbiAgICAgICAgc2VsZi5fY29ubmVjdFRpbWVTdGFtcCA9IG5vdy5nZXRUaW1lKCk7XG5cbiAgICAgICAgc2VsZi5fcGMgPSBzZWxmLl9jcmVhdGVQZWVyQ29ubmVjdGlvbih7XG4gICAgICAgICAgICBpY2VTZXJ2ZXJzOiBzZWxmLl9pY2VTZXJ2ZXJzLFxuICAgICAgICAgICAgaWNlVHJhbnNwb3J0UG9saWN5OiAncmVsYXknLFxuICAgICAgICAgICAgcnRjcE11eFBvbGljeTogJ3JlcXVpcmUnLFxuICAgICAgICAgICAgYnVuZGxlUG9saWN5OiAnYmFsYW5jZWQnLFxuICAgICAgICAgICAgc2RwU2VtYW50aWNzOiAncGxhbi1iJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgICBvcHRpb25hbDogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ0RzY3A6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYuX3BjLm9udHJhY2sgPSBoaXRjaChzZWxmLCBzZWxmLl9vbnRyYWNrKTtcbiAgICAgICAgc2VsZi5fcGMub25pY2VjYW5kaWRhdGUgPSBoaXRjaChzZWxmLCBzZWxmLl9vbkljZUNhbmRpZGF0ZSk7XG4gICAgICAgIHNlbGYuX3BjLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gaGl0Y2goc2VsZiwgc2VsZi5fb25JY2VTdGF0ZUNoYW5nZSk7XG5cbiAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBHcmFiTG9jYWxNZWRpYVN0YXRlKHNlbGYpKTtcbiAgICB9XG4gICAgYWNjZXB0KCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ2FjY2VwdCBkb2VzIG5vdCBnbyB0aHJvdWdoIHNpZ25hbGluZyBjaGFubmVsIGF0IHRoaXMgbW9tZW50Jyk7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUuaGFuZ3VwKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgcHJvbWlzZSBjb250YWluaW5nIGFuIG9iamVjdCB3aXRoIHR3byBuYW1lZCBsaXN0cyBvZiBhdWRpbyBzdGF0cywgb25lIGZvciBlYWNoIGNoYW5uZWwgb24gZWFjaFxuICAgICAqIG1lZGlhIHR5cGUgb2YgJ3ZpZGVvJyBhbmQgJ2F1ZGlvJy5cbiAgICAgKiBAcmV0dXJuIFJlamVjdGVkIHByb21pc2UgaWYgZmFpbGVkIHRvIGdldCBNZWRpYVJ0cFN0YXRzLiBUaGUgcHJvbWlzZSBpcyBuZXZlciByZXNvbHZlZCB3aXRoIG51bGwgdmFsdWUuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U3RhdHMoKSB7XG4gICAgICAgIHZhciB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIHZhciBpbXBsID0gYXN5bmMgKHN0cmVhbSwgc3RyZWFtVHlwZSkgPT4ge1xuICAgICAgICAgICAgdmFyIHRyYWNrcyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAoISBzdHJlYW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaChzdHJlYW1UeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdhdWRpb19pbnB1dCc6XG4gICAgICAgICAgICBjYXNlICdhdWRpb19vdXRwdXQnOlxuICAgICAgICAgICAgICAgIHRyYWNrcyA9IHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlkZW9faW5wdXQnOlxuICAgICAgICAgICAgY2FzZSAndmlkZW9fb3V0cHV0JzpcbiAgICAgICAgICAgICAgICB0cmFja3MgPSBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBzdHJlYW0gdHlwZSB3aGlsZSB0cnlpbmcgdG8gZ2V0IHN0YXRzOiAnICsgc3RyZWFtVHlwZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbCh0cmFja3MubWFwKGFzeW5jICh0cmFjaykgPT4ge1xuICAgICAgICAgICAgICAgIHZhciByYXdTdGF0cyA9IGF3YWl0IHRoaXMuX3BjLmdldFN0YXRzKHRyYWNrKTtcbiAgICAgICAgICAgICAgICB2YXIgZGlnZXN0ZWRTdGF0cyA9IGV4dHJhY3RNZWRpYVN0YXRzRnJvbVN0YXRzKHRpbWVzdGFtcCwgcmF3U3RhdHMsIHN0cmVhbVR5cGUpO1xuICAgICAgICAgICAgICAgIGlmICghIGRpZ2VzdGVkU3RhdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZXh0cmFjdCBNZWRpYVJ0cFN0YXRzIGZyb20gUlRDU3RhdHNSZXBvcnQgZm9yIHN0cmVhbSB0eXBlICcgKyBzdHJlYW1UeXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpZ2VzdGVkU3RhdHM7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuX3BjICYmIHRoaXMuX3BjLnNpZ25hbGluZ1N0YXRlID09PSAnc3RhYmxlJykge1xuICAgICAgICAgICAgdmFyIHN0YXRzUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGF1ZGlvOiB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0OiAgYXdhaXQgaW1wbCh0aGlzLl9yZW1vdGVBdWRpb1N0cmVhbSwgJ2F1ZGlvX2lucHV0JyksXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dDogYXdhaXQgaW1wbCh0aGlzLl9sb2NhbFN0cmVhbSwgJ2F1ZGlvX291dHB1dCcpXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHZpZGVvOiB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0OiAgYXdhaXQgaW1wbCh0aGlzLl9yZW1vdGVWaWRlb1N0cmVhbSwgJ3ZpZGVvX2lucHV0JyksXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dDogYXdhaXQgaW1wbCh0aGlzLl9sb2NhbFN0cmVhbSwgJ3ZpZGVvX291dHB1dCcpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gRm9yIGNvbnNpc3RlbmN5J3Mgc2FrZSwgY29hbGVzY2UgcnR0TWlsbGlzZWNvbmRzIGludG8gdGhlIG91dHB1dCBmb3IgYXVkaW8gYW5kIHZpZGVvLlxuICAgICAgICAgICAgdmFyIHJ0dFJlZHVjZXIgPSAoYWNjLCBzdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0cy5ydHRNaWxsaXNlY29uZHMgIT09IG51bGwgJiYgKGFjYyA9PT0gbnVsbCB8fCBzdGF0cy5ydHRNaWxsaXNlY29uZHMgPiBhY2MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjYyA9IHN0YXRzLnJ0dE1pbGxpc2Vjb25kcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RhdHMuX3J0dE1pbGxpc2Vjb25kcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBhdWRpb0lucHV0UnR0TWlsbGlzZWNvbmRzID0gc3RhdHNSZXN1bHQuYXVkaW8uaW5wdXQucmVkdWNlKHJ0dFJlZHVjZXIsIG51bGwpO1xuICAgICAgICAgICAgdmFyIHZpZGVvSW5wdXRSdHRNaWxsaXNlY29uZHMgPSBzdGF0c1Jlc3VsdC52aWRlby5pbnB1dC5yZWR1Y2UocnR0UmVkdWNlciwgbnVsbCk7XG5cbiAgICAgICAgICAgIGlmIChhdWRpb0lucHV0UnR0TWlsbGlzZWNvbmRzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgc3RhdHNSZXN1bHQuYXVkaW8ub3V0cHV0LmZvckVhY2goKHN0YXRzKSA9PiB7IHN0YXRzLl9ydHRNaWxsaXNlY29uZHMgPSBhdWRpb0lucHV0UnR0TWlsbGlzZWNvbmRzOyB9KTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2aWRlb0lucHV0UnR0TWlsbGlzZWNvbmRzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgc3RhdHNSZXN1bHQudmlkZW8ub3V0cHV0LmZvckVhY2goKHN0YXRzKSA9PiB7IHN0YXRzLl9ydHRNaWxsaXNlY29uZHMgPSB2aWRlb0lucHV0UnR0TWlsbGlzZWNvbmRzOyB9KTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0c1Jlc3VsdDtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBJbGxlZ2FsU3RhdGUoKSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIHByb21pc2Ugb2YgTWVkaWFSdHBTdGF0cyBvYmplY3QgZm9yIHJlbW90ZSBhdWRpbyAoZnJvbSBBbWF6b24gQ29ubmVjdCB0byBjbGllbnQpLlxuICAgICAqIEByZXR1cm4gUmVqZWN0ZWQgcHJvbWlzZSBpZiBmYWlsZWQgdG8gZ2V0IE1lZGlhUnRwU3RhdHMuIFRoZSBwcm9taXNlIGlzIG5ldmVyIHJlc29sdmVkIHdpdGggbnVsbCB2YWx1ZS5cbiAgICAgKiBAZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBnZXRTdGF0cygpXG4gICAgICovXG4gICAgZ2V0UmVtb3RlQXVkaW9TdGF0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdHMoKS50aGVuKGZ1bmN0aW9uKHN0YXRzKSB7XG4gICAgICAgICAgICBpZiAoc3RhdHMuYXVkaW8ub3V0cHV0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHMuYXVkaW8ub3V0cHV0WzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IElsbGVnYWxTdGF0ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgcHJvbWlzZSBvZiBNZWRpYVJ0cFN0YXRzIG9iamVjdCBmb3IgdXNlciBhdWRpbyAoZnJvbSBjbGllbnQgdG8gQW1hem9uIENvbm5lY3QpLlxuICAgICAqIEByZXR1cm4gUmVqZWN0ZWQgcHJvbWlzZSBpZiBmYWlsZWQgdG8gZ2V0IE1lZGlhUnRwU3RhdHMuIFRoZSBwcm9taXNlIGlzIG5ldmVyIHJlc29sdmVkIHdpdGggbnVsbCB2YWx1ZS5cbiAgICAgKiBAZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBnZXRTdGF0cygpXG4gICAgICovXG4gICAgZ2V0VXNlckF1ZGlvU3RhdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRzKCkudGhlbihmdW5jdGlvbihzdGF0cykge1xuICAgICAgICAgICAgaWYgKHN0YXRzLmF1ZGlvLmlucHV0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHMuYXVkaW8uaW5wdXRbMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgSWxsZWdhbFN0YXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBwcm9taXNlIG9mIE1lZGlhUnRwU3RhdHMgb2JqZWN0IGZvciB1c2VyIHZpZGVvIChmcm9tIGNsaWVudCB0byBBbWF6b24gQ29ubmVjdCkuXG4gICAgICogQHJldHVybiBSZWplY3RlZCBwcm9taXNlIGlmIGZhaWxlZCB0byBnZXQgTWVkaWFSdHBTdGF0cy4gVGhlIHByb21pc2UgaXMgbmV2ZXIgcmVzb2x2ZWQgd2l0aCBudWxsIHZhbHVlLlxuICAgICAqIEBkZXByZWNhdGVkIGluIGZhdm9yIG9mIGdldFN0YXRzKClcbiAgICAgKi9cbiAgICBnZXRSZW1vdGVWaWRlb1N0YXRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0cygpLnRoZW4oZnVuY3Rpb24oc3RhdHMpIHtcbiAgICAgICAgICAgIGlmIChzdGF0cy52aWRlby5vdXRwdXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0cy52aWRlby5vdXRwdXRbMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgSWxsZWdhbFN0YXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBwcm9taXNlIG9mIE1lZGlhUnRwU3RhdHMgb2JqZWN0IGZvciB1c2VyIHZpZGVvIChmcm9tIGNsaWVudCB0byBBbWF6b24gQ29ubmVjdCkuXG4gICAgICogQHJldHVybiBSZWplY3RlZCBwcm9taXNlIGlmIGZhaWxlZCB0byBnZXQgTWVkaWFSdHBTdGF0cy4gVGhlIHByb21pc2UgaXMgbmV2ZXIgcmVzb2x2ZWQgd2l0aCBudWxsIHZhbHVlLlxuICAgICAqIEBkZXByZWNhdGVkIGluIGZhdm9yIG9mIGdldFN0YXRzKClcbiAgICAgKi9cbiAgICBnZXRVc2VyVmlkZW9TdGF0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdHMoKS50aGVuKGZ1bmN0aW9uKHN0YXRzKSB7XG4gICAgICAgICAgICBpZiAoc3RhdHMudmlkZW8uaW5wdXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0cy52aWRlby5pbnB1dFswXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBJbGxlZ2FsU3RhdGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgfVxuXG4gICAgX29uSWNlQ2FuZGlkYXRlKGV2dCkge1xuICAgICAgICB0aGlzLl9zdGF0ZS5vbkljZUNhbmRpZGF0ZShldnQpO1xuICAgIH1cblxuICAgIF9vbkljZVN0YXRlQ2hhbmdlKGV2dCkge1xuICAgICAgICB0aGlzLl9zdGF0ZS5vbkljZVN0YXRlQ2hhbmdlKGV2dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIHJlbW90ZSBtZWRpYSBzdHJlYW0gdG8gd2ViIGVsZW1lbnQuXG4gICAgICovXG4gICAgX29udHJhY2soZXZ0KSB7XG4gICAgICAgIGlmIChldnQuc3RyZWFtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIud2FybignRm91bmQgbW9yZSB0aGFuIDEgc3RyZWFtcyBmb3IgJyArIGV2dC50cmFjay5raW5kICsgJyB0cmFjayAnICsgZXZ0LnRyYWNrLmlkICsgJyA6ICcgK1xuICAgICAgICAgICAgICAgIGV2dC5zdHJlYW1zLm1hcChzdHJlYW0gPT4gc3RyZWFtLmlkKS5qb2luKCcsJykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldnQudHJhY2sua2luZCA9PT0gJ3ZpZGVvJyAmJiB0aGlzLl9yZW1vdGVWaWRlb0VsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZVZpZGVvRWxlbWVudC5zcmNPYmplY3QgPSBldnQuc3RyZWFtc1swXTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZVZpZGVvU3RyZWFtID0gZXZ0LnN0cmVhbXNbMF07XG4gICAgICAgIH0gZWxzZSBpZiAoZXZ0LnRyYWNrLmtpbmQgPT09ICdhdWRpbycgJiYgdGhpcy5fcmVtb3RlQXVkaW9FbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdGVBdWRpb0VsZW1lbnQuc3JjT2JqZWN0ID0gZXZ0LnN0cmVhbXNbMF07XG4gICAgICAgICAgICB0aGlzLl9yZW1vdGVBdWRpb1N0cmVhbSA9IGV2dC5zdHJlYW1zWzBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29uUmVtb3RlU3RyZWFtQWRkZWQodGhpcywgZXZ0LnN0cmVhbXNbMF0pO1xuICAgIH1cbiAgICBfZGV0YWNoTWVkaWEoKSB7XG4gICAgICAgIGlmICh0aGlzLl9yZW1vdGVWaWRlb0VsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZVZpZGVvRWxlbWVudC5zcmNPYmplY3QgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZW1vdGVBdWRpb0VsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZUF1ZGlvRWxlbWVudC5zcmNPYmplY3QgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3RlQXVkaW9TdHJlYW0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9zdG9wU2Vzc2lvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb2NhbFN0cmVhbSAmJiAhdGhpcy5fdXNlclByb3ZpZGVkU3RyZWFtKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VTdHJlYW0odGhpcy5fbG9jYWxTdHJlYW0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvY2FsU3RyZWFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl91c2VyUHJvdmlkZWRTdHJlYW0gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3BjKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BjLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIGVhdCBleGNlcHRpb25cbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGMgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2J1aWxkTWVkaWFDb25zdHJhaW50cygpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbWVkaWFDb25zdHJhaW50cyA9IHt9O1xuXG4gICAgICAgIGlmIChzZWxmLl9lbmFibGVBdWRpbykge1xuICAgICAgICAgICAgdmFyIGF1ZGlvQ29uc3RyYWludHMgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fZWNob0NhbmNlbGxhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBhdWRpb0NvbnN0cmFpbnRzLmVjaG9DYW5jZWxsYXRpb24gPSAhIXNlbGYuX2VjaG9DYW5jZWxsYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYXVkaW9Db25zdHJhaW50cykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG1lZGlhQ29uc3RyYWludHMuYXVkaW8gPSBhdWRpb0NvbnN0cmFpbnRzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZWRpYUNvbnN0cmFpbnRzLmF1ZGlvID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lZGlhQ29uc3RyYWludHMuYXVkaW8gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLl9lbmFibGVWaWRlbykge1xuICAgICAgICAgICAgdmFyIHZpZGVvQ29uc3RyYWludHMgPSB7fTtcbiAgICAgICAgICAgIHZhciB3aWR0aENvbnN0cmFpbnRzID0ge307XG4gICAgICAgICAgICB2YXIgaGVpZ2h0Q29uc3RyYWludHMgPSB7fTtcbiAgICAgICAgICAgIHZhciBmcmFtZVJhdGVDb25zdHJhaW50cyA9IHt9O1xuXG4gICAgICAgICAgICAvL2J1aWxkIHZpZGVvIHdpZHRoIGNvbnN0cmFpbnRzXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuX2lkZWFsVmlkZW9XaWR0aCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB3aWR0aENvbnN0cmFpbnRzLmlkZWFsID0gc2VsZi5faWRlYWxWaWRlb1dpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl9tYXhWaWRlb1dpZHRoICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHdpZHRoQ29uc3RyYWludHMubWF4ID0gc2VsZi5fbWF4VmlkZW9XaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fbWluVmlkZW9XaWR0aCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB3aWR0aENvbnN0cmFpbnRzLm1pbiA9IHNlbGYuX21pblZpZGVvV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBidWlsZCB2aWRlbyBoZWlnaHQgY29uc3RyYWludHNcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5faWRlYWxWaWRlb0hlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHRDb25zdHJhaW50cy5pZGVhbCA9IHNlbGYuX2lkZWFsVmlkZW9IZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuX21heFZpZGVvSGVpZ2h0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGhlaWdodENvbnN0cmFpbnRzLm1heCA9IHNlbGYuX21heFZpZGVvSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl9taW5WaWRlb0hlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHRDb25zdHJhaW50cy5taW4gPSBzZWxmLl9taW5WaWRlb0hlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHdpZHRoQ29uc3RyYWludHMpLmxlbmd0aCA+IDAgJiYgT2JqZWN0LmtleXMoaGVpZ2h0Q29uc3RyYWludHMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2aWRlb0NvbnN0cmFpbnRzLndpZHRoID0gd2lkdGhDb25zdHJhaW50cztcbiAgICAgICAgICAgICAgICB2aWRlb0NvbnN0cmFpbnRzLmhlaWdodCA9IGhlaWdodENvbnN0cmFpbnRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gYnVpbGQgZnJhbWUgcmF0ZSBjb25zdHJhaW50c1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl92aWRlb0ZyYW1lUmF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBmcmFtZVJhdGVDb25zdHJhaW50cy5pZGVhbCA9IHNlbGYuX3ZpZGVvRnJhbWVSYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl9taW5WaWRlb0ZyYW1lUmF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBmcmFtZVJhdGVDb25zdHJhaW50cy5taW4gPSBzZWxmLl9taW5WaWRlb0ZyYW1lUmF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fbWF4VmlkZW9GcmFtZVJhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZnJhbWVSYXRlQ29uc3RyYWludHMubWF4ID0gc2VsZi5fbWF4VmlkZW9GcmFtZVJhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihPYmplY3Qua2V5cyhmcmFtZVJhdGVDb25zdHJhaW50cykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZpZGVvQ29uc3RyYWludHMuZnJhbWVSYXRlID0gZnJhbWVSYXRlQ29uc3RyYWludHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGJ1aWxkIGZhY2luZyBtb2RlIGNvbnN0cmFpbnRzXG4gICAgICAgICAgICBpZihzZWxmLl9mYWNpbmdNb2RlICE9PSAndXNlcicgJiYgc2VsZi5fZmFjaW5nTW9kZSAhPT0gXCJlbnZpcm9ubWVudFwiKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZmFjaW5nTW9kZSA9ICd1c2VyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZpZGVvQ29uc3RyYWludHMuZmFjaW5nTW9kZSA9IHNlbGYuX2ZhY2luZ01vZGU7XG5cbiAgICAgICAgICAgIC8vIHNldCB2aWRlbyBjb25zdHJhaW50c1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHZpZGVvQ29uc3RyYWludHMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBtZWRpYUNvbnN0cmFpbnRzLnZpZGVvID0gdmlkZW9Db25zdHJhaW50cztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVkaWFDb25zdHJhaW50cy52aWRlbyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVkaWFDb25zdHJhaW50cztcbiAgICB9XG59XG4iLCIvKipcbiogRXh0cmFjdCBydHAgc3RhdHMgb2Ygc3BlY2lmaWVkIHN0cmVhbSBmcm9tIFJUQ1N0YXRzUmVwb3J0XG4qIENocm9tZSByZXBvcnRzIGFsbCBzdHJlYW0gc3RhdHMgaW4gc3RhdHNSZXBvcnRzIHdoZXJlYXMgZmlyZWZveCByZXBvcnRzIG9ubHkgc2luZ2xlIHN0cmVhbSBzdGF0cyBpbiByZXBvcnRcbiogU3RyZWFtVHlwZSBpcyBwYXNzZWQgb25seSB0byBwdWxsIHJpZ2h0IHN0cmVhbSBzdGF0cyBhdWRpb19pbnB1dCBvciBhdWRpb19vdXRwdXQuXG4qL1xuXG5pbXBvcnQgeyBpc19kZWZpbmVkLCB3aGVuX2RlZmluZWQgfSBmcm9tICcuL3V0aWxzJztcbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0TWVkaWFTdGF0c0Zyb21TdGF0cyh0aW1lc3RhbXAsIHN0YXRzLCBzdHJlYW1UeXBlKSB7XG4gICAgdmFyIGV4dHJhY3RlZFN0YXRzID0gbnVsbDtcblxuICAgIGZvciAodmFyIGtleSBpbiBzdGF0cykge1xuICAgICAgICB2YXIgc3RhdHNSZXBvcnQgPSBzdGF0c1trZXldO1xuICAgICAgICBpZiAoc3RhdHNSZXBvcnQpIHtcbiAgICAgICAgICAgIGlmIChzdGF0c1JlcG9ydC50eXBlID09PSAnc3NyYycpIHtcbiAgICAgICAgICAgICAgICAvL2Nocm9tZSwgb3BlcmEgY2FzZS4gY2hyb21lIHJlcG9ydHMgc3RhdHMgZm9yIGFsbCBzdHJlYW1zLCBub3QganVzdCB0aGUgc3RyZWFtIHBhc3NlZCBpbi5cbiAgICAgICAgICAgICAgICBpZiAoaXNfZGVmaW5lZChzdGF0c1JlcG9ydC5wYWNrZXRzU2VudCkgJiYgc3RhdHNSZXBvcnQubWVkaWFUeXBlID09ICdhdWRpbycgJiYgc3RyZWFtVHlwZSA9PT0gJ2F1ZGlvX2lucHV0Jykge1xuICAgICAgICAgICAgICAgICAgICBleHRyYWN0ZWRTdGF0cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogICAgICAgICAgdGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFja2V0c0NvdW50OiAgICAgICBzdGF0c1JlcG9ydC5wYWNrZXRzU2VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzU2VudDogICAgICAgICAgc3RhdHNSZXBvcnQuYnl0ZXNTZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9MZXZlbDogICAgICAgICB3aGVuX2RlZmluZWQoc3RhdHNSZXBvcnQuYXVkaW9JbnB1dExldmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2tldHNMb3N0OiAgICAgICAgaXNfZGVmaW5lZChzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdCkgPyBNYXRoLm1heCgwLCBzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdCkgOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY01pbGxpc2Vjb25kczogICBpc19kZWZpbmVkKHN0YXRzUmVwb3J0Lmdvb2dDdXJyZW50RGVsYXlNcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBydHRNaWxsaXNlY29uZHM6ICAgIHdoZW5fZGVmaW5lZChzdGF0c1JlcG9ydC5nb29nUnR0KVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc19kZWZpbmVkKHN0YXRzUmVwb3J0LnBhY2tldHNSZWNlaXZlZCkgJiYgc3RhdHNSZXBvcnQubWVkaWFUeXBlID09ICdhdWRpbycgJiYgc3RyZWFtVHlwZSA9PT0gJ2F1ZGlvX291dHB1dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkU3RhdHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6ICAgICAgICAgIHRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2tldHNDb3VudDogICAgICAgc3RhdHNSZXBvcnQucGFja2V0c1JlY2VpdmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNSZWNlaXZlZDogICAgICBzdGF0c1JlcG9ydC5ieXRlc1JlY2VpdmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9MZXZlbDogICAgICAgICB3aGVuX2RlZmluZWQoc3RhdHNSZXBvcnQuYXVkaW9PdXRwdXRMZXZlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrZXRzTG9zdDogICAgICAgIGlzX2RlZmluZWQoc3RhdHNSZXBvcnQucGFja2V0c0xvc3QpID8gTWF0aC5tYXgoMCwgc3RhdHNSZXBvcnQucGFja2V0c0xvc3QpIDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2NNaWxsaXNlY29uZHM6ICAgaXNfZGVmaW5lZChzdGF0c1JlcG9ydC5nb29nQ3VycmVudERlbGF5TXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgamJNaWxsaXNlY29uZHM6ICAgICB3aGVuX2RlZmluZWQoc3RhdHNSZXBvcnQuZ29vZ0ppdHRlckJ1ZmZlck1zKVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc19kZWZpbmVkKHN0YXRzUmVwb3J0LnBhY2tldHNTZW50KSAmJiBzdGF0c1JlcG9ydC5tZWRpYVR5cGUgPT0gJ3ZpZGVvJyAmJiBzdHJlYW1UeXBlID09PSAndmlkZW9faW5wdXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZFN0YXRzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAgICAgICAgICB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrZXRzQ291bnQ6ICAgICAgIHN0YXRzUmVwb3J0LnBhY2tldHNTZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNTZW50OiAgICAgICAgICBzdGF0c1JlcG9ydC5ieXRlc1NlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrZXRzTG9zdDogICAgICAgIGlzX2RlZmluZWQoc3RhdHNSZXBvcnQucGFja2V0c0xvc3QpID8gTWF0aC5tYXgoMCwgc3RhdHNSZXBvcnQucGFja2V0c0xvc3QpIDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ0dE1pbGxpc2Vjb25kczogICAgd2hlbl9kZWZpbmVkKHN0YXRzUmVwb3J0Lmdvb2dSdHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY01pbGxpc2Vjb25kczogICBpc19kZWZpbmVkKHN0YXRzUmVwb3J0Lmdvb2dDdXJyZW50RGVsYXlNcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZVJhdGVTZW50OiAgICAgIHdoZW5fZGVmaW5lZChzdGF0c1JlcG9ydC5nb29nRnJhbWVSYXRlU2VudCksXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5wYWNrZXRzUmVjZWl2ZWQgIT09ICd1bmRlZmluZWQnICYmIHN0YXRzUmVwb3J0Lm1lZGlhVHlwZSA9PSAndmlkZW8nICYmIHN0cmVhbVR5cGUgPT09ICd2aWRlb19vdXRwdXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZFN0YXRzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAgICAgICAgICB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrZXRzQ291bnQ6ICAgICAgIHN0YXRzUmVwb3J0LnBhY2tldHNTZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNSZWNlaXZlZDogICAgICBzdGF0c1JlcG9ydC5ieXRlc1JlY2VpdmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFja2V0c0xvc3Q6ICAgICAgICBpc19kZWZpbmVkKHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0KSA/IE1hdGgubWF4KDAsIHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0KSA6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZVJhdGVSZWNlaXZlZDogIHdoZW5fZGVmaW5lZChzdGF0c1JlcG9ydC5nb29nRnJhbWVSYXRlUmVjZWl2ZWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY01pbGxpc2Vjb25kczogICBpc19kZWZpbmVkKHN0YXRzUmVwb3J0Lmdvb2dDdXJyZW50RGVsYXlNcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBqYk1pbGxpc2Vjb25kczogICAgIHdoZW5fZGVmaW5lZChzdGF0c1JlcG9ydC5nb29nSml0dGVyQnVmZmVyTXMpXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRzUmVwb3J0LnR5cGUgPT09ICdpbmJvdW5kcnRwJykge1xuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggY2FzZS4gRmlyZWZveCByZXBvcnRzIHBhY2tldHNMb3N0IHBhcmFtZXRlciBvbmx5IGluIGluYm91bmRydHAgdHlwZSwgYW5kIGRvZXNuJ3QgcmVwb3J0IGluIG91dGJvdW5kcnRwIHR5cGUuXG4gICAgICAgICAgICAgICAgLy8gU28gd2Ugb25seSBwdWxsIGZyb20gaW5ib3VuZHJ0cC4gRmlyZWZveCByZXBvcnRzIG9ubHkgc3RhdHMgZm9yIHRoZSBzdHJlYW0gcGFzc2VkIGluLlxuICAgICAgICAgICAgICAgIGlmIChpc19kZWZpbmVkKHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0KSAmJiBpc19kZWZpbmVkKHN0YXRzUmVwb3J0LnBhY2tldHNSZWNlaXZlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkU3RhdHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrZXRzTG9zdDogICAgICAgIHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFja2V0c0NvdW50OiAgICAgICBzdGF0c1JlcG9ydC5wYWNrZXRzUmVjZWl2ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWRpb0xldmVsOiAgICAgICAgIHdoZW5fZGVmaW5lZChzdGF0c1JlcG9ydC5hdWRpb0lucHV0TGV2ZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcnR0TWlsbGlzZWNvbmRzOiAgICBzdHJlYW1UeXBlID09PSAnYXVkaW9fb3VwdHV0JyB8fCBzdHJlYW1UeXBlID09PSAndmlkZW9fb3V0cHV0JyA/IHdoZW5fZGVmaW5lZChzdGF0c1JlcG9ydC5yb3VuZFRyaXBUaW1lKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBqYk1pbGxpc2Vjb25kczogICAgIHN0cmVhbVR5cGUgPT09ICdhdWRpb19vdXRwdXQnIHx8IHN0cmVhbVR5cGUgPT09ICd2aWRlb19vdXRwdXQnID8gd2hlbl9kZWZpbmVkKHN0YXRzUmVwb3J0LmppdHRlciwgMCkgKiAxMDAwIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBleHRyYWN0ZWRTdGF0cyA/IG5ldyBNZWRpYVJ0cFN0YXRzKGV4dHJhY3RlZFN0YXRzLCBzdGF0c1JlcG9ydC50eXBlLCBzdHJlYW1UeXBlKSA6IG51bGw7XG59XG5cbi8qKlxuKiBCYXNpYyBSVFAgc3RhdGlzdGljcyBvYmplY3QsIHJlcHJlc2VudHMgc3RhdGlzdGljcyBvZiBhbiBhdWRpbyBvciB2aWRlbyBzdHJlYW0uXG4qL1xuY2xhc3MgTWVkaWFSdHBTdGF0cyB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zSW4sIHN0YXRzUmVwb3J0VHlwZSwgc3RyZWFtVHlwZSkge1xuICAgICAgICB2YXIgcGFyYW1zID0gcGFyYW1zSW4gfHwge307XG5cbiAgICAgICAgdGhpcy5fdGltZXN0YW1wICAgICAgICAgPSBwYXJhbXMudGltZXN0YW1wIHx8IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICB0aGlzLl9wYWNrZXRzTG9zdCAgICAgICA9IHdoZW5fZGVmaW5lZChwYXJhbXMucGFja2V0c0xvc3QpO1xuICAgICAgICB0aGlzLl9wYWNrZXRzQ291bnQgICAgICA9IHdoZW5fZGVmaW5lZChwYXJhbXMucGFja2V0c0NvdW50KTtcbiAgICAgICAgdGhpcy5fYXVkaW9MZXZlbCAgICAgICAgPSB3aGVuX2RlZmluZWQocGFyYW1zLmF1ZGlvTGV2ZWwpO1xuICAgICAgICB0aGlzLl9ydHRNaWxsaXNlY29uZHMgICA9IHdoZW5fZGVmaW5lZChwYXJhbXMucnR0TWlsbGlzZWNvbmRzKTtcbiAgICAgICAgdGhpcy5famJNaWxsaXNlY29uZHMgICAgPSB3aGVuX2RlZmluZWQocGFyYW1zLmpiTWlsbGlzZWNvbmRzKTtcbiAgICAgICAgdGhpcy5fYnl0ZXNTZW50ICAgICAgICAgPSB3aGVuX2RlZmluZWQocGFyYW1zLmJ5dGVzU2VudCk7XG4gICAgICAgIHRoaXMuX2J5dGVzUmVjZWl2ZWQgICAgID0gd2hlbl9kZWZpbmVkKHBhcmFtcy5ieXRlc1JlY2VpdmVkKTtcbiAgICAgICAgdGhpcy5fZnJhbWVzRW5jb2RlZCAgICAgPSB3aGVuX2RlZmluZWQocGFyYW1zLmZyYW1lc0VuY29kZWQpO1xuICAgICAgICB0aGlzLl9mcmFtZXNEZWNvZGVkICAgICA9IHdoZW5fZGVmaW5lZChwYXJhbXMuZnJhbWVzRGVjb2RlZCk7XG4gICAgICAgIHRoaXMuX2ZyYW1lUmF0ZVNlbnQgICAgID0gd2hlbl9kZWZpbmVkKHBhcmFtcy5mcmFtZVJhdGVTZW50KTtcbiAgICAgICAgdGhpcy5fZnJhbWVSYXRlUmVjZWl2ZWQgPSB3aGVuX2RlZmluZWQocGFyYW1zLmZyYW1lUmF0ZVJlY2VpdmVkKTtcbiAgICAgICAgdGhpcy5fc3RhdHNSZXBvcnRUeXBlICAgPSBzdGF0c1JlcG9ydFR5cGUgfHwgcGFyYW1zLl9zdGF0c1JlcG9ydFR5cGUgfHwgXCJ1bmtub3duXCI7XG4gICAgICAgIHRoaXMuX3N0cmVhbVR5cGUgICAgICAgID0gc3RyZWFtVHlwZSB8fCBwYXJhbXMuc3RyZWFtVHlwZSB8fCBcInVua25vd25cIjtcbiAgICB9XG5cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIHBhY2tldHMgc2VudCB0byB0aGUgY2hhbm5lbCAqL1xuICAgIGdldCBwYWNrZXRzQ291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWNrZXRzQ291bnQ7XG4gICAgfVxuICAgIC8qKiB7bnVtYmVyfSBudW1iZXIgb2YgcGFja2V0cyBsb3N0IGFmdGVyIHRyYXZlbGxpbmcgdGhyb3VnaCB0aGUgY2hhbm5lbCAqL1xuICAgIGdldCBwYWNrZXRzTG9zdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhY2tldHNMb3N0O1xuICAgIH1cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIHBhY2tldHMgbG9zdCBhZnRlciB0cmF2ZWxsaW5nIHRocm91Z2ggdGhlIGNoYW5uZWwgKi9cbiAgICBnZXQgcGFja2V0TG9zc1BlcmNlbnRhZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWNrZXRzQ291bnQgPiAwID8gdGhpcy5fcGFja2V0c0xvc3QgLyB0aGlzLl9wYWNrZXRzQ291bnQgOiAwO1xuICAgIH1cbiAgICAvKiogQXVkaW8gdm9sdW1lIGxldmVsXG4gICAgKiBDdXJyZW50bHkgZmlyZWZveCBkb2Vzbid0IHByb3ZpZGUgYXVkaW8gbGV2ZWwgaW4gcnRwIHN0YXRzLlxuICAgICovXG4gICAgZ2V0IGF1ZGlvTGV2ZWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hdWRpb0xldmVsO1xuICAgIH1cbiAgICAvKiogVGltZXN0YW1wIHdoZW4gc3RhdHMgYXJlIGNvbGxlY3RlZC4gKi9cbiAgICBnZXQgdGltZXN0YW1wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGltZXN0YW1wO1xuICAgIH1cbiAgICAvKioge251bWJlcn0gUm91bmQgdHJpcCB0aW1lIGNhbGN1bGF0ZWQgd2l0aCBSVENQIHJlcG9ydHMgKi9cbiAgICBnZXQgcnR0TWlsbGlzZWNvbmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnR0TWlsbGlzZWNvbmRzO1xuICAgIH1cbiAgICAvKioge251bWJlcn0gQnJvd3Nlci9jbGllbnQgc2lkZSBqaXR0ZXIgYnVmZmVyIGxlbmd0aCAqL1xuICAgIGdldCBqYk1pbGxpc2Vjb25kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2piTWlsbGlzZWNvbmRzO1xuICAgIH1cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIGJ5dGVzIHNlbnQgdG8gdGhlIGNoYW5uZWwqL1xuICAgIGdldCBieXRlc1NlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ieXRlc1NlbnQ7XG4gICAgfVxuICAgIC8qKiB7bnVtYmVyfSBudW1iZXIgb2YgYnl0ZXMgcmVjZWl2ZWQgZnJvbSB0aGUgY2hhbm5lbCovXG4gICAgZ2V0IGJ5dGVzUmVjZWl2ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ieXRlc1JlY2VpdmVkO1xuICAgIH1cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIHZpZGVvIGZyYW1lcyBlbmNvZGVkKi9cbiAgICBnZXQgZnJhbWVzRW5jb2RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1lc0VuY29kZWQ7XG4gICAgfVxuICAgIC8qKiB7bnVtYmVyfSBudW1iZXIgb2YgdmlkZW8gZnJhbWVzIGRlY29kZWQqL1xuICAgIGdldCBmcmFtZXNEZWNvZGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWVzRGVjb2RlZDtcbiAgICB9XG4gICAgLyoqIHtudW1iZXJ9IGZyYW1lcyBwZXIgc2Vjb25kIHNlbnQgdG8gdGhlIGNoYW5uZWwqL1xuICAgIGdldCBmcmFtZVJhdGVTZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWVSYXRlU2VudDtcbiAgICB9XG4gICAgLyoqIHtudW1iZXJ9IGZyYW1lcyBwZXIgc2Vjb25kIHJlY2VpdmVkIGZyb20gdGhlIGNoYW5uZWwqL1xuICAgIGdldCBmcmFtZVJhdGVSZWNlaXZlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1lUmF0ZVJlY2VpdmVkO1xuICAgIH1cbiAgICAvKioge3N0cmluZ30gdGhlIHR5cGUgb2YgdGhlIHN0YXRzIHJlcG9ydCAqL1xuICAgIGdldCBzdGF0c1JlcG9ydFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGF0c1JlcG9ydFR5cGU7XG4gICAgfVxuICAgIC8qKiB7c3RyaW5nfSB0aGUgdHlwZSBvZiB0aGUgc3RyZWFtICovXG4gICAgZ2V0IHN0cmVhbVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdHJlYW1UeXBlO1xuICAgIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5leHBvcnQgY2xhc3MgU2Vzc2lvblJlcG9ydCB7XG4gICAgLyoqXG4gICAgICogQGNsYXNzIFByb3RvdHlwZSBmb3IgdHJhY2tpbmcgdmFyaW91cyBSVEMgc2Vzc2lvbiByZXBvcnRcbiAgICAgKiBAY29uc3RydWN0c1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9zZXNzaW9uU3RhcnRUaW1lID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc2Vzc2lvbkVuZFRpbWUgPSBudWxsO1xuICAgICAgICB0aGlzLl9ndW1UaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6YXRpb25UaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5faWNlQ29sbGVjdGlvblRpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9zaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9oYW5kc2hha2luZ1RpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcmVUYWxraW5nVGltZU1pbGxpcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RhbGtpbmdUaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5faWNlQ29ubmVjdGlvbnNMb3N0ID0gMDtcbiAgICAgICAgdGhpcy5fY2xlYW51cFRpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9pY2VDb2xsZWN0aW9uRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3NpZ25hbGxpbmdDb25uZWN0aW9uRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFraW5nRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2d1bU90aGVyRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2d1bVRpbWVvdXRGYWlsdXJlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY3JlYXRlT2ZmZXJGYWlsdXJlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl91c2VyQnVzeUZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9pbnZhbGlkUmVtb3RlU0RQRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX25vUmVtb3RlSWNlQ2FuZGlkYXRlRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3NldFJlbW90ZURlc2NyaXB0aW9uRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3N0cmVhbVN0YXRzID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqVGltZXN0YW1wIHdoZW4gUlRDU2Vzc2lvbiBzdGFydGVkLlxuICAgICAqL1xuICAgIGdldCBzZXNzaW9uU3RhcnRUaW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Vzc2lvblN0YXJ0VGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZXN0YW1wIHdoZW4gUlRDU2Vzc2lvbiBlbmRlZC5cbiAgICAgKi9cbiAgICBnZXQgc2Vzc2lvbkVuZFRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXNzaW9uRW5kVGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZSB0YWtlbiBmb3IgZ3JhYmJpbmcgdXNlciBtaWNyb3Bob25lIGF0IHRoZSB0aW1lIG9mIGNvbm5lY3RpbmcgUlRDU2Vzc2lvbi5cbiAgICAgKi9cbiAgICBnZXQgZ3VtVGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2d1bVRpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRpbWUgdGFrZW4gZm9yIHNlc3Npb24gaW5pdGlhbGl6YXRpb24gaW4gbWlsbGlzLiBJbmNsdWRlcyB0aW1lIHNwZW50IGluIEdyYWJMb2NhbE1lZGlhLCBTZXRMb2NhbFNEUCBzdGF0ZXMuXG4gICAgICovXG4gICAgZ2V0IGluaXRpYWxpemF0aW9uVGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRpYWxpemF0aW9uVGltZU1pbGxpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZSBzcGVudCBvbiBJQ0VDb2xsZWN0aW9uIGluIG1pbGxpcy5cbiAgICAgKi9cbiAgICBnZXQgaWNlQ29sbGVjdGlvblRpbWVNaWxsaXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pY2VDb2xsZWN0aW9uVGltZU1pbGxpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZSB0YWtlbiBmb3IgY29ubmVjdGluZyB0aGUgc2lnbmFsbGluZyBpbiBtaWxsaXMuXG4gICAgICovXG4gICAgZ2V0IHNpZ25hbGxpbmdDb25uZWN0VGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ25hbGxpbmdDb25uZWN0VGltZU1pbGxpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZXMgc3BlbnQgZnJvbSBSVENTZXNzaW9uIGNvbm5lY3Rpb24gdW50aWwgZW50ZXJpbmcgVGFsa2luZyBzdGF0ZSBpbiBtaWxsaXMuXG4gICAgICovXG4gICAgZ2V0IHByZVRhbGtpbmdUaW1lTWlsbGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJlVGFsa2luZ1RpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBUaW1lcyBzcGVudCBpbiBjb21wbGV0aW5nIGhhbmRzaGFraW5nIHByb2Nlc3Mgb2YgdGhlIFJUQ1Nlc3Npb24gaW4gbWlsbGlzLlxuICAgICAqL1xuICAgIGdldCBoYW5kc2hha2luZ1RpbWVNaWxsaXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kc2hha2luZ1RpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBUaW1lcyBzcGVudCBpbiBUYWxraW5nIHN0YXRlIGluIG1pbGxpcy5cbiAgICAgKi9cbiAgICBnZXQgdGFsa2luZ1RpbWVNaWxsaXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90YWxraW5nVGltZU1pbGxpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSG93IG1hbnkgdGltZXMgdGhlIFJUQ1Nlc3Npb24gaGFzIGxvc3QgSUNFIGNvbm5lY3Rpb24gaW4gdGFsa2luZyBzdGF0ZS5cbiAgICAgKi9cbiAgICBnZXQgaWNlQ29ubmVjdGlvbnNMb3N0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faWNlQ29ubmVjdGlvbnNMb3N0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaW1lcyBzcGVudCBpbiBDbGVhbnVwIHN0YXRlIGluIG1pbGxpc1xuICAgICAqL1xuICAgIGdldCBjbGVhbnVwVGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsZWFudXBUaW1lTWlsbGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUZWxscyBpZiB0aGUgUlRDU2Vzc2lvbiBmYWlscyBpbiBJQ0VDb2xsZWN0aW9uLlxuICAgICAqL1xuICAgIGdldCBpY2VDb2xsZWN0aW9uRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ljZUNvbGxlY3Rpb25GYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUZWxscyBpZiB0aGUgUlRDU2Vzc2lvbiBmYWlsZWQgaW4gc2lnbmFsbGluZyBjb25uZWN0IHN0YWdlLlxuICAgICAqL1xuICAgIGdldCBzaWduYWxsaW5nQ29ubmVjdGlvbkZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduYWxsaW5nQ29ubmVjdGlvbkZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRzaGFraW5nIGZhaWx1cmUgb2YgdGhlIFJUQ1Nlc3Npb25cbiAgICAgKi9cbiAgICBnZXQgaGFuZHNoYWtpbmdGYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFuZHNoYWtpbmdGYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHdW0gZmFpbGVkIGR1ZSB0byB0aW1lb3V0IGF0IHRoZSB0aW1lIG9mIG5ldyBSVENTZXNzaW9uIGNvbm5lY3Rpb25cbiAgICAgKi9cbiAgICBnZXQgZ3VtVGltZW91dEZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ndW1UaW1lb3V0RmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR3VtIGZhaWxlZCBkdWUgdG8gb3RoZXIgcmVhc29ucyAob3RoZXIgdGhhbiBUaW1lb3V0KVxuICAgICAqL1xuICAgIGdldCBndW1PdGhlckZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ndW1PdGhlckZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJUQyBTZXNzaW9uIGZhaWxlZCBpbiBjcmVhdGUgT2ZmZXIgc3RhdGUuXG4gICAgICovXG4gICAgZ2V0IGNyZWF0ZU9mZmVyRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZU9mZmVyRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGVsbHMgaWYgc2V0TG9jYWxEZXNjcmlwdGlvbiBmYWlsZWQgZm9yIHRoZSBSVEMgU2Vzc2lvbi5cbiAgICAgKi9cbiAgICBnZXQgc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXRMb2NhbERlc2NyaXB0aW9uRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGVsbHMgaWYgaGFuZHNoYWtpbmcgZmFpbGVkIGR1ZSB0byB1c2VyIGJ1c3kgY2FzZSxcbiAgICAgKiBoYXBwZW5zIHdoZW4gbXVsdGlwbGUgc29mdHBob25lIGNhbGxzIGFyZSBpbml0aWF0ZWQgYXQgc2FtZSB0aW1lLlxuICAgICAqL1xuICAgIGdldCB1c2VyQnVzeUZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl91c2VyQnVzeUZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRlbGxzIGl0IHJlbW90ZSBTRFAgaXMgaW52YWxpZC5cbiAgICAgKi9cbiAgICBnZXQgaW52YWxpZFJlbW90ZVNEUEZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZhbGlkUmVtb3RlU0RQRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGVsbHMgaWYgdGhlIHNldFJlbW90ZURlc2NyaXB0aW9uIGZhaWxlZCBmb3IgdGhlIFJUQyBTZXNzaW9uLlxuICAgICAqL1xuICAgIGdldCBzZXRSZW1vdGVEZXNjcmlwdGlvbkZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXRSZW1vdGVEZXNjcmlwdGlvbkZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgZmFpbHVyZSBjYXNlIHdoZW4gdGhlcmUgaXMgbm8gUmVtb3RlSWNlQ2FuZGlkYXRlLlxuICAgICAqL1xuICAgIGdldCBub1JlbW90ZUljZUNhbmRpZGF0ZUZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ub1JlbW90ZUljZUNhbmRpZGF0ZUZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpc3RpY3MgZm9yIGVhY2ggc3RyZWFtKGF1ZGlvLWluLCBhdWRpby1vdXQsIHZpZGVvLWluLCB2aWRlby1vdXQpIG9mIHRoZSBSVENTZXNzaW9uLlxuICAgICAqL1xuICAgIGdldCBzdHJlYW1TdGF0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0cmVhbVN0YXRzO1xuICAgIH1cblxuICAgIHNldCBzZXNzaW9uU3RhcnRUaW1lKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3Nlc3Npb25TdGFydFRpbWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHNlc3Npb25FbmRUaW1lKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3Nlc3Npb25FbmRUaW1lID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBndW1UaW1lTWlsbGlzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2d1bVRpbWVNaWxsaXMgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGluaXRpYWxpemF0aW9uVGltZU1pbGxpcyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9pbml0aWFsaXphdGlvblRpbWVNaWxsaXMgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGljZUNvbGxlY3Rpb25UaW1lTWlsbGlzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2ljZUNvbGxlY3Rpb25UaW1lTWlsbGlzID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBzaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2lnbmFsbGluZ0Nvbm5lY3RUaW1lTWlsbGlzID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBwcmVUYWxraW5nVGltZU1pbGxpcyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wcmVUYWxraW5nVGltZU1pbGxpcyA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgaGFuZHNoYWtpbmdUaW1lTWlsbGlzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFraW5nVGltZU1pbGxpcyA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgdGFsa2luZ1RpbWVNaWxsaXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdGFsa2luZ1RpbWVNaWxsaXMgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGljZUNvbm5lY3Rpb25zTG9zdCh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9pY2VDb25uZWN0aW9uc0xvc3QgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGNsZWFudXBUaW1lTWlsbGlzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2NsZWFudXBUaW1lTWlsbGlzID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBpY2VDb2xsZWN0aW9uRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9pY2VDb2xsZWN0aW9uRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgc2lnbmFsbGluZ0Nvbm5lY3Rpb25GYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3NpZ25hbGxpbmdDb25uZWN0aW9uRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgaGFuZHNoYWtpbmdGYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFraW5nRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgZ3VtVGltZW91dEZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZ3VtVGltZW91dEZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGd1bU90aGVyRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9ndW1PdGhlckZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGNyZWF0ZU9mZmVyRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9jcmVhdGVPZmZlckZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHNldExvY2FsRGVzY3JpcHRpb25GYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3NldExvY2FsRGVzY3JpcHRpb25GYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCB1c2VyQnVzeUZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdXNlckJ1c3lGYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBpbnZhbGlkUmVtb3RlU0RQRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9pbnZhbGlkUmVtb3RlU0RQRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgbm9SZW1vdGVJY2VDYW5kaWRhdGVGYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX25vUmVtb3RlSWNlQ2FuZGlkYXRlRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgc2V0UmVtb3RlRGVzY3JpcHRpb25GYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3NldFJlbW90ZURlc2NyaXB0aW9uRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgc3RyZWFtU3RhdHModmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc3RyZWFtU3RhdHMgPSB2YWx1ZTtcbiAgICB9XG59IiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBbWF6b24gU29mdHdhcmUgTGljZW5zZSAodGhlIFwiTGljZW5zZVwiKS4gWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgaHR0cDovL2F3cy5hbWF6b24uY29tL2FzbC9cbiAqXG4gKiBvciBpbiB0aGUgXCJMSUNFTlNFXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7IGhpdGNoLCB3cmFwTG9nZ2VyIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBNQVhfSU5WSVRFX0RFTEFZX01TLCBNQVhfQUNDRVBUX0JZRV9ERUxBWV9NUywgREVGQVVMVF9DT05ORUNUX1RJTUVPVVRfTVMgfSBmcm9tICcuL3J0Y19jb25zdCc7XG5pbXBvcnQgeyBVbnN1cHBvcnRlZE9wZXJhdGlvbiwgVGltZW91dCwgQnVzeUV4Y2VwdGlvbiwgQ2FsbE5vdEZvdW5kRXhjZXB0aW9uLCBVbmtub3duU2lnbmFsaW5nRXJyb3IgfSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuXG52YXIgcmVxSWRTZXEgPSAxO1xuXG52YXIgQ09OTkVDVF9NQVhfUkVUUklFUyA9IDM7XG5cbi8qKlxuICogQWJzdHJhY3Qgc2lnbmFsaW5nIHN0YXRlIGNsYXNzLlxuICovXG5leHBvcnQgY2xhc3MgU2lnbmFsaW5nU3RhdGUge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7QW16blJ0Y1NpZ25hbGluZ30gc2lnbmFsaW5nIFNpZ25hbGluZyBvYmplY3QuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2lnbmFsaW5nKSB7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZyA9IHNpZ25hbGluZztcbiAgICAgICAgdGhpcy5fY3JlYXRlVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIH1cbiAgICBzZXRTdGF0ZVRpbWVvdXQodGltZW91dE1zKSB7XG4gICAgICAgIHNldFRpbWVvdXQoaGl0Y2godGhpcywgdGhpcy5fb25UaW1lb3V0Q2hlY2tlZCksIHRpbWVvdXRNcyk7XG4gICAgfVxuICAgIGdldCBpc0N1cnJlbnRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgPT09IHRoaXMuX3NpZ25hbGluZy5zdGF0ZTtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICB9XG4gICAgX29uVGltZW91dENoZWNrZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzQ3VycmVudFN0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uVGltZW91dCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCk7XG4gICAgfVxuICAgIHRyYW5zaXQobmV3U3RhdGUpIHtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLnRyYW5zaXQobmV3U3RhdGUpO1xuICAgIH1cbiAgICBvbkV4aXQoKSB7XG4gICAgfVxuICAgIG9uT3BlbigpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdvbk9wZW4gbm90IHN1cHBvcnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgb25FcnJvcigpIHtcbiAgICAgICAgdGhpcy5jaGFubmVsRG93bigpO1xuICAgIH1cbiAgICBvbkNsb3NlKCkge1xuICAgICAgICB0aGlzLmNoYW5uZWxEb3duKCk7XG4gICAgfVxuICAgIGNoYW5uZWxEb3duKCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ2NoYW5uZWxEb3duIG5vdCBzdXBwb3J0ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIG9uUnBjTXNnKHJwY01zZykgey8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdvblJwY01zZyBub3Qgc3VwcG9ydGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBpbnZpdGUoc2RwLCBpY2VDYW5kaWRhdGVzKSB7Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ2ludml0ZSBub3Qgc3VwcG9ydGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBhY2NlcHQoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignYWNjZXB0IG5vdCBzdXBwb3J0ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdoYW5ndXAgbm90IHN1cHBvcnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlNpZ25hbGluZ1N0YXRlXCI7XG4gICAgfVxuICAgIGdldCBsb2dnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduYWxpbmcuX2xvZ2dlcjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRmFpbE9uVGltZW91dFN0YXRlIGV4dGVuZHMgU2lnbmFsaW5nU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgdGltZW91dE1zKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZyk7XG4gICAgICAgIHRoaXMuX3RpbWVvdXRNcyA9IHRpbWVvdXRNcztcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZVRpbWVvdXQodGhpcy5fdGltZW91dE1zKTtcbiAgICB9XG4gICAgb25UaW1lb3V0KCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3NpZ25hbGluZywgbmV3IFRpbWVvdXQoKSkpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiRmFpbE9uVGltZW91dFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFBlbmRpbmdDb25uZWN0U3RhdGUgZXh0ZW5kcyBGYWlsT25UaW1lb3V0U3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgdGltZW91dE1zLCBpbml0aWFsU3RhcnRUaW1lSW4sIHJldHJpZXNJbikge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcsIHRpbWVvdXRNcyk7XG4gICAgICAgIHRoaXMuX2luaXRpYWxTdGFydFRpbWUgPSBpbml0aWFsU3RhcnRUaW1lSW4gfHwgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMuX3JldHJpZXMgPSByZXRyaWVzSW4gfHwgMDtcbiAgICB9XG4gICAgb25PcGVuKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdJbnZpdGVTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgY2hhbm5lbERvd24oKSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgdmFyIHVudGlsVGltZW91dE1zID0gKHRoaXMuX2luaXRpYWxTdGFydFRpbWUgKyB0aGlzLl90aW1lb3V0TXMpIC0gbm93O1xuICAgICAgICBpZiAodW50aWxUaW1lb3V0TXMgPiAwICYmICsrdGhpcy5fcmV0cmllcyA8IENPTk5FQ1RfTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgICAgIHRoaXMuX3NpZ25hbGluZy5fY29ubmVjdCgpO1xuICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBQZW5kaW5nQ29ubmVjdFN0YXRlKHRoaXMuX3NpZ25hbGluZywgdW50aWxUaW1lb3V0TXMsIHRoaXMuX2luaXRpYWxTdGFydFRpbWUsIHRoaXMuX3JldHJpZXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nLCBuZXcgRXJyb3IoJ2NoYW5uZWxEb3duJykpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiUGVuZGluZ0Nvbm5lY3RTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nSW52aXRlU3RhdGUgZXh0ZW5kcyBTaWduYWxpbmdTdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlDb25uZWN0ZWQocmVzb2x2ZSkge1xuICAgICAgICAgICAgc2VsZi5fc2lnbmFsaW5nLl9jb25uZWN0ZWRIYW5kbGVyKCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnZpdGUoc2RwLCBpY2VDYW5kaWRhdGVzKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGludml0ZUlkID0gcmVxSWRTZXErKztcblxuICAgICAgICB2YXIgaW52aXRlUGFyYW1zID0ge1xuICAgICAgICAgICAgc2RwOiBzZHAsXG4gICAgICAgICAgICBjYW5kaWRhdGVzOiBpY2VDYW5kaWRhdGVzXG4gICAgICAgIH07XG4gICAgICAgIHNlbGYubG9nZ2VyLmxvZygnU2VuZGluZyBTRFAnLCBzZHApO1xuICAgICAgICBzZWxmLl9zaWduYWxpbmcuX3dzcy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGpzb25ycGM6ICcyLjAnLFxuICAgICAgICAgICAgbWV0aG9kOiAnaW52aXRlJyxcbiAgICAgICAgICAgIHBhcmFtczogaW52aXRlUGFyYW1zLFxuICAgICAgICAgICAgaWQ6IGludml0ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBQZW5kaW5nQW5zd2VyU3RhdGUoc2VsZi5fc2lnbmFsaW5nLCBpbnZpdGVJZCkpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdJbnZpdGVTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nQW5zd2VyU3RhdGUgZXh0ZW5kcyBGYWlsT25UaW1lb3V0U3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgaW52aXRlSWQpIHtcbiAgICAgICAgc3VwZXIoc2lnbmFsaW5nLCBNQVhfSU5WSVRFX0RFTEFZX01TKTtcbiAgICAgICAgdGhpcy5faW52aXRlSWQgPSBpbnZpdGVJZDtcbiAgICB9XG4gICAgb25ScGNNc2cobXNnKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKG1zZy5pZCA9PT0gdGhpcy5faW52aXRlSWQpIHtcbiAgICAgICAgICAgIGlmIChtc2cuZXJyb3IgfHwgIW1zZy5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3NpZ25hbGluZywgc2VsZi50cmFuc2xhdGVJbnZpdGVFcnJvcihtc2cpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIG5vdGlmeUFuc3dlcmVkKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2dnZXIubG9nKCdSZWNlaXZlZCBTRFAnLCBtc2cucmVzdWx0LnNkcCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5fYW5zd2VyZWRIYW5kbGVyKG1zZy5yZXN1bHQuc2RwLCBtc2cucmVzdWx0LmNhbmRpZGF0ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBQZW5kaW5nQWNjZXB0U3RhdGUodGhpcy5fc2lnbmFsaW5nLCB0aGlzLl9zaWduYWxpbmcuX2F1dG9BbnN3ZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0cmFuc2xhdGVJbnZpdGVFcnJvcihtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5lcnJvciAmJiBtc2cuZXJyb3IuY29kZSA9PSA0ODYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQnVzeUV4Y2VwdGlvbihtc2cuZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLmVycm9yICYmIG1zZy5lcnJvci5jb2RlID09IDQwNCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDYWxsTm90Rm91bmRFeGNlcHRpb24obXNnLmVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBVbmtub3duU2lnbmFsaW5nRXJyb3IoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nQW5zd2VyU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGVuZGluZ0FjY2VwdFN0YXRlIGV4dGVuZHMgU2lnbmFsaW5nU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgYXV0b0Fuc3dlcikge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcpO1xuICAgICAgICB0aGlzLl9hdXRvQW5zd2VyID0gYXV0b0Fuc3dlcjtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9BbnN3ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYWNjZXB0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWNjZXB0KCkge1xuICAgICAgICB2YXIgYWNjZXB0SWQgPSByZXFJZFNlcSsrO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmcuX3dzcy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGpzb25ycGM6ICcyLjAnLFxuICAgICAgICAgICAgbWV0aG9kOiAnYWNjZXB0JyxcbiAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICBpZDogYWNjZXB0SWRcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdBY2NlcHRBY2tTdGF0ZSh0aGlzLl9zaWduYWxpbmcsIGFjY2VwdElkKSk7XG4gICAgfVxuICAgIGNoYW5uZWxEb3duKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3NpZ25hbGluZykpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiUGVuZGluZ0FjY2VwdFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFBlbmRpbmdBY2NlcHRBY2tTdGF0ZSBleHRlbmRzIEZhaWxPblRpbWVvdXRTdGF0ZSB7XG4gICAgY29uc3RydWN0b3Ioc2lnbmFsaW5nLCBhY2NlcHRJZCkge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcsIE1BWF9BQ0NFUFRfQllFX0RFTEFZX01TKTtcbiAgICAgICAgdGhpcy5fYWNjZXB0SWQgPSBhY2NlcHRJZDtcbiAgICB9XG4gICAgb25ScGNNc2cobXNnKSB7XG4gICAgICAgIGlmIChtc2cuaWQgPT09IHRoaXMuX2FjY2VwdElkKSB7XG4gICAgICAgICAgICBpZiAobXNnLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl9jbGllbnRUb2tlbiA9IG1zZy5yZXN1bHQuY2xpZW50VG9rZW47XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBUYWxraW5nU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdBY2NlcHRBY2tTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBUYWxraW5nU3RhdGUgZXh0ZW5kcyBTaWduYWxpbmdTdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlIYW5kc2hha2VkKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5faGFuZHNoYWtlZEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgdmFyIGJ5ZUlkID0gcmVxSWRTZXErKztcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl93c3Muc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBqc29ucnBjOiAnMi4wJyxcbiAgICAgICAgICAgIG1ldGhvZDogJ2J5ZScsXG4gICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgaWQ6IGJ5ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBQZW5kaW5nUmVtb3RlSGFuZ3VwU3RhdGUodGhpcy5fc2lnbmFsaW5nLCBieWVJZCkpO1xuICAgIH1cbiAgICBvblJwY01zZyhtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5tZXRob2QgPT09ICdieWUnKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdMb2NhbEhhbmd1cFN0YXRlKHRoaXMuX3NpZ25hbGluZywgbXNnLmlkKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1ldGhvZCA9PT0gJ3JlbmV3Q2xpZW50VG9rZW4nKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduYWxpbmcuX2NsaWVudFRva2VuID0gbXNnLnBhcmFtcy5jbGllbnRUb2tlbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl9yZWNvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLnRyYW5zaXQobmV3IFBlbmRpbmdSZWNvbm5lY3RTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlRhbGtpbmdTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nUmVjb25uZWN0U3RhdGUgZXh0ZW5kcyBGYWlsT25UaW1lb3V0U3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZykge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcsIERFRkFVTFRfQ09OTkVDVF9USU1FT1VUX01TKTtcbiAgICB9XG4gICAgb25PcGVuKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFRhbGtpbmdTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgY2hhbm5lbERvd24oKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nUmVjb25uZWN0U3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGVuZGluZ1JlbW90ZUhhbmd1cFN0YXRlIGV4dGVuZHMgRmFpbE9uVGltZW91dFN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihzaWduYWxpbmcsIGJ5ZUlkKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZywgTUFYX0FDQ0VQVF9CWUVfREVMQVlfTVMpO1xuICAgICAgICB0aGlzLl9ieWVJZCA9IGJ5ZUlkO1xuICAgIH1cbiAgICBvblJwY01zZyhtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5pZCA9PT0gdGhpcy5fYnllSWQpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgRGlzY29ubmVjdGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdSZW1vdGVIYW5ndXBTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nTG9jYWxIYW5ndXBTdGF0ZSBleHRlbmRzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihzaWduYWxpbmcsIGJ5ZUlkKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZyk7XG4gICAgICAgIHRoaXMuX2J5ZUlkID0gYnllSWQ7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgbmV3IFByb21pc2UoZnVuY3Rpb24gbm90aWZ5UmVtb3RlSHVuZ3VwKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5fcmVtb3RlSHVuZ3VwSGFuZGxlcigpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3NpZ25hbGluZy5fd3NzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAganNvbnJwYzogJzIuMCcsXG4gICAgICAgICAgICByZXN1bHQ6IHt9LFxuICAgICAgICAgICAgaWQ6IHNlbGYuX2J5ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBEaXNjb25uZWN0ZWRTdGF0ZShzZWxmLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgY2hhbm5lbERvd24oKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRGlzY29ubmVjdGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nTG9jYWxIYW5ndXBTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBEaXNjb25uZWN0ZWRTdGF0ZSBleHRlbmRzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIG5vdGlmeURpc2Nvbm5lY3RlZChyZXNvbHZlKSB7XG4gICAgICAgICAgICBzZWxmLl9zaWduYWxpbmcuX2Rpc2Nvbm5lY3RlZEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZy5fd3NzLmNsb3NlKCk7XG4gICAgfVxuICAgIGNoYW5uZWxEb3duKCkge1xuICAgICAgICAvL0RvIG5vdGhpbmdcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkRpc2Nvbm5lY3RlZFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZhaWxlZFN0YXRlIGV4dGVuZHMgU2lnbmFsaW5nU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgZXhjZXB0aW9uKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZyk7XG4gICAgICAgIHRoaXMuX2V4Y2VwdGlvbiA9IGV4Y2VwdGlvbjtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlGYWlsZWQocmVzb2x2ZSkge1xuICAgICAgICAgICAgc2VsZi5fc2lnbmFsaW5nLl9mYWlsZWRIYW5kbGVyKHNlbGYuX2V4Y2VwdGlvbik7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmcuX3dzcy5jbG9zZSgpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgLy9EbyBub3RoaW5nXG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJGYWlsZWRTdGF0ZVwiO1xuICAgIH1cbiAgICBnZXQgZXhjZXB0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhjZXB0aW9uO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW16blJ0Y1NpZ25hbGluZyB7XG4gICAgY29uc3RydWN0b3IoY2FsbElkLCBzaWduYWxpbmdVcmksIGNvbnRhY3RUb2tlbiwgbG9nZ2VyLCBjb25uZWN0VGltZW91dE1zKSB7XG4gICAgICAgIHRoaXMuX2NhbGxJZCA9IGNhbGxJZDtcbiAgICAgICAgdGhpcy5fY29ubmVjdFRpbWVvdXRNcyA9IGNvbm5lY3RUaW1lb3V0TXMgfHwgREVGQVVMVF9DT05ORUNUX1RJTUVPVVRfTVM7XG4gICAgICAgIHRoaXMuX2F1dG9BbnN3ZXIgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdVcmkgPSBzaWduYWxpbmdVcmk7XG4gICAgICAgIHRoaXMuX2NvbnRhY3RUb2tlbiA9IGNvbnRhY3RUb2tlbjtcbiAgICAgICAgdGhpcy5fbG9nZ2VyID0gd3JhcExvZ2dlcihsb2dnZXIsIGNhbGxJZCwgJ1NJR05BTElORycpO1xuXG4gICAgICAgIC8vZW1wdHkgZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkSGFuZGxlciA9XG4gICAgICAgICAgICB0aGlzLl9hbnN3ZXJlZEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5faGFuZHNoYWtlZEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5fcmVjb25uZWN0ZWRIYW5kbGVyID1cbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZUh1bmd1cEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdGVkSGFuZGxlciA9XG4gICAgICAgICAgICB0aGlzLl9mYWlsZWRIYW5kbGVyID0gZnVuY3Rpb24gbm9PcCgpIHtcbiAgICAgICAgICAgIH07XG4gICAgfVxuICAgIGdldCBjYWxsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWxsSWQ7XG4gICAgfVxuICAgIHNldCBvbkNvbm5lY3RlZChjb25uZWN0ZWRIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RlZEhhbmRsZXIgPSBjb25uZWN0ZWRIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25BbnN3ZXJlZChhbnN3ZXJlZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fYW5zd2VyZWRIYW5kbGVyID0gYW5zd2VyZWRIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25IYW5kc2hha2VkKGhhbmRzaGFrZWRIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZWRIYW5kbGVyID0gaGFuZHNoYWtlZEhhbmRsZXI7XG4gICAgfVxuICAgIHNldCBvblJlY29ubmVjdGVkKHJlY29ubmVjdGVkSGFuZGxlcikge1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3RlZEhhbmRsZXIgPSByZWNvbm5lY3RlZEhhbmRsZXI7XG4gICAgfVxuICAgIHNldCBvblJlbW90ZUh1bmd1cChyZW1vdGVIdW5ndXBIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX3JlbW90ZUh1bmd1cEhhbmRsZXIgPSByZW1vdGVIdW5ndXBIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25EaXNjb25uZWN0ZWQoZGlzY29ubmVjdGVkSGFuZGxlcikge1xuICAgICAgICB0aGlzLl9kaXNjb25uZWN0ZWRIYW5kbGVyID0gZGlzY29ubmVjdGVkSGFuZGxlcjtcbiAgICB9XG4gICAgc2V0IG9uRmFpbGVkKGZhaWxlZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fZmFpbGVkSGFuZGxlciA9IGZhaWxlZEhhbmRsZXI7XG4gICAgfVxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICAgIH1cbiAgICBjb25uZWN0KCkge1xuICAgICAgICB0aGlzLl9jb25uZWN0KCk7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgUGVuZGluZ0Nvbm5lY3RTdGF0ZSh0aGlzLCB0aGlzLl9jb25uZWN0VGltZW91dE1zKSk7XG4gICAgfVxuICAgIF9jb25uZWN0KCkge1xuICAgICAgICB0aGlzLl93c3MgPSB0aGlzLl9jb25uZWN0V2ViU29ja2V0KHRoaXMuX2J1aWxkSW52aXRlVXJpKCkpO1xuICAgIH1cbiAgICB0cmFuc2l0KG5leHRTdGF0ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLmluZm8oKHRoaXMuX3N0YXRlID8gdGhpcy5fc3RhdGUubmFtZSA6ICdudWxsJykgKyAnID0+ICcgKyBuZXh0U3RhdGUubmFtZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm9uRXhpdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUub25FeGl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IG5leHRTdGF0ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZS5vbkVudGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUub25FbnRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9jb25uZWN0V2ViU29ja2V0KHVyaSkge1xuICAgICAgICB2YXIgd3NDb25uZWN0aW9uID0gbmV3IFdlYlNvY2tldCh1cmkpO1xuICAgICAgICB3c0Nvbm5lY3Rpb24ub25vcGVuID0gaGl0Y2godGhpcywgdGhpcy5fb25PcGVuKTtcbiAgICAgICAgd3NDb25uZWN0aW9uLm9ubWVzc2FnZSA9IGhpdGNoKHRoaXMsIHRoaXMuX29uTWVzc2FnZSk7XG4gICAgICAgIHdzQ29ubmVjdGlvbi5vbmVycm9yID0gaGl0Y2godGhpcywgdGhpcy5fb25FcnJvcik7XG4gICAgICAgIHdzQ29ubmVjdGlvbi5vbmNsb3NlID0gaGl0Y2godGhpcywgdGhpcy5fb25DbG9zZSk7XG4gICAgICAgIHJldHVybiB3c0Nvbm5lY3Rpb247XG4gICAgfVxuICAgIF9idWlsZEludml0ZVVyaSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRhY3RUb2tlbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkVXJpQmFzZSgpICsgJyZjb250YWN0Q3R4PScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5fY29udGFjdFRva2VuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9idWlsZFVyaUJhc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfYnVpbGRSZWNvbm5lY3RVcmkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9idWlsZFVyaUJhc2UoKSArICcmY2xpZW50VG9rZW49JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLl9jbGllbnRUb2tlbik7XG4gICAgfVxuICAgIF9idWlsZFVyaUJhc2UoKSB7XG4gICAgICAgIHZhciBzZXBhcmF0b3IgPSAnPyc7XG4gICAgICAgIGlmICh0aGlzLl9zaWduYWxpbmdVcmkuaW5kZXhPZihzZXBhcmF0b3IpID4gLTEpIHtcbiAgICAgICAgICAgIHNlcGFyYXRvciA9ICcmJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fc2lnbmFsaW5nVXJpICsgc2VwYXJhdG9yICsgJ2NhbGxJZD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuX2NhbGxJZCk7XG4gICAgfVxuICAgIF9vbk1lc3NhZ2UoZXZ0KSB7XG4gICAgICAgIHRoaXMuc3RhdGUub25ScGNNc2coSlNPTi5wYXJzZShldnQuZGF0YSkpO1xuICAgIH1cbiAgICBfb25PcGVuKGV2dCkge1xuICAgICAgICB0aGlzLnN0YXRlLm9uT3BlbihldnQpO1xuICAgIH1cbiAgICBfb25FcnJvcihldnQpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5vbkVycm9yKGV2dCk7XG4gICAgfVxuICAgIF9vbkNsb3NlKGV2dCkge1xuICAgICAgICB0aGlzLl9sb2dnZXIubG9nKCdXZWJTb2NrZXQgb25jbG9zZSBjb2RlPScgKyBldnQuY29kZSArICcsIHJlYXNvbj0nICsgZXZ0LnJlYXNvbik7XG4gICAgICAgIHRoaXMuc3RhdGUub25DbG9zZShldnQpO1xuICAgIH1cbiAgICBfcmVjb25uZWN0KCkge1xuICAgICAgICB0aGlzLl93c3MgPSB0aGlzLl9jb25uZWN0V2ViU29ja2V0KHRoaXMuX2J1aWxkUmVjb25uZWN0VXJpKCkpO1xuICAgIH1cbiAgICBpbnZpdGUoc2RwLCBpY2VDYW5kaWRhdGVzKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuaW52aXRlKHNkcCwgaWNlQ2FuZGlkYXRlcyk7XG4gICAgfVxuICAgIGFjY2VwdCgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hY2NlcHQoKTtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB0aGlzLnN0YXRlLmhhbmd1cCgpO1xuICAgIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBJbGxlZ2FsUGFyYW1ldGVycyB9IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQgeyBzcGxpdFNlY3Rpb25zLCBzcGxpdExpbmVzLCBwYXJzZVJ0cE1hcCwgZ2V0S2luZCwgcGFyc2VSdHBQYXJhbWV0ZXJzLCB3cml0ZUZtdHAgfSBmcm9tICdzZHAnO1xuXG4vKipcbiAqIEFsbCBsb2dnaW5nIG1ldGhvZHMgdXNlZCBieSBjb25uZWN0LXJ0Yy5cbiAqL1xudmFyIGxvZ01ldGhvZHMgPSBbJ2xvZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXTtcblxuLyoqXG4qIEJpbmRzIHRoZSBnaXZlbiBpbnN0YW5jZSBvYmplY3QgYXMgdGhlIGNvbnRleHQgZm9yXG4qIHRoZSBtZXRob2QgcHJvdmlkZWQuXG4qXG4qIEBwYXJhbSBzY29wZSBUaGUgaW5zdGFuY2Ugb2JqZWN0IHRvIGJlIHNldCBhcyB0aGUgc2NvcGVcbiogICAgb2YgdGhlIGZ1bmN0aW9uLlxuKiBAcGFyYW0gbWV0aG9kIFRoZSBtZXRob2QgdG8gYmUgZW5jYXBzdWxhdGVkLlxuKlxuKiBBbGwgb3RoZXIgYXJndW1lbnRzLCBpZiBhbnksIGFyZSBib3VuZCB0byB0aGUgbWV0aG9kXG4qIGludm9jYXRpb24gaW5zaWRlIHRoZSBjbG9zdXJlLlxuKlxuKiBAcmV0dXJuIEEgY2xvc3VyZSBlbmNhcHN1bGF0aW5nIHRoZSBpbnZvY2F0aW9uIG9mIHRoZVxuKiAgICBtZXRob2QgcHJvdmlkZWQgaW4gY29udGV4dCBvZiB0aGUgZ2l2ZW4gaW5zdGFuY2UuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGhpdGNoKCkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB2YXIgc2NvcGUgPSBhcmdzLnNoaWZ0KCk7XG4gICAgdmFyIG1ldGhvZCA9IGFyZ3Muc2hpZnQoKTtcblxuICAgIGlmICghc2NvcGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxQYXJhbWV0ZXJzKCd1dGlscy5oaXRjaCgpOiBzY29wZSBpcyByZXF1aXJlZCEnKTtcbiAgICB9XG5cbiAgICBpZiAoIW1ldGhvZCkge1xuICAgICAgICB0aHJvdyBuZXcgSWxsZWdhbFBhcmFtZXRlcnMoJ3V0aWxzLmhpdGNoKCk6IG1ldGhvZCBpcyByZXF1aXJlZCEnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1ldGhvZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgSWxsZWdhbFBhcmFtZXRlcnMoJ3V0aWxzLmhpdGNoKCk6IG1ldGhvZCBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gX2hpdGNoZWRGdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNsb3N1cmVBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseShzY29wZSwgYXJncy5jb25jYXQoY2xvc3VyZUFyZ3MpKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcExvZ2dlcihsb2dnZXIsIGNhbGxJZCwgbG9nQ2F0ZWdvcnkpIHtcbiAgICB2YXIgX2xvZ2dlciA9IHt9O1xuICAgIGxvZ01ldGhvZHMuZm9yRWFjaChmdW5jdGlvbiAobG9nTWV0aG9kKSB7XG4gICAgICAgIGlmICghbG9nZ2VyW2xvZ01ldGhvZF0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTG9nZ2luZyBtZXRob2QgJyArIGxvZ01ldGhvZCArICcgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBfbG9nZ2VyW2xvZ01ldGhvZF0gPSBoaXRjaChsb2dnZXIsIGxvZ2dlcltsb2dNZXRob2RdLCBjYWxsSWQsIGxvZ0NhdGVnb3J5KTtcbiAgICB9KTtcbiAgICByZXR1cm4gX2xvZ2dlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlU3RyZWFtKHN0cmVhbSkge1xuICAgIGlmIChzdHJlYW0pIHtcbiAgICAgICAgdmFyIHRyYWNrcyA9IHN0cmVhbS5nZXRUcmFja3MoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdHJhY2suc3RvcCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIGVhdCBleGNlcHRpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIHBhcmFtZXRlciBvZiB0cmFuc2Zvcm1TZHAuXG4gKiBUaGlzIGRlZmluZXMgYWxsIHRoZSBTRFAgb3B0aW9ucyBjb25uZWN0LXJ0Yy1qcyBzdXBwb3J0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNkcE9wdGlvbnMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9mb3JjZUNvZGVjID0ge307XG4gICAgfVxuXG4gICAgZ2V0IGVuYWJsZU9wdXNEdHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbmFibGVPcHVzRHR4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQgdHJhbnNmb3JtU2RwIGRpc2FibGVzIGR0eCBmb3IgT1BVUyBjb2RlYy5cbiAgICAgKiBTZXR0aW5nIHRoaXMgdG8gdHJ1ZSB3b3VsZCBmb3JjZSBpdCB0byB0dXJuIG9uIERUWC5cbiAgICAgKi9cbiAgICBzZXQgZW5hYmxlT3B1c0R0eChmbGFnKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZU9wdXNEdHggPSBmbGFnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgbWFwIGZyb20gbWVkaWEgdHlwZSAoYXVkaW8vdmlkZW8pIHRvIGNvZGVjIChjYXNlIGluc2Vuc2l0aXZlKS5cbiAgICAgKiBBZGQgZW50cnkgZm9yIGZvcmNlIGNvbm5lY3QtcnRjLWpzIHRvIHVzZSBzcGVjaWZpZWQgY29kZWMgZm9yIGNlcnRhaW4gbWVkaWEgdHlwZS5cbiAgICAgKiBGb3IgZXhhbXBsZTogc2RwT3B0aW9ucy5mb3JjZUNvZGVjWydhdWRpbyddID0gJ29wdXMnO1xuICAgICAqL1xuICAgIGdldCBmb3JjZUNvZGVjKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZm9yY2VDb2RlYztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUZXN0IGlmIGdpdmVuIGNvZGVjIHNob3VsZCBiZSByZW1vdmVkIGZyb20gU0RQLlxuICAgICAqIEBwYXJhbSBtZWRpYVR5cGUgYXVkaW98dmlkZW9cbiAgICAgKiBAcGFyYW0gY29kZWNOYW1lIGNhc2UgaW5zZW5zaXRpdmVcbiAgICAgKiBAcmV0dXJuIFRSVUUgLSBzaG91bGQgcmVtb3ZlXG4gICAgICovXG4gICAgX3Nob3VsZERlbGV0ZUNvZGVjKG1lZGlhVHlwZSwgY29kZWNOYW1lKSB7XG4gICAgICAgIHZhciB1cHBlckNhc2VDb2RlY05hbWUgPSBjb2RlY05hbWUudG9VcHBlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZvcmNlQ29kZWNbbWVkaWFUeXBlXSAmJiB1cHBlckNhc2VDb2RlY05hbWUgIT09IHRoaXMuX2ZvcmNlQ29kZWNbbWVkaWFUeXBlXS50b1VwcGVyQ2FzZSgpICYmIHVwcGVyQ2FzZUNvZGVjTmFtZSAhPT0gJ1RFTEVQSE9ORS1FVkVOVCc7XG4gICAgfVxufVxuXG4vKipcbiAqIE1vZGlmaWVzIGlucHV0IFNEUCBhY2NvcmRpbmcgdG8gc2RwT3B0aW9ucy5cbiAqIFNlZSBTZHBPcHRpb25zIGZvciBhdmFpbGFibGUgb3B0aW9ucy5cbiAqIEBwYXJhbSBzZHAgb3JpZ2luYWwgU0RQXG4gKiBAcGFyYW0gc2RwT3B0aW9ucyBkZWZpbmVzIGNoYW5nZXMgdG8gYmUgYXBwbGllZCB0byBTRFBcbiAqIEByZXR1cm5zIGEgbWFwIHdpdGggJ3NkcCcgY29udGFpbmluZyB0aGUgdHJhbnNmb3JtZWQgU0RQIGFuZCAnbUxpbmVzJyBjb250YWluaW5nIHRoZSBudW1iZXIgb2YgbSBsaW5lcyBpbiBTRFBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVNkcChzZHAsIHNkcE9wdGlvbnMpIHtcbiAgICB2YXIgc2VjdGlvbnMgPSBzcGxpdFNlY3Rpb25zKHNkcCk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBzZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbWVkaWFUeXBlID0gZ2V0S2luZChzZWN0aW9uc1tpXSk7XG4gICAgICAgIHZhciBydHBQYXJhbXMgPSBwYXJzZVJ0cFBhcmFtZXRlcnMoc2VjdGlvbnNbaV0pO1xuICAgICAgICAvLyBhIG1hcCBmcm9tIHBheWxvYWQgdHlwZSAoc3RyaW5nKSB0byBjb2RlYyBvYmplY3RcbiAgICAgICAgdmFyIGNvZGVjTWFwID0gcnRwUGFyYW1zLmNvZGVjcy5yZWR1Y2UoKG1hcCwgY29kZWMpID0+IHtcbiAgICAgICAgICAgIG1hcFsnJyArIGNvZGVjLnBheWxvYWRUeXBlXSA9IGNvZGVjO1xuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwge30pO1xuICAgICAgICBzZWN0aW9uc1tpXSA9IHNwbGl0TGluZXMoc2VjdGlvbnNbaV0pLm1hcChsaW5lID0+IHtcbiAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ209JykpIHtcbiAgICAgICAgICAgICAgICAvLyBtb2RpZnkgbT0gbGluZSBpZiBTZHBPcHRpb25zI2ZvcmNlQ29kZWMgc3BlY2lmaWVzIGNvZGVjIGZvciBjdXJyZW50IG1lZGlhIHR5cGVcbiAgICAgICAgICAgICAgICBpZiAoc2RwT3B0aW9ucy5mb3JjZUNvZGVjW21lZGlhVHlwZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldENvZGVjUHRzID0gT2JqZWN0LmtleXMoY29kZWNNYXApLmZpbHRlcihwdCA9PiAhc2RwT3B0aW9ucy5fc2hvdWxkRGVsZXRlQ29kZWMobWVkaWFUeXBlLCBjb2RlY01hcFtwdF0ubmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLy4qUlRQXFwvUz9BVlBGPyAvLmV4ZWMobGluZSkgKyB0YXJnZXRDb2RlY1B0cy5qb2luKCcgJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ2E9cnRwbWFwOicpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ0cE1hcCA9IHBhcnNlUnRwTWFwKGxpbmUpO1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q29kZWMgPSBjb2RlY01hcFtydHBNYXAucGF5bG9hZFR5cGVdO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoaXMgY29kZWMgaWYgU2RwT3B0aW9ucyNmb3JjZUNvZGVjIHNwZWNpZmllcyBhIGRpZmZlcmVudCBjb2RlYyBmb3IgY3VycmVudCBtZWRpYSB0eXBlXG4gICAgICAgICAgICAgICAgaWYgKHNkcE9wdGlvbnMuX3Nob3VsZERlbGV0ZUNvZGVjKG1lZGlhVHlwZSwgY3VycmVudENvZGVjLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBhcHBlbmQgYT1mbXRwIGxpbmUgaW1tZWRpYXRlbHkgaWYgY3VycmVudCBjb2RlYyBpcyBPUFVTICh0byBleHBsaWNpdGx5IHNwZWNpZnkgT1BVUyBwYXJhbWV0ZXJzKVxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnT1BVUycpIHsgXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2RlYy5wYXJhbWV0ZXJzLnVzZWR0eCA9IHNkcE9wdGlvbnMuZW5hYmxlT3B1c0R0eCA/IDEgOiAwO1xuICAgICAgICAgICAgICAgICAgICAvLyBnZW5lcmF0ZSBmbXRwIGxpbmUgaW1tZWRpYXRlbHkgYWZ0ZXIgcnRwbWFwIGxpbmUsIGFuZCByZW1vdmUgb3JpZ2luYWwgZm10cCBsaW5lIG9uY2Ugd2Ugc2VlIGl0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAobGluZSArIFwiXFxyXFxuXCIgKyB3cml0ZUZtdHAoY3VycmVudENvZGVjKSkudHJpbSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdhPWZtdHA6JykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHQgPSBsaW5lLnN1YnN0cmluZygnYT1mbXRwOicubGVuZ3RoLCBsaW5lLmluZGV4T2YoJyAnKSk7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2RlYyA9IGNvZGVjTWFwW3B0XTsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJlZGVjbGFyZVxuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoaXMgY29kZWMgaWYgU2RwT3B0aW9ucyNmb3JjZUNvZGVjIHNwZWNpZmllcyBhIGRpZmZlcmVudCBjb2RlYyBmb3IgY3VycmVudCBtZWRpYSB0eXBlXG4gICAgICAgICAgICAgICAgaWYgKHNkcE9wdGlvbnMuX3Nob3VsZERlbGV0ZUNvZGVjKG1lZGlhVHlwZSwgY3VycmVudENvZGVjLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnT1BVUycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhIGxpbmUgZm9yIE9QVVMsIHJlbW92ZSBpdCBiZWNhdXNlIEZNVFAgbGluZSBpcyBhbHJlYWR5IGdlbmVyYXRlZCB3aGVuIHJ0cG1hcCBsaW5lIGlzIHByb2Nlc3NlZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnYT1ydGNwLWZiOicpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHB0ID0gbGluZS5zdWJzdHJpbmcobGluZS5pbmRleE9mKCc6JykgKyAxLCBsaW5lLmluZGV4T2YoJyAnKSk7Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby1yZWRlY2xhcmVcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudENvZGVjID0gY29kZWNNYXBbcHRdOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcmVkZWNsYXJlXG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhpcyBjb2RlYyBpZiBTZHBPcHRpb25zI2ZvcmNlQ29kZWMgc3BlY2lmaWVzIGEgZGlmZmVyZW50IGNvZGVjIGZvciBjdXJyZW50IG1lZGlhIHR5cGVcbiAgICAgICAgICAgICAgICBpZiAoc2RwT3B0aW9ucy5fc2hvdWxkRGVsZXRlQ29kZWMobWVkaWFUeXBlLCBjdXJyZW50Q29kZWMubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuZmlsdGVyKGxpbmUgPT4gbGluZSAhPT0gbnVsbCkuam9pbignXFxyXFxuJyk7XG5cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2RwOiBzZWN0aW9ucy5tYXAoc2VjdGlvbiA9PiBzZWN0aW9uLnRyaW0oKSkuam9pbignXFxyXFxuJykgKyAnXFxyXFxuJyxcbiAgICAgICAgbUxpbmVzOiBzZWN0aW9ucy5sZW5ndGggLSAxIC8vIGZpcnN0IHNlY3Rpb24gaXMgc2Vzc2lvbiBkZXNjcmlwdGlvbiwgdGhlIHJlc3QgYXJlIG1lZGlhIGRlc2NyaXB0aW9uc1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc19kZWZpbmVkKHYpIHtcbiAgICByZXR1cm4gdHlwZW9mIHYgIT09ICd1bmRlZmluZWQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2hlbl9kZWZpbmVkKHYsIGFsdGVybmF0aXZlSW4pIHtcbiAgICB2YXIgYWx0ZXJuYXRpdmUgPSBpc19kZWZpbmVkKGFsdGVybmF0aXZlSW4pID8gYWx0ZXJuYXRpdmVJbiA6IG51bGw7XG4gICAgcmV0dXJuIGlzX2RlZmluZWQodikgPyB2IDogYWx0ZXJuYXRpdmU7XG59XG5cbiJdfQ==
