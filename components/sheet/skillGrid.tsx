'use client';
import Icon from '@/components/generic/icon/icon';
import { cn } from '@/lib/utils';
import { CharacterSheetT } from '@/schemas/sheet';
import { FC, useMemo, useState } from 'react';
import Label from '../generic/label';
import SkillInput from './skillInput';
import VisibilityToggle from './visibilityToggle';

export const tiers = [
  { level: 18, label: 'Transcendent' },
  { level: 17, label: 'Mythic' },
  { level: 16, label: 'Godlike' },
  { level: 15, label: 'Immortal' },
  { level: 14, label: 'Masterful' },
  { level: 13, label: 'Illustrious' },
  { level: 12, label: 'Exalted' },
  { level: 11, label: 'Heroic' },
  { level: 10, label: 'Formidable' },
  { level: 9, label: 'Powerful' },
  { level: 8, label: 'Legendary' },
  { level: 7, label: 'Epic' },
  { level: 6, label: 'Fantastic' },
  { level: 5, label: 'Superb' },
  { level: 4, label: 'Great' },
  { level: 3, label: 'Good' },
  { level: 2, label: 'Fair' },
  { level: 1, label: 'Average' },
  { level: 0, label: 'Mediocre' },
  { level: -1, label: 'Poor' },
  { level: -2, label: 'Terrible' },
  { level: -3, label: 'Abysmal' },
  { level: -4, label: 'Dreadful' },
  { level: -5, label: 'Horrible' },
  { level: -6, label: 'Traumatic' },
  { level: -7, label: 'Catastrophic' },
  { level: -8, label: 'Apocalyptic' },
  { level: -9, label: 'Nightmarish' },
  { level: -10, label: 'Unthinkable' },
];

interface SkillGridProps {
  skills: { [level: number]: { name: string; visibleIn: string[] }[] };
  setSkills: (skills: {
    [level: number]: { name: string; visibleIn: string[] }[];
  }) => void;
  disabled?: boolean;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  setStress: (value: CharacterSheetT['stress']) => void;
  stress?: CharacterSheetT['stress'];
  setConsequences: (value: CharacterSheetT['consequences']) => void;
  consequences?: CharacterSheetT['consequences'];
  skillsList: string[];
  tight?: boolean;
}

const SkillGrid: FC<SkillGridProps> = ({
  skills,
  setSkills,
  disabled,
  state,
  campaignId,
  setStress,
  stress,
  setConsequences,
  consequences,
  skillsList,
  tight = false,
}) => {
  const [maxDisplayedTier, setMaxDisplayedTier] = useState(5);
  const [minDisplayedTier, setMinDisplayerTier] = useState(0);

  const selectedSkills = useMemo(() => {
    const selected: string[] = [];
    Object.values(skills)
      .flat()
      .forEach((skill) => {
        if (skill.name) {
          selected.push(skill.name);
        }
      });
    return selected.sort((a, b) => (a > b ? 1 : -1));
  }, [skills]);

  const handleSkillChange = (
    level: number,
    slotIndex: number,
    name: string | '',
    visibleIn: string[],
  ) => {
    const updatedSkills = { ...skills };
    Object.values(updatedSkills).forEach((skillSlots, lvl) => {
      updatedSkills[lvl] = updatedSkills[lvl]
        ? updatedSkills[lvl].filter((skillSlot, i) => {
            return !(
              skillSlot.name === name &&
              lvl !== level &&
              i !== slotIndex
            );
          })
        : [];
    });
    updatedSkills[level] = updatedSkills[level] || [];
    const oldSkill = updatedSkills[level][slotIndex];
    if (name === '') {
      updatedSkills[level] = updatedSkills[level].filter(
        (_, i) => i !== slotIndex,
      );
    } else {
      updatedSkills[level][slotIndex] = { name, visibleIn };
    }
    if (
      oldSkill &&
      (oldSkill.name === 'Physique' || oldSkill.name === 'Will')
    ) {
      const boxCount = 2;
      const boxes = Array.from({ length: boxCount }).map(() => false);
      setStress({
        ...stress,
        [oldSkill.name === 'Physique' ? 'physical' : 'mental']: {
          boxes,
          visibleIn: [],
        },
      });
      setConsequences({
        mild: consequences?.mild || { name: '', visibleIn: [] },
        moderate: consequences?.moderate || { name: '', visibleIn: [] },
        severe: consequences?.severe || { name: '', visibleIn: [] },
        physical:
          oldSkill?.name === 'Physique' ? undefined : consequences?.physical,
        mental: oldSkill?.name === 'Will' ? undefined : consequences?.mental,
      });
    }
    if (name === 'Physique') {
      const boxCount = level >= 3 ? 4 : level >= 1 ? 3 : 2;
      const boxes = Array.from({ length: boxCount }).map(() => false);
      setStress({ ...stress, physical: { boxes, visibleIn: visibleIn } });
      if (level >= 5 && !consequences?.physical) {
        setConsequences({
          mild: consequences?.mild || { name: '', visibleIn: [] },
          moderate: consequences?.moderate || {
            name: '',
            visibleIn: [],
          },
          severe: consequences?.severe || { name: '', visibleIn: [] },
          physical: { name: '', visibleIn: visibleIn },
          mental: consequences?.mental,
        });
      }
    }
    if (name === 'Will') {
      const boxCount = level >= 3 ? 4 : level >= 1 ? 3 : 2;
      const boxes = Array.from({ length: boxCount }).map(() => false);
      setStress({ ...stress, mental: { boxes, visibleIn: visibleIn } });
      if (level >= 5 && !consequences?.mental) {
        setConsequences({
          mild: consequences?.mild || { name: '', visibleIn: [] },
          moderate: consequences?.moderate || {
            name: '',
            visibleIn: [],
          },
          severe: consequences?.severe || { name: '', visibleIn: [] },
          physical: consequences?.physical,
          mental: { name: '', visibleIn: visibleIn },
        });
      }
    }
    setSkills(updatedSkills);
  };

  if (state === 'toggle' && !campaignId) {
    return null;
  }
  return (
    <div className="w-full min-w-[66.666667%] pb-2 md:w-fit lg:w-8/12 lg:pb-0">
      <Label name="Skills">
        {!disabled && (
          <Icon
            icon="plus"
            className="mr-2"
            onClick={() =>
              maxDisplayedTier < 18
                ? setMaxDisplayedTier(maxDisplayedTier + 1)
                : setMinDisplayerTier(minDisplayedTier - 1)
            }
          />
        )}
      </Label>
      {tiers
        .filter(
          (tier) =>
            (tier.level <= maxDisplayedTier && tier.level > minDisplayedTier) ||
            !(!skills[tier.level] || skills[tier.level].length === 0), // could maybe filter based on displayed skills
        )
        .map((tier, index) => (
          <div
            key={index}
            className={cn(
              'relative flex w-full lg:top-[-2px] lg:flex-row',
              {
                'hidden sm:flex':
                  (!skills[tier.level] || skills[tier.level].length === 0) &&
                  state === 'view',
              },
              { 'flex-col lg:pb-2': !tight },
            )}
          >
            <span
              className={cn(
                'flex h-8 shrink-0 items-center font-black whitespace-nowrap text-black uppercase',
                {
                  'lg:w-fit': tier.level > 5 || tier.level < -5,
                },
                { 'w-full lg:w-[7rem]': !tight },
              )}
            >
              {tight
                ? `+${tier.level} `
                : `${tier.label} ${tier.level > 0 ? '+' : ''}${tier.level}`}
            </span>
            <div
              className={cn('flex grow flex-col sm:flex-row lg:pl-[1%]', {
                'lg:max-w-[80%]': !tight,
              })}
            >
              <SkillRow
                skills={skills[tier.level]}
                handleChange={(slotIndex, name, visibleIn) =>
                  handleSkillChange(tier.level, slotIndex, name, visibleIn)
                }
                disabled={disabled}
                state={state}
                campaignId={campaignId}
                selectedSkills={selectedSkills}
                skillsList={skillsList}
                topRow={index === 0}
                tight={tight}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

interface SkillRowProps {
  skills: { name: string; visibleIn: string[] }[];
  handleChange: (slotIndex: number, name: string, visibleIn: string[]) => void;
  disabled?: boolean;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  selectedSkills: string[];
  skillsList: string[];
  topRow?: boolean;
  tight?: boolean;
}

const SkillRow = ({
  skills = [],
  handleChange,
  disabled,
  state,
  campaignId = '',
  selectedSkills,
  skillsList,
  topRow = false,
  tight = false,
}: SkillRowProps) => {
  //return [...skills, [{}, {}, {}, {}, {}]].map((skill, index) => {
  return Array.from({ length: 5 }).map((_, index) => {
    const skill = skills[index];
    const name = skill?.name || '';
    const nextName = skills[index + 1]?.name || '';
    const visibleIn = skill?.visibleIn || [];
    const isVisible = visibleIn.includes(campaignId);
    const firstSlot = index === 0;
    const lastSlot = index === 4;
    return (
      <SkillInput
        skillOptions={skillsList}
        key={index}
        value={state === 'play' && !isVisible ? '' : name}
        disabled={disabled || (!firstSlot && !skills[index - 1] && !skill)}
        onChange={(name) => handleChange(index, name, visibleIn)}
        selectedSkills={selectedSkills}
        topRow={topRow}
        position={firstSlot ? 'first' : lastSlot ? 'last' : 'middle'}
        lastShown={!nextName}
        className={cn({
          'rounded-b-none sm:border-t-0': tight && !topRow,
        })}
      >
        {state === 'toggle' && (
          <VisibilityToggle
            visible={isVisible}
            onChange={(visible) =>
              handleChange(
                index,
                name,
                visible
                  ? [...visibleIn, campaignId]
                  : visibleIn.filter((id) => id !== campaignId),
              )
            }
            className="z-100 m-0 p-0"
          />
        )}
      </SkillInput>
    );
  });
};

export default SkillGrid;
