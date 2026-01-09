'use client';
import { userContext } from '@/app/userProvider';
import CampaignForm from '@/components/campaignForm';
import CampaignButton from '@/components/dashboard/campaignButton';
import CharacterButton from '@/components/dashboard/characterButton';
import Button from '@/components/generic/button';
import { getCampaignsByUserId } from '@/lib/apiHelpers/campaigns';
import { createCharacterSheet } from '@/lib/apiHelpers/sheets';
import { CampaignT } from '@/schemas/campaign';
import { defaultSkills } from '@/schemas/consts/blankCampaignSheet';
import { CharacterSheetT } from '@/schemas/sheet';
import { useSession } from 'next-auth/react';
import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';

export default function Dashboard() {
  const { data: session } = useSession();
  const { sheets, setBigSheet, setSheets, bigSheet, smallSheets } =
    useContext(userContext);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignT[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignT | null>(
    null,
  );
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const importAllRef = useRef<HTMLInputElement>(null);
  // merge all unique skills from all campaigns on top of defaultSkills
  const allSkills = [
    ...defaultSkills.map((skill) => skill.name),
    ...campaigns
      .flatMap((campaign) => campaign.skills ?? [])
      .filter((skill): skill is CampaignT['skills'][number] => Boolean(skill))
      .map((skill) => skill.name),
  ].filter((skill, index, self) => self.indexOf(skill) === index);

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const data = await getCampaignsByUserId(session.user.id);
        setCampaigns(data);
      }
    };
    fetchData();
  }, [session]);

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

  const handleExportAll = () => {
    const cleanedSheets = sheets.map((sheet) => stripSheetMeta(sheet));
    downloadJson(cleanedSheets, 'character-sheets.json');
  };

  const handleImportAll = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setIsBulkImporting(true);
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
      if (!Array.isArray(parsed)) {
        console.error('Imported JSON must be an array of character sheets.');
        return;
      }
      const createdSheets = await Promise.all(
        parsed.map(async (sheet) => {
          if (!sheet || typeof sheet !== 'object') return null;
          const cleaned = stripSheetMeta(sheet as Partial<CharacterSheetT>);
          return createCharacterSheet({
            ...cleaned,
            owner: session.user.id,
          });
        }),
      );
      const validSheets = createdSheets.filter(
        (sheet): sheet is CharacterSheetT => Boolean(sheet),
      );
      if (validSheets.length > 0) {
        setSheets((prev) => [...prev, ...validSheets]);
      }
    } catch (error) {
      console.error('Failed to import character sheets JSON', error);
    } finally {
      setIsBulkImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
      <div className="col-span-1">
        <h2 className="mb-2 text-xl font-bold">Your Character Sheets:</h2>
        <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
          {sheets.map((sheet, index) => {
            const isOpen =
              bigSheet?.sheet?.id === sheet.id ||
              smallSheets.some((entry) => entry.sheet?.id === sheet.id);
            return (
              <CharacterButton
                key={sheet.id || `${sheet.name?.text || 'sheet'}-${index}`}
                character={sheet}
                disabled={isOpen}
                onClick={
                  isOpen
                    ? undefined
                    : () =>
                        setBigSheet({ sheet, state: 'edit', skills: allSkills })
                }
              />
            );
          })}
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Button label="Export All" type="button" onClick={handleExportAll} />
          <input
            ref={importAllRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportAll}
            disabled={isBulkImporting}
          />
          <Button
            label={isBulkImporting ? 'Importing...' : 'Import JSON'}
            type="button"
            onClick={() => importAllRef.current?.click()}
            disabled={isBulkImporting}
          />
          <Button
            className="flex w-max grow bg-green-500 hover:bg-green-700"
            label="Create New Character Sheet"
            onClick={() =>
              setBigSheet({
                state: 'create',
                skills: allSkills,
              })
            }
          />
        </div>
      </div>
      <div className="col-span-1">
        <h2 className="mb-2 text-xl font-bold">Your Campaigns:</h2>
        <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignButton
              key={campaign.id}
              name={campaign.name}
              imageUrl={campaign.icon?.url ?? undefined}
              onClick={() => setSelectedCampaign(campaign)}
            />
          ))}
        </div>
        {selectedCampaign && (
          <CampaignForm
            key={selectedCampaign.id}
            initialCampaign={selectedCampaign}
            state={
              selectedCampaign.owner === session?.user?.id ? 'edit' : 'view'
            }
            setCampaigns={setCampaigns}
            onClose={() => setSelectedCampaign(null)}
          />
        )}
        <Button
          className="w-full bg-green-500 hover:bg-green-700"
          label="Create New Campaign"
          onClick={() => setShowCampaignForm(true)}
        />
      </div>
      {showCampaignForm && (
        <CampaignForm
          onClose={() => setShowCampaignForm(false)}
          setCampaigns={setCampaigns}
        />
      )}
    </div>
  );
}
