'use client';
import VisibilityToggle from './visibilityToggle';
import Input from '../generic/input';
import CloseButton from '../generic/closeButton';
import IconButton from '../generic/iconButton';
import { cn } from '@/lib/helpers';
import useDebounce from '@/hooks/debounce';
import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';

interface NoteProps {
  note: {
    name: string;
    content: string;
    visibleIn: string[];
  };
  disabled?: boolean;
  campaignId: string;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  deleteNote: () => void;
  updateNote: (note: {
    name: string;
    content: string;
    visibleIn: string[];
  }) => void;
}

const Note: React.FC<NoteProps> = ({
  note,
  disabled = false,
  campaignId,
  state,
  deleteNote,
  updateNote,
}) => {
  const [name, setName] = useState(note.name);
  const [content, setContent] = useState(note.content);
  const debouncedName = useDebounce(name, 300);
  const debouncedContent = useDebounce(content, 300);
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/writeNote',
  });
  const isDisabled = disabled || isLoading;
  const visible = note.visibleIn.includes(campaignId);
  const toggle = state === 'toggle';
  const anyWidgets = !(!isDisabled || (toggle && campaignId));

  const callOpenAi = async (title: string) => {
    if (!campaignId) {
      console.error('No campaignId provided to callOpenAi');
      return 'Error: No campaignId';
    }
    const body = JSON.stringify({
      campaignId,
      prompt: `Write note "${title}" for campaign ${campaignId}.`,
    });
    const response = await complete(body);
    if (!response) {
      return 'Error with the response';
    }
    setContent(response);
  };
  useEffect(() => {
    if (note.name !== debouncedName || note.content !== debouncedContent) {
      updateNote({
        ...note,
        name: debouncedName,
        content: debouncedContent,
      });
    }
  }, [debouncedName, debouncedContent, note, updateNote]);

  return (
    <div className="flex grow flex-col pb-1">
      <div className="flex h-8 min-w-[50%] items-center align-middle">
        <Input
          name={`${name}-name`}
          value={toggle ? (visible ? name : '???') : name}
          placeholder={`${name} Name`}
          required
          disabled={isDisabled}
          onChange={(e) => setName(e.target.value)}
          className={cn(
            'grow rounded-b-none border-b-0 sm:rounded-b sm:border-b-2',
            {
              'rounded-t-none': !anyWidgets,
            },
          )}
        />
        {!isDisabled && (
          <IconButton
            className="mb-1"
            onClick={async () => await callOpenAi(name)}
          />
        )}
        {!isDisabled && (
          <CloseButton className="mb-1 ml-1" onClick={deleteNote} />
        )}
        {toggle && campaignId && (
          <VisibilityToggle
            visible={visible}
            onChange={(visible) =>
              updateNote({
                ...note,
                visibleIn: visible
                  ? [...note.visibleIn, campaignId]
                  : note.visibleIn.filter((id) => id !== campaignId),
              })
            }
          />
        )}
      </div>
      <Input
        name={`${name}-content`}
        value={
          toggle
            ? visible
              ? content
              : '???'
            : isLoading
              ? completion
              : content
        }
        placeholder={`Description for ${name}`}
        multiline
        required
        disabled={isDisabled}
        onChange={(e) => setContent(e.target.value)}
        className={cn('grow rounded-tl-none sm:rounded-tl', {
          'rounded-tr-none sm:rounded-tr': anyWidgets,
        })}
      />
    </div>
  );
};

export default Note;
