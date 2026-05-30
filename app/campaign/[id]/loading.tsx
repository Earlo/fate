import LoadingSpinner from '@/components/generic/loadingSpinner';
import BaseLayout from '@/components/layout/baseLayout';

const CampaignLoading = () => (
  <BaseLayout className="items-center justify-center">
    <LoadingSpinner />
  </BaseLayout>
);

export default CampaignLoading;
