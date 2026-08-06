import { useEffect, useRef, useState } from "react";
import { appContext, type RefData } from "./context.ts";
import { Sidebar } from "./components/sidebar.tsx";
import { Markdown } from "./components/markdown/index.tsx";

export const App = () => {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [entries, setEntries] = useState<Record<string, string[]>>({});
  const [repoName, setRepoName] = useState<string | null>(null);

  const refObject = useRef<RefData>({
    urlMasks: new Map(),
    skipScroll: false,
    hash: { value: undefined, lineStart: undefined, lineEnd: undefined },
  });

  useEffect(() => {
    fetch("/init")
      .then((r) => r.json())
      .then(({ currentPath, repoName, entries }: { currentPath: string; repoName: string; entries: Record<string, string[]> }) => {
        setCurrentPath(currentPath);
        setRepoName(repoName);
        setEntries(entries);
      });
  }, []);

  return (
    <appContext.Provider value={{ currentPath, setCurrentPath, repoName, entries, refObject }}>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, height: "100vh", overflowY: "auto" }}>
          <Markdown />
        </div>
      </div>
    </appContext.Provider>
  );
};
