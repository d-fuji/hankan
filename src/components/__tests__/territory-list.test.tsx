import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { TerritoryList } from "@/components/territory-list";

const mockData = {
  data: [
    {
      id: 1,
      name: "加賀藩",
      nameKana: "かがはん",
      territoryType: "藩",
      provinceName: "加賀",
      modernPrefecture: "石川県",
      kokudaka: 102.5,
    },
    {
      id: 2,
      name: "薩摩藩",
      nameKana: "さつまはん",
      territoryType: "藩",
      provinceName: "薩摩",
      modernPrefecture: "鹿児島県",
      kokudaka: 72.95,
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const server = setupServer(
  http.get("/api/territories", () => {
    return HttpResponse.json(mockData);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("TerritoryList", () => {
  it("領地一覧を表示する", async () => {
    render(
      <SWRTestProvider>
        <TerritoryList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("加賀藩")).toBeInTheDocument();
    });

    expect(screen.getByText("薩摩藩")).toBeInTheDocument();
  });

  it("石高を万石単位で表示する", async () => {
    render(
      <SWRTestProvider>
        <TerritoryList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("102.5万石")).toBeInTheDocument();
    });
  });

  it("旧国名と都道府県を表示する", async () => {
    render(
      <SWRTestProvider>
        <TerritoryList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("加賀")).toBeInTheDocument();
      expect(screen.getByText("石川県")).toBeInTheDocument();
    });
  });

  it("ローディング中はローディング表示をする", () => {
    render(
      <SWRTestProvider>
        <TerritoryList />
      </SWRTestProvider>
    );

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("エラー時はエラーメッセージを表示する", async () => {
    server.use(
      http.get("/api/territories", () => {
        return HttpResponse.error();
      })
    );

    render(
      <SWRTestProvider>
        <TerritoryList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("データの取得に失敗しました")).toBeInTheDocument();
    });
  });
});
