import * as remoteStores from "@remote-stores"; // FIX
import { CombinedSliceReducer, PayloadAction, Reducer } from "@reduxjs/toolkit";
import { Selector } from "react-redux";

type RemoteType = {
  name: string;
  reducer: Reducer;
  dispatchers: PayloadAction<unknown>;
  selectors: Selector<unknown, unknown>;
};

type ExposeStoreType = {
  [key: string]: RemoteType;
};

type ModuleName = keyof typeof remoteStores;
type ImportModuleType = typeof import("@remote-stores");
type SliceName<M extends ModuleName> = keyof ImportModuleType[M]["default"];

type Selectors<
  M extends ModuleName,
  S extends SliceName<M> = SliceName<M>
> = ImportModuleType[M]["default"][S] extends { selectors: infer T }
  ? T
  : never;

type Dispatchers<
  M extends ModuleName,
  S extends SliceName<M> = SliceName<M>
> = ImportModuleType[M]["default"][S] extends { dispatchers: infer T }
  ? T
  : never;

const exposeStores = remoteStores;
let rootReducer: CombinedSliceReducer<any>;

export const safeSelect = <
  M extends ModuleName,
  S extends { [K in SliceName<M>]: Selectors<M, K> }
>(
  selector: S,
  defaultValue: unknown = null
): S => {
  try {
    if (!selector) return (() => defaultValue) as any;
    return selector;
  } catch {
    return (() => defaultValue) as any;
  }
};

export const MFState = (_rootReducer?: CombinedSliceReducer<any>) => {
  if (_rootReducer) rootReducer = _rootReducer;

  const slices: ExposeStoreType = {};
  const isRemoteModule = (key: ModuleName) => {
    return typeof exposeStores[key].default === "object";
  };

  (function init() {
    if (!exposeStores) return;
    for (const key in exposeStores) {
      if (Object.prototype.hasOwnProperty.call(exposeStores, key)) {
        const _key = key as ModuleName;
        if (isRemoteModule(_key)) {
          const store = exposeStores[_key].default as any;
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
        reducer: slice.reducer,
      });
    }
  };

  const dispatchers = <
    M extends ModuleName,
    S extends { [K in SliceName<M>]: Dispatchers<M, K> }
  >(
    moduleName: M
  ): S => {
    if (!moduleName || !remoteStores?.[moduleName]) return {} as S;
    const mod = (remoteStores[moduleName] as any)["default"];
    const dispatchers = Object.keys(mod).reduce((acc: any, sliceName: any) => {
      acc[sliceName] = mod[sliceName].dispatchers;
      return acc;
    }, {});
    return dispatchers;
  };

  const selectors = <
    M extends ModuleName,
    S extends { [K in SliceName<M>]: Selectors<M, K> }
  >(
    moduleName: M,
    callback?: (selectors: S) => void
  ): S => {
    if (!moduleName || !remoteStores?.[moduleName]) return {} as S;
    const mod = (remoteStores[moduleName] as any)["default"];
    const selectors = Object.keys(mod).reduce((acc: any, sliceName: any) => {
      acc[sliceName] = mod[sliceName].selectors;
      return acc;
    }, {} as S);
    callback?.(selectors);
    return selectors;
  };

  return {
    injectReducers,
    dispatchers,
    selectors,
  };
};
