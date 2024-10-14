import { Action, Select, ModuleName, SliceName, Dispatchers, Selectors } from './type.js';
import { CombinedSliceReducer, Selector } from '@reduxjs/toolkit';
export { withComponentAvailable } from './withComponentAvailable.js';
import '@remote-stores';
import 'react-redux';
import 'react';

declare const MFState: (_rootReducer?: CombinedSliceReducer<any>) => {
    injectReducers: () => Promise<void>;
    useRemoteDispatch: () => (callback: (action: Action) => Action) => void;
    useRemoteSelector: <T>(callback: (selector: Select) => Selector<any, T> | undefined, defaultValue?: T | null) => T | null;
    useRemoteOnline: () => {
        isModuleOnline: (moduleName: ModuleName) => boolean;
        isValidDispatch: <M extends ModuleName, S extends SliceName<M>>(moduleName: M, sliceName: S, dispatch: keyof Dispatchers<M, S>) => boolean;
        isValidSelector: <M extends ModuleName, S extends SliceName<M>>(moduleName: M, sliceName: S, selector: keyof Selectors<M, S>) => boolean;
    };
};

export { MFState };
