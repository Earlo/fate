import Note from './note';
import Label from '../generic/label';
import AddButton from '../generic/addButton';
import { cn } from '@/lib/helpers';
import { useCallback } from 'react';

interface NoteInputProps {
  notes: { name: string; content: string; visibleIn: string[] }[];
  setNotes: (
    value: { name: string; content: string; visibleIn: string[] }[],
  ) => void;
  disabled?: boolean;
  campaignId?: string;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  title?: string;
  className?: string;
}

const NoteInput: React.FC<NoteInputProps> = ({
  notes,
  setNotes,
  disabled = false,
  campaignId,
  state,
  title = 'Note',
  className,
}) => {
  const setNote = useCallback(
    (
      value: { name: string; content: string; visibleIn: string[] },
      index: number,
    ) => {
      const updatedNotes = [...notes];
      updatedNotes[index] = value;
      console.log('updatedNotes', updatedNotes);
      setNotes(updatedNotes);
    },
    [notes, setNotes],
  );
  return (
    <div className={cn(className)}>
      <Label name={title + 's'} className="pb-0">
        {!disabled && (
          <AddButton
            onClick={() =>
              setNotes([
                ...notes,
                { name: 'New Note', content: '', visibleIn: [] },
              ])
            }
          />
        )}
      </Label>
      {notes.map((note, index) => (
        <Note
          key={index}
          initialName={note.name}
          initialContent={note.content}
          visibleIn={note.visibleIn}
          setNote={(value) => setNote(value, index)}
          deleteNote={() => {
            const updatedNotes = [...notes];
            updatedNotes.splice(index, 1);
            setNotes(updatedNotes);
          }}
          disabled={disabled}
          campaignId={campaignId}
          state={state}
        />
      ))}
    </div>
  );
};

export default NoteInput;
