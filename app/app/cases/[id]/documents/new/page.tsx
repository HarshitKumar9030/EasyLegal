"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Download, Copy, Check } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

export default function DocumentEditor() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateDocument = async () => {
      try {
        const res = await fetch(`/api/cases/${params.id}/documents/generate`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          setDocument(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    generateDocument();
  }, [params.id]);

  const handleCopy = () => {
    if (document?.body) {
      navigator.clipboard.writeText(document.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-2xl z-10">
        <div className="flex items-center gap-4">
          <Navigation caseId={params.id as string} />
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white hidden sm:flex">
            <Link href={`/app/cases/${params.id}/escalation`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="font-medium">Review Document</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button size="sm" className="bg-white text-black hover:bg-slate-200 rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="font-medium text-white">{document?.title || "Draft Document"}</div>
              <div className="text-xs text-slate-400">Editable</div>
            </div>
            <textarea
              className="w-full min-h-[600px] p-8 focus:outline-none resize-y font-serif text-base leading-relaxed bg-transparent text-white placeholder:text-slate-500"
              defaultValue={document?.body}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
            <h3 className="font-semibold mb-4 text-white">Review before using</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-400 mb-2">Facts used</div>
                <ul className="space-y-2">
                  {document?.factsUsed?.map((fact: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {document?.missingInformation?.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm font-medium text-amber-400 mb-2">Missing information</div>
                  <ul className="space-y-2">
                    {document.missingInformation.map((info: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">!</div>
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-400 mt-2">
                    Please fill in the bracketed placeholders in the document before sending.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}