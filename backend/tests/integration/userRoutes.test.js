import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

const authMock = jest.fn();
const createUserMock = jest.fn();
const deleteUserMock = jest.fn();
const getUserByIdMock = jest.fn();
const getUserNamesMock = jest.fn();
const getUsersMock = jest.fn();
const updateOwnProfileMock = jest.fn();
const updateUserMock = jest.fn();

authMock.mockImplementation(() => (req, res, next) => {
  req.user = { id: "admin-1", role: "admin" };
  next();
});

jest.unstable_mockModule("../../middleware/auth.js", () => ({
  auth: authMock,
}));

jest.unstable_mockModule("../../services/userService.js", () => ({
  createUser: createUserMock,
  deleteUser: deleteUserMock,
  getUserById: getUserByIdMock,
  getUserNames: getUserNamesMock,
  getUsers: getUsersMock,
  updateOwnProfile: updateOwnProfileMock,
  updateUser: updateUserMock,
}));

const { createApp } = await import("../../app.js");

describe("user routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/users liefert 201 mit Location Header", async () => {
    createUserMock.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      name: "Alice Example",
      email: "alice@example.com",
      role: "user",
    });

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", "Bearer token")
      .send({
        name: "Alice Example",
        email: "alice@example.com",
        password: "secret123",
      });

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe(
      "/api/users/507f1f77bcf86cd799439011",
    );
    expect(response.body.id).toBe("507f1f77bcf86cd799439011");
  });
});
