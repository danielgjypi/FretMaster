import React, { useState, useCallback, createContext, useContext } from 'react';
import confetti from 'canvas-confetti';
import * as Tone from 'tone';
import { playChord } from '../lib/synth';
import { CHORD_GROUPS, ALL_CHORDS } from '../lib/chords';
import { THEMES } from '../lib/themes';
import { useTheme } from './ThemeProvider';

interface EasterEggContextType {
  triggerEasterEgg: (x: number, y: number) => void;
  registerClick: (e: React.MouseEvent) => void;
}

const EasterEggContext = createContext<EasterEggContextType | null>(null);

export function EasterEggProvider({ children }: { children: React.ReactNode }) {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const { theme: themeId } = useTheme();

  const triggerEasterEgg = useCallback((x: number, y: number) => {
    // Resolve theme colors
    let primaryColor = '#f59e0b';
    let secondaryColor = '#71717a';

    const themeObj = THEMES.find(t => t.id === themeId);
    if (themeObj) {
      primaryColor = themeObj.colors.primary;
      secondaryColor = themeObj.colors.muted;
    } else if (themeId.startsWith('custom-')) {
      const saved = localStorage.getItem('fretmaster-custom-themes');
      if (saved) {
        try {
          const customThemes = JSON.parse(saved);
          const found = customThemes.find((t: any) => t.id === themeId);
          if (found) {
            primaryColor = found.colors.primary;
            secondaryColor = found.colors.muted;
          }
        } catch (e) {}
      }
    }

    console.log('Easter Egg Triggered!', { x, y, primaryColor });

    // Throws confetti from the click point
    const rect = { x: x / window.innerWidth, y: y / window.innerHeight };
    
    // Main confetti burst
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { x: rect.x, y: rect.y },
      colors: [primaryColor, secondaryColor, '#ffffff', '#000000'],
      zIndex: 10001
    });

    // Simple fireworks
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001, colors: [primaryColor, secondaryColor] };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Play a random surprise chord
    const randomChord = ALL_CHORDS[Math.floor(Math.random() * ALL_CHORDS.length)];
    if (randomChord) {
        playChord(randomChord);
    }
    
  }, [themeId]);

  const registerClick = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    if (timeDiff < 1000) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      console.log(`Click count: ${newCount}`);
      if (newCount >= 5) {
        triggerEasterEgg(e.clientX, e.clientY);
        setClickCount(0);
      }
    } else {
      setClickCount(1);
      console.log('Click count reset to 1');
    }
    setLastClickTime(now);
  }, [clickCount, lastClickTime, triggerEasterEgg]);

  return (
    <EasterEggContext.Provider value={{ triggerEasterEgg, registerClick }}>
      {children}
    </EasterEggContext.Provider>
  );
}

export const useEasterEgg = () => {
  const context = useContext(EasterEggContext);
  if (!context) throw new Error('useEasterEgg must be used within EasterEggProvider');
  return context;
};
