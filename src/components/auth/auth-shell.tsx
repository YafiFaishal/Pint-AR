import Link from "next/link";
import { cn } from "@/lib/utils";
import { PintARBrand } from "@/components/brand/pintar-brand";

export function AuthNavLink({
  href,
  children,
  active = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center rounded-md px-2.5 text-sm font-medium leading-snug transition-colors sm:min-h-0",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

type AuthShellProps = {
  children: React.ReactNode;
  variant?: "landing" | "login" | "register";
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  rootClassName?: string;
};

const MAIN_MAX_WIDTH = {
  landing: "max-w-6xl",
  login: "max-w-[680px]",
  register: "max-w-[720px]",
} as const;

export function AuthShell({
  children,
  variant = "login",
  headerRight,
  footer,
  rootClassName,
}: AuthShellProps) {
  const isLanding = variant === "landing";

  return (
    <div
      className={cn("flex min-h-dvh flex-col scientific-bg", rootClassName)}
    >
      <header
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-border/80 bg-card/70 pt-[env(safe-area-inset-top,0px)] backdrop-blur-sm",
          isLanding
            ? "landing-header h-[4.75rem] px-5 sm:px-6"
            : "h-20 px-6 sm:px-8",
        )}
      >
        <PintARBrand priority={isLanding} />
        {headerRight ? (
          <div className="flex items-center gap-1 sm:gap-2">{headerRight}</div>
        ) : null}
      </header>

      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col px-6 sm:px-8",
          MAIN_MAX_WIDTH[variant],
          isLanding
            ? "justify-start pt-8 pb-[calc(96px+env(safe-area-inset-bottom,0px))] sm:pt-10 lg:pt-12"
            : "justify-start pt-10 pb-[calc(120px+env(safe-area-inset-bottom,0px))] sm:pt-12",
        )}
        style={{ minHeight: "calc(100dvh - 80px)" }}
      >
        {children}
      </main>

      {footer ? (
        <footer className="shrink-0 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] text-center text-xs leading-relaxed text-muted-foreground sm:px-8">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
