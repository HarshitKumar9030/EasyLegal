import { Loader2 } from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <ShaderBackground />
      <div className="z-10 flex items-center justify-center">
        <div className="p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
    </div>
  );
}
