"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import AnimatedLogo from "./AnimatedLogo";

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href={`/${locale}`} className="flex items-center gap-2.5 group">
          <AnimatedLogo size={28} className="text-primary group-hover:text-accent" />
          <span className="text-lg font-semibold tracking-tight">{t("site.name")}</span>
        </a>

        <button
          onClick={switchLocale}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("nav.switchLang")}
        </button>
      </div>
    </header>
  );
}
