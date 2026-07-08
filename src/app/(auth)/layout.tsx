import { redirect } from "next/navigation";
import { getCurrentUser, berandaPath } from "@/lib/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(berandaPath(user.role));
  }

  return children;
}
