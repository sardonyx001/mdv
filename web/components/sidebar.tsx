import { useContext, useState } from "react";
import { appContext } from "../context.ts";
import { cn } from "../utils.ts";
import { PanelCloseIcon } from "./icons/panel-close.tsx";
import { PanelOpenIcon } from "./icons/panel-open.tsx";
import { IconButton } from "./icon-button.tsx";
import { EntryComponent } from "./explorer/entry.tsx";

export const Sidebar = () => {
  const { repoName } = useContext(appContext);
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-github-border-default bg-github-canvas-default",
        "transition-[width] duration-200",
        expanded ? "w-80" : "w-12",
      )}
      style={{ height: "100vh", flexShrink: 0 }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-b border-github-border-default",
          expanded ? "h-14 justify-between px-4" : "flex-col-reverse justify-center py-2",
        )}
      >
        {expanded && <h4 className="!my-0 mr-auto">Files</h4>}
        <IconButton
          className={cn(expanded ? "ml-4" : "my-2")}
          noBorder={!expanded}
          Icon={expanded ? PanelOpenIcon : PanelCloseIcon}
          onClick={() => setExpanded(!expanded)}
        />
      </div>

      {/* Tree */}
      {expanded && (
        <div className="flex-1 overflow-y-auto py-2">
          {repoName && (
            <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-widest text-github-fg-muted">
              {repoName}
            </p>
          )}
          <EntryComponent path="" depth={-1} />
        </div>
      )}
    </div>
  );
};
