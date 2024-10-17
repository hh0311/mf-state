import { Reducer } from "@reduxjs/toolkit";
import * as remoteStores from "@remote-stores";

export type ModuleType = typeof remoteStores;
export type ModuleName = keyof typeof remoteStores;

export type SliceName<M extends ModuleName> = keyof ModuleType[M]["default"];
export type Slices = Record<
  SliceName<ModuleName>,
  ExposeStoreStructure<ModuleName, SliceName<ModuleName>>
>;

export type Selectors<
  M extends ModuleName,
  S extends SliceName<M> = SliceName<M>
> = ModuleType[M]["default"][S] extends { selectors: infer T } ? T : never;

export type Dispatchers<
  M extends ModuleName,
  S extends SliceName<M> = SliceName<M>
> = ModuleType[M]["default"][S] extends { dispatchers: infer T } ? T : never;

export type StoreContext = {
  [M in ModuleName]: {
    [S in SliceName<M>]: ExposeStoreStructure<M, S>;
  };
};

export type Action = {
  [M in ModuleName]: {
    [S in SliceName<M>]: Dispatchers<M, S>;
  };
};

export type Select = {
  [M in ModuleName]: {
    [S in SliceName<M>]: Selectors<M, S>;
  };
};

export type ExposeStoreStructure<
  M extends ModuleName,
  S extends SliceName<M>
> = {
  name: string;
  reducer: Reducer;
  dispatchers: Dispatchers<M, S>;
  selectors: Selectors<M, S>;
};
