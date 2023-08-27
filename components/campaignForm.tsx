import Input from './generic/input';
import Button from './generic/button';
import FormContainer from './formContainer';
import CloseButton from './generic/closeButton';
import ImageUploader from './generic/imageUploader';
import Checkbox from './generic/checkbox';
import { CampaignT } from '@/schemas/campaign';
import { useState, FormEvent } from 'react';

interface CampaignFormProps {
  onClose?: () => void;
  initialCampaign?: CampaignT;
  state?: 'create' | 'edit' | 'view';
  setCampaigns?: React.Dispatch<React.SetStateAction<CampaignT[]>>;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  onClose,
  initialCampaign,
  state = 'create',
  setCampaigns,
}) => {
  const [name, setName] = useState(initialCampaign?.name || '');
  const [icon, setIcon] = useState<string>(initialCampaign?.icon || '');
  const [description, setDescription] = useState(
    initialCampaign?.description || '',
  );
  const [publicCampaign, setPublicCampaign] = useState(
    initialCampaign?.public || false,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const campaignData = {
      name,
      icon,
      description,
      public: publicCampaign,
    };

    const apiMethod = state === 'edit' ? 'PUT' : 'POST';
    const apiUrl =
      state === 'edit'
        ? `/api/campaign/${initialCampaign?._id}`
        : '/api/campaign';

    const response = await fetch(apiUrl, {
      method: apiMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });

    const data = await response.json();

    if (setCampaigns) {
      setCampaigns((prevCampaigns) => {
        const index = prevCampaigns.findIndex(
          (campaign) => campaign._id === data._id,
        );
        if (index !== -1) {
          return [
            ...prevCampaigns.slice(0, index),
            data,
            ...prevCampaigns.slice(index + 1),
          ];
        } else {
          return [...prevCampaigns, data];
        }
      });
    }
    if (onClose) onClose();
    setIsSubmitting(false);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <CloseButton
        className="float-right relative bottom-4 left-4"
        onClick={onClose}
      />
      <div className="flex items-center">
        <ImageUploader setIcon={setIcon} icon={icon} path={'campaign'} />
        <div className="flex flex-col ml-4 flex-grow">
          <Input
            name="Campaign Name"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <Input
            name="Description"
            multiline
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </div>
      </div>
      <Checkbox
        name="Is Public"
        checked={publicCampaign}
        onChange={(e) => setPublicCampaign(e.target.checked)}
      />
      <Button label="Create Campaign" type="submit" disabled={isSubmitting} />
    </FormContainer>
  );
};

export default CampaignForm;
