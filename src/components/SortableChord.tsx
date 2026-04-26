import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InteractiveChord } from './InteractiveChord';
import { Chord, ChordGroupType } from '../lib/chords';

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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
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
    </div>
  );
}
