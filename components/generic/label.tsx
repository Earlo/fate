interface LabelProps {
  label?: string;
  name: string;
}

const Label: React.FC<LabelProps> = ({ label, name }) => (
  <label
    className="block font-black uppercase bg-black text-white p-1 mt-1 text-xl whitespace-nowrap"
    style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px' }}
    htmlFor={name}
  >
    {label ? label : name}
  </label>
);

export default Label;
