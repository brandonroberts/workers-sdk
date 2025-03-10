import { fetchResult } from "../../../cfetch";
import { defineCommand } from "../../../core";
import { logger } from "../../../logger";
import { requireAuth } from "../../../user";
import type { Instance } from "../../types";

defineCommand({
	command: "wrangler workflows instances terminate",

	metadata: {
		description: "Terminate a workflow instance",
		owner: "Product: Workflows",
		status: "open-beta",
	},

	positionalArgs: ["name", "id"],
	args: {
		name: {
			describe: "Name of the workflow",
			type: "string",
			demandOption: true,
		},
		id: {
			describe:
				"ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and describe it",
			type: "string",
			demandOption: true,
		},
	},

	async handler(args, { config }) {
		const accountId = await requireAuth(config);

		let id = args.id;

		if (id == "latest") {
			const instances = (
				await fetchResult<Instance[]>(
					`/accounts/${accountId}/workflows/${args.name}/instances`
				)
			).sort((a, b) => b.created_on.localeCompare(a.created_on));

			if (instances.length == 0) {
				logger.error(
					`There are no deployed instances in workflow "${args.name}"`
				);
				return;
			}

			id = instances[0].id;
		}

		await fetchResult(
			`/accounts/${accountId}/workflows/${args.name}/instances/${id}`,
			{
				method: "DELETE",
			}
		);

		logger.info(
			`🥷 The instance "${id}" from ${args.name} was terminated successfully`
		);
	},
});
