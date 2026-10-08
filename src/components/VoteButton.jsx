import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VoteButton({ itemId, votes = 0, onVote }) {
  const storageKey = `pa-voted-${itemId}`;
  const [voted, setVoted] = useState(() => {
    try { return localStorage.getItem(storageKey) === "true"; } catch { return false; }
  });
  const [voting, setVoting] = useState(false);

  const handleClick = async () => {
    if (voted || voting) return;
    setVoting(true);
    try {
      await onVote(itemId);
      try { localStorage.setItem(storageKey, "true"); } catch {}
      setVoted(true);
    } finally {
      setVoting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs gap-1"
      onClick={handleClick}
      disabled={voted || voting}
    >
      <Heart className={`w-3.5 h-3.5 transition-colors ${voted ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
      <span className={`font-sans ${voted ? "text-primary font-medium" : "text-muted-foreground"}`}>{votes}</span>
    </Button>
  );
}