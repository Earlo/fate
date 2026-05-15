'use client';
import Button from '@/components/generic/button';
import Input from '@/components/generic/input';
import { buildFudgeRoll } from '@/lib/fateDice';
import type { ChatMessage, LogEntry, Roll } from '@/lib/realtime/campaignTypes';
import { useMemo, useState } from 'react';
import MessageBox from '../generic/chat/messageBox';
import RollMessage, { PrivateBadge } from './rollMessage';

type CampaignChatProps = {
  campaignId: string;
  messages: ChatMessage[];
  eventLog: LogEntry[];
  viewerId: string;
  displayName: string;
  isGuest: boolean;
};

const formatTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const CampaignChat = ({
  campaignId,
  messages,
  eventLog,
  viewerId,
  displayName,
  isGuest,
}: CampaignChatProps) => {
  const [chatInput, setChatInput] = useState('');
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);

  const sender = useMemo(
    () => ({
      id: viewerId,
      name: displayName,
      guest: isGuest,
    }),
    [displayName, isGuest, viewerId],
  );

  const sendChatMessage = async (
    text: string,
    kind: 'chat' | 'roll',
    roll?: Roll,
  ) => {
    await fetch(`/api/campaigns/${campaignId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, kind, roll, sender }),
    });
  };

  const handleChatSubmit = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setChatInput('');
    await sendChatMessage(trimmed, 'chat');
  };

  const rollFudgeDice = async () => {
    const { dice, total, text } = buildFudgeRoll();
    await sendChatMessage(text, 'roll', { dice, total });
  };

  const rollPrivateFudgeDice = () => {
    const { dice, total, text } = buildFudgeRoll();
    setPrivateMessages((prev) => [
      ...prev,
      {
        campaignId,
        text,
        createdAt: new Date().toISOString(),
        sender,
        kind: 'roll',
        roll: { dice, total },
        private: true,
      },
    ]);
  };

  const chatTimeline: ChatMessage[] = useMemo(() => {
    const combined = [...messages, ...privateMessages];
    return combined.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messages, privateMessages]);

  const eventLogItems = eventLog.map((entry, index) => (
    <div key={`${entry.createdAt}-${index}`} className="pb-1">
      <span className="text-gray-400">{formatTime(entry.createdAt)}</span>{' '}
      <span className="wrap-break-word">{entry.text}</span>
    </div>
  ));

  const chatItems = chatTimeline.map((msg, index) => {
    const from = msg.sender?.name || (msg.sender?.guest ? 'Guest' : 'Someone');
    return (
      <div
        key={`${msg.createdAt}-${index}`}
        className="flex flex-col gap-1 rounded px-1 pb-1"
      >
        <div className="flex flex-wrap items-baseline gap-1">
          <span className="truncate font-semibold">{from}</span>
          <span className="text-gray-400">- {formatTime(msg.createdAt)}</span>
        </div>
        {msg.roll ? (
          <RollMessage
            text={msg.text}
            roll={msg.roll}
            isPrivate={!!msg.private}
          />
        ) : (
          <span className="wrap-break-word">
            {msg.text}
            {!!msg.private && <PrivateBadge />}
          </span>
        )}
      </div>
    );
  });
  return (
    <>
      <MessageBox title="chat">{chatItems}</MessageBox>
      <div className="mt-2 flex flex-wrap gap-2">
        <Input
          name="chat-message"
          value={chatInput}
          placeholder="Say something..."
          onChange={(event) => setChatInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void handleChatSubmit();
            }
          }}
          className="h-9 flex-1"
        />
        <Button
          label="Send"
          onClick={handleChatSubmit}
          className="h-9 px-3 text-xs"
        />
        <Button
          label="Roll 4dF"
          onClick={rollFudgeDice}
          className="h-9 px-3 text-xs"
        />
        <Button
          label="Private Roll"
          onClick={rollPrivateFudgeDice}
          className="h-9 px-3 text-xs"
        />
      </div>
      <MessageBox title="Event log">{eventLogItems}</MessageBox>
    </>
  );
};

export default CampaignChat;
