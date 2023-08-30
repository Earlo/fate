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
    className="mb-4 h-fit rounded bg-white px-8 pb-8 pt-6 shadow-md"
  >
    {children}
  </form>
);

export default FormContainer;
