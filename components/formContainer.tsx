import CloseButton from './generic/closeButton';
import { cn } from '@/lib/helpers';

interface FormContainerProps {
  onSubmit: (e: React.ChangeEvent<HTMLFormElement>) => Promise<void>;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  onSubmit,
  children,
  onClose,
  className,
}) => (
  <form
    onSubmit={onSubmit}
    className={cn(
      'z-10 h-fit max-h-[100dvh] overflow-y-auto rounded bg-white px-4 pb-8 pt-6 shadow-md',
      className,
    )}
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
