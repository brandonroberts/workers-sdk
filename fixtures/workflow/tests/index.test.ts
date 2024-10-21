import { resolve } from "path";
import { setTimeout } from "timers/promises";
import { fetch } from "undici";
import { afterAll, beforeAll, describe, it, vi } from "vitest";
import { runWranglerDev } from "../../shared/src/run-wrangler-long-lived";

describe("Workflows", () => {
	let ip: string,
		port: number,
		stop: (() => Promise<unknown>) | undefined,
		getOutput: () => string;

	beforeAll(async () => {
		({ ip, port, stop, getOutput } = await runWranglerDev(
			resolve(__dirname, ".."),
			[
				"--port=0",
				"--inspector-port=0",
				"--upstream-protocol=https",
				"--host=prod.example.org",
			]
		));
	});

	afterAll(async () => {
		await stop?.();
	});

	async function fetchJson(url: string) {
		const response = await fetch(url, {
			headers: {
				"MF-Disable-Pretty-Error": "1",
			},
		});
		const text = await response.text();

		try {
			return JSON.parse(text);
		} catch (err) {
			throw new Error(`Couldn't parse JSON:\n\n${text}`);
		}
	}

	it("creates a workflow", async ({ expect }) => {
		await expect(
			fetchJson(`http://${ip}:${port}/create?workflowName=test`)
		).resolves.toEqual({});

		// await expect(fetchJson(`http://${ip}:${port}/status?workflowName=test`))
		// 	.resolves.toMatchInlineSnapshot(`
		// 	{
		// 	  "message": "The RPC receiver does not implement the method "getByName".",
		// 	  "name": "TypeError",
		// 	  "stack": "TypeError: The RPC receiver does not implement the method "getByName".
		// 	    at async src_default.fetch (file:///Users/sethi/code/w4/fixtures/workflow/.wrangler/tmp/dev-ahPpdM/index.js:66:16)
		// 	    at async jsonError (file:///Users/sethi/code/w4/fixtures/workflow/.wrangler/tmp/dev-ahPpdM/index.js:103:12)
		// 	    at async drainBody (file:///Users/sethi/code/w4/fixtures/workflow/.wrangler/tmp/dev-ahPpdM/index.js:76:12)",
		// 	}
		// `);

		// vi.waitFor(() => {
		// 	expect(
		// 		fetchJson(`http://${ip}:${port}/status`)
		// 	).resolves.toMatchInlineSnapshot();
		// });
	});
});
