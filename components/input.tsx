interface InputProps {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type,
  required,
  onChange,
}) => (
  <div className="mb-4">
    <label
      className="block text-gray-700 text-sm font-bold mb-2"
      htmlFor={name}
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      required={required}
      onChange={onChange}
    />
  </div>
);

export default Input;
