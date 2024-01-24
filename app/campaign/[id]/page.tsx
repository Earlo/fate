'use client';
import { PopulatedFaction } from '@/schemas/campaign';
import Button from '@/components/generic/button';
import Faction from '@/components/dashboard/faction';
import AspectInput from '@/components/sheet/aspectInput';
import BaseLayout from '@/components/layout/baseLayout';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import NoteInput from '@/components/sheet/noteInput';
import { CharacterSheetT } from '@/schemas/sheet';
import { getCharacterSheetsByUserId } from '@/lib/apiHelpers/sheets';
import { useCampaign } from '@/hooks/useFate';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Head from 'next/head';

const CampaignPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = useParams();
  const { campaign, isLoading, updateCampaign, addFaction, joinLeaveCampaign } =
    useCampaign(id as string);
  const isAdmin =
    !!session?.user.admin || campaign?.owner === session?.user._id;
  const isPlayer =
    campaign &&
    session?.user._id &&
    campaign.visibleTo.includes(session?.user._id);
  const [allCharacters, setAllCharacters] = useState<CharacterSheetT[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const data = await getCharacterSheetsByUserId(session.user._id);
        setAllCharacters(data);
      }
    };
    fetchData();
  }, [session]);

  useEffect(() => {
    if (!isLoading && !campaign) {
      router.push('/');
    }
  }, [isLoading, campaign, router]);

  const updateFaction = async (
    factionIndex: number,
    updatedFaction: PopulatedFaction,
  ) => {
    if (campaign && id) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.factions[factionIndex] = updatedFaction;
      updateCampaign(updatedCampaign);
    }
  };
  //TODO maybe handle this inside the noteInput component?
  const setNotes = async (
    notes: {
      name: string;
      visibleIn: string[];
      content: string;
    }[],
  ) => {
    if (campaign && id && isAdmin) {
      const updatedCampaign = { ...campaign };
      updatedCampaign.notes = notes;
      updateCampaign(updatedCampaign);
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
          {session?.user._id && campaign.owner !== session?.user._id && (
            <Button
              label={isPlayer ? 'Leave Campaign' : 'Join Campaign'}
              onClick={() => joinLeaveCampaign(session?.user._id)}
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
          <p className="font-archivo pl-4 text-lg sm:text-xl">
            {campaign.description}
          </p>
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
            setNotes={setNotes}
            campaignId={campaign?._id}
            className="w-full sm:w-8/12"
          />
        </div>
        {isAdmin && (
          <Button label="Add Faction" onClick={addFaction} className="mb-6" />
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
