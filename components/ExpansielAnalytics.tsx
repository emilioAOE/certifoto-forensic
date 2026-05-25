"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageview, initAutoTracking } from "@/lib/expansiel-analytics";

export default function ExpansielAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    initAutoTracking();
  }, []);

  useEffect(() => {
    trackPageview();
  }, [pathname]);

  return null;
}
