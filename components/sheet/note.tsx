import VisibilityToggle from './visibilityToggle';
import Input from '../generic/input';
import CloseButton from '../generic/closeButton';
import IconButton from '../generic/iconButton';
import { cn } from '@/lib/helpers';
import useDebounce from '@/hooks/debounce';
import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';

interface NoteProps {
  initialName: string;
  initialContent: string;
  visibleIn: string[];
  setNote: (value: {
    name: string;
    content: string;
    visibleIn: string[];
  }) => void;
  deleteNote: () => void;
  disabled?: boolean;
  campaignId?: string;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
}

const Note: React.FC<NoteProps> = ({
  initialName,
  initialContent,
  visibleIn,
  setNote,
  deleteNote,
  disabled = false,
  campaignId,
  state,
}) => {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const debouncedName = useDebounce(name, 300);
  const debouncedContent = useDebounce(content, 300);
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/writeNote',
  });
  const isDisabled = disabled || isLoading;

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
    setNote({
      name: debouncedName,
      content: debouncedContent,
      visibleIn,
    });
  }, [debouncedName, debouncedContent, visibleIn]);

  const anyWidgets = !(!isDisabled || (state === 'toggle' && campaignId));
  return (
    <div className="flex grow flex-col pb-1">
      <div className="flex h-10 min-w-[50%] items-center align-middle">
        <Input
          name={`${name}-name`}
          value={
            state === 'toggle'
              ? visibleIn.includes(campaignId || '')
                ? name
                : '???'
              : name
          }
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
            className="mb-1 p-1"
            onClick={async () => await callOpenAi(debouncedName)}
          />
        )}
        {!isDisabled && (
          <CloseButton className="mb-1 ml-1 p-1" onClick={deleteNote} />
        )}
        {state === 'toggle' && campaignId && (
          <VisibilityToggle
            visible={visibleIn.includes(campaignId)}
            onChange={(visible) =>
              setNote({
                name: debouncedName,
                content: debouncedContent,
                visibleIn: visible
                  ? [...visibleIn, campaignId]
                  : visibleIn.filter((id) => id !== campaignId),
              })
            }
          />
        )}
      </div>
      <Input
        name={`${name}-content`}
        value={
          state === 'toggle'
            ? visibleIn.includes(campaignId || '')
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
