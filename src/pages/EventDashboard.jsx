import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, BarChart3, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PA_DIVISIONS } from "@/utils/divisions";

export default function EventDashboard() {
  const { eventId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [p, m] = await Promise.all([
        base44.entities.Photo.filter({ event_id: eventId }, "-created_date"),
        base44.entities.Message.filter({ event_id: eventId }, "-created_date"),
      ]);
      if (!active) return;
      setPhotos(p);
      setMessages(m);
      setLoading(false);
    };
    load();

    const unsubP = base44.entities.Photo.subscribe((ev) => {
      if (ev.data?.event_id !== eventId) return;
      if (ev.type === "create") setPhotos((prev) => [ev.data, ...prev]);
      else if (ev.type === "update") setPhotos((prev) => prev.map((x) => (x.id === ev.id ? ev.data : x)));
      else if (ev.type === "delete") setPhotos((prev) => prev.filter((x) => x.id !== ev.id));
    });
    const unsubM = base44.entities.Message.subscribe((ev) => {
      if (ev.data?.event_id !== eventId) return;
      if (ev.type === "create") setMessages((prev) => [ev.data, ...prev]);
      else if (ev.type === "update") setMessages((prev) => prev.map((x) => (x.id === ev.id ? ev.data : x)));
      else if (ev.type === "delete") setMessages((prev) => prev.filter((x) => x.id !== ev.id));
    });

    return () => { active = false; unsubP(); unsubM(); };
  }, [eventId]);

  const all = [...photos, ...messages];

  const stats = PA_DIVISIONS.filter((d) => d.short !== "Unsure").map((d) => {
    const submitted = all.filter((x) => x.uploader_division === d.short).length;
    const received = all.filter((x) => x.division === d.short).length;
    return { ...d, submitted, received };
  });

  // Include "Unsure" rows only if there's data
  const unsureSubmitted = all.filter((x) => x.uploader_division === "Unsure" || (!x.uploader_division && x.uploader_name)).length;
  const unsureReceived = all.filter((x) => x.division === "Unsure").length;
  if (unsureSubmitted || unsureReceived) {
    stats.push({ short: "Unsure", full: "Not sure which division", submitted: unsureSubmitted, received: unsureReceived });
  }

  const totalSubmitted = all.length;
  const totalReceived = all.filter((x) => x.division).length;
  const maxCount = Math.max(1, ...stats.map((s) => Math.max(s.submitted, s.received)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Division Dashboard</h2>
          <p className="font-sans text-sm text-muted-foreground">Submissions made and received by division</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Total Submissions</p>
          <p className="font-serif text-3xl font-semibold text-foreground mt-1">{totalSubmitted}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Tagged to a Division</p>
          <p className="font-serif text-3xl font-semibold text-foreground mt-1">{totalReceived}</p>
        </div>
      </div>

      {totalSubmitted === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="font-serif text-xl text-muted-foreground">No submissions yet</p>
          <Button asChild variant="outline" className="font-sans text-sm">
            <Link to={`/event/${eventId}/upload`}>Be the first to share</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="col-span-4 font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Division</div>
            <div className="col-span-4 font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Submitted
            </div>
            <div className="col-span-4 font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <ArrowDownLeft className="w-3 h-3" /> Received
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {stats
              .filter((s) => s.submitted > 0 || s.received > 0)
              .sort((a, b) => b.submitted + b.received - (a.submitted + a.received))
              .map((s) => (
                <div key={s.short} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                  <div className="col-span-4">
                    <p className="font-sans text-sm font-medium text-foreground">{s.short}</p>
                    <p className="font-sans text-xs text-muted-foreground truncate">{s.full}</p>
                  </div>
                  <div className="col-span-4 flex flex-col items-center gap-1">
                    <span className="font-serif text-lg font-semibold text-foreground">{s.submitted}</span>
                    <div className="w-full max-w-[80px] h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(s.submitted / maxCount) * 100}%` }} />
                    </div>
                  </div>
                  <div className="col-span-4 flex flex-col items-center gap-1">
                    <span className="font-serif text-lg font-semibold text-foreground">{s.received}</span>
                    <div className="w-full max-w-[80px] h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-accent/60 rounded-full" style={{ width: `${(s.received / maxCount) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}