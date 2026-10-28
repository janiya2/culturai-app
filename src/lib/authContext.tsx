"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import {
  getUserProfile,
  saveUserProfile,
  updateUserTasteProfile,
  UserProfile,
  UserTasteProfile,
} from "./firestoreService";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateTaste: (taste: Partial<UserTasteProfile>) => Promise<boolean>;
  updateDisplayName: (name: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  logout: async () => {},
  updateTaste: async () => false,
  updateDisplayName: async () => false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore
  const syncProfile = async (fbUser: User) => {
    try {
      let profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        // Create initial profile
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || "",
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Cultural Explorer",
          photoURL: fbUser.photoURL || "",
          tasteProfile: {
            music: [],
            cinema: [],
            dining: [],
            fashion: [],
            city: "Tokyo",
            aestheticKeywords: [],
            budgetTier: "balanced",
            onboarded: false,
            completedSteps: [],
          },
        };
        await saveUserProfile(newProfile);
        profile = newProfile;
      } else {
        // Sanitize legacy forced mock seeds if user had hardcoded defaults from older onboarding
        const t = profile.tasteProfile;
        if (t) {
          const isLegacyMockMusic =
            (t.music?.length === 2 && t.music[0] === "Radiohead" && t.music[1] === "Daft Punk") ||
            (t.music?.length === 1 && t.music[0] === "Radiohead");
          const isLegacyMockCinema =
            t.cinema?.length === 1 && t.cinema[0] === "Christopher Nolan";
          const isLegacyMockDining =
            t.dining?.length === 1 && t.dining[0] === "Speakeasy Cocktails";
          const isLegacyMockFashion =
            t.fashion?.length === 1 && t.fashion[0] === "Brutalist Architecture";

          const cleanMusic = isLegacyMockMusic ? [] : (t.music || []);
          const cleanCinema = isLegacyMockCinema ? [] : (t.cinema || []);
          const cleanDining = isLegacyMockDining ? [] : (t.dining || []);
          const cleanFashion = isLegacyMockFashion ? [] : (t.fashion || []);

          // Always ensure completedSteps strictly reflects reality:
          const cleanCompleted: string[] = [];
          if (cleanMusic.length > 0) cleanCompleted.push("music");
          if (cleanCinema.length > 0) cleanCompleted.push("cinema");
          if (cleanDining.length > 0) cleanCompleted.push("dining");
          if (cleanFashion.length > 0) cleanCompleted.push("fashion");
          if (t.city?.trim()) cleanCompleted.push("country-city");

          const needsUpdate =
            isLegacyMockMusic ||
            isLegacyMockCinema ||
            isLegacyMockDining ||
            isLegacyMockFashion ||
            JSON.stringify(t.completedSteps || []) !== JSON.stringify(cleanCompleted);

          if (needsUpdate) {
            const updatedTaste = {
              ...t,
              music: cleanMusic,
              cinema: cleanCinema,
              dining: cleanDining,
              fashion: cleanFashion,
              completedSteps: cleanCompleted,
            };

            await updateUserTasteProfile(fbUser.uid, updatedTaste);
            profile = {
              ...profile,
              tasteProfile: updatedTaste,
            };
          }
        }
      }
      setUserProfile(profile);
    } catch (err) {
      console.warn("Error syncing user profile:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        await syncProfile(fbUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await syncProfile(result.user);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (result.user) {
      await syncProfile(result.user);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (result.user) {
      await updateProfile(result.user, { displayName: name.trim() });
      const initialProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email || email.trim(),
        displayName: name.trim() || "Cultural Explorer",
        photoURL: "",
        tasteProfile: {
          music: [],
          cinema: [],
          dining: [],
          fashion: [],
          city: "Tokyo",
          aestheticKeywords: [],
          budgetTier: "balanced",
          onboarded: false,
          completedSteps: [],
        },
      };
      await saveUserProfile(initialProfile);
      setUserProfile(initialProfile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateTaste = async (taste: Partial<UserTasteProfile>): Promise<boolean> => {
    if (!user) return false;
    const ok = await updateUserTasteProfile(user.uid, taste);
    if (ok) {
      const updated = await getUserProfile(user.uid);
      if (updated) {
        setUserProfile(updated);
      }
    }
    return ok;
  };

  const updateDisplayName = async (name: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await updateProfile(user, { displayName: name.trim() });
      await saveUserProfile({
        uid: user.uid,
        email: user.email || "",
        displayName: name.trim(),
      });
      const updated = await getUserProfile(user.uid);
      if (updated) {
        setUserProfile(updated);
      }
      return true;
    } catch (err) {
      console.error("Failed to update display name:", err);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      if (p) setUserProfile(p);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateTaste,
        updateDisplayName,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
