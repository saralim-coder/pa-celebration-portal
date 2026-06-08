import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MessageSquare, Loader2 } from "lucide-react";
import PhotoUploadForm from "../components/PhotoUploadForm";
import MessageUploadForm from "../components/MessageUploadForm";

export default function EventUpload() {
  const { eventId } = useParams();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => base44.entities.Event.get(eventId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
          Share Your Well Wishes
        </h2>
        {event && (
          <p className="font-sans text-sm text-muted-foreground">for {event.title}</p>
        )}
      </div>

      <Tabs defaultValue="photo" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 h-12 rounded-lg">
          <TabsTrigger value="photo" className="font-sans text-sm data-[state=active]:bg-card data-[state=active]:text-foreground gap-2 rounded-md">
            <Camera className="w-4 h-4" /> Photo
          </TabsTrigger>
          <TabsTrigger value="message" className="font-sans text-sm data-[state=active]:bg-card data-[state=active]:text-foreground gap-2 rounded-md">
            <MessageSquare className="w-4 h-4" /> Message
          </TabsTrigger>
        </TabsList>
        <div className="mt-6 bg-card rounded-xl border border-border/50 p-6">
          <TabsContent value="photo" className="mt-0">
            <PhotoUploadForm eventId={eventId} />
          </TabsContent>
          <TabsContent value="message" className="mt-0">
            <MessageUploadForm eventId={eventId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}