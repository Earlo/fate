import Campaign from '@/components/campaign';
import BaseLayout from '@/components/layout/baseLayout';
import { requireCampaignRead } from '@/lib/apiAuth';
import { getCampaign } from '@/schemas/campaign';
import { notFound } from 'next/navigation';

const CampaignPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  let user;
  try {
    ({ user } = await requireCampaignRead(id));
  } catch {
    notFound();
  }
  const campaign = await getCampaign(id, user ?? undefined);

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
