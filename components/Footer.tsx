import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-semibold">{t("site.name")}</span>
        </div>
        <p className="text-sm text-muted-foreground">{t("footer.description")}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("footer.poweredBy")}
        </p>
      </div>
    </footer>
  );
}
