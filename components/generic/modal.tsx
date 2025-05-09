import { cn } from '@/lib/utils';
import IconButton from './icon/iconButton';

interface ModalProps {
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, className, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          'relative w-3/4 overflow-hidden rounded-lg bg-white shadow-lg md:w-1/2',
          className,
        )}
      >
        {onClose && (
          <IconButton
            onClick={onClose}
            className="absolute top-0 right-0 z-10"
            icon="close"
          />
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
