'use client';
import Group from '@/components/dashboard/group';
import Button from '@/components/generic/button';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import BaseLayout from '@/components/layout/baseLayout';
import AspectInput from '@/components/sheet/aspectInput';
import NoteInput from '@/components/sheet/noteInput';
import { useCampaign } from '@/hooks/useFate';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useEffect } from 'react';

interface CampaignProps {
  id: string;
}

const Campaign: FC<CampaignProps> = ({ id }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    campaign,
    isLoading,
    toggleCampaign,
    addGroup,
    updateGroup,
    addNote,
    deleteNote,
    updateNote,
  } = useCampaign(id);

  const isAdmin = !!session?.user.admin || campaign?.owner === session?.user.id;
  const isPlayer =
    campaign &&
    session?.user.id &&
    campaign.visibleTo.includes(session.user.id);

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
    <>
      <h1 className="pb-6 text-center text-4xl font-bold sm:text-5xl">
        {campaign.name}
        {session && !isAdmin && (
          <Button
            label={isPlayer ? 'Leave Campaign' : 'Join Campaign'}
            onClick={() => toggleCampaign(session.user.id)}
            className="ml-4"
          />
        )}
      </h1>
      <div className="flex flex-col items-center pb-6 sm:flex-row">
        <Image
          src={campaign.icon?.url || '/campaign.png'}
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
          aspects={campaign.aspects}
          setAspects={(aspects) => null}
          disabled={true}
          campaignId={campaign.id}
          hints={['Current Issues', 'Impeding Issues']}
          title="Issues"
        />
        <NoteInput
          disabled={!isAdmin}
          campaignId={campaign.id}
          notes={campaign.notes}
          addNote={() => addNote()}
          deleteNote={(index) => deleteNote(index)}
          updateNote={(note, index) => updateNote(note, index)}
          className="w-full sm:w-8/12"
        />
      </div>
      {isAdmin && <Button label="Add Group" onClick={addGroup} />}
      {campaign.groups.length > 0 && (
        <>
          <h2 className="mb-4 text-2xl font-semibold">Groups</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaign.groups.map(
              (group, index) =>
                (group.visible || isAdmin) && (
                  <Group
                    key={index}
                    group={group}
                    state={isAdmin ? 'admin' : isPlayer ? 'player' : 'view'}
                    onChange={(group) => updateGroup(index, group)}
                    campaignId={id as string}
                  />
                ),
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Campaign;
