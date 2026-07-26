import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
}

export function BrandLogo({
  className,
  markClassName,
  showWordmark = false,
  wordmarkClassName,
  subtitle,
  subtitleClassName,
}: Readonly<BrandLogoProps>) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20",
          markClassName
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5.5 3v5a2.5 2.5 0 0 0 2.5 2.5" />
          <path d="M5.5 3V2" />
          <path d="M8 3V2" />
          <path d="M10.5 3V2" />
          <path d="M8 10.5V22" />
          <path d="M18.5 2.5c0 3.5-2 6-2 8.5V22" />
          <path d="M16.5 11h4" />
        </svg>
      </span>
      {showWordmark ? (
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              "truncate text-sm font-semibold tracking-tight",
              wordmarkClassName
            )}
          >
            Empire Cuisine
          </p>
          {subtitle ? (
            <p
              className={cn(
                "mt-0.5 text-xs text-muted-foreground",
                subtitleClassName
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
