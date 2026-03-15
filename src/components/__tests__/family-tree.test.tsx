import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { FamilyTree } from "@/components/family-tree";
import type { LineageResponse } from "@/types/person";

const mockLineage: LineageResponse = {
  focusPersonId: 2,
  tree: {
    id: 1,
    name: "徳川家康",
    clanName: "徳川",
    isAdopted: false,
    isFocusPerson: false,
    children: [
      {
        id: 2,
        name: "徳川秀忠",
        clanName: "徳川",
        isAdopted: false,
        isFocusPerson: true,
        children: [
          {
            id: 3,
            name: "徳川家光",
            clanName: "徳川",
            isAdopted: false,
            isFocusPerson: false,
            children: [],
          },
        ],
      },
    ],
  },
};

const mockLineageWithAdoption: LineageResponse = {
  focusPersonId: 4,
  tree: {
    id: 5,
    name: "徳川光貞",
    clanName: "紀州徳川",
    isAdopted: false,
    isFocusPerson: false,
    children: [
      {
        id: 4,
        name: "徳川吉宗",
        clanName: "徳川",
        isAdopted: true,
        adoptedFromClanName: "紀州徳川",
        isFocusPerson: true,
        children: [],
      },
    ],
  },
};

const server = setupServer(
  http.get("/api/persons/2/lineage", () => {
    return HttpResponse.json(mockLineage);
  }),
  http.get("/api/persons/4/lineage", () => {
    return HttpResponse.json(mockLineageWithAdoption);
  }),
  http.get("/api/persons/999/lineage", () => {
    return HttpResponse.json({ error: "Not found" }, { status: 404 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("FamilyTree", () => {
  it("血統ツリーの全ノードを表示する", async () => {
    render(
      <SWRTestProvider>
        <FamilyTree personId={2} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川家康")).toBeInTheDocument();
    });

    expect(screen.getByText("徳川秀忠")).toBeInTheDocument();
    expect(screen.getByText("徳川家光")).toBeInTheDocument();
  });

  it("フォーカス人物がハイライトされる", async () => {
    render(
      <SWRTestProvider>
        <FamilyTree personId={2} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川秀忠")).toBeInTheDocument();
    });

    const focusNode = screen.getByText("徳川秀忠").closest("[data-focus]");
    expect(focusNode).toHaveAttribute("data-focus", "true");
  });

  it("養子関係が区別して表示される", async () => {
    render(
      <SWRTestProvider>
        <FamilyTree personId={4} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川吉宗")).toBeInTheDocument();
    });

    expect(screen.getByText("養子")).toBeInTheDocument();
    expect(screen.getByText(/紀州徳川家より/)).toBeInTheDocument();
  });

  it("セクションタイトル「血統」が表示される", async () => {
    render(
      <SWRTestProvider>
        <FamilyTree personId={2} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("血統")).toBeInTheDocument();
    });
  });

  it("ノードが人物詳細へのリンクを持つ（フォーカス人物以外）", async () => {
    render(
      <SWRTestProvider>
        <FamilyTree personId={2} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川家康")).toBeInTheDocument();
    });

    const ieyasuLink = screen.getByText("徳川家康").closest("a");
    expect(ieyasuLink).toHaveAttribute("href", "/persons/1");

    const iemitsuLink = screen.getByText("徳川家光").closest("a");
    expect(iemitsuLink).toHaveAttribute("href", "/persons/3");
  });

  it("エラー時にツリーが表示されない", async () => {
    render(
      <SWRTestProvider>
        <FamilyTree personId={999} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("血統")).not.toBeInTheDocument();
    });
  });
});
