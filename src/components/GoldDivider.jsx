export default function GoldDivider({ className = "" }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/50" />
      <span className="text-primary/60 text-sm">✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/50" />
    </div>
  );
}