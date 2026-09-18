"use client";

import { useEffect } from "react";
import { RefreshCw, Scale } from "lucide-react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("EasyLegal global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-between px-6 py-8">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <Scale className="h-6 w-6" aria-hidden="true" />
            EasyLegal
          </div>
          <section className="space-y-6 py-16">
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-slate-400">System unavailable</p>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">We need a reset.</h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              EasyLegal could not load this workspace. Your browser session is still intact. Reload the application to try again.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 font-medium text-slate-950 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Reload EasyLegal
            </button>
          </section>
          <p className="pb-4 text-sm text-slate-400">No legal action is taken automatically.</p>
        </main>
      </body>
    </html>
  );
}
