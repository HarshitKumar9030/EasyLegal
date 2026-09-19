"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, FileText, ShieldAlert } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

export default function EscalationPathway() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/cases/${params.id}/escalation`);
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
  }, [params.id]);

  if (loading) {
    return <PageLoader />;
  }

  const steps = caseData?.escalationPlan || [];
  const currentStage = caseData?.escalationStage || 1;

  const handleMarkCompleted = async (stage: number) => {
    try {
      const res = await fetch(`/api/cases/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escalationStage: stage + 1 }),
      });
      if (res.ok) {
        const updatedCase = await res.json();
        setCaseData(updatedCase);
      }
    } catch (error) {
      console.error("Failed to update escalation stage:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <header className="px-6 py-4 flex items-center border-b border-white/10 bg-white/5 backdrop-blur-2xl z-10 gap-4">
        <Navigation caseId={params.id as string} />
        <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white hidden sm:flex">
          <Link href={`/app/cases/${params.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case
          </Link>
        </Button>
        <div className="font-medium">Escalation Pathway</div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">What to do next</h1>
          <p className="text-slate-300">
            A step-by-step guide based on your specific situation and relevant laws.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step: any, index: number) => {
            const isCompleted = step.stage < currentStage;
            const isCurrent = step.stage === currentStage;
            const isFuture = step.stage > currentStage;

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-3xl border backdrop-blur-xl ${
                  isCurrent ? "bg-white/10 border-white shadow-sm" : 
                  isCompleted ? "bg-white/5 border-white/10" : 
                  "bg-white/5 border-white/10 opacity-70"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="text-sm font-medium text-slate-400 mb-1">
                        Step {step.stage}
                      </div>
                      <h3 className={`text-xl font-semibold ${isCompleted ? "line-through text-slate-500" : "text-white"}`}>
                        {step.action}
                      </h3>
                    </div>

                    {isCurrent && (
                      <div className="space-y-6 pt-4 border-t border-white/10">
                        <div>
                          <h4 className="font-medium mb-2 text-white">Purpose</h4>
                          <p className="text-slate-300">{step.purpose}</p>
                        </div>

                        {step.evidenceRequired?.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-white">Before proceeding</h4>
                            <ul className="space-y-2">
                              {step.evidenceRequired.map((ev: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                  {ev}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.action.toLowerCase().includes("demand") || step.action.toLowerCase().includes("notice") ? (
                          <div className="pt-4 flex gap-4">
                            <Button asChild size="lg" className="bg-white text-black hover:bg-slate-200 rounded-xl">
                              <Link href={`/app/cases/${params.id}/documents/new`}>
                                <FileText className="w-4 h-4 mr-2" />
                                Generate Document
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl"
                              onClick={() => handleMarkCompleted(step.stage)}
                            >
                              Mark as completed
                            </Button>
                          </div>
                        ) : (
                          <div className="pt-4">
                            <Button 
                              variant="outline" 
                              className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl"
                              onClick={() => handleMarkCompleted(step.stage)}
                            >
                              Mark as completed
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}