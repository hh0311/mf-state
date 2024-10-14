import { PayloadAction, Reducer } from "@reduxjs/toolkit";
import * as remoteStores from "@remote-stores";
import { Selector } from "react-redux";
export type RemoteType = {
    name: string;
    reducer: Reducer;
    dispatchers: PayloadAction<unknown>;
    selectors: Selector<unknown, unknown>;
};
export type ExposeStoreType = {
    [key: string]: RemoteType;
};
export type ModuleName = keyof typeof remoteStores;
export type ImportModuleType = typeof import("@remote-stores");
export type SliceName<M extends ModuleName> = keyof ImportModuleType[M]["default"];
export type Selectors<M extends ModuleName, S extends SliceName<M> = SliceName<M>> = ImportModuleType[M]["default"][S] extends {
    selectors: infer T;
} ? T : never;
export type Dispatchers<M extends ModuleName, S extends SliceName<M> = SliceName<M>> = ImportModuleType[M]["default"][S] extends {
    dispatchers: infer T;
} ? T : never;
export type Action = {
    [key in ModuleName]: {
        [slice in SliceName<key>]: Dispatchers<key, slice>;
    };
};
export type Select = {
    [key in ModuleName]: {
        [slice in SliceName<key>]: Selectors<key, slice>;
    };
};
