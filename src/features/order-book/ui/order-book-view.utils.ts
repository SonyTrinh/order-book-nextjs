import type {
  OrderBookLevel,
  OrderBookRowModel,
} from "@/features/order-book/types/order-book.types";

const BASE_UNDERLYING_DECIMALS = 18;

export const formatIntegerString = (value: string): string =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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

export const computeNotionalQuoteRaw = (price: string, quantity: string): string => {
  const p = toBigIntSafe(price);
  const q = toBigIntSafe(quantity);
  const scale = BigInt(10) ** BigInt(18);
  return ((p * q) / scale).toString();
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

export const formatCoinAmount = (
  raw: string,
  displayDecimals: number,
  underlyingDecimals: number = BASE_UNDERLYING_DECIMALS,
): string => {
  if (underlyingDecimals === 0) {
    return formatIntegerString(raw);
  }

  const value = toBigIntSafe(raw);
  const scale = BigInt(10) ** BigInt(underlyingDecimals);
  const integerPart = value / scale;
  const fractionalPart = value % scale;

  if (displayDecimals <= 0) {
    return formatIntegerString(integerPart.toString());
  }

  const fractionalStringFull = fractionalPart.toString().padStart(underlyingDecimals, "0");
  const fractionalString = fractionalStringFull.slice(0, displayDecimals).replace(/0+$/, "");
  const integerFormatted = formatIntegerString(integerPart.toString());

  if (!fractionalString) {
    return integerFormatted;
  }

  return `${integerFormatted}.${fractionalString}`;
};

export const getDisplayDecimalsFromStepSize = (stepSize: string): number => {
  const normalized = stepSize.trim();

  if (!/^10*$/.test(normalized)) {
    return 4;
  }

  const exponent = normalized.length - 1;
  const decimals = BASE_UNDERLYING_DECIMALS - exponent;

  if (decimals < 0) {
    return 0;
  }

  if (decimals > BASE_UNDERLYING_DECIMALS) {
    return BASE_UNDERLYING_DECIMALS;
  }

  return decimals;
};
