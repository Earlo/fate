'use client';
import Group from '@/components/dashboard/group';
import Button from '@/components/generic/button';
import Icon from '@/components/generic/icon/icon';
import Input from '@/components/generic/input';
import LabeledInput from '@/components/generic/labeledInput';
import LoadingSpinner from '@/components/generic/loadingSpinner';
import BaseLayout from '@/components/layout/baseLayout';
import AspectInput from '@/components/sheet/aspectInput';
import NoteInput from '@/components/sheet/noteInput';
import useDebounce from '@/hooks/useDebounce';
import { useCampaign } from '@/hooks/useFate';
import { buildFudgeRoll } from '@/lib/fateDice';
import { ChatMessage } from '@/lib/realtime/campaignTypes';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';

interface CampaignProps {
  id: string;
}

type PrivateRollMessage = {
  campaignId?: string;
  message: string;
  createdAt: string;
  sender?: { id?: string; name?: string; guest?: boolean };
  kind: 'private-roll';
  roll: { dice: number[]; total: number; bonus?: number };
  private: true;
};

type ChatMessageView = ChatMessage | PrivateRollMessage;

const Campaign: FC<CampaignProps> = ({ id }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [displayName, setDisplayName] = useState('');
  const debouncedDisplayName = useDebounce(displayName, 600);
  const {
    campaign,
    isLoading,
    presence,
    chatMessages,
    eventLog,
    viewerId,
    viewerIsGuest,
    toggleCampaign,
    addGroup,
    updateGroup,
    addNote,
    deleteNote,
    updateNote,
  } = useCampaign(id, {
    id: session?.user?.id,
    username: debouncedDisplayName || session?.user?.username,
  });

  const isAdmin = !!session?.user.admin || campaign?.owner === session?.user.id;
  const isPlayer =
    campaign &&
    session?.user.id &&
    campaign.visibleTo.includes(session.user.id);
  const ownerId = campaign?.owner;
  const playerIds = campaign?.visibleTo ?? [];
  let guestCounter = 0;
  const [chatInput, setChatInput] = useState('');
  const [privateChatMessages, setPrivateChatMessages] = useState<
    PrivateRollMessage[]
  >([]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const eventLogRef = useRef<HTMLDivElement | null>(null);
  const [chatAtBottom, setChatAtBottom] = useState(true);
  const [eventLogAtBottom, setEventLogAtBottom] = useState(true);

  useEffect(() => {
    if (!id) return;
    if (typeof window === 'undefined') return;
    const storageKey = `campaign-display-name-${id}`;
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored) {
      setDisplayName(stored);
      return;
    }
    if (session?.user?.username) {
      setDisplayName(session.user.username);
    }
  }, [id, session?.user?.username]);

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

  const sendChatMessage = async (
    message: string,
    kind: 'chat' | 'roll',
    roll?: { dice: number[]; total: number; bonus?: number },
  ) => {
    if (!message.trim()) return;
    try {
      await fetch(`/api/campaigns/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          kind,
          roll,
          sender: {
            id: viewerId,
            name: displayName || session?.user?.username,
            guest: viewerIsGuest,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to send chat message', error);
    }
  };

  const handleChatSubmit = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setChatInput('');
    await sendChatMessage(trimmed, 'chat');
  };

  const rollFudgeDice = async () => {
    const { dice, total, message } = buildFudgeRoll();
    await sendChatMessage(message, 'roll', { dice, total });
  };

  const rollPrivateFudgeDice = () => {
    const { dice, total, message } = buildFudgeRoll();
    const createdAt = new Date().toISOString();
    setPrivateChatMessages((prev) => [
      ...prev,
      {
        campaignId: id,
        message,
        createdAt,
        sender: {
          id: viewerId,
          name: displayName || session?.user?.username,
          guest: viewerIsGuest,
        },
        kind: 'private-roll',
        roll: { dice, total },
        private: true,
      },
    ]);
  };

  const blend = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16).padStart(2, '0');
    return hex;
  };
  const mixColor = (
    from: [number, number, number],
    to: [number, number, number],
    t: number,
  ) => {
    const tt = clamp01(t);
    return `#${toHex(blend(from[0], to[0], tt))}${toHex(
      blend(from[1], to[1], tt),
    )}${toHex(blend(from[2], to[2], tt))}`;
  };

  const rollBadgeStyle = (value: number) => {
    const stops = [
      { value: -6, color: [127, 29, 29] as [number, number, number] }, // red-900
      { value: -1, color: [185, 64, 64] as [number, number, number] }, // red-400-ish
      { value: 0, color: [107, 114, 128] as [number, number, number] }, // gray-500
      { value: 3, color: [5, 150, 105] as [number, number, number] }, // green-600
      { value: 8, color: [217, 149, 21] as [number, number, number] }, // regal gold
      { value: 15, color: [126, 34, 206] as [number, number, number] }, // purple-700
    ];
    if (value <= stops[0].value) {
      const color = `#${toHex(stops[0].color[0])}${toHex(
        stops[0].color[1],
      )}${toHex(stops[0].color[2])}`;
      return { backgroundColor: color, glow: color };
    }
    if (value >= stops[stops.length - 1].value) {
      const last = stops[stops.length - 1].color;
      const color = `#${toHex(last[0])}${toHex(last[1])}${toHex(last[2])}`;
      return { backgroundColor: color, glow: color };
    }
    for (let i = 0; i < stops.length - 1; i += 1) {
      const current = stops[i];
      const next = stops[i + 1];
      if (value >= current.value && value <= next.value) {
        const t = (value - current.value) / (next.value - current.value || 1);
        const color = mixColor(current.color, next.color, t);
        return { backgroundColor: color, glow: color };
      }
    }
    return { backgroundColor: '#1f2937', glow: '#1f2937' };
  };

  const isAtBottom = (element: HTMLDivElement | null) => {
    if (!element) return true;
    const threshold = 12;
    return (
      element.scrollHeight - element.scrollTop - element.clientHeight <=
      threshold
    );
  };

  const scrollToBottom = (element: HTMLDivElement | null) => {
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  };

  useEffect(() => {
    if (chatAtBottom) {
      scrollToBottom(chatRef.current);
    }
  }, [chatMessages, privateChatMessages, chatAtBottom]);

  useEffect(() => {
    if (eventLogAtBottom) {
      scrollToBottom(eventLogRef.current);
    }
  }, [eventLog, eventLogAtBottom]);

  const chatTimeline: ChatMessageView[] = useMemo(() => {
    const combined = [...chatMessages, ...privateChatMessages];
    return combined.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [chatMessages, privateChatMessages]);

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
          <div className="text-sm text-gray-200">
            <div className="mb-2 font-semibold">
              Viewing now ({presence.length}):
            </div>
            {presence.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {presence.map((viewer) => {
                  const isOwner = viewer.userId && viewer.userId === ownerId;
                  const isPlayer =
                    viewer.userId && playerIds.includes(viewer.userId);
                  const isGuest = viewer.guest;
                  const label =
                    viewer.username ||
                    (isGuest ? `Guest ${++guestCounter}` : viewer.userId);
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
                      {isPlayer && !isOwner && (
                        <span className="text-[10px] text-gray-400">
                          Player
                        </span>
                      )}
                      {isOwner && (
                        <span className="text-[10px] text-gray-400">Owner</span>
                      )}
                      {isGuest && (
                        <span className="text-[10px] text-gray-400">Guest</span>
                      )}
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
          <div className="mt-5">
            <div className="mb-2 text-sm font-semibold text-gray-200">Chat</div>
            <div className="relative">
              <div
                ref={chatRef}
                className="h-40 max-h-[60vh] min-h-32 resize-y overflow-y-auto rounded border border-gray-700 bg-gray-900/40 p-2 pb-8 text-xs text-gray-200"
                onScroll={() => setChatAtBottom(isAtBottom(chatRef.current))}
              >
                {chatTimeline.length > 0 ? (
                  chatTimeline.map((message, index) => {
                    const time = new Date(message.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    );
                    const sender =
                      message.sender?.name ||
                      (message.sender?.guest ? 'Guest' : 'Someone');
                    const isRoll =
                      message.kind !== 'chat' && Boolean(message.roll);
                    const isPrivate = message.kind === 'private-roll';
                    return (
                      <div
                        key={`${message.createdAt}-${index}`}
                        className="flex flex-col gap-1 rounded px-1 pb-1"
                      >
                        <div className="flex flex-wrap items-baseline gap-1">
                          <span className="truncate font-semibold">
                            {sender}
                          </span>
                          <span className="text-gray-400">- {time}</span>
                        </div>
                        {isRoll ? (
                          <div className="flex flex-col gap-1 font-mono">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-gray-400">4dF</span>
                              {typeof message.roll?.bonus === 'number' && (
                                <>
                                  {(() => {
                                    const style = rollBadgeStyle(
                                      message.roll.bonus,
                                    );
                                    return (
                                      <span
                                        className="rounded px-2 py-0.5 text-sm font-semibold text-white"
                                        style={{
                                          backgroundColor:
                                            style.backgroundColor,
                                          boxShadow: `0 0 10px rgba(0,0,0,0.35), 0 0 12px ${style.glow}, 0 0 22px ${style.glow}`,
                                        }}
                                      >
                                        {message.roll.bonus >= 0
                                          ? `+${message.roll.bonus}`
                                          : message.roll.bonus}
                                      </span>
                                    );
                                  })()}
                                  <span className="text-gray-400">+</span>
                                </>
                              )}
                              <div className="flex gap-1">
                                {message.roll?.dice.map((die, dieIndex) => {
                                  const face =
                                    die === 1 ? '+' : die === -1 ? '-' : '0';
                                  const glow =
                                    die === 1
                                      ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                                      : die === -1
                                        ? 'text-rose-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                                        : 'text-gray-300';
                                  return (
                                    <span
                                      key={`${message.createdAt}-${dieIndex}`}
                                      className={`inline-flex h-6 w-6 items-center justify-center rounded border border-gray-600 bg-gray-900 ${glow}`}
                                    >
                                      {face}
                                    </span>
                                  );
                                })}
                              </div>
                              <span className="text-gray-400">=</span>
                              {(() => {
                                const style = rollBadgeStyle(
                                  message.roll?.total ?? 0,
                                );
                                return (
                                  <span
                                    className="rounded px-2 py-0.5 text-sm font-semibold text-white"
                                    style={{
                                      backgroundColor: style.backgroundColor,
                                      boxShadow: `0 0 12px rgba(0,0,0,0.4), 0 0 16px ${style.glow}, 0 0 28px ${style.glow}`,
                                    }}
                                  >
                                    {(message.roll?.total ?? 0) >= 0
                                      ? `+${message.roll?.total ?? 0}`
                                      : (message.roll?.total ?? 0)}
                                  </span>
                                );
                              })()}
                              {isPrivate && (
                                <span className="rounded bg-slate-500/40 px-1.5 py-0.5 text-[10px] tracking-wide text-slate-100 uppercase">
                                  [Private]
                                </span>
                              )}
                            </div>
                            {message.message && (
                              <span className="text-gray-300">
                                {message.message}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="wrap-break-word">
                            {message.message}
                            {isPrivate && (
                              <span className="ml-2 rounded bg-slate-500/40 px-1.5 py-0.5 text-[10px] tracking-wide text-slate-100 uppercase">
                                [Private]
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-400">No messages yet.</div>
                )}
              </div>
              {!chatAtBottom && (
                <button
                  type="button"
                  onClick={() => scrollToBottom(chatRef.current)}
                  className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-200 shadow hover:bg-gray-700"
                  title="Jump to latest"
                >
                  <Icon icon="chevronDown" className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Input
                name="chat-message"
                value={chatInput}
                placeholder="Say something..."
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleChatSubmit();
                  }
                }}
                className="h-9 flex-1"
              />
              <Button
                label="Send"
                type="button"
                onClick={handleChatSubmit}
                className="h-9 px-3 text-xs"
              />
              <Button
                label="Roll 4dF"
                type="button"
                onClick={rollFudgeDice}
                className="h-9 px-3 text-xs"
              />
              <Button
                label="Private Roll"
                type="button"
                onClick={rollPrivateFudgeDice}
                className="h-9 px-3 text-xs"
              />
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 text-sm font-semibold text-gray-200">
              Event log
            </div>
            <div className="relative">
              <div
                ref={eventLogRef}
                className="h-40 max-h-[60vh] min-h-32 resize-y overflow-y-auto rounded border border-gray-700 bg-gray-900/40 p-2 pb-8 text-xs text-gray-200"
                onScroll={() =>
                  setEventLogAtBottom(isAtBottom(eventLogRef.current))
                }
              >
                {eventLog.length > 0 ? (
                  eventLog.map((entry, index) => {
                    const time = new Date(entry.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    );
                    return (
                      <div key={`${entry.createdAt}-${index}`} className="pb-1">
                        <span className="text-gray-400">{time}</span>{' '}
                        <span className="wrap-break-word">{entry.message}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-400">No events yet.</div>
                )}
              </div>
              {!eventLogAtBottom && (
                <button
                  type="button"
                  onClick={() => scrollToBottom(eventLogRef.current)}
                  className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-200 shadow hover:bg-gray-700"
                  title="Jump to latest"
                >
                  <Icon icon="chevronDown" className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
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
