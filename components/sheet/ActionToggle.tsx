import { cn } from '@/lib/helpers';
import {
  AcademicCapIcon,
  ShieldExclamationIcon,
  PencilIcon,
  PhoneIcon,
} from '@heroicons/react/24/solid';

interface ActionToggleProps {
  actions: ('overcome' | 'advantage' | 'attack' | 'defend')[];
  onChange: (
    actions: ('overcome' | 'advantage' | 'attack' | 'defend')[],
  ) => void;
  className?: string;
  disabled?: boolean;
}

const ActionToggle: React.FC<ActionToggleProps> = ({
  actions,
  onChange,
  className,
  disabled,
}) => (
  <>
    {!(actions.indexOf('overcome') !== -1 && disabled) && (
      <AcademicCapIcon
        aria-hidden="true"
        className={cn(
          'h-6 w-6 cursor-pointer text-green-400 hover:text-green-500',
          {
            'text-gray-400 hover:text-gray-500':
              actions.indexOf('overcome') === -1,
          },
          className,
        )}
        onClick={() => {
          if (actions.indexOf('overcome') === -1) {
            onChange([...actions, 'overcome']);
          } else {
            onChange(actions.filter((action) => action !== 'overcome'));
          }
        }}
      />
    )}
    {!(actions.indexOf('advantage') !== -1 && disabled) && (
      <ShieldExclamationIcon
        aria-hidden="true"
        className={cn(
          'h-6 w-6 cursor-pointer text-green-400 hover:text-gray-500',
          {
            'text-gray-300 hover:text-gray-300':
              actions.indexOf('advantage') === -1,
          },
          className,
        )}
        onClick={() => {
          if (actions.indexOf('advantage') === -1) {
            onChange([...actions, 'advantage']);
          } else {
            onChange(actions.filter((action) => action !== 'advantage'));
          }
        }}
      />
    )}
    {!(actions.indexOf('attack') !== -1 && disabled) && (
      <PencilIcon
        aria-hidden="true"
        className={cn(
          'h-6 w-6 cursor-pointer text-green-400 hover:text-gray-500',
          {
            'text-gray-300 hover:text-gray-300':
              actions.indexOf('attack') === -1,
          },
          className,
        )}
        onClick={() => {
          if (actions.indexOf('attack') === -1) {
            onChange([...actions, 'attack']);
          } else {
            onChange(actions.filter((action) => action !== 'attack'));
          }
        }}
      />
    )}
    {!(actions.indexOf('defend') !== -1 && disabled) && (
      <PhoneIcon
        aria-hidden="true"
        className={cn(
          'h-6 w-6 cursor-pointer text-green-400 hover:text-gray-500',
          {
            'text-gray-300 hover:text-gray-300':
              actions.indexOf('defend') === -1,
          },
          className,
        )}
        onClick={() => {
          if (actions.indexOf('defend') === -1) {
            onChange([...actions, 'defend']);
          } else {
            onChange(actions.filter((action) => action !== 'defend'));
          }
        }}
      />
    )}
  </>
);

export default ActionToggle;
