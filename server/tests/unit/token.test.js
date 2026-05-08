import jwt from "jsonwebtoken";
import { signToken } from "../../src/utils/token.js";

describe("signToken", () => {
  it("signs the user id as JWT subject and keeps the role in payload", () => {
    process.env.JWT_SECRET = "unit-test-secret";

    const token = signToken({ id: 42, role: "admin" });
    const payload = jwt.verify(token, "unit-test-secret");

    expect(payload.sub).toBe("42");
    expect(payload.role).toBe("admin");
  });
});
