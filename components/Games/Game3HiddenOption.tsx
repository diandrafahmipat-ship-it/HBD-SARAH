"use client";

import { useGame } from "@/context/GameContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Game Constants
const GAME_WIDTH = 100; // %
const SPAWN_RATE = 800; // ms
const GRAVITY_SPEED = 0.4; // % per frame approx
const PLAYER_WIDTH_PERCENT = 15; // Width of the hand in %
const PLAYER_HITBOX_PERCENT = 12; // Slightly smaller than visual

type ItemType = "PHONE" | "BOMB" | "FOOD";

interface FallingItem {
    id: number;
    x: number; // %
    y: number; // %
    type: ItemType;
    speed: number;
    icon: string;
    rotation: number;
}

const FOOD_ICONS = ["🍔", "🍕", "🌭", "🍟", "🍩", "🥤", "🍗"];

export default function Game3CatchPhone() {
    const { completeLevel } = useGame();

    // Game Logic State (Refs for Loop)
    const itemsRef = useRef<FallingItem[]>([]);
    const playerXRef = useRef(50);
    const scoreRef = useRef(0);
    const livesRef = useRef(4);

    // React Render State
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [renderScore, setRenderScore] = useState(0);
    const [renderLives, setRenderLives] = useState(4);
    const [renderItems, setRenderItems] = useState<FallingItem[]>([]); // Synced for render

    const requestRef = useRef<number>();
    const lastSpawnTime = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- GAME LOOP ---
    const updateGame = useCallback((time: number) => {
        if (!isPlaying) return; // Stop loop if not playing

        // 1. Spawning
        if (time - lastSpawnTime.current > SPAWN_RATE) {
            spawnItem();
            lastSpawnTime.current = time;
        }

        // 2. Update Items & Check Collision
        const currentItems = itemsRef.current;
        const nextItems: FallingItem[] = [];
        const finalCollisions: FallingItem[] = [];

        currentItems.forEach(item => {
            const newY = item.y + item.speed;
            const pX = playerXRef.current;

            // Checking collision logic
            const isColliding =
                newY > 80 && // Top of Hit Zone
                newY < 95 && // Bottom of Hit Zone
                item.x > (pX - PLAYER_HITBOX_PERCENT / 2) &&
                item.x < (pX + PLAYER_HITBOX_PERCENT / 2);

            if (isColliding) {
                finalCollisions.push(item);
                // Do NOT add to nextItems -> Remove it
            } else if (newY < 105) {
                // Keep falling
                nextItems.push({ ...item, y: newY, rotation: item.rotation + 1 });
            }
        });

        // 3. Update Ref State
        itemsRef.current = nextItems;
        setRenderItems(nextItems); // Trigger Render for visual

        // 4. Handle Collisions (Side Effects)
        finalCollisions.forEach(item => {
            if (item.type === "PHONE") {
                scoreRef.current += 1;
                setRenderScore(scoreRef.current);
                if (scoreRef.current >= 5) {
                    handleWin();
                }
            } else if (item.type === "BOMB") {
                livesRef.current -= 1;
                setRenderLives(livesRef.current);
                if (livesRef.current <= 0) {
                    handleGameOver();
                }
            }
            // Food is ignored
        });

        if (livesRef.current > 0 && scoreRef.current < 5) {
            requestRef.current = requestAnimationFrame(updateGame);
        }
    }, [isPlaying]); // Minimized dependencies using Refs

    // Start/Stop Loop
    useEffect(() => {
        if (isPlaying && !gameOver && !gameWon) {
            requestRef.current = requestAnimationFrame(updateGame);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, gameOver, gameWon, updateGame]);


    // --- HELPERS ---

    const spawnItem = () => {
        const rand = Math.random();
        let type: ItemType = "FOOD";
        let icon = FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)];
        let speed = 0.3 + Math.random() * 0.3;

        if (rand < 0.35) { // Increased phone chance slightly
            type = "PHONE";
            icon = "📱";
            speed = 0.4 + Math.random() * 0.2;
        } else if (rand < 0.6) {
            type = "BOMB";
            icon = "💣";
        }

        const newItem: FallingItem = {
            id: Date.now() + Math.random(),
            x: Math.random() * 90 + 5,
            y: -10,
            type,
            speed,
            icon,
            rotation: Math.random() * 360
        };

        itemsRef.current.push(newItem);
    };

    const handleWin = () => {
        setGameWon(true);
        setIsPlaying(false);
        confetti();
    };

    const handleGameOver = () => {
        setGameOver(true);
        setIsPlaying(false);
    };

    const startGame = () => {
        // Reset Logic
        scoreRef.current = 0;
        livesRef.current = 4;
        itemsRef.current = [];
        lastSpawnTime.current = performance.now();

        // Reset Render
        setRenderScore(0);
        setRenderLives(4);
        setRenderItems([]);

        setGameOver(false);
        setGameWon(false);
        setIsPlaying(true);
    };

    // --- INPUT HANDLERS ---
    const handleInput = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;
        let xPercent = (x / width) * 100;
        // Clamp
        xPercent = Math.max(0, Math.min(100, xPercent));
        playerXRef.current = xPercent; // Update logic ref
    };

    return (
        <div
            className="relative w-full h-screen overflow-hidden bg-[#2a0808] flex flex-col items-center justify-center font-sans select-none touch-none"
            onMouseMove={(e) => isPlaying && handleInput(e.clientX)}
            onTouchMove={(e) => isPlaying && handleInput(e.touches[0].clientX)}
            ref={containerRef}
        >
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a0808] via-[#5c0b0b] to-[#2a0808]"></div>
                {/* Stars */}
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute bg-white rounded-full opacity-40 animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3}px`, height: `${Math.random() * 3}px`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] opacity-5 pointer-events-none rotate-12">
                    📱
                </div>
            </div>

            {/* UI HEADER */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-start z-30">
                {/* Lives */}
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`text-3xl filter drop-shadow-lg transition-all duration-300 ${i < renderLives ? "opacity-100 scale-100" : "opacity-20 grayscale scale-75"}`}
                        >
                            ❤️
                        </div>
                    ))}
                </div>
                {/* Score */}
                <div className="flex flex-col items-end">
                    <div className="text-white/80 text-sm font-righteous uppercase tracking-widest">Phones Found</div>
                    <div className="text-4xl font-bold text-[#ffd700] drop-shadow-lg">
                        {renderScore} / 5
                    </div>
                </div>
            </div>

            {/* PLAYER HAND */}
            <div
                className="absolute bottom-10 z-30 pointer-events-none transition-transform duration-75"
                style={{
                    left: `${playerXRef.current}%`, // Use ref for smoother updates? Or force render?
                    // NOTE: In React, using Ref doesn't trigger re-render. We need to force update or use state for visual hand.
                    // Actually, for 60fps game loops, standard practice is to use ref for logic and let the `setRenderItems` trigger the re-render which naturally picks up the current ref value?
                    // NO, `setRenderItems` happens on update. The hand needs to move even if items don't?
                    // Actually items move every frame, so re-render happens every frame. So reading ref in render is mostly fine.
                    // BUT to be safe, let's sync playerX to a state for the hand ONLY if we want it perfect?
                    // Actually, let's use the ref directly in the style. React won't update the DOM unless state changes.
                    // Since `setRenderItems` is called every frame (in updateGame), the component re-renders every frame.
                    // So `playerXRef.current` will be read every frame. This is performant!
                    transform: `translateX(-50%) scale(1.5)`
                }}
            >
                <div className="text-8xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    🫴
                </div>
            </div>

            {/* FALLING ITEMS */}
            {renderItems.map(item => (
                <div
                    key={item.id}
                    className="absolute z-20 pointer-events-none text-5xl"
                    style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`
                    }}
                >
                    {item.icon}
                </div>
            ))}

            {/* START SCREEN */}
            {!isPlaying && !gameOver && !gameWon && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#1a0505] p-8 rounded-3xl border-2 border-[#ffd700] text-center max-w-sm shadow-2xl"
                    >
                        <h1 className="text-3xl font-righteous text-[#ffd700] mb-4">Misi Penyelamatan HP! 📱</h1>
                        <p className="text-pink-100 mb-6 font-caveat text-xl">
                            HP Sarah jatuh dari langit! Bantu tangan ini menangkap 5 HP. <br />
                            Awas, jangan tangkap Bom ya! 💣
                        </p>
                        <div className="text-6xl mb-6 animate-bounce">🫴</div>
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            MULAI MISI! 🚀
                        </button>
                    </motion.div>
                </div>
            )}

            {/* GAME OVER SCREEN */}
            {gameOver && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/80 backdrop-blur-md">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white p-8 rounded-3xl text-center shadow-2xl max-w-sm"
                    >
                        <div className="text-6xl mb-4">💥</div>
                        <h2 className="text-3xl font-bold text-red-600 mb-2">Yah Meledak!</h2>
                        <p className="text-gray-600 mb-6">Nyawa kamu habis... Tangan kamu gosong kena bom.</p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-red-500 text-white rounded-full font-bold shadow-lg hover:bg-red-600"
                        >
                            Coba Lagi ↺
                        </button>
                    </motion.div>
                </div>
            )}

            {/* VICTORY SCREEN (STORY) */}
            <AnimatePresence>
                {gameWon && (
                    <motion.div
                        className="absolute inset-0 z-[60] flex items-center justify-center bg-[#1a0505]/95 backdrop-blur-md p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="flex flex-col h-[85vh] w-full max-w-2xl bg-black/40 rounded-3xl border border-[#ffd700]/30 overflow-hidden"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 text-center shrink-0">
                                <h2 className="text-3xl lg:text-4xl font-dancing text-[#ffd700] drop-shadow-md">
                                    Terimakasih Penyelamatku!
                                </h2>
                            </div>

                            {/* Scrollable Story */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 text-pink-100 font-caveat text-xl lg:text-2xl leading-relaxed text-justify px-8">
                                <p>
                                    Terimakasih udah mau membantu Sarah menangkap HP nya yang kayaknya hp nya hampir jatuh dari meja... Sarah.. Jangan ceroboh ya kalo megang benda atau naruh benda okey? xixixixi... :p
                                    Hp nya jadi bsisa buat call an malam ini deh... YEAYYY!!!
                                </p>
                                <p>
                                    Setiap malam kita selalu bertukar cerita baik suka dan duka... Suara ceria mu memecah heningnya malam... dan ku yakin di malam yang spesial ini aku bisa melihat kebahagiaan mu yang terpencar jelas lewat suara mu... :D
                                </p>
                                <p>
                                    Terimakasih banyak ya sayang ku sudah selalu nemenin aku di setiap cerita yang ku ucapkan... Kamu selalu membuat ku merasa nyaman dan merasa tenang.... Aku bener bener berterimakasih ke diri kamu wahai sayang ku... (⁠つ⁠≧⁠▽⁠≦⁠)⁠つ
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 shrink-0 flex justify-center bg-black/20">
                                <button
                                    onClick={() => completeLevel(3)}
                                    className="px-10 py-3 bg-gradient-to-r from-[#ffd700] to-orange-500 text-[#5c0b0b] rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Next Level 👉
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
