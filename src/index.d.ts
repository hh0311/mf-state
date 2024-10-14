import { Action, Dispatchers, ModuleName, Select, Selectors, SliceName } from "@/type";
import { CombinedSliceReducer, Selector as ReduxSelector } from "@reduxjs/toolkit";
export * from "@/withComponentAvailable";
export declare const MFState: (_rootReducer?: CombinedSliceReducer<any>) => {
    injectReducers: () => Promise<void>;
    useRemoteDispatch: () => (callback: (action: Action) => Action) => void;
    useRemoteSelector: <T>(callback: (selector: Select) => ReduxSelector<any, T> | undefined, defaultValue?: T | null) => T | null;
    useRemoteOnline: () => {
        isModuleOnline: (moduleName: ModuleName) => boolean;
        isValidDispatch: <M extends ModuleName, S extends SliceName<M>>(moduleName: M, sliceName: S, dispatch: keyof Dispatchers<M, S>) => boolean;
        isValidSelector: <M extends ModuleName, S extends SliceName<M>>(moduleName: M, sliceName: S, selector: keyof Selectors<M, S>) => boolean;
    };
};
