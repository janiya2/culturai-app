"use client";

import React, { useState, useEffect } from "react";
import {
  getApiSettings,
  saveApiSettings,
  ApiSettings,
} from "@/lib/firestoreService";
import {
  Key,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Cpu,
  RefreshCw,
  Zap,
  Info,
} from "lucide-react";

export default function ApiKeysVaultPage() {
  const [qlooApiKey, setQlooApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [qlooApiMode, setQlooApiMode] = useState<"live" | "mock">("mock");

  const [showQlooKey, setShowQlooKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Testing states
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestStatus, setGeminiTestStatus] = useState<string | null>(null);

  const [testingQloo, setTestingQloo] = useState(false);
  const [qlooTestStatus, setQlooTestStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getApiSettings();
        setQlooApiKey(settings.qlooApiKey || "");
        setGeminiApiKey(settings.geminiApiKey || "");
        setQlooApiMode(settings.qlooApiMode || (settings.qlooApiKey ? "live" : "mock"));
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg("");

    try {
      const trimmedQloo = qlooApiKey.trim();
      let mode: "live" | "mock" = "mock";

      // If Qloo key is provided, strictly validate against live Qloo Hackathon endpoint
      if (trimmedQloo) {
        try {
          // Primary endpoint: https://hackathon.api.qloo.com/search?query=interstellar
          let testRes = await fetch("https://hackathon.api.qloo.com/search?query=interstellar", {
            headers: {
              "X-Api-Key": trimmedQloo,
              "Accept": "application/json",
            },
          });

          // Fallback to /v2/search if 404
          if (testRes.status === 404) {
            testRes = await fetch("https://hackathon.api.qloo.com/v2/search?query=interstellar", {
              headers: {
                "X-Api-Key": trimmedQloo,
                "Accept": "application/json",
              },
            });
          }

          if (testRes.ok) {
            mode = "live";
          } else {
            let reason = "";
            try {
              const text = await testRes.text();
              try {
                const errJson = JSON.parse(text);
                reason = errJson.error?.reason || errJson.error?.message || errJson.message || text;
              } catch {
                reason = text;
              }
            } catch {
              reason = testRes.statusText || "Verification failed";
            }
            throw new Error(`Qloo Live API Authentication Failed (HTTP ${testRes.status}: ${reason}). Live Mode cannot be activated with an invalid or unverified key.`);
          }
        } catch (fetchErr: any) {
          // If network error or live API rejected, fail honestly
          throw new Error(fetchErr.message || "Failed to verify Qloo API Key with https://hackathon.api.qloo.com");
        }
      }

      const success = await saveApiSettings({
        qlooApiKey: trimmedQloo,
        geminiApiKey: geminiApiKey.trim(),
        qlooApiMode: mode,
      });

      if (success) {
        setSaveSuccess(true);
        setQlooApiMode(mode);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg("Failed to persist keys to Cloud Firestore. Please check your connection.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestGemini = async () => {
    if (!geminiApiKey.trim()) {
      setGeminiTestStatus("Error: Please provide a Gemini API Key first.");
      return;
    }
    setTestingGemini(true);
    setGeminiTestStatus(null);
    try {
      const start = Date.now();
      let modelName = "gemini-2.5-flash";
      let res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Ping. Respond with one word: 'CONNECTED'." }] }],
          }),
        }
      );
      if (res.status === 404) {
        modelName = "gemini-3.5-flash-lite";
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Ping. Respond with one word: 'CONNECTED'." }] }],
            }),
          }
        );
      }
      const elapsed = Date.now() - start;
      if (res.ok) {
        setGeminiTestStatus(`Success! Connected (${elapsed}ms latency). Model: ${modelName}.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        setGeminiTestStatus(`Failed (HTTP ${res.status}): ${errData.error?.message || "Invalid Key"}`);
      }
    } catch (err: any) {
      setGeminiTestStatus(`Network test error: ${err.message}`);
    } finally {
      setTestingGemini(false);
    }
  };

  const handleTestQloo = async () => {
    setTestingQloo(true);
    setQlooTestStatus(null);
    try {
      if (!qlooApiKey.trim()) {
        setQlooTestStatus("⚠️ No Qloo API Key entered. The production neural graph engine remains in Standby mode.");
      } else {
        const start = Date.now();
        // Test against Qloo's official hackathon entity search endpoint
        let res = await fetch("https://hackathon.api.qloo.com/search?query=interstellar", {
          headers: {
            "X-Api-Key": qlooApiKey.trim(),
            "Accept": "application/json"
          },
        });

        // Fallback to /v2/search if 404
        if (res.status === 404) {
          res = await fetch("https://hackathon.api.qloo.com/v2/search?query=interstellar", {
            headers: {
              "X-Api-Key": qlooApiKey.trim(),
              "Accept": "application/json"
            },
          });
        }

        const elapsed = Date.now() - start;
        if (res.ok) {
          setQlooTestStatus(`✅ Verified! Live Qloo Hackathon Taste Graph authenticated (${elapsed}ms latency). Ready for live synthesis.`);
        } else {
          let reason = "";
          try {
            const text = await res.text();
            try {
              const errData = JSON.parse(text);
              reason = errData.error?.reason || errData.error?.message || errData.message || text;
            } catch {
              reason = text;
            }
          } catch {
            reason = res.statusText || "Verification failed";
          }
          setQlooTestStatus(`❌ Qloo Verification Failed (HTTP ${res.status}: ${reason}). Live mode CANNOT be activated with this key.`);
        }
      }
    } catch (err: any) {
      setQlooTestStatus(`❌ Network test error: ${err.message}. Check your internet connection or API endpoint.`);
    } finally {
      setTestingQloo(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-gray-400">Loading API Key Vault...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-2">
          <Key className="w-3.5 h-3.5" />
          Cloud Firestore Hot-Swap Dynamic Configuration
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          API Key & Model Vault
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your Qloo Devpost Hackathon key and Google Gemini API credentials. All updates persist to Cloud Firestore (`qloo_settings/api_keys`) and take effect immediately without redeploying.
        </p>
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-start gap-3 text-cyan-200 text-xs">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-cyan-100">
            Devpost Qloo Hackathon Live Authentication Gate
          </p>
          <p className="text-cyan-300/80 leading-relaxed">
            Paste your official Qloo API Key (<code className="font-mono text-cyan-200">X-Api-Key</code>) from Devpost. Every key is strictly validated against <code className="font-mono text-cyan-200">https://hackathon.api.qloo.com/search</code> before activation. If an invalid or unverified key is provided, the system stays in Standby mode to preserve algorithmic integrity for judges.
          </p>
        </div>
      </div>

      {/* Feedback Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-3 text-emerald-200 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>API keys successfully synced to Cloud Firestore vault (`web-b61f1`). Hot-swap active!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center gap-3 text-red-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Qloo Key Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Qloo Taste Graph API Key</h2>
                <p className="text-xs text-gray-400">
                  Used for cross-domain cultural affinity vectors (Music, Cinema, Dining, Travel)
                </p>
              </div>
            </div>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${qlooApiMode === "live"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}>
              {qlooApiMode === "live" ? "Mode: Live Production Engine Active" : "Mode: Engine on Standby"}
            </span>
          </div>

          <div className="relative">
            <input
              type={showQlooKey ? "text" : "password"}
              value={qlooApiKey}
              onChange={(e) => setQlooApiKey(e.target.value)}
              placeholder="Paste your Qloo API key here (e.g. qloo_live_...)"
              className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono placeholder:text-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowQlooKey(!showQlooKey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showQlooKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-gray-400">
              {qlooApiKey.trim()
                ? "Click 'Test Engine Status' or 'Save Keys' to authenticate against the live Qloo Hackathon endpoint."
                : "No key configured. The public dashboard will honestly display Standby Mode without mock scores."}
            </p>

            <button
              type="button"
              onClick={handleTestQloo}
              disabled={testingQloo}
              className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-cyan-300 flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              {testingQloo ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Test Engine Status
                </>
              )}
            </button>
          </div>

          {qlooTestStatus && (
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-xs font-mono text-cyan-300">
              {qlooTestStatus}
            </div>
          )}
        </div>

        {/* Gemini Key Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Google Gemini 1.5 Flash API Key</h2>
                <p className="text-xs text-gray-400">
                  Powers autonomous agent reasoning loops, aesthetic commentary, and duo compromise rationale
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300">
              Active
            </span>
          </div>

          <div className="relative">
            <input
              type={showGeminiKey ? "text" : "password"}
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Paste your Google Gemini API key (AIzaSy...)"
              required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono placeholder:text-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowGeminiKey(!showGeminiKey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-gray-400">
              Pre-configured with working high-throughput Gemini 1.5 Flash key.
            </p>

            <button
              type="button"
              onClick={handleTestGemini}
              disabled={testingGemini}
              className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-violet-300 flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              {testingGemini ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Pinging Gemini...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Test Live Connectivity
                </>
              )}
            </button>
          </div>

          {geminiTestStatus && (
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-xs font-mono text-violet-300">
              {geminiTestStatus}
            </div>
          )}
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-900/20 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Syncing to Cloud Firestore...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Keys to Firestore Vault
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
