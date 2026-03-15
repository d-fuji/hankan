import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { PersonDetail } from "@/components/person-detail";

const mockDetail = {
  id: 1,
  name: "徳川家康",
  nameKana: "とくがわいえやす",
  nameRomaji: "Tokugawa Ieyasu",
  imina: "家康",
  commonName: "竹千代",
  clanName: "徳川",
  crestName: "三つ葉葵",
  isAdopted: false,
  appointments: [
    {
      roleType: "征夷大将軍",
      generation: 1,
      startYear: 1603,
      endYear: 1605,
    },
  ],
  children: [
    { id: 2, name: "徳川秀忠", birthOrder: 3, birthOrderType: "男" },
  ],
};

const server = setupServer(
  http.get("/api/persons/1", () => {
    return HttpResponse.json(mockDetail);
  }),
  http.get("/api/persons/999", () => {
    return HttpResponse.json({ error: "Not found" }, { status: 404 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("PersonDetail", () => {
  it("人物の基本情報を表示する", async () => {
    render(
      <SWRTestProvider>
        <PersonDetail id={1} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川家康")).toBeInTheDocument();
    });

    expect(screen.getByText("徳川")).toBeInTheDocument();
    expect(screen.getByText("家康")).toBeInTheDocument();
    expect(screen.getByText("竹千代")).toBeInTheDocument();
  });

  it("役職履歴を表示する", async () => {
    render(
      <SWRTestProvider>
        <PersonDetail id={1} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("征夷大将軍")).toBeInTheDocument();
    });

    expect(screen.getByText("初代")).toBeInTheDocument();
  });

  it("子供一覧を表示する", async () => {
    render(
      <SWRTestProvider>
        <PersonDetail id={1} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川秀忠")).toBeInTheDocument();
    });
  });

  it("存在しない人物でエラーメッセージを表示する", async () => {
    render(
      <SWRTestProvider>
        <PersonDetail id={999} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("人物が見つかりませんでした")).toBeInTheDocument();
    });
  });
});
