import * as remoteStores from '@remote-stores';
import { Reducer, PayloadAction } from '@reduxjs/toolkit';
import { Selector } from 'react-redux';

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
type ImportModuleType = typeof remoteStores;
type SliceName<M extends ModuleName> = keyof ImportModuleType[M]["default"];
type Selectors<M extends ModuleName, S extends SliceName<M> = SliceName<M>> = ImportModuleType[M]["default"][S] extends {
    selectors: infer T;
} ? T : never;
type Dispatchers<M extends ModuleName, S extends SliceName<M> = SliceName<M>> = ImportModuleType[M]["default"][S] extends {
    dispatchers: infer T;
} ? T : never;
type Action = {
    [key in ModuleName]: {
        [slice in SliceName<key>]: Dispatchers<key, slice>;
    };
};
type Select = {
    [key in ModuleName]: {
        [slice in SliceName<key>]: Selectors<key, slice>;
    };
};

export type { Action, Dispatchers, ExposeStoreType, ImportModuleType, ModuleName, RemoteType, Select, Selectors, SliceName };
