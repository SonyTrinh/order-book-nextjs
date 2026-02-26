export const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const toNumberArray = (value: string | undefined, fallback: number[]): number[] => {
  if (!value) {
    return fallback;
  }

  const parsed = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);

  return parsed.length > 0 ? parsed : fallback;
};
