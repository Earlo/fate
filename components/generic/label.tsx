interface LabelProps {
  label?: string;
  name: string;
  children?: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ label, name, children }) => (
  <label
    className="flex font-black uppercase bg-black text-white p-1 mt-1 text-xl whitespace-nowrap justify-between items-end flex-grow"
    style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px' }}
    htmlFor={name}
  >
    {label ? label : name}
    {children}
  </label>
);

export default Label;
