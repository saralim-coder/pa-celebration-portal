import { useState } from "react";
import { Share2, Copy, MessageCircle, Facebook, Twitter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

export default function ShareButton({ title, text, url, imageUrl }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "PA Celebration Portal";
  const shareText = text || "Check out this moment from the ceremony!";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${shareText} ${shareUrl}`);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <Share2 className="w-3 h-3 mr-1" /> Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="end">
        <div className="flex flex-col gap-1">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm font-sans text-left"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={`https://wa.me/?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm font-sans"
          >
            <MessageCircle className="w-4 h-4 text-muted-foreground" /> WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm font-sans"
          >
            <Facebook className="w-4 h-4 text-muted-foreground" /> Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm font-sans"
          >
            <Twitter className="w-4 h-4 text-muted-foreground" /> X / Twitter
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}