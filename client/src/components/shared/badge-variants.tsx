import { Sparkles, Flame, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AiGeneratedBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border border-[var(--electric-aqua)]/40 bg-[#003580]/80 text-[var(--electric-aqua)]",
        className,
      )}
    >
      <Sparkles className="size-3" aria-hidden />
      AI-Generated
    </Badge>
  );
}

export function TrendingBadge({ className }: { className?: string }) {
  return (
    <Badge
      className={cn(
        "gap-1 border-transparent bg-gradient-to-r from-[#0047AB] to-[#4169E1] text-white",
        className,
      )}
    >
      <Flame className="size-3" aria-hidden />
      Trending
    </Badge>
  );
}

export function NewBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-[var(--aurora-glow)]/50 text-[var(--aurora-glow)]",
        className,
      )}
    >
      <Sparkle className="size-3" aria-hidden />
      New
    </Badge>
  );
}
