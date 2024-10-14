import {
  Action,
  Dispatchers,
  ExposeStoreType,
  ModuleName,
  Select,
  Selectors,
  SliceName,
} from "@/type";
import {
  CombinedSliceReducer,
  Selector as ReduxSelector,
} from "@reduxjs/toolkit";
import * as remoteStores from "@remote-stores";

import { useDispatch, useSelector } from "react-redux";
export * from "@/withComponentAvailable";

const isObjectEmpty = (object: Record<string, any> = {}) => {
  return Object.keys(object).length === 0;
};

const exposeStores = remoteStores;
let rootReducer: CombinedSliceReducer<any>;

const isRemoteModule = (key: ModuleName) => {
  return typeof exposeStores[key].default === "object";
};

export const MFState = (_rootReducer?: CombinedSliceReducer<any>) => {
  if (_rootReducer) rootReducer = _rootReducer;

  const slices: ExposeStoreType = {};
  const actions: Action = {};
  const selectors: Select = {};
  (function init() {
    if (!exposeStores) return;

    const initSlices = (moduleName: string) => {
      const store = exposeStores[moduleName as ModuleName]?.default;
      if (!isRemoteModule(moduleName) || !store) return;

      Object.values(store).forEach((slice: any) => {
        slices[slice.name] = slice;
      });
    };

    const initActions = (moduleName: string) => {
      const mod = exposeStores[moduleName as ModuleName]?.default || {};

      Object.keys(mod).forEach((sliceName) => {
        const dispatchers =
          mod[sliceName as SliceName<ModuleName>]?.dispatchers || {};
        actions[moduleName] = actions[moduleName] || {};

        actions[moduleName][sliceName] = {
          ...(actions[moduleName][sliceName] || {}),
          ...dispatchers,
        };
      });
    };

    const initSelectors = (moduleName: string) => {
      const mod = exposeStores[moduleName as ModuleName]?.default || {};

      Object.keys(mod).forEach((sliceName) => {
        const selectorsMap =
          mod[sliceName as SliceName<ModuleName>]?.selectors || {};
        selectors[moduleName] = selectors[moduleName] || {};

        selectors[moduleName][sliceName] = {
          ...(selectors[moduleName][sliceName] || {}),
          ...selectorsMap,
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
        reducer: slice.reducer,
      });
    }
  };

  const useRemoteSelector = <T>(
    callback: (selector: Select) => ReduxSelector<any, T> | undefined,
    defaultValue: T | null = null
  ): T | null => {
    try {
      const stateSelector = callback?.(selectors);
      if (!stateSelector) {
        console.warn("Selector does not exist");
        return defaultValue;
      }

      return useSelector(stateSelector);
    } catch (error: any) {
      // console.error(error.message);
      return defaultValue;
    }
  };
  const handleDispatchError = (
    error: any,
    callback: (action: Action) => Action
  ) => {
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

    return (callback: (action: Action) => Action) => {
      if (isObjectEmpty(actions)) {
        console.log("The remote-store.ts is empty, does not have any actions");
        return;
      }

      try {
        dispatch(callback(actions) as any);
      } catch (error: any) {
        handleDispatchError(error, callback);
      }
    };
  };

  const useRemoteOnline = () => {
    const isModuleOnline = (moduleName: ModuleName) => {
      return (
        typeof exposeStores[moduleName as ModuleName]?.default === "object"
      );
    };

    const isValidDispatch = <M extends ModuleName, S extends SliceName<M>>(
      moduleName: M,
      sliceName: S,
      dispatch: keyof Dispatchers<M, S>
    ) => {
      if (!isModuleOnline || !sliceName || !dispatch) return false;

      return !!exposeStores[moduleName]["default"]?.[sliceName]?.dispatchers?.[
        dispatch
      ];
    };

    const isValidSelector = <M extends ModuleName, S extends SliceName<M>>(
      moduleName: M,
      sliceName: S,
      selector: keyof Selectors<M, S>
    ) => {
      if (!isModuleOnline || !sliceName || !selector) return false;

      return !!exposeStores[moduleName]["default"]?.[sliceName]?.selectors[
        selector
      ];
    };

    return {
      isModuleOnline,
      isValidDispatch,
      isValidSelector,
    };
  };

  return {
    injectReducers,
    useRemoteDispatch,
    useRemoteSelector,
    useRemoteOnline,
  };
};
