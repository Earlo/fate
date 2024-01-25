import { cn } from '@/lib/helpers';
interface ActionButtonProps {
  action: 'overcome' | 'advantage' | 'attack' | 'defend';
  onClick: () => void;
  className?: string;
  toggled?: boolean;
  disabled: boolean;
}
const actions = {
  overcome: 'O',
  advantage: 'C',
  attack: 'A',
  defend: 'D',
};

const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  onClick,
  className,
  toggled,
  disabled,
}) => (
  <span
    aria-hidden="true"
    className={cn(
      'font-fate text-2xl text-green-400 hover:text-green-500',
      {
        'text-gray-400 hover:text-gray-500': !toggled,
      },
      {
        'cursor-pointer': !disabled,
      },
      className,
    )}
    onClick={onClick}
  >
    {actions[action]}
  </span>
);

export default ActionButton;
