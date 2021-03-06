"use strict";
const { deepStrictEqual } = require("assert");
const { validate } = require("../src/validate");

const scenarios = [
	{ schema: "integer", instance: 1 },
	{ schema: "finite", instance: 1.1 },
	{ schema: "number", instance: 1 },
	{ schema: "number", instance: 1.1 },

	{ schema: "number", instance: Infinity },
	{ schema: "finite", instance: Infinity, response: ["$ (null) is not a finite."] },
	{ schema: "integer", instance: Infinity, response: ["$ (null) is not an integer."] },

	{ schema: "code", instance: "abc" },
	{ schema: "code", instance: "abc-def" },
	{ schema: "code", instance: "abc-def.xyz-123" },
	{ schema: "code", instance: "abc-de_f.xyz-1_23" },

	{ schema: "trimmed", instance: "a" },
	{ schema: "trimmed", instance: "aa" },
	{ schema: "trimmed", instance: "aaa" },
	{ schema: "trimmed", instance: "a a" },
	{ schema: "trimmed", instance: "aa a" },
	{ schema: "trimmed", instance: "aaa a" },
	{ schema: "trimmed", instance: "a aa" },
	{ schema: "trimmed", instance: "aa aa" },
	{ schema: "trimmed", instance: "aaa aa" },
	{ schema: "trimmed", instance: "a aaa" },
	{ schema: "trimmed", instance: "aa aaa" },
	{ schema: "trimmed", instance: "aaa aaa" },

	{ schema: "trimmed", instance: "", response: ['$ ("") is not a "trimmed".'] },

	{ schema: "trimmed", instance: "a ", response: ['$ ("a ") is not a "trimmed".'] },
	{ schema: "trimmed", instance: " a", response: ['$ (" a") is not a "trimmed".'] },
	{ schema: "trimmed", instance: " a ", response: ['$ (" a ") is not a "trimmed".'] },

	{ schema: "trimmed", instance: "a\n", response: ['$ ("a\\n") is not a "trimmed".'] },
	{ schema: "trimmed", instance: "\na", response: ['$ ("\\na") is not a "trimmed".'] },
	{ schema: "trimmed", instance: "\na\n", response: ['$ ("\\na\\n") is not a "trimmed".'] },

	{ schema: "trimmed", instance: "aa ", response: ['$ ("aa ") is not a "trimmed".'] },
	{ schema: "trimmed", instance: " aa", response: ['$ (" aa") is not a "trimmed".'] },
	{ schema: "trimmed", instance: " aa ", response: ['$ (" aa ") is not a "trimmed".'] },

	{ schema: "trimmed", instance: "aa\n", response: ['$ ("aa\\n") is not a "trimmed".'] },
	{ schema: "trimmed", instance: "\naa", response: ['$ ("\\naa") is not a "trimmed".'] },
	{ schema: "trimmed", instance: "\naa\n", response: ['$ ("\\naa\\n") is not a "trimmed".'] },

	{ schema: "trimmed", instance: "a a ", response: ['$ ("a a ") is not a "trimmed".'] },
	{ schema: "trimmed", instance: " a a", response: ['$ (" a a") is not a "trimmed".'] },
	{ schema: "trimmed", instance: " a a ", response: ['$ (" a a ") is not a "trimmed".'] },

	{ schema: "trimmed", instance: "a a\n", response: ['$ ("a a\\n") is not a "trimmed".'] },
	{ schema: "trimmed", instance: "\na a", response: ['$ ("\\na a") is not a "trimmed".'] },
	{ schema: "trimmed", instance: "\na a\n", response: ['$ ("\\na a\\n") is not a "trimmed".'] },

	{ schema: "etrimmed", instance: "a" },
	{ schema: "etrimmed", instance: "aa" },
	{ schema: "etrimmed", instance: "aaa" },
	{ schema: "etrimmed", instance: "a a" },
	{ schema: "etrimmed", instance: "aa a" },
	{ schema: "etrimmed", instance: "aaa a" },
	{ schema: "etrimmed", instance: "a aa" },
	{ schema: "etrimmed", instance: "aa aa" },
	{ schema: "etrimmed", instance: "aaa aa" },
	{ schema: "etrimmed", instance: "a aaa" },
	{ schema: "etrimmed", instance: "aa aaa" },
	{ schema: "etrimmed", instance: "aaa aaa" },

	{ schema: "etrimmed", instance: "" },

	{ schema: "etrimmed", instance: "a ", response: ['$ ("a ") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: " a", response: ['$ (" a") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: " a ", response: ['$ (" a ") is not a "etrimmed".'] },

	{ schema: "etrimmed", instance: "a\n", response: ['$ ("a\\n") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: "\na", response: ['$ ("\\na") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: "\na\n", response: ['$ ("\\na\\n") is not a "etrimmed".'] },

	{ schema: "etrimmed", instance: "aa ", response: ['$ ("aa ") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: " aa", response: ['$ (" aa") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: " aa ", response: ['$ (" aa ") is not a "etrimmed".'] },

	{ schema: "etrimmed", instance: "aa\n", response: ['$ ("aa\\n") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: "\naa", response: ['$ ("\\naa") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: "\naa\n", response: ['$ ("\\naa\\n") is not a "etrimmed".'] },

	{ schema: "etrimmed", instance: "a a ", response: ['$ ("a a ") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: " a a", response: ['$ (" a a") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: " a a ", response: ['$ (" a a ") is not a "etrimmed".'] },

	{ schema: "etrimmed", instance: "a a\n", response: ['$ ("a a\\n") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: "\na a", response: ['$ ("\\na a") is not a "etrimmed".'] },
	{ schema: "etrimmed", instance: "\na a\n", response: ['$ ("\\na a\\n") is not a "etrimmed".'] },

	{
		schema: {
			type: "object",
			required: true,
			properties: {
				name: "code"
			}
		},
		instance: {
		},
		response: ['$.name is required.']
	},

	{
		schema: {
			type: "object",
			required: true,
			properties: {
				name: "ocode"
			}
		},
		instance: {
		}
	},

	{
		schema: {
			type: "object",
			required: true,
			properties: {
				name: "ocode"
			}
		},
		instance: {
			name: "test"
		}
	},

	{
		schema: {
			type: "object",
			required: true,
			properties: {
				name: "ocode"
			}
		},
		instance: {
			name: 123
		},
		response: ['$.name (123) is not a string.']
	},

	{
		schema: {
			type: "object",
			required: true,
			properties: {
				name: "ocode"
			}
		},
		instance: {
			name: ""
		},
		response: ['$.name ("") is not a "code".']
	},

	{
		schema: {
			type: "object",
			required: true,
			properties: {
				name: "otrimmed"
			}
		},
		instance: {
			type: 123
		}
	},

	{ schema: { type: "constant", value: "abc" }, instance: "abc" },
	{ schema: { type: "constant", value: 123 }, instance: 123 },

	{ schema: { type: "not", schema: "integer" }, instance: "a" },
	{ schema: { type: "not", schema: "string" }, instance: 123 },
	{ schema: { type: "not", schema: { type: "constant", value: 123 } }, instance: 124 },
	{ schema: { type: "not", schema: "trimmed" }, instance: "a " },
	{ schema: { type: "not", schema: { type: "not", schema: "trimmed" } }, instance: "a" },

	{ schema: "string", response: ["$ is required."] },
	{ schema: "string", instance: null, response: ["$ (null) is not a string."] },
	{ schema: "string", instance: "" },
	{ schema: "string", instance: "1", },
	{ schema: "string", instance: "2", },
	{ schema: "string", instance: 3, response: ["$ (3) is not a string."] },
	{ schema: { type: "string" } },
	{ schema: { type: "string", required: true }, response: ["$ is required."] },
	{ schema: { type: "string", required: true }, instance: 3, response: ["$ (3) is not a string."] },

	{ schema: ["string", "integer"], response: [[["$ is required."], ["$ is required."]]] },
	{ schema: ["string", "integer"], instance: null, response: [[["$ (null) is not a string."], ["$ (null) is not an integer."]]] },
	{ schema: ["string", "integer"], instance: 123.5, response: [[["$ (123.5) is not a string."], ["$ (123.5) is not an integer."]]] },
	{ schema: ["string", "integer"], instance: "" },
	{ schema: ["string", "integer"], instance: "abc" },
	{ schema: ["string", "integer"], instance: 123 },
	{ schema: ["string", "integer"], instance: 123 },
	{ schema: ["string", "integer", "boolean"], instance: false },

	{
		schema: {
			type: "object",
			properties: {
				id: ["string", "integer"]
			}
		},
		instance: {
			id: "abc"
		}
	},

	{
		schema: {
			type: "object",
			properties: {
				id: ["string", "integer"]
			}
		},
		instance: {
			id: 123
		}
	},

	{
		schema: {
			type: "object",
			properties: {
				id: ["string", {
					type: "object",
					required: true,
					properties: {
						id: "string"
					}
				}]
			}
		},
		instance: {
			id: {
				id: "123"
			}
		}
	}
];

const root = [
	{
		type: "object",
		properties: {
			type: [
				{
					type: "constant", value: "object"
				},
				{
					type: "constant", value: "string"
				},
				{
					type: "constant", value: "number"
				},
				{
					type: "constant", value: "integer"
				}
			],
			required: {
				type: "boolean"
			}
		}
	},
	{
		type: "array"
	},
	{
		type: "constant", value: "string"
	},
	{
		type: "constant", value: "number"
	},
	{
		type: "constant", value: "integer"
	}
];

describe("validate", () => {

	it("should validate root by itself", () => {

		const errors = validate(root, root, "$");
		if (errors === undefined) {
			// ok
		}
		else {
			throw new Error();
		}
	});

	for (const scenario of scenarios) {

		it("should handle ..", () => {

			// const errors = validate(root, scenario.schema, "$");
			// if (errors === undefined) {
			// 	// ok
			// }
			// else {
			// 	console.log(errors);
			// 	throw new Error();
			// }

			const response = validate(scenario.schema, scenario.instance, "$");

			deepStrictEqual(response, scenario.response);

		});
	}
});
