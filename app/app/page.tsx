"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, FileText, ArrowRight } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <header className="px-6 py-4 flex items-center justify-between bg-white/5 backdrop-blur-2xl border-b border-white/10 z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-tight">
            <Link href="/">EasyLegal</Link>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Button asChild variant="default" size="sm" className="bg-white text-black hover:bg-slate-200 rounded-full">
            <Link href="/app/cases/new">
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Link>
          </Button>
          <div className="z-20">
            <Navigation />
          </div>
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your cases</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Demo Case Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col gap-4 transition-colors hover:bg-white/10"
          >
            <div>
              <h3 className="font-semibold text-lg text-white">Landlord Deposit Dispute</h3>
              <p className="text-sm text-slate-400">Housing • Delhi, India</p>
            </div>
            
            <div className="text-2xl font-bold text-white">₹30,000</div>
            
            <div className="bg-white/10 rounded-2xl p-4 mt-auto">
              <div className="text-xs font-medium text-slate-400 mb-1">Stage 2 of 5</div>
              <div className="font-medium text-white">Evidence collection</div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">Updated 2 hours ago</span>
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white">
                <Link href="/app/cases/demo">
                  View <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Empty State / New Case */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-dashed border-white/20 flex flex-col items-center justify-center gap-4 text-center min-h-[280px] transition-colors hover:bg-white/10"
          >
            <div className="p-4 rounded-full bg-white/10">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Start a new case</h3>
              <p className="text-sm text-slate-400 mt-1">Describe your problem to get started</p>
            </div>
            <Button asChild variant="secondary" className="mt-2 bg-white/10 text-white hover:bg-white/20 border-0">
              <Link href="/app/cases/new">Start Case</Link>
            </Button>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}