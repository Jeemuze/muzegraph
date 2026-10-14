"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

type RouteAlternateContextType = {
  alternatePaths?: Record<string, string>;
  setAlternatePaths: (
    paths?: Record<string, string>
  ) => void;
};

const RouteAlternateContext =
  createContext<RouteAlternateContextType>({
    alternatePaths: undefined,
    setAlternatePaths: () => {},
  });

export function RouteAlternateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [alternatePaths, setAlternatePaths] =
    useState<Record<string, string>>();

  return (
    <RouteAlternateContext.Provider
      value={{
        alternatePaths,
        setAlternatePaths,
      }}
    >
      {children}
    </RouteAlternateContext.Provider>
  );
}

export function useRouteAlternate() {
  return useContext(RouteAlternateContext);
}
