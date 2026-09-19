"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Loader2, Briefcase, Scale, Clock } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/cases")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCases(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const activeCases = cases.filter(c => c.status !== "Resolved").length;
  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <div className="pt-6 px-4 sm:px-6 flex justify-center z-50 relative">
        <header className="w-full max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full hidden sm:block">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-xl tracking-tight">
              <Link href="/">EasyLegal</Link>
            </div>
          </div>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Button asChild variant="default" size="sm" className="bg-white text-black hover:bg-slate-200 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] h-10 px-4 sm:px-5">
              <Link href="/app/cases/new">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Case</span>
              </Link>
            </Button>
            <div className="z-20">
              <Navigation />
            </div>
          </nav>
        </header>
      </div>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/50">{userName}</span>
          </h1>
          <p className="text-lg text-slate-400">
            You have {activeCases} active {activeCases === 1 ? 'case' : 'cases'} requiring your attention.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* New Case Card */}
          <motion.div variants={itemVariants}>
            <Link href="/app/cases/new" className="block h-full">
              <div className="bg-linear-to-br from-white/5 to-white/0 backdrop-blur-xl rounded-4xl p-8 border border-white/10 border-dashed flex flex-col items-center justify-center gap-4 text-center h-full min-h-80 transition-all duration-300 hover:bg-white/10 hover:border-white/30 group relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-5 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 relative z-10">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-semibold text-xl text-white mb-2">Start a new case</h3>
                  <p className="text-sm text-slate-400 max-w-50 mx-auto">Describe your legal issue and let AI guide you through the process.</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {cases.map((c) => (
            <motion.div 
              key={c._id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white/5 backdrop-blur-xl rounded-4xl p-8 border border-white/10 flex flex-col gap-6 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-white/10" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/5 text-xs font-medium text-white flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'Intake' ? 'bg-amber-400' : c.status === 'Resolved' ? 'bg-green-400' : 'bg-blue-400'}`} />
                    {c.status || "Intake"}
                  </div>
                </div>
                
                <h3 className="font-bold text-xl text-white line-clamp-2 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-white/70 transition-all">
                  {c.title || "Untitled Case"}
                </h3>
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  {c.category || "General"}
                </p>
              </div>
              
              <div className="mt-auto relative z-10">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Claim Amount</div>
                    <div className="text-2xl font-bold text-white">
                      {c.amounts?.[0] ? `${c.amounts[0].currency} ${c.amounts[0].value.toLocaleString()}` : "N/A"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(c.updatedAt || c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/20 hover:text-white -mr-2">
                    <Link href={`/app/cases/${c._id}`}>
                      View Details <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}