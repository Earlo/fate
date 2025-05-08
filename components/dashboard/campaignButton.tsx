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
      className="group flex h-20 min-h-0 w-full cursor-pointer items-center justify-around rounded-lg border border-gray-300 pl-2 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 active:bg-gray-300"
    >
      <Image
        src={imageUrl || '/campaign.png'}
        alt={name}
        width={64}
        height={64}
        className="shrink-0"
      />
      <div className="flex min-w-0 grow flex-col pl-4">
        <h3 className="line-clamp-2 overflow-hidden text-lg font-semibold leading-6 group-hover:underline">
          {name || 'Unnamed campaign'}
        </h3>
      </div>
    </div>
  );
};

export default CampaignButton;
