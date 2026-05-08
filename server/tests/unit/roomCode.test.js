import { generateRoomCode } from "../../src/utils/roomCode.js";

describe("generateRoomCode", () => {
  it("creates a six character uppercase room code", () => {
    const code = generateRoomCode();

    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });
});
