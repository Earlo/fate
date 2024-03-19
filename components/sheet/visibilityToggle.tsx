import Icon from '../generic/icon/icon';
import { cn } from '@/lib/utils';

interface VisibilityToggleProps {
  visible: boolean;
  onChange: (visible: boolean) => void;
  className?: string;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({
  visible,
  onChange,
  className,
}) => (
  <Icon
    icon={visible ? 'eye' : 'noEye'}
    onClick={(event) => {
      event.stopPropagation();
      onChange(!visible);
    }}
    className={cn('text-gray-400 hover:text-gray-600', className)}
  />
);

export default VisibilityToggle;
