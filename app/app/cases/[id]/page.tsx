"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, HelpCircle, MapPin, Users, Coins, FileText, Scale, Shield, ArrowRight, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useSession } from "next-auth/react";

export default function CaseOverview() {
  const { status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/cases/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [params.id, status]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cases/${params.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        router.push("/app");
      } else {
        console.error("Failed to delete case");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (loading) {
    return <PageLoader />;
  }

  if (!caseData) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Case not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <div className="pt-6 px-4 sm:px-6 flex justify-center z-50 relative">
        <header className="w-full max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-white hover:bg-white/10 hover:text-white hidden sm:flex h-10 px-4">
              <Link href="/app">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="font-medium text-sm text-slate-400">
              {caseData.category.toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 h-10 w-10 p-0 flex items-center justify-center"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
            <Navigation caseId={params.id as string} caseStatus={caseData?.status} />
          </div>
        </header>
      </div>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{caseData.title}</h1>
            <p className="text-lg text-slate-400 capitalize">{caseData.issue.replace(/_/g, " ")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 text-slate-400 mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium uppercase tracking-wider">People</span>
              </div>
              <div className="space-y-2">
                {caseData.parties.map((p: any, i: number) => (
                  <div key={i} className="capitalize font-medium text-white text-lg">
                    <span className="text-slate-400 text-sm block mb-0.5">{p.role}</span>
                    {p.name || "Unknown"}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 text-slate-400 mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium uppercase tracking-wider">Amount</span>
              </div>
              <div className="space-y-2">
                {caseData.amounts.map((a: any, i: number) => (
                  <div key={i} className="font-medium text-white text-lg">
                    {a.currency} {a.value.toLocaleString()}
                  </div>
                ))}
                {caseData.amounts.length === 0 && <div className="text-slate-400 text-lg">None</div>}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 text-slate-400 mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium uppercase tracking-wider">Location</span>
              </div>
              <div className="font-medium text-white text-lg leading-tight">
                {[caseData.jurisdiction.city, caseData.jurisdiction.state, caseData.jurisdiction.country].filter(Boolean).join(", ") || "Unknown"}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
              <h3 className="text-xl font-medium mb-6 flex items-center gap-3 text-white">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                Known facts
              </h3>
              {caseData.facts.length > 0 ? (
                <ul className="space-y-4">
                  {caseData.facts.map((fact: string, i: number) => (
                    <li key={i} className="flex items-start gap-4 text-slate-300 leading-relaxed">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
                      <span className="text-base">{fact}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-500 italic">No facts extracted yet.</div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
              <h3 className="text-xl font-medium mb-6 flex items-center gap-3 text-white">
                <div className="p-2 bg-white/10 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                Missing Information
              </h3>
              {caseData.openQuestions.length > 0 ? (
                <ul className="space-y-4">
                  {caseData.openQuestions.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-4 text-slate-400 leading-relaxed">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                      <span className="text-base">{q}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-500 italic">No missing information identified.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white text-black p-8 rounded-[2rem] shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Next Step</h3>
            <p className="text-slate-600 text-base mb-8 leading-relaxed">
              We need a bit more information to determine the best course of action for your case.
            </p>
            <Button asChild variant="default" size="lg" className="w-full bg-black text-white hover:bg-slate-800 rounded-xl text-base h-14">
              <Link href={`/app/cases/${params.id}/questions`}>
                Answer questions <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 font-medium text-white text-lg flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              Case Navigation
            </div>
            <div className="flex flex-col p-2">
              <Link href={`/app/cases/${params.id}`} className="px-4 py-4 rounded-xl hover:bg-white/10 flex items-center gap-4 bg-white/10 text-white mb-1 transition-colors">
                <FileText className="w-5 h-5" />
                <span className="font-medium text-base">Fact Sheet</span>
              </Link>
              <Link href={`/app/cases/${params.id}/evidence`} className="px-4 py-4 rounded-xl hover:bg-white/10 flex items-center gap-4 text-slate-400 hover:text-white mb-1 transition-colors">
                <FolderOpen className="w-5 h-5" />
                <span className="text-base">Evidence Vault</span>
              </Link>
              <Link href={`/app/cases/${params.id}/sources`} className="px-4 py-4 rounded-xl hover:bg-white/10 flex items-center gap-4 text-slate-400 hover:text-white mb-1 transition-colors">
                <Scale className="w-5 h-5" />
                <span className="text-base">Legal Sources</span>
              </Link>
              <Link href={`/app/cases/${params.id}/chat`} className="px-4 py-4 rounded-xl hover:bg-white/10 flex items-center gap-4 text-slate-400 hover:text-white mb-1 transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span className="text-base">Chat with Case</span>
              </Link>
              <Link href={`/app/cases/${params.id}/escalation`} className="px-4 py-4 rounded-xl hover:bg-white/10 flex items-center gap-4 text-slate-400 hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
                <span className="text-base">Escalation Pathway</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}