import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { PitchData } from '../hooks/usePitchDetector';

interface StrobeTunerProps {
  pitchData: PitchData | null;
  onClose: () => void;
  className?: string;
}

export function StrobeTuner({ pitchData, onClose, className }: StrobeTunerProps) {
  const isTuned = pitchData ? Math.abs(pitchData.cents) <= 5 : false;
  const ringRefs = [
    React.useRef<SVGCircleElement>(null),
    React.useRef<SVGCircleElement>(null),
    React.useRef<SVGCircleElement>(null),
    React.useRef<SVGCircleElement>(null),
  ];
  const rotationRefs = React.useRef([0, 0, 0, 0]);

  // High-performance rotation loop bypassing React state
  React.useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (pitchData && Math.abs(pitchData.cents) > 1) {
        // Calculate speed based on cents (more out of tune = faster)
        // Sign of cents determines direction
        const speedMultiplier = pitchData.cents; // e.g. -15 to +15
        const baseDegreesPerMillisecond = speedMultiplier * 0.015;

        // Harmonics multipliers: outermost spins fastest, innermost slowest
        const multipliers = [1.0, 1.5, 2.0, 2.5]; 
        
        for (let i = 0; i < 4; i++) {
           rotationRefs.current[i] += baseDegreesPerMillisecond * multipliers[i] * delta;
        }
      }

      for (let i = 0; i < 4; i++) {
        if (ringRefs[i].current) {
          ringRefs[i].current!.style.transform = `rotate(${rotationRefs.current[i]}deg)`;
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pitchData]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "absolute inset-0 z-[100] bg-background flex flex-col items-center justify-center",
        className
      )}
    >
      {/* Title */}
      <div className="absolute top-10 left-8 flex items-center gap-3 z-50">
        <h1 className="text-3xl font-serif italic text-foreground tracking-tight transition-colors">
            Tuner
        </h1>
        <div className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-widest font-bold">
            Tool
        </div>
      </div>

      {/* Main Display */}
      <div className="relative flex items-center justify-center mb-8 w-80 h-80">
        {/* Outer Strobe Rings (Crisp SVG) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg 
            viewBox="0 0 100 100" 
            className={cn(
               "w-[95%] h-[95%] text-primary transition-opacity duration-300 opacity-60",
               isTuned ? "opacity-100 drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "",
               !pitchData ? "opacity-10" : ""
            )}
          >
             {/* Ring 1 (Innermost) */}
             <circle ref={ringRefs[0]} cx="50" cy="50" r="37" fill="transparent" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 6" style={{ transformOrigin: '50px 50px' }} />
             {/* Ring 2 */}
             <circle ref={ringRefs[1]} cx="50" cy="50" r="40.5" fill="transparent" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3.5 6.5" style={{ transformOrigin: '50px 50px' }} />
             {/* Ring 3 */}
             <circle ref={ringRefs[2]} cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 7" style={{ transformOrigin: '50px 50px' }} />
             {/* Ring 4 (Outermost) */}
             <circle ref={ringRefs[3]} cx="50" cy="50" r="47.5" fill="transparent" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4.5 7.5" style={{ transformOrigin: '50px 50px' }} />
          </svg>
        </div>

        {/* Inner Note Display */}
        <div className="z-10 flex flex-col items-center justify-center rounded-full bg-background border-4 border-border/20 shadow-inner relative w-52 h-52">
            {/* Active Note Data */}
            <div className={cn(
                "flex flex-col items-center justify-center absolute transition-all duration-300",
                pitchData ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            )}>
               <div className={cn(
                 "font-serif italic font-bold transition-colors duration-300 text-8xl",
                 isTuned ? "text-primary drop-shadow-sm" : "text-foreground"
               )}>
                 {pitchData?.noteName.replace(/[0-9]/g, '') || '-'}
               </div>
               <div className="text-muted-foreground font-mono transition-colors duration-300 text-lg mt-4">
                 {pitchData && pitchData.cents > 0 ? '+' : ''}{pitchData?.cents || 0}¢
               </div>
            </div>

            {/* Inactive State */}
            <div className={cn(
                "uppercase tracking-widest text-center px-2 absolute transition-all duration-300 text-lg",
                !pitchData ? "opacity-50 scale-100" : "opacity-0 scale-105 pointer-events-none text-muted-foreground"
             )}>
               Waiting<br/>for signal
            </div>
        </div>
      </div>
      
      {/* Target indicator */}
      <div className="flex items-center justify-between w-full mt-4 max-w-[300px]">
         <div className={cn("font-bold transition-colors text-base", pitchData && pitchData.cents < -5 ? "text-primary" : "text-muted-foreground")}>
            FLAT
         </div>
         <div className={cn("rounded-full transition-colors w-4 h-4", isTuned ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-muted")} />
         <div className={cn("font-bold transition-colors text-base", pitchData && pitchData.cents > 5 ? "text-primary" : "text-muted-foreground")}>
            SHARP
         </div>
      </div>
    </motion.div>
  );
}
