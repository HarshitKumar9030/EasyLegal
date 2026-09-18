export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-3xl pt-12 pb-8 z-10 mt-auto overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} EasyLegal. All rights reserved.
        </p>
        
        <a
          href="https://www.harshit.page"
          target="_blank"
          rel="noreferrer"
          className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden"
        >
          <span className="relative text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
            Made By Harshit
          </span>
          <span className="relative text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
            (www.harshit.page)
          </span>
        </a>
      </div>
    </footer>
  );
}
