import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { ClanList } from "@/components/clan-list";

const mockData = {
  data: [
    {
      id: 1,
      name: "徳川",
      nameKana: "とくがわ",
      crestName: "三つ葉葵",
      memberCount: 15,
      territoryNames: [],
    },
    {
      id: 2,
      name: "前田",
      nameKana: "まえだ",
      crestName: "加賀梅鉢",
      memberCount: 5,
      territoryNames: ["加賀藩"],
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const server = setupServer(
  http.get("/api/clans", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    if (q === "前田") {
      return HttpResponse.json({
        ...mockData,
        data: [mockData.data[1]],
        total: 1,
      });
    }
    return HttpResponse.json(mockData);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ClanList", () => {
  it("家一覧を表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川")).toBeInTheDocument();
    });

    expect(screen.getByText("前田")).toBeInTheDocument();
    expect(screen.getByText("三つ葉葵")).toBeInTheDocument();
    expect(screen.getByText("加賀梅鉢")).toBeInTheDocument();
  });

  it("家名が家詳細へのリンクになっている", async () => {
    render(
      <SWRTestProvider>
        <ClanList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川")).toBeInTheDocument();
    });

    const tokugawaLink = screen.getByText("徳川").closest("a");
    expect(tokugawaLink).toHaveAttribute("href", "/clans/1");
  });

  it("関連領地名を表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("加賀藩")).toBeInTheDocument();
    });
  });

  it("人物数を表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("15人")).toBeInTheDocument();
    });

    expect(screen.getByText("5人")).toBeInTheDocument();
  });
});
