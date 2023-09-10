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
        description: '',
        icon: '',
        color: '',
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
    return (
      <div className="flex h-screen items-center justify-center text-2xl">
        Loading...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl">
        Not Found
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-center text-4xl font-bold sm:text-5xl">
        {campaign.name}
      </h1>
      <div className="mb-6 flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Image
          src={campaign.icon || '/drowsee_128.png'}
          alt={campaign.name}
          width={128}
          height={128}
          className="w-full rounded-full sm:h-32 sm:w-32"
        />
        <p className="text-lg sm:text-xl">{campaign.description}</p>
      </div>
      {isAdmin && (
        <Button
          label="Add Faction"
          onClick={handleAddFaction}
          className="mb-6"
        />
      )}
      {campaign?.factions && campaign.factions.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Factions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaign.factions.map((faction, index) => (
              <Faction
                key={index}
                faction={faction}
                isAdmin={isAdmin}
                onChange={(faction) => updateFaction(index, faction)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignPage;
