import { str as crc32Str } from "crc-32";
import { CHECKSUM_DEPTH } from "./order-book.constants";

/** Convert signed 32-bit CRC from crc-32 to unsigned 32-bit (0..4_294_967_295) for comparison. */
function toUnsigned32(signed: number): number {
  return signed < 0 ? signed + 2 ** 32 : signed;
}

export interface OrderBookChecksumLevel {
  price: string;
  quantity: string;
}

export function buildOrderBookChecksumString(
  bids: OrderBookChecksumLevel[],
  asks: OrderBookChecksumLevel[],
  depth: number = CHECKSUM_DEPTH,
): string {
  const sortedBids = [...bids].sort(
    (a, b) => Number(BigInt(b.price) - BigInt(a.price)),
  );
  const sortedAsks = [...asks].sort(
    (a, b) => Number(BigInt(a.price) - BigInt(b.price)),
  );

  const bidLevels = sortedBids.slice(0, depth);
  const askLevels = sortedAsks.slice(0, depth);
  const maxLen = Math.max(bidLevels.length, askLevels.length);
  const parts: string[] = [];

  for (let i = 0; i < maxLen; i++) {
    const bid = bidLevels[i];
    const ask = askLevels[i];
    if (bid !== undefined) {
      parts.push(bid.price, bid.quantity);
    }
    if (ask !== undefined) {
      parts.push(ask.price, ask.quantity);
    }
  }

  return parts.join(":");
}

export function computeOrderBookChecksum(
  bids: OrderBookChecksumLevel[],
  asks: OrderBookChecksumLevel[],
  depth: number = CHECKSUM_DEPTH,
): number {
  const s = buildOrderBookChecksumString(bids, asks, depth);
  const signed = crc32Str(s);
  return toUnsigned32(signed);
}

export function verifyOrderBookChecksum(
  bids: OrderBookChecksumLevel[],
  asks: OrderBookChecksumLevel[],
  expectedChecksum: number,
  depth: number = CHECKSUM_DEPTH,
): boolean {
  if (bids.length < depth || asks.length < depth) {
    return true;
  }
  const computed = computeOrderBookChecksum(bids, asks, depth);
  return toUnsigned32(computed) === toUnsigned32(expectedChecksum);
}

export { CHECKSUM_DEPTH };
