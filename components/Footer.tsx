import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border/20 py-10">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
          {t("site.name")} — {t("footer.description")}
        </p>
      </div>
    </footer>
  );
}
