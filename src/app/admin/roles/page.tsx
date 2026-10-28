"use client";

import React, { useState, useEffect } from "react";
import { getAdminsList, registerAdmin, AdminUser } from "@/lib/firestoreService";
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
} from "lucide-react";

export default function AdminRolesPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const list = await getAdminsList();
      setAdmins(list);
    } catch (err) {
      console.error("Failed to load admin list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setSaving(true);
    setFeedback(null);
    try {
      const cleanEmail = newEmail.trim().toLowerCase();
      const tempUid = "admin_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
      const ok = await registerAdmin(tempUid, cleanEmail);

      if (ok) {
        setFeedback({
          type: "success",
          text: `Role 'admin' successfully provisioned for ${cleanEmail}.`,
        });
        setNewEmail("");
        fetchAdmins();
      } else {
        setFeedback({
          type: "error",
          text: "Failed to persist admin to Cloud Firestore security collection.",
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to add admin." });
    } finally {
      setSaving(false);
    }
  };

  const MASTER_ADMINS = [
    { email: "admin@culturai.com", role: "SUPER_ADMIN", type: "Master Vault Admin" },
    { email: "janithad2@gmail.com", role: "SUPER_ADMIN", type: "Workspace Owner" },
    { email: "contact@innoxpert.com", role: "ADMIN", type: "Organization Root" },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          Role-Based Access Control (RBAC) Security
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Admin Access & Permissions
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Strict authorization management. Only verified emails with an active `admin` record in Firestore (`qloo_admins`) can access the CulturAI Admin Vault.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/60 border-red-500/30 text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Add New Admin Form */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Provision New Admin Role</h2>
            <p className="text-xs text-gray-400">
              Grant admin privileges to a team member or reviewer
            </p>
          </div>
        </div>

        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. reviewer@devpost.com"
              required
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs placeholder:text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Authorizing...
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Grant Admin Access
              </>
            )}
          </button>
        </form>
      </div>

      {/* Master Admins (Protected) */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          Master Security Admins (Protected Fallback)
        </h2>
        <div className="divide-y divide-white/5">
          {MASTER_ADMINS.map((item, i) => (
            <div key={i} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white">{item.email}</span>
                <span className="block text-[10px] text-gray-400">{item.type}</span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                {item.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Firestore Admins List */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Provisioned Admins in Firestore (`qloo_admins`)
          </h2>
          <button
            onClick={fetchAdmins}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>

        {admins.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/5 text-gray-400 text-xs">
            No dynamic admins found in Firestore yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {admins.map((adm, idx) => (
              <div key={adm.uid || idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-white">{adm.email}</span>
                  <span className="block text-[10px] font-mono text-gray-500">
                    UID: {adm.uid}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 uppercase">
                  {adm.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
