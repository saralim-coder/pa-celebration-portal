import { useState } from "react";
import { Download, User, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeletePasswordDialog from "./DeletePasswordDialog";
import VoteButton from "./VoteButton";
import ShareButton from "./ShareButton";
import { getGlowStyle } from "@/utils/glow";

export default function PhotoCard({ photo, onDelete, onVote }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = async () => {
    const response = await fetch(photo.image_url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `photo_${photo.recipient}_${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await onDelete(photo.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5" style={getGlowStyle(photo.votes)}>
        <div className="aspect-square overflow-hidden">
          <img
            src={photo.image_url}
            alt={`Photo for ${photo.recipient}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{photo.uploader_name}</span>
            {photo.uploader_division && photo.uploader_division !== "Leadership" && <span className="text-muted-foreground/70">({photo.uploader_division})</span>}
            <ArrowRight className="w-3 h-3" />
            <span className="text-primary font-medium">{photo.recipient}</span>
            {photo.division && photo.division !== "Leadership" && <span className="text-muted-foreground/70">· {photo.division}</span>}
          </div>
          {photo.caption && (
            <p className="text-xs font-sans text-foreground/80 line-clamp-2">{photo.caption}</p>
          )}
          <div className="flex items-center gap-1 pt-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleDownload}>
              <Download className="w-3 h-3 mr-1" /> Download
            </Button>
            <ShareButton
              title={`Photo for ${photo.recipient}`}
              text={`A special moment for ${photo.recipient} from ${photo.uploader_name}`}
              imageUrl={photo.image_url}
            />
            <VoteButton itemId={photo.id} votes={photo.votes || 0} onVote={onVote} />
          </div>
        </div>
      </div>

      <DeletePasswordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this photo?"
        description="This photo will be permanently removed from the gallery. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  );
}