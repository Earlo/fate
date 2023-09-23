import SkillInput from './skillInput';
import VisibilityToggle from './visibilityToggle';
import Label from '../generic/label';
import Input from '../generic/input';
import { CharacterSheetT } from '@/schemas/sheet';
import { cn } from '@/lib/helpers';
import AddButton from '@/components/generic/addButton';
import { useState, useCallback, useEffect } from 'react';

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
  skillsList,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [maxDisplayedTier, setMaxDisplayedTier] = useState(5);
  const [minDisplayedTier, setMinDisplayerTier] = useState(0);

  const updateSelectedSkills = useCallback(() => {
    const selected: string[] = [];
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
    <div className="w-full min-w-[66.666667%] md:w-fit lg:w-8/12">
      <Label name="Skills">
        {!disabled && (
          <AddButton
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
            tier.level <= maxDisplayedTier && tier.level > minDisplayedTier,
        )
        .map((tier, index) => (
          <div
            key={index}
            className={cn(
              'relative flex w-full flex-col pb-2 lg:top-[-2px] lg:flex-row',
              {
                'hidden sm:flex':
                  (!skills[tier.level] || skills[tier.level].length === 0) &&
                  state === 'view',
              },
            )}
          >
            <span
              className={cn(
                'flex h-10 w-full flex-shrink-0 items-center whitespace-nowrap text-lg font-black uppercase text-black lg:w-1/6',
                { 'lg:w-fit': tier.level > 5 || tier.level < -5 }, //You aren't meant to go here. You can, but it won't look good.
              )}
            >
              {`${tier.label} ${tier.level > 0 ? '+' : ''}${tier.level}`}
            </span>
            <div className="flex flex-grow flex-col last:rounded-b sm:flex-row">
              {Array.from({ length: 5 }).map((_, slotIndex) => {
                const name = (skills[tier.level] || [])[slotIndex]?.name || '';
                const nextName =
                  (skills[tier.level] || [])[slotIndex + 1]?.name || '';
                const visibleIn =
                  (skills[tier.level] || [])[slotIndex]?.visibleIn || [];
                const isVisible = visibleIn.includes(campaignId || '');
                return state == 'toggle' && campaignId ? (
                  <div className="relative">
                    <Input
                      key={tier.label + slotIndex}
                      name={`skill-${tier.label}-${index}`}
                      placeholder="???"
                      value={name}
                      disabled={true}
                      className={cn(
                        'top-[0px] rounded-none border-t-0 sm:border-l-0 sm:border-t-2',
                        {
                          'rounded-t border-t-2 sm:rounded-bl sm:rounded-tr-none sm:border-l-2':
                            slotIndex === 0,
                        },
                        {
                          'lg:rounded-tl-none': slotIndex === 0 && index === 0,
                        },
                        {
                          'rounded-b sm:rounded-b-none sm:rounded-br sm:rounded-tr':
                            slotIndex === 4,
                        },
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
                    skillOptions={skillsList}
                    key={tier.label + slotIndex}
                    level={tier.level}
                    value={state === 'view' && !isVisible ? '' : name}
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
                      'rounded-none border-t-0 sm:border-l-0 sm:border-t-2',
                      {
                        'rounded-b sm:rounded-b-none':
                          nextName === '' && disabled,
                      },
                      {
                        'rounded-t border-t-2 sm:rounded-bl sm:rounded-tr-none sm:border-l-2':
                          slotIndex === 0,
                      },
                      { 'lg:rounded-tl-none': slotIndex === 0 && index === 0 },
                      { 'sm:rounded-br sm:rounded-tr': slotIndex === 4 },
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

/**

cn(
                      'border-2 border-t-0 first:border-t-2 sm:rounded-none sm:border-y-2 sm:border-l-0 ',
                      {
                        'lg:rounded-tl-0 sm:rounded-bl sm:rounded-tl sm:border-l-2':
                          slotIndex === 0,
                      },
                      { 'sm:rounded-l': slotIndex === 0 && index !== 0 },
                      { 'sm:rounded-r sm:border-r-2': slotIndex === 4 },
                    )

 */
