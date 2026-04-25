import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
  currentTheme?: string;
}

export function SplashScreen({ onComplete, currentTheme = 'zinc' }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const text = "FretMaster";

  useEffect(() => {
    // Keep it visible for a bit, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  // Use a hardcoded list of light themes, fallback assumes dark.
  const lightThemes = ['zinc-light', 'sepia', 'gruvbox-light', 'lavender', 'mint', 'rosewater', 'github-light'];
  const isDarkMode = !lightThemes.includes(currentTheme);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center bg-background pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="flex gap-1 overflow-visible p-12">
              {text.split('').map((letter, index) => {
                const isPrimary = index >= 4;
                const colorVar = isPrimary ? 'var(--color-primary)' : 'var(--color-foreground)';
                
                return (
                  <motion.div
                    key={index}
                    initial={{ 
                      y: 50, 
                      opacity: 0, 
                      rotateX: -90,
                    }}
                    animate={{ 
                      y: 0, 
                      opacity: 1, 
                      rotateX: 0,
                    }}
                    exit={{ y: -50, opacity: 0, rotateX: 90 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.2, 0.65, 0.3, 0.9],
                      delay: index * 0.1,
                    }}
                    className="font-serif italic text-6xl md:text-8xl relative"
                    style={{
                      textShadow: isDarkMode && isPrimary ? `0 0 30px ${colorVar}` : 'none'
                    }}
                  >
                    {/* Outline layer */}
                    <div style={{ color: 'transparent', WebkitTextStroke: `1px ${colorVar}`, opacity: 0.8 }}>
                      {letter}
                    </div>
                    {/* Fill layer */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.6, duration: 0.6 }}
                      className="absolute inset-0"
                      style={{ color: colorVar }}
                    >
                      {letter}
                    </motion.div>
                  </motion.div>
                );
              })}
              <motion.span
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.4, delay: text.length * 0.1 + 0.6 }}
                 className="font-serif italic text-6xl md:text-8xl text-primary font-bold"
                 style={{
                   textShadow: isDarkMode ? `0 0 30px var(--color-primary)` : 'none'
                 }}
              >
                 .
              </motion.span>
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: text.length * 0.1 + 0.6 }}
              className="text-sm md:text-base uppercase tracking-[0.3em] text-muted-foreground font-mono mt-[-20px]"
            >
               Pro Composition & Voicing Suite
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
