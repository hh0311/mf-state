// src/index.ts
import * as remoteStores from "@remote-stores";
import { useDispatch, useSelector } from "react-redux";
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
        actions[moduleName][sliceName] = {
          ...actions[moduleName][sliceName] || {},
          ...dispatchers
        };
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
      return useSelector(stateSelector);
    } catch (error) {
      return defaultValue;
    }
  };
  const handleDispatchError = (error, callback) => {
    const undefinedErr = "Cannot read properties of undefined";
    const match = error.message.match(/reading '(.+?)'/);
    if (match && error.message.startsWith(undefinedErr)) {
      console.error(
        `The (${match[1]}) method does not exist in the Remote Module. Please check: ${callback}`
      );
    }
  };
  const useRemoteDispatch = () => {
    const dispatch = useDispatch();
    return (callback) => {
      if (isObjectEmpty(actions)) {
        console.log("The remote-store.ts is empty, does not have any actions");
        return;
      }
      try {
        dispatch(callback(actions));
      } catch (error) {
        handleDispatchError(error, callback);
      }
    };
  };
  const useRemoteOnline = () => {
    const isModuleOnline = (moduleName) => {
      return typeof exposeStores[moduleName]?.default === "object";
    };
    const isValidDispatch = (moduleName, sliceName, dispatch) => {
      if (!isModuleOnline || !sliceName || !dispatch) return false;
      return !!exposeStores[moduleName]["default"]?.[sliceName]?.dispatchers?.[dispatch];
    };
    const isValidSelector = (moduleName, sliceName, selector) => {
      if (!isModuleOnline || !sliceName || !selector) return false;
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
import { useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
var withComponentAvailable = (WrappedComponent) => {
  return (props) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
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
    if (hideIfUnavailable) {
      if (!isOnline || dispatchName && !isDispatch || selectorName && !isSelector) {
        return fallback;
      }
    }
    return /* @__PURE__ */ jsx(WrappedComponent, { ...props });
  };
};
export {
  withComponentAvailable
};
//# sourceMappingURL=withComponentAvailable.mjs.map