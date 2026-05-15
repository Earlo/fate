'use client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import JumpDownButton from './jumpDownButton';

type MessageBoxProps = {
  title: string;
  children: ReactNode;
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

const MessageBox = ({ title, children }: MessageBoxProps) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    if (atBottom) {
      scrollToBottom(boxRef.current);
    }
  }, [atBottom, children]);

  return (
    <div className="mt-5">
      <div className="mb-2 text-sm font-semibold text-gray-200">{title}</div>
      <div className="relative">
        <div
          ref={boxRef}
          className="h-40 max-h-[60vh] min-h-32 resize-y overflow-y-auto rounded border border-gray-700 bg-gray-900/40 p-2 pb-8 text-xs text-gray-200"
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
