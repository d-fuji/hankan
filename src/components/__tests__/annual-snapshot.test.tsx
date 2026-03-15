import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { AnnualSnapshotView } from "@/components/annual-snapshot";

const mockSnapshot = {
  year: 1700,
  shogun: {
    id: 1,
    name: "徳川綱吉",
    generation: 5,
    startYear: 1680,
    endYear: 1709,
  },
  territories: [
    {
      id: 10,
      name: "加賀藩",
      territoryType: "藩",
      provinceName: "加賀",
      modernPrefecture: "石川県",
      lord: {
        id: 20,
        name: "前田綱紀",
        clanName: "前田",
        roleType: "藩主",
        generation: 4,
      },
      kokudaka: 102.5,
    },
    {
      id: 11,
      name: "薩摩藩",
      territoryType: "藩",
      provinceName: "薩摩",
      modernPrefecture: "鹿児島県",
      lord: {
        id: 21,
        name: "島津綱貴",
        clanName: "島津",
        roleType: "藩主",
        generation: 4,
      },
      kokudaka: 72.9,
    },
  ],
};

const server = setupServer(
  http.get("/api/annual", ({ request }) => {
    const url = new URL(request.url);
    const year = url.searchParams.get("year");
    if (year === "1700") {
      return HttpResponse.json(mockSnapshot);
    }
    return HttpResponse.json({ year: Number(year), territories: [] });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("AnnualSnapshotView", () => {
  it("指定年の将軍を表示する", async () => {
    render(
      <SWRTestProvider>
        <AnnualSnapshotView year={1700} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川綱吉")).toBeInTheDocument();
    });
    expect(screen.getByText(/5代/)).toBeInTheDocument();
  });

  it("領地一覧を石高付きで表示する", async () => {
    render(
      <SWRTestProvider>
        <AnnualSnapshotView year={1700} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("加賀藩")).toBeInTheDocument();
    });
    expect(screen.getByText("薩摩藩")).toBeInTheDocument();
    expect(screen.getByText("前田綱紀")).toBeInTheDocument();
    expect(screen.getByText(/102\.5/)).toBeInTheDocument();
  });

  it("藩主名から人物詳細へのリンクがある", async () => {
    render(
      <SWRTestProvider>
        <AnnualSnapshotView year={1700} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("前田綱紀")).toBeInTheDocument();
    });

    const link = screen.getByText("前田綱紀").closest("a");
    expect(link).toHaveAttribute("href", "/persons/20");
  });

  it("領地名から領地詳細へのリンクがある", async () => {
    render(
      <SWRTestProvider>
        <AnnualSnapshotView year={1700} />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("加賀藩")).toBeInTheDocument();
    });

    const link = screen.getByText("加賀藩").closest("a");
    expect(link).toHaveAttribute("href", "/territories/10");
  });
});
