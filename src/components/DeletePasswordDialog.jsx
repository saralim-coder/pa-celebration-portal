import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

const ADMIN_PASSWORD = "Admin";

export default function DeletePasswordDialog({ open, onOpenChange, onConfirm, title = "Delete this item?", description = "This item will be permanently removed. This action cannot be undone." }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setPassword("");
      setError(false);
      onConfirm();
    } else {
      setError(true);
    }
  };

  const handleOpenChange = (v) => {
    if (!v) { setPassword(""); setError(false); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> {title}
          </DialogTitle>
        </DialogHeader>
        <p className="font-sans text-sm text-muted-foreground">{description}</p>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-2">
            <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password"
              className="font-sans text-sm"
              autoFocus
            />
            {error && <p className="font-sans text-xs text-destructive">Incorrect password.</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="font-sans" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" className="font-sans">Delete</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}