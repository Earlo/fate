import { cn } from '@/lib/utils';
import Input from '../generic/input';
import Label from '../generic/label';
import VisibilityToggle from './visibilityToggle';
interface FateInputProps {
  fate: { points: number; refresh: number; visibleIn: string[] };
  setFate: (aspects: {
    points: number;
    refresh: number;
    visibleIn: string[];
  }) => void;
  disabled?: boolean;
  state?: 'create' | 'edit' | 'toggle' | 'view' | 'play';
  campaignId?: string;
  className?: string;
}

const FateInput: React.FC<FateInputProps> = ({
  fate,
  setFate,
  state,
  disabled,
  campaignId,
  className,
}) => {
  const handleAspectChange = (value: {
    points: number;
    refresh: number;
    visibleIn: string[];
  }) => {
    setFate(value);
  };
  const showVisibility = state === 'toggle' && campaignId;
  return (
    <div
      className={cn('flex h-full flex-col items-stretch self-start', className)}
    >
      <Label name="Fate" className="w-32">
        {showVisibility && (
          <VisibilityToggle
            visible={fate.visibleIn.includes(campaignId)}
            onChange={(visible) =>
              handleAspectChange({
                points: fate.points,
                refresh: fate.refresh,
                visibleIn: visible
                  ? [...fate.visibleIn, campaignId]
                  : fate.visibleIn.filter((id) => id !== campaignId),
              })
            }
            className="mr-2 self-baseline"
          />
        )}
      </Label>
      <div className="flex grow justify-end pb-2">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-30 flex pl-1 text-xs">
            <span className="text-gray-500 select-none">Points</span>
          </div>
          <Input
            name="fate-points"
            value={fate.points.toString()}
            onChange={(e) =>
              handleAspectChange({
                points: parseInt(e.target.value),
                refresh: fate.refresh,
                visibleIn: fate.visibleIn,
              })
            }
            disabled={disabled}
            required
            className="font-archivo-black h-10 w-16 justify-center rounded-none rounded-bl pt-4 text-center text-xl"
          />
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-30 flex pl-1 text-xs">
            <span className="text-gray-500 select-none">Refresh</span>
          </div>
          <Input
            name="fate-refresh"
            value={fate.refresh.toString()}
            onChange={(e) =>
              handleAspectChange({
                points: fate.points,
                refresh: parseInt(e.target.value),
                visibleIn: fate.visibleIn,
              })
            }
            disabled={disabled}
            required
            className="font-archivo-black h-10 w-16 justify-center rounded-none rounded-r border-l-0 pt-4 text-center text-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default FateInput;
