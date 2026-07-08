import Link from "next/link";
import { cn } from "@/lib/utils";

function AuthLogo() {
  return (
    <Link
      href="/"
      className="rounded-sm text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Pint<span className="text-primary">AR</span>
    </Link>
  );
}

export function AuthNavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
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
};

const MAIN_MAX_WIDTH = {
  landing: "max-w-xl",
  login: "max-w-[680px]",
  register: "max-w-[720px]",
} as const;

export function AuthShell({
  children,
  variant = "login",
  headerRight,
  footer,
}: AuthShellProps) {
  const isLanding = variant === "landing";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-20 shrink-0 items-center justify-between border-b px-6 pt-[env(safe-area-inset-top,0px)] sm:px-8">
        <AuthLogo />
        {headerRight ? (
          <div className="flex items-center gap-1 sm:gap-2">{headerRight}</div>
        ) : null}
      </header>

      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col px-6 sm:px-8",
          MAIN_MAX_WIDTH[variant],
          isLanding
            ? "items-center justify-start pt-12 pb-[calc(120px+env(safe-area-inset-bottom,0px))] sm:pt-16"
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
