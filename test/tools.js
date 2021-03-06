"use strict";
const util = require("util");
const assert = require("assert");
const net = require("net");
const { tools } = require("..");

describe('isString', () => {

	const tests = [
		{ expected: false },
		{ args: void 0, expected: false },
		{ args: undefined, expected: false },
		{ args: null, expected: false },
		{ args: 0, expected: false },
		{ args: 0.5, expected: false },
		{ args: {}, expected: false },
		{ args: [], expected: false },
		{ args: '', expected: true },
		{ args: "", expected: true },
		{ args: ``, expected: true },
		{ args: 'payload', expected: true },
		{ args: "payload", expected: true },
		{ args: `payload`, expected: true },
	];

	tests.forEach(test => {

		it("correctly tests " + test.args, () => {
			const result = tools.isString(test.args);
			assert.equal(result, test.expected);
		});
	});
});


describe('isEmail', () => {

	const tests = [
		{ expected: false },
		{ args: void 0, expected: false },
		{ args: undefined, expected: false },
		{ args: null, expected: false },
		{ args: 0, expected: false },
		{ args: 0.5, expected: false },
		{ args: {}, expected: false },
		{ args: [], expected: false },
		{ args: "a@b.com", expected: true },
	];

	tests.forEach(test => {

		it("correctly tests " + test.args, () => {
			const result = tools.isEmail(test.args);
			assert.equal(result, test.expected);
		});
	});
});

describe('isId', () => {

	const tests = [
		{ expected: false },
		{ args: void 0, expected: false },
		{ args: undefined, expected: false },
		{ args: null, expected: false },
		{ args: 0, expected: false },
		{ args: 0.5, expected: false },
		{ args: {}, expected: false },
		{ args: [], expected: false },
		{ args: "00000000-0000-0000-0000-000000000000", expected: true },
	];

	tests.forEach(test => {

		it("correctly tests " + test.args, () => {
			const result = tools.isId(test.args);
			assert.equal(result, test.expected);
		});
	});
});

describe('getId', () => {

	const tests = [
		{ expected: false },
		{ args: void 0, expected: false },
		{ args: undefined, expected: false },
		{ args: null, expected: false },
		{ args: 0, expected: false },
		{ args: 0.5, expected: false },
		{ args: {}, expected: false },
		{ args: [], expected: false },
		{ args: NaN, expected: false },
		{ args: "A0000000-0000-0000-0000-000000000000", expected: false },
		{ args: " 00000000-0000-0000-0000-000000000000", expected: false },
		{ args: "00000000-0000-0000-0000-000000000000 ", expected: false },
		{ args: "a0000000-0000-0000-0000-000000000000", expected: true },
		{ args: "00000000-0000-0000-0000-000000000000", expected: true },
	];

	tests.forEach(test => {

		it(util.format("correctly tests j(%j) s(%s) as %j.", test.args, test.args, test.expected), () => {

			let result;
			let thrown;
			try {
				result = tools.getId(test.args);
			}
			catch (e) {
				thrown = e;
			}

			if (test.expected) {
				assert(result === test.args);
				assert(thrown === undefined);
			}
			else {
				assert(thrown instanceof Error);
			}
		});
	});
});

describe('getArray', () => {

	const tests = [
		{ throws: "(undefined) is not an array." },
		{ args: void 0, throws: "(undefined) is not an array." },
		{ args: undefined, throws: "(undefined) is not an array." },
		{ args: null, throws: "(null) is not an array." },
		{ args: 0, throws: "(0) is not an array." },
		{ args: 0.5, throws: "(0.5) is not an array." },
		{ args: {}, throws: "({}) is not an array." },
		{ args: NaN, throws: "(null) is not an array." },
		{ args: "123", throws: "(\"123\") is not an array." },
		{ args: "[]", throws: "(\"[]\") is not an array." },
		{ args: "[1,2,3]", throws: "(\"[1,2,3]\") is not an array." },
		{ args: { length: 3 }, throws: "({\"length\":3}) is not an array." },
		{ args: [] },
		{ args: [1, 2, 3] },
		{ args: [1, "2", 3.5] }
	];

	tests.forEach(test => {

		it(util.format("correctly tests j(%j) s(%s).", test.args, test.args), () => {

			let thrown;

			if (test.throws) {

				try {
					tools.getArray(test.args);
				}
				catch (error) {
					if (error.message === test.throws) {
						return;
					}

					throw error;
				}

				assert(false);
			}
			else {

				const result = tools.getArray(test.args);
				assert(result === test.args);
			}
		});
	});
});

describe('getNonEmptyArray', () => {

	const tests = [
		{ throws: "(undefined) is not a non-empty array." },
		{ args: void 0, throws: "(undefined) is not a non-empty array." },
		{ args: undefined, throws: "(undefined) is not a non-empty array." },
		{ args: null, throws: "(null) is not a non-empty array." },
		{ args: 0, throws: "(0) is not a non-empty array." },
		{ args: 0.5, throws: "(0.5) is not a non-empty array." },
		{ args: {}, throws: "({}) is not a non-empty array." },
		{ args: [], throws: "([]) is not a non-empty array." },
		{ args: NaN, throws: "(null) is not a non-empty array." },
		{ args: "123", throws: "(\"123\") is not a non-empty array." },
		{ args: "[]", throws: "(\"[]\") is not a non-empty array." },
		{ args: "[1,2,3]", throws: "(\"[1,2,3]\") is not a non-empty array." },
		{ args: { length: 3 }, throws: "({\"length\":3}) is not a non-empty array." },
		{ args: [1, 2, 3] },
		{ args: [1, "2", 3.5] }
	];

	tests.forEach(test => {

		it(util.format("correctly tests j(%j) s(%s).", test.args, test.args), () => {

			let thrown;

			if (test.throws) {

				try {
					tools.getNonEmptyArray(test.args);
				}
				catch (error) {
					if (error.message === test.throws) {
						return;
					}

					throw error;
				}

				assert(false);
			}
			else {

				const result = tools.getNonEmptyArray(test.args);
				assert(result === test.args);
			}
		});
	});
});


// not adeq
// describe('getPublicIP', () => {

// 	it("shoud get an ip", cb => {

// 		tools.getPublicIP((err, ip) => {

// 			if (err) {
// 				return cb(err);
// 			}

// 			assert(net.isIP(ip));
// 			cb();
// 		});
// 	})
// });

describe('creditCardExp', () => {

	it("shoud work", () => {

		for (let i = 10000; i < 20000; i++) {

			const exp = i.toString().substr(1);
			if (tools.isCreditCardExp(exp)) {
				const month = exp.substr(0, 2);
				const year = exp.substr(2);

				assert(month.length === 2);
				const monthValue = parseInt(month);
				assert(1 <= monthValue);
				assert(monthValue <= 12);

				assert(year.length === 2);
			}
		}
	})
});

describe('assert', () => {

	const scenarios = [
		{ value: true },
		{ value: 1 },
		{ value: "yes" },
		{ value: {} },
		{ throws: "assertion failed." },
		{ value: null, throws: "assertion failed." },
		{ value: false, throws: "assertion failed." },
		{ value: 0, message: "zero", throws: "assertion failed: \"zero\"." }
	];

	for (const scenario of scenarios) {

		it(util.format("shoud handle (%j)", scenario.value), () => {

			if (scenario.throws) {

				try {
					tools.assert(scenario.value, scenario.message);
				}
				catch (error) {

					if (error.message === scenario.throws) {
						return;
					}

					throw error;
				}

				assert(false);
			}
			else {

				tools.assert(scenario.value);
			}
		})
	}
});

describe('assertEqual', () => {

	const scenarios = [
		{ value: true, expected: true },
		{ value: false, expected: false },
		{ value: 1, expected: 0, throws: "(1) is not as expected (0)." },
		{ value: 1, expected: 0, name: "arg", throws: "arg (1) is not as expected (0)." },
		{ value: 1, expected: "1", name: "arg", throws: "arg (1) is not as expected (\"1\")." }
	];

	for (const scenario of scenarios) {

		it(util.format("shoud handle (%j, %j)", scenario.value, scenario.expected), () => {

			if (scenario.throws) {

				try {
					tools.assertEqual(scenario.value, scenario.expected, scenario.name);
				}
				catch (error) {

					if (error.message === scenario.throws) {
						return;
					}

					throw error;
				}

				assert(false);
			}
			else {

				tools.assertEqual(scenario.value, scenario.expected, scenario.name);
			}
		})
	}
});
