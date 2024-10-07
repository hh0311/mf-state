"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.MFState = exports.safeSelect = void 0;
var remoteStores = require("@/remote-stores.mf"); // FIX
var exposeStores = remoteStores;
var rootReducer;
var safeSelect = function (selector, defaultValue) {
  if (defaultValue === void 0) {
    defaultValue = null;
  }
  try {
    if (!selector)
      return function () {
        return defaultValue;
      };
    return selector;
  } catch (_a) {
    return function () {
      return defaultValue;
    };
  }
};
exports.safeSelect = safeSelect;
var MFState = function (_rootReducer) {
  if (_rootReducer) rootReducer = _rootReducer;
  var slices = {};
  var isRemoteModule = function (key) {
    return typeof exposeStores[key].default === "object";
  };
  (function init() {
    if (!exposeStores) return;
    for (var key in exposeStores) {
      if (Object.prototype.hasOwnProperty.call(exposeStores, key)) {
        var _key = key;
        if (isRemoteModule(_key)) {
          var store = exposeStores[_key].default;
          for (var storeKey in store) {
            slices[store[storeKey].name] = store[storeKey];
          }
        }
      }
    }
  })();
  var injectReducers = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var remoteSliceKey, slice;
      return __generator(this, function (_a) {
        if (!rootReducer) return [2 /*return*/];
        for (remoteSliceKey in slices) {
          slice = slices[remoteSliceKey];
          rootReducer.inject({
            reducerPath: slice.name,
            reducer: slice.reducer,
          });
        }
        return [2 /*return*/];
      });
    });
  };
  var dispatchers = function (moduleName) {
    if (
      !moduleName ||
      !(remoteStores === null || remoteStores === void 0
        ? void 0
        : remoteStores[moduleName])
    )
      return {};
    var mod = remoteStores[moduleName]["default"];
    var dispatchers = Object.keys(mod).reduce(function (acc, sliceName) {
      acc[sliceName] = mod[sliceName].dispatchers;
      return acc;
    }, {});
    return dispatchers;
  };
  var selectors = function (moduleName, callback) {
    if (
      !moduleName ||
      !(remoteStores === null || remoteStores === void 0
        ? void 0
        : remoteStores[moduleName])
    )
      return {};
    var mod = remoteStores[moduleName]["default"];
    var selectors = Object.keys(mod).reduce(function (acc, sliceName) {
      acc[sliceName] = mod[sliceName].selectors;
      return acc;
    }, {});
    callback === null || callback === void 0 ? void 0 : callback(selectors);
    return selectors;
  };
  return {
    injectReducers: injectReducers,
    dispatchers: dispatchers,
    selectors: selectors,
  };
};
exports.MFState = MFState;
