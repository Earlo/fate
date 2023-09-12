import CloseButton from './generic/closeButton';

interface FormContainerProps {
  onSubmit: (e: React.ChangeEvent<HTMLFormElement>) => Promise<void>;
  onClose?: () => void;
  children?: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({
  onSubmit,
  children,
  onClose,
}) => (
  <form
    onSubmit={onSubmit}
    className="z-10 h-fit rounded bg-white px-8 pb-8 pt-6 shadow-md"
  >
    {onClose && (
      <CloseButton
        className="relative bottom-4 left-4 float-right"
        onClick={onClose}
      />
    )}

    {children}
  </form>
);

export default FormContainer;
