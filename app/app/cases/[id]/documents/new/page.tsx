"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Download, Copy, Check, Wand2 } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useSession } from "next-auth/react";
import { getEvidenceByCaseId } from "@/lib/indexedDB";
import Editor from "@monaco-editor/react";

export default function DocumentEditor() {
  const { status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<any>(null);
  const [caseData, setCaseData] = useState<any>(null);
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
    const loadOrGenerateDocument = async () => {
      try {
        // First check if document already exists
        const caseRes = await fetch(`/api/cases/${params.id}`);
        if (caseRes.ok) {
          const data = await caseRes.json();
          if (data.status === "Intake") {
            router.push(`/app/cases/${params.id}/questions`);
            return;
          }
          setCaseData(data);
          if (data.documents && data.documents.length > 0) {
            const existingDoc = data.documents[data.documents.length - 1];
            setDocument(existingDoc);
            setDocumentBody(existingDoc.body || "");
            setLoading(false);
            return;
          }
        }

        // If no document exists, generate one
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
    loadOrGenerateDocument();
  }, [params.id, status]);

  const handleCopy = () => {
    if (documentBody) {
      navigator.clipboard.writeText(documentBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAiFormat = async () => {
    if (!aiPrompt.trim() || isFormatting) return;
    
    setIsFormatting(true);
    
    try {
      const res = await fetch(`/api/cases/${params.id}/documents/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          documentBody,
          prompt: aiPrompt 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.updatedBody) {
          setDocumentBody(data.updatedBody);
          setAiPrompt("");
        }
      }
    } catch (error) {
      console.error("Failed to format document:", error);
    } finally {
      setIsFormatting(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
    <div className="h-[100dvh] flex flex-col relative overflow-hidden bg-black text-white print:h-auto print:overflow-visible">
      <ShaderBackground />
      
      <div className="pt-6 px-4 sm:px-6 flex justify-center z-50 relative shrink-0 print:hidden">
        <header className="w-full max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full">
          <div className="flex items-center gap-4">
            <Navigation caseId={params.id as string} caseStatus={caseData?.status} />
            <Button asChild variant="ghost" size="sm" className="rounded-full text-white hover:bg-white/10 hover:text-white hidden sm:flex h-10 px-4">
              <Link href={`/app/cases/${params.id}/escalation`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="font-medium">Review Document</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full h-10 px-4">
              {copied ? <Check className="w-4 h-4 sm:mr-2" /> : <Copy className="w-4 h-4 sm:mr-2" />}
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-white text-black hover:bg-slate-200 rounded-full h-10 px-4">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </header>
      </div>

      <main className="flex-1 flex flex-col w-full z-0 relative overflow-hidden print:overflow-visible">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 print:p-0 print:overflow-visible">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* AI Formatting Agent Bar */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2 flex items-center gap-2 shadow-sm print:hidden">
              <Wand2 className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
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
                className="bg-white text-black hover:bg-slate-200 rounded-xl shrink-0"
              >
                {isFormatting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isFormatting ? "Formatting..." : "Format"}
              </Button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-sm relative flex flex-col print:border-none print:bg-white print:text-black print:rounded-none print:shadow-none min-h-[600px] print:overflow-visible">
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0 print:hidden">
                <div className="font-medium text-white">{document?.title || "Draft Document"}</div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="text-xs h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    {isEditing ? "Preview Document" : "Edit Raw HTML"}
                  </Button>
                </div>
              </div>
              
              <div className="relative flex-1">
                <AnimatePresence>
                  {isFormatting && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] flex items-center justify-center print:hidden"
                    >
                      <div className="flex items-center gap-3 bg-black/80 px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                        <span className="text-white font-medium text-sm ml-2">AI is editing...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isEditing ? (
                  <div className="absolute inset-0 print:hidden">
                    <Editor
                      height="100%"
                      defaultLanguage="html"
                      theme="vs-dark"
                      value={documentBody}
                      onChange={(value) => setDocumentBody(value || "")}
                      options={{
                        minimap: { enabled: false },
                        wordWrap: "on",
                        padding: { top: 16, bottom: 16 },
                        fontSize: 14,
                        lineHeight: 24,
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        formatOnPaste: true,
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-8 md:p-12 h-full bg-white text-black print:p-0 print:h-auto">
                    <div 
                      className="max-w-3xl mx-auto font-serif text-[15px] leading-[1.8] text-justify"
                      style={{ fontFamily: "'Times New Roman', Times, serif" }}
                      dangerouslySetInnerHTML={{ __html: documentBody || "<em>No content yet.</em>" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 print:hidden">
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                <h3 className="font-semibold mb-4 text-white">Review before using</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <div>
                      <div className="text-sm font-medium text-amber-400 mb-2">Missing information</div>
                      <ul className="space-y-2">
                        {document.missingInformation.map((info: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">!</div>
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-400 mt-4">
                        Please fill in the bracketed placeholders in the document before sending.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}