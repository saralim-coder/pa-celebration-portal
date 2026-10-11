import { useLayoutEffect, useRef, useEffect, useState } from "react";

// Shrinks font size until the text fits inside maxHeight (vh units).
export default function FitText({ text, maxVh, maxFontVh, minFontPx = 14, className = "" }) {
  const ref = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vh = window.innerHeight / 100;
    const limit = maxVh * vh;
    let size = Math.max(minFontPx, maxFontVh * vh);
    el.style.fontSize = `${size}px`;
    while (el.scrollHeight > limit && size > minFontPx) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
  }, [text, maxVh, maxFontVh, minFontPx, tick]);

  return (
    <p ref={ref} className={className} style={{ maxHeight: `${maxVh}vh`, overflow: "hidden" }}>
      {text}
    </p>
  );
}