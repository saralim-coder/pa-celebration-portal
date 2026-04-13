import { useState } from "react";
import { Trash2, User, ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";

export default function MessageCard({ message, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <div className="group bg-card rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 p-5 hover:shadow-lg hover:shadow-primary/5">
        <Quote className="w-5 h-5 text-primary/30 mb-3" />
        <p className="font-serif text-base md:text-lg text-foreground leading-relaxed mb-4">
          {message.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{message.uploader_name}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-primary font-medium">{message.recipient}</span>
          </div>
          {onDelete && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setShowDelete(true)}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => onDelete(message.id)}
      />
    </>
  );
}