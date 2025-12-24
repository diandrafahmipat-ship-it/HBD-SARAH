"use client";

import { useGame } from "@/context/GameContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";

// --- CONSTANTS ---
// Using Percentages where possible for responsiveness
const GRAVITY = 0.10; // Lower Gravity (Easier Control)
const JUMP_STRENGTH = -2.0;
const OBSTACLE_SPEED = 0.25; // Smooth slow speed
const OBSTACLE_SPAWN_RATE = 3000;
const OBSTACLE_WIDTH_PERCENT = 15;
const OBSTACLE_GAP_PERCENT = 45; // Wider Gap (Easier)
const BIRD_SIZE_PERCENT = 8;
const BIRD_X_PERCENT = 20;

const SPACE_OBSTACLES = ["🪐", "☀️", "🌑", "🌍", "☄️", "🌟"];
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

const PHOTO_ASSETS = [
    "/assets/sarah_photos/photo1.png",
    "/assets/sarah_photos/photo2.png",
    "/assets/sarah_photos/photo3.jpg",
    "/assets/sarah_photos/photo4.jpg",
    "/assets/sarah_photos/photo5.jpg",
];

interface Obstacle {
    id: number;
    x: number; // %
    topHeight: number; // %
    type: string;
}

interface FloatingPhoto {
    id: number;
    x: number; // %
    y: number; // %
    src: string;
    scale: number;
}

export default function Game4Duck() {
    const { completeLevel } = useGame();

    // --- REFS FOR GAME LOOP (Logic) ---
    const birdYRef = useRef(50); // %
    const velocityRef = useRef(0);
    const obstaclesRef = useRef<Obstacle[]>([]);
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const lastSpawnTimeRef = useRef<number>(0);
    const scoreRef = useRef(0); // Ref for sync
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const isGameOverRef = useRef(false);
    const isImmuneRef = useRef(false);

    // --- STATE FOR RENDER ---
    const [gameState, setGameState] = useState<"START" | "COUNTDOWN" | "PLAYING" | "GAME_OVER" | "WON">("START");
    const [countdown, setCountdown] = useState(3);
    const [birdY, setBirdY] = useState(50);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [score, setScore] = useState(0);
    const [photos, setPhotos] = useState<FloatingPhoto[]>([]);
    const [isImmune, setIsImmune] = useState(false);

    // --- GAME LOOP ---
    const updateGame = useCallback((time: number) => {
        if (isGameOverRef.current) return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // Calculate Delta Factor (1.0 at 60fps, 0.5 at 120fps, etc.)
        const dtFactor = Math.min(deltaTime / FRAME_TIME, 4.0);

        // 1. Physics
        velocityRef.current += GRAVITY * dtFactor;
        birdYRef.current += velocityRef.current * dtFactor;

        // Clamp / Floor Collision
        if (birdYRef.current > 90) {
            if (isImmuneRef.current) {
                birdYRef.current = 90;
                velocityRef.current = 0;
            } else {
                handleGameOver();
                return;
            }
        }
        if (birdYRef.current < 0) { // Ceiling
            birdYRef.current = 0;
            velocityRef.current = 0;
        }

        // 2. Obstacles Spawning 
        if (time - lastSpawnTimeRef.current > OBSTACLE_SPAWN_RATE) {
            spawnObstacle();
            lastSpawnTimeRef.current = time;
        }

        // 3. Update Obstacles
        const currentObs = obstaclesRef.current;
        const nextObs: Obstacle[] = [];

        currentObs.forEach(obs => {
            obs.x -= OBSTACLE_SPEED * dtFactor;

            // Score Logic
            if (obs.x + OBSTACLE_WIDTH_PERCENT < BIRD_X_PERCENT && obs.x + OBSTACLE_WIDTH_PERCENT + (OBSTACLE_SPEED * dtFactor) >= BIRD_X_PERCENT) {
                // Checkpoint logic: Score accumulates
                scoreRef.current += 1;
                setScore(scoreRef.current);
                if (scoreRef.current >= 10) handleWin();
            }

            // Collision Logic
            const birdLeft = BIRD_X_PERCENT + 2;
            const birdRight = BIRD_X_PERCENT + BIRD_SIZE_PERCENT - 2;
            const birdTop = birdYRef.current + 2;
            const birdBottom = birdYRef.current + BIRD_SIZE_PERCENT - 2;

            const obsLeft = obs.x;
            const obsRight = obs.x + OBSTACLE_WIDTH_PERCENT;

            if (birdRight > obsLeft && birdLeft < obsRight) {
                if (birdTop < obs.topHeight || birdBottom > obs.topHeight + OBSTACLE_GAP_PERCENT) {
                    if (!isImmuneRef.current) {
                        handleGameOver();
                        return;
                    }
                    // Immune: Ignore collision
                }
            }

            if (obs.x > -20) {
                nextObs.push(obs);
            }
        });

        obstaclesRef.current = nextObs;

        // 4. Photos
        if (Math.random() < (0.005 * dtFactor)) spawnPhoto();
        setPhotos(prev => prev.map(p => ({ ...p, x: p.x - (0.2 * dtFactor) })).filter(p => p.x > -50));

        // Sync Render State
        setBirdY(birdYRef.current);
        setObstacles([...nextObs]);

        requestRef.current = requestAnimationFrame(updateGame);
    }, []);

    // Countdown Logic
    useEffect(() => {
        if (gameState === "COUNTDOWN") {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                // START GAME
                setGameState("PLAYING");

                // Activate Immortality
                setIsImmune(true);
                isImmuneRef.current = true;
                setTimeout(() => {
                    setIsImmune(false);
                    isImmuneRef.current = false;
                }, 3000); // 3 Seconds Immunity

                lastTimeRef.current = performance.now();
                lastSpawnTimeRef.current = performance.now();
                requestRef.current = requestAnimationFrame(updateGame);
            }
        }
    }, [gameState, countdown, updateGame]);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // --- HELPERS ---
    const spawnObstacle = () => {
        const minHeight = 10;
        const maxHeight = 90 - OBSTACLE_GAP_PERCENT - 10;
        const randomHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        const type = SPACE_OBSTACLES[Math.floor(Math.random() * SPACE_OBSTACLES.length)];

        obstaclesRef.current.push({
            id: Date.now(),
            x: 100,
            topHeight: randomHeight,
            type
        });
    };

    const spawnPhoto = () => {
        const src = PHOTO_ASSETS[Math.floor(Math.random() * PHOTO_ASSETS.length)];
        setPhotos(prev => [...prev, {
            id: Date.now(),
            x: 100,
            y: Math.random() * 60 + 10,
            src,
            scale: 0.5 + Math.random() * 0.3
        }]);
    };

    const jump = () => {
        if (gameState === "PLAYING") {
            velocityRef.current = JUMP_STRENGTH;
        } else if (gameState === "START" || gameState === "GAME_OVER") {
            startCountdown();
        }
    };

    const startCountdown = () => {
        // Reset Logic
        birdYRef.current = 50;
        velocityRef.current = 0;
        // obstaclesRef.current = []; // KEEP OBSTACLES (Respawn at death location)

        isGameOverRef.current = false;

        // Reset Render State
        setBirdY(50);
        // setObstacles([]); // KEEP OBSTACLES
        // setScore(0); 
        setPhotos([]);
        setCountdown(3);
        setGameState("COUNTDOWN");
    };

    const handleGameOver = () => {
        isGameOverRef.current = true;
        setGameState("GAME_OVER");
    };

    const handleWin = () => {
        isGameOverRef.current = true;
        setGameState("WON");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    };


    return (
        <div
            className="w-full h-screen bg-[#2a0808] flex items-center justify-center font-sans overflow-hidden select-none touch-none"
            onPointerDown={jump}
            tabIndex={0}
            onKeyDown={(e) => { if (e.code === "Space") jump(); }}
        >
            <div
                ref={gameContainerRef}
                className="relative w-full max-w-lg h-full lg:h-[80vh] lg:rounded-3xl border-4 border-[#ffd700] overflow-hidden bg-gradient-to-b from-[#1a0505] to-[#4a0e0e] shadow-2xl"
            >

                {/* STARS */}
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute bg-white rounded-full opacity-40 animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3}px`, height: `${Math.random() * 3}px`
                        }}
                    />
                ))}

                {/* PHOTOS */}
                {photos.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                        className="absolute pointer-events-none"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, scale: p.scale }}
                    >
                        <div className="border-2 border-white/30 rounded-lg overflow-hidden transform rotate-12">
                            <Image src={p.src} width={100} height={100} alt="mem" className="object-cover" />
                        </div>
                    </motion.div>
                ))}

                {/* OBSTACLES */}
                {obstacles.map(obs => (
                    <div key={obs.id}>
                        {/* Top */}
                        <div
                            className="absolute bg-[#5c0b0b] border-x-2 border-b-2 border-[#ffd700] rounded-b-xl flex items-end justify-center z-10"
                            style={{
                                left: `${obs.x}%`,
                                top: 0,
                                width: `${OBSTACLE_WIDTH_PERCENT}%`,
                                height: `${obs.topHeight}%`
                            }}
                        >
                            <span className="text-3xl mb-2">{obs.type}</span>
                        </div>
                        {/* Bottom */}
                        <div
                            className="absolute bg-[#5c0b0b] border-x-2 border-t-2 border-[#ffd700] rounded-t-xl flex items-start justify-center z-10"
                            style={{
                                left: `${obs.x}%`,
                                top: `${obs.topHeight + OBSTACLE_GAP_PERCENT}%`,
                                width: `${OBSTACLE_WIDTH_PERCENT}%`,
                                bottom: 0
                            }}
                        >
                            <span className="text-3xl mt-2">{obs.type}</span>
                        </div>
                    </div>
                ))}

                {/* BIRD */}
                <div
                    className={`absolute z-20 text-4xl transition-transform duration-75 ease-linear ${isImmune ? "opacity-50 blur-[1px]" : "opacity-100"}`}
                    style={{
                        left: `${BIRD_X_PERCENT}%`,
                        top: `${birdY}%`,
                        width: `${BIRD_SIZE_PERCENT}%`,
                        height: "auto",
                        transform: `rotate(${Math.min(Math.max(velocityRef.current * 5, -20), 45)}deg)`
                    }}
                >
                    🦆
                </div>

                {/* SCORE */}
                <div className="absolute top-8 w-full text-center z-30">
                    <span className="text-6xl font-righteous text-white drop-shadow-md">{score}/10</span>
                </div>

                {/* SCREENS */}
                {gameState === "START" && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center z-40 p-4">
                        <div className="text-8xl mb-4 animate-bounce">🦆</div>
                        <h1 className="text-4xl text-[#ffd700] font-righteous mb-2">Bebek Angkasa</h1>
                        <p className="text-pink-100 font-caveat text-xl mb-4">Ketuk untuk Terbang! Hindari Planet!</p>
                        <div className="animate-pulse text-white/50 text-sm">Ketuk Layar atau Spasi</div>
                    </div>
                )}

                {gameState === "COUNTDOWN" && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center z-40">
                        <motion.div
                            key={countdown}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                            className="text-9xl font-righteous text-[#ffd700] drop-shadow-lg"
                        >
                            {countdown > 0 ? countdown : "MULAI!"}
                        </motion.div>
                        <p className="text-white font-caveat text-2xl mt-4 animate-pulse">
                            (Kebal Sementara!)
                        </p>
                    </div>
                )}

                {gameState === "GAME_OVER" && (
                    <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-center z-40 p-4">
                        <div className="text-8xl mb-4">💥</div>
                        <h2 className="text-3xl text-white font-bold mb-2">Nabrak Sayang!</h2>
                        <p className="text-pink-200 mb-4">Skor Kamu: {score} (Lanjut dari sini!)</p>
                        <button className="px-8 py-3 bg-white text-red-900 rounded-full font-bold shadow-lg mt-4 animate-pulse">
                            Coba Lagi ↺
                        </button>
                    </div>
                )}

                {gameState === "WON" && (
                    <div className="absolute inset-0 bg-[#1a0505]/95 flex flex-col items-center justify-center text-center z-50 p-6 overflow-y-auto">
                        <div className="border-4 border-[#ffd700] p-6 rounded-3xl bg-black/40 backdrop-blur-md">
                            <h2 className="text-3xl font-dancing text-[#ffd700] mb-4">Hore Berhasil! 🦆✨</h2>
                            <div className="text-center text-pink-100 font-caveat text-lg space-y-4 mb-6">
                                <p className="font-bold">Oh iya, Selain Telfonan kita juga sesekali bermain game bersama... :p</p>

                                <p>
                                    Rasanya tuh seru banget tahuuuu main sama kamu!!! kamu tipikal perempuan yang bisa di ajak main game apa aja deh pokoknya,
                                    Mau yang perang perangan sampe game yang santai pun kamu selalu bisa ngebuat aku bahagia... (⁠づ⁠￣⁠ ⁠³⁠￣⁠)⁠づ
                                </p>

                                <p>
                                    Game yang kita sering mainin itu ada Roblox dan Blood Strike... seru banget main sama kamu!!!  :&gt;
                                </p>

                                <p>
                                    Aku harap kamu juga ngerasain keseruannya juga ya sayang... Maaf kalo aku terkadang nub hehe... (⁠つ⁠≧⁠▽⁠≦⁠)⁠つ
                                </p>

                                <p className="text-center font-bold text-xl mt-4 text-[#ffd700]">
                                    I Love You Forever! ❤️
                                </p>
                            </div>
                            <button
                                onClick={() => completeLevel(4)}
                                className="w-full py-3 bg-gradient-to-r from-[#ffd700] to-orange-500 text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                            >
                                Lanjut Sayang 🎁
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
