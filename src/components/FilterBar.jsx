import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FilterBar({ search, onSearchChange, recipient, onRecipientChange, recipients }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or content..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 font-sans text-sm bg-card border-border/50 focus:border-primary/50"
        />
      </div>
      <Select value={recipient} onValueChange={onRecipientChange}>
        <SelectTrigger className="w-full sm:w-56 font-sans text-sm bg-card border-border/50">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Filter by recipient" />
        </SelectTrigger>
        <SelectContent className="bg-card">
          <SelectItem value="all" className="font-sans text-sm">All Recipients</SelectItem>
          {recipients.map((r) => (
            <SelectItem key={r} value={r} className="font-sans text-sm">{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}