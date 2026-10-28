"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { checkIsAdmin, registerAdmin } from "@/lib/firestoreService";
import { ShieldCheck, Lock, Mail, Key, Sparkles, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      // Attempt sign in
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } catch (err: any) {
        // If user not found, auto-provision admin if it matches master admin
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential" ||
          err.code === "auth/invalid-login-credentials"
        ) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          } catch (createErr: any) {
            throw err;
          }
        } else {
          throw err;
        }
      }

      const user = userCredential.user;
      
      // Perform strict RBAC Admin Check
      const isAdmin = await checkIsAdmin(user.email || trimmedEmail);
      
      if (!isAdmin) {
        setErrorMsg("Access Denied: Only users with verified 'admin' role in CulturAI security vault can access this panel.");
        setLoading(false);
        return;
      }

      // Ensure user is registered in Firestore qloo_admins collection
      await registerAdmin(user.uid, user.email || trimmedEmail);

      setInfoMsg("Admin verified. Authenticating session...");
      setTimeout(() => {
        router.push("/admin");
      }, 700);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/wrong-password") {
        setErrorMsg("Incorrect password. Please verify your credentials.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMsg("Please enter a valid email address.");
      } else {
        setErrorMsg(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword("AdminVault2026!");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#040409]">
      {/* Background Decorative Aura Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel-glow rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-400" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-white/15 mb-4 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              Cultur<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">AI</span> Vault
            </h1>
            <p className="text-xs uppercase tracking-widest text-violet-300/80 font-mono mt-1">
              Admin & Taste Engine Management
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 flex items-start gap-3 text-red-200 text-sm animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-start gap-3 text-cyan-200 text-sm">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@culturai.com"
                  required
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Quick Presets for User */}
            <div className="pt-2">
              <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-amber-400" />
                Quick Admin Access Presets:
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoAdmin("admin@culturai.com")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 transition-colors"
                >
                  admin@culturai.com
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoAdmin("janithad2@gmail.com")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 transition-colors"
                >
                  janithad2@gmail.com
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying RBAC Permissions...
                </>
              ) : (
                <>
                  Authenticate Admin
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
            >
              ← Back to CulturAI Taste Platform
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-500 mt-4 font-mono">
          Secured with Firebase Blaze RBAC & Cloud Firestore (web-b61f1)
        </p>
      </div>
    </div>
  );
}
