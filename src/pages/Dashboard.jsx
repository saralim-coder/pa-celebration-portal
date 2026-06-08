import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Image, MessageSquare, Users, Loader2 } from "lucide-react";
import GoldDivider from "../components/GoldDivider";

function StatCard({ icon: Icon, label, value, color, isLoading }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 flex items-center gap-5">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mt-1" />
        ) : (
          <p className="font-serif text-3xl font-semibold text-foreground">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["all-events"],
    queryFn: () => base44.entities.Event.list("-created_date"),
  });

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ["all-photos"],
    queryFn: () => base44.entities.Photo.list("-created_date"),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["all-messages"],
    queryFn: () => base44.entities.Message.list("-created_date"),
  });

  const uniqueVisitors = new Set([
    ...photos.map((p) => p.uploader_name),
    ...messages.map((m) => m.uploader_name),
  ]).size;

  const isLoading = loadingEvents || loadingPhotos || loadingMessages;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="font-serif text-3xl font-semibold text-foreground">Dashboard</h2>
        <p className="font-sans text-sm text-muted-foreground mt-1">Overview of all events and contributions</p>
      </div>

      <GoldDivider className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Total Events"
          value={events.length}
          color="bg-primary/10 text-primary"
          isLoading={loadingEvents}
        />
        <StatCard
          icon={Image}
          label="Photos Uploaded"
          value={photos.length}
          color="bg-blue-100 text-blue-600"
          isLoading={loadingPhotos}
        />
        <StatCard
          icon={MessageSquare}
          label="Messages Submitted"
          value={messages.length}
          color="bg-green-100 text-green-600"
          isLoading={loadingMessages}
        />
        <StatCard
          icon={Users}
          label="Unique Visitors"
          value={uniqueVisitors}
          color="bg-purple-100 text-purple-600"
          isLoading={isLoading}
        />
      </div>

      {events.length > 0 && (
        <div className="mt-10">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-4">Per Event Breakdown</h3>
          <div className="space-y-3">
            {events.map((event) => {
              const eventPhotos = photos.filter((p) => p.event_id === event.id).length;
              const eventMessages = messages.filter((m) => m.event_id === event.id).length;
              return (
                <div key={event.id} className="bg-card border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-base font-semibold text-foreground truncate">{event.title}</p>
                    {event.ceremony_date && (
                      <p className="font-sans text-xs text-muted-foreground mt-0.5">{event.ceremony_date}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
                      <Image className="w-3.5 h-3.5 text-blue-500" />
                      <span>{eventPhotos} photos</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
                      <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                      <span>{eventMessages} messages</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}