import Campaign from '@/components/campaign';
import BaseLayout from '@/components/layout/baseLayout';

const CampaignPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <BaseLayout className="px-4 py-6">
      <Campaign id={id} />
    </BaseLayout>
  );
};

export default CampaignPage;
