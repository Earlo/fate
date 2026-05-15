import {
  formatSignedRoll,
  getFudgeDieClassName,
  getFudgeDieFace,
  getRollBadgeStyle,
} from '@/lib/fateDice';
import { Roll } from '@/lib/realtime/campaignTypes';

type RollMessageProps = {
  text?: string;
  roll: Roll;
  isPrivate?: boolean;
};

const RollBadge = ({
  value,
  glowSize = 'large',
}: {
  value: number;
  glowSize?: 'small' | 'large';
}) => {
  const style = getRollBadgeStyle(value);
  const boxShadow =
    glowSize === 'small'
      ? `0 0 10px rgba(0,0,0,0.35), 0 0 12px ${style.glow}, 0 0 22px ${style.glow}`
      : `0 0 12px rgba(0,0,0,0.4), 0 0 16px ${style.glow}, 0 0 28px ${style.glow}`;

  return (
    <span
      className="rounded px-2 py-0.5 text-sm font-semibold text-white"
      style={{ backgroundColor: style.backgroundColor, boxShadow }}
    >
      {formatSignedRoll(value)}
    </span>
  );
};

const PrivateBadge = () => (
  <span className="rounded bg-slate-500/40 px-1.5 py-0.5 text-[10px] tracking-wide text-slate-100 uppercase">
    [Private]
  </span>
);

const RollMessage = ({ text, roll, isPrivate = false }: RollMessageProps) => {
  return (
    <div className="flex flex-col gap-1 font-mono">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-gray-400">4dF</span>
        {typeof roll.bonus === 'number' && (
          <>
            <RollBadge value={roll.bonus} glowSize="small" />
            <span className="text-gray-400">+</span>
          </>
        )}
        <div className="flex gap-1">
          {roll.dice.map((die, dieIndex) => (
            <span
              key={dieIndex}
              className={`inline-flex h-6 w-6 items-center justify-center rounded border border-gray-600 bg-gray-900 ${getFudgeDieClassName(
                die,
              )}`}
            >
              {getFudgeDieFace(die)}
            </span>
          ))}
        </div>
        <span className="text-gray-400">=</span>
        <RollBadge value={roll.total} />
        {isPrivate && <PrivateBadge />}
      </div>
      {text && <span className="text-gray-300">{text}</span>}
    </div>
  );
};

export { PrivateBadge };
export default RollMessage;
