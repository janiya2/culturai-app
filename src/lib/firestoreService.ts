import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from "firebase/firestore";

export interface ApiSettings {
  qlooApiKey: string;
  geminiApiKey: string;
  qlooApiMode: "live" | "mock";
  updatedAt?: any;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: any;
  lastLogin?: any;
}

export interface ItineraryRecord {
  id?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  agentType: "night-out" | "travel-concierge" | "duo-alignment";
  title: string;
  signals: string[];
  destCity?: string;
  summary: string;
  items: Array<{
    time?: string;
    day?: string;
    category: string;
    name: string;
    description: string;
    affinityScore?: number;
    matchReason?: string;
    spotifyTrack?: string;
  }>;
  tasteVectors?: Record<string, number>;
  createdAt?: any;
}

// Default fallback settings
const DEFAULT_SETTINGS: ApiSettings = {
  qlooApiKey:
    process.env.NEXT_PUBLIC_QLOO_API_KEY ||
    "hack_fc3db58174dbea3e3b62b2403d76e91f9e038f83",
  geminiApiKey:
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "AIzaSyD_5frWyGBMZ4BXECEeLHB9qKneoJWUC-s",
  qlooApiMode: "live",
};

/**
 * Fetch dynamic API keys from Firestore
 */
export async function getApiSettings(): Promise<ApiSettings> {
  try {
    const docRef = doc(db, "qloo_settings", "api_keys");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<ApiSettings>;
      return {
        qlooApiKey: data.qlooApiKey || DEFAULT_SETTINGS.qlooApiKey,
        geminiApiKey: data.geminiApiKey || DEFAULT_SETTINGS.geminiApiKey,
        qlooApiMode: data.qlooApiKey ? "live" : (data.qlooApiMode || "mock"),
        updatedAt: data.updatedAt,
      };
    }
  } catch (err) {
    console.warn("Firestore settings read failed, using defaults:", err);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save dynamic API keys into Firestore
 */
export async function saveApiSettings(settings: Partial<ApiSettings>): Promise<boolean> {
  try {
    const docRef = doc(db, "qloo_settings", "api_keys");
    await setDoc(
      docRef,
      {
        ...settings,
        qlooApiMode: settings.qlooApiKey?.trim() ? "live" : "mock",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to save API settings:", err);
    return false;
  }
}

/**
 * Check if a user has admin role
 */
export async function checkIsAdmin(emailOrUid: string): Promise<boolean> {
  if (!emailOrUid) return false;
  const clean = emailOrUid.toLowerCase().trim();

  // Master fallback admins for zero lockouts
  const MASTER_ADMINS = [
    "admin@culturai.com",
    "admin@lexiguard.com",
    "janithad2@gmail.com",
    "contact@innoxpert.com",
  ];
  if (MASTER_ADMINS.includes(clean)) {
    return true;
  }

  try {
    // 1. Check by UID
    const uidDoc = await getDoc(doc(db, "qloo_admins", clean));
    if (uidDoc.exists() && uidDoc.data()?.role === "admin") {
      return true;
    }

    // 2. Check by Email
    const q = query(
      collection(db, "qloo_admins"),
      where("email", "==", clean),
      where("role", "==", "admin")
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    console.warn("Admin check query failed:", err);
    // Allow master list fallback on network hiccup
    return MASTER_ADMINS.includes(clean);
  }
}

/**
 * Register an admin user in Firestore
 */
export async function registerAdmin(uid: string, email: string): Promise<boolean> {
  try {
    const adminRef = doc(db, "qloo_admins", uid);
    await setDoc(
      adminRef,
      {
        uid,
        email: email.toLowerCase().trim(),
        role: "admin",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to register admin:", err);
    return false;
  }
}

/**
 * Save an itinerary record into Firestore
 */
export async function saveItinerary(itinerary: ItineraryRecord): Promise<string | null> {
  try {
    const colRef = collection(db, "qloo_itineraries");
    const docRef = await addDoc(colRef, {
      ...itinerary,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Failed to save itinerary:", err);
    return null;
  }
}

/**
 * Get recent itineraries
 */
export async function getRecentItineraries(count: number = 20): Promise<ItineraryRecord[]> {
  try {
    const q = query(
      collection(db, "qloo_itineraries"),
      orderBy("createdAt", "desc"),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ItineraryRecord, "id">),
    }));
  } catch (err) {
    console.warn("Failed to fetch itineraries:", err);
    return [];
  }
}

/**
 * Get user-specific saved itineraries from library
 */
export async function getUserItineraries(userId: string, userEmail?: string): Promise<ItineraryRecord[]> {
  try {
    if (!userId) return [];
    const colRef = collection(db, "qloo_itineraries");
    
    // First query by userId
    const qUser = query(colRef, where("userId", "==", userId), limit(50));
    const snapUser = await getDocs(qUser);
    let results: ItineraryRecord[] = snapUser.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ItineraryRecord, "id">),
    }));

    // If no results and userEmail provided, check by userEmail as well
    if (results.length === 0 && userEmail) {
      const qEmail = query(colRef, where("userEmail", "==", userEmail), limit(50));
      const snapEmail = await getDocs(qEmail);
      results = snapEmail.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ItineraryRecord, "id">),
      }));
    }

    // Fallback: If still empty, check recent itineraries and include any matching either identifier or unassigned
    if (results.length === 0) {
      const recent = await getRecentItineraries(20);
      results = recent.filter((it) => 
        (it.userId && it.userId === userId) ||
        (it.userEmail && userEmail && it.userEmail.toLowerCase() === userEmail.toLowerCase())
      );
    }

    // Sort descending by creation date
    return results.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  } catch (err) {
    console.warn("Failed to fetch user itineraries:", err);
    return [];
  }
}

/**
 * Delete an itinerary from library
 */
export async function deleteItinerary(itineraryId: string): Promise<boolean> {
  try {
    if (!itineraryId) return false;
    const docRef = doc(db, "qloo_itineraries", itineraryId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error("Failed to delete itinerary:", err);
    return false;
  }
}

/**
 * User Profile & Taste Data Structure
 */
export interface UserTasteProfile {
  music: string[];
  cinema: string[];
  dining: string[];
  fashion: string[];
  city: string;
  aestheticKeywords: string[];
  budgetTier?: "casual" | "balanced" | "luxury";
  duoPartnerName?: string;
  duoPartnerSignals?: string[];
  radarVectors?: {
    sonicDepth: number;
    cinematicAesthetic: number;
    gastronomyCuriosity: number;
    urbanSubculture: number;
    literaryResonance: number;
    [key: string]: number;
  };
  onboarded: boolean;
  completedSteps: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: any;
  lastLogin?: any;
  tasteProfile?: UserTasteProfile;
}

/**
 * Fetch User Profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "culturai_users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn("Failed to get user profile from Firestore:", err);
  }
  return null;
}

/**
 * Save or Merge User Profile into Firestore
 */
export async function saveUserProfile(
  profile: Partial<UserProfile> & { uid: string }
): Promise<boolean> {
  try {
    const docRef = doc(db, "culturai_users", profile.uid);
    await setDoc(
      docRef,
      {
        ...profile,
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to save user profile:", err);
    return false;
  }
}

/**
 * Update User Taste Profile
 */
export async function updateUserTasteProfile(
  uid: string,
  taste: Partial<UserTasteProfile>
): Promise<boolean> {
  try {
    const docRef = doc(db, "culturai_users", uid);
    const snap = await getDoc(docRef);
    const existing = snap.exists() ? (snap.data() as UserProfile) : null;
    const existingTaste = existing?.tasteProfile || {
      music: [],
      cinema: [],
      dining: [],
      fashion: [],
      city: "Tokyo",
      aestheticKeywords: [],
      budgetTier: "balanced",
      onboarded: false,
      completedSteps: [],
    };

    const updatedTaste = {
      ...existingTaste,
      ...taste,
      completedSteps:
        taste.completedSteps !== undefined
          ? taste.completedSteps
          : Array.from(new Set([...(existingTaste.completedSteps || []), ...(taste.completedSteps || [])])),
    };

    await setDoc(
      docRef,
      {
        tasteProfile: updatedTaste,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to update user taste profile:", err);
    return false;
  }
}

/**
 * Get list of admins
 */
export async function getAdminsList(): Promise<AdminUser[]> {
  try {
    const snap = await getDocs(collection(db, "qloo_admins"));
    return snap.docs.map((d) => d.data() as AdminUser);
  } catch (err) {
    console.warn("Failed to fetch admin list:", err);
    return [];
  }
}

