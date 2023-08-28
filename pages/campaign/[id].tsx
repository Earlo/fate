import { CampaignT } from '@/schemas/campaign';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const getCampaignById = async (id: string): Promise<CampaignT> => {
  return await fetch(`/api/campaign/${id}`).then((res) => res.json());
};

const CampaignPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [campaign, setCampaign] = useState<CampaignT | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const data = await getCampaignById(id as string);
          if (data) {
            setCampaign(data);
          } else {
            router.push('/');
          }
        } catch (error) {
          console.error('Could not fetch campaign:', error);
          router.push('/');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCampaign();
  }, [id, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!campaign) {
    return <div>Not Found</div>;
  }

  return (
    <div>
      <h1>{campaign.name}</h1>
      <img src={campaign.icon} alt={campaign.name} />
      <p>{campaign.description}</p>
    </div>
  );
};

export default CampaignPage;
