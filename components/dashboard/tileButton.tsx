import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ReactNode } from 'react';

interface TileButtonProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
  imageClassName?: string;
  rightContent?: ReactNode;
}

const TileButton: React.FC<TileButtonProps> = ({
  title,
  subtitle,
  imageUrl,
  onClick,
  className,
  imageClassName,
  rightContent,
}) => {
  const Container = (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex h-20 min-h-0 w-full cursor-pointer items-center justify-around rounded-lg border border-gray-300 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800 focus:ring-2 focus:ring-gray-400 focus:outline-none active:bg-gray-300',
        className,
      )}
    >
      <Image
        src={imageUrl || '/blank_user.png'}
        alt={title}
        width={64}
        height={64}
        className={cn('shrink-0', imageClassName)}
      />
      <div className="flex min-w-0 grow flex-col pl-4">
        <h3 className="line-clamp-2 overflow-hidden text-lg leading-6 font-semibold group-hover:underline">
          {title}
        </h3>
        {subtitle && (
          <p className="line-clamp-2 overflow-hidden text-sm leading-4 text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
      {rightContent && (
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          {rightContent}
        </div>
      )}
    </div>
  );

  return Container;
};

export default TileButton;
