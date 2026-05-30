'use client';
import CampaignChat from '@/components/campaign/campaignChat';
import Group from '@/components/campaign/group';
import PresenceList from '@/components/campaign/presenceList';
import Button from '@/components/generic/button';
import LabeledInput from '@/components/generic/labeledInput';
import AspectInput from '@/components/sheet/aspectInput';
import NoteInput from '@/components/sheet/noteInput';
import useDebounce from '@/hooks/useDebounce';
import { useCampaign } from '@/hooks/useFate';
import { PopulatedCampaignT } from '@/schemas/campaign';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ChangeEvent, FC, useEffect, useState } from 'react';

interface CampaignProps {
  campaign: PopulatedCampaignT;
}

const Campaign: FC<CampaignProps> = ({ campaign: initialCampaign }) => {
  const { id } = initialCampaign;
  const { data: session } = useSession();
  const storageKey = `campaign-display-name-${id}`;
  const [isMounted, setIsMounted] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const activeSession = isMounted ? session : null;
  const debouncedDisplayName = useDebounce(displayName, 600);
  const {
    campaign,
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
  } = useCampaign(initialCampaign, {
    id: activeSession?.user.id,
    username: debouncedDisplayName || activeSession?.user?.username,
  });
  const isAdmin =
    !!activeSession?.user.admin || campaign.owner === activeSession?.user.id;
  const isPlayer =
    activeSession?.user.id &&
    campaign.visibleTo.includes(activeSession.user.id);
  const ownerId = campaign.owner;
  const playerIds = campaign.visibleTo;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDisplayName(window.sessionStorage.getItem(storageKey) ?? '');
      setIsMounted(true);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [storageKey]);

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

  return (
    <>
      <h1 className="pb-6 text-center text-4xl font-bold sm:text-5xl">
        {campaign.name}
        {activeSession && !isAdmin && (
          <Button
            label={isPlayer ? 'Leave Campaign' : 'Join Campaign'}
            onClick={() => toggleCampaign(activeSession.user.id)}
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
              className="w-full pl-4 sm:w-8/12"
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
                activeSession?.user?.username
                  ? 'Optional nickname'
                  : 'Guest name'
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
            displayName={displayName || activeSession?.user.username || '???'}
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
