import { Link } from "react-router-dom";
import { Calculator, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight">Simulasi KPR</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-wider text-muted-foreground mr-4">
            <Link to="/" className="transition-colors hover:text-primary">Kalkulator</Link>
            <Link to="/jangkauan" className="transition-colors hover:text-primary">Cek Jangkauan</Link>
            <Link to="/tentang-kpr" className="transition-colors hover:text-primary">Tentang KPR</Link>
            <Link to="/panduan" className="transition-colors hover:text-primary">Panduan</Link>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
