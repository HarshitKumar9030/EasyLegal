"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, Scale, Search } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

export default function LegalSources() {
  const params = useParams();
  const router = useRouter();
  const [sources, setSources] = useState<any[]>([]);
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const caseRes = await fetch(`/api/cases/${params.id}`);
        if (caseRes.ok) {
          const data = await caseRes.json();
          if (data.status === "Intake") {
            router.push(`/app/cases/${params.id}/questions`);
            return;
          }
          setCaseData(data);
        }

        const res = await fetch(`/api/cases/${params.id}/sources`);
        if (res.ok) {
          const data = await res.json();
          setSources(data.sources);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleResearch = async () => {
    setResearching(true);
    try {
      const res = await fetch(`/api/cases/${params.id}/sources`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setResearching(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <div className="pt-6 px-4 sm:px-6 flex justify-center z-50 relative">
        <header className="w-full max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full">
          <div className="flex items-center gap-4">
            <Navigation caseId={params.id as string} caseStatus={caseData?.status} />
            <Button asChild variant="ghost" size="sm" className="rounded-full text-white hover:bg-white/10 hover:text-white hidden sm:flex h-10 px-4">
              <Link href={`/app/cases/${params.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Case
              </Link>
            </Button>
            <div className="font-medium">Legal Sources</div>
          </div>
          <Button asChild size="sm" className="bg-white text-black hover:bg-slate-200 rounded-full h-10 px-4">
            <Link href={`/app/cases/${params.id}/escalation`}>
              <span className="hidden sm:inline">Next: Escalation</span>
              <span className="sm:hidden">Next</span>
              <ArrowRight className="w-4 h-4 sm:ml-2" />
            </Link>
          </Button>
        </header>
      </div>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Potentially relevant law</h1>
            <p className="text-slate-300">
              Authoritative sources that may apply to your situation.
            </p>
          </div>
          <Button 
            onClick={handleResearch} 
            disabled={researching}
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl"
          >
            {researching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Run AI Research
              </>
            )}
          </Button>
        </div>

        {sources.length === 0 && !researching ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-dashed border-white/20 p-12 flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-white/10 mb-4">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">No sources found yet</h3>
            <p className="text-slate-300 max-w-md mb-6">
              Run the AI research agent to search official government and legal databases for laws relevant to your case.
            </p>
            <Button onClick={handleResearch} size="lg" className="bg-white text-black hover:bg-slate-200 rounded-xl">
              <Search className="w-4 h-4 mr-2" />
              Start Research
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sources.map((source, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                          {source.authority}
                        </span>
                        <span className="text-xs text-slate-400">
                          {source.jurisdiction}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{source.title}</h3>
                      {source.provision && (
                        <div className="text-sm font-medium text-slate-400 mt-1">
                          {source.provision}
                        </div>
                      )}
                    </div>
                    {source.url && (
                      <Button asChild variant="ghost" size="sm" className="shrink-0 text-white hover:bg-white/10 hover:text-white rounded-xl">
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          View Source <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">What it says</h4>
                    <p className="text-sm leading-relaxed text-slate-200">{source.relevant_excerpt}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2 uppercase tracking-wider">Why it may matter</h4>
                    <p className="text-sm leading-relaxed text-slate-200">{source.relevance_explanation}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}