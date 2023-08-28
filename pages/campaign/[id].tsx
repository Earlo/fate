import { CampaignT } from '@/schemas/campaign';
import Button from '@/components/generic/button';
import Faction from '@/components/dashboard/faction';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

const getCampaignById = async (id: string): Promise<CampaignT> => {
  return await fetch(`/api/campaign/${id}`).then((res) => res.json());
};

const CampaignPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = router.query;
  const [campaign, setCampaign] = useState<CampaignT | null>(null);
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
  const handleAddFaction = () => {
    if (campaign) {
      const newFaction = {
        name: 'New Faction',
        public: false,
        visible: true,
        characters: [],
      };
      // Make a deep copy of the existing campaign and update the factions
      const updatedCampaign = { ...campaign };
      updatedCampaign.factions.push(newFaction);
      setCampaign(updatedCampaign);
      // You could also make an API call here to update the backend
    }
  };
  const updateFactionName = (factionIndex: number, newName: string) => {
    if (campaign) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.factions[factionIndex].name = newName;
      setCampaign(updatedCampaign);
      // Make API call to update back-end data here
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
      <h1 className="text-4xl font-bold text-center">{campaign.name}</h1>
      <div className="flex flex-row items-center">
        <Image
          src={campaign.icon || '/drowsee_128.png'}
          alt={campaign.name}
          width={128}
          height={128}
          className="w-32 h-32 mx-4"
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
              updateFactionName={(newName) => updateFactionName(index, newName)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignPage;
