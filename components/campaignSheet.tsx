import Input from './generic/input';
import ImageUploader from './generic/imageUploader';
import { CampaignT } from '@/schemas/campaign';

interface CampaignSheetProps {
  campaign?: Partial<CampaignT>;
  setCampaign?: React.Dispatch<React.SetStateAction<Partial<CampaignT>>>;
}

const CampaignSheet: React.FC<CampaignSheetProps> = ({
  campaign,
  setCampaign,
}) => {
  const updateField = (field: keyof CampaignT, value: string) => {
    if (setCampaign) {
      setCampaign((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="flex items-center">
      <ImageUploader
        icon={campaign?.icon}
        path={'campaign'}
        setIcon={(icon) => updateField('icon', icon)}
        disabled={!setCampaign}
      />
      <div className="ml-4 flex flex-grow flex-col">
        <Input
          name="Campaign Name"
          onChange={(e) => updateField('name', e.target.value)}
          value={campaign?.name}
          disabled={!setCampaign}
          required
        />
        <Input
          name="Description"
          multiline
          onChange={(e) => updateField('description', e.target.value)}
          value={campaign?.description}
          disabled={!setCampaign}
        />
      </div>
    </div>
  );
};

export default CampaignSheet;
