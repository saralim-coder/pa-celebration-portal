import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MessageSquare } from "lucide-react";
import PhotoUploadForm from "../components/PhotoUploadForm";
import MessageUploadForm from "../components/MessageUploadForm";

export default function Upload() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
          Share Your Tribute
        </h2>
        <p className="font-sans text-sm text-muted-foreground">
          Upload a photo or write a message to celebrate this achievement
        </p>
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
            <PhotoUploadForm />
          </TabsContent>
          <TabsContent value="message" className="mt-0">
            <MessageUploadForm />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}