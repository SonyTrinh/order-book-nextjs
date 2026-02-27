import type {
  OrderBookLevel,
  OrderBookRowModel,
} from "@/features/order-book/types/order-book.types";

const COMPACT_SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export const formatIntegerString = (value: string): string =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatCompactIntegerString = (value: string): string => {
  const normalized = value.trim();
  const isNegative = normalized.startsWith("-");
  const unsigned = isNegative ? normalized.slice(1) : normalized;

  if (!/^\d+$/.test(unsigned)) {
    return value;
  }

  const digits = unsigned.replace(/^0+(?=\d)/, "");
  const groupIndex = Math.floor((digits.length - 1) / 3);
  const suffix = COMPACT_SUFFIXES[groupIndex];

  if (!suffix) {
    return `${isNegative ? "-" : ""}${formatIntegerString(digits)}`;
  }

  const integerDigits = digits.length - groupIndex * 3;
  const integerPart = digits.slice(0, integerDigits);
  const fractionalPartRaw = digits.slice(integerDigits, integerDigits + 2);
  const fractionalPart = fractionalPartRaw.replace(/0+$/, "");
  const compact = fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;

  return `${isNegative ? "-" : ""}${compact}${suffix}`;
};

export const toBigIntSafe = (value: string): bigint => {
  try {
    return BigInt(value);
  } catch {
    return BigInt(0);
  }
};

export const formatTimestamp = (timestamp: string): string => {
  const milliseconds = Number(toBigIntSafe(timestamp) / BigInt(1_000_000));
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString();
};

export const toRows = (levels: OrderBookLevel[]): OrderBookRowModel[] => {
  let cumulative = BigInt(0);

  return levels.map((level) => {
    cumulative += toBigIntSafe(level.quantity);

    return {
      ...level,
      cumulativeQuantity: cumulative,
    };
  });
};
