import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Play, Pause, SkipForward, SkipBack, X, Loader2, Quote, User, ArrowRight, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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

  // Interleave photos and messages
  const slides = [];
  const maxLen = Math.max(photos.length, messages.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < photos.length) slides.push({ type: "photo", data: photos[i] });
    if (i < messages.length) slides.push({ type: "message", data: messages[i] });
  }

  const goNext = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, goNext, slides.length]);

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
  const currentSlide = slides[currentIndex];

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
            {currentIndex + 1} / {slides.length}
          </span>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link to="/gallery"><X className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center px-20 py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-5xl"
          >
            {currentSlide.type === "photo" ? (
              <PhotoSlide photo={currentSlide.data} />
            ) : (
              <MessageSlide message={currentSlide.data} />
            )}
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
          animate={{ width: isPlaying ? "100%" : `${((currentIndex) / slides.length) * 100}%` }}
          transition={isPlaying ? { duration: 6, ease: "linear" } : { duration: 0.3 }}
          key={isPlaying ? currentIndex : "paused"}
        />
      </div>
    </FullscreenCanvas>
  );
}

function FullscreenCanvas({ children, isFullscreen }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const TARGET_W = 1080;
  const TARGET_H = 1920;

  useEffect(() => {
    const compute = () => {
      const sw = window.innerWidth / TARGET_W;
      const sh = window.innerHeight / TARGET_H;
      setScale(Math.min(sw, sh));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        style={{
          width: TARGET_W,
          height: TARGET_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="relative bg-background flex flex-col overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}

function PhotoSlide({ photo }) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30" style={{ maxHeight: 700 }}>
        <img src={photo.image_url} alt="" className="w-full h-full object-contain bg-card" style={{ maxHeight: 700 }} />
      </div>
      <div className="text-center space-y-3">
        {photo.caption && (
          <p className="font-serif text-2xl text-foreground italic">"{photo.caption}"</p>
        )}
        <div className="flex items-center justify-center gap-3 text-lg font-sans text-muted-foreground">
          <User className="w-5 h-5" />
          <span>{photo.uploader_name}</span>
          <ArrowRight className="w-5 h-5" />
          <span className="text-primary font-medium">{photo.recipient}</span>
        </div>
      </div>
    </div>
  );
}

function MessageSlide({ message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10 px-8">
      <Quote className="w-16 h-16 text-primary/30" />
      <p className="font-serif text-5xl text-foreground leading-relaxed max-w-4xl">
        {message.content}
      </p>
      <div className="flex items-center gap-3 text-xl font-sans text-muted-foreground">
        <User className="w-5 h-5" />
        <span>{message.uploader_name}</span>
        <ArrowRight className="w-5 h-5" />
        <span className="text-primary font-medium">{message.recipient}</span>
      </div>
    </div>
  );
}