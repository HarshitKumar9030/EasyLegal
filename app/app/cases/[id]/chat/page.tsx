"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Bot, User, FileText } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { getEvidenceByCaseId } from "@/lib/indexedDB";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function CaseChat() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI legal assistant for this case. You can ask me questions about the facts, potential legal strategies, or ask me to draft documents like a demand letter or a complaint based on the case details.",
    },
  ]);

  const submitMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Include evidence metadata and extracted text in the request context
      const evidenceContext = evidence.length > 0 
        ? `\n\n[System Note: The user has the following evidence files in their vault:\n${evidence.map(e => `- ${e.name}${e.extractedText ? ` (Extracted content: ${e.extractedText.substring(0, 500)}...)` : ''}`).join("\n")}\nPlease refer to them if relevant.]`
        : "";

      const messagesToSend = [...nextMessages];
      if (evidenceContext) {
        messagesToSend[messagesToSend.length - 1] = {
          ...messagesToSend[messagesToSend.length - 1],
          content: messagesToSend[messagesToSend.length - 1].content + evidenceContext
        };
      }

      const response = await fetch(`/api/cases/${params.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
      });
      if (!response.ok || !response.body) throw new Error("Unable to reach the case assistant.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = crypto.randomUUID();
      setMessages((current) => [...current, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((current) => current.map((message) =>
          message.id === assistantId ? { ...message, content: assistantContent } : message
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I could not connect to the case assistant. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
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
            {caseData ? `Chat: ${caseData.title}` : "Loading..."}
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

      <main className="flex-1 flex flex-col w-full z-0">
        <div className="flex-1 bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((m) => (
              <div key={m.id} className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div 
                  className={`px-5 py-4 max-w-[85%] ${
                    m.role === "user" 
                      ? "bg-white text-black rounded-3xl rounded-tr-md" 
                      : "bg-white/10 border border-white/10 rounded-3xl rounded-tl-md text-white backdrop-blur-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                </div>
                {m.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-black" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-5 py-4 rounded-3xl bg-white/10 border border-white/10 rounded-tl-md flex items-center gap-2 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={submitMessage} className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about your case or request a document draft..."
                  className="flex-1 bg-white/10 border border-white/10 text-white placeholder:text-slate-400 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-full px-6 h-auto bg-white text-black hover:bg-slate-200">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
