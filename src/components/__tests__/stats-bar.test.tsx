import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SWRTestProvider } from "@/lib/test-utils";
import { StatsBar } from "@/components/stats-bar";

const server = setupServer(
  http.get("/api/stats", () => {
    return HttpResponse.json({ territoryCount: 13, personCount: 42 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("StatsBar", () => {
  it("領地数と人物数を表示する", async () => {
    render(
      <SWRTestProvider>
        <StatsBar />
      </SWRTestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("13")).toBeInTheDocument();
    });
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("登録領地数")).toBeInTheDocument();
    expect(screen.getByText("登録人物数")).toBeInTheDocument();
  });
});
