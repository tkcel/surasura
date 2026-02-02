export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="surasura" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">surasura</span>
          </a>

          <a
            href="#download"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all hover:scale-[1.02] shadow-md shadow-primary-600/20"
          >
            ダウンロード
          </a>
        </div>
      </div>
    </header>
  );
}
