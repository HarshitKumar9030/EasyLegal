"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useSession } from "next-auth/react";

export default function NewCase() {
  const { status } = useSession();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/cases/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/app/cases/${data.caseId}`);
      } else {
        console.error("Failed to create case");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <header className="px-6 py-4 flex items-center border-b border-white/10 bg-white/5 backdrop-blur-2xl z-10 gap-4">
        <Navigation />
        <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white hidden sm:flex">
          <Link href="/app">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="font-medium">Start a new case</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl space-y-8 bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">What happened?</h1>
            <p className="text-lg text-slate-300">
              Tell us what happened in your own words. Don't worry about using legal terms.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="My landlord hasn't returned my security deposit..."
                className="w-full min-h-[200px] p-6 rounded-3xl bg-white/10 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none text-lg transition-all"
                disabled={isSubmitting}
              />
              
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" className="rounded-2xl border-dashed border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Attach documents (optional)
                </Button>
                <span className="text-sm text-slate-400">
                  PDF, JPG, PNG supported
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg" 
                disabled={!description.trim() || isSubmitting}
                className="w-full sm:w-auto bg-white text-black hover:bg-slate-200 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Understanding your situation...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
      
      <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-3xl pt-12 pb-8 z-10 mt-auto overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EasyLegal. All rights reserved.
          </p>
          
          <a
            href="https://www.harshit.page"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              Made By Harshit
            </span>
            <span className="relative text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              (www.harshit.page)
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
}