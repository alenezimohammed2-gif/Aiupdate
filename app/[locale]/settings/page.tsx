"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  MODEL_OPTIONS,
  DEFAULT_SETTINGS,
  ModelOption,
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

  // Connection test state
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [connectionMessage, setConnectionMessage] = useState("");
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);

  // Instructions test state
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "done"
  >("idle");
  const [testResult, setTestResult] = useState("");

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

  // Test instructions
  const testInstructions = async () => {
    setTestStatus("testing");
    setTestResult("");
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
        setTestResult(data.result);
      } else {
        setTestResult(data.error || "Test failed");
      }
    } catch {
      setTestResult(isArabic ? "فشل الاختبار" : "Test failed");
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
              {isArabic ? "النموذج المستخدم" : "AI Model"}
            </h2>

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
          </section>

          {/* Section 2: Connection Status */}
          <section className="border border-border/30 rounded-2xl p-5 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {connectionStatus === "success" ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : connectionStatus === "error" ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : (
                <Wifi className="w-5 h-5 text-primary" />
              )}
              {isArabic ? "حالة الاتصال" : "Connection Status"}
            </h2>

            <div className="flex items-center gap-3 mb-3">
              <div className="text-sm text-muted-foreground">
                {isArabic ? "النموذج:" : "Model:"}{" "}
                <span className="font-medium text-foreground">
                  {modelInfo?.name}
                </span>
              </div>
            </div>

            <button
              onClick={testConnection}
              disabled={connectionStatus === "testing"}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {connectionStatus === "testing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              {isArabic ? "اختبار الاتصال" : "Test Connection"}
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
                  <CheckCircle2 className="w-4 h-4" />
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
                ? "اختبر إرشاداتك على مجموعة من المقالات التجريبية لترى كيف يفلتر النموذج الأخبار."
                : "Test your instructions on sample articles to see how the model filters news."}
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
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto" dir="ltr">
                  {testResult}
                </pre>
              </div>
            )}
          </section>

          {/* Section 5: Cron Logs */}
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
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.ran_at).toLocaleString(isArabic ? "ar" : "en")}
                      </span>
                    </div>
                    {log.status === "success" ? (
                      <div className="text-xs text-muted-foreground flex gap-4 flex-wrap">
                        <span>{isArabic ? "جُلب" : "Fetched"}: {log.fetched}</span>
                        <span>{isArabic ? "جديد" : "New"}: {log.new_items}</span>
                        <span>{isArabic ? "عُولج" : "Processed"}: {log.processed}</span>
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
