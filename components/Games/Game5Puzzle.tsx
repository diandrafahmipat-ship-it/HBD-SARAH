"use client";

import { useGame } from "@/context/GameContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";

// --- CONSTANTS ---
const GRID_SIZE = 3; // 3x3
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;
const IMAGE_SRC = "/assets/game5/puzzle.jpg"; // Corrected Path

export default function Game5() {
    const { completeLevel } = useGame();

    // --- STATE ---
    const [pieces, setPieces] = useState<number[]>([]); // Pieces in Pile
    const [placedPieces, setPlacedPieces] = useState<(number | null)[]>(Array(TOTAL_PIECES).fill(null));

    const [isWon, setIsWon] = useState(false);
    // Added mounting check to avoid hydration mismatch if needed, but not critical here.

    // Initialize - Shuffle
    useEffect(() => {
        const p = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
        // Shuffle
        for (let i = p.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        setPieces(p);
    }, []);

    // Check Win
    useEffect(() => {
        const isAllCorrect = placedPieces.every((pid, idx) => pid === idx);
        // Ensure pile is empty too
        if (isAllCorrect && placedPieces.length === TOTAL_PIECES && pieces.length === 0) {
            handleWin();
        }
    }, [placedPieces, pieces.length]);


    const handleWin = () => {
        if (isWon) return;
        setIsWon(true);
        confetti({
            particleCount: 300,
            spread: 100,
            origin: { y: 0.6 }
        });
    };

    // Style Helper
    const getPieceStyle = (index: number) => {
        const x = (index % GRID_SIZE) * 100 / (GRID_SIZE - 1);
        const y = (Math.floor(index / GRID_SIZE)) * 100 / (GRID_SIZE - 1);
        return {
            backgroundImage: `url(${IMAGE_SRC})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundSize: `${GRID_SIZE * 100}%`,
            backgroundColor: '#4a0e0e', // Fallback color (Deep Red)
        };
    };

    return (
        <div className="w-full min-h-screen bg-[#2a0808] flex flex-col items-center justify-start p-4 font-sans overflow-y-auto custom-scrollbar">
            {/* HEADER */}
            <div className="text-center mb-6 mt-4">
                <h1 className="text-4xl font-righteous text-[#ffd700] mb-2 drop-shadow-lg">Puzzle Hati</h1>
                <p className="text-pink-200 font-caveat text-xl">Susun kembali kenangan kita...</p>
            </div>

            {/* GAME AREA */}
            <div className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-5xl">

                {/* 1. THE GRID (Target) */}
                <div className="relative p-2 border-4 border-[#ffd700] rounded-xl bg-black/40 backdrop-blur-sm shadow-2xl">
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            width: "80vw", maxWidth: "400px", aspectRatio: "1/1"
                        }}
                    >
                        {placedPieces.map((pId, slotIdx) => (
                            <div
                                key={slotIdx}
                                id={`slot-${slotIdx}`}
                                className="w-full h-full bg-white/10 rounded-md border border-white/5 flex items-center justify-center relative overflow-hidden"
                                onClick={() => {
                                    // Return to pile if clicked
                                    if (pId !== null) {
                                        setPlacedPieces(prev => {
                                            const newArr = [...prev];
                                            newArr[slotIdx] = null;
                                            return newArr;
                                        });
                                        setPieces(prev => {
                                            if (prev.includes(pId)) return prev;
                                            return [...prev, pId];
                                        });
                                    }
                                }}
                            >
                                {pId !== null ? (
                                    <motion.div
                                        layoutId={`piece-${pId}`}
                                        className="w-full h-full pointer-events-none relative"
                                        style={getPieceStyle(pId)}
                                    >
                                        <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full backdrop-blur-md border border-white/20 font-bold">
                                            {pId + 1}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center opacity-30">
                                        {/* Hidden Index */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. THE PILE (Source) */}
                {!isWon && (
                    <div className="flex-1 flex flex-wrap justify-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 min-h-[200px] content-start w-full lg:max-w-md">
                        <AnimatePresence>
                            {pieces.sort((a, b) => a - b).map((pId) => (
                                <motion.div
                                    key={pId}
                                    layoutId={`piece-${pId}`}
                                    drag
                                    dragSnapToOrigin
                                    whileDrag={{ scale: 1.2, zIndex: 100 }}
                                    whileHover={{ scale: 1.05 }}
                                    onDragEnd={(e, info) => {
                                        const point = info.point;
                                        // Manual Bounding Box Check for Slots
                                        const slots = Array.from({ length: TOTAL_PIECES }).map((_, i) => {
                                            const el = document.getElementById(`slot-${i}`);
                                            if (el) return { id: i, rect: el.getBoundingClientRect() };
                                            return null;
                                        }).filter(Boolean);

                                        const hit = slots.find(s =>
                                            s && point.x >= s.rect.left && point.x <= s.rect.right &&
                                            point.y >= s.rect.top && point.y <= s.rect.bottom
                                        );

                                        if (hit) {
                                            // 1. Remove from Pile FIRST to avoid dupes? 
                                            // Actually state updates are batched.

                                            setPlacedPieces(prev => {
                                                const newArr = [...prev];
                                                // If slot is ALREADY occupied by another piece, return that OLD piece to pile
                                                const oldPiece = newArr[hit.id];
                                                if (oldPiece !== null) {
                                                    setPieces(currentPile => {
                                                        // Prevent duplicates just in case
                                                        if (currentPile.includes(oldPiece)) return currentPile;
                                                        return [...currentPile, oldPiece];
                                                    });
                                                }
                                                newArr[hit.id] = pId;
                                                return newArr;
                                            });

                                            // 2. Remove the DRAGGED piece from Pile
                                            setPieces(prev => prev.filter(id => id !== pId));
                                        }
                                    }}
                                    className="w-20 h-20 rounded-md shadow-md cursor-grab active:cursor-grabbing hover:ring-2 ring-[#ffd700] relative bg-cover"
                                    style={{
                                        ...getPieceStyle(pId),
                                        touchAction: "none"
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                        {pieces.length === 0 && !isWon && (
                            <div className="text-white/50 text-center w-full italic mt-4">
                                Semua kepingan sudah ditaruh...
                                <br />
                                (Klik kepingan di grid untuk mengembalikan ke sini jika salah)
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* WIN MODAL */}
            {isWon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#1a0505] border-2 border-[#ffd700] rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-center shadow-[0_0_50px_rgba(255,215,0,0.3)] custom-scrollbar"
                    >
                        <h2 className="text-3xl lg:text-4xl font-dancing text-[#ffd700] mb-6">Sempurna, Sayang! ❤️</h2>

                        {/* Full Image */}
                        <div className="relative w-full h-48 lg:h-64 mb-6 rounded-xl overflow-hidden border-2 border-white/20 mx-auto max-w-md">
                            <Image src={IMAGE_SRC} fill className="object-cover" alt="Full Puzzle" />
                        </div>

                        <div className="text-pink-100 font-caveat text-lg lg:text-xl space-y-4 text-left px-2 lg:px-4">
                            <p>
                                Puzzle ini menggambarkan sikap diri kamu yang luar biasa atas Kesabaran dan kecerdasan kamu... (⁠づ⁠｡⁠◕⁠‿⁠‿⁠◕⁠｡⁠)⁠づ
                            </p>
                            <p>
                                Puzzle yang berantakan ibarat masalah yang menerjang diri kamu... kamu perlahan demi perlahan menyusun puzzle tersebut dengan penuh ketelitian dan kesabaran serta kecerdikan mu yang tak kalah luar biasa dalam menempatkan setiap keping puzzle di tempat yang tepat...
                            </p>
                            <p>
                                setiap hubungan pasti memiliki masalahnya sendiri sendiri, namun berat kesabaran, ketelitian dan kecerdikan diri kamu lah yang membuat kita selalu bisa bersama bahagia kembali... (⁠つ⁠≧⁠▽⁠≦⁠)⁠つ
                            </p>
                            <p>
                                Setelah setiap masalah berhasil kamu selesaikan akan terlihat hal yang indah, sama seperti puzzle yang telah terselesaikan... (⁠つ⁠✧⁠ω⁠✧⁠)⁠つ.
                            </p>
                        </div>

                        <button
                            onClick={() => completeLevel(5)}
                            className="w-full mt-8 py-4 bg-gradient-to-r from-[#ffd700] to-pink-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            Lanjut ke Penutup 🌹
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
