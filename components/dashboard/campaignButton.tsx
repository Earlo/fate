import Image from 'next/image';

interface CampaignButtonProps {
  name: string;
  imageUrl?: string;
  onClick: () => void;
}

const CampaignButton: React.FC<CampaignButtonProps> = ({
  name,
  onClick,
  imageUrl,
}) => {
  return (
    <div
      onClick={onClick}
      className="group flex min-h-0 w-full cursor-pointer items-center space-x-4 rounded-lg border border-gray-300 p-2 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200"
    >
      <Image
        src={imageUrl || '/drowsee_128.png'}
        alt={name}
        width={64}
        height={64}
        className="flex-shrink-0"
      />
      <div className="flex min-w-0 flex-col">
        <h3 className="line-clamp-2 overflow-hidden text-lg font-semibold leading-6 group-hover:underline">
          {name || 'Unnamed campaign'}
        </h3>
      </div>
    </div>
  );
};

export default CampaignButton;
