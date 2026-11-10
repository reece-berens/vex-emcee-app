import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import Cookies from "js-cookie";
import { registerEvent, useEventRegistration } from "./eventRegistration";

afterEach(() => {
	vi.useRealTimers();
	Cookies.remove("VEXEmceeEvent");
});

describe("event registration", () => {
	it("is false in the browser before an event is picked", () => {
		const { result } = renderHook(() => useEventRegistration());
		expect(result.current).toBe(false);
	});

	it("turns true for every reader when an event is registered", () => {
		const header = renderHook(() => useEventRegistration());
		const page = renderHook(() => useEventRegistration());

		act(() => registerEvent(99001, 1));

		expect(header.result.current).toBe(true);
		expect(page.result.current).toBe(true);
		expect(Cookies.get("VEXEmceeEvent")).toBe("99001~1");
	});

	it("notices a cookie that's gone when the tab gets focus again", () => {
		registerEvent(99001, 1);
		const { result } = renderHook(() => useEventRegistration());
		expect(result.current).toBe(true);

		Cookies.remove("VEXEmceeEvent");
		act(() => {
			window.dispatchEvent(new Event("focus"));
		});

		expect(result.current).toBe(false);
	});

	it("lasts 12 hours", () => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(new Date("2026-11-13T09:00:00"));
		registerEvent(99001, 1);

		vi.setSystemTime(new Date("2026-11-13T20:59:00"));
		expect(Cookies.get("VEXEmceeEvent")).toBe("99001~1");

		vi.setSystemTime(new Date("2026-11-13T21:01:00"));
		expect(Cookies.get("VEXEmceeEvent")).toBeUndefined();
	});
});
