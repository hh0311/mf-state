import * as remoteStores from '@remote-stores';
import { CombinedSliceReducer } from '@reduxjs/toolkit';

type ModuleName = keyof typeof remoteStores;
type ImportModuleType = typeof remoteStores;
type SliceName<M extends ModuleName> = keyof ImportModuleType[M]["default"];
type Selectors<M extends ModuleName, S extends SliceName<M> = SliceName<M>> = ImportModuleType[M]["default"][S] extends {
    selectors: infer T;
} ? T : never;
type Dispatchers<M extends ModuleName, S extends SliceName<M> = SliceName<M>> = ImportModuleType[M]["default"][S] extends {
    dispatchers: infer T;
} ? T : never;
declare const safeSelect: <M extends ModuleName, S extends { [K in SliceName<M>]: Selectors<M, K>; }>(selector: S, defaultValue?: unknown) => S;
declare const MFState: (_rootReducer?: CombinedSliceReducer<any>) => {
    injectReducers: () => Promise<void>;
    dispatchers: <M extends ModuleName, S extends { [K in SliceName<M>]: Dispatchers<M, K>; }>(moduleName: M) => S;
    selectors: <M extends ModuleName, S extends { [K in SliceName<M>]: Selectors<M, K>; }>(moduleName: M, callback?: (selectors: S) => void) => S;
};

export { MFState, safeSelect };
