import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const authInputClass = "min-h-11 text-sm leading-normal placeholder:text-sm";
export const authSubmitClass = "min-h-[52px] w-full text-sm";
export const authFormClass = "flex flex-col gap-5";
export const authCardClass =
  "w-full overflow-visible rounded-3xl [--card-spacing:1.5rem] sm:[--card-spacing:1.75rem]";
export const authCardHeaderClass = "gap-2 pb-1";
export const authLinkClass =
  "font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm";

export function AuthField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm leading-snug">
        {label}
      </Label>
      {children}
    </div>
  );
}
