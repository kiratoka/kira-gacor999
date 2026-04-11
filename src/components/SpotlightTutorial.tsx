import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

const TUTORIAL_STEPS = [
  { id: 0, selector: '[data-tutorial="board"]', title: 'Board', description: 'Ini papan permainan. Geser simbol untuk mencocokkan.' },
  { id: 1, selector: '[data-tutorial="saldo"]', title: 'Saldo', description: 'Ini saldo kamu. Setiap langkah mengurangi uangmu.' },
  { id: 2, selector: '[data-tutorial="total-main"]', title: 'Total Main', description: 'Ini total uang yang sudah kamu gunakan.' },
  { id: 3, selector: '[data-tutorial="total-menang"]', title: 'Total Menang', description: 'Ini jumlah kemenangan yang kamu dapatkan.' },
  { id: 4, selector: '[data-tutorial="houseEdge"]', title: 'House Edge', description: 'Ini kerugian bersihmu. Angka ini akan terus naik.' },
  { id: 5, selector: '[data-tutorial="bet-multiplier"]', title: 'Sistem Taruhan', description: 'Menaikkan taruhan membuat kerugianmu lebih cepat, bukan peluang menangmu.' },
  { id: 6, selector: '[data-tutorial="paytable"]', title: 'Paytable', description: 'Hadiah terlihat besar, tapi peluangnya sangat kecil.' },
  { id: 7, selector: '[data-tutorial="admin-panel"]', title: 'Kontrol Sistem', description: 'Sistem judi online memiliki kontrol di balik layar untuk menentukan batas kemenanganmu.' },
  { id: 8, selector: '[data-tutorial="withdraw"]', title: 'Withdraw', description: 'Kamu bisa menarik uang… tapi sistem akan mempersulitnya.' },
  { id: 9, selector: '[data-tutorial="withdraw-moral"]', title: 'Fakta Tersembunyi', description: 'Bahkan jika kamu berhasil menarik uang sekali, sistem membiarkannya agar kamu percaya dan kembali membawa uang lebih banyak.' },
  { id: 10, selector: '[data-tutorial="board"]', title: 'Near Miss', description: 'Kamu sering dibuat hampir menang agar terus bermain.' },
  { id: 11, selector: 'none', title: 'Kesimpulan', description: 'Walaupun terlihat seperti permainan skill, sistem ini dirancang agar kamu kalah.' }
];

export function SpotlightTutorial() {
  const { isTutorialActive, tutorialStepIndex, nextTutorialStep, prevTutorialStep, skipTutorial } = useGameStore();
  
  const [targetData, setTargetData] = useState<any>(null);
  const prevTargetRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  const step = TUTORIAL_STEPS[tutorialStepIndex];

  const updatePosition = useCallback(() => {
    if (!isTutorialActive || !step) return;

    if (step.selector === 'none') {
      setTargetData({ isNone: true });
      if (prevTargetRef.current) {
        prevTargetRef.current.style.position = '';
        prevTargetRef.current.style.zIndex = '';
        prevTargetRef.current = null;
      }
      
      if (overlayRef.current) {
        overlayRef.current.style.setProperty('--x', '50%');
        overlayRef.current.style.setProperty('--y', '50%');
        overlayRef.current.style.setProperty('--radius', '0px');
      }
      return;
    }

    const el = document.querySelector(step.selector) as HTMLElement;
    if (!el || el.offsetWidth === 0 || el.offsetHeight === 0) {
      // Element not ready or hidden
      return;
    }

    // Elevate element above overlay
    if (prevTargetRef.current && prevTargetRef.current !== el) {
      prevTargetRef.current.style.position = '';
      prevTargetRef.current.style.zIndex = '';
    }
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.position === 'static') {
      el.style.position = 'relative';
    }
    el.style.zIndex = '9999';
    prevTargetRef.current = el;

    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const absoluteTop = rect.top + scrollY;
    const absoluteLeft = rect.left + scrollX;

    // Calculate Spotlight Mask values
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Use a slightly larger radius to encompass the element nicely
    const radius = Math.max(rect.width, rect.height) / 2 + 24;

    if (overlayRef.current) {
      overlayRef.current.style.setProperty('--x', `${centerX}px`);
      overlayRef.current.style.setProperty('--y', `${centerY}px`);
      overlayRef.current.style.setProperty('--radius', `${radius}px`);
    }

    // Calculate Tooltip Position
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;

    let placement = 'bottom';
    if (spaceBottom > 220) placement = 'bottom';
    else if (spaceTop > 220) placement = 'top';
    else if (spaceRight > 340) placement = 'right';
    else placement = 'left';

    const tooltipWidth = window.innerWidth < 768 ? window.innerWidth - 32 : 320;
    const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 200;

    let tooltipTop = 0;
    let tooltipLeft = 0;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Bottom sheet style
      tooltipTop = scrollY + window.innerHeight - tooltipHeight - 16;
      tooltipLeft = 16;
      placement = 'mobile';
    } else {
      if (placement === 'bottom') {
        tooltipTop = absoluteTop + rect.height + 16;
        tooltipLeft = absoluteLeft + (rect.width / 2) - (tooltipWidth / 2);
      } else if (placement === 'top') {
        tooltipTop = absoluteTop - tooltipHeight - 16;
        tooltipLeft = absoluteLeft + (rect.width / 2) - (tooltipWidth / 2);
      } else if (placement === 'right') {
        tooltipTop = absoluteTop + (rect.height / 2) - (tooltipHeight / 2);
        tooltipLeft = absoluteLeft + rect.width + 16;
      } else {
        tooltipTop = absoluteTop + (rect.height / 2) - (tooltipHeight / 2);
        tooltipLeft = absoluteLeft - tooltipWidth - 16;
      }

      // Clamp to viewport
      tooltipLeft = Math.max(16, Math.min(tooltipLeft, absoluteLeft + window.innerWidth - rect.left - tooltipWidth - 16));
      // Ensure it doesn't go off the left edge of the document either
      tooltipLeft = Math.max(16, tooltipLeft);
    }

    setTargetData({
      rect,
      absoluteTop,
      absoluteLeft,
      width: rect.width,
      height: rect.height,
      tooltipTop,
      tooltipLeft,
      tooltipWidth,
      placement
    });

  }, [isTutorialActive, step]);

  const loop = useCallback(() => {
    updatePosition();
    requestRef.current = requestAnimationFrame(loop);
  }, [updatePosition]);

  useEffect(() => {
    if (isTutorialActive) {
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isTutorialActive, loop]);

  // Scroll into view when step changes
  useEffect(() => {
    if (!isTutorialActive || !step || step.selector === 'none') return;
    const el = document.querySelector(step.selector) as HTMLElement;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [tutorialStepIndex, isTutorialActive, step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevTargetRef.current) {
        prevTargetRef.current.style.position = '';
        prevTargetRef.current.style.zIndex = '';
      }
    };
  }, []);

  if (!isTutorialActive || !step) return null;

  const isLast = tutorialStepIndex === TUTORIAL_STEPS.length - 1;
  const isFirst = tutorialStepIndex === 0;

  return (
    <>
      {/* Layer 1: Overlay Gelap dengan Spotlight Masking */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[9990] pointer-events-auto transition-opacity duration-300 spotlight-overlay" 
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          // Default values, will be overridden by JS
          '--x': '50%',
          '--y': '50%',
          '--radius': '0px'
        } as React.CSSProperties}
      />

      {/* Layer 2: Highlight Ring */}
      {targetData && !targetData.isNone && (
        <div
          className="absolute border-2 border-cyan-400 rounded-2xl pointer-events-none z-[9999] transition-all duration-300 ease-in-out"
          style={{
            top: targetData.absoluteTop - 8,
            left: targetData.absoluteLeft - 8,
            width: targetData.width + 16,
            height: targetData.height + 16,
            boxShadow: '0 0 20px rgba(0,255,255,0.6), inset 0 0 10px rgba(0,255,255,0.2)',
            transform: 'scale(1)',
            animation: 'pulse-ring 2s infinite'
          }}
        />
      )}

      {/* Layer 3: Tooltip Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute bg-surface-container-highest/95 backdrop-blur-xl border border-primary-container/50 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,255,255,0.2)] z-[10000] pointer-events-auto"
          style={
            targetData?.isNone
              ? {
                  top: window.scrollY + window.innerHeight / 2,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: Math.min(320, window.innerWidth - 32)
                }
              : {
                  top: targetData?.tooltipTop || 0,
                  left: targetData?.tooltipLeft || 0,
                  width: targetData?.tooltipWidth || 320,
                  transition: 'top 0.25s ease-in-out, left 0.25s ease-in-out'
                }
          }
        >
          {/* Arrow Pointer */}
          {targetData && !targetData.isNone && targetData.placement !== 'mobile' && (
            <div
              className="absolute w-4 h-4 bg-surface-container-highest border-primary-container/50 transform rotate-45"
              style={{
                ...(targetData.placement === 'bottom' && { top: -8, left: '50%', marginLeft: -8, borderTopWidth: 1, borderLeftWidth: 1 }),
                ...(targetData.placement === 'top' && { bottom: -8, left: '50%', marginLeft: -8, borderBottomWidth: 1, borderRightWidth: 1 }),
                ...(targetData.placement === 'right' && { left: -8, top: '50%', marginTop: -8, borderBottomWidth: 1, borderLeftWidth: 1 }),
                ...(targetData.placement === 'left' && { right: -8, top: '50%', marginTop: -8, borderTopWidth: 1, borderRightWidth: 1 }),
              }}
            />
          )}

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-headline font-bold text-primary-container uppercase tracking-widest flex items-center gap-2">
                {step.title}
                <span className="text-[10px] bg-primary-container/20 text-primary-container px-2 py-0.5 rounded-full">
                  {tutorialStepIndex + 1}/{TUTORIAL_STEPS.length}
                </span>
              </h4>
              <button onClick={skipTutorial} className="text-on-surface-variant hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-white font-medium leading-relaxed mb-6">
              {step.description}
            </p>
            <div className="flex flex-col gap-5 items-center justify-between">
              <div className="flex gap-1">
                {TUTORIAL_STEPS.map((s, i) => (
                  <div key={s.id} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === tutorialStepIndex ? 'bg-primary-container w-4 shadow-[0_0_8px_#00ffff]' : 'bg-white/20'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {!isFirst && (
                  <button onClick={prevTutorialStep} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <button onClick={isLast ? skipTutorial : nextTutorialStep} className="flex items-center gap-1 bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                  {isLast ? "Selesai" : "Selanjutnya"}
                  {!isLast && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <style>{`
        .spotlight-overlay {
          -webkit-mask-image: radial-gradient(
            circle at var(--x) var(--y),
            transparent 0px,
            transparent var(--radius),
            black calc(var(--radius) + 2px)
          );
          mask-image: radial-gradient(
            circle at var(--x) var(--y),
            transparent 0px,
            transparent var(--radius),
            black calc(var(--radius) + 2px)
          );
          transition: --x 0.3s ease, --y 0.3s ease, --radius 0.3s ease;
        }

        /* Register custom properties for smooth animation */
        @property --x {
          syntax: '<length-percentage>';
          inherits: false;
          initial-value: 50%;
        }
        @property --y {
          syntax: '<length-percentage>';
          inherits: false;
          initial-value: 50%;
        }
        @property --radius {
          syntax: '<length>';
          inherits: false;
          initial-value: 0px;
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); box-shadow: 0 0 20px rgba(0,255,255,0.6), inset 0 0 10px rgba(0,255,255,0.2); }
          50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(0,255,255,0.8), inset 0 0 15px rgba(0,255,255,0.4); }
          100% { transform: scale(1); box-shadow: 0 0 20px rgba(0,255,255,0.6), inset 0 0 10px rgba(0,255,255,0.2); }
        }
      `}</style>
    </>
  );
}
