"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/expansiel-analytics";

export default function ExpansielAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    trackPageview();
  }, [pathname]);
  return null;
}
