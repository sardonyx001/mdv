import { useContext, useEffect, useState } from "react";
import { appContext } from "../../context.ts";
import { cn, getEntryName, getSegments } from "../../utils.ts";
import { ChevronRightIcon } from "../icons/chevron-right.tsx";
import { DirIcon } from "../icons/dir.tsx";
import { FileIcon } from "../icons/file.tsx";
import { OpenDirIcon } from "../icons/open-dir.tsx";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
  dir: <DirIcon className={iconClassName} />,
  openDir: <OpenDirIcon className={iconClassName} />,
  file: <FileIcon className={iconClassName} />,
};

type Props = {
  path: string;
  depth: number;
};

export const EntryComponent = ({ path, depth }: Props) => {
  const { currentPath, setCurrentPath, entries } = useContext(appContext);
  const [isSelected, setIsSelected] = useState(false);
  const [expanded, setExpanded] = useState(path === "");

  const isDir = path === "" || path.endsWith("/");
  const entryName = getEntryName(path);
  const children = entries[path] ?? [];

  useEffect(() => {
    const segments = getSegments(currentPath);
    let entrySlice = segments.slice(0, depth + 1).join("/");
    if (isDir) {
      entrySlice += "/";
      if (entrySlice === path) setExpanded(true);
    }
    setIsSelected(currentPath === path);
  }, [currentPath, depth, path, isDir]);

  return (
    <div>
      {entryName && (
        <div
          onClick={() => {
            if (isDir) {
              setExpanded(!expanded);
            } else {
              setCurrentPath(path);
            }
          }}
          style={{ paddingLeft: depth * 11 + (isDir ? 0 : 20) }}
          className={cn(
            "group relative mx-3 flex h-[34px] cursor-pointer items-center rounded-md",
            "hover:bg-github-canvas-subtle",
            isSelected && "bg-github-canvas-subtle",
          )}
        >
          {isSelected && (
            <div className="absolute -left-2 h-6 w-1.5 rounded-sm bg-github-accent-fg" />
          )}
          {isDir && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="mr-1 flex h-full items-center hover:bg-github-border-default"
            >
              <ChevronRightIcon className={cn(expanded && "rotate-90")} />
            </div>
          )}
          {IconMap[isDir ? (expanded ? "openDir" : "dir") : "file"]}
          <span className="text-sm group-hover:text-github-accent-fg group-hover:underline">
            {entryName}
          </span>
        </div>
      )}
      {expanded &&
        children.map((childPath) => (
          <EntryComponent key={childPath} path={childPath} depth={depth + 1} />
        ))}
    </div>
  );
};
