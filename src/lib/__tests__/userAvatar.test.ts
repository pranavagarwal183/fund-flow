import { describe, it, expect } from "vitest";
import { getInitials, getAvatarColorClasses } from "@/lib/userAvatar";

describe("getInitials", () => {
  it("returns first and last name initials when both are present", () => {
    expect(getInitials("John", "Doe", "john@example.com")).toBe("JD");
  });

  it("falls back to first two letters of email when name not available", () => {
    expect(getInitials("", "", "amy.taylor@domain.com")).toBe("AT");
  });

  it("handles missing email gracefully", () => {
    expect(getInitials(undefined, undefined, undefined)).toBe("UU");
  });
});

describe("getAvatarColorClasses", () => {
  it("returns deterministic classes for the same key", () => {
    const one = getAvatarColorClasses("user-123");
    const two = getAvatarColorClasses("user-123");
    expect(one).toEqual(two);
  });

  it("returns one of allowed semantic classes", () => {
    const { bgClass, textClass } = getAvatarColorClasses("another-user");
    expect(["bg-primary", "bg-secondary", "bg-accent"]).toContain(bgClass);
    expect(["text-primary-foreground", "text-secondary-foreground", "text-accent-foreground"]).toContain(textClass);
  });
});
