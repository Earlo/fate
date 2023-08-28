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
      className="mb-2 flex w-48 items-center justify-between rounded bg-gray-200 p-2"
    >
      <Image
        src={imageUrl || '/drowsee_128.png'}
        alt={name}
        width={64}
        height={64}
        className="h-16 w-16"
      />
      <div className="ml-4">
        <h3 className="text-lg font-bold text-black">{name}</h3>
      </div>
    </div>
  );
};

export default CampaignButton;
