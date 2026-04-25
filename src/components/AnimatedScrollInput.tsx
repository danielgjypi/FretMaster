import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedScrollInputProps {
  value: string | number;
  onChange?: (val: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
  compareValues?: (newVal: string | number, oldVal: string | number) => number;
}

export function AnimatedScrollInput({ value, onChange, onIncrement, onDecrement, className = '', compareValues }: AnimatedScrollInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [direction, setDirection] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  // Derive state during render to ensure animations get right direction immediately
  if (value !== prevValue) {
    let newDirection = direction;
    if (compareValues) {
      newDirection = compareValues(value, prevValue);
    } else {
      // Try to determine direction if they are numbers
      const numVal = typeof value === 'number' ? value : parseFloat(value as string);
      const prevNumVal = typeof prevValue === 'number' ? prevValue : parseFloat(prevValue as string);
      
      if (!isNaN(numVal) && !isNaN(prevNumVal)) {
        newDirection = numVal > prevNumVal ? 1 : -1;
      }
    }
    setDirection(newDirection);
    setPrevValue(value);
    if (!isFocused) {
      setTempValue(value.toString());
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (isFocused) return;
    
    if (e.deltaY < 0) {
      setDirection(1);
      onIncrement();
    } else if (e.deltaY > 0) {
      setDirection(-1);
      onDecrement();
    }
  };

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center group cursor-ns-resize ${className}`}
      onWheel={handleWheel}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {!isFocused ? (
          <motion.span
            key={value}
            initial={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
            transition={{ duration: 0.08, ease: "easeOut" }}
            className="absolute pointer-events-none"
          >
            {value}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <input
        type="text"
        value={isFocused ? tempValue : ''}
        onChange={(e) => {
          setTempValue(e.target.value);
          if (onChange) onChange(e.target.value);
        }}
        onFocus={() => {
          setIsFocused(true);
          setTempValue(value.toString());
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        className={`w-full h-full bg-transparent border-none text-center focus:outline-none focus:ring-0 ${!isFocused ? 'text-transparent selection:text-transparent caret-transparent' : 'text-foreground'}`}
      />
    </div>
  );
}
