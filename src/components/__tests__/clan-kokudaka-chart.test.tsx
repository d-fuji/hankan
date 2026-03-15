import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { ClanKokudakaChart } from "@/components/clan-kokudaka-chart";

const mockData = {
  clanId: 1,
  clanName: "前田",
  data: [
    { year: 1600, amount: 102.5, territoryName: "加賀藩" },
    { year: 1700, amount: 102.5, territoryName: "加賀藩" },
  ],
};

const mockEmpty = {
  clanId: 2,
  clanName: "徳川",
  data: [],
};

const server = setupServer(
  http.get("/api/clans/1/kokudaka", () => {
    return HttpResponse.json(mockData);
  }),
  http.get("/api/clans/2/kokudaka", () => {
    return HttpResponse.json(mockEmpty);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ClanKokudakaChart", () => {
  it("セクションタイトル「石高推移」を表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanKokudakaChart clanId={1} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("石高推移")).toBeInTheDocument();
    });
  });

  it("石高データポイントの年と値を表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanKokudakaChart clanId={1} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("石高推移")).toBeInTheDocument();
    });

    expect(screen.getByText("1600年")).toBeInTheDocument();
    expect(screen.getByText("1700年")).toBeInTheDocument();
    expect(screen.getAllByText("102.5万石")).toHaveLength(2);
  });

  it("石高データがない場合はセクション非表示", async () => {
    render(
      <SWRTestProvider>
        <ClanKokudakaChart clanId={2} />
      </SWRTestProvider>
    );

    // 空データの場合、レンダリング完了後もセクションが出ないことを確認
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.queryByText("石高推移")).not.toBeInTheDocument();
  });
});
