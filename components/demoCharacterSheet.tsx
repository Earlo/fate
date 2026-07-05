'use client';

import CharacterSheet from '@/components/characterSheet';
import RollMessage from '@/components/campaign/rollMessage';
import Icon from '@/components/generic/icon/icon';
import MessageBox from '@/components/generic/chat/messageBox';
import FormContainer from '@/components/formContainer';
import { buildFudgeRoll } from '@/lib/fateDice';
import { downloadJson, stripSheetMeta } from '@/lib/jsonHelpers';
import type { Roll } from '@/lib/realtime/campaignTypes';
import { blankCharacterSheet } from '@/schemas/consts/blankCharacterSheet';
import { defaultSkills } from '@/schemas/consts/blankCampaignSheet';
import type { CharacterSheetT } from '@/schemas/sheet';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { tiers } from './sheet/skillGrid';

type DemoCharacterSheetProps = {
  onClose: () => void;
};

type RollEntry = {
  id: string;
  skillName: string;
  createdAt: string;
  text: string;
  roll: Roll;
};

const demoSkills = defaultSkills().map((skill) => skill.name);

const createDemoSheet = (): CharacterSheetT => ({
  ...blankCharacterSheet(),
  id: 'demo-character',
});

const tierLabelForScore = (score: number) =>
  tiers.reduce((closest, tier) =>
    Math.abs(tier.level - score) < Math.abs(closest.level - score)
      ? tier
      : closest,
  ).label;

const formatTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const DemoCharacterSheet = ({ onClose }: DemoCharacterSheetProps) => {
  const [character, setCharacter] = useState<CharacterSheetT>(createDemoSheet);
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const sheetPanelRef = useRef<HTMLElement | null>(null);
  const [sheetPanelHeight, setSheetPanelHeight] = useState<number | null>(null);

  useEffect(() => {
    const panel = sheetPanelRef.current;
    if (!panel) return;

    const updateHeight = () => {
      setSheetPanelHeight(panel.getBoundingClientRect().height);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(panel);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const handleRoll = (skillName: string, skillBonus: number) => {
    const { dice, total } = buildFudgeRoll();
    const combinedTotal = total + skillBonus;
    const finalLabel = tierLabelForScore(combinedTotal);
    const characterName = character.name.text.trim() || 'Demo character';

    setRolls((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        skillName,
        createdAt: new Date().toISOString(),
        text: `${characterName} uses ${skillName} (${finalLabel})`,
        roll: { dice, total: combinedTotal, bonus: skillBonus },
      },
    ]);
  };

  const handleReset = () => {
    setCharacter(createDemoSheet());
    setRolls([]);
  };

  const handleExport = () => {
    downloadJson(stripSheetMeta(character), 'demo-character-sheet.json');
  };

  const rollLogStyle = sheetPanelHeight
    ? ({
        '--demo-sheet-height': `${sheetPanelHeight}px`,
      } as CSSProperties)
    : undefined;

  return (
    <FormContainer
      onSubmit={(event) => event.preventDefault()}
      formClassName="w-[min(94vw,72rem)] max-h-[88dvh] overflow-visible bg-transparent p-0 shadow-none"
    >
      <div className="flex max-h-[88dvh] min-h-0 flex-col gap-3 lg:flex-row lg:items-start">
        <section
          ref={sheetPanelRef}
          className="max-h-[88dvh] min-w-0 flex-1 overflow-y-auto rounded bg-stone-100 p-2 shadow-md"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-archivo-black text-xl text-neutral-950 uppercase">
              Demo Sheet
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="px-2 py-1 text-xs font-semibold tracking-wide text-gray-600 uppercase transition hover:text-neutral-950"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-2 py-1 text-xs font-semibold tracking-wide text-gray-600 uppercase transition hover:text-neutral-950"
              >
                Export JSON
              </button>
              <button
                type="button"
                aria-label="Close demo sheet"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center text-gray-500 transition hover:text-neutral-950"
              >
                <Icon icon="close" className="h-5 w-5" />
              </button>
            </div>
          </div>
          <CharacterSheet
            character={character}
            setCharacter={setCharacter}
            state="create"
            skills={demoSkills}
            disableRemoteActions
            onRollSkill={handleRoll}
          />
        </section>

        <aside
          className="flex min-h-0 min-w-0 flex-col overflow-hidden border-2 border-neutral-950 bg-neutral-950 p-2 text-stone-100 shadow-md lg:h-[var(--demo-sheet-height)] lg:w-88 lg:shrink-0"
          style={rollLogStyle}
        >
          <MessageBox
            title="Rolls"
            resizable={false}
            className="mt-0 flex min-h-0 flex-1 flex-col"
            viewportClassName="h-64 max-h-none min-h-0 lg:h-0 lg:flex-1"
            action={
              rolls.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setRolls([])}
                  className="text-xs text-gray-300 underline-offset-2 hover:text-stone-100 hover:underline"
                >
                  Clear
                </button>
              ) : null
            }
          >
            {rolls.length > 0 ? (
              rolls.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1 rounded px-1 pb-1"
                >
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="truncate font-semibold">
                      {entry.skillName}
                    </span>
                    <span className="text-gray-400">
                      - {formatTime(entry.createdAt)}
                    </span>
                  </div>
                  <RollMessage text={entry.text} roll={entry.roll} />
                </div>
              ))
            ) : (
              <span className="text-gray-400">
                Select a skill, then use a dice button in the skills section.
              </span>
            )}
          </MessageBox>
        </aside>
      </div>
    </FormContainer>
  );
};

export default DemoCharacterSheet;
