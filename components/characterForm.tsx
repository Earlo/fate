'use client';
import { userContext } from '@/app/userProvider';
import { useDebouncedRefresh } from '@/hooks/useDebouncedRefresh';
import {
  createCharacterSheet,
  getCharacterSheetById,
  updateCharacterSheet,
} from '@/lib/apiHelpers/sheets';
import { useRealtimeChannel } from '@/lib/realtime/useRealtimeChannel';
import { upsertById } from '@/lib/utils';
import { defaultSkills } from '@/schemas/consts/blankCampaignSheet';
import { blankSheet } from '@/schemas/consts/blankCharacterSheet';
import { CharacterSheetT } from '@/schemas/sheet';
import { useSession } from 'next-auth/react';
import {
  ChangeEvent,
  FC,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CharacterSheet from './characterSheet';
import FormContainer from './formContainer';
import Button from './generic/button';
interface CharacterFormProps {
  onClose?: () => void;
  onMinimize?: () => void;
  initialSheet?: CharacterSheetT;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  skills?: string[];
}

const CharacterForm: FC<CharacterFormProps> = ({
  onClose,
  onMinimize,
  initialSheet,
  state = 'create',
  campaignId,
  skills = defaultSkills.map((skill) => skill.name),
}) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<CharacterSheetT>({
    ...blankSheet,
    ...initialSheet,
  });
  const editing = initialSheet && (state === 'edit' || state === 'toggle');
  const creating = state === 'create' && !initialSheet;
  const canSave = editing || creating;
  const { setSheets } = useContext(userContext);
  const enableRealtime = Boolean(initialSheet?.id && !canSave);
  const sheetId = initialSheet?.id;
  const mountedRef = useRef(true);

  const stripSheetMeta = (sheet: Partial<CharacterSheetT>) => {
    const { id, owner, created, updated, ...rest } = sheet;
    void id;
    void owner;
    void created;
    void updated;
    return rest;
  };

  const getLineColumn = (text: string, position: number) => {
    const lines = text.slice(0, position).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  };

  const parseJsonWithDetails = (text: string) => {
    try {
      return { parsed: JSON.parse(text), error: null };
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      const positionMatch = rawMessage.match(/position (\d+)/i);
      if (positionMatch) {
        const position = Number(positionMatch[1]);
        const { line, column } = getLineColumn(text, position);
        const snippetStart = Math.max(0, position - 40);
        const snippetEnd = Math.min(text.length, position + 40);
        const snippet = text.slice(snippetStart, snippetEnd);
        return {
          parsed: null,
          error: `Invalid JSON at line ${line} column ${column}. Near: "${snippet}"`,
        };
      }
      const lineColumnMatch = rawMessage.match(/line (\d+) column (\d+)/i);
      if (lineColumnMatch) {
        const line = Number(lineColumnMatch[1]);
        const column = Number(lineColumnMatch[2]);
        const lineText = text.split('\n')[line - 1] ?? '';
        return {
          parsed: null,
          error: `Invalid JSON at line ${line} column ${column}. Line: "${lineText}"`,
        };
      }
      return { parsed: null, error: `Invalid JSON. ${rawMessage}` };
    }
  };

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatFileName = (name: string) => {
    const normalized = name.trim().replace(/\s+/g, '-');
    const safe = normalized.replace(/[^a-zA-Z0-9-_]/g, '');
    return safe || 'character-sheet';
  };

  const handleExport = () => {
    const cleaned = stripSheetMeta(formState);
    const fileBase = formatFileName(formState.name?.text || 'character-sheet');
    downloadJson(cleaned, `${fileBase}.json`);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let cleanedText = text.replace(/^\uFEFF/, '').trim();
      const fenceMatch = cleanedText.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
      if (fenceMatch) {
        cleanedText = fenceMatch[1].trim();
      }
      if (!cleanedText) {
        console.error('Imported file is empty.');
        return;
      }
      const { parsed, error } = parseJsonWithDetails(cleanedText);
      if (error) {
        console.error(error);
        return;
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.error('Invalid character sheet JSON.');
        return;
      }
      const cleaned = stripSheetMeta(parsed as Partial<CharacterSheetT>);
      setFormState({ ...blankSheet, ...cleaned });
    } catch (error) {
      console.error('Failed to import character sheet JSON', error);
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formState,
      ...(creating && { owner: session?.user?.id }),
    };
    try {
      const data = editing
        ? await updateCharacterSheet(initialSheet.id, submitData)
        : await createCharacterSheet(submitData);
      setSheets((prevCharacters) => {
        return upsertById(prevCharacters, data);
      });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('An error occurred while submitting the form', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshSheet = useCallback(async () => {
    if (!sheetId) return;
    try {
      const updated = await getCharacterSheetById(sheetId);
      if (mountedRef.current && updated) {
        setFormState(updated);
      }
    } catch (error) {
      console.error('Could not fetch character sheet:', error);
    }
  }, [sheetId]);

  const handleUpdate = useDebouncedRefresh(() => {
    void refreshSheet();
  }, 200);

  const realtimeEvents = useMemo(
    () => ({ 'sheet-updated': handleUpdate }),
    [handleUpdate],
  );

  useRealtimeChannel({
    enabled: enableRealtime && Boolean(sheetId),
    clientId: session?.user?.id,
    channel: sheetId ? `sheet:${sheetId}` : '',
    streamUrl: sheetId ? `/api/sheets/${sheetId}/stream` : '',
    events: realtimeEvents,
  });
  const handleDelete = async () => {
    setIsSubmitting(true);
    const deletedId = initialSheet?.id;
    if (!deletedId) {
      return;
    }
    try {
      await fetch(`/api/sheets/${deletedId}`, {
        method: 'DELETE',
      });
      setSheets((prevCharacters) =>
        prevCharacters.filter((char) => char.id !== deletedId),
      );
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('An error occurred while deleting the character', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <FormContainer
      onSubmit={handleSubmit}
      onClose={onClose}
      onMinimize={onMinimize}
    >
      <CharacterSheet
        character={formState}
        setCharacter={canSave ? setFormState : undefined}
        state={state}
        campaignId={campaignId}
        skills={skills}
      />
      {canSave && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            label={editing ? 'Save Changes' : 'Create'}
            type="submit"
            disabled={isSubmitting}
          />
          {creating && (
            <>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
                disabled={isSubmitting}
              />
              <Button
                label="Import JSON"
                type="button"
                disabled={isSubmitting}
                onClick={() => importInputRef.current?.click()}
              />
            </>
          )}
          {editing && (
            <Button
              label="Export JSON"
              type="button"
              disabled={isSubmitting}
              onClick={handleExport}
            />
          )}
          {editing && (
            <Button
              label="Delete"
              disabled={isSubmitting}
              type="button"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700"
            />
          )}
        </div>
      )}
    </FormContainer>
  );
};

export default CharacterForm;
