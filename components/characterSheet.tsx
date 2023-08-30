import Input from './generic/input';
import ImageUploader from './generic/imageUploader';
import AspectInput from './sheet/aspectInput';
import StuntInput from './sheet/stuntInput';
import SkillGrid from './sheet/skillGrid';
import VisibilityToggle from './sheet/visibilityToggle';
import { CharacterSheetT } from '@/schemas/sheet';

interface CharacterSheetProps {
  character?: Partial<CharacterSheetT>;
  setCharacter?: React.Dispatch<React.SetStateAction<Partial<CharacterSheetT>>>;
  campaignId?: string;
  state?: 'create' | 'edit' | 'toggle' | 'view';
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  setCharacter,
  campaignId,
  state = 'view',
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof CharacterSheetT, value: any) => {
    console.log('updateField', field, value, !!setCharacter);
    if (setCharacter) {
      setCharacter((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <>
      <div className="flex flex-col items-center md:flex-row">
        <ImageUploader
          icon={character?.icon?.url}
          path={'character'}
          setIcon={(icon) =>
            updateField('icon', {
              url: icon,
              visibleIn: character?.icon?.visibleIn || [],
            })
          }
          disabled={!setCharacter}
        />
        <div className="ml-0 flex flex-grow flex-col md:ml-4">
          <Input
            name="Name"
            onChange={(e) =>
              updateField('name', {
                text: e.target.value,
                visibleIn: character?.name?.visibleIn || [],
              })
            }
            value={
              state === 'view' &&
              !character?.name?.visibleIn?.includes(campaignId)
                ? '???'
                : character?.name?.text
            }
            disabled={!setCharacter}
            required
          >
            {state === 'toggle' && campaignId && (
              <VisibilityToggle
                visible={
                  character?.name?.visibleIn?.includes(campaignId) || false
                }
                onChange={(visible) =>
                  updateField('name', {
                    text: character?.name?.text,
                    visibleIn: visible
                      ? [...(character?.name?.visibleIn || []), campaignId]
                      : character?.name?.visibleIn?.filter(
                          (id) => id !== campaignId,
                        ),
                  })
                }
              />
            )}
          </Input>
          <Input
            name="Description"
            multiline
            onChange={(e) =>
              updateField('description', {
                text: e.target.value,
                visibleIn: character?.description?.visibleIn || [],
              })
            }
            value={
              state === 'view' &&
              !character?.description?.visibleIn?.includes(campaignId)
                ? '???'
                : character?.description?.text
            }
            disabled={!setCharacter}
            required
          >
            {state === 'toggle' && campaignId && (
              <VisibilityToggle
                visible={
                  character?.description?.visibleIn?.includes(campaignId) ||
                  false
                }
                onChange={(visible) =>
                  updateField('description', {
                    text: character?.description?.text,
                    visibleIn: visible
                      ? [...(character?.name?.visibleIn || []), campaignId]
                      : character?.name?.visibleIn?.filter(
                          (id) => id !== campaignId,
                        ),
                  })
                }
              />
            )}
          </Input>
        </div>
      </div>
      <div className="flex flex-col justify-between md:flex-row">
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
