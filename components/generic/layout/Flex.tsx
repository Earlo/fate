import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';

interface FlexProps {
  className?: ClassValue;
  children: React.ReactNode;
}

const Flex: React.FC<FlexProps> = ({ className, children }) => {
  return <div className={cn('flex', className)}>{children}</div>;
};

export default Flex;
