# 🌌 CulturAI (AuraTaste)
> **Autonomous Multi-Agent Cultural & Lifestyle Concierge Engine**  
> *Built for the Qloo Agentic Hackathon on Devpost*

![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Qloo Taste AI](https://img.shields.io/badge/Qloo_Taste_AI-575M+_Entities-cyan?style=for-the-badge)
![Gemini 1.5](https://img.shields.io/badge/Google_Gemini-1.5_Flash-purple?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-orange?style=for-the-badge)

---

## 💡 Tagline & Vision
> **The world’s first autonomous multi-agent lifestyle concierge and cultural affinity engine — grounding Google Gemini 1.5 Flash in Qloo’s 575M+ entity Taste AI™ Graph to curate hyper-personalized night-outs, subcultural travel, and bilateral duo compromises.**

### The Problem: "Cultural Blindness" in Generative AI
Standard Large Language Models generate tourist clichés. When asked: *"Plan an intimate night out in Tokyo for someone who loves Thom Yorke and Wong Kar-wai,"* ChatGPT suggests Shibuya Crossing and mainstream ramen. It has no grasp of **cross-domain aesthetic affinity** — the subtle threads linking melancholic art-rock to brutalist concrete cocktail lounges and 90s Hong Kong cinema.

### The CulturAI Solution
CulturAI eliminates cultural blindness by mathematically grounding Google Gemini 1.5 Flash in Qloo’s 575M+ cultural entity graph. It synthesizes living, uncompromised lifestyle realities with sub-400ms reasoning.

---

## ⚡ The 8 Specialized Feature Engines

| Engine | Route | Description |
|---|---|---|
| 🍸 **Night-Out Curator** | `/night-out` | 4-part sequential nocturnal journey (Twilight Sound -> Culinary Architecture -> Arthouse Visuals -> Secret Speakeasy) |
| ✈️ **Subculture Travel** | `/travel` | Anti-tourist urban exploration across 45+ global metropolises |
| 👥 **DuoSync Engine** | `/duosync` | Bilateral mathematical compromise engine for couples & dates |
| 🧬 **Cultural DNA Radar** | `/cultural-dna` | 5-Dimensional lifestyle radar persona & shareable archetype |
| 🎬 **Screenplay Moodboard** | `/filmmaker` | Auteur cinematography, lighting palettes & sonic scout |
| 🛍️ **TasteMatch Gear** | `/tastematch` | Archival fashion & audiophile hardware discovery |
| 🤝 **Group Hangout Solver** | `/hangout` | Multi-vector centroid consensus engine for groups |
| 📬 **Weekly Radar Dispatch** | `/digest` | Monday morning bespoke cultural editorial newsletter |
| 🏛️ **Personal Taste Vault** | `/library` | User-isolated saved itineraries with search & timeline inspector |
| ⚙️ **Diagnostics Console** | `/admin/keys` | Live Qloo API Key test suite & real-time telemetry console |

---

## 🏛️ System Architecture

```
+---------------------------------------------------------------------------------------------------------+
|                                           CULTURAI AGENTIC PIPELINE                                     |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|   +-----------------------+     +-------------------------------+     +-----------------------------+   |
|   |   User Cultural Seeds | --> |   Autonomous Agent Router     | --> |    Qloo Taste AI™ API       |   |
|   | (Spotify/Films/Dining)|     |   Gemini 1.5 Flash Tool Use   |     |  /search, /v2/insights      |   |
|   +-----------------------+     +-------------------------------+     +-----------------------------+   |
|                                                |                                     |                  |
|                                                v                                     v                  |
|                                 +-------------------------------+     +-----------------------------+   |
|                                 |   5-D Cultural DNA Radar      | <-> |   Cloud Firestore Sync      |   |
|                                 |  Cross-Domain Affinity Matrix |     |   Users, Vault & Settings   |   |
|                                 +-------------------------------+     +-----------------------------+   |
|                                                |                                     |                  |
|                                                +------------------+------------------+                  |
|                                                                   v                                     |
|                                                 +-----------------------------------+                   |
|                                                 |   Chronological Journey Timeline  |                   |
|                                                 |   Exportable Vault & Maps Action  |                   |
|                                                 +-----------------------------------+                   |
+---------------------------------------------------------------------------------------------------------+
```

---

## 🧠 Breakthrough Innovation: Progressive Taste Refinement Engine
When users skip onboarding questions, CulturAI doesn't default to generic clichés:
1. The engine detects missing preference signals in real time.
2. In domain-specific modules (e.g. `/night-out` requiring dining seeds), a glassmorphic banner appears.
3. In **1 click**, the user selects rich cultural seeds, instantly syncing into **Cloud Firestore**, updating their 5-D Taste Radar dynamically.

---

## 🚀 Quickstart & Judge Evaluation Guide

### 1. Clone & Install
```bash
git clone https://github.com/janiya2/culturai-aura-taste.git
cd culturai-aura-taste
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_QLOO_API_KEY=your_qloo_hackathon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. Judge Live Testing Steps:
1. **Instant Judge Access**: On the login screen, click **"1-Click Direct to Dashboard"** for immediate evaluation with pre-seeded Tokyo cultural DNA, or **"1-Click Fresh Onboarding"** to test the 5-step taste calibration experience. Fallback credentials: `judge@qloo.ai` / `judgeDemo2026!`.
2. **Taste Calibration**: Walk through the 5-step onboarding or quick-pick seeds.
3. **Nocturnal Synthesis**: Navigate to `/night-out` and click **"Synthesize Night-Out Itinerary"**. Inspect the connected chronological timeline with Spotify sound cues and Google Maps navigation.
4. **Save & Inspect**: Click **"Save to My Library"**, then click **"View in Library"** to explore your dedicated vault at `/library`.
5. **Live API Key Verification**: Navigate to `/admin/keys` (or click the Qloo Status badge in the top right) to input your own live Qloo Hackathon key and verify HTTP 200 connectivity in real time!

---

## 🏆 Tech Stack
* **Frontend**: Next.js 16 (App Router with Turbopack), React 19, TypeScript, TailwindCSS.
* **Cultural Intelligence**: Qloo Taste AI™ Graph API (`/search`, `/v2/insights`).
* **Agentic LLM**: Google Gemini 2.5 Flash.
* **Database & Auth**: Google Cloud Firebase (Authentication & Cloud Firestore).
* **Design System**: Deep Void Glassmorphism (`#040409`), SVG Radar Graphs, Chronological Neon Timelines.

---

## 👥 Authors
* **Janitha Dilshan** ([@janiya2](https://github.com/janiya2)) — *Founder & Lead Systems Architect, InnoXpert Technologies*
