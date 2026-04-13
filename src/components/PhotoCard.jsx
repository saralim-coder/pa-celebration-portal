import { useState } from "react";
import { Trash2, Download, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";

export default function PhotoCard({ photo, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

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

  return (
    <>
      <div className="group relative bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div className="aspect-square overflow-hidden">
          <img
            src={photo.image_url}
            alt={`Photo for ${photo.recipient}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{photo.uploader_name}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-primary font-medium">{photo.recipient}</span>
          </div>
          {photo.caption && (
            <p className="text-xs font-sans text-foreground/80 line-clamp-2">{photo.caption}</p>
          )}
          <div className="flex items-center gap-1 pt-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleDownload}>
              <Download className="w-3 h-3 mr-1" /> Download
            </Button>
            {onDelete && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}>
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Photo"
        description="Are you sure you want to delete this photo? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => onDelete(photo.id)}
      />
    </>
  );
}