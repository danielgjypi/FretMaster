import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InteractiveChord } from './InteractiveChord';
import { Chord, ChordGroupType } from '../lib/chords';
import { motion } from 'motion/react';

interface SortableChordProps {
  key?: string;
  id: string;
  index: number;
  chord: Chord;
  group?: ChordGroupType;
  lastChord?: Chord;
  isCurrentlyPlaying: boolean;
  onRemove: () => void;
  onUpdateChord: (chord: Chord) => void;
}

export function SortableChord({
  id,
  index,
  chord,
  group,
  lastChord,
  isCurrentlyPlaying,
  onRemove,
  onUpdateChord
}: SortableChordProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.6 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      transition={{ duration: 0.2 }}
      className="relative group/sortable cursor-grab active:cursor-grabbing"
    >
      <InteractiveChord 
        chord={chord}
        group={group}
        viewMode="progression"
        indexLabel={index + 1}
        lastChord={lastChord}
        isCurrentlyPlaying={isCurrentlyPlaying}
        onRemove={onRemove}
        onUpdateChord={onUpdateChord}
      />
    </motion.div>
  );
}
