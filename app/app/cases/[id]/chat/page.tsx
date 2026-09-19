"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Bot, FileText } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { Navigation } from "@/components/Navigation";
import { getEvidenceByCaseId } from "@/lib/indexedDB";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";

export default function CaseChat() {
  const params = useParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const evidenceContext = evidence.length > 0 
    ? evidence.map(e => `- ${e.name}${e.extractedText ? ` (Extracted content: ${e.extractedText.substring(0, 500)}...)` : ''}`).join("\n")
    : "";

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/cases/${params.id}/chat`,
      body: { evidenceContext },
    }),
    messages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Hello! I'm your AI legal assistant for this case. You can ask me questions about the facts, potential legal strategies, or ask me to draft documents like a demand letter or a complaint based on the case details.",
          },
        ],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = (event: any) => {
    event?.preventDefault?.();
    const trimmed = input.trim();

    if (!trimmed || isLoading) {
      return;
    }

    sendMessage({ text: trimmed });
    setInput("");
  };

  const getMessageText = (message: any) => {
    if (typeof message?.content === "string") {
      return message.content;
    }

    return message?.parts
      ?.filter((part: any) => part?.type === "text")
      .map((part: any) => part.text)
      .join("\n") ?? "";
  };

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/cases/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    const fetchEvidence = async () => {
      try {
        const data = await getEvidenceByCaseId(params.id as string);
        setEvidence(data);
      } catch (error) {
        console.error("Failed to load evidence:", error);
      }
    };

    fetchCase();
    fetchEvidence();
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[100dvh] flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <header className="px-6 py-4 flex items-center justify-between bg-white/5 backdrop-blur-2xl border-b border-white/10 z-10">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white hidden sm:flex">
            <Link href={`/app/cases/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Case
            </Link>
          </Button>
          <div className="font-medium text-sm text-slate-400">
            {caseData ? caseData.title : "Loading..."}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
            <Link href={`/app/cases/${params.id}/documents/new`}>
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Generate Document</span>
              <span className="sm:hidden">Doc</span>
            </Link>
          </Button>
          <Navigation caseId={params.id as string} />
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full z-0 relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const content = getMessageText(m);
                const isUserMessage = String((m as any)?.role ?? "") === "user";
                const isAssistantMessage = String((m as any)?.role ?? "") === "assistant";

                return (
                  <motion.div 
                    key={m.id} 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className={`flex gap-4 ${isUserMessage ? "justify-end" : "justify-start"}`}
                  >
                    {isAssistantMessage && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1 border border-white/10">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div 
                      className={`max-w-[85%] ${
                        isUserMessage 
                          ? "bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl rounded-tr-sm text-white border border-white/10" 
                          : "text-white/90"
                      }`}
                    >
                      {isUserMessage ? (
                        <div className="whitespace-pre-wrap text-base leading-relaxed">{content}</div>
                      ) : (
                        <div className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {isLoading && String(messages[messages.length - 1]?.role ?? "") === "user" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1 border border-white/10">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2 h-10">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-white/60" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-white/60" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-white/60" 
                  />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-2 shadow-2xl focus-within:ring-2 focus-within:ring-white/30 transition-all">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                placeholder="Ask about your case or request a document draft..."
                className="flex-1 bg-transparent text-white placeholder:text-slate-400 px-4 py-3 max-h-32 min-h-[52px] resize-none focus:outline-none text-base"
                disabled={isLoading}
                rows={1}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className="rounded-full w-12 h-12 shrink-0 bg-white text-black hover:bg-slate-200 p-0 flex items-center justify-center mb-0.5 mr-0.5 transition-transform active:scale-95"
              >
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </form>
            <div className="text-center mt-3 text-xs text-slate-500">
              AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
