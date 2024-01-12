import { PopulatedCampaignT, PopulatedFaction } from '@/schemas/campaign';
import Button from '@/components/generic/button';
import Faction from '@/components/dashboard/faction';
import AspectInput from '@/components/sheet/aspectInput';
import BaseLayout from '@/components/layout/baseLayout';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import NoteInput from '@/components/sheet/noteInput';
import { CharacterSheetT } from '@/schemas/sheet';
import { blankFaction } from '@/schemas/consts/blankCampaignSheet';
import { getCampaignById, updateCampaignAPI } from '@/lib/db/campaigns';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Head from 'next/head';

const CampaignPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = router.query;
  const [campaign, setCampaign] = useState<PopulatedCampaignT | null>(null);
  const [isLoading, setIsLoading] = useState(status === 'loading');
  const isAdmin =
    !!session?.user.admin || campaign?.controlledBy === session?.user._id;
  const isPlayer =
    campaign &&
    session?.user._id &&
    campaign.visibleTo.includes(session?.user._id);
  const [allCharacters, setAllCharacters] = useState<CharacterSheetT[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const response = await fetch(`/api/sheets?id=${session.user._id}`);
        if (response.status === 200) {
          const data = await response.json();
          setAllCharacters(data);
        }
      }
    };
    fetchData();
  }, [session]);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const data = await getCampaignById(id as string);
          if (!('error' in data)) {
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
      const newFaction = { ...blankFaction };
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
  //TODO maybe handle this inside the noteInput component?
  const handleSetNotes = async (
    notes: {
      name: string;
      visibleIn: string[];
      content: string;
    }[],
  ) => {
    if (!isAdmin) {
      console.log('User is not admin', notes);
    }
    if (campaign && id && isAdmin) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.notes = notes;
      await updateCampaignAPI(id as string, updatedCampaign);
      setCampaign(updatedCampaign);
    }
  };

  const joinLeaveCampaign = async () => {
    if (campaign && id && session?.user._id) {
      const updatedCampaign = { ...campaign };
      const userId = session?.user._id;
      if (updatedCampaign.visibleTo.includes(userId)) {
        updatedCampaign.visibleTo = updatedCampaign.visibleTo.filter(
          (id) => id !== userId,
        );
      } else {
        updatedCampaign.visibleTo.push(userId);
      }
      await updateCampaignAPI(id as string, updatedCampaign);
      setCampaign(updatedCampaign);
    }
  };

  if (isLoading) {
    return (
      <BaseLayout className="items-center justify-center">
        <LoadingSpinner />
      </BaseLayout>
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
    <>
      <Head>
        <title>Fate Core Campaign: {campaign.name}</title>
      </Head>
      <BaseLayout className="px-4 py-6">
        <h1 className="pb-6 text-center text-4xl font-bold sm:text-5xl">
          {campaign.name}
          {session?.user._id && campaign.controlledBy !== session?.user._id && (
            <Button
              label={isPlayer ? 'Leave Campaign' : 'Join Campaign'}
              onClick={() => joinLeaveCampaign()}
              className="ml-4"
            />
          )}
        </h1>
        <div className="flex flex-col items-center pb-6 sm:flex-row">
          <Image
            src={campaign.icon || '/drowsee_128.png'}
            alt={campaign.name}
            width={128}
            height={128}
            className="w-full sm:h-32 sm:w-32"
          />
          <p className="pl-4 text-lg sm:text-xl">{campaign.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row">
          <AspectInput
            aspects={campaign?.aspects || []}
            setAspects={(aspects) => null}
            disabled={true}
            campaignId={campaign?._id}
            hints={['Current Issues', 'Impeding Issues']}
            title="Issues"
          />
          <NoteInput
            notes={campaign?.notes || []}
            disabled={!isAdmin}
            setNotes={handleSetNotes}
            campaignId={campaign?._id}
            className="w-full sm:w-8/12"
          />
        </div>
        {isAdmin && (
          <Button
            label="Add Faction"
            onClick={handleAddFaction}
            className="mb-6"
          />
        )}
        {campaign?.factions && campaign.factions.length > 0 && (
          <>
            <h2 className="mb-4 text-2xl font-semibold">Factions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaign.factions.map(
                (faction, index) =>
                  (faction.visible || isAdmin) && (
                    <Faction
                      key={index}
                      faction={faction}
                      state={isAdmin ? 'admin' : isPlayer ? 'player' : 'view'}
                      onChange={(faction) => updateFaction(index, faction)}
                      campaignId={id as string}
                      allCharacters={allCharacters}
                      setAllCharacters={setAllCharacters}
                    />
                  ),
              )}
            </div>
          </>
        )}
      </BaseLayout>
    </>
  );
};

export default CampaignPage;
