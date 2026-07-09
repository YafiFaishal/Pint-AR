import Image from "next/image";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getModuleIconSrc,
  MODULE_ICON_INTRINSIC_SIZE,
} from "@/lib/module-icon-images";

const SIZE_CLASS = {
  /** Kartu modul: mobile sedikit lebih besar, desktop compact */
  card: "size-[72px] sm:size-16",
  /** Header detail modul */
  md: "size-[76px] sm:size-[72px]",
  /** Area ringkas (opsional) */
  compact: "size-12 sm:size-14",
} as const;

export function ModuleIconImage({
  judul,
  moduleId,
  moduleTitle,
  size = "card",
  className,
  animateOnHover = false,
}: {
  judul: string;
  moduleId?: string;
  /** Alias untuk alt text; default ke judul */
  moduleTitle?: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  animateOnHover?: boolean;
}) {
  const title = moduleTitle ?? judul;
  const src = getModuleIconSrc({ judul });

  if (process.env.NODE_ENV === "development" && !src) {
    console.warn(
      `Module icon not found for: ${moduleId ?? "unknown"} (${judul})`,
    );
  }

  const wrapperClass = cn(
    "module-icon-wrapper",
    SIZE_CLASS[size],
    animateOnHover && "module-icon-hover",
    className,
  );

  if (!src) {
    return (
      <div
        className={cn(
          wrapperClass,
          "flex items-center justify-center bg-muted/30",
        )}
        aria-hidden
      >
        <Layers className="size-5 text-muted-foreground/45" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <Image
        src={src}
        alt={`Ilustrasi modul ${title}`}
        width={MODULE_ICON_INTRINSIC_SIZE}
        height={MODULE_ICON_INTRINSIC_SIZE}
        sizes={
          size === "compact"
            ? "56px"
            : size === "md"
              ? "(max-width: 640px) 76px, 72px"
              : "(max-width: 640px) 72px, 64px"
        }
        className="module-icon-image"
      />
    </div>
  );
}
