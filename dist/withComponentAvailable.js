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

// src/withComponentAvailable.tsx
var withComponentAvailable_exports = {};
__export(withComponentAvailable_exports, {
  withComponentAvailable: () => withComponentAvailable
});
module.exports = __toCommonJS(withComponentAvailable_exports);

// src/index.ts
var remoteStores = __toESM(require("@remote-stores"));
var import_react_redux = require("react-redux");
var isObjectEmpty = (object = {}) => {
  return Object.keys(object).length === 0;
};
var exposeStores = remoteStores;
var rootReducer;
var isRemoteModule = (key) => {
  return typeof exposeStores[key].default === "object";
};
var MFState = (_rootReducer) => {
  if (_rootReducer) rootReducer = _rootReducer;
  const slices = {};
  const actions = {};
  const selectors = {};
  (function init() {
    if (!exposeStores) return;
    const initSlices = (moduleName) => {
      const store = exposeStores[moduleName]?.default;
      if (!isRemoteModule(moduleName) || !store) return;
      Object.values(store).forEach((slice) => {
        slices[slice.name] = slice;
      });
    };
    const initActions = (moduleName) => {
      const mod = exposeStores[moduleName]?.default || {};
      Object.keys(mod).forEach((sliceName) => {
        const dispatchers = mod[sliceName]?.dispatchers || {};
        actions[moduleName] = actions[moduleName] || {};
      });
    };
    const initSelectors = (moduleName) => {
      const mod = exposeStores[moduleName]?.default || {};
      Object.keys(mod).forEach((sliceName) => {
        const selectorsMap = mod[sliceName]?.selectors || {};
        selectors[moduleName] = selectors[moduleName] || {};
        selectors[moduleName][sliceName] = {
          ...selectors[moduleName][sliceName] || {},
          ...selectorsMap
        };
      });
    };
    for (const moduleName in exposeStores) {
      if (Object.prototype.hasOwnProperty.call(exposeStores, moduleName)) {
        initSlices(moduleName);
        initActions(moduleName);
        initSelectors(moduleName);
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
  const useRemoteSelector = (callback, defaultValue = null) => {
    try {
      const stateSelector = callback?.(selectors);
      if (!stateSelector) {
        console.warn("Selector does not exist");
        return defaultValue;
      }
      return (0, import_react_redux.useSelector)(stateSelector);
    } catch (error) {
      return defaultValue;
    }
  };
  const useRemoteDispatch = () => {
    const dispatch = (0, import_react_redux.useDispatch)();
    return (callback) => {
      if (isObjectEmpty(actions)) {
        console.log("The remote-store.ts is empty, does not have any actions");
        return;
      }
      try {
        dispatch(callback(actions));
      } catch (error) {
        console.error(
          `[useRemoteDispatch::dispatch] Something went wrong. Check the function: ${callback}]`,
          error.message
        );
      }
    };
  };
  const useRemoteOnline = () => {
    const isModuleOnline = (moduleName) => {
      return typeof exposeStores[moduleName]?.default === "object";
    };
    const isValidDispatch = (moduleName, sliceName, dispatch) => {
      if (!isModuleOnline(moduleName) || !sliceName || !dispatch) return false;
      return !!exposeStores[moduleName]["default"]?.[sliceName]?.dispatchers?.[dispatch];
    };
    const isValidSelector = (moduleName, sliceName, selector) => {
      if (!isModuleOnline(moduleName) || !sliceName || !selector) return false;
      return !!exposeStores[moduleName]["default"]?.[sliceName]?.selectors[selector];
    };
    return {
      isModuleOnline,
      isValidDispatch,
      isValidSelector
    };
  };
  return {
    injectReducers,
    useRemoteDispatch,
    useRemoteSelector,
    useRemoteOnline
  };
};

// src/withComponentAvailable.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var withComponentAvailable = (WrappedComponent) => {
  return (props) => {
    const [isMounted, setIsMounted] = (0, import_react.useState)(false);
    (0, import_react.useEffect)(() => {
      setIsMounted(true);
    }, []);
    if (!isMounted) {
      return null;
    }
    const { remoteConfig } = props;
    const {
      hideIfUnavailable = true,
      fallback = null,
      moduleName = "",
      sliceName = "",
      dispatchName = "",
      selectorName = ""
    } = remoteConfig || {};
    const { isModuleOnline, isValidDispatch, isValidSelector } = MFState().useRemoteOnline();
    const isOnline = isModuleOnline(moduleName);
    const isDispatch = isValidDispatch(
      moduleName,
      sliceName,
      dispatchName
    );
    const isSelector = isValidSelector(
      moduleName,
      sliceName,
      selectorName
    );
    if (!isOnline || dispatchName && !isDispatch || selectorName && !isSelector) {
      if (hideIfUnavailable) return fallback;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WrappedComponent, { ...props });
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  withComponentAvailable
});
//# sourceMappingURL=withComponentAvailable.js.map