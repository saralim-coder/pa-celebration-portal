import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Play, Pause, SkipForward, SkipBack, X, Loader2, Quote, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ["photos"],
    queryFn: () => base44.entities.Photo.list("-created_date"),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages"],
    queryFn: () => base44.entities.Message.list("-created_date"),
  });

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
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-background/80 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-primary font-serif text-lg">✦</span>
          <h1 className="font-serif text-lg md:text-xl font-semibold text-foreground">
            Promotion Ceremony
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-muted-foreground hidden md:block">
            {currentIndex + 1} / {slides.length}
          </span>
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link to="/gallery"><X className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-4xl"
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
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-3 p-4 md:p-6 bg-gradient-to-t from-background/80 to-transparent">
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goPrev}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-primary/30"
          onClick={() => setIsPlaying((p) => !p)}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goNext}>
          <SkipForward className="w-4 h-4" />
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
    </div>
  );
}

function PhotoSlide({ photo }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-h-[60vh] rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30">
        <img src={photo.image_url} alt="" className="w-full h-full object-contain bg-card" />
      </div>
      <div className="text-center space-y-2">
        {photo.caption && (
          <p className="font-serif text-lg md:text-xl text-foreground italic">"{photo.caption}"</p>
        )}
        <div className="flex items-center justify-center gap-2 text-sm font-sans text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span>{photo.uploader_name}</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span className="text-primary font-medium">{photo.recipient}</span>
        </div>
      </div>
    </div>
  );
}

function MessageSlide({ message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 px-4">
      <Quote className="w-10 h-10 text-primary/30" />
      <p className="font-serif text-2xl md:text-4xl lg:text-5xl text-foreground leading-relaxed max-w-3xl">
        {message.content}
      </p>
      <div className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
        <User className="w-3.5 h-3.5" />
        <span>{message.uploader_name}</span>
        <ArrowRight className="w-3.5 h-3.5" />
        <span className="text-primary font-medium">{message.recipient}</span>
      </div>
    </div>
  );
}