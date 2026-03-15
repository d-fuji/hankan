import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { ShogunList } from "@/components/shogun-list";

const mockShoguns = {
  data: [
    {
      id: 1,
      name: "徳川家康",
      nameKana: "とくがわいえやす",
      clanName: "徳川",
      roles: ["征夷大将軍"],
      generation: 1,
      startYear: 1603,
      endYear: 1605,
    },
    {
      id: 2,
      name: "徳川秀忠",
      nameKana: "とくがわひでただ",
      clanName: "徳川",
      roles: ["征夷大将軍"],
      generation: 2,
      startYear: 1605,
      endYear: 1623,
    },
  ],
};

const server = setupServer(
  http.get("/api/persons", ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    if (role === "征夷大将軍") {
      return HttpResponse.json(mockShoguns);
    }
    return HttpResponse.json({ data: [] });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ShogunList", () => {
  it("将軍一覧を代数順に表示する", async () => {
    render(
      <SWRTestProvider>
        <ShogunList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("徳川家康")).toBeInTheDocument();
    });

    expect(screen.getByText("徳川秀忠")).toBeInTheDocument();
    expect(screen.getByText("初代")).toBeInTheDocument();
    expect(screen.getByText("2代")).toBeInTheDocument();
  });

  it("在任期間を表示する", async () => {
    render(
      <SWRTestProvider>
        <ShogunList />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("1603–1605")).toBeInTheDocument();
    });
    expect(screen.getByText("1605–1623")).toBeInTheDocument();
  });
});
