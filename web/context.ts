import { createContext, type RefObject } from "react";

export type RefData = {
  urlMasks: Map<string, HTMLElement | null>;
  skipScroll: boolean;
  hash: {
    value: string | undefined;
    lineStart: number | undefined;
    lineEnd: number | undefined;
  };
};

export type AppContext = {
  currentPath: string | null;
  setCurrentPath: (path: string) => void;
  repoName: string | null;
  entries: Record<string, string[]>; // dir path -> children paths
  refObject: RefObject<RefData>;
};

export const appContext = createContext<AppContext>({
  currentPath: null,
  setCurrentPath: () => null,
  repoName: null,
  entries: {},
  refObject: { current: {} as RefData },
});
