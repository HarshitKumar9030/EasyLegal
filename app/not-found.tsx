import Link from "next/link";
import { ArrowLeft, Home, SearchX, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between">
        <Link href="/" className="flex w-fit items-center gap-2 font-bold tracking-tight">
          <Scale className="h-6 w-6" aria-hidden="true" />
          EasyLegal
        </Link>

        <section className="grid gap-10 py-16 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="relative flex aspect-square max-w-sm items-center justify-center rounded-[2rem] bg-muted/60">
            <div className="absolute left-8 top-8 h-2 w-2 rounded-full bg-primary/30" />
            <div className="absolute bottom-12 right-10 h-3 w-3 rounded-full bg-primary/20" />
            <SearchX className="h-24 w-24 text-muted-foreground/60" strokeWidth={1.2} aria-hidden="true" />
            <span className="absolute bottom-8 left-8 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">404 / route missing</span>
          </div>

          <div className="max-w-xl space-y-6">
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground">Page not found</p>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">This path led nowhere.</h1>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">
              The page may have moved, or the link may be incomplete. Your case work is still safe.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/app"><Home className="mr-2 h-4 w-4" aria-hidden="true" />Go to dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Back home</Link>
              </Button>
            </div>
          </div>
        </section>

        <p className="pb-4 text-sm text-muted-foreground">EasyLegal · Know your rights. Know your next step.</p>
      </div>
    </main>
  );
}
