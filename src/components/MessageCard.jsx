import { Download, User, ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessageCard({ message }) {
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
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleDownload}>
            <Download className="w-3 h-3 mr-1" /> Download
          </Button>
        </div>
      </div>
    </>
  );
}