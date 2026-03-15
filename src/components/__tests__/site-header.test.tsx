import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/site-header";

describe("SiteHeader", () => {
  it("タイトルリンクを表示する", () => {
    render(<SiteHeader />);

    const titleLink = screen.getByRole("link", { name: "藩鑑" });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute("href", "/");
  });

  it("ナビゲーションリンクを表示する", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "領地検索" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "将軍一覧" })).toHaveAttribute("href", "/shoguns");
  });

  it("currentPathに一致するリンクが強調表示される", () => {
    render(<SiteHeader currentPath="/shoguns" />);

    const shogunLink = screen.getByRole("link", { name: "将軍一覧" });
    expect(shogunLink.className).toContain("text-[var(--color-gold)]");

    const territoryLink = screen.getByRole("link", { name: "領地検索" });
    expect(territoryLink.className).not.toContain("text-[var(--color-gold)]");
  });
});
