import { cn } from '@/lib/utils';
import EditableList from './editableList';
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
    <EditableList
      title={title + 's'}
      items={notes}
      disabled={disabled}
      className={cn(className)}
      labelClassName="pb-0"
      onAdd={!disabled && addNote ? addNote : undefined}
      renderItem={(note, index) => (
        <Note
          key={index}
          note={note}
          disabled={disabled}
          campaignId={campaignId}
          state={state}
          deleteNote={() => deleteNote(index)}
          updateNote={(note) => updateNote(note, index)}
        />
      )}
    />
  );
};

export default NoteInput;
