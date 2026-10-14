"use client";

import { useEffect } from "react";
import { useRouteAlternate } from "@/components/providers/route-alternate-provider";

export default function SetRouteAlternate({
  alternatePaths,
}: {
  alternatePaths?: Record<string, string>;
}) {
  const { setAlternatePaths } = useRouteAlternate();

  useEffect(() => {
    setAlternatePaths(alternatePaths);

    return () => {
      setAlternatePaths(undefined);
    };
  }, [alternatePaths, setAlternatePaths]);

  return null;
}
