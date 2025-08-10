import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AvatarCircle from "@/components/AvatarCircle";

describe("AvatarCircle snapshot", () => {
  it("matches snapshot for a typical user", () => {
    const { container } = render(
      <AvatarCircle name="Jane Doe" email="jane@example.com" colorKey="user-1" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
