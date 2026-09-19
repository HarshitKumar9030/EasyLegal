"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlignRight, X, Home, Briefcase, MessageSquare, FileText, Scale, ShieldAlert, HelpCircle, FolderOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function Navigation({ caseId }: { caseId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = caseId ? [
    { href: `/app/cases/${caseId}`, label: "Overview", icon: Briefcase },
    { href: `/app/cases/${caseId}/chat`, label: "AI Assistant", icon: MessageSquare },
    { href: `/app/cases/${caseId}/questions`, label: "Intake Questions", icon: HelpCircle },
    { href: `/app/cases/${caseId}/evidence`, label: "Evidence Vault", icon: FolderOpen },
    { href: `/app/cases/${caseId}/sources`, label: "Legal Sources", icon: Scale },
    { href: `/app/cases/${caseId}/escalation`, label: "Escalation", icon: ShieldAlert },
    { href: `/app/cases/${caseId}/documents/new`, label: "Documents", icon: FileText },
  ] : [
    { href: "/app", label: "Dashboard", icon: Home },
  ];

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white"
      >
        <AlignRight className="w-5 h-5" />
      </Button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black z-[9998]"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed top-0 right-0 h-[100dvh] w-72 bg-[#0a0a0a] border-l border-white/10 z-[9999] flex flex-col shadow-2xl"
              >
                <div className="p-6 flex items-center justify-between border-b border-white/10">
                  <span className="font-semibold text-white tracking-tight">EasyLegal</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="rounded-full text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                          isActive 
                            ? "bg-white text-black font-medium" 
                            : "text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
                
                <div className="p-6 border-t border-white/10 space-y-2">
                  <Link 
                    href="/app"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Home className="w-5 h-5" />
                    Back to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
