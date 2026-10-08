import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MessageSquare, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoCard from "../components/PhotoCard";
import MessageCard from "../components/MessageCard";
import FilterBar from "../components/FilterBar";
import GoldDivider from "../components/GoldDivider";
import SlideshowQueue from "../components/SlideshowQueue";
import { PA_DIVISIONS } from "@/utils/divisions";

export default function EventGallery() {
  const { eventId } = useParams();
  const [search, setSearch] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [division, setDivision] = useState("all");

  const focusPhoto = new URLSearchParams(window.location.search).get("photo");
  const focusMessage = new URLSearchParams(window.location.search).get("message");
  const [activeTab, setActiveTab] = useState(focusMessage ? "messages" : "photos");

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ["photos", eventId],
    queryFn: () => base44.entities.Photo.filter({ event_id: eventId }, "-created_date"),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", eventId],
    queryFn: () => base44.entities.Message.filter({ event_id: eventId }, "-created_date"),
  });

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => base44.entities.Event.get(eventId),
  });

  const queryClient = useQueryClient();

  const handleDeletePhoto = async (photoId) => {
    try {
      await base44.entities.Photo.delete(photoId);
      toast.success("Photo deleted");
      queryClient.invalidateQueries({ queryKey: ["photos", eventId] });
    } catch {
      toast.error("Could not delete photo. Please try again.");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await base44.entities.Message.delete(messageId);
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["messages", eventId] });
    } catch {
      toast.error("Could not delete message. Please try again.");
    }
  };

  const handleVotePhoto = async (photoId) => {
    const photo = photos.find((p) => p.id === photoId);
    await base44.entities.Photo.update(photoId, { votes: (photo.votes || 0) + 1 });
    queryClient.invalidateQueries({ queryKey: ["photos", eventId] });
  };

  const handleVoteMessage = async (messageId) => {
    const message = messages.find((m) => m.id === messageId);
    await base44.entities.Message.update(messageId, { votes: (message.votes || 0) + 1 });
    queryClient.invalidateQueries({ queryKey: ["messages", eventId] });
  };

  const allRecipients = useMemo(() => {
    const set = new Set([...photos.map((p) => p.recipient), ...messages.map((m) => m.recipient)]);
    return [...set].sort();
  }, [photos, messages]);

  const availableDivisions = useMemo(() => {
    const used = new Set([...photos.map((p) => p.division), ...messages.map((m) => m.division)].filter(Boolean));
    return PA_DIVISIONS.filter((d) => used.has(d.short));
  }, [photos, messages]);

  const filterItems = (items) => {
    return items.filter((item) => {
      const matchRecipient = recipient === "all" || item.recipient === recipient;
      const matchDivision = division === "all" || item.division === division;
      const searchLower = search.toLowerCase();
      const matchSearch =
        !search ||
        item.uploader_name?.toLowerCase().includes(searchLower) ||
        item.recipient?.toLowerCase().includes(searchLower) ||
        item.content?.toLowerCase().includes(searchLower) ||
        item.caption?.toLowerCase().includes(searchLower);
      return matchRecipient && matchDivision && matchSearch;
    });
  };

  const filteredPhotos = filterItems(photos);
  const filteredMessages = filterItems(messages);

  const [downloadingPhotos, setDownloadingPhotos] = useState(false);
  const [downloadingMessages, setDownloadingMessages] = useState(false);

  const handleDownloadAllPhotos = async () => {
    setDownloadingPhotos(true);
    try {
      for (let i = 0; i < filteredPhotos.length; i++) {
        const photo = filteredPhotos[i];
        const res = await fetch(photo.image_url);
        const blob = await res.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `photo-${i + 1}-${photo.uploader_name}-to-${photo.recipient}.${ext}`.replace(/\s+/g, "_");
        a.click();
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 400));
      }
    } finally {
      setDownloadingPhotos(false);
    }
  };

  const handleDownloadAllMessages = () => {
    setDownloadingMessages(true);
    const text = filteredMessages
      .map((m, i) => `--- Message ${i + 1} ---\nFrom: ${m.uploader_name}\nTo: ${m.recipient}\n\n${m.content}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "messages.txt";
    a.click();
    URL.revokeObjectURL(url);
    setDownloadingMessages(false);
  };

  const isLoading = loadingPhotos || loadingMessages;

  useEffect(() => {
    if (isLoading) return;
    const focusId = focusPhoto ? `photo-${focusPhoto}` : focusMessage ? `message-${focusMessage}` : null;
    if (!focusId) return;
    const el = document.getElementById(focusId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isLoading, focusPhoto, focusMessage]);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">Gallery</h2>
        <p className="font-sans text-sm text-muted-foreground">Browse all photos and messages shared for the ceremony</p>
        <p className="font-sans text-xs text-muted-foreground/70 pt-1">More hearts make the glow stronger ✨</p>
      </div>

      <FilterBar search={search} onSearchChange={setSearch} recipient={recipient} onRecipientChange={setRecipient} recipients={allRecipients} division={division} onDivisionChange={setDivision} divisions={availableDivisions} />
      <GoldDivider className="my-6" />

      {!isLoading && <SlideshowQueue photos={photos} messages={messages} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="bg-muted/50 h-10 rounded-lg">
              <TabsTrigger value="photos" className="font-sans text-sm gap-2 data-[state=active]:bg-card">
                <Camera className="w-4 h-4" /> Photos ({filteredPhotos.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="font-sans text-sm gap-2 data-[state=active]:bg-card">
                <MessageSquare className="w-4 h-4" /> Messages ({filteredMessages.length})
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="font-sans text-xs gap-1.5" onClick={handleDownloadAllPhotos} disabled={downloadingPhotos || filteredPhotos.length === 0}>
                {downloadingPhotos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download Photos
              </Button>
              <Button variant="outline" size="sm" className="font-sans text-xs gap-1.5" onClick={handleDownloadAllMessages} disabled={downloadingMessages || filteredMessages.length === 0}>
                {downloadingMessages ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download Messages
              </Button>
            </div>
          </div>

          <TabsContent value="photos" className="mt-6">
            {filteredPhotos.length === 0 ? (
              <EmptyState type="photos" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => <PhotoCard key={photo.id} photo={photo} onDelete={handleDeletePhoto} onVote={handleVotePhoto} highlight={focusPhoto === photo.id} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            {filteredMessages.length === 0 ? (
              <EmptyState type="messages" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMessages.map((message) => <MessageCard key={message.id} message={message} onDelete={handleDeleteMessage} onVote={handleVoteMessage} highlight={focusMessage === message.id} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function EmptyState({ type }) {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
        {type === "photos" ? <Camera className="w-5 h-5 text-muted-foreground" /> : <MessageSquare className="w-5 h-5 text-muted-foreground" />}
      </div>
      <p className="font-sans text-sm text-muted-foreground">
        No {type} found. {type === "photos" ? "Upload a photo" : "Write a message"} to get started.
      </p>
    </div>
  );
}