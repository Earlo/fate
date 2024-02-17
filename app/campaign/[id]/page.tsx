'use client';
import Button from '@/components/generic/button';
import Faction from '@/components/dashboard/faction';
import AspectInput from '@/components/sheet/aspectInput';
import BaseLayout from '@/components/layout/baseLayout';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import NoteInput from '@/components/sheet/noteInput';
import { useCampaign } from '@/hooks/useFate';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

type Props = {
  params: { id: string };
};

const CampaignPage = ({ params }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = params;
  const {
    campaign,
    isLoading,
    toggleCampaign,
    addFaction,
    updateFaction,
    addNote,
    deleteNote,
    updateNote,
  } = useCampaign(id);

  const isAdmin =
    !!session?.user.admin || campaign?.owner === session?.user._id;
  const isPlayer =
    campaign &&
    session?.user._id &&
    campaign.visibleTo.includes(session.user._id);

  useEffect(() => {
    if (!isLoading && !campaign) {
      router.push('/');
    }
  }, [isLoading, campaign, router]);

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
    <BaseLayout className="px-4 py-6">
      <h1 className="pb-6 text-center text-4xl font-bold sm:text-5xl">
        {campaign.name}
        {session && !isAdmin && (
          <Button
            label={isPlayer ? 'Leave Campaign' : 'Join Campaign'}
            onClick={() => toggleCampaign(session.user._id)}
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
        <p className="pl-4 font-archivo text-lg sm:text-xl">
          {campaign.description}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row">
        <AspectInput
          aspects={campaign.aspects}
          setAspects={(aspects) => null}
          disabled={true}
          campaignId={campaign._id}
          hints={['Current Issues', 'Impeding Issues']}
          title="Issues"
        />
        <NoteInput
          disabled={!isAdmin}
          campaignId={campaign._id}
          notes={campaign.notes}
          addNote={() => addNote()}
          deleteNote={(index) => deleteNote(index)}
          updateNote={(note, index) => updateNote(note, index)}
          className="w-full sm:w-8/12"
        />
      </div>
      {isAdmin && (
        <Button label="Add Faction" onClick={addFaction} className="mb-6" />
      )}
      {campaign.factions.length > 0 && (
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
                  />
                ),
            )}
          </div>
        </>
      )}
    </BaseLayout>
  );
};
/*
import { getCampaignById } from '@/lib/apiHelpers/campaigns';
import type { Metadata, ResolvingMetadata } from 'next';
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const id = params.id;
  const campaign = await getCampaignById(id);
  const previousImages = (await parent).openGraph?.images || [];
  return {
    title: 'Fate Core campaign:' + campaign.name,
    openGraph: {
      images: campaign.icon
        ? [campaign.icon, ...previousImages]
        : previousImages,
    },
  };
}
*/
export default CampaignPage;
