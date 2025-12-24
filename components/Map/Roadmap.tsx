"use client";

import { useGame } from "@/context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function Roadmap() {
    const { gameState, setGameState } = useGame();
    const [showPopup, setShowPopup] = useState(false);
    const [windowOpen, setWindowOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [duckClicks, setDuckClicks] = useState(0);

    const handleDuckClick = () => {
        const newCount = duckClicks + 1;
        setDuckClicks(newCount);
        if (newCount === 10) {
            alert("🛠️ Developer Mode Activated! All Levels Unlocked. 🔓");
            setGameState(prev => ({
                ...prev,
                unlockedLevels: [0, 1, 2, 3, 4, 5, 6]
            }));
        }
    };

    // Winding path positions
    const levels = [
        { id: 0, x: 50, y: 110, label: "Start" }, // Adjusted off-screen
        { id: 1, x: 20, y: 85, label: "Permulaan" },
        { id: 2, x: 60, y: 70, label: "Pilihan Hati" },
        { id: 3, x: 25, y: 55, label: "Mencari Jejak" },
        { id: 4, x: 70, y: 40, label: "Kenangan Abadi" },
        { id: 5, x: 35, y: 30, label: "Teka-Teki Cinta" },
        { id: 6, x: 80, y: 20, label: "Harapan Kita" },
    ];

    useEffect(() => {
        // Trigger window opening animation on mount
        setTimeout(() => setWindowOpen(true), 500);

        // Show popup only if it hasn't been shown for this specific version of the roadmap
        if (gameState.unlockedLevels.length === 1 && !localStorage.getItem("intro_popup_vMobileFix2")) {
            setTimeout(() => setShowPopup(true), 3000);
            localStorage.setItem("intro_popup_vMobileFix2", "true");
        }
    }, [gameState.unlockedLevels]);

    const handleLevelClick = (level: number) => {
        if (gameState.unlockedLevels.includes(level)) {
            setGameState(prev => ({ ...prev, currentLevel: level }));
        }
    };

    const generatePath = () => {
        let d = `M ${levels[1].x} ${levels[1].y}`;
        for (let i = 1; i < levels.length - 1; i++) {
            const curr = levels[i];
            const next = levels[i + 1];
            const midX = (curr.x + next.x) / 2;
            const midY = (curr.y + next.y) / 2;
            d += ` Q ${curr.x} ${midY}, ${midX} ${midY} T ${next.x} ${next.y}`;
        }
        return d;
    };

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#2a0808] text-white">

            {/* --- SCENE BACKGROUND (Visible through window) --- */}
            <div className="absolute inset-0 z-0">
                {/* Deep Space / Romantic Sky Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a0808] via-[#5c0b0b] to-[#2a0808]" />

                {/* Background Objects */}
                <div className="absolute inset-0 overflow-hidden">

                    {/* Sun Animation (Top Left) ☀️ */}
                    <motion.div
                        className="absolute top-[-5%] left-[-5%] z-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    >
                        {/* Sun Body */}
                        <div className="relative w-24 h-24 lg:w-48 lg:h-48 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm shadow-[0_0_50px_rgba(255,215,0,0.6)]"></div>
                        {/* Sun Rays */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute top-1/2 left-1/2 w-[200%] h-1 bg-yellow-200/20"
                                style={{
                                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Moon Animation (Bottom Right) 🌙 */}
                    <motion.div
                        className="absolute bottom-[-5%] right-[-5%] z-0"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="w-20 h-20 lg:w-40 lg:h-40 bg-gray-200 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] relative overflow-hidden">
                            {/* Craters */}
                            <div className="absolute top-4 left-6 w-3 h-3 lg:w-4 lg:h-4 bg-gray-300 rounded-full opacity-50"></div>
                            <div className="absolute bottom-8 right-8 w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 rounded-full opacity-50"></div>
                            <div className="absolute top-10 right-4 w-2 h-2 lg:w-3 lg:h-3 bg-gray-300 rounded-full opacity-50"></div>
                        </div>
                    </motion.div>

                    {/* Distant Stars */}
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={`star-${i}`}
                            className="absolute bg-white rounded-full opacity-60"
                            style={{
                                width: Math.random() * 2 + "px",
                                height: Math.random() * 2 + "px",
                                top: Math.random() * 100 + "%",
                                left: Math.random() * 100 + "%",
                            }}
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                        />
                    ))}

                    {/* ROCKET DUCK ANIMATION 🦆🚀 (Responsive Size: text-2xl base, text-6xl lg) */}
                    <motion.div
                        onClick={handleDuckClick}
                        className="absolute text-2xl lg:text-6xl z-10 filter drop-shadow-lg cursor-pointer"
                        initial={{ x: "-10vw", y: "80vh", rotate: 45 }}
                        animate={{
                            x: ["-10vw", "110vw"],
                            y: ["80vh", "20vh"],
                            rotate: [45, 10]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: 5
                        }}
                    >
                        🦆🚀
                        <div className="absolute top-full left-1/4 w-2 lg:w-4 h-8 lg:h-16 bg-gradient-to-t from-transparent to-orange-500 blur-sm opacity-80" />
                    </motion.div>

                    {/* Path */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none z-10"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{ opacity: windowOpen ? 1 : 0, transition: 'opacity 1s' }}
                    >
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fff" />
                                <stop offset="50%" stopColor="#ff00cc" />
                                <stop offset="100%" stopColor="#fff" />
                            </linearGradient>
                            <filter id="glowPath">
                                <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="rgba(100,0,0,0.5)"
                            strokeWidth="0.5" // Thinner base stroke
                            className="lg:stroke-[1px]" // Thicker on large screens
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                        />

                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="rgba(255, 100, 150, 0.6)"
                            strokeWidth="0.4" // Thinner base stroke
                            className="lg:stroke-[0.8px]"
                            strokeLinecap="round"
                            strokeDasharray="2 2"
                            vectorEffect="non-scaling-stroke"
                        />

                        <motion.path
                            d={generatePath()}
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="0.6" // Thinner base stroke
                            strokeLinecap="round"
                            className="lg:stroke-[1.2px]"
                            filter="url(#glowPath)"
                            vectorEffect="non-scaling-stroke"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: windowOpen ? 1 : 0 }}
                            transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: "loop", repeatDelay: 3 }}
                        />
                    </svg>
                </div>

                {/* Levels */}
                {levels.slice(1).map((level) => {
                    const isUnlocked = gameState.unlockedLevels.includes(level.id);
                    return (
                        <motion.div
                            key={level.id}
                            className="absolute z-20"
                            style={{ left: `${level.x}%`, top: `${level.y}%`, transform: 'translate(-50%, -50%)' }}
                            initial={{ scale: 0 }}
                            animate={{ scale: windowOpen ? 1 : 0 }}
                            transition={{ delay: 1 + level.id * 0.2, type: "spring" }}
                        >
                            {/* Name Tag: Tiny base size (text-[8px]), Normal on LG */}
                            <motion.div
                                className="absolute -top-6 lg:-top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 lg:px-4 py-0.5 lg:py-1 bg-gradient-to-r from-red-900 to-pink-900 border border-pink-500/50 rounded-full text-[8px] lg:text-sm font-bold tracking-widest text-white shadow-2xl z-30 opacity-90"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2 + level.id * 0.2 }}
                            >
                                {level.label}
                            </motion.div>

                            {/* Diamond Node: Small base size (w-10), large on LG */}
                            <div
                                onClick={() => handleLevelClick(level.id)}
                                className={`relative w-10 h-10 lg:w-24 lg:h-24 rotate-45 transform transition-all duration-300 cursor-pointer group z-20
                            ${isUnlocked ? "hover:scale-110" : "grayscale opacity-70"}
                        `}
                            >
                                {/* Pulsing Backing */}
                                {isUnlocked && (
                                    <div className="absolute inset-[-5px] lg:inset-[-10px] bg-red-500/30 blur-md lg:blur-xl rounded-full animate-pulse"></div>
                                )}

                                {/* OPAQUE BACKING LAYER to Block Map Line - Red color matches bg */}
                                <div className={`absolute inset-0 bg-[#2a0808] z-0 transition-all duration-300
                             ${isUnlocked ? "bg-[#2a0808]" : "bg-[#1a0505]"}
                          `}></div>

                                <div className={`absolute inset-0 border-2 lg:border-4 box-border shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10
                                ${isUnlocked ? "bg-gradient-to-br from-[#ff0055] to-[#550022] border-pink-300" : "bg-gray-800 border-gray-600"}
                          `}></div>

                                <div className="absolute inset-0 flex items-center justify-center -rotate-45 z-20">
                                    <span className={`text-base lg:text-3xl font-righteous ${isUnlocked ? "text-white" : "text-gray-500"}`}>{level.id}</span>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* --- TITLE --- */}
            {/* Title Size: Base=2xl (Mobile), LG=7xl (Desktop). Pushed to very top. */}
            <div className="absolute top-2 lg:top-8 left-0 w-full z-30 pointer-events-none flex justify-center px-4">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="text-3xl lg:text-7xl text-[#ffd700] tracking-wider font-dancing text-center drop-shadow-md"
                    style={{
                        fontFamily: 'var(--font-dancing)',
                        textShadow: '0 0 10px #ff0055, 0 0 20px #ff0055'
                    }}
                >
                    Perjalanan Kita
                </motion.h1>
            </div>

            {/* --- WINDOW OVERLAY ANIMATION --- */}
            {/* Left Curtain: Width adjusted */}
            <motion.div
                className="absolute top-0 left-0 w-[40%] lg:w-[50%] h-full bg-[#5c0b0b] z-40 origin-left"
                initial={{ x: 0 }}
                animate={{
                    x: windowOpen ? "-85%" : "0%",
                }}
                transition={{ duration: 3, ease: "easeInOut" }}
            >
                {/* Sway Animation when open */}
                <motion.div
                    className="w-full h-full"
                    animate={{ rotate: windowOpen ? [0, 1, 0] : 0 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(0,0,0,0.2)_20px,rgba(0,0,0,0.2)_40px)]"></div>
                    <div className="absolute right-0 h-full w-4 lg:w-8 bg-gradient-to-l from-black/60 to-transparent"></div>
                    {/* Gold Tie: Smaller on mobile base */}
                    <div className="absolute top-1/2 right-2 lg:right-4 w-3 lg:w-6 h-12 lg:h-20 bg-yellow-500 rounded-full shadow-lg border border-yellow-300"></div>
                </motion.div>
            </motion.div>

            {/* Right Curtain */}
            <motion.div
                className="absolute top-0 right-0 w-[40%] lg:w-[50%] h-full bg-[#5c0b0b] z-40 origin-right"
                initial={{ x: 0 }}
                animate={{
                    x: windowOpen ? "85%" : "0%",
                }}
                transition={{ duration: 3, ease: "easeInOut" }}
            >
                {/* Sway Animation */}
                <motion.div
                    className="w-full h-full"
                    animate={{ rotate: windowOpen ? [0, -1, 0] : 0 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(0,0,0,0.2)_20px,rgba(0,0,0,0.2)_40px)]"></div>
                    <div className="absolute left-0 h-full w-4 lg:w-8 bg-gradient-to-r from-black/60 to-transparent"></div>
                    {/* Gold Tie */}
                    <div className="absolute top-1/2 left-2 lg:left-4 w-3 lg:w-6 h-12 lg:h-20 bg-yellow-500 rounded-full shadow-lg border border-yellow-300"></div>
                </motion.div>
            </motion.div>

            {/* Window Frame Vignette: Thinner on mobile base */}
            <div className="absolute inset-0 z-50 pointer-events-none box-border border-[10px] lg:border-[20px] border-[#2a0808] rounded-[20px] lg:rounded-[30px] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] opacity-60"></div>

            {/* Intro Popup: Responsive Text and Padding */}
            <AnimatePresence>
                {showPopup && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
                        <motion.div
                            className="bg-[#3a0505] p-6 lg:p-8 rounded-tr-[30px] lg:rounded-tr-[50px] rounded-bl-[30px] lg:rounded-bl-[50px] shadow-[0_0_50px_rgba(255,20,20,0.6)] w-full max-w-sm lg:max-w-md text-center border-2 border-[#ffd700]"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <h2 className="text-2xl lg:text-4xl font-dancing text-[#ffd700] mb-3 lg:mb-4 drop-shadow-md" style={{ fontFamily: 'var(--font-dancing)' }}>Selamat Datang</h2>
                            <p className="text-pink-100 font-caveat text-base lg:text-xl mb-6 lg:mb-8 leading-relaxed">
                                Di balkon istana cinta kita... <br />
                                Lihatlah pemandangan indah perjalanan kita. <br />
                                Mulailah dari langkah pertama.
                            </p>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="px-6 lg:px-10 py-2 lg:py-3 bg-[#ffd700] text-[#5c0000] rounded-full font-bold hover:bg-yellow-400 hover:scale-105 transition-all shadow-lg text-sm lg:text-base"
                            >
                                Mulai 🌹
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
