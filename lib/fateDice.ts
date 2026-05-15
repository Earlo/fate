export const buildFudgeRoll = () => {
  const dice = Array.from({ length: 4 }, () => {
    const roll = Math.floor(Math.random() * 3) - 1;
    return roll;
  });
  const total = dice.reduce((sum, value) => sum + value, 0);
  const faces = dice.map((value) =>
    value === 1 ? '+' : value === -1 ? '-' : '0',
  );
  const totalLabel = total >= 0 ? `+${total}` : `${total}`;
  const text = `Rolled 4dF: ${faces.join(' ')} = ${totalLabel}`;
  return { dice, total, text };
};

const blend = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const toHex = (value: number) =>
  Math.round(value).toString(16).padStart(2, '0');

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

export const formatSignedRoll = (value: number) =>
  value >= 0 ? `+${value}` : `${value}`;

export const getFudgeDieFace = (value: number) =>
  value === 1 ? '+' : value === -1 ? '-' : '0';

export const getFudgeDieClassName = (value: number) =>
  value === 1
    ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]'
    : value === -1
      ? 'text-rose-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]'
      : 'text-gray-300';

export const getRollBadgeStyle = (value: number) => {
  const stops = [
    { value: -6, color: [127, 29, 29] as [number, number, number] },
    { value: -1, color: [185, 64, 64] as [number, number, number] },
    { value: 0, color: [107, 114, 128] as [number, number, number] },
    { value: 3, color: [5, 150, 105] as [number, number, number] },
    { value: 8, color: [217, 149, 21] as [number, number, number] },
    { value: 15, color: [126, 34, 206] as [number, number, number] },
  ];

  if (value <= stops[0].value) {
    const color = mixColor(stops[0].color, stops[0].color, 0);
    return { backgroundColor: color, glow: color };
  }

  if (value >= stops[stops.length - 1].value) {
    const last = stops[stops.length - 1].color;
    const color = mixColor(last, last, 0);
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
