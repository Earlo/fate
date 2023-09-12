import SkillInput from './skillInput';
import VisibilityToggle from './visibilityToggle';
import Label from '../generic/label';
import SoloInput from '../generic/soloInput';
import { Skill } from '@/types/fate';

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
}

const SkillGrid: React.FC<SkillGridProps> = ({
  skills,
  setSkills,
  disabled,
  state,
  campaignId,
}) => {
  const handleSkillChange = (
    level: number,
    slotIndex: number,
    name: Skill | '',
    visibleIn: string[],
  ) => {
    const updatedSkills = { ...skills };
    updatedSkills[level] = updatedSkills[level] || [];
    if (name === '') {
      updatedSkills[level].splice(slotIndex, 1); // Remove the element
      if (updatedSkills[level].length === 0) {
        delete updatedSkills[level]; // Remove the entire row if it's empty
      }
    } else {
      updatedSkills[level][slotIndex] = { name, visibleIn: visibleIn };
    }
    setSkills(updatedSkills);
  };
  if (state === 'toggle' && !campaignId) {
    return null;
  }
  return (
    <div className="w-full overflow-x-hidden sm:max-w-fit md:w-fit lg:w-9/12">
      <Label name="Skills" />
      {tiers.map((tier, index) => (
        <div key={index} className="mb-2 flex w-full flex-col lg:flex-row">
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
                <SoloInput
                  key={tier.label + slotIndex}
                  name={`skill-${tier.label}-${index}`}
                  placeholder="???"
                  value={name}
                  disabled={true}
                  className="h-10 w-full text-base sm:w-32"
                >
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
                </SoloInput>
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
