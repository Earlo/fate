import Input from './generic/input';
import ImageUploader from './generic/imageUploader';
import AspectInput from './sheet/aspectInput';
import StuntInput from './sheet/stuntInput';
import SkillGrid from './sheet/skillGrid';
import { CharacterSheetT } from '@/schemas/sheet';

interface CharacterSheetProps {
  charachter?: Partial<CharacterSheetT>;
  setCharachter?: React.Dispatch<
    React.SetStateAction<Partial<CharacterSheetT>>
  >;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  charachter,
  setCharachter,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof CharacterSheetT, value: any) => {
    if (setCharachter) {
      setCharachter((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <>
      <div className="flex items-center">
        <ImageUploader
          icon={charachter?.icon?.url}
          path={'charachter'}
          setIcon={(icon) => updateField('icon', icon)}
          disabled={!setCharachter}
        />
        <div className="flex flex-col ml-4 flex-grow">
          <Input
            name="Name"
            onChange={(e) => updateField('name', e.target.value)}
            value={charachter?.name?.text}
            disabled={!setCharachter}
            required
          />
          <Input
            name="Description"
            multiline
            onChange={(e) => updateField('description', e.target.value)}
            value={charachter?.description?.text}
            disabled={!setCharachter}
            required
          />
        </div>
      </div>
      <div className="flex justify-between">
        <AspectInput
          aspects={charachter?.aspects || []}
          setAspects={(aspects) => updateField('aspects', aspects)}
          disabled={!setCharachter}
        />
        <SkillGrid
          skills={charachter?.skills || {}}
          setSkills={(skills) => updateField('skills', skills)}
          disabled={!setCharachter}
        />
      </div>
      <StuntInput
        stunts={charachter?.stunts || []}
        setStunts={(stunts) => updateField('stunts', stunts)}
        disabled={!setCharachter}
      />
    </>
  );
};

export default CharacterSheet;
