import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Play, Pause, SkipForward, SkipBack, X, Loader2, Quote, User, ArrowRight, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    base44.entities.Photo.list("-created_date").then((data) => {
      setPhotos(data);
      setLoadingPhotos(false);
    });
    base44.entities.Message.list("-created_date").then((data) => {
      setMessages(data);
      setLoadingMessages(false);
    });

    const unsubPhoto = base44.entities.Photo.subscribe((event) => {
      if (event.type === "create") setPhotos((prev) => [event.data, ...prev]);
      else if (event.type === "update") setPhotos((prev) => prev.map((p) => p.id === event.id ? event.data : p));
      else if (event.type === "delete") setPhotos((prev) => prev.filter((p) => p.id !== event.id));
    });

    const unsubMsg = base44.entities.Message.subscribe((event) => {
      if (event.type === "create") setMessages((prev) => [event.data, ...prev]);
      else if (event.type === "update") setMessages((prev) => prev.map((m) => m.id === event.id ? event.data : m));
      else if (event.type === "delete") setMessages((prev) => prev.filter((m) => m.id !== event.id));
    });

    return () => { unsubPhoto(); unsubMsg(); };
  }, []);

  // Interleave photos and messages into a flat list
  const slides = [];
  const maxLen = Math.max(photos.length, messages.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < photos.length) slides.push({ type: "photo", data: photos[i] });
    if (i < messages.length) slides.push({ type: "message", data: messages[i] });
  }

  // We show 2 items per "page"
  const totalPages = Math.ceil(slides.length / 2);

  const goNext = useCallback(() => {
    if (totalPages === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    if (totalPages === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  useEffect(() => {
    if (!isPlaying || totalPages === 0) return;
    const interval = setInterval(goNext, 8000);
    return () => clearInterval(interval);
  }, [isPlaying, goNext, totalPages]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") { e.preventDefault(); setIsPlaying((p) => !p); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const isLoading = loadingPhotos || loadingMessages;
  const leftSlide = slides[currentIndex * 2];
  const rightSlide = slides[currentIndex * 2 + 1];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-xl text-muted-foreground">No content to display yet</p>
        <Button asChild variant="outline" className="font-sans text-sm">
          <Link to="/upload">Upload Content</Link>
        </Button>
      </div>
    );
  }

  return (
    <FullscreenCanvas isFullscreen={isFullscreen}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-6 bg-gradient-to-b from-background/80 to-transparent">
        <div className="flex items-center gap-3">
          <img src="https://media.base44.com/images/public/69dc9e0e6de364fb1172a03d/56ca5eb8c_generated_image.png" alt="Logo" className="w-10 h-10 object-contain" />
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            People's Association — Promotion Ceremony
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-sm text-muted-foreground">
            {currentIndex + 1} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link to="/gallery"><X className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Slide Content — 2 items + QR divider */}
      <div className="flex-1 flex items-stretch px-10 py-20 gap-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex w-full items-center gap-0"
          >
            {/* Left panel */}
            <div className="flex-1 flex items-center justify-center px-6">
              {leftSlide && (
                leftSlide.type === "photo"
                  ? <PhotoSlide photo={leftSlide.data} />
                  : <MessageSlide message={leftSlide.data} />
              )}
            </div>

            {/* Center QR divider */}
            <div className="flex flex-col items-center justify-center gap-4 px-6 shrink-0">
              <div className="w-px h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-lg">
                <QRCodeSVG
                  value={window.location.origin + "/upload"}
                  size={140}
                  bgColor="transparent"
                  fgColor="hsl(var(--primary))"
                  level="M"
                />
              </div>
              <p className="font-sans text-xs text-muted-foreground text-center max-w-[120px] leading-tight">
                Scan to share your tribute
              </p>
              <div className="w-px h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center px-6">
              {rightSlide ? (
                rightSlide.type === "photo"
                  ? <PhotoSlide photo={rightSlide.data} />
                  : <MessageSlide message={rightSlide.data} />
              ) : (
                <div className="flex flex-col items-center justify-center opacity-30 gap-4">
                  <Quote className="w-12 h-12 text-primary/30" />
                  <p className="font-serif text-xl text-muted-foreground">More coming soon…</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-4 bg-gradient-to-t from-background/80 to-transparent pb-4">
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goPrev}>
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-primary/30"
          onClick={() => setIsPlaying((p) => !p)}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goNext}>
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30 z-30">
        <motion.div
          className="h-full bg-primary/50"
          initial={{ width: "0%" }}
          animate={{ width: isPlaying ? "100%" : `${((currentIndex) / totalPages) * 100}%` }}
          transition={isPlaying ? { duration: 8, ease: "linear" } : { duration: 0.3 }}
          key={isPlaying ? currentIndex : "paused"}
        />
      </div>
    </FullscreenCanvas>
  );
}

function FullscreenCanvas({ children }) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {children}
    </div>
  );
}

function PhotoSlide({ photo }) {
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="w-full rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30" style={{ maxHeight: 380 }}>
        <img src={photo.image_url} alt="" className="w-full h-full object-contain bg-card" style={{ maxHeight: 380 }} />
      </div>
      <div className="text-center space-y-2">
        {photo.caption && (
          <p className="font-serif text-xl text-foreground italic">"{photo.caption}"</p>
        )}
        <div className="flex items-center justify-center gap-2 text-base font-sans text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{photo.uploader_name}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-primary font-medium">{photo.recipient}</span>
        </div>
      </div>
    </div>
  );
}

function MessageSlide({ message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 px-4">
      <Quote className="w-10 h-10 text-primary/30" />
      <p className="font-serif text-3xl text-foreground leading-relaxed">
        {message.content}
      </p>
      <div className="flex items-center gap-2 text-base font-sans text-muted-foreground">
        <User className="w-4 h-4" />
        <span>{message.uploader_name}</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-primary font-medium">{message.recipient}</span>
      </div>
    </div>
  );
}