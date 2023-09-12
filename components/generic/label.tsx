interface LabelProps {
  label?: string;
  name: string;
  children?: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ label, name, children }) => (
  <label
    className="flex flex-grow items-end justify-between whitespace-nowrap bg-black p-1 text-xl font-black uppercase text-white"
    style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px' }}
    htmlFor={name}
  >
    {label ? label : name}
    {children}
  </label>
);

export default Label;
