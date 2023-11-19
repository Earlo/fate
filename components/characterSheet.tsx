import LabeledInput from './generic/labeledInput';
import ImageUploader from './generic/imageUploader';
import AspectInput from './sheet/aspectInput';
import StuntInput from './sheet/stuntInput';
import SkillGrid from './sheet/skillGrid';
import VisibilityToggle from './sheet/visibilityToggle';
import Stress from './sheet/stress';
import Consequences from './sheet/consequences';
import { CharacterSheetT } from '@/schemas/sheet';
import { cn } from '@/lib/helpers';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useCompletion } from 'ai/react';
interface CharacterSheetProps {
  character: Partial<CharacterSheetT>;
  setCharacter?: React.Dispatch<React.SetStateAction<Partial<CharacterSheetT>>>;
  campaignId?: string;
  skills: string[];
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
}

type editableFields = Omit<
  CharacterSheetT,
  'controlledBy' | '_id' | 'public' | 'visibleTo'
>;
const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  setCharacter,
  skills,
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
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/writeSheet',
  });
  const callOpenAi = async (field: string) => {
    if (!field) {
      console.error('No field provided');
      return;
    }
    const body = JSON.stringify({
      sheet: character,
      userContent: `Complete field "${field}" for the sheet. The response should be just text to complete the sheet`,
    });
    const reponse = await complete(body);
    if (reponse) {
      updateField(field as keyof editableFields, {
        text: reponse,
      });
    } else {
      updateField(field as keyof editableFields, {
        text: 'Something went wrong',
      });
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
            })
          }
          disabled={!setCharacter}
          className={cn('pb-2', {
            blur:
              state === 'view' &&
              !character?.icon?.visibleIn?.includes(campaignId),
          })}
        />
        {state === 'toggle' && (
          <VisibilityToggle
            visible={character?.icon?.visibleIn?.includes(campaignId) || false}
            onChange={(visible) =>
              updateField('icon', {
                visibleIn: visible
                  ? [...(character?.icon?.visibleIn || []), campaignId]
                  : character?.icon?.visibleIn?.filter(
                      (id) => id !== campaignId,
                    ),
              })
            }
            className="pr-2"
          />
        )}
        <div className="flex w-full flex-grow flex-col md:ml-4">
          <LabeledInput
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
                className="pr-2"
              />
            )}
          </LabeledInput>
          <LabeledInput
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
                : isLoading
                  ? completion
                  : character?.description?.text
            }
            disabled={isLoading || !setCharacter}
            required
          >
            {(state === 'create' || state === 'edit') && (
              <SparklesIcon
                className="mr-2 h-6 w-6 cursor-pointer text-white duration-200 hover:text-gray-400"
                onClick={async () => callOpenAi('description')}
              />
            )}
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
                className="pr-2"
              />
            )}
          </LabeledInput>
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
          className="md:pr-4"
        />
        <SkillGrid
          skills={character?.skills || {}}
          skillsList={skills}
          setSkills={(skills) => updateField('skills', skills)}
          disabled={!setCharacter}
          campaignId={campaignId}
          state={state}
          setStress={(stress) => updateField('stress', stress)}
          stress={character.stress}
          setConsequences={(consequences) =>
            updateField('consequences', consequences)
          }
          consequences={character.consequences}
        />
      </div>
      <div className="flex flex-col pb-2 md:flex-row">
        <StuntInput
          stunts={character?.extras || []}
          setStunts={(extras) =>
            setCharacter
              ? setCharacter((prev) => ({ ...prev, extras: extras }))
              : null
          }
          disabled={!setCharacter}
          campaignId={campaignId}
          state={state}
          title="Extra"
          className="md:pr-4"
        />
        <StuntInput
          stunts={character?.stunts || []}
          setStunts={(stunts) =>
            setCharacter
              ? setCharacter((prev) => ({ ...prev, stunts: stunts }))
              : null
          }
          disabled={!setCharacter}
          campaignId={campaignId}
          state={state}
        />
      </div>
      <div className="flex flex-col pb-2 md:flex-row">
        <Stress
          stress={character.stress}
          disabled={state === 'view'}
          setStress={(stress) => updateField('stress', stress)}
        />
        <Consequences
          consequences={character.consequences}
          disabled={state === 'view'}
          setConsequences={(consequences) =>
            updateField('consequences', consequences)
          }
        />
      </div>
    </>
  );
};

export default CharacterSheet;
