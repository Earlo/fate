interface FormContainerProps {
  onSubmit: (e: React.ChangeEvent<HTMLFormElement>) => Promise<void>;
  children?: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({
  onSubmit,
  children,
}) => (
  <form
    onSubmit={onSubmit}
    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
  >
    {children}
  </form>
);

export default FormContainer;
