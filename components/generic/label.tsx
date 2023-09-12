interface LabelProps {
  label?: string;
  name: string;
  children?: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ label, name, children }) => (
  <label
    className="flex w-full items-end justify-between whitespace-nowrap bg-black p-1 pl-4 text-xl font-black uppercase text-white"
    style={{
      fontFamily: "'Archivo Black', sans-serif",
      fontSize: '22px',
      clipPath:
        'polygon(1rem 0%, 100% 0%, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0% 100%, 0% 1rem)',
    }}
    htmlFor={name}
  >
    {' '}
    {label ? label : name}
    {children}
  </label>
);

export default Label;
