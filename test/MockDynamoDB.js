"use strict";
const assert = require("assert");
const dynalite = require("dynalite");
const aws = require("aws-sdk");
const { NoLog, tools } = require("..");

class MockDynamoDB {

	async start() {

		this.log.trace(
			"starting dynalite..."
		);

		const dynaliteServer = dynalite({
			createTableMs: 0,
			deleteTableMs: 0
		});

		await new Promise((resolve, reject) => {

			dynaliteServer.once("listening", () => {
				resolve();
			})

			dynaliteServer.listen(this.port);
		});

		const region = "eu-west-1";
		const endpoint = `http://localhost:${this.port}`;

		const dynamoDbClient = new aws.DynamoDB({
			region,
			endpoint
		});

		const ddb = new aws.DynamoDB.DocumentClient({
			region,
			endpoint
		});

		const createTableRequests = this.createTableRequests;

		if (createTableRequests === null) {

		}
		else {

			this.log.trace(
				"creating tables..."
			);

			for (const createTableRequest of createTableRequests) {

				await dynamoDbClient.createTable(
					createTableRequest
				).promise();
			}

			for (const createTableRequest of createTableRequests) {

				for (; ;) {

					const response = await dynamoDbClient.describeTable({
						TableName: createTableRequest.TableName
					}).promise();

					if (response.Table.TableStatus === "ACTIVE") {
						break;
					}

					await new Promise((resolve, reject) => {
						setTimeout(() => {
							resolve();
						}, 5);
					});
				}
			}

			const items = this.items;
			if (items === null) {

			}
			else {

				this.log.trace(
					"putting items..."
				);

				for (const tableName in items) {
					for (const item of items[tableName]) {

						await ddb.put({
							TableName: tableName,
							Item: item
						}).promise();
					}
				}
			}
		}

		this.log.trace(
			"dynalite ready."
		);

		this.dynaliteServer = dynaliteServer;
		this.dynamoDbClient = dynamoDbClient;
		this.ddb = ddb;
	}

	async stop() {

		this.log.trace(
			"closing dynalite..."
		);

		await new Promise((resolve, reject) => {
			this.dynaliteServer.once("close", resolve);
			this.dynaliteServer.close();
		});

		this.ddb = null;
		this.dynamoDbClient = null;
		this.dynaliteServer = null;
	}
}

MockDynamoDB.prototype.log = NoLog.instance;
MockDynamoDB.prototype.port = 8000;
MockDynamoDB.prototype.createTableRequests = null;
MockDynamoDB.prototype.items = null;
MockDynamoDB.prototype.dynaliteServer = null;
MockDynamoDB.prototype.dynamoDbClient = null;
MockDynamoDB.prototype.ddb = null;

module.exports = {
	MockDynamoDB
};