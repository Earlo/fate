import Input from './generic/input';
import ImageUploader from './generic/imageUploader';
import AspectInput from './sheet/aspectInput';
import { CampaignT } from '@/schemas/campaign';

interface CampaignSheetProps {
  campaign?: Partial<CampaignT>;
  setCampaign?: React.Dispatch<React.SetStateAction<Partial<CampaignT>>>;
}

type editableFields = Omit<
  CampaignT,
  'controlledBy' | '_id' | 'public' | 'visibleTo'
>;

const CampaignSheet: React.FC<CampaignSheetProps> = ({
  campaign,
  setCampaign,
}) => {
  const updateField = (
    field: keyof CampaignT,
    value: editableFields[keyof editableFields],
  ) => {
    if (setCampaign) {
      setCampaign((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center md:flex-row">
        <ImageUploader
          icon={campaign?.icon}
          path={'campaign'}
          setIcon={(icon) => updateField('icon', icon)}
          disabled={!setCampaign}
        />
        <div className="flex flex-grow flex-col md:ml-4">
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
      <AspectInput
        aspects={campaign?.aspects || []}
        setAspects={(aspects) => updateField('aspects', aspects)}
        disabled={!setCampaign}
        campaignId={campaign?._id}
        hints={['Current Issues', 'Impeding Issues']}
      />
    </div>
  );
};

export default CampaignSheet;
