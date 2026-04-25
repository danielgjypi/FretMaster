import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  itemClassName?: string;
}

export function CustomSelect({ options, value, onChange, className, buttonClassName, menuClassName, itemClassName }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("w-full flex items-center justify-between gap-2 px-3 py-2 bg-background border border-border hover:border-primary/50 text-sm focus:outline-none transition-colors", buttonClassName)}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn("absolute z-50 w-full mt-1 bg-card border border-border shadow-xl max-h-60 overflow-auto custom-scrollbar rounded-sm", menuClassName)}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted transition-colors",
                  value === option.value ? "text-primary bg-primary/5" : "text-foreground",
                  itemClassName || "text-sm"
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check size={14} className="text-primary flex-shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
