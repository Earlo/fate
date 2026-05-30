import Campaign from '@/components/campaign';
import BaseLayout from '@/components/layout/baseLayout';
import { getCampaign } from '@/schemas/campaign';
import { notFound } from 'next/navigation';

const CampaignPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const campaign = await getCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <BaseLayout className="px-4 py-6">
      <Campaign campaign={campaign} />
    </BaseLayout>
  );
};

export default CampaignPage;
