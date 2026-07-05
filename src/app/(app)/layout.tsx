import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader name={user.name} role={user.role} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
