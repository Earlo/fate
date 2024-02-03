import LabeledInput from './generic/labeledInput';
import ImageUploader from './generic/imageUploader';
import AspectInput from './sheet/aspectInput';
import StuntInput from './sheet/stuntInput';
import SkillGrid from './sheet/skillGrid';
import Stress from './sheet/stress';
import Consequences from './sheet/consequences';
import FateInput from './sheet/fateInput';
import ControlBar from './sheet/controlBar';
import { CharacterSheetT } from '@/schemas/sheet';
import { cn } from '@/lib/helpers';
interface CharacterSheetProps {
  character: CharacterSheetT;
  setCharacter?: React.Dispatch<React.SetStateAction<CharacterSheetT>>;
  campaignId?: string;
  state?: 'view' | 'play';
  onClose?: () => void;
  onMaximize?: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  setCharacter,
  campaignId = '',
  state = 'view',
  onClose,
  onMaximize,
}) => {
  return (
    <>
      <ControlBar onClose={onClose} onMaximize={onMaximize} />

      <div className="flex flex-col items-center md:flex-row-reverse">
        <div className="ml-2 flex w-full flex-grow content-around items-center justify-evenly align-middle md:w-fit md:flex-col">
          <ImageUploader
            icon={character.icon?.url}
            path={'character'}
            disabled
            setIcon={() => null}
            className={cn('pb-1', {
              blur:
                state === 'view' &&
                !character.icon?.visibleIn?.includes(campaignId),
            })}
          />
          <FateInput
            fate={character.fate}
            state={state}
            disabled
            campaignId={campaignId}
            className="self-center"
            setFate={() => null}
          />
        </div>
        <div className="flex w-full flex-grow flex-col ">
          <LabeledInput
            name="Name"
            value={
              state === 'view' &&
              !character.name?.visibleIn?.includes(campaignId)
                ? '???'
                : character.name?.text
            }
            disabled
          />
          <LabeledInput
            name="Description"
            multiline
            value={
              state === 'view' &&
              !character.description?.visibleIn?.includes(campaignId)
                ? '???'
                : character.description?.text
            }
            disabled
          />
        </div>
      </div>
      <div className="flex flex-col justify-between md:flex-row">
        <AspectInput
          aspects={character.aspects || []}
          setAspects={(aspects) =>
            setCharacter
              ? setCharacter((prev) => ({ ...prev, aspects: aspects }))
              : null
          }
          disabled
          campaignId={campaignId}
          state={state}
          className="md:pr-4"
        />
        <SkillGrid
          skills={character.skills || {}}
          disabled
          campaignId={campaignId}
          state={state}
          stress={character.stress}
          consequences={character.consequences}
          setSkills={(skills) => null}
          setStress={(stress) => null}
          setConsequences={(consequences) => null}
          skillsList={[]}
        />
      </div>
      <div className="flex flex-col pb-2 md:flex-row">
        <StuntInput
          stunts={character.extras || []}
          disabled
          campaignId={campaignId}
          state={state}
          title="Extra"
          className="md:pr-4"
          setStunts={() => null}
        />
        <StuntInput
          stunts={character.stunts || []}
          disabled
          campaignId={campaignId}
          state={state}
          setStunts={() => null}
        />
      </div>
      <div className="flex flex-col pb-2 md:flex-row">
        <Stress
          stress={character.stress}
          disabled={state === 'view'}
          setStress={() => null}
        />
        <Consequences
          consequences={character.consequences}
          disabled={state === 'view'}
          setConsequences={() => null}
        />
      </div>
    </>
  );
};

export default CharacterSheet;
