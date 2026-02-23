"use client";

export function useBasePath() {
  return {
    basePath: "",
    getPath: (path: string) => path,
  };
}
