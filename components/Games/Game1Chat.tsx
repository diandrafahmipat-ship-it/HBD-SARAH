"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";

// --- PUZZLE DATA (Sequential) ---
const CHAT_SEQUENCE = [
    // 0: System Message
    { type: "system", text: "Partner found 😸\n\n/next — find a new partner\n/stop — stop this chat", time: "08:52" },

    // 1: User needs to send "ceco"
    { type: "user_puzzle", answer: "ceco", time: "08:52" },

    // 2: Partner responses (Automated)
    { type: "partner", text: "ce", time: "08:52", delay: 1000 },
    { type: "partner", text: "c", time: "08:52", delay: 1500 },
    { type: "partner", text: "e", time: "08:52", delay: 2000 },

    // 3: User needs to send "aku cowo"
    { type: "user_puzzle", answer: "aku cowo", time: "08:52" },

    // 4: Partner responses
    { type: "partner", text: "oke", time: "08:52", delay: 1000 },
    { type: "partner", text: "umur", time: "08:52", delay: 2000 },

    // 5: User sends "18"
    { type: "user_puzzle", answer: "18", time: "08:52" },

    // 6: User sends "kalo km?"
    { type: "user_puzzle", answer: "kalo km?", time: "08:52" },

    // 7: Partner Final Responses
    { type: "partner", text: "18", time: "08:53", delay: 1000 },
    { type: "partner", text: "eh", time: "08:53", delay: 1500 },
    { type: "partner", text: "salah", time: "08:53", delay: 2000 },
    { type: "partner", text: "17", time: "08:53", delay: 3000 },
];

const OPTIONS = [
    { id: "opt_ceco", text: "ceco" },
    { id: "opt_cowo", text: "aku cowo" },
    { id: "opt_18", text: "18" },
    { id: "opt_km", text: "kalo km?" },
    // Distractors
    { id: "opt_salken", text: "salken" },
    { id: "opt_cewe", text: "aku cewe" },
];

export default function Game1Chat() {
    const { setGameState } = useGame();

    const [messages, setMessages] = useState<any[]>([]); // Current visible chat history
    const [stepIndex, setStepIndex] = useState(0); // Current position in CHAT_SEQUENCE
    const [availableOptions, setAvailableOptions] = useState(OPTIONS);
    const [isPhoneActive, setIsPhoneActive] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    // Intro Animation
    useEffect(() => {
        setTimeout(() => setIsPhoneActive(true), 500);
        // Add initial system message
        setMessages([CHAT_SEQUENCE[0]]);
        setStepIndex(1); // Ready for first puzzle
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle Logic
    const handleOptionClick = (option: any) => {
        const currentStep = CHAT_SEQUENCE[stepIndex];

        // If we are waiting for user input
        if (currentStep && currentStep.type === "user_puzzle") {
            if (option.text === currentStep.answer) {
                // Correct! Add message and advance
                addMessage({
                    id: Date.now(),
                    text: option.text,
                    sender: "me",
                    time: currentStep.time
                });

                // Remove used option
                setAvailableOptions(prev => prev.filter(o => o.id !== option.id));

                // Advance step
                advanceSequence(stepIndex + 1);
            } else {
                // Wrong option feedback (shake or something) - for now just ignore
            }
        }
    };

    const addMessage = (msg: any) => {
        setMessages(prev => [...prev, msg]);
    };

    const advanceSequence = async (nextIndex: number) => {
        setStepIndex(nextIndex);

        // Check if next steps are partner/automated
        let currentIndex = nextIndex;

        while (currentIndex < CHAT_SEQUENCE.length) {
            const step = CHAT_SEQUENCE[currentIndex];

            if (step.type === "partner") {
                // It's a partner message, schedule it
                await new Promise(r => setTimeout(r, step.delay || 1000));
                addMessage({
                    id: Date.now() + Math.random(),
                    text: step.text,
                    sender: "partner",
                    time: step.time
                });
                currentIndex++;
                setStepIndex(currentIndex);
            } else if (step.type === "user_puzzle") {
                // Stop and wait for user
                setStepIndex(currentIndex);
                return;
            } else {
                currentIndex++;
            }
        }

        // If we reach here, end of sequence = Success
        setTimeout(() => setIsComplete(true), 1500);
    };

    const handleComplete = () => {
        setIsExiting(true);
        setTimeout(() => {
            setGameState(prev => ({
                ...prev,
                completedLevels: [...Array.from(new Set([...prev.completedLevels, 1]))],
                unlockedLevels: [...Array.from(new Set([...prev.unlockedLevels, 2]))],
                currentLevel: 0
            }));
        }, 2000);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center p-4">

            {/* Space Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a0808] via-[#5c0b0b] to-[#2a0808]"></div>
                {/* Stars */}
                <div className="absolute w-full h-full animate-[pulse_4s_infinite]">
                    {[...Array(60)].map((_, i) => (
                        <div key={i} className="absolute bg-white rounded-full opacity-70"
                            style={{
                                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Floating Phone */}
            <AnimatePresence>
                {!isExiting && isPhoneActive && (
                    <motion.div
                        key="phone"
                        initial={{ y: 800, rotateX: 60, opacity: 0 }}
                        animate={{ y: 0, rotateX: 0, opacity: 1 }}
                        exit={{ y: -800, scale: 0.6, rotate: 10, opacity: 0, transition: { duration: 1.2 } }}
                        transition={{ type: "spring", damping: 18, stiffness: 80 }}
                        className="relative z-10 w-full max-w-[360px] h-[720px] max-h-[90vh]"
                    >
                        {/* Phone Hardware */}
                        <div className="relative w-full h-full bg-[#111] rounded-[45px] shadow-[0_0_60px_rgba(255,255,255,0.1),inset_0_0_10px_rgba(0,0,0,1)] border-[4px] border-[#333] flex flex-col overflow-hidden ring-1 ring-white/10">

                            {/* Buttons */}
                            <div className="absolute -left-[4px] top-24 w-[4px] h-8 bg-[#333] rounded-l-md"></div>
                            <div className="absolute -right-[4px] top-32 w-[4px] h-12 bg-[#333] rounded-r-md"></div>

                            {/* SCREEN */}
                            <div className="relative w-full h-full flex flex-col font-sans overflow-hidden rounded-[40px] bg-[#0e1621]">

                                {/* Status Bar */}
                                <div className="w-full h-8 flex justify-between items-center px-6 pt-2 z-50 text-white text-[10px] font-medium tracking-wide">
                                    <span>08:47</span>
                                    <div className="flex gap-1">
                                        <span>4G</span>
                                        <span>🔋</span>
                                    </div>
                                </div>

                                {/* TELEGRAM HEADER */}
                                <div className="w-full h-16 bg-[#17212b] flex items-center px-3 z-40 shadow-sm">
                                    <button className="text-white text-xl px-2">←</button>
                                    <div className="w-10 h-10 rounded-full bg-[#5c9ce6] flex items-center justify-center text-xl text-white mr-3">
                                        🎭
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h1 className="text-white font-semibold text-sm truncate">Anonymous Chat @chatbot</h1>
                                        <p className="text-[#7f91a4] text-[10px] truncate">2,112,539 pengguna bulanan</p>
                                    </div>
                                    <button className="text-white text-xl px-2">⋮</button>
                                </div>

                                {/* BACKGROUND PATTERN */}
                                <div
                                    className="absolute inset-0 z-0 opacity-10"
                                    style={{
                                        backgroundImage: `url("https://www.transparenttextures.com/patterns/black-linen.png")`,
                                        backgroundSize: "cover"
                                    }}
                                ></div>

                                {/* MESSAGES AREA */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 relative z-10 custom-scrollbar pb-96">
                                    {messages.map((msg, idx) => {
                                        if (msg.type === "system") {
                                            return (
                                                <div key={idx} className="flex justify-center my-4">
                                                    <div className="bg-[#182533]/80 text-white text-xs px-4 py-2 rounded-lg text-center whitespace-pre-wrap leading-relaxed shadow-sm backdrop-blur-sm border border-white/5">
                                                        {msg.text}
                                                        <span className="block text-right text-[9px] mt-1 opacity-50">{msg.time}</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        const isMe = msg.sender === "me";
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`
                                                max-w-[75%] px-3 py-1.5 rounded-xl text-sm shadow-sm relative
                                                ${isMe ? "bg-[#8774e1] text-white rounded-tr-sm" : "bg-[#182533] text-white rounded-tl-sm"}
                                            `}
                                                >
                                                    <p className="leading-tight">{msg.text}</p>
                                                    <div className="flex justify-end items-center gap-1 mt-1">
                                                        <span className={`text-[9px] ${isMe ? "text-purple-200" : "text-gray-400"}`}>{msg.time}</span>
                                                        {isMe && <span className="text-[10px] text-purple-200">✓✓</span>}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={bottomRef} />
                                </div>

                                {/* KEYBOARD / INPUT AREA */}
                                <div className="w-full bg-[#17212b] pb-safe z-50 absolute bottom-0 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">

                                    {/* Hint Text */}
                                    <div className="py-2 text-center">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold animate-pulse">Lengkapi Chat...</p>
                                    </div>

                                    {/* Word Bank Options */}
                                    <div className="flex flex-wrap gap-2 justify-center p-2 mb-2">
                                        {availableOptions.map(opt => (
                                            <motion.button
                                                key={opt.id}
                                                onClick={() => handleOptionClick(opt)}
                                                whileTap={{ scale: 0.9 }}
                                                className="bg-[#2b5278] hover:bg-[#34628f] text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-white/10"
                                            >
                                                {opt.text}
                                            </motion.button>
                                        ))}
                                        {availableOptions.length === 0 && !isComplete && (
                                            <p className="text-gray-500 text-xs italic">Menunggu balasan...</p>
                                        )}
                                    </div>

                                    {/* Fake Input Bar */}
                                    <div className="flex items-end gap-2 px-3 pb-6 pt-2 border-t border-black/20 bg-[#17212b]">
                                        <div className="text-[#7f91a4] mb-2">
                                            <div className="w-6 h-6 rounded-md border-[2px] border-[#7f91a4] flex items-center justify-center text-[10px]">::</div>
                                        </div>
                                        <div className="flex-1 bg-[#0e1621] rounded-2xl h-[40px] flex items-center px-4 text-[#7f91a4] text-sm mb-1">
                                            Pesan
                                        </div>
                                        <div className="text-[#7f91a4] mb-2 text-xl">📎</div>
                                        <div className="text-[#7f91a4] mb-2 text-xl">🎤</div>
                                    </div>
                                </div>

                                {/* Success Overlay */}
                                <AnimatePresence>
                                    {isComplete && (
                                        <motion.div
                                            className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <motion.div
                                                className="bg-[#17212b] rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden"
                                                initial={{ scale: 0.8, y: 50 }}
                                                animate={{ scale: 1, y: 0 }}
                                            >
                                                {/* Scrollable Content */}
                                                <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">

                                                    {/* Romantic Text */}
                                                    <div className="space-y-4 text-white text-sm leading-relaxed font-sans text-left">
                                                        <div className="text-center text-3xl mb-2">🥰</div>
                                                        <p>
                                                            Kamu inget ngga sayang di waktu pertama kali kita ketemu??? kita ketemu di Telegram tanggal 15 Agustus 2025. Dan... sekarang kita udah di Akhir tahun 2025 loh!! cepet banget kan??.
                                                        </p>
                                                        <p>
                                                            sewaktu kita pertama kali ketemu.. Aku ngerasa ada hal yang berbeda dari diri kamu di banding dengan orang yang sebelumnya aku temui.... Sikap kamu bener bener selalu bisa bikin aku hanyut dalam rasa kehangatan dan tingkah kamu ngebuat suasana yang tadinya dingin menjadi penuh dengan bunga serta kehangatan...
                                                        </p>
                                                        <p className="font-semibold text-[#5c9ce6] mt-4">
                                                            tanggal 15 Agustus 2025 ini menjadi hari yang sangat membahagiakan bagi ku bisa bertemu dengan orang yang aku cari cari sejak dahulu... (⁠つ⁠≧⁠▽⁠≦⁠)⁠つ.
                                                        </p>
                                                    </div>

                                                    {/* Evidence Photo */}
                                                    <div className="space-y-2 pt-4 border-t border-white/10">
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">Bukti Kenangan Kita 👇</p>
                                                        <div className="rounded-lg overflow-hidden border-2 border-[#5c9ce6]/30 shadow-lg">
                                                            <img
                                                                src="/HBD-SARAH/assets/real_chat.png"
                                                                alt="Chat Asli Kita"
                                                                className="w-full object-cover"
                                                            />
                                                        </div>
                                                    </div>

                                                </div>

                                                {/* Fixed Button Footer */}
                                                <div className="p-4 bg-[#0e1621] border-t border-white/5 shrink-0">
                                                    <button
                                                        onClick={handleComplete}
                                                        className="w-full py-3 bg-gradient-to-r from-[#5c9ce6] to-[#4a8ad4] text-white rounded-xl font-bold shadow-lg hover:shadow-[#5c9ce6]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <span>Lanjutkan Kisah Kita</span>
                                                        <span>➡️</span>
                                                    </button>
                                                </div>

                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Exit Transition */}
            {isExiting && (
                <motion.div className="absolute inset-0 bg-black z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
            )}
        </div>
    );
}
