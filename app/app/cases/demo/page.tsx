"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/PageLoader";

export default function DemoCase() {
  const router = useRouter();

  useEffect(() => {
    const createDemo = async () => {
      try {
        const res = await fetch("/api/cases/demo", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          router.push(`/app/cases/${data.caseId}`);
        }
      } catch (error) {
        console.error(error);
      }
    };
    createDemo();
  }, [router]);

  return <PageLoader />;
}