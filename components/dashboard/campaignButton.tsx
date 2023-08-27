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
      className="flex items-center justify-between bg-gray-200 p-2 mb-2 rounded w-48"
    >
      <Image
        src={imageUrl || '/drowsee_128.png'}
        alt={name}
        width={64}
        height={64}
        className="w-16 h-16"
      />
      <div className="ml-4">
        <h3 className="text-lg font-bold text-black">{name}</h3>
      </div>
    </div>
  );
};

export default CampaignButton;
