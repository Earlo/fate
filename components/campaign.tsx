'use client';
import CampaignChat from '@/components/campaign/campaignChat';
import Group from '@/components/campaign/group';
import PresenceList from '@/components/campaign/presenceList';
import Button from '@/components/generic/button';
import LabeledInput from '@/components/generic/labeledInput';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import BaseLayout from '@/components/layout/baseLayout';
import AspectInput from '@/components/sheet/aspectInput';
import NoteInput from '@/components/sheet/noteInput';
import useDebounce from '@/hooks/useDebounce';
import { useCampaign } from '@/hooks/useFate';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useEffect, useState } from 'react';

interface CampaignProps {
  id: string;
}

function getDisplayName(storageKey: string) {
  if (typeof window === 'undefined') {
    return '';
  }
  const existingDisplayName = window.sessionStorage.getItem(storageKey);
  if (existingDisplayName) {
    return existingDisplayName;
  }
  return '';
}

const Campaign: FC<CampaignProps> = ({ id }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const storageKey = `campaign-display-name-${id}`;
  const [displayName, setDisplayName] = useState(getDisplayName(storageKey));
  const debouncedDisplayName = useDebounce(displayName, 600);
  const {
    campaign,
    isLoading,
    presence,
    messages,
    eventLog,
    viewerId,
    isGuest,
    toggleCampaign,
    addGroup,
    updateGroup,
    addNote,
    deleteNote,
    updateNote,
  } = useCampaign(id, {
    id: session?.user.id,
    username: debouncedDisplayName || session?.user?.username,
  });
  const isAdmin = !!session?.user.admin || campaign?.owner === session?.user.id;
  const isPlayer =
    campaign &&
    session?.user.id &&
    campaign.visibleTo.includes(session.user.id);
  const ownerId = campaign?.owner;
  const playerIds = campaign?.visibleTo ?? [];

  useEffect(() => {
    if (!isLoading && !campaign) {
      router.push('/');
    }
  }, [isLoading, campaign, router]);

  const handleDisplayNameChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = event.target.value;
    setDisplayName(value);
    if (typeof window !== 'undefined') {
      const storageKey = `campaign-display-name-${id}`;
      window.sessionStorage.setItem(storageKey, value);
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
      <div className="flex flex-col gap-6 pb-8 sm:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start">
            <Image
              src={campaign.icon?.url || '/campaign.png'}
              alt={campaign.name}
              width={128}
              height={128}
              className="w-full sm:h-32 sm:w-32"
            />
            <p className="font-archivo pt-4 pl-0 text-lg sm:pt-0 sm:pl-4 sm:text-xl">
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
        </div>
        <div className="sm:w-120 sm:shrink-0 sm:border-l sm:border-gray-700 sm:pl-6">
          <div className="pb-4">
            <LabeledInput
              name="Display name"
              value={displayName}
              onChange={handleDisplayNameChange}
              placeholder={
                session?.user?.username ? 'Optional nickname' : 'Guest name'
              }
              className="max-w-sm"
            />
          </div>
          <PresenceList
            presence={presence}
            ownerId={ownerId}
            playerIds={playerIds}
            viewerId={viewerId}
          />
          <CampaignChat
            campaignId={id}
            messages={messages}
            eventLog={eventLog}
            viewerId={viewerId}
            displayName={displayName || session?.user.username || '???'}
            isGuest={isGuest}
          />
        </div>
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
