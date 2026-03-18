"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";

const LANGUAGES = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const switchTo = (newLocale: string) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === locale);

  return (
    <header className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between" dir="ltr">
        {/* Language selector */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>{currentLang?.flag} {currentLang?.label}</span>
          </button>

          {open && (
            <div className="absolute top-full mt-2 left-0 bg-card border border-border/50 rounded-xl overflow-hidden shadow-lg min-w-[140px]">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchTo(lang.code)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                    locale === lang.code
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logo */}
        <a href={`/${locale}`} className="flex items-center gap-2.5 group">
          <span className="font-sans font-bold tracking-tight" style={{ fontSize: "20px" }}>{t("site.name")}</span>
          <AnimatedLogo size={26} className="text-primary group-hover:text-accent" />
        </a>
      </div>
    </header>
  );
}
