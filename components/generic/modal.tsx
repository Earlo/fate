import { cn } from '@/lib/utils';
import IconButton from './icon/iconButton';

interface ModalProps {
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({
  onClose,
  className,
  children,
  title,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          'relative w-3/4 overflow-hidden rounded-lg bg-stone-100 shadow-lg md:w-1/2',
          className,
        )}
      >
        {title && (
          <h2 className="pt-1 pl-2 text-lg font-semibold text-gray-900">
            {title}
          </h2>
        )}
        {onClose && (
          <IconButton
            onClick={onClose}
            className="absolute top-0 right-0 z-10"
            icon="close"
          />
        )}
        <div className="p-2">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
