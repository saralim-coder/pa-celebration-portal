import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PA_PASSWORD = "ILOVEPA";
const SESSION_KEY = "pa_portal_auth";

export function isPAAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export function setPAAuthenticated() {
  sessionStorage.setItem(SESSION_KEY, "true");
}

export default function PALoginGate({ children }) {
  const [authed, setAuthed] = useState(isPAAuthenticated());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  if (authed) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === PA_PASSWORD) {
      setPAAuthenticated();
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-semibold">PA Staff Portal</h2>
        <p className="font-sans text-sm text-muted-foreground max-w-xs">
          Enter your PA portal password to create and manage events.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Password
          </Label>
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter portal password"
              className="font-sans pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="font-sans text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full font-sans">Sign In</Button>
      </form>
    </div>
  );
}