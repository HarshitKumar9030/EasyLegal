"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, FileText, Image as ImageIcon, FileAudio, FileVideo, Trash2, Plus } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { saveEvidence, getEvidenceByCaseId, deleteEvidence } from "@/lib/indexedDB";

export default function EvidenceVault() {
  const params = useParams();
  const caseId = params.id as string;
  const [isDragging, setIsDragging] = useState(false);
  const [evidence, setEvidence] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEvidence();
  }, [caseId]);

  const loadEvidence = async () => {
    try {
      const data = await getEvidenceByCaseId(caseId);
      setEvidence(data);
    } catch (error) {
      console.error("Failed to load evidence:", error);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    return "document";
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newEvidence = {
        id: crypto.randomUUID(),
        caseId,
        name: file.name,
        type: getFileType(file.type),
        mimeType: file.type,
        size: formatBytes(file.size),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        file: file, // Store the actual File/Blob object
      };
      
      try {
        await saveEvidence(newEvidence);
      } catch (error) {
        console.error("Failed to save file:", error);
      }
    }
    
    loadEvidence();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvidence(id);
      loadEvidence();
    } catch (error) {
      console.error("Failed to delete evidence:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-8 h-8 text-blue-400" />;
      case "image": return <ImageIcon className="w-8 h-8 text-emerald-400" />;
      case "audio": return <FileAudio className="w-8 h-8 text-purple-400" />;
      case "video": return <FileVideo className="w-8 h-8 text-rose-400" />;
      default: return <FileText className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      <ShaderBackground />
      
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-2xl z-10">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white hidden sm:flex">
            <Link href={`/app/cases/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Case
            </Link>
          </Button>
          <div className="font-medium">Evidence Vault</div>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" className="bg-white text-black hover:bg-slate-200 rounded-xl" onClick={() => fileInputRef.current?.click()}>
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Upload Files</span>
            <span className="sm:hidden">Upload</span>
          </Button>
          <Navigation caseId={params.id as string} />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Evidence Vault</h1>
          <p className="text-slate-300">
            Securely store and manage all documents, photos, and files related to your case.
          </p>
        </div>

        <div 
          className={`mb-8 border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-colors ${
            isDragging ? "border-white bg-white/10" : "border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { 
            e.preventDefault(); 
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Drag & drop files here</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            Support for PDF, DOCX, JPG, PNG, MP3, and MP4 files up to 50MB each.
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            onChange={(e) => handleFiles(e.target.files)} 
          />
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
        </div>

        {evidence.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No evidence uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidence.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-start gap-4 group hover:bg-white/10 transition-colors"
              >
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate mb-1" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{item.date}</span>
                    <span>&bull;</span>
                    <span>{item.size}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(item.id)}
                  className="rounded-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
