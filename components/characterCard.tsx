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
    <div className="z-10 h-fit max-h-[100dvh] max-w-fit overflow-y-auto rounded bg-white p-1 pt-6 shadow-md">
      <ControlBar onClose={onClose} onMaximize={onMaximize} />
      <div className="flex flex-col items-center md:flex-row-reverse">
        <div className="ml-2 flex w-full flex-grow content-around items-center justify-evenly align-middle md:w-fit md:flex-col"></div>
        <div className="flex w-full flex-grow ">
          <ImageUploader
            icon={character.icon?.url}
            path={'character'}
            disabled
            setIcon={() => null}
            className={cn('mr-1 size-28', {
              blur:
                state === 'play' &&
                !character.icon?.visibleIn.includes(campaignId),
            })}
          />
          <div className="flex flex-col pr-2">
            <LabeledInput
              name="ID"
              value={
                state === 'play' &&
                !character.name.visibleIn.includes(campaignId)
                  ? '???'
                  : character.name?.text
              }
              disabled
            />
            <FateInput
              fate={character.fate}
              state={state}
              disabled
              campaignId={campaignId}
              setFate={() => null}
            />
          </div>
          <Stress
            stress={character.stress}
            disabled={state === 'view'}
            setStress={() => null}
            tight
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
          tight
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
          tight
        />
      </div>
      <div className="flex flex-col pb-2 md:flex-row">
        <Consequences
          consequences={character.consequences}
          disabled={state === 'play'}
          setConsequences={() => null}
          tight
        />
        <StuntInput
          stunts={[...character.stunts, ...character.extras] || []}
          disabled
          campaignId={campaignId}
          state={state}
          title="Stunts and Extra"
          setStunts={() => null}
          tight
        />
      </div>
      <div className="flex flex-col pb-2 md:flex-row"></div>
    </div>
  );
};

export default CharacterSheet;
