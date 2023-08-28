import Button from './generic/button';
import FormContainer from './formContainer';
import CloseButton from './generic/closeButton';
import Checkbox from './generic/checkbox';
import CampaignSheet from './campaignSheet';
import { CampaignT } from '@/schemas/campaign';
import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<Partial<CampaignT>>(
    initialCampaign || {},
  );
  const isEditMode = state === 'edit';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formState,
      controlledBy: session?.user?._id,
    };

    try {
      const apiMethod = isEditMode ? 'PUT' : 'POST';
      const apiUrl = isEditMode
        ? `/api/campaign/${initialCampaign?._id}`
        : '/api/campaign';
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      if (!response.ok) {
        console.error('Failed to submit form', await response.json());
        return;
      }
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
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('An error occurred while submitting the form', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <CloseButton
        className="float-right relative bottom-4 left-4"
        onClick={onClose}
      />
      <CampaignSheet campaign={formState} setCampaign={setFormState} />
      <Checkbox
        name="Is Public"
        checked={formState.public || false}
        onChange={(e) =>
          setFormState((prev) => ({ ...prev, public: e.target.checked }))
        }
      />
      <Button
        label={isEditMode ? 'Save Changes' : 'Create'}
        type="submit"
        disabled={isSubmitting}
      />
    </FormContainer>
  );
};

export default CampaignForm;
