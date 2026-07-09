import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PINTAR_NAME } from "@/lib/branding";

const LOGO_MARK = "/brand/pintar-logo-mark-transparent.png";
const LOGO_HORIZONTAL = "/brand/pintar-logo-horizontal-transparent.png";

export type PintARBrandVariant = "auto" | "horizontal" | "mark";

export function PintARBrand({
  href = "/",
  className,
  variant = "auto",
  priority = false,
}: {
  href?: string;
  className?: string;
  variant?: PintARBrandVariant;
  priority?: boolean;
}) {
  const showHorizontal = variant === "horizontal";
  const showMarkOnly = variant === "mark";
  const showAuto = variant === "auto";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-w-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {showHorizontal ? (
        <Image
          src={LOGO_HORIZONTAL}
          alt={PINTAR_NAME}
          width={2172}
          height={724}
          priority={priority}
          className="h-[38px] w-auto max-w-[min(100%,11rem)] object-contain sm:h-[42px] md:max-w-[12.5rem]"
        />
      ) : null}

      {showMarkOnly ? (
        <Image
          src={LOGO_MARK}
          alt={PINTAR_NAME}
          width={1254}
          height={1254}
          priority={priority}
          className="size-9 object-contain sm:size-10"
        />
      ) : null}

      {showAuto ? (
        <>
          <Image
            src={LOGO_HORIZONTAL}
            alt={PINTAR_NAME}
            width={2172}
            height={724}
            priority={priority}
            className="hidden h-[38px] w-auto max-w-[11rem] object-contain sm:block sm:h-[42px] md:max-w-[12.5rem]"
          />
          <Image
            src={LOGO_MARK}
            alt=""
            aria-hidden
            width={1254}
            height={1254}
            priority={priority}
            className="size-9 shrink-0 object-contain sm:hidden"
          />
          <span className="text-lg font-bold tracking-tight sm:hidden">
            Pint<span className="text-primary">AR</span>
          </span>
          <span className="sr-only">{PINTAR_NAME}</span>
        </>
      ) : null}
    </Link>
  );
}
