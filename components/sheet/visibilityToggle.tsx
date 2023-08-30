import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

interface VisibilityToggleProps {
  visible: boolean;
  onChange: (visible: boolean) => void;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({
  visible,
  onChange,
}) =>
  visible ? (
    <EyeIcon
      className="h-6 w-6 text-gray-400 hover:text-gray-500"
      onClick={() => onChange(false)}
    />
  ) : (
    <EyeSlashIcon
      className="h-6 w-6 text-gray-400 hover:text-gray-500"
      onClick={() => onChange(true)}
    />
  );

export default VisibilityToggle;
