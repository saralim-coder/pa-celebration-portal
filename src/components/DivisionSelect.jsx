import { PA_DIVISIONS } from "@/utils/divisions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DivisionSelect({ value, onChange, label = "Recipient Division", required = true }) {
  return (
    <div className="space-y-2">
      <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label} {required && "*"}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="font-sans text-sm bg-background border-border/50">
          <SelectValue placeholder="Select a division" />
        </SelectTrigger>
        <SelectContent>
          {PA_DIVISIONS.map((d) => (
            <SelectItem key={d.short} value={d.short}>
              {d.short === "Leadership" ? "Leadership" : `${d.short} — ${d.full}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}