import { useState } from "react";
import { Download, User, ArrowRight, Quote, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeletePasswordDialog from "./DeletePasswordDialog";
import VoteButton from "./VoteButton";
import { getGlowStyle } from "@/utils/glow";

export default function MessageCard({ message, onDelete, onVote }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = () => {
    const text = `Message to ${message.recipient}\nFrom: ${message.uploader_name}\n\n${message.content}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `message_${message.recipient}_${message.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await onDelete(message.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative bg-card rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 p-5 hover:shadow-lg hover:shadow-primary/5" style={getGlowStyle(message.votes)}>
        <Quote className="w-5 h-5 text-primary/30 mb-3" />
        <p className="font-serif text-base md:text-lg text-foreground leading-relaxed mb-4">
          {message.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{message.uploader_name}</span>
            {message.uploader_division && message.uploader_division !== "Leadership" && <span className="text-muted-foreground/70">({message.uploader_division})</span>}
            <ArrowRight className="w-3 h-3" />
            <span className="text-primary font-medium">{message.recipient}</span>
            {message.division && message.division !== "Leadership" && <span className="text-muted-foreground/70">· {message.division}</span>}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleDownload}>
              <Download className="w-3 h-3 mr-1" /> Download
            </Button>
            <VoteButton itemId={message.id} votes={message.votes || 0} onVote={onVote} />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
              Delete
            </Button>
          </div>
        </div>
      </div>

      <DeletePasswordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this message?"
        description="This message will be permanently removed from the gallery. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  );
}