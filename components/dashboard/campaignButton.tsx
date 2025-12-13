import TileButton from './tileButton';

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
    <TileButton
      title={name || 'Unnamed campaign'}
      imageUrl={imageUrl || '/campaign.png'}
      onClick={onClick}
      className="pl-2"
      imageClassName=""
    />
  );
};

export default CampaignButton;
