import { cn } from '@/lib/utils';
import ControlBar from './sheet/controlBar';
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
  <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
    <form
      onSubmit={onSubmit}
      className={cn(
        'relative z-10 h-fit max-h-dvh max-w-full overflow-y-auto rounded bg-white p-1 shadow-md lg:max-w-6xl',
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
