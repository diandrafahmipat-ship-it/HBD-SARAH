"use client";

import { useGame } from "@/context/GameContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// --- ASSETS & DATA ---
const FLOWERS = [
    { id: 1, icon: "🌹", name: "Red Rose", desc: "Classic Romance" },
    { id: 2, icon: "🌻", name: "Sunflower", desc: "Bright & Cheerful" },
    { id: 3, icon: "🌷", name: "Pink Tulip", desc: "Gentle Love" },
    { id: 4, icon: "🌸", name: "Cherry Blossom", desc: "New Beginnings" },
    { id: 5, icon: "💐", name: "Mixed Bouquet", desc: "Everything Nice" },
    { id: 6, icon: "🥀", name: "Vintage Rose", desc: "Eternal Beauty" },
    { id: 7, icon: "💮", name: "White Flower", desc: "Pure Heart" },
    { id: 8, icon: "🌺", name: "Hibiscus", desc: "Delicate Charm" },
];

export default function Game2Flowers() {
    const { completeLevel } = useGame();
    const [selectedFlower, setSelectedFlower] = useState<number | null>(null);
    const [showProposal, setShowProposal] = useState(false);
    const [storyOpen, setStoryOpen] = useState(false);
    const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
    const [isExiting, setIsExiting] = useState(false);

    // --- SOUND EFFECTS (Placeholder) ---
    // const playSound = (type: string) => { ... }

    // --- LEAF ANIMATION ---
    // Generate random leaves
    const [leaves, setLeaves] = useState<any[]>([]);
    useEffect(() => {
        const newLeaves = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // %
            delay: Math.random() * 5,
            duration: 5 + Math.random() * 5,
            rotation: Math.random() * 360,
        }));
        setLeaves(newLeaves);
    }, []);

    // --- HANDLERS ---

    const handleFlowerClick = (flowerId: number) => {
        setSelectedFlower(flowerId);
        setTimeout(() => setShowProposal(true), 500); // Slight delay for effect
    };

    const handleNoHover = () => {
        // Move button randomly within a constrained area
        const x = (Math.random() - 0.5) * 300;
        const y = (Math.random() - 0.5) * 300;
        setNoButtonPosition({ x, y });
    };

    const handleYes = () => {
        // Confetti explosion
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff0000', '#ffa500', '#ff69b4'] // Red/Orange/Pink themes
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff0000', '#ffa500', '#ff69b4']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        setShowProposal(false);
        setTimeout(() => setStoryOpen(true), 500);
    };

    const handleNextLevel = () => {
        setIsExiting(true);
        setTimeout(() => {
            completeLevel(2);
        }, 1500);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#2a0808] text-white flex flex-col items-center justify-center">

            {/* --- RED GALAXY BACKGROUND --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a0808] via-[#5c0b0b] to-[#2a0808]"></div>

                {/* Stars */}
                <div className="absolute w-full h-full">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="absolute bg-white rounded-full opacity-60 animate-pulse"
                            style={{
                                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
                                animationDelay: `${Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>

                {/* --- FALLING ORANGE LEAVES --- */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    {leaves.map((leaf) => (
                        <motion.div
                            key={leaf.id}
                            initial={{ y: -100, x: `${leaf.x}vw`, opacity: 0, rotate: leaf.rotation }}
                            animate={{
                                y: "110vh",
                                opacity: [0, 1, 1, 0],
                                rotate: leaf.rotation + 360,
                                x: `${leaf.x + (Math.random() * 10 - 5)}vw` // Sway slightly
                            }}
                            transition={{
                                duration: leaf.duration,
                                delay: leaf.delay,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute text-orange-500/70 text-2xl drop-shadow-lg"
                        >
                            🍂
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <AnimatePresence>
                {!isExiting && (
                    <motion.div
                        className="relative z-20 w-full max-w-5xl p-4 flex flex-col items-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 1 } }}
                    >

                        {/* Title - Compact on Mobile */}
                        {!storyOpen && !showProposal && (
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center mb-4 lg:mb-8"
                            >
                                <h1 className="text-2xl lg:text-5xl font-dancing text-[#ffd700] drop-shadow-[0_0_15px_rgba(255,100,50,0.8)] mb-1 lg:mb-2">
                                    The Flower Shop
                                </h1>
                                <p className="text-pink-200/80 font-sans tracking-widest text-[10px] lg:text-sm uppercase">
                                    Pilih bunga untuk dia yang spesial
                                </p>
                            </motion.div>
                        )}

                        {/* FLOWERS GRID - Responsive Compact */}
                        {!storyOpen && !showProposal && (
                            <div className="grid grid-cols-4 gap-2 lg:gap-4 w-full px-2">
                                {FLOWERS.map((flower, idx) => (
                                    <motion.button
                                        key={flower.id}
                                        onClick={() => handleFlowerClick(flower.id)}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1 + idx * 0.1 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="group relative h-28 lg:h-48 bg-white/5 backdrop-blur-md rounded-xl lg:rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col items-center justify-center gap-1 lg:gap-2 hover:bg-white/10 transition-all duration-300"
                                    >
                                        <div className="text-3xl lg:text-6xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                            {flower.icon}
                                        </div>
                                        <div className="text-center w-full px-1">
                                            <h3 className="text-white font-righteous text-[10px] lg:text-lg leading-tight group-hover:text-pink-300 transition-colors truncate w-full">{flower.name}</h3>
                                            <p className="text-[8px] lg:text-xs text-white/50 hidden lg:block">{flower.desc}</p>
                                        </div>
                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* PROPOSAL MODAL */}
                        {showProposal && (
                            <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="bg-[#5c0b0b]/90 backdrop-blur-xl p-8 rounded-[30px] border-2 border-[#ffd700]/50 shadow-[0_0_50px_rgba(255,0,0,0.3)] text-center max-w-md relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>

                                <div className="relative z-10 font-sans">
                                    {/* Dynamic Hand Holding Flower */}
                                    <div className="relative h-32 mb-6 flex items-end justify-center">
                                        <div className="text-8xl animate-pulse delay-100 absolute bottom-0">
                                            🫴
                                        </div>
                                        {/* The Selected Flower */}
                                        <motion.div
                                            initial={{ y: 50, opacity: 0, scale: 0 }}
                                            animate={{ y: -40, opacity: 1, scale: 1.2 }}
                                            transition={{ delay: 0.5, type: "spring" }}
                                            className="text-7xl drop-shadow-2xl z-20"
                                        >
                                            {FLOWERS.find(f => f.id === selectedFlower)?.icon}
                                        </motion.div>
                                    </div>

                                    <h2 className="text-2xl lg:text-3xl font-dancing text-white mb-6 leading-relaxed">
                                        Maukah dirimu menjadi <br /> <span className="text-[#ffd700]">Pasanganku?</span>
                                    </h2>

                                    <div className="flex flex-col gap-4 items-center w-full">
                                        <button
                                            onClick={handleYes}
                                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all hover:shadow-[0_0_20px_rgba(255,105,180,0.6)]"
                                        >
                                            YES, I Will! 🥰
                                        </button>

                                        <motion.button
                                            onMouseEnter={handleNoHover}
                                            animate={{ x: noButtonPosition.x, y: noButtonPosition.y }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="px-6 py-2 text-white/50 text-sm hover:text-white transition-colors"
                                        >
                                            Ngga mau ah... :p
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STORY SUCCESS VIEW - Flexbox for Perfect Scrolling */}
                        {storyOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#1a0505]/95 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-pink-500/30 shadow-2xl w-full max-w-2xl text-center relative h-[80vh] flex flex-col mx-4 overflow-hidden"
                            >
                                <div className="absolute -top-4 -left-4 lg:-top-6 lg:-left-6 text-4xl lg:text-6xl animate-pulse delay-700 z-50">🌺</div>
                                <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 text-4xl lg:text-6xl animate-pulse delay-1000 z-50">🍂</div>

                                {/* FIXED HEADER */}
                                <div className="p-6 pb-2 border-b border-white/10 shrink-0">
                                    <h2 className="text-2xl lg:text-4xl font-dancing text-[#ffd700]">
                                        Awal Kisah Cinta Kita...
                                    </h2>
                                </div>

                                {/* SCROLLABLE CONTENT */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 text-pink-100/90 font-caveat text-lg lg:text-2xl leading-relaxed lg:leading-loose space-y-4 lg:space-y-6 text-justify">
                                    <p>
                                        Seiring berjalannya waktu semenjak kita berdua bertemu... timbul rasa cinta dan sayang kepada dirimu wahai sayangku...
                                        Awalnya aku ingin menyembunyikan rasa cintaku, namun hati ini tak bisa berbohong... :p
                                    </p>
                                    <p>
                                        Kita bertemu disaat kita masing-masing membawa luka lama. Tapi aku yakin, kita berbeda.
                                        Kita bisa saling menyembuhkan dan memberi kehangatan dikala angin dingin menyerbu...
                                    </p>
                                    <p>
                                        Dan tibalah saat itu, dengan segenap keberanian aku bertanya... <span className="text-[#ffd700] font-bold">"Maukah kamu jadi pasanganku?"</span>
                                        Dan jawabanmu... <span className="text-[#ffd700] font-bold">"Aku bersedia"</span>... membuat duniaku berhenti sejenak.
                                        Bahagia itu masih terasa hingga detik ini. (⁠づ⁠｡⁠◕⁠‿⁠‿⁠◕⁠｡⁠)⁠づ
                                    </p>
                                </div>

                                {/* FIXED FOOTER */}
                                <div className="p-6 pt-4 border-t border-white/10 shrink-0 bg-[#1a0505]/50">
                                    <button
                                        onClick={handleNextLevel}
                                        className="w-full lg:w-auto px-8 lg:px-10 py-3 bg-white text-[#5c0b0b] rounded-full font-bold text-base lg:text-lg hover:bg-[#ffd700] hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                    >
                                        Lanjut ke Level Berikutnya ➡️
                                    </button>
                                </div>

                            </motion.div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>

            {/* EXIT TRANSITION OVERLAY */}
            {isExiting && (
                <motion.div
                    className="absolute inset-0 bg-[#2a0808] z-[100] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-6xl"
                    >
                        ❤️
                    </motion.div>
                </motion.div>
            )}

        </div>
    );
}
