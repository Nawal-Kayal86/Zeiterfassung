import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const verifyMock = jest.fn();
const findByIdMock = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: verifyMock,
  },
}));

jest.unstable_mockModule("../../../models/User.js", () => ({
  default: {
    findById: findByIdMock,
  },
}));

const { auth } = await import("../../../middleware/auth.js");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("auth middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ISSUER = "zeiterfassung-api";
    process.env.JWT_AUDIENCE = "zeiterfassung-client";
  });

  it("liefert 401 ohne Authorization Header", async () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = jest.fn();

    await auth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Kein Token vorhanden", status: 401 });
    expect(next).not.toHaveBeenCalled();
  });

  it("liefert 401 bei ungueltigem Token", async () => {
    const req = { headers: { authorization: "Bearer invalid" } };
    const res = createResponse();
    const next = jest.fn();
    verifyMock.mockImplementation(() => {
      throw new Error("bad token");
    });

    await auth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Ungueltiges Token", status: 401 });
  });

  it("setzt req.user und ruft next bei gueltigem Token", async () => {
    const leanMock = jest.fn().mockResolvedValue({
      _id: "user-1",
      role: "admin",
      is_active: true,
    });
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    findByIdMock.mockReturnValue({ select: selectMock });
    verifyMock.mockReturnValue({ id: "user-1", role: "admin" });

    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = createResponse();
    const next = jest.fn();

    await auth("admin")(req, res, next);

    expect(verifyMock).toHaveBeenCalledWith(
      "valid-token",
      "test-secret",
      expect.objectContaining({
        algorithms: ["HS256"],
        issuer: "zeiterfassung-api",
        audience: "zeiterfassung-client",
      }),
    );
    expect(req.user).toEqual({ id: "user-1", role: "admin" });
    expect(next).toHaveBeenCalled();
  });

  it("liefert 403 bei fehlender Rolle", async () => {
    const leanMock = jest.fn().mockResolvedValue({
      _id: "user-2",
      role: "user",
      is_active: true,
    });
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    findByIdMock.mockReturnValue({ select: selectMock });
    verifyMock.mockReturnValue({ id: "user-2", role: "user" });

    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = createResponse();
    const next = jest.fn();

    await auth("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Zugriff verweigert", status: 403 });
    expect(next).not.toHaveBeenCalled();
  });

  it("liefert 401 bei inaktivem Benutzer", async () => {
    const leanMock = jest.fn().mockResolvedValue({
      _id: "user-3",
      role: "user",
      is_active: false,
    });
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    findByIdMock.mockReturnValue({ select: selectMock });
    verifyMock.mockReturnValue({ id: "user-3", role: "user" });

    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = createResponse();
    const next = jest.fn();

    await auth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Benutzerkonto ist nicht mehr gueltig", status: 401 });
  });
});
