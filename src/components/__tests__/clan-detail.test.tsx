import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { ClanDetail } from "@/components/clan-detail";

const mockDetail = {
  id: 2,
  name: "前田",
  nameKana: "まえだ",
  nameRomaji: "Maeda",
  crestName: "加賀梅鉢",
  members: [
    { id: 3, name: "前田利家", roles: ["藩主"] },
    { id: 4, name: "前田利長", roles: ["藩主"] },
  ],
  territories: [{ id: 10, name: "加賀藩", territoryType: "藩" }],
};

const server = setupServer(
  http.get("/api/clans/2", () => {
    return HttpResponse.json(mockDetail);
  }),
  http.get("/api/clans/999", () => {
    return HttpResponse.json({ error: "Not found" }, { status: 404 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ClanDetail", () => {
  it("家の基本情報を表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanDetail id={2} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("前田家")).toBeInTheDocument();
    });

    expect(screen.getByText("加賀梅鉢")).toBeInTheDocument();
    expect(screen.getByText("Maeda")).toBeInTheDocument();
  });

  it("所属人物一覧を表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanDetail id={2} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("前田利家")).toBeInTheDocument();
    });

    expect(screen.getByText("前田利長")).toBeInTheDocument();
  });

  it("人物名が人物詳細へのリンクになっている", async () => {
    render(
      <SWRTestProvider>
        <ClanDetail id={2} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("前田利家")).toBeInTheDocument();
    });

    const link = screen.getByText("前田利家").closest("a");
    expect(link).toHaveAttribute("href", "/persons/3");
  });

  it("関連領地を表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanDetail id={2} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("加賀藩")).toBeInTheDocument();
    });

    const link = screen.getByText("加賀藩").closest("a");
    expect(link).toHaveAttribute("href", "/territories/10");
  });

  it("存在しない家でエラーメッセージを表示する", async () => {
    render(
      <SWRTestProvider>
        <ClanDetail id={999} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("家が見つかりませんでした")).toBeInTheDocument();
    });
  });
});
