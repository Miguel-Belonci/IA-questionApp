import request from "supertest";

process.env.JWT_SECRET = "integration-test-secret";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.DB_DIALECT = "sqlite";
process.env.SQLITE_STORAGE = ":memory:";
delete process.env.DATABASE_URL;

const { default: app } = await import("../../src/app.js");
const { Room, sequelize, User } = await import("../../src/models/index.js");

async function registerUser(overrides = {}) {
  const stamp = `${Date.now()}-${Math.random()}`;
  const payload = {
    name: "Test User",
    email: `user-${stamp}@example.com`,
    password: "123456",
    ...overrides,
  };

  const response = await request(app).post("/api/auth/register").send(payload);
  return { ...response.body, payload };
}

describe("API integration", () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("registers the first user as admin and prevents inactive users from logging in", async () => {
    const adminResponse = await request(app)
      .post("/api/auth/register")
      .send({ name: "Admin", email: "admin@example.com", password: "123456" })
      .expect(201);

    expect(adminResponse.body.user.role).toBe("admin");

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Inactive",
        email: "inactive@example.com",
        password: "123456",
      })
      .expect(201);

    const inactiveUser = await User.findOne({
      where: { email: "inactive@example.com" },
    });
    inactiveUser.active = false;
    await inactiveUser.save();

    await request(app)
      .post("/api/auth/login")
      .send({ email: "inactive@example.com", password: "123456" })
      .expect(403);
  });

  it("requires the room password to manage questions and rooms", async () => {
    const admin = await registerUser({
      name: "Owner",
      email: "owner@example.com",
    });
    const auth = { Authorization: `Bearer ${admin.token}` };

    const roomResponse = await request(app)
      .post("/api/rooms")
      .set(auth)
      .send({ name: "Live Q&A", password: "12345" })
      .expect(201);

    const questionResponse = await request(app)
      .post("/api/questions")
      .set(auth)
      .send({ roomCode: roomResponse.body.room.code, text: "Can we ship it?" })
      .expect(201);

    await request(app)
      .patch(`/api/questions/${questionResponse.body.question.id}/read`)
      .set(auth)
      .send({ roomPassword: "00000" })
      .expect(403);

    const readResponse = await request(app)
      .patch(`/api/questions/${questionResponse.body.question.id}/read`)
      .set(auth)
      .send({ roomPassword: "12345" })
      .expect(200);

    expect(readResponse.body.question.read).toBe(true);

    await request(app)
      .delete(`/api/rooms/${roomResponse.body.room.code}`)
      .set(auth)
      .send({ roomPassword: "12345" })
      .expect(204);

    const deletedRoom = await Room.findOne({
      where: { code: roomResponse.body.room.code },
    });
    expect(deletedRoom).toBeNull();
  });

  it("lets admins list users and rooms but never deactivate admin accounts", async () => {
    const admin = await registerUser({
      name: "Admin",
      email: "admin@example.com",
    });
    const auth = { Authorization: `Bearer ${admin.token}` };

    await request(app)
      .post("/api/rooms")
      .set(auth)
      .send({ name: "Admin room", password: "12345" })
      .expect(201);

    const usersResponse = await request(app)
      .get("/api/admin/users")
      .set(auth)
      .expect(200);
    expect(usersResponse.body.users).toHaveLength(1);

    const roomsResponse = await request(app)
      .get("/api/admin/rooms")
      .set(auth)
      .expect(200);
    expect(roomsResponse.body.rooms[0]).toMatchObject({
      name: "Admin room",
      questionsCount: 0,
    });

    await request(app)
      .patch(`/api/admin/users/${admin.user.id}/status`)
      .set(auth)
      .send({ active: false })
      .expect(400);
  });
});
