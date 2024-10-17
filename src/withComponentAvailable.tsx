import { MFState } from "@/index";
import { Dispatchers, ModuleName, Selectors, SliceName } from "@/type";
import React, { useEffect, useState } from "react";

interface WithComponentAvailable<M extends ModuleName, S extends SliceName<M>> {
  remoteConfig?: {
    hideIfUnavailable?: boolean;
    fallback?: React.ReactNode;
    moduleName?: M;
    sliceName?: S;
  } & (
    | { dispatchName?: keyof Dispatchers<M, S>; selectorName?: undefined }
    | { dispatchName?: undefined; selectorName?: keyof Selectors<M, S> }
  );
}
export const withComponentAvailable = <
  P extends object,
  M extends ModuleName,
  S extends SliceName<M>
>(
  WrappedComponent: React.ComponentType<P & WithComponentAvailable<M, S>>
) => {
  return (props: P & WithComponentAvailable<M, S>) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return null;
    }

    const { remoteConfig } = props;
    const {
      hideIfUnavailable = true,
      fallback = null,
      moduleName = "",
      sliceName = "",
      dispatchName = "",
      selectorName = "",
    } = remoteConfig || {};

    const { isModuleOnline, isValidDispatch, isValidSelector } =
      MFState().useRemoteOnline();

    const isOnline = isModuleOnline(moduleName);
    const isDispatch = isValidDispatch(
      moduleName,
      sliceName,
      dispatchName as never
    );
    const isSelector = isValidSelector(
      moduleName,
      sliceName,
      selectorName as never
    );

    if (
      !isOnline ||
      (dispatchName && !isDispatch) ||
      (selectorName && !isSelector)
    ) {
      if (hideIfUnavailable) return fallback;
    }

    return <WrappedComponent {...props} />;
  };
};
