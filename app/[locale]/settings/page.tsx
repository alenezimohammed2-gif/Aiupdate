"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  MODEL_OPTIONS,
  IMAGE_MODEL_OPTIONS,
  DEFAULT_SETTINGS,
  ModelOption,
  ImageModelOption,
} from "@/lib/settings-types";
import {
  Settings,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  FlaskConical,
  Cpu,
  Save,
  Lock,
  History,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

const DEFAULT_INSTRUCTIONS_INCLUDE = `1. New AI model releases and major version updates (LLMs, image generation, video generation, audio, multimodal models)
2. Significant improvements or fine-tuned versions of existing models (e.g., new GPT, Claude, Gemini, Llama, Mistral releases)
3. New AI tools and platforms that have gained significant traction or solve real problems
4. AI agents, autonomous systems, and new agent frameworks (e.g., AutoGen, CrewAI, LangGraph)
5. Benchmark results, model comparisons, and performance evaluations
6. Major deals, investments, partnerships, and acquisitions in the AI industry
7. Important research papers, breakthroughs, and scientific discoveries in AI
8. New AI APIs, SDKs, and developer tools from major companies
9. Open-source AI model releases and community-driven projects
10. AI hardware announcements (GPUs, TPUs, custom AI chips) that impact model training or inference`;

const DEFAULT_INSTRUCTIONS_EXCLUDE = `1. Pure opinion pieces, editorials, and personal commentary without new factual information
2. Marketing and promotional content disguised as news
3. General programming tutorials and how-to guides not specific to new AI developments
4. Non-AI technology news (smartphones, gaming, social media drama, general tech reviews)
5. Stock market analysis, financial speculation, and investment advice
6. Repetitive coverage of the same story from multiple sources (keep only the most detailed version)
7. AI ethics debates and policy discussions without concrete new developments
8. Job postings, career advice, and hiring announcements
9. Event announcements and conference schedules without substantive content
10. Clickbait articles with misleading titles that don't deliver meaningful AI news`;

export default function SettingsPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // State
  const [selectedModel, setSelectedModel] = useState<ModelOption>(
    DEFAULT_SETTINGS.selected_model
  );
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModelOption>(
    DEFAULT_SETTINGS.selected_image_model
  );
  const [instructionsInclude, setInstructionsInclude] = useState(DEFAULT_INSTRUCTIONS_INCLUDE);
  const [instructionsExclude, setInstructionsExclude] = useState(DEFAULT_INSTRUCTIONS_EXCLUDE);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Login handler
  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setAuthError(isArabic ? "كلمة السر غير صحيحة" : "Incorrect password");
      }
    } catch {
      setAuthError(isArabic ? "خطأ في الاتصال" : "Connection error");
    }
    setAuthLoading(false);
  };

  // Connection test state - news model
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [connectionMessage, setConnectionMessage] = useState("");
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);

  // Connection test state - image model
  const [imgConnectionStatus, setImgConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [imgConnectionMessage, setImgConnectionMessage] = useState("");
  const [imgConnectionLatency, setImgConnectionLatency] = useState<number | null>(null);

  // Instructions test state
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "done"
  >("idle");
  const [testResult, setTestResult] = useState<{
    isRealArticles: boolean;
    articles: Array<{ idx: number; title: string; description: string; source: string }>;
    accepted: Array<{ idx: number; reason: string }>;
    rejected: Array<{ idx: number; reason: string }>;
    raw?: string;
    structured: boolean;
  } | null>(null);

  // Manual fetch state
  const [fetchStatus, setFetchStatus] = useState<
    "idle" | "fetching" | "success" | "error"
  >("idle");
  const [fetchResult, setFetchResult] = useState<{
    fetched: number;
    new: number;
    processed: number;
    imagesFromSource?: number;
    imagesFromAI?: number;
    duration_ms: number;
    message?: string;
  } | null>(null);

  // Cron logs state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cronLogs, setCronLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Load settings on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.selected_model) setSelectedModel(data.selected_model);
        if (data.selected_image_model) setSelectedImageModel(data.selected_image_model);
        if (data.custom_instructions_include)
          setInstructionsInclude(data.custom_instructions_include);
        if (data.custom_instructions_exclude)
          setInstructionsExclude(data.custom_instructions_exclude);
      })
      .catch(() => {});
  }, []);

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selected_model: selectedModel,
          selected_image_model: selectedImageModel,
          keywords: [],
          custom_instructions_include: instructionsInclude,
          custom_instructions_exclude: instructionsExclude,
        }),
      });
      if (res.ok) {
        setSaveMessage(isArabic ? "تم الحفظ بنجاح" : "Settings saved");
      } else {
        setSaveMessage(isArabic ? "فشل الحفظ" : "Save failed");
      }
    } catch {
      setSaveMessage(isArabic ? "خطأ في الاتصال" : "Connection error");
    }
    setSaving(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  // Test connection
  const testConnection = async () => {
    setConnectionStatus("testing");
    setConnectionMessage("");
    setConnectionLatency(null);
    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel }),
      });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus("success");
        setConnectionLatency(data.latency_ms);
        setConnectionMessage(
          isArabic
            ? `الاتصال ناجح (${data.latency_ms}ms)`
            : data.message
        );
      } else {
        setConnectionStatus("error");
        setConnectionMessage(data.message);
      }
    } catch {
      setConnectionStatus("error");
      setConnectionMessage(
        isArabic ? "فشل الاتصال بالسيرفر" : "Server connection failed"
      );
    }
  };

  // Test image model connection
  const testImageConnection = async () => {
    setImgConnectionStatus("testing");
    setImgConnectionMessage("");
    setImgConnectionLatency(null);
    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedImageModel }),
      });
      const data = await res.json();
      if (data.success) {
        setImgConnectionStatus("success");
        setImgConnectionLatency(data.latency_ms);
        setImgConnectionMessage(
          isArabic
            ? `الاتصال ناجح (${data.latency_ms}ms)`
            : data.message
        );
      } else {
        setImgConnectionStatus("error");
        setImgConnectionMessage(data.message);
      }
    } catch {
      setImgConnectionStatus("error");
      setImgConnectionMessage(
        isArabic ? "فشل الاتصال بالسيرفر" : "Server connection failed"
      );
    }
  };

  // Test instructions
  const testInstructions = async () => {
    setTestStatus("testing");
    setTestResult(null);
    try {
      const res = await fetch("/api/test-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          instructions_include: instructionsInclude,
          instructions_exclude: instructionsExclude,
          keywords: [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.structured) {
          setTestResult({
            isRealArticles: data.isRealArticles,
            articles: data.articles,
            accepted: data.accepted,
            rejected: data.rejected,
            structured: true,
          });
        } else {
          setTestResult({
            isRealArticles: data.isRealArticles,
            articles: data.articles,
            accepted: [],
            rejected: [],
            raw: data.result,
            structured: false,
          });
        }
      }
    } catch {
      setTestResult(null);
    }
    setTestStatus("done");
  };

  // Load cron logs
  const loadCronLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/cron-logs");
      const data = await res.json();
      setCronLogs(data.logs || []);
    } catch {
      setCronLogs([]);
    }
    setLogsLoading(false);
  };

  // Manual fetch news
  const fetchNewsNow = async () => {
    setFetchStatus("fetching");
    setFetchResult(null);
    try {
      const res = await fetch("/api/fetch-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.success) {
        setFetchStatus("success");
        setFetchResult(data.stats || null);
      } else {
        setFetchStatus("error");
        setFetchResult(null);
      }
    } catch {
      setFetchStatus("error");
      setFetchResult(null);
    }
  };

  const modelInfo = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm p-6 border border-border rounded-lg bg-card">
          <div className="text-center mb-6">
            <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
            <h1 className="text-xl font-bold">
              {isArabic ? "لوحة التحكم" : "Admin Panel"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? "أدخل كلمة السر للوصول" : "Enter password to access"}
            </p>
          </div>

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder={isArabic ? "كلمة السر..." : "Password..."}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:border-primary mb-3"
            autoFocus
          />

          {authError && (
            <p className="text-sm text-red-500 mb-3">{authError}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={authLoading || !passwordInput}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isArabic ? "دخول" : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 pt-24 pb-10 w-full">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          {isArabic ? "الإعدادات" : "Settings"}
        </h1>

        <div className="space-y-6">
          {/* Section 1: Model Selection */}
          <section className="border border-border/30 rounded-2xl p-5 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              {isArabic ? "نموذج معالجة الأخبار" : "News Processing Model"}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {isArabic
                ? "النموذج المستخدم لفلترة وتصنيف وتلخيص وترجمة الأخبار."
                : "Model used to filter, classify, summarize, and translate news."}
            </p>

            <div className="space-y-3">
              {MODEL_OPTIONS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModel === model.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={() => setSelectedModel(model.id)}
                    className="accent-primary"
                  />
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {model.provider} — {model.id}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={testConnection}
              disabled={connectionStatus === "testing"}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {connectionStatus === "testing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              {isArabic ? "فحص نماذج معالجة الأخبار" : "Test News Model"}
            </button>

            {connectionMessage && (
              <div
                className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
                  connectionStatus === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}
              >
                {connectionStatus === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {connectionMessage}
                {connectionLatency && (
                  <span className="ms-auto text-xs opacity-70">
                    {connectionLatency}ms
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Section 1b: Image Model Selection */}
          <section className="border border-border/30 rounded-2xl p-5 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              {isArabic ? "نموذج توليد صور المقالات" : "Article Image Generation Model"}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {isArabic
                ? "النموذج المستخدم لتوليد صور للمقالات التي لا تحتوي على صور من المصدر."
                : "Model used to generate images for articles without source images."}
            </p>

            <div className="space-y-3">
              {IMAGE_MODEL_OPTIONS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedImageModel === model.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="imageModel"
                    value={model.id}
                    checked={selectedImageModel === model.id}
                    onChange={() => setSelectedImageModel(model.id as ImageModelOption)}
                    className="accent-primary"
                  />
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {model.provider} — {model.id}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={testImageConnection}
              disabled={imgConnectionStatus === "testing"}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {imgConnectionStatus === "testing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              {isArabic ? "فحص نموذج توليد الصور" : "Test Image Model"}
            </button>

            {imgConnectionMessage && (
              <div
                className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
                  imgConnectionStatus === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}
              >
                {imgConnectionStatus === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {imgConnectionMessage}
                {imgConnectionLatency && (
                  <span className="ms-auto text-xs opacity-70">
                    {imgConnectionLatency}ms
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Section 3: Custom Instructions */}
          <section className="border border-border/30 rounded-2xl p-5 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {isArabic ? "إرشادات النموذج" : "Model Instructions"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {isArabic
                ? "حدّد بدقة نوع الأخبار التي تريد جلبها واستبعادها. النموذج سيقرأ كل خبر ويقرر بناءً على هذه الإرشادات."
                : "Define precisely what news to include and exclude. The AI model reads each article and decides based on these instructions."}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-green-400">
                  {isArabic
                    ? "✅ الأخبار المطلوب جلبها (تضمين)"
                    : "✅ News to Include"}
                </label>
                <textarea
                  value={instructionsInclude}
                  onChange={(e) => setInstructionsInclude(e.target.value)}
                  rows={8}
                  dir="ltr"
                  className="w-full px-3 py-2 border border-green-500/20 rounded-lg bg-green-500/5 text-sm text-foreground focus:outline-none focus:border-green-500/50 resize-vertical font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-red-400">
                  {isArabic
                    ? "❌ الأخبار المطلوب استبعادها (استثناء)"
                    : "❌ News to Exclude"}
                </label>
                <textarea
                  value={instructionsExclude}
                  onChange={(e) => setInstructionsExclude(e.target.value)}
                  rows={8}
                  dir="ltr"
                  className="w-full px-3 py-2 border border-red-500/20 rounded-lg bg-red-500/5 text-sm text-foreground focus:outline-none focus:border-red-500/50 resize-vertical font-mono"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Test Instructions */}
          <section className="border border-border/30 rounded-2xl p-5 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              {isArabic ? "اختبار الإرشادات" : "Test Instructions"}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {isArabic
                ? "اختبر إرشاداتك على مقالات حقيقية من مصادر RSS لترى كيف يفلتر النموذج الأخبار الفعلية."
                : "Test your instructions on real articles from RSS feeds to see how the model filters actual news."}
            </p>

            <button
              onClick={testInstructions}
              disabled={testStatus === "testing"}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {testStatus === "testing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FlaskConical className="w-4 h-4" />
              )}
              {isArabic ? "تشغيل الاختبار" : "Run Test"}
            </button>

            {testResult && (
              <div className="mt-4 space-y-3">
                {/* Real vs Sample badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    testResult.isRealArticles
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {testResult.isRealArticles
                    ? isArabic
                      ? "مقالات حقيقية من RSS"
                      : "Real RSS articles"
                    : isArabic
                      ? "مقالات تجريبية"
                      : "Sample articles"}
                </div>

                {/* Summary */}
                {testResult.structured && (
                  <div className="text-sm text-muted-foreground">
                    {isArabic
                      ? `تم قبول ${testResult.accepted.length} من ${testResult.articles.length} مقال`
                      : `${testResult.accepted.length} of ${testResult.articles.length} articles accepted`}
                  </div>
                )}

                {!testResult.structured && testResult.raw ? (
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto p-4 bg-muted rounded-lg" dir="ltr">
                    {testResult.raw}
                  </pre>
                ) : (
                  <>
                    {/* Accepted articles */}
                    {testResult.accepted.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-2">
                          {isArabic ? "مقبول" : "Accepted"} ({testResult.accepted.length})
                        </h4>
                        <div className="space-y-2">
                          {testResult.accepted.map((item) => {
                            const article = testResult.articles.find(
                              (a) => a.idx === item.idx
                            );
                            return (
                              <div
                                key={item.idx}
                                className="p-3 rounded-lg border border-green-500/20 bg-green-500/5"
                              >
                                <div className="text-sm font-medium" dir="ltr">
                                  {article?.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1" dir="ltr">
                                  {article?.source} — {item.reason}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Rejected articles */}
                    {testResult.rejected.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-400 mb-2">
                          {isArabic ? "مرفوض" : "Rejected"} ({testResult.rejected.length})
                        </h4>
                        <div className="space-y-2">
                          {testResult.rejected.map((item) => {
                            const article = testResult.articles.find(
                              (a) => a.idx === item.idx
                            );
                            return (
                              <div
                                key={item.idx}
                                className="p-3 rounded-lg border border-red-500/20 bg-red-500/5"
                              >
                                <div className="text-sm font-medium" dir="ltr">
                                  {article?.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1" dir="ltr">
                                  {article?.source} — {item.reason}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          {/* Section 5: Manual Fetch */}
          <section className="border border-border/30 rounded-2xl p-5 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              {isArabic ? "تحديث الأخبار" : "Fetch News"}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {isArabic
                ? "جلب الأخبار من المصادر وفلترتها وترجمتها يدوياً. يتم أيضاً تحديث تلقائي يومياً."
                : "Manually fetch, filter, and translate news from RSS sources. Also runs automatically once daily."}
            </p>

            <button
              onClick={fetchNewsNow}
              disabled={fetchStatus === "fetching"}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {fetchStatus === "fetching" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {fetchStatus === "fetching"
                ? isArabic ? "جاري التحديث..." : "Fetching..."
                : isArabic ? "تحديث الأخبار الآن" : "Fetch News Now"}
            </button>

            {fetchStatus === "success" && fetchResult && (
              <div className="mt-4 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">
                    {isArabic ? "تم التحديث بنجاح" : "Update successful"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "جلب:" : "Fetched:"}</span>
                    <span className="font-medium ms-1">{fetchResult.fetched}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "جديد:" : "New:"}</span>
                    <span className="font-medium ms-1">{fetchResult.new}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "معالج:" : "Processed:"}</span>
                    <span className="font-medium ms-1">{fetchResult.processed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "صور مصدر:" : "Source img:"}</span>
                    <span className="font-medium ms-1">{fetchResult.imagesFromSource ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "صور AI:" : "AI img:"}</span>
                    <span className="font-medium ms-1">{fetchResult.imagesFromAI ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? "المدة:" : "Duration:"}</span>
                    <span className="font-medium ms-1">{(fetchResult.duration_ms / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}

            {fetchStatus === "success" && !fetchResult && (
              <div className="mt-4 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <span className="text-sm text-yellow-400">
                  {isArabic ? "لا توجد أخبار جديدة للمعالجة" : "No new articles to process"}
                </span>
              </div>
            )}

            {fetchStatus === "error" && (
              <div className="mt-4 p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <span className="text-sm text-red-400">
                  {isArabic ? "فشل التحديث — تحقق من الاتصال" : "Update failed — check connection"}
                </span>
              </div>
            )}
          </section>

          {/* Section 6: Cron Logs */}
          <section className="border border-border/30 rounded-2xl p-5 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              {isArabic ? "سجل التحديثات" : "Update Logs"}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {isArabic
                ? "سجل آخر عمليات جلب الأخبار التلقائية"
                : "Log of recent automatic news fetch operations"}
            </p>

            <button
              onClick={loadCronLogs}
              disabled={logsLoading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2 mb-4"
            >
              {logsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <History className="w-4 h-4" />
              )}
              {isArabic ? "تحميل السجلات" : "Load Logs"}
            </button>

            {cronLogs.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {cronLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border text-sm ${
                      log.status === "success"
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-red-500/20 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${log.status === "success" ? "text-green-400" : "text-red-400"}`}>
                        {log.status === "success" ? "✅" : "❌"} {log.status}
                      </span>
                      <div className="flex items-center gap-2">
                        {log.triggered_by && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            log.triggered_by === "manual"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              : log.triggered_by === "github_actions"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                                : log.triggered_by === "vercel_cron"
                                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                                  : "bg-muted text-muted-foreground"
                          }`}>
                            {log.triggered_by === "manual"
                              ? (isArabic ? "يدوي" : "Manual")
                              : log.triggered_by === "github_actions"
                                ? "GitHub Actions"
                                : log.triggered_by === "vercel_cron"
                                  ? "Vercel Cron"
                                  : log.triggered_by}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.ran_at).toLocaleString(isArabic ? "ar" : "en")}
                        </span>
                      </div>
                    </div>
                    {log.status === "success" ? (
                      <div className="text-xs text-muted-foreground flex gap-4 flex-wrap">
                        <span>{isArabic ? "جُلب" : "Fetched"}: {log.fetched}</span>
                        <span>{isArabic ? "جديد" : "New"}: {log.new_items}</span>
                        <span>{isArabic ? "عُولج" : "Processed"}: {log.processed}</span>
                        <span>{isArabic ? "صور مصدر" : "Src img"}: {log.images_from_source ?? 0}</span>
                        <span>{isArabic ? "صور AI" : "AI img"}: {log.images_from_ai ?? 0}</span>
                        <span>{isArabic ? "المدة" : "Duration"}: {(log.duration_ms / 1000).toFixed(1)}s</span>
                      </div>
                    ) : (
                      <div className="text-xs text-red-400">
                        {log.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isArabic ? "حفظ الإعدادات" : "Save Settings"}
            </button>
            {saveMessage && (
              <span className="text-sm text-green-400">{saveMessage}</span>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
