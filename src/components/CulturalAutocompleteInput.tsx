"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Sparkles,
  Music,
  Film,
  Utensils,
  Shirt,
  Compass,
  Plus,
  X,
  Check,
  Zap,
} from "lucide-react";
import { CulturalSuggestion, searchCulturalEntities } from "@/lib/culturalDictionary";

interface Props {
  placeholder?: string;
  domain?: "music" | "cinema" | "dining" | "fashion" | "travel" | "all";
  onAddSeed: (name: string) => void;
  className?: string;
  inputClassName?: string;
  buttonText?: string;
}

export default function CulturalAutocompleteInput({
  placeholder = "Add artist, auteur, dish, or aesthetic (e.g. Radiohead, Nolan, Omakase)...",
  domain = "all",
  onAddSeed,
  className = "",
  inputClassName = "",
  buttonText = "Add",
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<CulturalSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isQlooLive, setIsQlooLive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch / filter suggestions as user types
  const handleQuery = useCallback(
    (text: string) => {
      const q = text.trim();
      if (q.length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        setLoading(false);
        return;
      }

      // Step 1: Immediate local response (0ms latency)
      const instantLocal = searchCulturalEntities(q, domain);
      setSuggestions(instantLocal);
      setIsOpen(true);
      setSelectedIndex(-1);

      // Step 2: Debounced backend query to check live Qloo API
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          const res = await fetch(
            `/api/cultural/search?q=${encodeURIComponent(q)}&domain=${domain}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              setSuggestions(data.results);
            }
            setIsQlooLive(Boolean(data.isQlooLive));
          }
        } catch (err) {
          console.warn("Live search fallback:", err);
        } finally {
          setLoading(false);
        }
      }, 180);
    },
    [domain]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    handleQuery(val);
  };

  const handleSelect = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddSeed(trimmed);
    setAddedItemName(trimmed);
    setTimeout(() => setAddedItemName(null), 1800);
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSelect(suggestions[selectedIndex].name);
    } else if (inputValue.trim()) {
      handleSelect(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const getDomainIcon = (d: string) => {
    switch (d) {
      case "music":
        return <Music className="w-3.5 h-3.5 text-cyan-400" />;
      case "cinema":
      case "film":
        return <Film className="w-3.5 h-3.5 text-purple-400" />;
      case "dining":
        return <Utensils className="w-3.5 h-3.5 text-amber-400" />;
      case "fashion":
        return <Shirt className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getDomainBadge = (d: string) => {
    switch (d) {
      case "music":
        return "text-cyan-300 bg-cyan-500/15 border-cyan-500/30";
      case "cinema":
      case "film":
        return "text-purple-300 bg-purple-500/15 border-purple-500/30";
      case "dining":
        return "text-amber-300 bg-amber-500/15 border-amber-500/30";
      case "fashion":
        return "text-rose-300 bg-rose-500/15 border-rose-500/30";
      default:
        return "text-emerald-300 bg-emerald-500/15 border-emerald-500/30";
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (inputValue.trim().length > 0) handleQuery(inputValue);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full pl-10 pr-9 py-2.5 bg-black/60 border border-white/10 hover:border-white/20 rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all font-sans ${inputClassName}`}
            autoComplete="off"
            spellCheck={false}
          />

          {inputValue.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-white transition-colors"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{buttonText}</span>
        </button>
      </form>

      {/* Added Toast Badge Feedback */}
      {addedItemName && (
        <div className="absolute -top-7 right-0 text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Added "{addedItemName}"!</span>
        </div>
      )}

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-[#070914]/98 border border-cyan-500/35 shadow-2xl shadow-black/80 z-50 backdrop-blur-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto scrollbar-none">
          {/* Header pill */}
          <div className="px-2.5 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-1.5 mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Cultural Entity Suggestions</span>
            </span>
            <span className="flex items-center gap-1 text-[9px]">
              {isQlooLive ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Qloo 575M+ Live
                </span>
              ) : (
                <span className="text-cyan-400 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-cyan-400" />
                  Taste AI Graph
                </span>
              )}
            </span>
          </div>

          {suggestions.length > 0 ? (
            suggestions.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleSelect(item.name)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                    isSelected
                      ? "bg-cyan-500/20 border-cyan-400/40 text-white shadow-sm"
                      : "border-transparent hover:bg-white/[0.06] text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                      {getDomainIcon(item.domain)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white truncate">
                          {item.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold ${getDomainBadge(
                            item.domain
                          )}`}
                        >
                          {item.domain}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        <strong className="text-gray-300">{item.category}</strong> • {item.subtext}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1 rounded-lg bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 text-gray-300 transition-colors shrink-0"
                    title={`Add "${item.name}"`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-gray-400">
              No matching standard graph entities found for "{inputValue}".
            </div>
          )}

          {/* Fallback to Add Custom Seed directly */}
          {inputValue.trim().length > 0 && (
            <div
              onClick={() => handleSelect(inputValue.trim())}
              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/15 border border-dashed border-white/15 hover:border-cyan-400/40 text-xs text-cyan-300 font-mono flex items-center justify-between cursor-pointer transition-colors mt-1"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Add custom seed: <strong className="text-white">"{inputValue.trim()}"</strong>
                </span>
              </div>
              <span className="text-[10px] text-gray-400">Press Enter ↵</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
