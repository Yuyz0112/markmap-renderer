import { useState, useRef, useEffect } from "react";
import LZString from "lz-string";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { Toolbar } from "markmap-toolbar";
import "markmap-toolbar/dist/style.css";
import "./App.css";

const transformer = new Transformer();

let initValue = `# markmap

- beautiful
- useful
`;

const search = new URLSearchParams(window.location.search);
const compressedContent = search.get("content");
if (compressedContent) {
  initValue = LZString.decompressFromEncodedURIComponent(compressedContent);
}

function renderToolbar(mm: Markmap, wrapper: HTMLElement) {
  while (wrapper?.firstChild) wrapper.firstChild.remove();
  if (mm && wrapper) {
    const toolbar = new Toolbar();
    toolbar.attach(mm);
    // Register custom buttons
    toolbar.register({
      id: "alert",
      title: "Click to show an alert",
      content: "Alert",
      onClick: () => alert("You made it!"),
    });
    toolbar.setItems([
      ...Toolbar.defaultItems.filter((item) => {
        if (item === "recurse") {
          return false;
        }
        return true;
      }),
    ]);
    toolbar.setBrand(false);
    wrapper.append(toolbar.render());
  }
}

export default function MarkmapHooks() {
  const [value] = useState(initValue);
  // Ref for SVG element
  const refSvg = useRef<SVGSVGElement>(null);
  // Ref for markmap object
  const refMm = useRef<Markmap>();
  // Ref for toolbar wrapper
  const refToolbar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!refSvg.current || !refToolbar.current) {
      return;
    }
    if (refMm.current) {
      return;
    }
    // Create markmap and save to refMm
    const mm = Markmap.create(refSvg.current);
    refMm.current = mm;
    renderToolbar(refMm.current, refToolbar.current);
  }, []);

  useEffect(() => {
    // Update data for markmap once value is changed
    const mm = refMm.current;
    if (!mm) return;
    const { root } = transformer.transform(value);
    mm.setData(root);
    mm.fit();
  }, [value]);

  return (
    <main>
      <svg
        className="flex-1"
        ref={refSvg}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      <div className="toolbar" ref={refToolbar}></div>
    </main>
  );
}
