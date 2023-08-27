import CloseButton from './closeButton';

interface ModalProps {
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, className, children }) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${className}`}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-3/4 md:w-1/2 relative">
        {onClose && (
          <CloseButton
            onClick={onClose}
            className="absolute top-2 right-2 z-10"
          />
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
