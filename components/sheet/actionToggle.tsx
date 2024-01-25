import ActionButton from './actionButton';
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
  disabled = false,
}) => {
  const toggleAction = (
    action: 'overcome' | 'advantage' | 'attack' | 'defend',
  ) => {
    if (disabled) return;
    if (actions.indexOf(action) === -1) {
      onChange([...actions, action]);
    } else {
      onChange(actions.filter((a) => a !== action));
    }
  };
  return (
    <>
      <ActionButton
        action="overcome"
        onClick={() => toggleAction('overcome')}
        className={className}
        toggled={actions.indexOf('overcome') !== -1}
        disabled={disabled}
      />
      <ActionButton
        action="advantage"
        onClick={() => toggleAction('advantage')}
        className={className}
        toggled={actions.indexOf('advantage') !== -1}
        disabled={disabled}
      />
      <ActionButton
        action="attack"
        onClick={() => toggleAction('attack')}
        className={className}
        toggled={actions.indexOf('attack') !== -1}
        disabled={disabled}
      />
      <ActionButton
        action="defend"
        onClick={() => toggleAction('defend')}
        className={className}
        toggled={actions.indexOf('defend') !== -1}
        disabled={disabled}
      />
    </>
  );
};

export default ActionToggle;
