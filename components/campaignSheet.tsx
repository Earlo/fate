import LabeledInput from './generic/labeledInput';
import ImageUploader from './generic/imageUploader';
import AspectInput from './sheet/aspectInput';
import SkillTypeInput from './sheet/skillTypeInput';
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
    <div className="flex w-full grow flex-col">
      <div className="flex flex-col items-center md:flex-row">
        <ImageUploader
          icon={campaign?.icon ?? undefined}
          path={'campaign'}
          setIcon={(icon) => updateField('icon', icon)}
          disabled={!setCampaign}
          className="pb-2"
        />
        <div className="flex w-full flex-grow flex-col md:ml-4">
          <LabeledInput
            name="Campaign Name"
            onChange={(e) => updateField('name', e.target.value)}
            value={campaign?.name}
            disabled={!setCampaign}
            required
          />
          <LabeledInput
            name="Description"
            multiline
            onChange={(e) => updateField('description', e.target.value)}
            value={campaign?.description ?? undefined}
            disabled={!setCampaign}
          />
        </div>
      </div>
      <div className="flex grow flex-col sm:flex-row">
        <AspectInput
          aspects={campaign?.aspects || []}
          setAspects={(aspects) => updateField('aspects', aspects)}
          disabled={!setCampaign}
          campaignId={campaign?._id}
          hints={['Current Issues', 'Impeding Issues']}
          className="pr-2"
        />
        <SkillTypeInput
          skills={campaign?.skills || []}
          setSkills={(skills) => updateField('skills', skills)}
          disabled={!setCampaign}
        />
      </div>
    </div>
  );
};

export default CampaignSheet;
