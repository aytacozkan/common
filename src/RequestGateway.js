"use strict";
const { parse: parseUrl } = require("url");
const { validate } = require("./validate");

class RequestGateway {

	async onRequest(request, response) {

		function ok(data) {

			respond(
				"ok",
				data
			);
		};

		function fault(fault, data) {

			respond(
				fault,
				data
			);
		};

		function respond(code, data) {

			const payload = Buffer.from(JSON.stringify({
				code,
				data
			}));

			response.statusCode = 200;

			if (cors) {

				response.setHeader(
					"Access-Control-Allow-Origin",
					"*"
				);
			}

			response.setHeader(
				"Content-Type",
				"application/json; charset=utf-8"
			);

			response.setHeader(
				"Content-Length",
				`${payload.length}`
			);

			response.end(
				payload
			);
		}

		function readRequestContent() {

			return new Promise((resolve, reject) => {

				const chunks = [];

				request.on("data", chunk => {

					chunks.push(
						chunk
					);
				});

				request.once("end", () => {

					if (0 < chunks.length) {
					}
					else {
						resolve();
						return;
					}

					let body;
					try {

						switch (contentType) {

							case "application/x-www-form-urlencoded": {

								const pairs = Buffer.concat(chunks).toString("utf8").split('&');

								body = {};

								for (let pair of pairs) {

									pair = pair.replace(/\+/g, "%20");

									const index = pair.indexOf("=");
									let key;
									let value;

									if (index < 0) {
										key = decodeURIComponent(pair);
										value = "";
									}
									else {
										key = decodeURIComponent(pair.substr(0, index));
										value = decodeURIComponent(pair.substr(index + 1));
									}

									body[key] = value;
								}

								break;
							}

							default:
								body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
								break;
						}
					}
					catch (error) {

						reject(
							error
						);

						return;
					}

					resolve(
						body
					);
				});
			});
		}

		// this fields
		const {
			log,
			api,
			authorizationService,
			requestService,
			instances
		} = this;

		// request fields
		const {
			method: requestMethod,
			url,
			headers: {
				"content-type": contentType
			},
			rawHeaders
		} = request;

		// handler fields
		let authorize;
		let cors;
		let requestSchema;

		const table = api[
			requestMethod
		];

		if (table === undefined) {

			log.warn(
				"%s %s %j",
				requestMethod,
				url,
				rawHeaders
			);

			fault(
				"invalid-request"
			);

			return;
		}

		const {
			pathname
		} = parseUrl(
			url
		);

		const handler = table[
			pathname
		];

		if (handler === undefined) {

			log.warn(
				"%s %s %j",
				requestMethod,
				url,
				rawHeaders
			);

			fault(
				"invalid-request"
			);

			return;
		}

		// read handler fields
		authorize = handler.authorize;
		cors = handler.cors;
		requestSchema = handler.request;

		let authorizationInfo;
		if (authorize) {

			try {
				authorizationInfo = await authorizationService.extract(
					request
				);
			}
			catch (error) {

				switch (error.message) {
					case "invalid-token":
						break;

					default:

						log.error(
							error.message
						);

						break;
				}

				fault(
					"not-authorized"
				);

				return;
			}
		}

		// read any content

		let body;

		switch (requestMethod) {

			case "POST": {

				try {
					body = await readRequestContent();
				}
				catch (error) {

					log.warn(
						error
					);

					fault(
						"invalid-request"
					);
					return;
				}

				request.body = body;
				break;
			}
		}

		// validate request

		if (requestSchema === undefined) {
			// ok
		}
		else {

			const errors = validate(
				requestSchema,
				body,
				"body"
			);

			if (errors === undefined) {
				// ok
			}
			else {

				for (const error of errors) {
					log.warn(
						error
					);
				}

				fault(
					"invalid-request",
					errors
				);

				return;
			}
		}

		// authorize

		let principalId;
		let claims;
		if (authorize) {

			let authorizationResult;

			try {
				authorizationResult = await authorizationService.authorize(
					request,
					authorizationInfo,
					handler.action,
					body || {}
				);
			}
			catch (error) {

				switch (error.message) {
					case "not-authorized":
						break;

					default:
						log.error(
							error.message
						);

						break;
				}

				fault(
					"not-authorized"
				);

				return;
			}

			principalId = authorizationResult.principalId;
			claims = authorizationResult.claims;
		}

		// invoke

		if (handler.handle === undefined) {

			const instanceName = handler.instance;
			const instance = instances[instanceName];

			const methodName = handler.method;
			const async = handler.async;

			const invocationHeaders = {};

			if (async === undefined) {

				let data;
				try {
					data = await instance[methodName](
						{ principalId, claims },
						body
					);
				}
				catch (error) {

					log.warn(
						error
					);

					if (response.finished) {
						// ok
					}
					else if (response.headersSent) {
						response.end();
					}
					else {

						let code;
						const faults = handler.faults;
						if (faults === undefined) {
							code = "internal-error";
						}
						else {
							const fault = faults[error.message];
							if (fault === undefined) {
								code = "internal-error";
							}
							else if (fault === null) {
								code = error.message;
							}
							else {
								code = fault;
							}
						}

						fault(code);
					}

					return;
				}

				// check response

				if (response.finished) {
					// ok
				}
				else if (response.headersSent) {
					response.end();
				}
				else {

					if (handler.response === undefined) {
						ok(data);
					}
					else {

						const errors = validate(
							handler.response,
							data,
							"response"
						);

						if (errors === undefined) {
							ok(data);
						}
						else {
							fault("internal-error");
						}
					}
				}
			}
			else {

				if (requestService === null) {
					throw new Error();
				}

				if (principalId === undefined) {
					throw new Error();
				}

				const {
					serviceId,
					action
				} = handler;

				const {
					requestId
				} = await requestService.beginRequest({
					principalId,
					serviceId,
					action
				});

				ok({
					requestId
				});

				request.requestId = requestId;

				let data;
				try {
					data = await instance[methodName](
						{ principalId, claims, requestId },
						body
					);
				}
				catch (error) {

					log.warn(
						error
					);

					let code;
					const faults = handler.faults;
					if (faults === undefined) {
						code = "internal-error";
					}
					else {
						const fault = faults[error.message];
						if (fault === undefined) {
							code = "internal-error";
						}
						else if (fault === null) {
							code = error.message;
						}
						else {
							code = fault;
						}
					}

					await requestService.completeRequest({
						requestId,
						code
					});

					return;
				}

				if (data === undefined) {
					// ok
				}
				else {

					if (handler.response === undefined) {

						await requestService.completeRequest({
							requestId,
							code: "ok",
							data
						});
					}
					else {

						const errors = validate(
							handler.response,
							data,
							"response"
						);

						if (errors === undefined) {

							await requestService.completeRequest({
								requestId,
								code: "ok",
								data
							});
						}
						else {

							await requestService.completeRequest({
								requestId,
								code: "internal-error"
							});
						}
					}
				}
			}

		}
		else {

			const async = handler.async;

			if (async === undefined) {

				let data;
				try {
					data = await handler.handle(
						request,
						response
					);
				}
				catch (error) {

					log.warn(
						error
					);

					if (response.finished) {
						// ok
					}
					else if (response.headersSent) {
						response.end();
					}
					else {

						let code;
						const faults = handler.faults;
						if (faults === undefined) {
							code = "internal-error";
						}
						else {
							const fault = faults[error.message];
							if (fault === undefined) {
								code = "internal-error";
							}
							else if (fault === null) {
								code = error.message;
							}
							else {
								code = fault;
							}
						}

						fault(code);
					}

					return;
				}

				// check response

				if (response.finished) {
					// ok
				}
				else if (response.headersSent) {
					response.end();
				}
				else {

					if (handler.response === undefined) {
						ok(data);
					}
					else {

						const errors = validate(
							handler.response,
							data,
							"response"
						);

						if (errors === undefined) {
							ok(data);
						}
						else {
							fault("internal-error");
						}
					}
				}
			}
			else {

				if (requestService === null) {
					throw new Error();
				}

				if (principalId === undefined) {
					throw new Error();
				}

				const {
					serviceId,
					action
				} = handler;

				const {
					requestId
				} = await requestService.beginRequest({
					principalId,
					serviceId,
					action
				});

				ok({
					requestId
				});

				request.requestId = requestId;

				let data;
				try {
					data = await handler.handle(
						request
					);
				}
				catch (error) {

					log.warn(
						error
					);

					let code;
					const faults = handler.faults;
					if (faults === undefined) {
						code = "internal-error";
					}
					else {
						const fault = faults[error.message];
						if (fault === undefined) {
							code = "internal-error";
						}
						else if (fault === null) {
							code = error.message;
						}
						else {
							code = fault;
						}
					}

					await requestService.completeRequest({
						requestId,
						code
					});

					return;
				}

				if (data === undefined) {
					// ok
				}
				else {

					if (handler.response === undefined) {

						await requestService.completeRequest({
							requestId,
							code: "ok",
							data
						});
					}
					else {

						const errors = validate(
							handler.response,
							data,
							"response"
						);

						if (errors === undefined) {

							await requestService.completeRequest({
								requestId,
								code: "ok",
								data
							});
						}
						else {

							await requestService.completeRequest({
								requestId,
								code: "internal-error"
							});
						}
					}
				}
			}
		}
	}
}

RequestGateway.prototype.log = null;
RequestGateway.prototype.api = null;
RequestGateway.prototype.authorizationService = null;
RequestGateway.prototype.requestService = null;
RequestGateway.prototype.instances = null;

module.exports = {
	RequestGateway
};