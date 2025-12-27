import { cn } from '@/lib/utils';
import { CharacterSheetT } from '@/schemas/sheet';
import ImageUploader from './generic/imageUploader';
import LabeledInput from './generic/labeledInput';
import AspectInput from './sheet/aspectInput';
import Consequences from './sheet/consequences';
import ControlBar from './sheet/controlBar';
import FateInput from './sheet/fateInput';
import SkillGrid from './sheet/skillGrid';
import Stress from './sheet/stress';
import StuntInput from './sheet/stuntInput';
interface CharacterSheetProps {
  character: CharacterSheetT;
  setCharacter?: React.Dispatch<React.SetStateAction<CharacterSheetT>>;
  campaignId?: string;
  state?: 'view' | 'play';
  onClose?: () => void;
  onMaximize?: () => void;
  dragListeners?: React.HTMLAttributes<HTMLElement>;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  setCharacter,
  campaignId = '',
  state = 'view',
  onClose,
  onMaximize,
  dragListeners,
}) => {
  return (
    <div className="relative z-10 h-fit max-h-dvh max-w-fit overflow-y-auto rounded bg-stone-100 p-1 pt-6 shadow-md">
      <ControlBar
        onClose={onClose}
        onMaximize={onMaximize}
        dragListeners={dragListeners}
      />
      <div className="flex flex-col items-center md:flex-row-reverse">
        <div className="flex w-full grow">
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
          stunts={[...character.stunts, ...character.extras]}
          disabled
          campaignId={campaignId}
          state={state}
          title="Stunts and Extra"
          setStunts={() => null}
          tight
        />
      </div>
    </div>
  );
};

export default CharacterSheet;
