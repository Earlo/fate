import Icon from '@/components/generic/icon/icon';
import type { PresenceEntry } from '@/lib/realtime/campaignTypes';

type PresenceListProps = {
  presence: PresenceEntry[];
  ownerId?: string;
  playerIds: string[];
  viewerId: string;
};

const PresenceList = ({
  presence,
  ownerId,
  playerIds,
  viewerId,
}: PresenceListProps) => {
  let guestCounter = 0;
  return (
    <div className="text-sm text-gray-200">
      <div className="mb-2 font-semibold">Viewing now ({presence.length}):</div>
      {presence.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {presence.map((viewer) => {
            const isOwner = viewer.id && viewer.id === ownerId;
            const isPlayer = viewer.id && playerIds.includes(viewer.id);
            const isGuest = viewer.guest;
            const label =
              viewer.username ||
              (isGuest ? `Guest ${++guestCounter}` : viewer.id);
            const isSelf = viewer.id === viewerId;
            const icon = isOwner ? 'crown' : isGuest ? 'userX' : 'user';

            return (
              <span
                key={viewer.id}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                  isSelf ? 'bg-blue-800 text-white' : 'bg-gray-800'
                }`}
              >
                <Icon icon={icon} className="h-4 w-4 text-gray-300" />
                {label}
                <span className="text-[10px] text-gray-400">
                  {isPlayer && !isOwner && 'Player'}
                  {isOwner && 'Owner'}
                  {isGuest && 'Guest'}
                </span>
              </span>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-400">
          {viewerId ? 'Just you' : 'No one else'}
        </div>
      )}
    </div>
  );
};

export default PresenceList;
