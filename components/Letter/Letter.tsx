"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";

export default function Letter() {
    const { setGameState } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullyOpened, setIsFullyOpened] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        setTimeout(() => {
            setIsFullyOpened(true);
        }, 1500);
    };

    const startJourney = () => {
        // 1. Fold letter back into envelope
        setIsFullyOpened(false);

        // 2. Wait for fold animation, then trigger exit zoom
        setTimeout(() => {
            setIsOpen(false); // Close flap
            setTimeout(() => {
                setIsExiting(true); // Trigger camera zoom to wall
            }, 800);
        }, 1000);
    };

    // Handle actual navigation after exit animation
    useEffect(() => {
        if (isExiting) {
            const timer = setTimeout(() => {
                setGameState((prev) => ({
                    ...prev,
                    isLetterOpened: true,
                }));
            }, 1500); // Wait for zoom effect
            return () => clearTimeout(timer);
        }
    }, [isExiting, setGameState]);

    return (
        <motion.div
            className="relative w-full h-screen overflow-hidden bg-[#0f0502] flex items-center justify-center font-serif text-[#3e2723]"
            // Camera Approach Animation (Entry): Scale 1.2 -> 1 (Simulates settling in)
            // Exit Animation: Scale 1 -> 3 (Simulates moving forward past desk)
            initial={{ scale: 1.2, opacity: 0 }}
            animate={isExiting ? { scale: 3, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        >

            {/* 
        ========================================
        REALISTIC WOOD TEXTURE BACKGROUND (SVG)
        ========================================
      */}
            <div className="absolute inset-0 z-0">
                <svg className="w-full h-full opacity-60">
                    <filter id="woodFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.005 0.1" numOctaves="3" result="noise" />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" in="noise" result="coloredNoise" />
                        <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
                        <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
                    </filter>
                    <rect width="100%" height="100%" fill="#2e1a12" />
                    <rect width="100%" height="100%" fill="transparent" filter="url(#woodFilter)" opacity="0.7" />
                </svg>
                {/* Dark Varnish Finish */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a0500]/80 via-transparent to-[#1a0500]/80 mix-blend-multiply"></div>
                {/* Lamp Spotlight */}
                <div className="absolute top-[-30%] left-[20%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(255,160,80,0.15)_0%,transparent_70%)] pointer-events-none blur-3xl"></div>
            </div>


            {/* --- DECOR: REALISTIC BOOKS --- */}
            {/* Books are z-50 */}

            {/* Top Left Stack */}
            <motion.div
                className="absolute top-[0%] left-[-5%] z-50 transform scale-110 rotate-6 hidden md:block"
                initial={{ x: -50, y: -50 }}
                animate={{ x: 0, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                {/* Old Red Book */}
                <div className="relative w-80 h-20 bg-[#3d0e0e] rounded-l-md shadow-[5px_5px_15px_rgba(0,0,0,0.8)] skew-x-2 mb-[-6px] flex items-center border-l border-t border-b border-[#2a0505]">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent mix-blend-multiply"></div>
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-yellow-600/40 shadow-[0_0_2px_black]"></div>
                    <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-yellow-600/30"></div>
                    <span className="ml-16 text-[#ccbfa3]/60 font-serif text-[12px] tracking-[4px]">ENCYCLOPEDIA</span>
                </div>
                {/* Blue Book */}
                <div className="relative w-96 h-16 bg-[#0e1b3d] rounded-l-md shadow-[5px_5px_15px_rgba(0,0,0,0.8)] skew-x-[-1deg] mb-[-4px] flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent mix-blend-multiply"></div>
                    <div className="absolute left-10 h-full w-2 bg-[#081026] shadow-inner"></div>
                    <div className="absolute left-24 h-full w-2 bg-[#081026] shadow-inner"></div>
                </div>
            </motion.div>

            {/* Bottom Right Stack */}
            <motion.div
                className="absolute bottom-[-2%] right-[-2%] z-50 transform scale-125 -rotate-3 hidden md:block"
                initial={{ x: 50, y: 50 }}
                animate={{ x: 0, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                {/* Brown Book */}
                <div className="relative w-96 h-24 bg-[#2b1d16] rounded-r-md shadow-[5px_5px_15px_rgba(0,0,0,0.8)] skew-x-3 mb-[-8px] flex justify-end items-center pr-10 border-r border-t border-b border-[#1a100c]">
                    <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent mix-blend-multiply"></div>
                    <div className="h-[80%] w-32 border-2 border-yellow-700/30 flex items-center justify-center">
                        <span className="text-yellow-600/50 font-serif text-xs font-bold tracking-[2px]">CLASSICS</span>
                    </div>
                </div>
                {/* Green Book */}
                <div className="relative w-80 h-16 bg-[#0f2b16] rounded-r-md shadow-[5px_5px_15px_rgba(0,0,0,0.8)] transform translate-x-4 mb-[-2px]">
                    <div className="absolute right-12 top-0 bottom-0 w-4 bg-[#05140a] shadow-inner"></div>
                </div>
            </motion.div>


            {/* --- ENVELOPE & LETTER CONTAINER --- */}
            {/* 
          CRITICAL FIX: 
          The 'perspective' div creates a stacking context. 
          We must apply z-index HERE, not just on the children.
          - isFullyOpened ? z-[60] : z-30
          - z-[60] > Books (z-50) -> Letter shows ON TOP
          - z-30 < Books (z-50) -> Envelope is TUCKED UNDER
      */}
            <div className={`relative flex flex-col items-center perspective-[1200px] transition-all duration-300 ${isFullyOpened ? "z-[60]" : "z-30"}`}>

                <AnimatePresence mode="wait">
                    {!isFullyOpened ? (
                        /* CLOSED ENVELOPE */
                        <motion.div
                            key="envelope"
                            className="relative cursor-pointer group"
                            onClick={handleOpen}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotateX: 20, transition: { duration: 0.5 } }}
                            whileHover={{ scale: 1.02, rotateX: 5 }}
                        >
                            {/* Realistic Drop Shadow */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[95%] h-12 bg-black/50 blur-xl rounded-[100%]" />

                            {/* Envelope Body */}
                            <motion.div
                                className="relative w-[300px] md:w-[340px] h-[200px] md:h-[220px] bg-[#d9c5a3] shadow-[inset_0_0_20px_rgba(62,39,35,0.2)] flex items-center justify-center overflow-hidden rounded-[2px]"
                            >
                                <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none mix-blend-multiply">
                                    <filter id="paperNoise">
                                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
                                    </filter>
                                    <rect width="100%" height="100%" filter="url(#paperNoise)" />
                                </svg>

                                {/* Flaps */}
                                <div className="absolute bottom-0 w-full h-0 border-l-[150px] md:border-l-[170px] border-r-[150px] md:border-r-[170px] border-b-[100px] md:border-b-[120px] border-l-transparent border-r-transparent border-b-[#cbb490] z-10 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]"></div>
                                <div className="absolute left-0 top-0 h-full w-0 border-t-[100px] md:border-t-[110px] border-b-[100px] md:border-b-[110px] border-l-[120px] md:border-l-[140px] border-t-transparent border-b-transparent border-l-[#d4be99] z-0"></div>
                                <div className="absolute right-0 top-0 h-full w-0 border-t-[100px] md:border-t-[110px] border-b-[100px] md:border-b-[110px] border-r-[120px] md:border-r-[140px] border-t-transparent border-b-transparent border-r-[#d4be99] z-0"></div>

                                <motion.div
                                    className="absolute top-0 w-full h-0 border-l-[150px] md:border-l-[170px] border-r-[150px] md:border-r-[170px] border-t-[110px] md:border-t-[130px] border-l-transparent border-r-transparent border-t-[#bfa680] origin-top z-20 filter drop-shadow-lg"
                                    animate={isOpen ? { rotateX: 180, zIndex: 0, borderTopColor: '#bda37d' } : { rotateX: 0, zIndex: 20 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                />

                                {/* Seal */}
                                <motion.div
                                    className="absolute top-[80px] md:top-[90px] z-30 filter drop-shadow-xl"
                                    animate={isOpen ? { opacity: 0, scale: 1.5 } : { opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#8a1c1c] to-[#5c0e0e] shadow-[inset_0_2px_5px_rgba(255,255,255,0.3),inset_0_-2px_5px_rgba(0,0,0,0.5)] flex items-center justify-center border border-[#4a0b0b]">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#6b1515] flex items-center justify-center">
                                            <span className="text-[#4a0b0b] font-serif text-2xl md:text-3xl font-bold opacity-70" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.2)' }}>S</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {!isOpen && (
                                    <motion.div
                                        className="absolute bottom-4 bg-[#3e2723]/10 px-4 py-1 rounded-full backdrop-blur-sm z-40"
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                    >
                                        <p className="text-[10px] font-bold tracking-[3px] text-[#5d4037] uppercase text-center">
                                            Undangan Rahasia
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    ) : (
                        /* OPEN AGED PAPER */
                        <motion.div
                            key="letter"
                            className="relative max-w-sm md:max-w-2xl w-full px-4"
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.5 } }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        >
                            {/* Backing Shadow */}
                            <div className="absolute top-4 left-4 w-full h-full bg-black/40 blur-lg rounded-sm -z-10"></div>

                            {/* Paper Sheet */}
                            <motion.div
                                className="bg-[#f0e6d2] p-6 md:p-12 shadow-2xl rounded-sm relative overflow-hidden h-[75vh] md:h-auto md:max-h-[85vh] flex flex-col border-l-2 border-[#d0c0a0]"
                            >
                                <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none mix-blend-multiply">
                                    <filter id="paperGrain">
                                        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" />
                                    </filter>
                                    <rect width="100%" height="100%" filter="url(#paperGrain)" />
                                </svg>

                                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(139,69,19,0.15)] pointer-events-none"></div>

                                {/* SCROLLABLE CONTENT (flex-1) */}
                                <div className="relative z-10 w-full flex-1 overflow-y-auto custom-scrollbar pr-2 text-center">
                                    <div className="prose prose-p:text-[#4a3b32] prose-headings:text-[#3e2723] w-full">
                                        <h2 className="text-2xl md:text-4xl font-dancing text-[#8b0000] mb-6 md:mb-8 drop-shadow-sm leading-tight" style={{ fontFamily: 'var(--font-dancing)' }}>
                                            Surat Ulang Tahun untuk Orang Paling Spesial
                                        </h2>

                                        <div className="font-caveat text-lg md:text-2xl leading-relaxed space-y-4 md:space-y-6 text-[#3e2723] text-left" style={{ fontFamily: 'var(--font-caveat)' }}>
                                            <p className="font-bold">Dear Evita Josi Maisarah....</p>

                                            <p>Cieeeee... ada yang ulang tahun nichh!!!<br />
                                                Asik banget nich ulang tahun, Kalo aku di sana pasti udah ku lemparin telor hehe... (⁠つ⁠≧⁠▽⁠≦⁠)⁠つ</p>

                                            <p>Aku yakinnnnn banget hari ini akan jadi hari yang spesialllll bagi kamu... beserta diri aku... Siapa sih yang pacar nya ulang tahun cowo nya ngga ikut seneng?? seneng banget donk pasti!! :&gt;</p>

                                            <p>Selamat ulang tahun ya wahai sayang ku yang aku sayangiiiiiiii banget banget banget banget, Infinity deh pokoknya!! Ku tebak nih ya.... Kamu hari ini ulang tahun yang ke 15 tahun iya kan?? ku tebak lagi nih... Pasti kamu lahir di Probolinggo tanggal 24 Desember 2010 kan?? pasti kamu nanya aku tahu dari mana? Ada dehh~~~</p>

                                            <p>Semoga di umur 15 tahun ini dipenuhi dengan kebahagiaaan yang luarrr biasa banyak ya sayang... Semoga kamu selalu di berikan kesehatan dan rezeki yang melimpah ya sayang ku... Intinya pastinya doa ku untuk diri kamu yang spesial banget ini adalah yang terbaik (⁠つ⁠✧⁠ω⁠✧⁠)⁠つ</p>

                                            <p>Oh iya.. Hubungan kita tergolong sudah termasuk ke kategori lama nih dan masuk ke dalam sejarah masing masing dari hidup kita.... Aku Mau hubungan kita di umur kamu yang bertambah ini menjadi lebih romantis lagi dan lebih asyikkk lagi tentunya... aku bakal nemenin kamu di setiap langkah kamu yaa!!! aku ada di sini untuk selama lamanya!!!</p>

                                            <p>Bicara tentang hubungan kayaknya kalo sekedar dari baca teks atau VN kurang deh.... Aku pengen yang lebih spesial lagi nihhh yang ngga biasa biasa aja....</p>

                                            <p>Biar makin spesial yukkk ikutin aku berpetualang menjelajahi hubungan kita yang udah kita bangun selama ini!!! (klik tombol "Ayooo berpetualang!").</p>
                                        </div>

                                        <div className="mt-8 md:mt-12 pb-8">
                                            <motion.button
                                                onClick={startJourney}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-8 py-2 md:px-10 md:py-3 bg-gradient-to-r from-[#8b0000] to-[#b71c1c] text-[#f0e6d2] rounded-full font-bold shadow-[0_4px_15px_rgba(139,0,0,0.4)] flex items-center gap-3 mx-auto hover:shadow-[0_6px_20px_rgba(139,0,0,0.6)] transition-all border border-[#d4af37] text-sm md:text-base"
                                            >
                                                <span className="tracking-widest uppercase">Ayooo berpetualang!</span>
                                                <span className="text-lg md:text-xl">🚀</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </motion.div>
    );
}
