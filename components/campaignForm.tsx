'use client';
import Button from './generic/button';
import FormContainer from './formContainer';
import Checkbox from './generic/checkbox';
import CampaignSheet from './campaignSheet';
import LabeledInput from './generic/labeledInput';
import { CampaignT } from '@/schemas/campaign';
import { blankSheet } from '@/schemas/consts/blankCampaignSheet';
import {
  createCampaignAPI,
  updateCampaignAPI,
} from '@/lib/apiHelpers/campaigns';
import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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
    initialCampaign || { ...blankSheet },
  );
  const isEditMode = state === 'edit' && initialCampaign;
  const isViewMode = state === 'view' && initialCampaign;
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formState,
      owner: session?.user?._id,
    };

    try {
      const data = isEditMode
        ? await updateCampaignAPI(initialCampaign._id, submitData)
        : await createCampaignAPI(submitData);
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
    <FormContainer
      onSubmit={!isViewMode ? handleSubmit : undefined}
      onClose={onClose}
    >
      <CampaignSheet
        campaign={formState}
        setCampaign={state !== 'view' ? setFormState : undefined}
      />
      <Checkbox
        name="Is Public"
        checked={formState.public || false}
        onChange={(e) =>
          setFormState((prev) => ({ ...prev, public: e.target.checked }))
        }
      />
      <div className="space-between flex">
        {!isViewMode && (
          <Button
            label={isEditMode ? 'Save Changes' : 'Create'}
            type="submit"
            disabled={isSubmitting}
          />
        )}
        {(isEditMode || isViewMode) && initialCampaign && (
          <Link href={`/campaign/${initialCampaign._id}`} passHref>
            <Button label="View Campaign" />
          </Link>
        )}
      </div>
      {(isEditMode || isViewMode) && initialCampaign && (
        <div className="pt-2">
          <LabeledInput
            name="Campaign link"
            type="text"
            value={`${process.env.NEXT_PUBLIC_URL}/campaign/${initialCampaign._id}`}
            disabled
          />
        </div>
      )}
    </FormContainer>
  );
};

export default CampaignForm;
