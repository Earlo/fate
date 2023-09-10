import Input from './generic/input';
import ImageUploader from './generic/imageUploader';
import AspectInput from './sheet/aspectInput';
import StuntInput from './sheet/stuntInput';
import SkillGrid from './sheet/skillGrid';
import VisibilityToggle from './sheet/visibilityToggle';
import { CharacterSheetT } from '@/schemas/sheet';

interface CharacterSheetProps {
  character: Partial<CharacterSheetT>;
  setCharacter?: React.Dispatch<React.SetStateAction<Partial<CharacterSheetT>>>;
  campaignId?: string;
  state?: 'create' | 'edit' | 'toggle' | 'view';
}

type editableFields = Omit<CharacterSheetT, 'controlledBy' | '_id'>;
const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  setCharacter,
  campaignId = '',
  state = 'view',
}) => {
  const updateField = (
    field: keyof editableFields,
    value: editableFields[keyof editableFields],
  ) => {
    const newValue = { ...character[field], ...value };
    if (setCharacter) {
      setCharacter((prev) => ({ ...prev, [field]: newValue }));
    }
  };

  console.log(character.aspects);
  return (
    <>
      <div className="flex flex-col items-center md:flex-row">
        <ImageUploader
          icon={character?.icon?.url}
          path={'character'}
          setIcon={(icon) =>
            updateField('icon', {
              url: icon,
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
            {state === 'toggle' && (
              <VisibilityToggle
                visible={
                  character?.name?.visibleIn?.includes(campaignId) || false
                }
                onChange={(visible) =>
                  updateField('name', {
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
            {state === 'toggle' && (
              <VisibilityToggle
                visible={
                  character?.description?.visibleIn?.includes(campaignId) ||
                  false
                }
                onChange={(visible) =>
                  updateField('description', {
                    visibleIn: visible
                      ? [
                          ...(character?.description?.visibleIn || []),
                          campaignId,
                        ]
                      : character?.description?.visibleIn?.filter(
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
          setAspects={(aspects) =>
            setCharacter
              ? setCharacter((prev) => ({ ...prev, aspects: aspects }))
              : null
          }
          disabled={!setCharacter}
          campaignId={campaignId}
          state={state}
        />
        <SkillGrid
          skills={character?.skills || {}}
          setSkills={(skills) => updateField('skills', skills)}
          disabled={!setCharacter}
        />
      </div>
      <StuntInput
        stunts={character?.stunts || []}
        setStunts={(stunts) =>
          setCharacter
            ? setCharacter((prev) => ({ ...prev, stunts: stunts }))
            : null
        }
        disabled={!setCharacter}
      />
    </>
  );
};

export default CharacterSheet;
