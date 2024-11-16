'use client';
import { cn } from '@/lib/utils';
import Icon from '../generic/icon/icon';
import Label from '../generic/label';
import Note from './note';

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
        {!disabled && <Icon icon="plus" className="mr-2" onClick={addNote} />}
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
