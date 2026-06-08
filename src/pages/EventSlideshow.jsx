import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Play, Pause, SkipForward, SkipBack, X, Loader2, Quote, User, ArrowRight, Maximize, Minimize, Lock, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

const SCREEN_SIZES = [
  { id: "16:9", label: "16:9 Widescreen", description: "Standard HD / projector", width: 1920, height: 1080 },
  { id: "4:3", label: "4:3 Standard", description: "Older projectors / screens", width: 1024, height: 768 },
  { id: "21:9", label: "21:9 Ultrawide", description: "Ultrawide display", width: 2560, height: 1080 },
  { id: "fullscreen", label: "Full Screen", description: "Fill whatever screen you have", width: null, height: null },
];

export default function EventSlideshow() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [stage, setStage] = useState("password"); // "password" | "size" | "slideshow"
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [selectedSize, setSelectedSize] = useState(SCREEN_SIZES[0]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    base44.entities.Event.get(eventId).then((e) => { setEvent(e); setLoadingEvent(false); });
    base44.entities.Photo.filter({ event_id: eventId }, "-created_date").then((data) => { setPhotos(data); setLoadingPhotos(false); });
    base44.entities.Message.filter({ event_id: eventId }, "-created_date").then((data) => { setMessages(data); setLoadingMessages(false); });

    const unsubPhoto = base44.entities.Photo.subscribe((ev) => {
      if (ev.data?.event_id !== eventId) return;
      if (ev.type === "create") setPhotos((prev) => [ev.data, ...prev]);
      else if (ev.type === "update") setPhotos((prev) => prev.map((p) => p.id === ev.id ? ev.data : p));
      else if (ev.type === "delete") setPhotos((prev) => prev.filter((p) => p.id !== ev.id));
    });
    const unsubMsg = base44.entities.Message.subscribe((ev) => {
      if (ev.data?.event_id !== eventId) return;
      if (ev.type === "create") setMessages((prev) => [ev.data, ...prev]);
      else if (ev.type === "update") setMessages((prev) => prev.map((m) => m.id === ev.id ? ev.data : m));
      else if (ev.type === "delete") setMessages((prev) => prev.filter((m) => m.id !== ev.id));
    });

    const reloadInterval = setInterval(() => {
      base44.entities.Photo.filter({ event_id: eventId }, "-created_date").then(setPhotos);
      base44.entities.Message.filter({ event_id: eventId }, "-created_date").then(setMessages);
    }, 60000);

    return () => { unsubPhoto(); unsubMsg(); clearInterval(reloadInterval); };
  }, [eventId]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!event) return;
    const pw = event.slideshow_password;
    if (!pw || passwordInput === pw) {
      setStage("size");
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  const handleLaunchSlideshow = () => {
    setStage("slideshow");
    if (selectedSize.id === "fullscreen") {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Slides
  const slides = [];
  const maxLen = Math.max(photos.length, messages.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < photos.length) slides.push({ type: "photo", data: photos[i] });
    if (i < messages.length) slides.push({ type: "message", data: messages[i] });
  }
  const totalPages = Math.ceil(slides.length / 2);

  const goNext = useCallback(() => { if (totalPages === 0) return; setCurrentIndex((prev) => (prev + 1) % totalPages); }, [totalPages]);
  const goPrev = useCallback(() => { if (totalPages === 0) return; setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages); }, [totalPages]);

  useEffect(() => {
    if (stage !== "slideshow" || !isPlaying || totalPages === 0) return;
    const interval = setInterval(goNext, 8000);
    return () => clearInterval(interval);
  }, [stage, isPlaying, goNext, totalPages]);

  useEffect(() => {
    if (stage !== "slideshow") return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") { e.preventDefault(); setIsPlaying((p) => !p); }
      if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [stage, goNext, goPrev]);

  const isLoading = loadingPhotos || loadingMessages || loadingEvent;

  // ── Password screen ──
  if (stage === "password") {
    if (loadingEvent) return <div className="fixed inset-0 bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
    // If no password set, skip straight to size picker
    if (event && !event.slideshow_password) {
      // Auto-advance
      if (stage === "password") { setTimeout(() => setStage("size"), 0); }
      return null;
    }
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl w-full max-w-sm space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Slideshow Access</h2>
            <p className="font-sans text-sm text-muted-foreground">Enter the password to continue</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <Input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              className={`text-center font-sans ${passwordError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              autoFocus
            />
            {passwordError && <p className="font-sans text-xs text-destructive">Incorrect password. Please try again.</p>}
            <Button type="submit" className="w-full font-sans">Continue</Button>
          </form>
          <Button asChild variant="ghost" className="font-sans text-sm text-muted-foreground w-full">
            <Link to={`/event/${eventId}/gallery`}>← Back to Gallery</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Screen size picker ──
  if (stage === "size") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl w-full max-w-lg space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Select Screen Size</h2>
            <p className="font-sans text-sm text-muted-foreground">Choose the format that matches your display</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {SCREEN_SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selectedSize.id === size.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-center w-12 h-8 rounded border-2 border-current shrink-0 text-muted-foreground" style={{ aspectRatio: size.id === "fullscreen" ? "16/9" : size.id.replace(":", "/") }}>
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium text-foreground">{size.label}</p>
                  <p className="font-sans text-xs text-muted-foreground">{size.description}</p>
                </div>
                {size.width && (
                  <span className="font-sans text-xs text-muted-foreground shrink-0">{size.width}×{size.height}</span>
                )}
                {selectedSize.id === size.id && (
                  <div className="w-4 h-4 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="font-sans flex-1" onClick={() => setStage("password")}>Back</Button>
            <Button className="font-sans flex-1 gap-2" onClick={handleLaunchSlideshow}>
              <Play className="w-4 h-4" /> Launch Slideshow
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Slideshow ──
  if (isLoading) {
    return <div className="fixed inset-0 bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-xl text-muted-foreground">No content to display yet</p>
        <Button asChild variant="outline" className="font-sans text-sm">
          <Link to={`/event/${eventId}/upload`}>Upload Content</Link>
        </Button>
      </div>
    );
  }

  const leftSlide = slides[currentIndex * 2];
  const rightSlide = slides[currentIndex * 2 + 1];

  const canvasStyle = selectedSize.id === "fullscreen"
    ? {}
    : { width: "100vw", height: "100vh" }; // always fill viewport; ratio is visual reference only

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden" style={canvasStyle}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center px-10 py-5 bg-gradient-to-b from-background/80 to-transparent">
        <div className="w-48 shrink-0" />
        <div className="flex-1 flex justify-center items-center gap-3">
          <img
            src={event?.logo_url || "https://media.base44.com/images/public/69dc9e0e6de364fb1172a03d/a0dff1aa1_IMG_2852.png"}
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-foreground font-serif text-2xl font-semibold text-center">{event?.title}</h1>
        </div>
        <div className="flex items-center gap-3 w-48 shrink-0 justify-end">
          <span className="font-sans text-sm text-muted-foreground">{currentIndex + 1} / {totalPages}</span>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link to={`/event/${eventId}/gallery`}><X className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Slide content */}
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
            <div className="flex-1 flex items-center justify-center px-6">
              {leftSlide && (leftSlide.type === "photo" ? <PhotoSlide photo={leftSlide.data} /> : <MessageSlide message={leftSlide.data} />)}
            </div>
            <div className="flex flex-col items-center justify-center gap-4 px-6 shrink-0">
              <div className="w-px h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-lg">
                <QRCodeSVG value={window.location.origin + `/event/${eventId}/upload`} size={140} bgColor="transparent" fgColor="hsl(var(--primary))" level="M" />
              </div>
              <p className="font-sans text-xs text-muted-foreground text-center max-w-[120px] leading-tight">Scan to share your well wishes</p>
              <div className="w-px h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
            </div>
            <div className="flex-1 flex items-center justify-center px-6">
              {rightSlide ? (
                rightSlide.type === "photo" ? <PhotoSlide photo={rightSlide.data} /> : <MessageSlide message={rightSlide.data} />
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
      <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goPrev}><SkipBack className="w-5 h-5" /></Button>
        <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-primary/30" onClick={() => setIsPlaying((p) => !p)}>
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={goNext}><SkipForward className="w-5 h-5" /></Button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30 z-30">
        <motion.div
          className="h-full bg-primary/50"
          initial={{ width: "0%" }}
          animate={{ width: isPlaying ? "100%" : `${(currentIndex / totalPages) * 100}%` }}
          transition={isPlaying ? { duration: 8, ease: "linear" } : { duration: 0.3 }}
          key={isPlaying ? currentIndex : "paused"}
        />
      </div>
    </div>
  );
}

function PhotoSlide({ photo }) {
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="w-full rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30 flex items-center justify-center bg-black/5" style={{ height: 380 }}>
        <img src={photo.image_url} alt="" style={{ maxWidth: "100%", maxHeight: "380px", width: "auto", height: "auto" }} />
      </div>
      <div className="text-center space-y-2">
        {photo.caption && <p className="font-serif text-xl text-foreground italic">"{photo.caption}"</p>}
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
      <p className="font-serif text-3xl text-foreground leading-relaxed">{message.content}</p>
      <div className="flex items-center gap-2 text-base font-sans text-muted-foreground">
        <User className="w-4 h-4" />
        <span>{message.uploader_name}</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-primary font-medium">{message.recipient}</span>
      </div>
    </div>
  );
}