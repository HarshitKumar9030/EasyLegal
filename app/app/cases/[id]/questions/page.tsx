"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

export default function ClarifyingQuestions() {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseRes, questionsRes] = await Promise.all([
          fetch(`/api/cases/${params.id}`),
          fetch(`/api/cases/${params.id}/questions`)
        ]);
        
        if (caseRes.ok) {
          setCaseData(await caseRes.json());
        }
        if (questionsRes.ok) {
          const data = await questionsRes.json();
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/cases/${params.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      
      if (res.ok) {
        router.push(`/app/cases/${params.id}/escalation`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <header className="px-6 py-4 flex items-center border-b border-white/10 bg-white/5 backdrop-blur-2xl z-10 gap-4">
        <Navigation caseId={params.id as string} caseStatus={caseData?.status} />
        <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white hidden sm:flex">
          <Link href={`/app/cases/${params.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case
          </Link>
        </Button>
        <div className="font-medium">Clarifying Questions</div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 py-12 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl space-y-8 bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">To understand your situation better</h1>
            <p className="text-slate-300">
              Please answer these questions to help us determine the best next steps.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((q, i) => (
              <div key={i} className="space-y-3">
                <label className="font-medium text-lg block text-white">
                  {i + 1}. {q}
                </label>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                  className="w-full min-h-[100px] p-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none transition-all"
                  placeholder="Your answer..."
                />
              </div>
            ))}

            <div className="flex justify-end pt-4 border-t border-white/10">
              <Button 
                type="submit" 
                size="lg" 
                disabled={submitting}
                className="w-full sm:w-auto bg-white text-black hover:bg-slate-200 rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Submit Answers"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}