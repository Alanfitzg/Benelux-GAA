"use client";

import { useEffect, useState } from "react";

const CUSTOM_DOMAIN = "beneluxgaa.eu";
const BASE_PATH = "/demo/benelux-gaa";

export function useBasePath() {
  const [basePath, setBasePath] = useState(BASE_PATH);

  useEffect(() => {
    const host = window.location.host;
    if (host.includes(CUSTOM_DOMAIN)) {
      setBasePath("");
    }
  }, []);

  const getPath = (path: string) => {
    if (basePath === "") {
      return path.replace(BASE_PATH, "") || "/";
    }
    return path;
  };

  return { basePath, getPath };
}
