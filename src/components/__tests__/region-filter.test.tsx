import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegionFilter } from "@/components/region-filter";

const REGIONS = ["畿内", "東海道", "東山道", "北陸道", "山陰道", "山陽道", "南海道", "西海道", "北海道"];

describe("RegionFilter", () => {
  it("全ての地域ボタンを表示する", () => {
    render(<RegionFilter selected={undefined} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    for (const region of REGIONS) {
      expect(screen.getByRole("button", { name: region })).toBeInTheDocument();
    }
  });

  it("地域を選択するとonSelectが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<RegionFilter selected={undefined} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "北陸道" }));

    expect(onSelect).toHaveBeenCalledWith("北陸道");
  });

  it("選択中の地域が強調表示される", () => {
    render(<RegionFilter selected="北陸道" onSelect={vi.fn()} />);

    const button = screen.getByRole("button", { name: "北陸道" });
    expect(button.className).toContain("bg-[var(--color-navy)]");
  });

  it("すべてボタンを押すとonSelect(undefined)が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<RegionFilter selected="北陸道" onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "すべて" }));

    expect(onSelect).toHaveBeenCalledWith(undefined);
  });
});
