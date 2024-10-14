import { ModuleName, SliceName, Dispatchers, Selectors } from './type.js';
import React from 'react';
import '@remote-stores';
import '@reduxjs/toolkit';
import 'react-redux';

interface WithComponentAvailable<M extends ModuleName, S extends SliceName<M>> {
    remoteConfig?: {
        hideIfUnavailable?: boolean;
        fallback?: React.ReactNode;
        moduleName?: M;
        sliceName?: S;
    } & ({
        dispatchName?: keyof Dispatchers<M, S>;
        selectorName?: undefined;
    } | {
        dispatchName?: undefined;
        selectorName?: keyof Selectors<M, S>;
    });
}
declare const withComponentAvailable: <P extends object, M extends ModuleName, S extends SliceName<M>>(WrappedComponent: React.ComponentType<P & WithComponentAvailable<M, S>>) => (props: P & WithComponentAvailable<M, S>) => any;

export { withComponentAvailable };
