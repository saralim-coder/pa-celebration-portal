import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Camera, MessageSquare, Image, Monitor, ArrowRight, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoldDivider from "../components/GoldDivider";

export default function EventHome() {
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

  if (!event) {
    return (
      <div className="text-center py-24">
        <p className="font-sans text-muted-foreground">Event not found.</p>
        <Button asChild variant="outline" className="mt-4 font-sans"><Link to="/">Go Home</Link></Button>
      </div>
    );
  }

  const features = [
    { icon: Camera, title: "Share Photos", description: "Upload your favourite photos", link: `/event/${eventId}/upload` },
    { icon: MessageSquare, title: "Send Well Wishes", description: "Write heartfelt congratulations", link: `/event/${eventId}/upload` },
    { icon: Image, title: "Browse Gallery", description: "View all photos and messages", link: `/event/${eventId}/gallery` },
    { icon: Monitor, title: "Slideshow", description: "Watch the elegant presentation", link: `/event/${eventId}/slideshow` },
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center py-12 md:py-20 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img
            src={event.logo_url || "https://media.base44.com/images/public/69dc9e0e6de364fb1172a03d/a0dff1aa1_IMG_2852.png"}
            alt="People's Association"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight tracking-tight">
          {event.title}
        </h1>
        {event.description && (
          <p className="font-sans text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            {event.description}
          </p>
        )}
        {event.ceremony_date && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="font-sans text-sm">{event.ceremony_date}</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-sm px-6 h-11 rounded-lg">
            <Link to={`/event/${eventId}/upload`}>
              Share Well Wishes <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="font-sans text-sm px-6 h-11 rounded-lg">
            <Link to={`/event/${eventId}/gallery`}>View Gallery</Link>
          </Button>
        </div>
      </div>

      <GoldDivider className="my-8 md:my-12" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {features.map(({ icon: Icon, title, description, link }) => (
          <Link
            key={title}
            to={link}
            className="group bg-card rounded-xl border border-border/50 p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="font-sans text-xs text-muted-foreground leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>

      <GoldDivider className="my-8 md:my-12" />

      <div className="text-center space-y-3 pb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 pt-4">
          {[
            { step: "1", text: "Enter your name" },
            { step: "2", text: "Choose a recipient" },
            { step: "3", text: "Upload photo or message" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-serif text-sm font-semibold text-primary">{step}</span>
              </div>
              <span className="font-sans text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}