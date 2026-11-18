"use client";
import { Toaster } from "sonner";
import { useTheme } from "@/lib/ui/prefs";

/* Powiadomienia (np. „Skopiowano”) w motywie strony. */
export default function AppToaster() {
  const theme = useTheme();
  return <Toaster position="bottom-right" theme={theme} offset={{ bottom: 24 }} mobileOffset={{ bottom: "calc(var(--dock-space, 0px) + 8px)" }} toastOptions={{ className: "toast" }} />;
}
