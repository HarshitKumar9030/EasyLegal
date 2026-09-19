"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Download, Copy, Check, Sparkles, Wand2 } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useSession } from "next-auth/react";
import { getEvidenceByCaseId } from "@/lib/indexedDB";

export default function DocumentEditor() {
  const { status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<any>(null);
  const [documentBody, setDocumentBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const generateDocument = async () => {
      try {
        // Fetch evidence to include in context
        const evidence = await getEvidenceByCaseId(params.id as string);
        const evidenceContext = evidence.length > 0 
          ? `The user has the following evidence files:\n${evidence.map(e => `- ${e.name}${e.extractedText ? ` (Extracted content: ${e.extractedText.substring(0, 1000)}...)` : ''}`).join("\n")}`
          : "";

        const res = await fetch(`/api/cases/${params.id}/documents/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ evidenceContext }),
        });
        if (res.ok) {
          const data = await res.json();
          setDocument(data);
          setDocumentBody(data.body || "");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    generateDocument();
  }, [params.id, status]);

  const handleCopy = () => {
    if (documentBody) {
      navigator.clipboard.writeText(documentBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAiFormat = () => {
    if (!aiPrompt.trim() || isFormatting) return;
    
    setIsFormatting(true);
    
    // Simulate AI formatting delay
    setTimeout(() => {
      setDocumentBody((prev) => prev + `\n\n> **AI Note:** Formatted based on prompt: "${aiPrompt}"\n\n`);
      setIsFormatting(false);
      setAiPrompt("");
    }, 2500);
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
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* AI Formatting Agent Bar */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2 flex items-center gap-2 shadow-sm">
            <Sparkles className="w-5 h-5 text-purple-400 ml-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Ask AI to format or rewrite (e.g., 'Make it more professional')" 
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-slate-500 px-2"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiFormat()}
            />
            <Button 
              size="sm" 
              onClick={handleAiFormat} 
              disabled={isFormatting || !aiPrompt.trim()} 
              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-xl shrink-0"
            >
              {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              {isFormatting ? "Formatting..." : "Format"}
            </Button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-sm relative flex-1 flex flex-col">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
              <div className="font-medium text-white">{document?.title || "Draft Document"}</div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="text-xs h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                >
                  {isEditing ? "Preview Markdown" : "Edit Raw Text"}
                </Button>
              </div>
            </div>
            
            <div className="relative flex-1 min-h-[600px]">
              <AnimatePresence>
                {isFormatting && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-16 h-16">
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-t-2 border-purple-500"
                        />
                        <Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }} 
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-purple-300 font-medium text-sm"
                      >
                        AI is formatting your document...
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isEditing ? (
                <textarea
                  className="w-full h-full absolute inset-0 p-8 focus:outline-none resize-none font-mono text-sm leading-relaxed bg-transparent text-white placeholder:text-slate-500"
                  value={documentBody}
                  onChange={(e) => setDocumentBody(e.target.value)}
                  placeholder="Start typing your document here..."
                />
              ) : (
                <div className="p-8 h-full overflow-y-auto prose prose-invert prose-slate max-w-none font-serif prose-p:leading-relaxed prose-headings:text-white prose-a:text-blue-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {documentBody || "*No content yet.*"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
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