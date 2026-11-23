import { Link, useLocation } from "react-router-dom";
import { Calculator, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (!doc.startViewTransition || shouldReduceMotion) {
      document.documentElement.classList.add("theme-transitioning");
      setTheme(nextTheme);
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 300);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    void transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 480,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  const navLinks = [
    { name: "Kalkulator", href: "/" },
    { name: "Cek Jangkauan", href: "/jangkauan" },
    { name: "Panduan", href: "/panduan" },
    { name: "Tentang", href: "/tentang" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <nav aria-label="Utama" className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-primary/10 p-2 rounded-lg">
            <Calculator className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Simulasi KPR</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`transition-colors hover:text-primary relative group py-1 ${
                    isActive ? "text-primary font-semibold" : ""
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 bg-primary transition-all ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleTheme}
                className="rounded-full relative overflow-hidden"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {resolvedTheme === "dark" ? (
                    <motion.span
                      key="sun"
                      initial={shouldReduceMotion ? false : { rotate: -90, scale: 0.6, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { rotate: 90, scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="inline-flex items-center justify-center"
                    >
                      <Sun className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={shouldReduceMotion ? false : { rotate: 90, scale: 0.6, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={
                        shouldReduceMotion ? undefined : { rotate: -90, scale: 0.6, opacity: 0 }
                      }
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="inline-flex items-center justify-center"
                    >
                      <Moon className="h-5 w-5 text-slate-700" aria-hidden="true" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="container py-6 flex flex-col gap-2">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.href;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-lg font-semibold py-2.5 transition-colors hover:text-primary block border-l-4 pl-4 rounded-r-lg ${
                        isActive
                          ? "border-primary text-primary bg-primary/5"
                          : "border-transparent hover:border-primary"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
