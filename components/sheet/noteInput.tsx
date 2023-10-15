import VisibilityToggle from './visibilityToggle';
import Input from '../generic/input';
import Label from '../generic/label';
import CloseButton from '../generic/closeButton';
import AddButton from '../generic/addButton';
import IconButton from '../generic/iconButton';
import { cn } from '@/lib/helpers';
import useDebounce from '@/hooks/debounce';
import { useState, useEffect } from 'react';

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
  const [debouncedNames, setDebouncedNames] = useState<string[]>(
    notes.map((n) => n.name),
  );
  const [debouncedContents, setDebouncedContents] = useState<string[]>(
    notes.map((n) => n.content),
  );

  const callOpenAi = async (title: string) => {
    const response = await fetch('/api/writeNote', {
      method: 'POST',
      body: JSON.stringify({
        prompt: `Write note "${title}" for the campaign "${campaignId}".`,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const content = await response.json();
    return content;
  };

  const debouncedName = useDebounce(debouncedNames, 300);
  const debouncedContent = useDebounce(debouncedContents, 300);
  useEffect(() => {
    // update notes once debounced name or content changes
    const updatedNotes = notes.map((note, index) => ({
      ...note,
      name: debouncedName[index],
      content: debouncedContent[index],
    }));
    setNotes(updatedNotes);
  }, [debouncedName, debouncedContent]);

  const anyWidgets = !(!disabled || (state === 'toggle' && campaignId));
  return (
    <div className={cn(className)}>
      <Label name={title + 's'} className="pb-0">
        {!disabled && (
          <AddButton
            onClick={() =>
              setNotes([...notes, { name: '', content: '', visibleIn: [] }])
            }
          />
        )}
      </Label>
      {notes.map((note, index) => (
        <div key={index} className="flex grow flex-col pb-1">
          <div className="flex h-10 min-w-[50%] items-center align-middle">
            <Input
              name={`${title}-${index}-name`}
              value={
                state === 'toggle'
                  ? note?.visibleIn.includes(campaignId || '')
                    ? note.name
                    : '???'
                  : debouncedNames[index]
              }
              placeholder={`${title} Name`}
              required
              disabled={disabled}
              onChange={(e) => {
                const updatedNames = [...debouncedNames];
                updatedNames[index] = e.target.value;
                setDebouncedNames(updatedNames);
              }}
              className={cn(
                'grow rounded-b-none border-b-0 sm:rounded-b sm:border-b-2',
                {
                  'rounded-t-none': index === 0 && !anyWidgets,
                },
              )}
            />
            {!disabled && (
              <IconButton
                className="mb-1 p-1"
                onClick={async () => {
                  const response = await callOpenAi(debouncedNames[index]);
                  const updatedContents = [...debouncedContents];
                  updatedContents[index] = response;
                  setDebouncedContents(updatedContents);
                }}
              />
            )}
            {!disabled && (
              <CloseButton
                className="mb-1 ml-1 p-1"
                onClick={() =>
                  setNotes([
                    ...notes.slice(0, index),
                    ...notes.slice(index + 1),
                  ])
                }
              />
            )}
            {state === 'toggle' && campaignId && (
              <VisibilityToggle
                visible={note?.visibleIn.includes(campaignId)}
                onChange={(visible) =>
                  setNotes([
                    ...notes.slice(0, index),
                    {
                      name: note.name,
                      content: note.content,
                      visibleIn: visible
                        ? [...note.visibleIn, campaignId]
                        : note.visibleIn.filter((id) => id !== campaignId),
                    },
                    ...notes.slice(index + 1),
                  ])
                }
              />
            )}
          </div>
          <Input
            name={`${title}-${index}-content`}
            value={
              state === 'toggle'
                ? note?.visibleIn.includes(campaignId || '')
                  ? note.content
                  : '???'
                : debouncedContents[index]
            }
            placeholder={
              note.name ? `Description for ${note.name}` : `${title} content`
            }
            multiline
            required
            disabled={disabled}
            onChange={(e) => {
              const updatedContents = [...debouncedContents];
              updatedContents[index] = e.target.value;
              setDebouncedContents(updatedContents);
            }}
            className={cn('grow rounded-tl-none sm:rounded-tl', {
              'rounded-tr-none sm:rounded-tr': anyWidgets,
              'sm:rounded-tl-none': index === 0,
            })}
          />
        </div>
      ))}
    </div>
  );
};

export default NoteInput;
