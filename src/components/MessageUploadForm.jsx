import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import ConfirmDialog from "./ConfirmDialog";

export default function MessageUploadForm() {
  const [name, setName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmitClick = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!recipient.trim()) { toast.error("Please enter the recipient's name"); return; }
    if (!content.trim()) { toast.error("Please write a message"); return; }
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    await base44.entities.Message.create({
      uploader_name: name.trim(),
      recipient: recipient.trim(),
      content: content.trim(),
    });
    toast.success("Message submitted successfully!");
    setName("");
    setRecipient("");
    setContent("");
    setLoading(false);
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold">Write a Message</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="font-sans text-sm bg-background border-border/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Recipient *</Label>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Who is this for?" className="font-sans text-sm bg-background border-border/50" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Message *</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your congratulations and best wishes..."
            rows={5}
            className="font-sans text-sm bg-background border-border/50 resize-none"
          />
        </div>

        <Button onClick={handleSubmitClick} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-sm h-11">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {loading ? "Submitting..." : "Send Message"}
        </Button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Submission"
        description={`Send this message from "${name}" to "${recipient}"?`}
        confirmLabel="Send"
        onConfirm={handleConfirmedSubmit}
      />
    </>
  );
}