"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    await authClient.signOut();
    setLoading(false);
    toast.success("Kamu telah keluar.");
    router.push("/masuk");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onLogout}
      disabled={loading}
    >
      {loading ? "Keluar…" : "Keluar"}
    </Button>
  );
}
