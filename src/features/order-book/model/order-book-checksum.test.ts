import { describe, expect, it } from "vitest";

import {
  buildOrderBookChecksumString,
  computeOrderBookChecksum,
  type OrderBookChecksumLevel,
  verifyOrderBookChecksum,
} from "./order-book-checksum";

describe("order-book-checksum", () => {
  const sampleBids: OrderBookChecksumLevel[] = [
    { price: "100", quantity: "10" },
    { price: "99", quantity: "5" },
  ];
  const sampleAsks: OrderBookChecksumLevel[] = [
    { price: "101", quantity: "5" },
    { price: "102", quantity: "20" },
  ];

  it("builds interleaved colon-separated string (bids then asks per index)", () => {
    const s = buildOrderBookChecksumString(sampleBids, sampleAsks, 10);
    // Sorted: bids desc [100,99], asks asc [101,102]. Interleave: bid0_p, bid0_q, ask0_p, ask0_q, bid1_p, bid1_q, ask1_p, ask1_q
    expect(s).toBe("100:10:101:5:99:5:102:20");
  });

  it("computeOrderBookChecksum returns unsigned 32-bit range", () => {
    const checksum = computeOrderBookChecksum(sampleBids, sampleAsks);
    expect(checksum).toBeGreaterThanOrEqual(0);
    expect(checksum).toBeLessThanOrEqual(2 ** 32 - 1);
    expect(Number.isInteger(checksum)).toBe(true);
  });

  it("verifyOrderBookChecksum passes when computed from same data", () => {
    const checksum = computeOrderBookChecksum(sampleBids, sampleAsks);
    expect(verifyOrderBookChecksum(sampleBids, sampleAsks, checksum)).toBe(true);
  });

  it("verifyOrderBookChecksum fails when expected checksum differs", () => {
    const wrongChecksum = 12345;
    const depth = 2;
    expect(verifyOrderBookChecksum(sampleBids, sampleAsks, wrongChecksum, depth)).toBe(false);
  });

  it("matches Python reference for one bid and one ask", () => {
    // bids=[{price:"100",quantity:"10"}], asks=[{price:"101",quantity:"5"}]
    // String = "100:10:101:5", CRC32 then & 0xffffffff
    const oneBid = [{ price: "100", quantity: "10" }];
    const oneAsk = [{ price: "101", quantity: "5" }];
    const s = buildOrderBookChecksumString(oneBid, oneAsk, 10);
    expect(s).toBe("100:10:101:5");

    const checksum = computeOrderBookChecksum(oneBid, oneAsk);
    // binascii.crc32("100:10:101:5".encode()) & 0xffffffff  =>  1910706556
    const expectedFromPython = 1910706556;
    expect(checksum).toBe(expectedFromPython);
  });
});
