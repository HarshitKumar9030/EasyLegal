"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, HelpCircle, MapPin, Users, IndianRupee, FileText, Scale, Shield, ArrowRight, FolderOpen, Loader2 } from "lucide-react";
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
      
      <header className="px-6 py-4 flex items-center justify-between bg-white/5 backdrop-blur-2xl border-b border-white/10 z-10">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white hidden sm:flex">
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
          <Navigation caseId={params.id as string} />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{caseData.title}</h1>
            <p className="text-lg text-slate-400 capitalize">{caseData.issue.replace(/_/g, " ")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">People</span>
              </div>
              <div className="space-y-1">
                {caseData.parties.map((p: any, i: number) => (
                  <div key={i} className="capitalize font-medium text-white">
                    {p.role}: {p.name || "Unknown"}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <IndianRupee className="w-4 h-4" />
                <span className="text-sm font-medium">Amount</span>
              </div>
              <div className="space-y-1">
                {caseData.amounts.map((a: any, i: number) => (
                  <div key={i} className="font-medium text-white">
                    {a.currency} {a.value.toLocaleString()}
                  </div>
                ))}
                {caseData.amounts.length === 0 && <div className="text-slate-400">None</div>}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <div className="font-medium text-white">
                {[caseData.jurisdiction.city, caseData.jurisdiction.state, caseData.jurisdiction.country].filter(Boolean).join(", ") || "Unknown"}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Known facts
              </h3>
              <ul className="space-y-3">
                {caseData.facts.map((fact: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-200">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Unknown
              </h3>
              <ul className="space-y-3">
                {caseData.openQuestions.map((q: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white text-black p-6 rounded-3xl">
            <h3 className="font-semibold mb-2">Next Step</h3>
            <p className="text-slate-700 text-sm mb-6">
              We need a bit more information to determine the best course of action.
            </p>
            <Button asChild variant="default" className="w-full bg-black text-white hover:bg-slate-800 rounded-xl">
              <Link href={`/app/cases/${params.id}/questions`}>
                Answer questions <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 font-medium text-white">Case Navigation</div>
            <div className="flex flex-col">
              <Link href={`/app/cases/${params.id}`} className="px-4 py-3 hover:bg-white/10 flex items-center gap-3 bg-white/10 text-white">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Fact Sheet</span>
              </Link>
              <Link href={`/app/cases/${params.id}/evidence`} className="px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <FolderOpen className="w-4 h-4" />
                <span>Evidence Vault</span>
              </Link>
              <Link href={`/app/cases/${params.id}/sources`} className="px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <Scale className="w-4 h-4" />
                <span>Legal Sources</span>
              </Link>
              <Link href={`/app/cases/${params.id}/chat`} className="px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <HelpCircle className="w-4 h-4" />
                <span>Chat with Case</span>
              </Link>
              <Link href={`/app/cases/${params.id}/escalation`} className="px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
                <span>Escalation Pathway</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}