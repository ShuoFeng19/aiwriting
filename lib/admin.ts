import { timingSafeEqual } from "node:crypto";

export function isAdminPasswordValid(value: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof value !== "string") return false;

  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
