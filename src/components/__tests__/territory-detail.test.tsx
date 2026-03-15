import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { TerritoryDetail } from "@/components/territory-detail";

const mockDetail = {
  id: 1,
  name: "加賀藩",
  nameKana: "かがはん",
  nameRomaji: "Kaga-han",
  territoryType: "藩",
  provinceName: "加賀",
  region: "北陸道",
  modernPrefecture: "石川県",
  modernCity: "金沢市",
  location: "金沢城",
  establishedYear: 1583,
  lords: [
    {
      id: 10,
      name: "前田利家",
      generation: 1,
      startYear: 1583,
      endYear: 1599,
      clanName: "前田",
    },
    {
      id: 11,
      name: "前田利長",
      generation: 2,
      startYear: 1599,
      endYear: 1614,
      clanName: "前田",
    },
  ],
  kokudakaHistory: [
    {
      year: 1600,
      amount: 102.5,
      changeType: "立藩",
      changeDetail: "加賀・能登・越中三カ国",
    },
  ],
};

const server = setupServer(
  http.get("/api/territories/1", () => {
    return HttpResponse.json(mockDetail);
  }),
  http.get("/api/territories/999", () => {
    return HttpResponse.json({ error: "Not found" }, { status: 404 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("TerritoryDetail", () => {
  it("領地の基本情報を表示する", async () => {
    render(
      <SWRTestProvider>
        <TerritoryDetail id={1} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("加賀藩")).toBeInTheDocument();
    });

    expect(screen.getByText("北陸道")).toBeInTheDocument();
    expect(screen.getByText("石川県")).toBeInTheDocument();
    expect(screen.getByText("金沢市")).toBeInTheDocument();
    expect(screen.getByText("金沢城")).toBeInTheDocument();
    expect(screen.getByText("1583年")).toBeInTheDocument();
  });

  it("藩主一覧を表示する", async () => {
    render(
      <SWRTestProvider>
        <TerritoryDetail id={1} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("前田利家")).toBeInTheDocument();
    });

    expect(screen.getByText("前田利長")).toBeInTheDocument();
    expect(screen.getByText("初代")).toBeInTheDocument();
    expect(screen.getByText("2代")).toBeInTheDocument();
  });

  it("石高履歴を表示する", async () => {
    render(
      <SWRTestProvider>
        <TerritoryDetail id={1} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("102.5万石")).toBeInTheDocument();
    });

    expect(screen.getByText("1600年")).toBeInTheDocument();
    expect(screen.getByText("立藩")).toBeInTheDocument();
  });

  it("存在しない領地でエラーメッセージを表示する", async () => {
    render(
      <SWRTestProvider>
        <TerritoryDetail id={999} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("領地が見つかりませんでした")).toBeInTheDocument();
    });
  });

  it("ローディング中はローディング表示をする", () => {
    render(
      <SWRTestProvider>
        <TerritoryDetail id={1} />
      </SWRTestProvider>
    );

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});
