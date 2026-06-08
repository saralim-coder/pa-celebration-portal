import { useMemo } from "react";
import { Clock, Monitor } from "lucide-react";

// Slideshow rotates every 8 seconds, 2 slides per page
const SECONDS_PER_PAGE = 8;

export default function SlideshowQueue({ photos, messages }) {
  const queueInfo = useMemo(() => {
    // Interleave photos and messages just like the slideshow does
    const slides = [];
    const maxLen = Math.max(photos.length, messages.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < photos.length) slides.push({ type: "photo", id: photos[i].id, uploader_name: photos[i].uploader_name, recipient: photos[i].recipient });
      if (i < messages.length) slides.push({ type: "message", id: messages[i].id, uploader_name: messages[i].uploader_name, recipient: messages[i].recipient });
    }
    // Each page shows 2 slides
    return slides.map((slide, idx) => {
      const pageIndex = Math.floor(idx / 2);
      const secondsUntil = pageIndex * SECONDS_PER_PAGE;
      return { ...slide, position: idx + 1, pageIndex, secondsUntil };
    });
  }, [photos, messages]);

  if (queueInfo.length === 0) return null;

  const totalPages = Math.ceil(queueInfo.length / 2);
  const totalDurationSec = totalPages * SECONDS_PER_PAGE;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Monitor className="w-4 h-4 text-primary" />
        <h3 className="font-sans text-sm font-semibold text-foreground">Slideshow Queue</h3>
        <span className="font-sans text-xs text-muted-foreground ml-auto">
          {queueInfo.length} item{queueInfo.length !== 1 ? "s" : ""} · full cycle every {formatTime(totalDurationSec)}
        </span>
      </div>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {queueInfo.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center gap-3 bg-background rounded-lg px-3 py-2 border border-border/40"
          >
            <span className="font-sans text-xs font-bold text-primary w-5 text-center">
              #{item.position}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium shrink-0 ${item.type === "photo" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
              {item.type === "photo" ? "📷 Photo" : "💬 Message"}
            </span>
            <span className="font-sans text-xs text-foreground truncate">
              {item.uploader_name} <span className="text-muted-foreground">→</span> <span className="text-primary font-medium">{item.recipient}</span>
            </span>
            <div className="flex items-center gap-1 ml-auto shrink-0 text-xs text-muted-foreground font-sans">
              <Clock className="w-3 h-3" />
              <span>~{formatTime(item.secondsUntil)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}