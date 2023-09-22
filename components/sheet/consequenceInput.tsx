import Input from '../generic/input';
interface ConsequenceInputProps {
  rank: string;
  name: string;

  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  disabled?: boolean;
  available?: boolean;
}

const ConsequenceInput: React.FC<ConsequenceInputProps> = ({
  rank,
  name,
  value,
  onChange,
  disabled,
  available = true,
}) => {
  return (
    <div
      className={`flex items-center justify-center pb-4 pl-4 ${
        disabled ? 'cursor-not-allowed' : ''
      }`}
    >
      <label
        className={`relative bottom-2 left-1 z-10 flex flex-grow items-end justify-between text-2xl font-black uppercase ${
          !available ? 'font-outline-2 text-white' : 'text-black'
        }`}
        htmlFor={name}
      >
        {rank}
      </label>
      <Input
        placeholder={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || !available}
      />
    </div>
  );
};

export default ConsequenceInput;
