import { useLayoutEffect, useRef, useEffect, useState } from "react";

// Shrinks the font until the text fits inside its parent element's height.
// The parent must have a concrete height (e.g. flex-1 min-h-0).
export default function FitText({ text, minFontPx = 14, maxFontVh = 6, className = "" }) {
  const ref = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const available = parent.clientHeight;
    if (available === 0) return;
    let size = Math.max(minFontPx, Math.min(available, (maxFontVh * window.innerHeight) / 100));
    el.style.fontSize = `${size}px`;
    let guard = 0;
    while (el.scrollHeight > available && size > minFontPx && guard < 300) {
      size -= 1;
      el.style.fontSize = `${size}px`;
      guard++;
    }
  }, [text, minFontPx, maxFontVh, tick]);

  return <p ref={ref} className={className} style={{ overflow: "hidden", margin: 0 }}>{text}</p>;
}