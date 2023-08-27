import Input from './generic/input';
import Button from './generic/button';
import FormContainer from './formContainer';
import CloseButton from './generic/closeButton';
import ImageUploader from './generic/imageUploader';
import Checkbox from './generic/checkbox';
import { useState, FormEvent } from 'react';

interface CampaignFormProps {
  onClose?: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onClose }) => {
  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [publicCampaign, setPublicCampaign] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    //onSubmit({ name, icon, description, public: publicCampaign });
    console.log('submitting');
    e.preventDefault();
    if (onClose) onClose();
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
      <Button label="Create Campaign" type="submit" />
    </FormContainer>
  );
};

export default CampaignForm;
