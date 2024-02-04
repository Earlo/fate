import ControlBar from './sheet/controlBar';
import { cn } from '@/lib/helpers';
interface FormContainerProps {
  onSubmit?: (e: React.ChangeEvent<HTMLFormElement>) => Promise<void>;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  onSubmit,
  children,
  onClose,
  onMinimize,
  onMaximize,
  className,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <form
      onSubmit={onSubmit}
      className={cn(
        'relative z-10 h-fit max-h-[100dvh] max-w-full overflow-y-auto rounded bg-white p-1 shadow-md lg:max-w-6xl',
      )}
    >
      <ControlBar
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
      />
      <div className={cn('pt-6', className)}>{children}</div>
    </form>
  </div>
);

export default FormContainer;
