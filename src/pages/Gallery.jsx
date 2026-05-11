import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MessageSquare, Loader2 } from "lucide-react";
import PhotoCard from "../components/PhotoCard";
import MessageCard from "../components/MessageCard";
import FilterBar from "../components/FilterBar";
import GoldDivider from "../components/GoldDivider";
import SlideshowQueue from "../components/SlideshowQueue";

export default function Gallery() {
  const [search, setSearch] = useState("");
  const [recipient, setRecipient] = useState("all");
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ["photos"],
    queryFn: () => base44.entities.Photo.list("-created_date"),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages"],
    queryFn: () => base44.entities.Message.list("-created_date"),
  });

  const allRecipients = useMemo(() => {
    const set = new Set([
      ...photos.map((p) => p.recipient),
      ...messages.map((m) => m.recipient),
    ]);
    return [...set].sort();
  }, [photos, messages]);

  const filterItems = (items) => {
    return items.filter((item) => {
      const matchRecipient = recipient === "all" || item.recipient === recipient;
      const searchLower = search.toLowerCase();
      const matchSearch =
        !search ||
        item.uploader_name?.toLowerCase().includes(searchLower) ||
        item.recipient?.toLowerCase().includes(searchLower) ||
        item.content?.toLowerCase().includes(searchLower) ||
        item.caption?.toLowerCase().includes(searchLower);
      return matchRecipient && matchSearch;
    });
  };

  const filteredPhotos = filterItems(photos);
  const filteredMessages = filterItems(messages);



  const isLoading = loadingPhotos || loadingMessages;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
          Gallery
        </h2>
        <p className="font-sans text-sm text-muted-foreground">
          Browse all photos and messages shared for the ceremony
        </p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        recipient={recipient}
        onRecipientChange={setRecipient}
        recipients={allRecipients}
      />

      <GoldDivider className="my-6" />

      {!isLoading && <SlideshowQueue photos={photos} messages={messages} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="bg-muted/50 h-10 rounded-lg">
            <TabsTrigger value="photos" className="font-sans text-sm gap-2 data-[state=active]:bg-card">
              <Camera className="w-4 h-4" /> Photos ({filteredPhotos.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="font-sans text-sm gap-2 data-[state=active]:bg-card">
              <MessageSquare className="w-4 h-4" /> Messages ({filteredMessages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="mt-6">
            {filteredPhotos.length === 0 ? (
              <EmptyState type="photos" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            {filteredMessages.length === 0 ? (
              <EmptyState type="messages" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMessages.map((message) => (
                  <MessageCard key={message.id} message={message} />
                ))}
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
        {type === "photos" ? (
          <Camera className="w-5 h-5 text-muted-foreground" />
        ) : (
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <p className="font-sans text-sm text-muted-foreground">
        No {type} found. {type === "photos" ? "Upload a photo" : "Write a message"} to get started.
      </p>
    </div>
  );
}