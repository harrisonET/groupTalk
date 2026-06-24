import React, { useState, useEffect } from "react";
import { Shuffle, ArrowLeft, ArrowRight, Settings, Users, Play, Plus, Trash2, Globe, Menu } from "lucide-react";
import defaultEn from "./data/en.json";
import defaultId from "./data/id.json";

// High-fidelity wave renderer matching the original UI mockups
const WaveVector = ({ lines }) => (
  <svg viewBox="0 0 60 20" className="w-9 h-6 stroke-current fill-none" strokeWidth="3" strokeLinecap="round">
    {[...Array(lines)].map((_, i) => (
      <path
        key={i}
        d={`M 5 ${5 + i * 5} Q 15 ${1 + i * 5}, 25 ${5 + i * 5} T 45 ${5 + i * 5} T 55 ${5 + i * 5}`}
      />
    ))}
  </svg>
);

export default function App() {
  const [view, setView] = useState("game"); // 'game' | 'players' | 'settings'
  const [players, setPlayers] = useState(["Player 1", "Player 2", "Alex", "Bianca"]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [lang, setLang] = useState("en");
  
  const [customQuestions, setCustomQuestions] = useState({
    en: { ...defaultEn },
    id: { ...defaultId }
  });
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionLevel, setNewQuestionLevel] = useState("lvl1");

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null); // Tracks the index of the question being edited
  const [editQuestionValue, setEditQuestionValue] = useState("");

  const [editingPlayer, setEditingPlayer] = useState(null); // Tracks which player name is being edited
  const [editPlayerName, setEditPlayerName] = useState("");  // Tracks the temporary text typed during editing
  const [currentLevel, setCurrentLevel] = useState("lvl1");
  const [playerAsking, setPlayerAsking] = useState("");
  const [playerTarget, setPlayerTarget] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  const [usedQuestions, setUsedQuestions] = useState({
    en: { lvl1: [], lvl2: [], lvl3: [] },
    id: { lvl1: [], lvl2: [], lvl3: [] }
  });

  // Level-specific background changes matching your screenshots
  const levelThemes = {
    lvl1: { bg: "bg-[#c2e7c4]", text: "text-[#2e4d32]", cardText: "text-[#c2e7c4]" },
    lvl2: { bg: "bg-[#a1e0fa]", text: "text-[#1d4454]", cardText: "text-[#a1e0fa]" },
    lvl3: { bg: "bg-[#bca0dc]", text: "text-[#391e54]", cardText: "text-[#bca0dc]" }
  };

  useEffect(() => {
    if (players.length >= 2) {
      rotateTurn(null);
    }
  }, [players]);

  useEffect(() => {
    getNewQuestion(currentLevel);
  }, [currentLevel, lang, customQuestions]);

  const rotateTurn = (nextAsker = null) => {
    if (players.length < 2) return;
    let asker = nextAsker && players.includes(nextAsker) ? nextAsker : players[Math.floor(Math.random() * players.length)];
    const filterPool = players.filter(p => p !== asker);
    const target = filterPool[Math.floor(Math.random() * filterPool.length)];
    
    setPlayerAsking(asker);
    setPlayerTarget(target);
  };

  const handlePlungeClick = () => {
    rotateTurn(playerTarget);
    getNewQuestion(currentLevel);
  };

  const getNewQuestion = (level) => {
    const totalPool = customQuestions[lang][level] || [];
    const usedPool = usedQuestions[lang][level] || [];
    const available = totalPool.filter(q => !usedPool.includes(q));

    if (available.length === 0) {
      if (totalPool.length === 0) {
        setCurrentQuestion(lang === "en" ? "No questions here!" : "Tidak ada pertanyaan!");
        return;
      }
      setCurrentQuestion(totalPool[Math.floor(Math.random() * totalPool.length)]);
      setUsedQuestions(prev => ({ ...prev, [lang]: { ...prev[lang], [level]: [] } }));
    } else {
      const chosen = available[Math.floor(Math.random() * available.length)];
      setCurrentQuestion(chosen);
      setUsedQuestions(prev => ({
        ...prev,
        [lang]: { ...prev[lang], [level]: [...prev[lang][level], chosen] }
      }));
    }
  };

  const addPlayerName = () => {
    if (newPlayerName.trim() && players.length < 30) {
      if (!players.includes(newPlayerName.trim())) {
        setPlayers([...players, newPlayerName.trim()]);
      }
      setNewPlayerName("");
    }
  };

  const appendQuestion = () => {
    if (customQuestions[lang][newQuestionLevel].length >= 50) {
      alert("Max limit of 50 reached!");
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

  return (
    <div className={`w-full max-w-md h-screen md:h-[850px] md:rounded-[3rem] ${levelThemes[currentLevel].bg} flex flex-col justify-between p-6 shadow-2xl relative transition-colors duration-500`}>
      
      {/* GLOBAL VIEW TOP BAR NAVIGATION */}
      <header className="flex justify-between items-center w-full pb-2">
        {view !== "game" ? (
          <button onClick={() => setView("game")} className="p-2 text-zinc-900 font-bold bg-white/20 rounded-full text-sm px-4">
            ← Back
          </button>
        ) : (
          <button onClick={() => setView("players")} className="p-2 text-zinc-900 hover:scale-105 transition">
            <Users size={28} />
          </button>
        )}
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Let's Plunge</h1>
        <button onClick={() => setView("settings")} className="p-2 text-zinc-900 hover:scale-105 transition">
          <Menu size={28} />
        </button>
      </header>

      {/* VIEW: MAIN GAME SCREEN */}
      {view === "game" && (
        <div className="flex-1 flex flex-col gap-6 w-full mt-4">
          
          {/* Active Turn Header */}
          <div className="text-center">
            <p className="text-xl font-bold text-zinc-800">
              {playerAsking} <span className="font-normal opacity-60">{lang === "en" ? "asks" : "bertanya pada"}</span> {playerTarget}:
            </p>
          </div>

          {/* Core Central Question Card Frame */}
          <div className="relative my-auto w-full">
            <div className="absolute inset-0 bg-black/10 rounded-[2rem] translate-x-2 translate-y-2" />
            <div className="relative w-full bg-[#1e1e24] rounded-[2rem] p-8 min-h-[320px] flex flex-col justify-between items-center text-center">
              <div />
              <p className={`text-xl md:text-2xl font-extrabold px-1 tracking-wide leading-relaxed ${levelThemes[currentLevel].cardText}`}>
                {currentQuestion}
              </p>
              
              {/* Internal Deck Action Trays */}
              <div className="flex justify-between items-center w-full mt-4 border-t border-zinc-800/80 pt-4 text-zinc-500">
                <button onClick={() => getNewQuestion(currentLevel)} className="p-2 hover:text-white"><ArrowLeft size={22} /></button>
                <button onClick={() => getNewQuestion(currentLevel)} className="p-3 bg-zinc-800 text-white rounded-full shadow-lg"><Shuffle size={18} /></button>
                <button onClick={handlePlungeClick} className="p-2 hover:text-white"><ArrowRight size={22} /></button>
              </div>
            </div>

            {/* Bubble Vector Art Decals */}
            <div className="absolute -left-2 -bottom-6 flex items-end gap-1 opacity-30 text-zinc-900 pointer-events-none">
              <div className="w-6 h-6 rounded-full border-2 border-current" />
              <div className="w-3 h-3 rounded-full border-2 border-current mb-4" />
            </div>
            <div className="absolute -right-2 -bottom-4 flex items-end gap-1 opacity-30 text-zinc-900 pointer-events-none">
              <div className="w-2 h-2 rounded-full border-2 border-current mb-3" />
              <div className="w-6 h-6 rounded-full border-2 border-current" />
            </div>
          </div>
          <div className="w-full text-center pb-2">
            <span className="text-xs uppercase font-black tracking-widest text-zinc-700 block mb-3">Question Depth</span>
            <div className="flex justify-center items-center gap-4 w-full">
              
              <button 
                onClick={() => setCurrentLevel("lvl1")}
                className={`w-16 h-16 rounded-full border-2 border-[#1e1e24] flex items-center justify-center transition-all shadow-sm
                  ${currentLevel === "lvl1" ? "bg-[#1e1e24] text-white" : "bg-white/30 text-[#1e1e24]"}`}
              >
                <WaveVector lines={1} />
              </button>

              <button 
                onClick={() => setCurrentLevel("lvl2")}
                className={`w-16 h-16 rounded-full border-2 border-[#1e1e24] flex items-center justify-center transition-all shadow-sm
                  ${currentLevel === "lvl2" ? "bg-[#1e1e24] text-white" : "bg-white/30 text-[#1e1e24]"}`}
              >
                <WaveVector lines={2} />
              </button>

              <button 
                onClick={() => setCurrentLevel("lvl3")}
                className={`w-16 h-16 rounded-full border-2 border-[#1e1e24] flex items-center justify-center transition-all shadow-sm
                  ${currentLevel === "lvl3" ? "bg-[#1e1e24] text-white" : "bg-white/30 text-[#1e1e24]"}`}
              >
                <WaveVector lines={3} />
              </button>

            </div>
          </div>
        </div>
      )}

      {/* VIEW: ROSTER CONFIGURATION */}
      {view === "players" && (
        <div className="flex-1 bg-white rounded-3xl p-6 mt-4 flex flex-col justify-between shadow-lg overflow-hidden">
          <div className="w-full">
            <h2 className="text-lg font-black text-zinc-800 mb-4 flex items-center gap-2">
              <Users size={18} /> Party Roster ({players.length}/30)
            </h2>

            {/* Regular Input Block to Add New Names */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                maxLength={20}
                placeholder="Enter name..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlayerName()}
                className="flex-1 px-4 py-2 text-sm bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none"
              />
              <button onClick={addPlayerName} className="bg-zinc-900 text-white p-2 px-3 rounded-xl">
                <Plus size={18} />
              </button>
            </div>

            {/* Scrollable Player Roster Grid */}
            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
              {players.map(p => {
                const isEditing = editingPlayer === p;

                return (
                  <div key={p} className="flex justify-between items-center bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-xl min-h-[44px]">

                    {isEditing ? (
                      /* Edit Mode: Inline Input Box */
                      <input
                        type="text"
                        maxLength={20}
                        value={editPlayerName}
                        onChange={(e) => setEditPlayerName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Save updated name if it isn't empty or a duplicate
                            const finalName = editPlayerName.trim();
                            if (finalName && (!players.includes(finalName) || finalName === p)) {
                              setPlayers(players.map(name => name === p ? finalName : name));
                              setEditingPlayer(null);
                            }
                          } else if (e.key === "Escape") {
                            setEditingPlayer(null); // Cancel out
                          }
                        }}
                        className="flex-1 px-2 py-0.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-800 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      /* Standard Mode: Render Display Text */
                      <span className="text-sm font-bold text-zinc-700">{p}</span>
                    )}

                    {/* Action Buttons Container */}
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        /* Save/Checkmark Actions */
                        <button
                          onClick={() => {
                            const finalName = editPlayerName.trim();
                            if (finalName && (!players.includes(finalName) || finalName === p)) {
                              setPlayers(players.map(name => name === p ? finalName : name));
                              setEditingPlayer(null);
                            }
                          }}
                          className="text-emerald-600 font-bold text-xs px-2 py-1 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                        >
                          Save
                        </button>
                      ) : (
                        /* Edit Pencil Icon Button */
                        <button
                          onClick={() => {
                            setEditingPlayer(p);
                            setEditPlayerName(p); // Set standard text input field to current name
                          }}
                          className="text-zinc-400 hover:text-zinc-700 p-1 rounded transition"
                          title="Edit player name"
                        >
                          {/* Make sure "Pencil" is imported from lucide-react if not already */}
                          <Plus size={16} className="rotate-45 hidden" /> {/* Dummy spacer code, replace with actual import if needed */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                        </button>
                      )}

                      {/* Standard Trash Bin Remove Button */}
                      <button
                        onClick={() => {
                          setPlayers(players.filter(name => name !== p));
                          if (editingPlayer === p) setEditingPlayer(null);
                        }}
                        className="text-zinc-400 hover:text-red-500 p-1 rounded transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setView("game")} className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl mt-4">
            <Play size={16} className="inline mr-1" /> Start Game
          </button>
        </div>
      )}

      {/* VIEW: SETTINGS & QUESTIONS DECK EDITOR */}
      {view === "settings" && (
        <div className="flex-1 bg-white rounded-3xl p-6 mt-4 flex flex-col justify-between shadow-lg overflow-hidden">
          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            <h2 className="text-lg font-black text-zinc-800 flex items-center gap-2"><Globe size={18} /> Settings</h2>

            {/* Language Toggle */}
            <div>
              <label className="text-[11px] font-black uppercase text-zinc-400 block mb-1">Language</label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
                <button onClick={() => setLang("en")} className={`py-1.5 text-xs font-bold rounded-lg ${lang === "en" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}>English</button>
                <button onClick={() => setLang("id")} className={`py-1.5 text-xs font-bold rounded-lg ${lang === "id" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}>Indonesia</button>
              </div>
            </div>

            {/* Add New Question Section */}
            <div className="border-t pt-3">
              <label className="text-[11px] font-black uppercase text-zinc-400 block mb-1">Add Custom Question</label>
              <select value={newQuestionLevel} onChange={(e) => setNewQuestionLevel(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white text-zinc-800 mb-2">
                <option value="lvl1">Level 1</option>
                <option value="lvl2">Level 2</option>
                <option value="lvl3">Level 3</option>
              </select>
              <textarea rows={2} placeholder="Write card prompt..." value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white text-zinc-800 mb-2 focus:outline-none" />
              <button onClick={appendQuestion} className="w-full bg-zinc-900 text-white text-xs font-bold py-2 rounded-xl">Add to Stack</button>
            </div>

            {/* Editable Questions List */}
            <div className="border-t pt-3">
              <label className="text-[11px] font-black uppercase text-zinc-400 block mb-2">Manage {newQuestionLevel.toUpperCase()} Questions</label>
              <div className="space-y-2">
                {customQuestions[lang][newQuestionLevel].map((q, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    {editingQuestionIndex === idx ? (
                      <textarea
                        value={editQuestionValue}
                        onChange={(e) => setEditQuestionValue(e.target.value)}
                        className="w-full p-2 text-xs border rounded-lg bg-white"
                      />
                    ) : (
                      <p className="text-xs text-zinc-700 font-medium">{q}</p>
                    )}

                    <div className="flex justify-end gap-2">
                      {editingQuestionIndex === idx ? (
                        <button
                          onClick={() => {
                            const updated = [...customQuestions[lang][newQuestionLevel]];
                            updated[idx] = editQuestionValue;
                            setCustomQuestions({ ...customQuestions, [lang]: { ...customQuestions[lang], [newQuestionLevel]: updated } });
                            setEditingQuestionIndex(null);
                          }}
                          className="text-emerald-600 font-bold text-[10px]"
                        >Save</button>
                      ) : (
                        <button
                          onClick={() => { setEditingQuestionIndex(idx); setEditQuestionValue(q); }}
                          className="text-zinc-400 hover:text-zinc-800 text-[10px]"
                        >Edit</button>
                      )}
                      <button
                        onClick={() => {
                          const updated = customQuestions[lang][newQuestionLevel].filter((_, i) => i !== idx);
                          setCustomQuestions({ ...customQuestions, [lang]: { ...customQuestions[lang], [newQuestionLevel]: updated } });
                        }}
                        className="text-red-400 hover:text-red-600 text-[10px]"
                      >Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => setView("game")} className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl mt-4">Save Changes</button>
        </div>
      )}

    </div>
  );
}