"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  MFState: () => MFState,
  safeSelect: () => safeSelect
});
module.exports = __toCommonJS(src_exports);
var remoteStores = __toESM(require("@remote-stores"));
var exposeStores = remoteStores;
var rootReducer;
var safeSelect = (selector, defaultValue = null) => {
  try {
    if (!selector) return () => defaultValue;
    return selector;
  } catch {
    return () => defaultValue;
  }
};
var MFState = (_rootReducer) => {
  if (_rootReducer) rootReducer = _rootReducer;
  const slices = {};
  const isRemoteModule = (key) => {
    return typeof exposeStores[key].default === "object";
  };
  (function init() {
    if (!exposeStores) return;
    for (const key in exposeStores) {
      if (Object.prototype.hasOwnProperty.call(exposeStores, key)) {
        const _key = key;
        if (isRemoteModule(_key)) {
          const store = exposeStores[_key].default;
          for (const storeKey in store) {
            slices[store[storeKey].name] = store[storeKey];
          }
        }
      }
    }
  })();
  const injectReducers = async () => {
    if (!rootReducer) return;
    for (const remoteSliceKey in slices) {
      const slice = slices[remoteSliceKey];
      rootReducer.inject({
        reducerPath: slice.name,
        reducer: slice.reducer
      });
    }
  };
  const dispatchers = (moduleName) => {
    if (!moduleName || !(remoteStores == null ? void 0 : remoteStores[moduleName])) return {};
    const mod = remoteStores[moduleName]["default"];
    const dispatchers2 = Object.keys(mod).reduce((acc, sliceName) => {
      acc[sliceName] = mod[sliceName].dispatchers;
      return acc;
    }, {});
    return dispatchers2;
  };
  const selectors = (moduleName, callback) => {
    if (!moduleName || !(remoteStores == null ? void 0 : remoteStores[moduleName])) return {};
    const mod = remoteStores[moduleName]["default"];
    const selectors2 = Object.keys(mod).reduce((acc, sliceName) => {
      acc[sliceName] = mod[sliceName].selectors;
      return acc;
    }, {});
    callback == null ? void 0 : callback(selectors2);
    return selectors2;
  };
  return {
    injectReducers,
    dispatchers,
    selectors
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MFState,
  safeSelect
});
//# sourceMappingURL=index.js.map