"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("EasyLegal route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between">
        <Link href="/" className="flex w-fit items-center gap-2 font-bold tracking-tight">
          <Scale className="h-6 w-6" aria-hidden="true" />
          EasyLegal
        </Link>

        <section className="max-w-2xl space-y-6 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground">We hit a snag</p>
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">Your case is saved.</h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            This page could not finish loading. Nothing was submitted automatically. Try again, or return to your dashboard and continue from there.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => reset()}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />Try again
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/app"><Home className="mr-2 h-4 w-4" aria-hidden="true" />Go to dashboard</Link>
            </Button>
          </div>
        </section>

        <p className="pb-4 text-sm text-muted-foreground">If the problem continues, wait a moment and try again.</p>
      </div>
    </main>
  );
}
