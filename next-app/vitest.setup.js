/**
 * Setup for the components test project
 *
 * Testing Library only cleans up on its own when Vitest's globals are turned on,
 * so each test's rendered page is removed here. Otherwise the next test would see it too.
 */

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(cleanup);
