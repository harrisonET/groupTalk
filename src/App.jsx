import React, { useState, useEffect } from "react";
import { Shuffle, ArrowLeft, ArrowRight, Settings, Users, Play, Plus, Trash2, Globe } from "lucide-react";
import defaultEn from "./data/en.json";
import defaultId from "./data/id.json";

export default function App() {
  // Navigation State: 'game' | 'players' | 'settings'
  const [view, setView] = useState("game");

  // 1. Players Setup State (Max 30)
  const [players, setPlayers] = useState([
    "Alex", "Bianca", "Charlie", "Diana", "Ethan"
  ]);
  const [newPlayerName, setNewPlayerName] = useState("");

  // 2. Language & Questions State
  const [lang, setLang] = useState("en"); // 'en' or 'id'
  const [customQuestions, setCustomQuestions] = useState({
    en: { ...defaultEn },
    id: { ...defaultId }
  });
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionLevel, setNewQuestionLevel] = useState("lvl1");

  // 3. Gameplay Engine States
  const [currentLevel, setCurrentLevel] = useState("lvl1"); // 'lvl1' | 'lvl2' | 'lvl3'
  const [playerAsking, setPlayerAsking] = useState("");
  const [playerTarget, setPlayerTarget] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  // Tracking used questions during the session to guarantee uniqueness
  const [usedQuestions, setUsedQuestions] = useState({
    en: { lvl1: [], lvl2: [], lvl3: [] },
    id: { lvl1: [], lvl2: [], lvl3: [] }
  });

  // Theme configuration matching user UI designs based on selected depth levels
  const themeStyles = {
    lvl1: { bg: "bg-[#c2e7c4]", text: "text-[#2e4d32]", cardText: "text-[#c2e7c4]" },
    lvl2: { bg: "bg-[#a1e0fa]", text: "text-[#1d4454]", cardText: "text-[#a1e0fa]" },
    lvl3: { bg: "bg-[#bca0dc]", text: "text-[#391e54]", cardText: "text-[#bca0dc]" }
  };

  // Run initial setup to select initial asking parties/questions
  useEffect(() => {
    if (players.length >= 2) {
      pickRandomPlayers(null);
    }
  }, [players]);

  useEffect(() => {
    shuffleQuestion(currentLevel);
  }, [currentLevel, lang, customQuestions]);

  // Player Assignment Rotations
  const pickRandomPlayers = (forcedAskingPlayer = null) => {
    if (players.length < 2) return;
    let asker = forcedAskingPlayer;
    if (!asker || !players.includes(asker)) {
      asker = players[Math.floor(Math.random() * players.length)];
    }
    const remaining = players.filter(p => p !== asker);
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    
    setPlayerAsking(asker);
    setPlayerTarget(target);
  };

  const handleNextTurn = () => {
    // The previous targeted responder now steps up to ask the next teammate
    pickRandomPlayers(playerTarget);
    shuffleQuestion(currentLevel);
  };

  // Safe Deck Shuffling & Exhaustion Verification Engine
  const shuffleQuestion = (level) => {
    const totalPool = customQuestions[lang][level] || [];
    const usedPool = usedQuestions[lang][level] || [];
    const available = totalPool.filter(q => !usedPool.includes(q));

    if (available.length === 0) {
      if (totalPool.length === 0) {
        setCurrentQuestion(lang === "en" ? "No questions available here!" : "Tidak ada pertanyaan tersedia!");
        return;
      }
      // Reset historic tracking arrays if pool fully exhausted
      setCurrentQuestion(totalPool[Math.floor(Math.random() * totalPool.length)]);
      setUsedQuestions(prev => ({
        ...prev,
        [lang]: { ...prev[lang], [level]: [] }
      }));
    } else {
      const selected = available[Math.floor(Math.random() * available.length)];
      setCurrentQuestion(selected);
      setUsedQuestions(prev => ({
        ...prev,
        [lang]: { ...prev[lang], [level]: [...prev[lang][level], selected] }
      }));
    }
  };

  // Roster mutations
  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 30) {
      if (!players.includes(newPlayerName.trim())) {
        setPlayers([...players, newPlayerName.trim()]);
      }
      setNewPlayerName("");
    }
  };

  const removePlayer = (name) => {
    setPlayers(players.filter(p => p !== name));
  };

  // Live Prompt configuration mutations
  const addCustomQuestion = () => {
    const currentPoolSize = customQuestions[lang][newQuestionLevel].length;
    const baseSize = (lang === 'en' ? defaultEn : defaultId)[newQuestionLevel].length;

    if (currentPoolSize >= baseSize + 50) {
      alert("Maximum limit of 50 new custom questions reached for this tier!");
      return;
    }

    if (newQuestionText.trim()) {
      setCustomQuestions(prev => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [newQuestionLevel]: [...prev[lang][newQuestionLevel], newQuestionText.trim()]
        }
      }));
      setNewQuestionText("");
    }
  };

  const removeCustomQuestion = (level, index) => {
    setCustomQuestions(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [level]: prev[lang][level].filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${themeStyles[currentLevel].bg}`}>
      
      {/* Dynamic App Header Frame */}
      <header className="px-6 pt-6 pb-2 flex justify-between items-center text-zinc-900">
        <button 
          onClick={() => setView(view === "game" ? "players" : "game")}
          className="p-2 rounded-full hover:bg-black/10 transition"
          title="Manage Room Roster"
        >
          <Users size={24} />
        </button>
        <h1 className="text-2xl font-black tracking-tight select-none">Let's Plunge</h1>
        <button 
          onClick={() => setView(view === "game" ? "settings" : "game")}
          className="p-2 rounded-full hover:bg-black/10 transition"
          title="Language & Card Stack Settings"
        >
          <Settings size={24} />
        </button>
      </header>

      {/* VIEW 1: GAME CORE BOARD */}
      {view === "game" && (
        <main className="flex-1 flex flex-col justify-between px-6 pb-8 max-w-md mx-auto w-full">
          
          {/* Action Callout Statement */}
          <div className="text-center mt-6">
            {players.length >= 2 ? (
              <p className="text-lg font-medium text-zinc-800">
                <span className="font-extrabold">{playerAsking}</span>{" "}
                <span className="opacity-60">{lang === "en" ? "asks" : "bertanya pada"}</span>{" "}
                <span className="font-extrabold">{playerTarget}</span>:
              </p>
            ) : (
              <p className="text-red-600 font-bold">
                {lang === "en" ? "Add at least 2 players to start!" : "Butuh minimal 2 pemain!"}
              </p>
            )}
          </div>

          {/* Prompt Card Deck */}
          <div className="relative my-auto py-4">
            <div className="w-full bg-[#1e1e24] text-white rounded-[2.5rem] p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.15)] min-h-[320px] flex flex-col justify-between items-center text-center">
              <div className="w-full" />
              
              <p className={`text-xl md:text-2xl font-bold px-2 leading-relaxed ${themeStyles[currentLevel].cardText}`}>
                {currentQuestion}
              </p>

              {/* Deck Action Tray */}
              <div className="flex justify-between items-center w-full mt-6 px-4 text-zinc-400">
                <button 
                  onClick={() => shuffleQuestion(currentLevel)}
                  className="p-2 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={() => shuffleQuestion(currentLevel)}
                  className="p-3 bg-zinc-800/80 rounded-full hover:scale-110 text-white transition-all"
                  title="Shuffle current tier deck"
                >
                  <Shuffle size={20} />
                </button>
                <button 
                  onClick={handleNextTurn}
                  className="p-2 hover:text-white transition"
                  title="Pass Turn Forward"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Bubble Aesthetic Elements */}
            <div className="absolute left-[-15px] bottom-[-20px] opacity-40 flex items-end gap-1">
              <div className="w-6 h-6 rounded-full border-2 border-current" />
              <div className="w-4 h-4 rounded-full border-2 border-current mb-4" />
              <div className="w-2 h-2 rounded-full border-2 border-current mb-8" />
            </div>
            <div className="absolute right-[-15px] bottom-[-10px] opacity-40 flex items-end gap-1">
              <div className="w-2 h-2 rounded-full border-2 border-current mb-6" />
              <div className="w-3 h-3 rounded-full border-2 border-current mb-3" />
              <div className="w-7 h-7 rounded-full border-2 border-current" />
            </div>
          </div>

          {/* Action Center Bottom Panel */}
          <div className="flex flex-col items-center gap-6 w-full mt-auto">
            {/* Plunge Button - Removed Impact font dependency and used solid scaling */}
            <button 
              onClick={handleNextTurn}
              className="bg-[#1e1e24] text-white text-3xl font-black tracking-widest px-14 py-3 rounded-full uppercase shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all inline-block text-center select-none cursor-pointer min-w-[200px]"
              style={{ fontStyle: 'italic' }}
            >
              PLUNGE
            </button>

            {/* Question Depth Slider/Selector */}
            <div className="w-full text-center pb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest opacity-70 block mb-3 text-zinc-900">
                {lang === "en" ? "Question Depth" : "Kedalaman Pertanyaan"}
              </span>
              
              {/* Explicit horizontal flex layout to prevent vertical stacking */}
              <div className="flex flex-row justify-center items-center gap-4 w-full">
                {/* Level 1 Button */}
                <button 
                  onClick={() => setCurrentLevel("lvl1")}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 border-[#1e1e24] transition-all cursor-pointer select-none shrink-0
                    ${currentLevel === "lvl1" ? "bg-[#1e1e24] text-white" : "bg-transparent text-[#1e1e24]"}`}
                >
                  <span className="text-2xl font-bold leading-none">~</span>
                </button>

                {/* Level 2 Button */}
                <button 
                  onClick={() => setCurrentLevel("lvl2")}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 border-[#1e1e24] transition-all cursor-pointer select-none shrink-0
                    ${currentLevel === "lvl2" ? "bg-[#1e1e24] text-white" : "bg-transparent text-[#1e1e24]"}`}
                >
                  <span className="text-2xl font-bold leading-none -mb-1">~</span>
                  <span className="text-2xl font-bold leading-none">~</span>
                </button>

                {/* Level 3 Button */}
                <button 
                  onClick={() => setCurrentLevel("lvl3")}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 border-[#1e1e24] transition-all cursor-pointer select-none shrink-0
                    ${currentLevel === "lvl3" ? "bg-[#1e1e24] text-white" : "bg-transparent text-[#1e1e24]"}`}
                >
                  <span className="text-2xl font-bold leading-none -mb-1">~</span>
                  <span className="text-2xl font-bold leading-none -mb-1">~</span>
                  <span className="text-2xl font-bold leading-none">~</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* VIEW 2: ROSTER MANAGER PAGE */}
      {view === "players" && (
        <main className="flex-1 max-w-md mx-auto w-full bg-white/90 backdrop-blur-md rounded-t-[2rem] p-6 mt-4 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-zinc-800 flex items-center gap-2">
                <Users size={22} /> {lang === "en" ? "Room Roster" : "Daftar Pemain"} ({players.length}/30)
              </h2>
              <button onClick={() => setView("game")} className="text-sm font-bold text-zinc-500 hover:text-black">
                {lang === "en" ? "Done" : "Selesai"}
              </button>
            </div>

            {/* Input Element */}
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                maxLength={20}
                placeholder={lang === "en" ? "Enter name..." : "Masukkan nama..."}
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                className="flex-1 px-4 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-800 bg-white text-zinc-800"
              />
              <button 
                onClick={addPlayer}
                className="bg-zinc-900 text-white p-2 rounded-xl hover:bg-zinc-800 transition"
              >
                <Plus size={22} />
              </button>
            </div>

            {/* Roster Listing Grid */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {players.map((p) => (
                <div key={p} className="flex justify-between items-center bg-zinc-100 px-4 py-2 rounded-xl">
                  <span className="font-medium text-zinc-800">{p}</span>
                  <button 
                    onClick={() => removePlayer(p)}
                    className="text-zinc-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {players.length === 0 && (
                <p className="text-sm text-zinc-400 text-center py-6">
                  {lang === "en" ? "No users added yet." : "Belum ada pemain."}
                </p>
              )}
            </div>
          </div>

          <button 
            onClick={() => setView("game")}
            className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2"
          >
            <Play size={18} /> {lang === "en" ? "Start Plunging" : "Mulai Bermain"}
          </button>
        </main>
      )}

      {/* VIEW 3: SETTINGS & DECK CONFIGURATION PAGE */}
      {view === "settings" && (
        <main className="flex-1 max-w-md mx-auto w-full bg-white/90 backdrop-blur-md rounded-t-[2rem] p-6 mt-4 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-xl font-black text-zinc-800 flex items-center gap-2">
              <Globe size={22} /> {lang === "en" ? "Game Dashboard" : "Pengaturan Game"}
            </h2>
            <button onClick={() => setView("game")} className="text-sm font-bold text-zinc-500 hover:text-black">
              {lang === "en" ? "Done" : "Selesai"}
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-6 pr-1">
            {/* Lang Segment Toggles */}
            <div>
              <label className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 block mb-2">
                {lang === "en" ? "Language Configuration" : "Pilihan Bahasa"}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
                <button 
                  onClick={() => setLang("en")}
                  className={`py-2 text-sm font-bold rounded-lg transition-all ${lang === "en" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
                >
                  English (EN)
                </button>
                <button 
                  onClick={() => setLang("id")}
                  className={`py-2 text-sm font-bold rounded-lg transition-all ${lang === "id" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
                >
                  Indonesia (ID)
                </button>
              </div>
            </div>

            {/* Custom Prompt Ingestion Interface */}
            <div className="border-t pt-4">
              <label className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 block mb-2">
                {lang === "en" ? "Append Custom Cards" : "Tambah Pertanyaan Kustom"}
              </label>
              <div className="space-y-2">
                <select 
                  value={newQuestionLevel}
                  onChange={(e) => setNewQuestionLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm bg-white text-zinc-800"
                >
                  <option value="lvl1">{lang === "en" ? "Level 1: Surface Icebreakers" : "Level 1: Ringan"}</option>
                  <option value="lvl2">{lang === "en" ? "Level 2: Deep Dive" : "Level 2: Mendalam"}</option>
                  <option value="lvl3">{lang === "en" ? "Level 3: Absolute Plunge" : "Level 3: Sangat Intim"}</option>
                </select>
                <textarea 
                  rows={2}
                  placeholder={lang === "en" ? "Write a compelling question..." : "Tulis pertanyaan baru..."}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-800 text-sm bg-white text-zinc-800"
                />
                <button 
                  onClick={addCustomQuestion}
                  className="w-full bg-zinc-900 text-white text-sm font-bold py-2 rounded-xl hover:bg-zinc-800 transition"
                >
                  {lang === "en" ? "Add to Deck Stack" : "Masukkan ke Tumpukan"}
                </button>
              </div>
            </div>

            {/* Live Prompt Verification Management Matrix */}
            <div className="border-t pt-4">
              <label className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 block mb-3">
                {lang === "en" ? "Active Prompt Inventories" : "Daftar Pertanyaan Aktif"}
              </label>
              
              {["lvl1", "lvl2", "lvl3"].map((lvl) => (
                <div key={lvl} className="mb-4">
                  <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-tight mb-2">
                    {lvl.toUpperCase()} ({customQuestions[lang][lvl].length})
                  </h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                    {customQuestions[lang][lvl].map((q, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-2 text-xs bg-white p-2 rounded-lg border border-zinc-100 shadow-sm">
                        <p className="text-zinc-700 flex-1">{q}</p>
                        <button 
                          onClick={() => removeCustomQuestion(lvl, idx)}
                          className="text-zinc-300 hover:text-red-500 flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

    </div>
  );
}