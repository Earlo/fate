import SkillInput from './skillInput';
import VisibilityToggle from './visibilityToggle';
import Label from '../generic/label';
import SoloInput from '../generic/soloInput';
import { Skill } from '@/types/fate';
import { CharacterSheetT } from '@/schemas/sheet';
import { cn } from '@/lib/helpers';
import { useState, useCallback, useEffect } from 'react';
/*
export const tiers = [
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
];
*/
export const tiers = [
  { level: 5, label: 'Superb' },
  { level: 4, label: 'Great' },
  { level: 3, label: 'Good' },
  { level: 2, label: 'Fair' },
  { level: 1, label: 'Average' },
];

interface SkillGridProps {
  skills: { [level: number]: { name: Skill; visibleIn: string[] }[] };
  setSkills: (skills: {
    [level: number]: { name: Skill; visibleIn: string[] }[];
  }) => void;
  disabled?: boolean;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  setStress: (value: CharacterSheetT['stress']) => void;
  stress?: CharacterSheetT['stress'];
  setConsequences: (value: CharacterSheetT['consequences']) => void;
  consequences?: CharacterSheetT['consequences'];
}

const SkillGrid: React.FC<SkillGridProps> = ({
  skills,
  setSkills,
  disabled,
  state,
  campaignId,
  setStress,
  stress,
  setConsequences,
  consequences,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const updateSelectedSkills = useCallback(() => {
    const selected: Skill[] = [];
    Object.values(skills)
      .flat()
      .forEach((skill) => {
        if (skill.name) {
          selected.push(skill.name);
        }
      });
    setSelectedSkills(selected.sort((a, b) => (a > b ? 1 : -1)));
  }, [skills]);

  useEffect(() => {
    updateSelectedSkills();
  }, [updateSelectedSkills]);

  const handleSkillChange = (
    level: number,
    slotIndex: number,
    name: Skill | '',
    visibleIn: string[],
  ) => {
    const updatedSkills = { ...skills };
    Object.values(updatedSkills).forEach((skillSlots, lvl) => {
      updatedSkills[lvl] = updatedSkills[lvl]
        ? updatedSkills[lvl].filter((skillSlot, i) => {
            return !(skillSlot.name === name);
          })
        : [];
    });
    updatedSkills[level] = updatedSkills[level] || [];
    const replacedSkill = updatedSkills[level][slotIndex];
    if (name === '') {
      updatedSkills[level] = updatedSkills[level].filter(
        (_, i) => i !== slotIndex,
      );
    } else {
      updatedSkills[level][slotIndex] = { name, visibleIn };
    }
    if (replacedSkill?.name === 'Physique' || replacedSkill?.name === 'Will') {
      const boxCount = 2;
      const boxes = Array.from({ length: boxCount }).map(() => false);
      setStress({
        ...stress,
        [replacedSkill?.name === 'Physique' ? 'physical' : 'mental']: {
          boxes,
          visibleIn: [],
        },
      });
      setConsequences({
        mild: consequences?.mild || { name: '', visibleIn: [] },
        moderate: consequences?.moderate || { name: '', visibleIn: [] },
        severe: consequences?.severe || { name: '', visibleIn: [] },
        physical:
          replacedSkill?.name === 'Physique'
            ? undefined
            : consequences?.physical,
        mental:
          replacedSkill?.name === 'Will' ? undefined : consequences?.mental,
      });
    }
    if (name === 'Physique') {
      const boxCount = level >= 3 ? 4 : level >= 1 ? 3 : 2;
      const boxes = Array.from({ length: boxCount }).map(() => false);
      setStress({ ...stress, physical: { boxes, visibleIn: visibleIn } });
      if (level >= 5 && !consequences?.physical) {
        setConsequences({
          mild: consequences?.mild || { name: '', visibleIn: [] },
          moderate: consequences?.moderate || { name: '', visibleIn: [] },
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
          moderate: consequences?.moderate || { name: '', visibleIn: [] },
          severe: consequences?.severe || { name: '', visibleIn: [] },
          physical: consequences?.physical,
          mental: { name: '', visibleIn: visibleIn },
        });
      }
    }
    setSkills(updatedSkills);
    updateSelectedSkills();
  };

  if (state === 'toggle' && !campaignId) {
    return null;
  }
  return (
    <div className="w-full overflow-x-hidden sm:max-w-fit md:w-fit lg:w-9/12">
      <Label name="Skills" />
      {tiers.map((tier, index) => (
        <div
          key={index}
          className={cn('mb-2 flex w-full flex-col lg:flex-row', {
            'hidden sm:flex':
              !skills[tier.level] || skills[tier.level].length === 0,
          })}
        >
          <span className="flex h-10 w-full flex-shrink-0 items-center whitespace-nowrap text-lg font-black uppercase text-black lg:w-1/5  ">
            {`${tier.label} +${tier.level}`}
          </span>
          <div className="flex flex-grow flex-col overflow-x-hidden sm:flex-row">
            {Array.from({ length: 5 }).map((_, slotIndex) => {
              const name = (skills[tier.level] || [])[slotIndex]?.name || '';
              const visibleIn =
                (skills[tier.level] || [])[slotIndex]?.visibleIn || [];
              const isVisible = visibleIn.includes(campaignId || '');
              return state == 'toggle' && campaignId ? (
                <div className="relative">
                  <SoloInput
                    key={tier.label + slotIndex}
                    name={`skill-${tier.label}-${index}`}
                    placeholder="???"
                    value={name}
                    disabled={true}
                    className={cn(
                      'rounded-none',
                      { 'rounded-bl': slotIndex === 0 },
                      { 'rounded-l': slotIndex === 0 && index !== 0 },
                      { 'rounded-r': slotIndex === 4 },
                    )}
                  />
                  <div className="absolute right-0 top-0 m-2">
                    <VisibilityToggle
                      visible={isVisible}
                      onChange={(visible) =>
                        handleSkillChange(
                          tier.level,
                          slotIndex,
                          name,
                          visible
                            ? [...visibleIn, campaignId]
                            : visibleIn.filter((id) => id !== campaignId),
                        )
                      }
                    />
                  </div>
                </div>
              ) : (
                <SkillInput
                  key={tier.label + slotIndex}
                  level={tier.level}
                  value={
                    state === 'view' || state === 'play'
                      ? isVisible
                        ? name
                        : ''
                      : name
                  }
                  disabled={
                    disabled ||
                    (slotIndex !== 0 &&
                      !(skills[tier.level] || [])[slotIndex - 1] &&
                      !(skills[tier.level] || [])[slotIndex])
                  }
                  onChange={(name) =>
                    handleSkillChange(tier.level, slotIndex, name, visibleIn)
                  }
                  className={cn(
                    'rounded-none',
                    { 'rounded-bl': slotIndex === 0 },
                    { 'rounded-l': slotIndex === 0 && index !== 0 },
                    { 'rounded-r': slotIndex === 4 },
                  )}
                  selectedSkills={selectedSkills}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillGrid;
