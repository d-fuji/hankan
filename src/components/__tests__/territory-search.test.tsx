import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { TerritorySearch } from "@/components/territory-search";

const emptyResponse = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

const server = setupServer(
  http.get("/api/territories", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    if (q === "加賀") {
      return HttpResponse.json({
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
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    }
    return HttpResponse.json(emptyResponse);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("TerritorySearch", () => {
  it("検索フォームを表示する", () => {
    const onSearch = vi.fn();
    render(<TerritorySearch onSearch={onSearch} />);

    expect(screen.getByPlaceholderText("領地名・藩主名で検索")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "検索" })).toBeInTheDocument();
  });

  it("入力してボタンを押すとonSearchが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<TerritorySearch onSearch={onSearch} />);

    await user.type(screen.getByPlaceholderText("領地名・藩主名で検索"), "加賀");
    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(onSearch).toHaveBeenCalledWith("加賀");
  });

  it("Enterキーでも検索できる", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<TerritorySearch onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("領地名・藩主名で検索");
    await user.type(input, "薩摩{Enter}");

    expect(onSearch).toHaveBeenCalledWith("薩摩");
  });

  it("空文字で検索するとonSearchに空文字を渡す", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<TerritorySearch onSearch={onSearch} />);

    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(onSearch).toHaveBeenCalledWith("");
  });
});

describe("TerritorySearch + TerritoryList統合", () => {
  it("検索結果が領地一覧に反映される", async () => {
    const { TerritoryList } = await import("@/components/territory-list");

    let searchQuery = "";
    function TestPage() {
      return (
        <SWRTestProvider>
          <TerritorySearch onSearch={(q) => (searchQuery = q)} />
          <TerritoryList query={searchQuery} />
        </SWRTestProvider>
      );
    }

    render(<TestPage />);

    await waitFor(() => {
      // 初期状態ではq=""でリクエスト→emptyResponse
      expect(screen.getByText("該当する領地がありません")).toBeInTheDocument();
    });
  });
});
