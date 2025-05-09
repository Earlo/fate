import { cn } from '@/lib/utils';

interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('flex flex-auto flex-col', className)}>{children}</div>
  );
};

export default BaseLayout;
