'use client';
import Note from './note';
import Label from '../generic/label';
import AddButton from '../generic/addButton';
import { cn } from '@/lib/helpers';

interface NoteInputProps {
  notes: { name: string; content: string; visibleIn: string[] }[];
  disabled?: boolean;
  campaignId: string;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  title?: string;
  className?: string;
  addNote?: () => void;
  deleteNote: (index: number) => void;
  updateNote: (
    note: {
      name: string;
      content: string;
      visibleIn: string[];
    },
    index: number,
  ) => void;
}

const NoteInput: React.FC<NoteInputProps> = ({
  notes,
  disabled = false,
  campaignId,
  state,
  title = 'Note',
  className,
  addNote,
  deleteNote,
  updateNote,
}) => {
  return (
    <div className={cn(className)}>
      <Label name={title + 's'} className="pb-0">
        {!disabled && <AddButton onClick={addNote} />}
      </Label>
      {notes.map((note, index) => (
        <Note
          key={index}
          note={note}
          disabled={disabled}
          campaignId={campaignId}
          state={state}
          deleteNote={() => deleteNote(index)}
          updateNote={(note) => updateNote(note, index)}
        />
      ))}
    </div>
  );
};

export default NoteInput;
