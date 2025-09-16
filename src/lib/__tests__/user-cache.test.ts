import { readUserCache, writeUserCache } from "../userCache";

describe("userCache read/write", () => {
  const uid = "test-uid-1";
  afterEach(() => {
    try {
      localStorage.removeItem(`user-cache:${uid}`);
    } catch {}
  });

  it("writes and reads back the same user", () => {
    const user = { uid, name: "Alice", profile: { bio: "hi" } };
    writeUserCache(uid, user as any);
    const read = readUserCache(uid, 1000 * 60 * 60);
    expect(read).not.toBeNull();
    expect(read?.uid).toBe(uid);
    expect(read?.profile?.bio).toBe("hi");
  });

  it("respects TTL and returns null when expired", () => {
    const user = { uid, name: "Bob" };
    // write with old fetchedAt by writing directly to localStorage
    const old = { user, fetchedAt: Date.now() - 1000 * 60 * 60 * 24 };
    localStorage.setItem(`user-cache:${uid}`, JSON.stringify(old));
    const read = readUserCache(uid, 1000 * 60 * 60);
    expect(read).toBeNull();
  });
});
