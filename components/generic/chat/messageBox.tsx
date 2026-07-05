'use client';
import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useRef, useState } from 'react';
import JumpDownButton from './jumpDownButton';

type MessageBoxProps = {
  title: string;
  children: ReactNode;
  resizable?: boolean;
  className?: string;
  viewportClassName?: string;
  action?: ReactNode;
};

const isAtBottom = (element: HTMLDivElement | null) => {
  if (!element) return true;
  const threshold = 12;
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <= threshold
  );
};

const scrollToBottom = (element: HTMLDivElement | null) => {
  if (!element) return;
  element.scrollTop = element.scrollHeight;
};

const MessageBox = ({
  title,
  children,
  resizable = true,
  className,
  viewportClassName,
  action,
}: MessageBoxProps) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    if (atBottom) {
      scrollToBottom(boxRef.current);
    }
  }, [atBottom, children]);

  return (
    <div className={cn('mt-5', className)}>
      <div className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-gray-200">
        <span>{title}</span>
        {action}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={boxRef}
          className={cn(
            'h-40 max-h-[60vh] min-h-32 overflow-y-auto rounded border border-gray-700 bg-gray-900/40 p-2 pb-8 text-xs text-gray-200',
            resizable && 'resize-y',
            viewportClassName,
          )}
          onScroll={() => setAtBottom(isAtBottom(boxRef.current))}
        >
          {children}
        </div>
        {!atBottom && (
          <JumpDownButton onClick={() => scrollToBottom(boxRef.current)} />
        )}
      </div>
    </div>
  );
};

export default MessageBox;
