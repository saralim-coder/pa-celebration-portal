import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Calendar, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import GoldDivider from "../components/GoldDivider";
import PALoginGate, { getPAEmail } from "../components/PALoginGate";

export default function MyEvents() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const paEmail = getPAEmail();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["my-events", paEmail],
    queryFn: () => base44.entities.Event.filter({ organizer_email: paEmail }, "-created_date"),
  });

  const handleDelete = async (eventId) => {
    setDeleting(eventId);
    try {
      await base44.entities.Event.delete(eventId);
      toast.success("Event deleted");
    } catch (err) {
      toast.error("Could not delete event. It may have already been removed.");
    }
    queryClient.invalidateQueries({ queryKey: ["my-events"] });
    setDeleting(null);
  };

  return (
    <PALoginGate>
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-foreground">My Events</h2>
          <p className="font-sans text-sm text-muted-foreground mt-1">Manage your events</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="font-sans gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      <GoldDivider className="mb-8" />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-sans text-sm text-muted-foreground">No events yet. Create your first event!</p>
          <Button onClick={() => setShowCreate(true)} variant="outline" className="font-sans gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-card border border-border/50 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-primary/30 transition-all">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-semibold text-foreground truncate">{event.title}</h3>
                {event.description && (
                  <p className="font-sans text-xs text-muted-foreground mt-1 line-clamp-1">{event.description}</p>
                )}
                {event.ceremony_date && (
                  <div className="flex items-center gap-1 mt-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="font-sans text-xs text-muted-foreground">{event.ceremony_date}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="outline" size="sm" className="font-sans text-xs gap-1.5">
                  <Link to={`/event/${event.id}`}>
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(event.id)}
                  disabled={deleting === event.id}
                >
                  {deleting === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateEventDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["my-events"] });
          setShowCreate(false);
          toast.success("Event created!");
        }}
      />
    </div>
    </PALoginGate>
  );
}

function CreateEventDialog({ open, onOpenChange, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [password, setPassword] = useState("");
  const [screenSize, setScreenSize] = useState("16:9");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Event title is required"); return; }
    setLoading(true);
    const event = await base44.entities.Event.create({
      title: title.trim(),
      description: description.trim() || undefined,
      ceremony_date: date || undefined,
      organizer_name: getPAEmail(),
      organizer_email: getPAEmail(),
      slideshow_password: password.trim() || undefined,
      screen_size: screenSize,
    });
    setLoading(false);
    setTitle(""); setDescription(""); setDate(""); setPassword(""); setScreenSize("16:9");
    onCreated(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Long Service Awards 2026" className="font-sans text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the event..." rows={2} className="font-sans text-sm resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Ceremony Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="font-sans text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Screen Size</Label>
            <div className="grid grid-cols-4 gap-2">
              {["16:9", "9:16", "4:3", "1:1"].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setScreenSize(size)}
                  className={`font-sans text-sm py-2 rounded-md border transition-all ${screenSize === size ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/50"}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="font-sans text-xs text-muted-foreground">Select the aspect ratio of your display screen.</p>
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Slideshow Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password to access slideshow (optional)" className="font-sans text-sm" />
            <p className="font-sans text-xs text-muted-foreground">If left blank, no password is required.</p>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" className="font-sans" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="font-sans gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}