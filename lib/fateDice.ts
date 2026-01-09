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
  const message = `Rolled 4dF: ${faces.join(' ')} = ${totalLabel}`;
  return { dice, total, message };
};
