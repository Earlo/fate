import ConsequenceInput from './consequenceInput';
import Label from '../generic/label';
import { CharacterSheetT } from '@/schemas/sheet';
import { cn } from '@/lib/helpers';

interface ConsequencesProps {
  consequences?: CharacterSheetT['consequences'];
  setConsequences: (value: CharacterSheetT['consequences']) => void;
  disabled: boolean;
  tight?: boolean;
}

const Consequences: React.FC<ConsequencesProps> = ({
  consequences,
  setConsequences,
  disabled,
  tight = false,
}) => {
  const handleChange = (
    field: keyof CharacterSheetT['consequences'],
    value: string,
  ) => {
    setConsequences({
      mild: consequences?.mild || { name: '', visibleIn: [] },
      moderate: consequences?.moderate || { name: '', visibleIn: [] },
      severe: consequences?.severe || { name: '', visibleIn: [] },
      physical: consequences?.physical,
      mental: consequences?.mental,
      [field]: {
        ...(consequences ? consequences[field] : {}),
        name: value,
      },
    });
  };

  return (
    <div className={cn('flex w-full flex-col', { 'pr-2': tight })}>
      <Label name="Consequences" />
      <div className={cn('flex flex-row pt-2', { 'flex-col pt-0': tight })}>
        <div className="flex grow flex-col">
          <ConsequenceInput
            name="Mild"
            rank="2"
            value={consequences?.mild?.name || ''}
            onChange={(e) => handleChange('mild', e.target.value)}
            disabled={disabled}
            tight={tight}
            first
          />
          <ConsequenceInput
            name="Moderate"
            rank="4"
            value={consequences?.moderate?.name || ''}
            onChange={(e) => handleChange('moderate', e.target.value)}
            disabled={disabled}
            tight={tight}
          />
          <ConsequenceInput
            name="Severe"
            rank="6"
            value={consequences?.severe?.name || ''}
            onChange={(e) => handleChange('severe', e.target.value)}
            disabled={disabled}
            tight={tight}
          />
        </div>
        <div className="flex grow flex-col">
          <ConsequenceInput
            name="Mild Physical"
            rank="2"
            value={consequences?.physical?.name || ''}
            onChange={(e) => handleChange('physical', e.target.value)}
            disabled={disabled}
            tight={tight}
            available={!!consequences?.physical}
          />
          <ConsequenceInput
            name="Mild Mental"
            rank="2"
            value={consequences?.mental?.name || ''}
            onChange={(e) => handleChange('mental', e.target.value)}
            disabled={disabled}
            tight={tight}
            available={!!consequences?.mental}
          />
        </div>
      </div>
    </div>
  );
};

export default Consequences;
