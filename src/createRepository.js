class RepositoryBase {

	query(params) {
		return this.da.query(params);
	}
};

RepositoryBase.prototype.da = null;


function createRepository(request) {

	const {
		prefix,
		tables: tableDefinitions
	} = request;

	if (prefix === undefined) {
		// ok
	}
	else if (typeof prefix === "string") {
		// ok
	}
	else {
		throw new Error();
	}

	class Repository extends RepositoryBase { };
	const {
		prototype
	} = Repository;

	for (const rawTableName in tableDefinitions) {

		const tableDefinition = tableDefinitions[
			rawTableName
		];

		const tableName = prefix === undefined ? rawTableName : `${prefix}${rawTableName}`;

		const {
			hash: hashName,
			range: rangeName,
			version: versionName,
			ttl,
			methods: methodDefinitions
		} = tableDefinition;

		if (hashName === undefined) {
			throw new Error();
		}

		if (typeof hashName === "string") {
			if (0 < hashName.length) {
				// ok
			}
			else {
				throw new Error();
			}
		}
		else {
			throw new Error();
		}

		if (versionName === undefined) {
			// ok
		}
		else if (typeof versionName === "string") {
			if (0 < versionName.length) {
				// ok
			}
			else {
				throw new Error();
			}
		}
		else {
			throw new Error();
		}

		if (ttl === undefined) {
			// ok
		}
		else if (Number.isInteger(ttl)) {

			if (ttl < 0) {
				throw new Error();
			}
		}
		else {
			throw new Error();
		}

		for (const methodName in methodDefinitions) {

			if (prototype[methodName] === undefined) {
				// ok
			}
			else {
				throw new Error();
			}

			const methodDefinition = methodDefinitions[
				methodName
			];

			if (typeof methodDefinition === "string") {
				// ok
			}
			else {
				throw new Error();
			}

			const parts = methodDefinition.match(/[^ \t\r\n]+/g);
			if (parts === null) {
				throw new Error();
			}

			const type = parts[0];

			switch (type) {

				case "put":

					prototype[methodName] = function (item) {

						return this.da.put(
							tableName,
							item
						);
					};

					break;

				case "create":

					prototype[methodName] = function (item) {

						return this.da.create(
							tableName,
							hashName,
							item
						);
					};

					break;

				case "create-or-get":

					if (rangeName === undefined) {

						prototype[methodName] = function (item) {

							return this.da.createOrGet(
								tableName,
								hashName,
								item
							);
						};
					}
					else {

						prototype[methodName] = function (item) {

							return this.da.createOrGetRanged(
								tableName,
								hashName,
								rangeName,
								item
							);
						};
					}

					break;

				case "get-or-create":

					if (rangeName === undefined) {

						prototype[methodName] = function (item) {

							return this.da.getOrCreate(
								tableName,
								hashName,
								item
							);
						};
					}
					else {

						prototype[methodName] = function (item) {

							return this.da.getOrCreateRanged(
								tableName,
								hashName,
								rangeName,
								item
							);
						};
					}

					break;

				case "create-versioned":

					if (versionName === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (item) {

						return this.da.createVersioned(
							tableName,
							hashName,
							versionName,
							item
						);
					};

					break;

				case "create-cached-versioned":

					if (versionName === undefined) {
						throw new Error();
					}

					if (ttl === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (item) {

						return this.da.createCachedVersioned(
							ttl,
							tableName,
							hashName,
							rangeName,
							versionName,
							item
						);
					};

					break;

				case "get":

					if (rangeName === undefined) {

						prototype[methodName] = function (hash) {

							return this.da.get(
								tableName,
								hashName,
								hash
							);
						};

					}
					else {

						prototype[methodName] = function (hash, range) {

							return this.da.get(
								tableName,
								hashName,
								hash,
								rangeName,
								range
							);
						};
					}

					break;

				case "get-consistent":

					prototype[methodName] = function (hash, range) {

						return this.da.getConsistent(
							tableName,
							hashName,
							hash,
							rangeName,
							range
						);
					};

					break;

				case "remove":

					prototype[methodName] = function (hash, range) {

						return this.da.remove(
							tableName,
							hashName,
							hash,
							rangeName,
							range
						);
					}
					break;

				case "remove-versioned":

					if (versionName === undefined) {
						throw new Error();
					}

					if (rangeName === undefined) {

						prototype[methodName] = function (item) {

							return this.da.removeVersioned(
								tableName,
								hashName,
								versionName,
								item
							);
						};
					}
					else {

						prototype[methodName] = function (item) {

							return this.da.removeRangedVersioned(
								tableName,
								hashName,
								rangeName,
								versionName,
								item
							);
						};
					}

					break;

				case "remove-cached-versioned":

					if (versionName === undefined) {
						throw new Error();
					}

					if (rangeName === undefined) {

						prototype[methodName] = function (item) {

							return this.da.removeCachedVersioned(
								tableName,
								hashName,
								undefined,
								versionName,
								item
							);
						};
					}
					else {

						prototype[methodName] = function (item) {

							return this.da.removeCachedVersioned(
								tableName,
								hashName,
								rangeName,
								versionName,
								item
							);
						};
					}

					break;

				case "scan":

					prototype[methodName] = function () {

						return this.da.scan(
							tableName
						);
					};

					break;

				case "scan-cached":

					if (ttl === undefined) {
						throw new Error();
					}

					if (rangeName === undefined) {

						prototype[methodName] = function () {

							return this.da.scanCached(
								ttl,
								tableName,
								hashName
							);
						};
					}
					else {

						prototype[methodName] = function () {

							return this.da.scanRangedCached(
								ttl,
								tableName,
								hashName,
								rangeName
							);
						};
					}

					break;

				case "scan-cached-versioned":

					if (ttl === undefined) {
						throw new Error();
					}

					if (versionName === undefined) {
						throw new Error();
					}

					prototype[methodName] = function () {

						return this.da.scanCachedVersioned(
							ttl,
							tableName,
							hashName,
							rangeName,
							versionName
						);
					};

					break;

				case "get-cached":

					if (ttl === undefined) {
						throw new Error();
					}

					if (rangeName === undefined) {

						prototype[methodName] = function (hash) {

							return this.da.getCached(
								ttl,
								tableName,
								hashName,
								hash
							);
						};
					}
					else {

						prototype[methodName] = function (hash, range) {

							return this.da.getCached(
								ttl,
								tableName,
								hashName,
								hash,
								rangeName,
								range
							);
						};
					}

					break;

				case "get-cached-versioned":

					if (versionName === undefined) {
						throw new Error();
					}

					if (ttl === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (hash) {

						return this.da.getCachedVersioned(
							ttl,
							tableName,
							hashName,
							hash,
							versionName
						);
					};

					break;

				case "batch-get":

					prototype[methodName] = function (hashes) {

						return this.da.batchGet(
							tableName,
							hashName,
							hashes
						);
					};

					break;

				case "batch-get-cached":

					if (ttl === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (hashes) {

						return this.da.batchGetCached(
							ttl,
							tableName,
							hashName,
							hashes
						);
					};

					break;

				case "batch-get-cached-versioned":

					if (versionName === undefined) {
						throw new Error();
					}

					if (ttl === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (hashes) {

						return this.da.batchGetCachedVersioned(
							ttl,
							tableName,
							hashName,
							versionName,
							hashes
						);
					};

					break;

				case "query-table": {

					prototype[methodName] = function (hash) {

						return this.da.queryTable(
							tableName,
							hashName,
							hash
						);
					};

					break;
				}

				case "query-table-cached": {

					if (ttl === undefined) {
						throw new Error();
					}

					if (rangeName === undefined) {

						throw new Error();
					}
					else {

						prototype[methodName] = function (hash) {

							return this.da.queryTableRangedCached(
								ttl,
								tableName,
								hashName,
								rangeName,
								hash
							);
						};
					}

					break;
				}

				case "query-index": {

					let indexName;
					let desc = false;
					switch (parts.length) {

						case 2:
							indexName = parts[1];
							break;

						case 3:
							indexName = parts[1];
							desc = parts[2] === "desc";
							break;

						default:
							throw new Error();
					}

					const indexDefinition = tableDefinition.indices[
						indexName
					];

					if (indexDefinition === undefined) {
						throw new Error();
					}

					const {
						hash: indexHashName,
						range: indexRangeName
					} = indexDefinition;

					if (indexHashName === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (indexHash) {

						return this.da.queryIndex(
							tableName,
							indexName,
							indexHashName,
							indexHash,
							desc
						);
					};

					break;
				}

				case "query-index-ranged": {

					let indexName;
					let desc = false;
					switch (parts.length) {

						case 2:
							indexName = parts[1];
							break;

						case 3:
							indexName = parts[1];
							desc = parts[2] === "desc";
							break;

						default:
							throw new Error();
					}

					const indexDefinition = tableDefinition.indices[
						indexName
					];

					if (indexDefinition === undefined) {
						throw new Error();
					}

					const {
						hash: indexHashName,
						range: indexRangeName
					} = indexDefinition;

					if (indexHashName === undefined) {
						throw new Error();
					}

					if (indexRangeName === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (indexHash, indexRangeStart, indexRangeEnd) {

						return this.da.queryIndexRanged(
							tableName,
							indexName,
							indexHashName,
							indexHash,
							indexRangeName,
							indexRangeStart,
							indexRangeEnd,
							desc
						);
					};

					break;
				}

				case "query-index-cached": {

					if (ttl === undefined) {
						throw new Error();
					}

					let indexName;
					let desc = false;
					switch (parts.length) {

						case 2:
							indexName = parts[1];
							break;

						case 3:
							indexName = parts[1];
							desc = parts[2] === "desc";
							break;

						default:
							throw new Error();
					}

					const indexDefinition = tableDefinition.indices[
						indexName
					];

					if (indexDefinition === undefined) {
						throw new Error();
					}

					const {
						hash: indexHashName,
						range: indexRangeName
					} = indexDefinition;

					if (indexHashName === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (indexHash) {

						return this.da.queryIndexCached(
							ttl,
							tableName,
							hashName,
							rangeName,
							indexName,
							indexHashName,
							indexHash,
							desc
						);
					};

					break;
				}

				case "query-index-cached-versioned": {

					if (versionName === undefined) {
						throw new Error();
					}

					if (ttl === undefined) {
						throw new Error();
					}

					let indexName;
					switch (parts.length) {

						case 2:
							indexName = parts[1];
							break;

						case 3:
							indexName = parts[1];
							break;

						default:
							throw new Error();
					}

					const indexDefinition = tableDefinition.indices[
						indexName
					];

					if (indexDefinition === undefined) {
						throw new Error();
					}

					const {
						hash: indexHashName,
						range: indexRangeName
					} = indexDefinition;

					if (indexHashName === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (indexHash) {

						return this.da.queryIndexCachedVersioned(
							ttl,
							tableName,
							hashName,
							rangeName,
							indexName,
							indexHashName,
							indexHash,
							versionName
						);
					};

					break;
				}

				case "query-index-first": {

					let indexName;
					let desc = false;
					switch (parts.length) {

						case 2:
							indexName = parts[1];
							break;

						case 3:
							indexName = parts[1];
							desc = parts[2] === "desc";
							break;

						default:
							throw new Error();
					}

					const indexDefinition = tableDefinition.indices[
						indexName
					];

					if (indexDefinition === undefined) {
						throw new Error();
					}

					const {
						hash: indexHashName,
						range: indexRangeName
					} = indexDefinition;

					if (indexHashName === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (indexHash) {

						return this.da.queryIndexFirst(
							tableName,
							indexName,
							indexHashName,
							indexHash,
							desc
						);
					};

					break;
				}

				case "delete":

					if (rangeName === undefined) {

						prototype[methodName] = function (hash) {

							return this.da.delete(
								tableName,
								hashName,
								undefined,
								hash,
								undefined
							);
						};
					}
					else {

						prototype[methodName] = function (hash, range) {

							return this.da.delete(
								tableName,
								hashName,
								rangeName,
								hash,
								range
							);
						};
					}

					break;

				case "delete-cached":

					if (rangeName === undefined) {

						prototype[methodName] = function (hash) {

							return this.da.deleteCached(
								tableName,
								hashName,
								hash
							);
						};
					}
					else {

						prototype[methodName] = function (hash, range) {

							return this.da.deleteCached(
								tableName,
								hashName,
								hash,
								rangeName,
								range
							);
						};
					}

					break;

				case "update":

					prototype[methodName] = function (item) {

						return this.da.update(
							tableName,
							hashName,
							item
						);
					};

					break;

				case "update-versioned":

					if (versionName === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (item) {

						return this.da.updateVersioned(
							tableName,
							versionName,
							item
						);
					};

					break;

				case "update-cached-versioned":

					if (versionName === undefined) {
						throw new Error();
					}

					if (ttl === undefined) {
						throw new Error();
					}

					prototype[methodName] = function (item) {

						return this.da.updateCachedVersioned(
							ttl,
							tableName,
							hashName,
							rangeName,
							versionName,
							item
						);
					};

					break;

				default:
					throw new Error(type);
			}
		}

	}

	return Repository;
}

module.exports = {
	createRepository
};
