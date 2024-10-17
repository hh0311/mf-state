import * as remoteStores from "@remote-stores";
import {
  CombinedSliceReducer,
  Selector as ReduxSelector,
} from "@reduxjs/toolkit";
import {
  Action,
  Dispatchers,
  ExposeStoreStructure,
  ModuleName,
  Select,
  Selectors,
  SliceName,
  Slices,
  StoreContext,
} from "./type";
import { useDispatch, useSelector } from "react-redux";

const exposeStores = remoteStores;
let rootReducer: CombinedSliceReducer<any>;

const isRemoteModule = (key: ModuleName) => {
  return typeof exposeStores[key].default === "object";
};

const isObjectEmpty = (object: object = {}) => {
  return Object.keys(object).length === 0;
};

const context: Partial<StoreContext> = {};

export const MFState = (_rootReducer?: CombinedSliceReducer<any>) => {
  if (_rootReducer) rootReducer = _rootReducer;

  const getRemoteSlices = (moduleName: ModuleName): Slices => {
    const slice = exposeStores[moduleName]?.default;
    return slice;
  };

  const getRemoteSingleSlice = <SS extends keyof Slices, S extends Slices>(
    sliceKey: SS,
    slices: S
  ): ExposeStoreStructure<any, SS> => {
    return slices[sliceKey];
  };

  (function init() {
    if (!exposeStores) return;

    const initSlices = (moduleName: ModuleName) => {
      const remoteSlices = getRemoteSlices(moduleName);
      if (!isRemoteModule(moduleName) || !remoteSlices) return;

      Object.keys(remoteSlices).forEach((key: SliceName<ModuleName>) => {
        const value = remoteSlices[key];

        context[moduleName] = {
          ...context[moduleName],
          [key]: value,
        } as any;
      });
    };

    for (const moduleName in exposeStores) {
      if (Object.prototype.hasOwnProperty.call(exposeStores, moduleName)) {
        initSlices(moduleName as ModuleName);
      }
    }
  })();

  const injectReducers = async () => {
    for (const mod in context) {
      const _mod = mod as ModuleName;
      if (Object.prototype.hasOwnProperty.call(context, _mod)) {
        const store = context[mod as ModuleName];
        for (const sliceKey in store) {
          if (Object.prototype.hasOwnProperty.call(store, sliceKey)) {
            const slice = getRemoteSingleSlice(sliceKey, store);
            rootReducer.inject({
              reducerPath: slice.name,
              reducer: slice.reducer,
            });
          }
        }
      }
    }
  };

  const useRemoteSelector = (
    callback: (select: Select) => ReduxSelector,
    defaultValue?: unknown
  ) => {
    const parseCallback = (callback: (selectEvent: Select) => any) => {
      const [, moduleName, sliceName, selector] = callback
        .toString()
        .split(".");
      return { moduleName, sliceName, selector };
    };

    const getSelectors = (
      moduleName: ModuleName,
      sliceName: SliceName<ModuleName>
    ) => {
      const selectors =
        getRemoteSlices(moduleName)?.[sliceName]?.["selectors"] || {};
      if (isObjectEmpty(selectors)) {
        console.log(
          "The remote-store.ts is empty, does not have any selectors"
        );
        return null;
      }
      return selectors;
    };

    const { moduleName, sliceName, selector } = parseCallback(callback);
    const selectors = getSelectors(moduleName as ModuleName, sliceName);

    const stateSelector = selectors[selector];
    try {
      if (!stateSelector) {
        console.error(
          `[useRemoteSelector] ${selector} Selector does not exist`,
          callback
        );
        return defaultValue;
      }

      // eslint-disable-next-line
      return useSelector(stateSelector);
    } catch (error: any) {
      console.error(`[useRemoteSelector] Error Selector`, error.message);
      return defaultValue;
    }
  };

  const useRemoteDispatch = () => {
    const dispatch = useDispatch();
    const parseCallback = (callback: (actionEvents: Action) => any) => {
      const [, moduleName, sliceName, action] = callback.toString().split(".");
      return { moduleName, sliceName, action };
    };

    const getDispatcher = (
      moduleName: ModuleName,
      sliceName: SliceName<ModuleName>
    ) => {
      const dispatchers =
        getRemoteSlices(moduleName)?.[sliceName]?.["dispatchers"] || {};
      if (isObjectEmpty(dispatchers)) {
        console.log("The remote-store.ts is empty, does not have any actions");
        return null;
      }
      return dispatchers;
    };

    const parseAction = (action: string) => {
      const functionCallRegex = /^(\w+)\s*\(([^)]*)\)\s*$/;
      const match = functionCallRegex.exec(action);

      if (match) {
        const fnName = match[1];
        const params = match[2]?.trim();

        return { fnName, params };
      }

      return { fnName: action, params: null };
    };

    const dispatchAction = (
      dispatchers: Dispatchers<ModuleName, SliceName<ModuleName>>,
      action: string
    ) => {
      try {
        const { fnName, params } = parseAction(action);

        if (!params) {
          dispatch(dispatchers[fnName]());
        } else {
          dispatch(dispatchers[fnName](eval("(" + params + ")")));
        }
      } catch (error: any) {
        console.error(
          `[useRemoteDispatch] Error dispatching action: ${action}`,
          error.message
        );
      }
    };

    return (callback: <A extends Action>(actionEvents: A) => void) => {
      const { moduleName, sliceName, action } = parseCallback(callback);
      const dispatchers = getDispatcher(moduleName as ModuleName, sliceName);

      if (dispatchers) {
        return dispatchAction(dispatchers, action);
      }
    };
  };

  //
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
      if (!isModuleOnline(moduleName) || !sliceName || !dispatch) return false;

      return !!exposeStores[moduleName]["default"]?.[sliceName]?.dispatchers?.[
        dispatch
      ];
    };

    const isValidSelector = <M extends ModuleName, S extends SliceName<M>>(
      moduleName: M,
      sliceName: S,
      selector: keyof Selectors<M, S>
    ) => {
      if (!isModuleOnline(moduleName) || !sliceName || !selector) return false;

      return !!exposeStores[moduleName]["default"]?.[sliceName]?.selectors[
        selector
      ];
    };

    return {
      isModuleOnline,
      isValidDispatch,
      isValidSelector,
      useRemoteOnline,
    };
  };

  return {
    injectReducers,
    useRemoteDispatch,
    useRemoteSelector,
    useRemoteOnline,
  };
};
