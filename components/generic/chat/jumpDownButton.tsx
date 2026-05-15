import Icon from '@/components/generic/icon/icon';

type JumpDownButtonProps = {
  onClick: () => void;
};

const JumpDownButton = ({ onClick }: JumpDownButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-200 shadow hover:bg-gray-700"
    title="Jump to latest"
  >
    <Icon icon="chevronDown" className="h-4 w-4" />
  </button>
);
export default JumpDownButton;
