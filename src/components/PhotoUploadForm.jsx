import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import ConfirmDialog from "./ConfirmDialog";

export default function PhotoUploadForm() {
  const [name, setName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileRef = useRef(null);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const isHeic = f.type === "image/heic" || f.type === "image/heif" || f.name.toLowerCase().endsWith(".heic") || f.name.toLowerCase().endsWith(".heif");
    if (isHeic) {
      toast.error("HEIC/HEIF photos are not supported. Please convert to JPG or PNG first (e.g. take a screenshot, or use your phone's settings to change the camera format).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmitClick = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!recipient.trim()) { toast.error("Please enter the recipient's name"); return; }
    if (!file) { toast.error("Please select a photo"); return; }
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Photo.create({
      uploader_name: name.trim(),
      recipient: recipient.trim(),
      image_url: file_url,
      caption: caption.trim() || undefined,
    });
    toast.success("Photo uploaded successfully!");
    setName("");
    setRecipient("");
    setCaption("");
    clearFile();
    setLoading(false);
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Camera className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold">Upload Photo</h3>
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
          <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Caption (Optional)</Label>
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..." rows={2} className="font-sans text-sm bg-background border-border/50 resize-none" />
        </div>

        <div className="space-y-2">
          <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Photo *</Label>
          {preview ? (
            <div className="relative rounded-lg overflow-hidden border border-border/50">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
              <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border/50 rounded-lg p-8 flex flex-col items-center gap-3 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="font-sans text-sm text-muted-foreground">Click to select a photo</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>

        <Button onClick={handleSubmitClick} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-sm h-11">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {loading ? "Uploading..." : "Upload Photo"}
        </Button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Upload"
        description={`Upload this photo from "${name}" for "${recipient}"?`}
        confirmLabel="Upload"
        onConfirm={handleConfirmedSubmit}
      />
    </>
  );
}