import Input from './generic/input';
import ImageUploader from './generic/imageUploader';
import AspectInput from './sheet/aspectInput';
import StuntInput from './sheet/stuntInput';
import SkillGrid from './sheet/skillGrid';
import { CharacterSheetT } from '@/schemas/sheet';

interface CharacterSheetProps {
  character?: Partial<CharacterSheetT>;
  setCharacter?: React.Dispatch<React.SetStateAction<Partial<CharacterSheetT>>>;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  setCharacter,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof CharacterSheetT, value: any) => {
    if (setCharacter) {
      setCharacter((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <>
      <div className="flex items-center">
        <ImageUploader
          icon={character?.icon?.url}
          path={'character'}
          setIcon={(icon) => updateField('icon', { url: icon, visibleIn: [] })}
          disabled={!setCharacter}
        />
        <div className="ml-4 flex flex-grow flex-col">
          <Input
            name="Name"
            onChange={(e) =>
              updateField('name', { text: e.target.value, visibleIn: [] })
            }
            value={character?.name?.text}
            disabled={!setCharacter}
            required
          />
          <Input
            name="Description"
            multiline
            onChange={(e) =>
              updateField('description', {
                text: e.target.value,
                visibleIn: [],
              })
            }
            value={character?.description?.text}
            disabled={!setCharacter}
            required
          />
        </div>
      </div>
      <div className="flex justify-between">
        <AspectInput
          aspects={character?.aspects || []}
          setAspects={(aspects) => updateField('aspects', aspects)}
          disabled={!setCharacter}
        />
        <SkillGrid
          skills={character?.skills || {}}
          setSkills={(skills) => updateField('skills', skills)}
          disabled={!setCharacter}
        />
      </div>
      <StuntInput
        stunts={character?.stunts || []}
        setStunts={(stunts) => updateField('stunts', stunts)}
        disabled={!setCharacter}
      />
    </>
  );
};

export default CharacterSheet;
