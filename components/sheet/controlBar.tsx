import { HTMLAttributes } from 'react';
import IconButton from '../generic/icon/iconButton';

interface ControlBarProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  dragListeners?: HTMLAttributes<HTMLElement>;
}

export default function ControlBar({
  onClose,
  onMinimize,
  onMaximize,
  dragListeners,
}: ControlBarProps) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-6 items-center justify-center select-none">
      {dragListeners && (
        <IconButton
          icon="drag"
          className="cursor-grab bg-transparent text-gray-400 hover:bg-transparent focus:ring-0 focus:outline-none active:cursor-grabbing"
          {...dragListeners}
        />
      )}

      {onMinimize && (
        <IconButton
          onClick={onMinimize}
          icon="reduce"
          className="absolute right-6"
        />
      )}

      {onMaximize && (
        <IconButton
          onClick={onMaximize}
          icon="grow"
          className="absolute right-6"
        />
      )}

      {onClose && (
        <IconButton
          onClick={onClose}
          icon="close"
          className="absolute right-0"
        />
      )}
    </div>
  );
}
