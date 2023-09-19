import { cn } from '@/lib/helpers';
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
      <span
        aria-hidden="true"
        className={cn(
          'font-fate cursor-pointer text-green-400 hover:text-green-500',
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
      >
        O
      </span>
    )}
    {!(actions.indexOf('advantage') !== -1 && disabled) && (
      <span
        aria-hidden="true"
        className={cn(
          'font-fate cursor-pointer text-green-400 hover:text-green-500',
          {
            'text-gray-400 hover:text-gray-500':
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
      >
        C
      </span>
    )}
    {!(actions.indexOf('attack') !== -1 && disabled) && (
      <span
        aria-hidden="true"
        className={cn(
          'font-fate cursor-pointer text-green-400 hover:text-green-500',
          {
            'text-gray-400 hover:text-gray-500':
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
      >
        A
      </span>
    )}
    {!(actions.indexOf('defend') !== -1 && disabled) && (
      <span
        aria-hidden="true"
        className={cn(
          'font-fate cursor-pointer text-green-400 hover:text-green-500',
          {
            'text-gray-400 hover:text-gray-500':
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
      >
        D
      </span>
    )}
  </>
);

export default ActionToggle;
