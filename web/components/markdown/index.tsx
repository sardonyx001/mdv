import { Pantsdown } from "../../../pantsdown/src/index.ts";
import { useContext, useEffect, useRef } from "react";
import { appContext } from "../../context.ts";
import { getFileExt } from "../../utils.ts";
import { myMermaid } from "./mermaid.ts";
import { postProcessHrefs } from "./post-process.ts";

const pantsdown = new Pantsdown({ renderer: { detailsTagDefaultOpen: true } });

export const Markdown = () => {
  const { currentPath, setCurrentPath, refObject } = useContext(appContext);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentPath || currentPath.endsWith("/")) return;

    fetch("/render?path=" + encodeURIComponent(currentPath))
      .then((r) => r.json())
      .then(({ lines }: { lines: string[] }) => {
        const el = elRef.current;
        if (!el) return;

        const fileExt = getFileExt(currentPath);
        const text = lines.join("\n");
        const markdown = fileExt === "md" ? text : "```" + (fileExt ?? "") + `\n${text}`;

        const { html, javascript } = pantsdown.parse(markdown);

        const temp = document.createElement("div");
        temp.innerHTML = html;

        postProcessHrefs({
          wsRequest: ({ path }: { path: string }) => setCurrentPath(path),
          tempElement: temp,
          refObject,
          single_file: false,
        });

        myMermaid.renderMemoized(temp);
        el.replaceChildren(...temp.children);

        if (fileExt === "md") {
          el.style.padding = "44px";
          el.style.maxWidth = "1012px";
        } else {
          el.style.padding = "20px 0 0 60px";
          el.style.removeProperty("max-width");
        }

        const script = document.createElement("script");
        script.text = javascript;
        el.appendChild(script);

        void myMermaid.renderAsync();
      });
  }, [currentPath]);

  return (
    <div
      ref={elRef}
      className="relative mx-auto mb-96"
      style={{ padding: "44px", maxWidth: "1012px" }}
    />
  );
};
