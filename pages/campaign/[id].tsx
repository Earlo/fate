import { PopulatedCampaignT, PopulatedFaction } from '@/schemas/campaign';
import Button from '@/components/generic/button';
import Faction from '@/components/dashboard/faction';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

const getCampaignById = async (id: string): Promise<PopulatedCampaignT> => {
  return await fetch(`/api/campaign/${id}`).then((res) => res.json());
};

const updateCampaignAPI = async (
  campaignId: string,
  updatedCampaign: PopulatedCampaignT,
): Promise<PopulatedCampaignT> => {
  return await fetch(`/api/campaign/${campaignId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCampaign),
  }).then((res) => res.json());
};

const CampaignPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = router.query;
  const [campaign, setCampaign] = useState<PopulatedCampaignT | null>(null);
  const [isLoading, setIsLoading] = useState(status === 'loading');
  const isAdmin = !!session?.user.admin;
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

  const handleAddFaction = async () => {
    if (campaign && id) {
      const newFaction = {
        name: 'New Faction',
        public: false,
        visible: true,
        characters: [],
      };
      const updatedCampaign = { ...campaign };
      updatedCampaign.factions.push(newFaction);
      await updateCampaignAPI(id as string, updatedCampaign);
      setCampaign(updatedCampaign);
    }
  };

  const updateFaction = async (
    factionIndex: number,
    updatedFaction: PopulatedFaction,
  ) => {
    if (campaign && id) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.factions[factionIndex] = updatedFaction;
      await updateCampaignAPI(id as string, updatedCampaign);
      setCampaign(updatedCampaign);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!campaign) {
    return <div>Not Found</div>;
  }
  return (
    <div>
      <h1 className="text-center text-4xl font-bold">{campaign.name}</h1>
      <div className="flex flex-row items-center">
        <Image
          src={campaign.icon || '/drowsee_128.png'}
          alt={campaign.name}
          width={128}
          height={128}
          className="mx-4 h-32 w-32"
        />
        <p>{campaign.description}</p>
      </div>
      {isAdmin && <Button label="Add Faction" onClick={handleAddFaction} />}
      {campaign?.factions && campaign.factions.length > 0 && (
        <div>
          <h2>Factions</h2>
          {campaign.factions.map((faction, index) => (
            <Faction
              key={index}
              faction={faction}
              isAdmin={isAdmin}
              onChange={(faction) => updateFaction(index, faction)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/*
const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};
*/

export default CampaignPage;
