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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <form
      onSubmit={onSubmit}
      className={cn(
        'relative z-10 h-fit max-h-[100dvh] max-w-full overflow-y-auto rounded bg-white p-1 shadow-md lg:max-w-6xl',
      )}
    >
      {onClose && (
        <div className="absolute left-0 top-0 z-20">
          <CloseButton onClick={onClose} />
        </div>
      )}
      <div className={cn('p-3', className)}>{children}</div>
    </form>
  </div>
);

export default FormContainer;
