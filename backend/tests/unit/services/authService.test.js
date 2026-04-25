import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const compareMock = jest.fn();
const signMock = jest.fn();
const findOneMock = jest.fn();
const findByIdMock = jest.fn();

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: compareMock,
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: signMock,
  },
}));

jest.unstable_mockModule("../../../models/User.js", () => ({
  default: {
    findOne: findOneMock,
    findById: findByIdMock,
  },
}));

const { getCurrentUser, loginUser } = await import("../../../services/authService.js");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ISSUER = "zeiterfassung-api";
    process.env.JWT_AUDIENCE = "zeiterfassung-client";
  });

  it("meldet einen Benutzer erfolgreich an", async () => {
    findOneMock.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "user-1",
        name: "Alice",
        role: "admin",
        department: "IT",
        password_hash: "hashed",
        is_active: true,
        vacation_days_per_year: 30,
      }),
    });
    compareMock.mockResolvedValue(true);
    signMock.mockReturnValue("jwt-token");

    const result = await loginUser({ name: " Alice ", password: "secret123" });

    expect(findOneMock).toHaveBeenCalledWith({
      $or: [{ name: "Alice" }, { email: "alice" }],
    });
    expect(compareMock).toHaveBeenCalledWith("secret123", "hashed");
    expect(signMock).toHaveBeenCalledWith(
      { id: "user-1", role: "admin" },
      "test-secret",
      expect.objectContaining({
        algorithm: "HS256",
        issuer: "zeiterfassung-api",
        audience: "zeiterfassung-client",
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        token: "jwt-token",
        user: expect.objectContaining({
          id: "user-1",
          name: "Alice",
          role: "admin",
        }),
      }),
    );
  });

  it("bricht bei ungueltigen Login-Daten mit 400 ab", async () => {
    await expect(loginUser({ name: " ", password: "" })).rejects.toMatchObject({
      status: 400,
      message: "Name oder E-Mail und Passwort sind erforderlich",
    });
  });

  it("bricht bei unbekanntem Benutzer mit 401 ab", async () => {
    findOneMock.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(loginUser({ name: "Bob", password: "secret123" })).rejects.toMatchObject({
      status: 401,
      message: "Login fehlgeschlagen",
    });
  });

  it("bricht bei inaktivem Benutzer mit 403 ab", async () => {
    findOneMock.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "user-2",
        password_hash: "hashed",
        is_active: false,
      }),
    });

    await expect(loginUser({ name: "Bob", password: "secret123" })).rejects.toMatchObject({
      status: 403,
      message: "Benutzerkonto ist inaktiv",
    });
  });

  it("laedt den aktuellen Benutzer", async () => {
    const leanMock = jest.fn().mockResolvedValue({
      _id: "user-3",
      name: "Charlie",
      role: "user",
      department: "HR",
      is_active: true,
      vacation_days_per_year: 25,
    });
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    findByIdMock.mockReturnValue({ select: selectMock });

    const result = await getCurrentUser("user-3");

    expect(findByIdMock).toHaveBeenCalledWith("user-3");
    expect(selectMock).toHaveBeenCalled();
    expect(result.user).toEqual(
      expect.objectContaining({
        id: "user-3",
        name: "Charlie",
        role: "user",
      }),
    );
  });

  it("liefert 404, wenn /me keinen Benutzer findet", async () => {
    const leanMock = jest.fn().mockResolvedValue(null);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    findByIdMock.mockReturnValue({ select: selectMock });

    await expect(getCurrentUser("missing-user")).rejects.toMatchObject({
      status: 404,
      message: "Benutzer nicht gefunden",
    });
  });
});
