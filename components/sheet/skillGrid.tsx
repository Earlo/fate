import SkillInput from './skillInput';
import Label from '../generic/label';
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
  setSkills: React.Dispatch<
    React.SetStateAction<{
      [level: number]: { name: Skill; visibleIn: string[] }[];
    }>
  >;
  disabled?: boolean;
}

const SkillGrid: React.FC<SkillGridProps> = ({
  skills,
  setSkills,
  disabled,
}) => {
  const handleSkillChange = (level: number, slotIndex: number, name: Skill) => {
    const updatedSkills = { ...skills };
    updatedSkills[level] = updatedSkills[level] || [];
    updatedSkills[level][slotIndex] = { name, visibleIn: [] };
    setSkills(updatedSkills);
  };

  return (
    <div className="w-4/6">
      <Label name="Skills" />
      <table>
        <tbody>
          {tiers.map((tier, index) => (
            <tr key={index}>
              <td className="block font-black uppercase text-black p-1 mt-1 text-xl whitespace-nowrap">
                {`${tier.label} +${tier.level}`}
              </td>
              {Array.from({ length: 5 }).map((_, slotIndex) => (
                <td key={slotIndex}>
                  <SkillInput
                    level={tier.level}
                    value={(skills[tier.level] || [])[slotIndex]?.name || ''}
                    disabled={
                      disabled ||
                      (slotIndex !== 0 &&
                        !(skills[tier.level] || [])[slotIndex - 1] &&
                        !(skills[tier.level] || [])[slotIndex])
                    }
                    onChange={(name) =>
                      handleSkillChange(tier.level, slotIndex, name)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillGrid;
