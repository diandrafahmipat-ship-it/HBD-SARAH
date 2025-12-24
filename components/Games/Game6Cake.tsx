"use client";

import { useGame } from "@/context/GameContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Game6() {
    const { gameState, setGameState, resetProgress, playSound } = useGame();

    // --- STATE ---
    const [candleClicks, setCandleClicks] = useState(0);
    const [isCandleOut, setIsCandleOut] = useState(false);
    const [showLetter, setShowLetter] = useState(false);
    const [letterContent, setLetterContent] = useState("");
    const [isSent, setIsSent] = useState(false);

    // --- LOGIC ---
    const handleCandleClick = () => {
        if (isCandleOut) return;

        const newClicks = candleClicks + 1;
        setCandleClicks(newClicks);
        playBlowSound(); // Placeholder FX

        if (newClicks >= 5) {
            // Candle Extinguished
            setIsCandleOut(true);
            setTimeout(() => {
                setShowLetter(true);
            }, 3000); // 3 Seconds Delay
        }
    };

    const playBlowSound = () => {
        // You would integrate actual audio here
        // For now, visual feedback is enough
    };

    const handleSendWA = async () => {
        if (!letterContent.trim()) {
            alert("Tulis sesuatu yang indah dulu dong... 🥺");
            return;
        }

        // Copy to Clipboard
        try {
            await navigator.clipboard.writeText(letterContent);
            alert("Pesan berhasil disalin! Mengalihkan ke WhatsApp...");

            // Open WhatsApp
            // Replace with actual phone number if known, or generic share
            // "Isla" (Sarah) - User didn't provide number, using generic wa.me to prompt contact selection or just open app
            // Better: use specific number if user provided, defaulting to general intent.
            // Since I don't have the number, I'll use a generic link that opens WA to pick a contact or empty number.
            // A better UX might be just opening WA app protocol if mobile, or web.whatsapp.

            const encodedText = encodeURIComponent(letterContent);
            window.open(`https://wa.me/?text=${encodedText}`, '_blank');

            setIsSent(true);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert("Gagal menyalin teks. Coba salin manual ya sayang.");
        }
    };

    const handleReset = () => {
        if (confirm("Yakin ingin mengulang dari awal? Semua kenangan akan direset!")) {
            resetProgress();
        }
    };

    const handleMenu = () => {
        setGameState(prev => ({ ...prev, currentLevel: 0 }));
    };

    return (
        <div className="w-full min-h-screen bg-[#1a0505] text-white overflow-hidden relative flex flex-col items-center justify-center font-sans">

            {/* BACKGROUND ANIMATION */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a0808] via-[#000000] to-[#2a0808] opacity-80" />
                {/* Floating Particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-[#ffd700] rounded-full opacity-20 blur-xl"
                        style={{
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            top: Math.random() * 100 + "%",
                            left: Math.random() * 100 + "%",
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* STAGE 1: THE CAKE */}
                {!showLetter && (
                    <motion.div
                        key="cake-stage"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -50, filter: "blur(10px)" }}
                        transition={{ duration: 1.5 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <h1 className="text-4xl lg:text-6xl font-dancing text-[#ffd700] mb-8 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] text-center">
                            Happy Sweet 15th <br /> Sarah Sayang ❤️
                        </h1>

                        {/* CAKE CONTAINER */}
                        <div className="relative mt-8 group cursor-pointer" onClick={handleCandleClick}>

                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="relative flex flex-col items-center"
                            >
                                {/* --- TIER 3 (TOP with Candle) --- */}
                                <div className="w-32 h-16 bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] rounded-lg relative shadow-lg z-30 flex items-center justify-center border-b-4 border-[#ff7eb3]/20">
                                    {/* Frosting */}
                                    <div className="absolute -top-2 w-full flex justify-center space-x-1">
                                        {[...Array(7)].map((_, i) => (
                                            <div key={i} className="w-5 h-6 bg-white rounded-b-full shadow-sm" />
                                        ))}
                                    </div>

                                    {/* CANDLE (No Number) */}
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                                        <div className="w-4 h-20 bg-gradient-to-b from-yellow-100 to-yellow-400 rounded-sm shadow-md flex flex-col justify-center items-center">
                                            {/* Striped Pattern */}
                                            <div className="w-full h-2 bg-red-400/30 mt-2 rotate-12" />
                                            <div className="w-full h-2 bg-red-400/30 mt-2 rotate-12" />
                                            <div className="w-full h-2 bg-red-400/30 mt-2 rotate-12" />
                                        </div>

                                        {/* FLAME */}
                                        {!isCandleOut && (
                                            <motion.div
                                                className="absolute -top-10 left-1/2 -translate-x-1/2 w-6 h-10 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 rounded-[50%] blur-[2px] shadow-[0_0_30px_orange]"
                                                animate={{
                                                    scale: [1, 1.2, 0.9, 1.1, 1],
                                                    opacity: 1 - (candleClicks * 0.2),
                                                    height: [40, 45, 38, 42].map(h => h * (1 - (candleClicks * 0.15))),
                                                    rotate: [-2, 2, -1, 1, 0]
                                                }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                            >
                                                <div className="absolute inset-0 bg-white/60 blur-sm rounded-full animate-pulse transform scale-50 translate-y-2"></div>
                                            </motion.div>
                                        )}

                                        {/* SMOKE */}
                                        {isCandleOut && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                                animate={{ opacity: [0.6, 0], y: -80, scale: 2 }}
                                                transition={{ duration: 3 }}
                                                className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl text-gray-300 blur-sm"
                                            >
                                                ☁️
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* --- TIER 2 (MIDDLE) --- */}
                                <div className="w-48 h-20 bg-gradient-to-r from-[#ff758c] to-[#ff7eb3] rounded-lg relative shadow-xl -mt-2 z-20 flex items-center justify-center border-b-4 border-[#ff7eb3]/30">
                                    <div className="absolute -top-2 w-full flex justify-center space-x-1">
                                        {[...Array(9)].map((_, i) => (
                                            <div key={i} className="w-6 h-7 bg-white rounded-b-full shadow-sm" />
                                        ))}
                                    </div>
                                    {/* Decoration dots */}
                                    <div className="flex space-x-6">
                                        {[...Array(4)].map((_, i) => <div key={i} className="w-3 h-3 bg-yellow-200 rounded-full shadow-inner" />)}
                                    </div>
                                </div>

                                {/* --- TIER 1 (BOTTOM) --- */}
                                <div className="w-64 h-24 bg-gradient-to-r from-[#ff4d6d] to-[#c9184a] rounded-lg relative shadow-2xl -mt-2 z-10 flex items-center justify-center border-b-4 border-black/10">
                                    <div className="absolute -top-2 w-full flex justify-center space-x-1">
                                        {[...Array(11)].map((_, i) => (
                                            <div key={i} className="w-7 h-8 bg-white rounded-b-full shadow-sm" />
                                        ))}
                                    </div>
                                    {/* Ribbon */}
                                    <div className="w-full h-4 bg-white/20 absolute bottom-8 backdrop-blur-sm"></div>
                                    <div className="text-3xl filter drop-shadow-md">🍓 🍫 🍒</div>
                                </div>

                            </motion.div>
                        </div>

                        <p className="mt-12 text-pink-200/60 font-caveat text-xl animate-pulse">
                            {isCandleOut ? "..." : `Tiup lilinnya... (${5 - candleClicks}x)`}
                        </p>
                    </motion.div>
                )}

                {/* STAGE 2: LETTER WRITING */}
                {showLetter && (
                    <motion.div
                        key="letter-stage"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="relative z-20 w-full max-w-2xl px-4 flex flex-col items-center"
                    >
                        <div className="bg-[#fff1f2] text-[#5c0b0b] p-8 rounded-3xl shadow-[0_0_60px_rgba(255,105,180,0.4)] w-full relative overflow-hidden">
                            {/* Paper Texture Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 mix-blend-multiply pointer-events-none"></div>

                            <h2 className="text-3xl font-dancing text-[#5c0b0b] mb-6 text-center">
                                Isi Harapan & Pesanmu ❤️
                            </h2>

                            {/* TEXTAREA */}
                            <textarea
                                value={letterContent}
                                onChange={(e) => setLetterContent(e.target.value)}
                                placeholder="Tuliskan semua harapanmu di umur 15 ini, dan apa yang ingin kamu sampaikan padaku..."
                                className="w-full h-48 bg-transparent border-b-2 border-[#5c0b0b]/20 focus:border-[#5c0b0b] outline-none resize-none font-caveat text-xl lg:text-2xl leading-relaxed p-2 placeholder:text-[#5c0b0b]/30"
                            />

                            {/* ACTIONS */}
                            {!isSent ? (
                                <button
                                    onClick={handleSendWA}
                                    className="w-full mt-6 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                                >
                                    <span className="text-xl">📩</span> Kirim ke WhatsApp
                                </button>
                            ) : (
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleMenu}
                                        className="py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                                    >
                                        Kembali ke Menu
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        Mulai Dari Awal 🔁
                                    </button>
                                </div>
                            )}
                        </div>

                        {isSent && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 text-pink-200 font-caveat text-center"
                            >
                                Terima kasih sudah bermain... Aku sayang kamu selamanya! ❤️
                            </motion.p>
                        )}

                    </motion.div>
                )}

            </AnimatePresence>

        </div>
    );
}
