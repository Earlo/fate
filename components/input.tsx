interface InputProps {
  label?: string;
  name: string;
  type: string;
  value?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type,
  value,
  required,
  onChange,
}) => (
  <div className="mb-4">
    <label
      className="block font-black uppercase bg-black text-white p-1 mt-1 text-xl"
      style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px' }}
      htmlFor={name}
    >
      {label ? label : name}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      className="form-control w-full h-10 p-2 text-base text-gray-700 bg-white border border-gray-300 rounded"
      style={{
        height: 'calc(1.5em + 0.75rem + 2px)',
        transition:
          'border-color .15s ease-in-out, box-shadow .15s ease-in-out',
      }}
      required={required}
      onChange={onChange}
    />
  </div>
);

export default Input;
