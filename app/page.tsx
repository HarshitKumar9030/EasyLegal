"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, FileText, Scale, Shield, Search } from "lucide-react";
import gsap from "gsap";
import { ShaderBackground } from "@/components/ShaderBackground";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });
  
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      
      tl.fromTo(
        ".title-line",
        { y: 100, opacity: 0, rotateX: -20 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.15 }
      )
      .fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=0.8"
      )
      .fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=0.8"
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-clip bg-black">
      <ShaderBackground />
      
      <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="w-full max-w-5xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full pointer-events-auto">
          <div className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight text-white">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
            EasyLegal
          </div>
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link href="/app" className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Button asChild variant="default" size="sm" className="bg-white text-black hover:bg-slate-200 rounded-full px-4 sm:px-6 text-xs sm:text-sm h-8 sm:h-9">
              <Link href="/app/cases/new">Start a case</Link>
            </Button>
          </nav>
        </header>
      </div>

      <main className="flex-1 flex flex-col z-10 w-full">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-32 pb-24 text-center">
          <div className="max-w-5xl w-full space-y-6 sm:space-y-8 bg-white/5 backdrop-blur-3xl p-6 sm:p-12 md:p-20 rounded-4xl sm:rounded-[3rem] border border-white/10 shadow-2xl">
            <h1 ref={titleRef} className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-balance leading-[1.1] perspective-1000">
              <div className="overflow-hidden pb-2"><div className="title-line text-white origin-bottom">Know your rights.</div></div>
              <div className="overflow-hidden pb-2"><div className="title-line text-white origin-bottom">Know your next step.</div></div>
            </h1>
            
            <p ref={subtitleRef} className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto text-balance font-light leading-relaxed">
              EasyLegal helps turn confusing everyday legal problems into structured, source-backed next steps. You don&apos;t need to know the legal terminology. Explain what happened in your own words.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button asChild size="lg" className="w-full sm:w-auto text-lg bg-white text-black hover:bg-slate-200 rounded-full px-8 h-14 transition-transform hover:-translate-y-1">
                <Link href="/app/cases/new">
                  Start a case <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-white/20 rounded-full px-8 h-14 transition-transform hover:-translate-y-1">
                <Link href="/demo">
                  Try a demo
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Section */}
        <div ref={targetRef} className="h-[300vh] relative w-full overflow-x-clip">
          <div className="sticky top-28 h-[calc(100vh-7rem)] flex flex-col items-center justify-center overflow-hidden">
            <div className="mb-16 text-center px-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">How it works</h2>
              <p className="text-slate-300 mt-4 text-xl md:text-2xl font-light">From confusion to clarity in five simple steps.</p>
            </div>
            
            <motion.div style={{ x }} className="flex w-max gap-8 px-6 md:px-[10vw] will-change-transform">
              {[
                { icon: FileText, title: "Describe your problem", desc: "Tell us what happened in plain English. No legal jargon required." },
                { icon: Search, title: "Understand the issue", desc: "Our AI identifies the core legal concepts and potential claims." },
                { icon: Scale, title: "Find relevant law", desc: "We pull the exact statutes and precedents relevant to your jurisdiction." },
                { icon: Shield, title: "Organize evidence", desc: "Upload documents, photos, and emails to build a strong foundation." },
                { icon: ArrowRight, title: "Know what to do next", desc: "Get actionable, step-by-step guidance on how to proceed." },
              ].map((step, i) => (
                <div 
                  key={i} 
                  className="flex w-[min(82vw,400px)] shrink-0 flex-col items-start gap-6 p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl transition-colors hover:bg-white/10"
                >
                  <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-2xl text-white mb-3">{step.title}</p>
                    <p className="text-lg text-slate-300 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-3xl pt-20 pb-10 z-10 mt-auto overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-linear-to-r from-transparent via-white/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-24 bg-white/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-3 font-bold text-3xl tracking-tight text-white mb-8">
            <Scale className="w-8 h-8" />
            EasyLegal
          </div>
          
          <p className="text-slate-400 max-w-xl text-center leading-relaxed mb-12">
            Empowering individuals with AI-driven legal clarity. 
            <br className="hidden sm:block" />
            Not a substitute for professional legal counsel.
          </p>
          
          <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-8"></div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} EasyLegal. All rights reserved.
            </p>
            
            <a
              href="https://www.harshit.page"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Made By Harshit
              </span>
              <span className="relative text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                (www.harshit.page)
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
