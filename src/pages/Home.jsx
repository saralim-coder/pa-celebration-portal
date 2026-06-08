import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { Calendar, ExternalLink, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoldDivider from "../components/GoldDivider";

const PA_DOMAIN = "@pa.gov.sg";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isPA = isAuthenticated && user?.email?.endsWith(PA_DOMAIN);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["all-events"],
    queryFn: () => base44.entities.Event.list("-created_date"),
  });

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center py-10">
        <h2 className="font-serif text-4xl font-semibold text-foreground mb-3">Welcome</h2>
        <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto">
          Browse upcoming and past PA celebration events. Select an event to upload photos, view the gallery, or launch the slideshow.
        </p>
        {isPA && (
          <div className="mt-6">
            <Button asChild className="font-sans gap-2">
              <Link to="/my-events">
                <Plus className="w-4 h-4" /> Manage My Events
              </Link>
            </Button>
          </div>
        )}
      </div>

      <GoldDivider className="mb-8" />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-sans text-sm text-muted-foreground">No events have been created yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-card border border-border/50 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-primary/30 transition-all"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-semibold text-foreground truncate">{event.title}</h3>
                {event.description && (
                  <p className="font-sans text-xs text-muted-foreground mt-1 line-clamp-1">{event.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {event.ceremony_date && (
                    <span className="flex items-center gap-1 font-sans text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" /> {event.ceremony_date}
                    </span>
                  )}
                  {event.organizer_name && (
                    <span className="font-sans text-xs text-muted-foreground">by {event.organizer_name}</span>
                  )}
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="font-sans text-xs gap-1.5 shrink-0">
                <Link to={`/event/${event.id}`}>
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}