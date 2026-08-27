import {
    IQueryConfig,
    IQueryParams,
    IQueryResult,
    PrismaCountArgs,
    PrismaFindManyArgs,
    PrismaModelDelegate,
    PrismaNumberFilterParms,
    PrismaStringFilterParms,
    PrismaWhereCondition,
} from "../interface/query.Interface";

export class QueryBuilder<
    T,
    TWhereInput = Record<string, unknown>,
    TInclude = Record<string, unknown>,
> {
    private query: PrismaFindManyArgs;
    private countQuery: PrismaCountArgs;
    private page: number = 1;
    private limit: number = 10;
    private skip: number = 0;
    private sortBy: string = "createdAt";
    private sortOrder: "asc" | "desc" = "desc";
    private selectFields: Record<string, boolean> | undefined;

    constructor(
        private model: PrismaModelDelegate,
        private queryParams: IQueryParams,
        private config: IQueryConfig = {},
    ) {
        this.query = {
            where: {},
            include: {},
            orderBy: {},
            skip: 0,
            take: 10,
        };
        this.countQuery = {
            where: {},
        };
    }

    search(): this {
        const { searchTerm } = this.queryParams;
        const { searchableFields } = this.config;

        // No search term or searchable fields
        if (!searchTerm || !searchableFields || searchableFields.length === 0) {
            return this;
        }

        const searchValue = String(searchTerm).trim();

        if (!searchValue) {
            return this;
        }

        const searchConditions: Record<string, unknown>[] = [];

        searchableFields.forEach((field) => {
            const parts = field.split(".").filter(Boolean);

            if (parts.length === 0) {
                return;
            }

            // -----------------------------------------
            // Direct field
            // Example:
            // ?searchTerm=john
            //
            // searchableFields: ["name", "email"]
            // -----------------------------------------

            if (parts.length === 1) {
                const [fieldName] = parts;

                searchConditions.push({
                    [fieldName]: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                });

                return;
            }

            // -----------------------------------------
            // relation.field
            //
            // Example:
            // searchableFields: ["user.name"]
            //
            // Result:
            // {
            //     user: {
            //         name: {
            //             contains: "john",
            //             mode: "insensitive"
            //         }
            //     }
            // }
            // -----------------------------------------

            if (parts.length === 2) {
                const [relation, nestedField] = parts;

                searchConditions.push({
                    [relation]: {
                        [nestedField]: {
                            contains: searchValue,
                            mode: "insensitive",
                        },
                    },
                });

                return;
            }

            // -----------------------------------------
            // relation.nestedRelation.field
            //
            // Example:
            // searchableFields: ["user.profile.name"]
            //
            // Result:
            // {
            //     user: {
            //         profile: {
            //             name: {
            //                 contains: "john",
            //                 mode: "insensitive"
            //             }
            //     }
            // }
            // -----------------------------------------

            if (parts.length === 3) {
                const [relation, nestedRelation, nestedField] = parts;

                searchConditions.push({
                    [relation]: {
                        [nestedRelation]: {
                            [nestedField]: {
                                contains: searchValue,
                                mode: "insensitive",
                            },
                        },
                    },
                });

                return;
            }
        });

        // No valid search conditions
        if (searchConditions.length === 0) {
            return this;
        }

        // Apply search to main query
        const whereCondition = this.query.where as PrismaWhereCondition;

        whereCondition.OR = searchConditions;

        // Apply the same search to count query
        const countWhereCondition = this.countQuery
            .where as PrismaWhereCondition;

        countWhereCondition.OR = searchConditions;

        return this;
    }

    filter(): this {
        const { filterableFields } = this.config;

        const excludedFields = [
            "searchTerm",
            "page",
            "limit",
            "sortBy",
            "sortOrder",
            "fields",
            "include",
        ];

        const queryWhere = this.query.where as Record<string, unknown>;
        const countQueryWhere = this.countQuery.where as Record<
            string,
            unknown
        >;

        // Get only filter parameters
        const filterParams: Record<string, unknown> = {};

        Object.entries(this.queryParams).forEach(([key, value]) => {
            if (!excludedFields.includes(key)) {
                filterParams[key] = value;
            }
        });

        Object.entries(filterParams).forEach(([key, value]) => {
            // Ignore empty values
            if (
                value === undefined ||
                value === null ||
                value === "" ||
                (Array.isArray(value) && value.length === 0)
            ) {
                return;
            }

            // Only allow configured filterable fields
            if (
                filterableFields &&
                filterableFields.length > 0 &&
                !filterableFields.includes(key)
            ) {
                return;
            }

            const parsedValue =
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value)
                    ? this.parseRangeFilterValue(
                          value as Record<string, string | number>,
                      )
                    : this.parseFilterValue(value);

            // -----------------------------------------
            // Handle nested relation filters
            // Example:
            // ?user.gender=MALE
            // ?user.profile.age=25
            // -----------------------------------------

            if (key.includes(".")) {
                const parts = key.split(".");

                let queryTarget = queryWhere;
                let countTarget = countQueryWhere;

                parts.forEach((part, index) => {
                    const isLastPart = index === parts.length - 1;

                    if (isLastPart) {
                        queryTarget[part] = parsedValue;
                        countTarget[part] = parsedValue;
                        return;
                    }

                    if (!queryTarget[part]) {
                        queryTarget[part] = {};
                    }

                    if (!countTarget[part]) {
                        countTarget[part] = {};
                    }

                    queryTarget = queryTarget[part] as Record<string, unknown>;
                    countTarget = countTarget[part] as Record<string, unknown>;
                });

                return;
            }

            // -----------------------------------------
            // Normal field filter
            // Example:
            // ?gender=MALE
            // ?isDeleted=false
            // -----------------------------------------

            queryWhere[key] = parsedValue;
            countQueryWhere[key] = parsedValue;
        });

        return this;
    }

    paginate(): this {
        const page = parseInt(this.queryParams.page || "1", 10);
        const limit = parseInt(this.queryParams.limit || "10", 10);
        this.page = page > 0 ? page : 1;
        this.limit = limit > 0 ? limit : 10;
        this.skip = (this.page - 1) * limit;
        this.query.skip = this.skip;
        this.query.take = this.limit;

        return this;
    }
    sort(): this {
        const sortBy = this.queryParams.sortBy || "createdAt";
        const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        if (sortBy.includes(".")) {
            const parts = sortBy.split(".");
            if (parts.length === 2) {
                const [relation, nestedField] = parts;
                this.query.orderBy = {
                    [relation]: { [nestedField]: sortOrder },
                };
            } else if (parts.length === 3) {
                const [relation, nestedRelation, nestedField] = parts;
                this.query.orderBy = {
                    [relation]: {
                        [nestedRelation]: { [nestedField]: sortOrder },
                    },
                };
            } else {
                this.query.orderBy = {
                    [sortBy]: sortOrder,
                };
            }
        }
        return this;
    }
    fields(): this {
        const fieldsParam = this.queryParams.fields;

        // no nesting fields selection is supported, only direct fields can be selected
        if (fieldsParam && typeof fieldsParam === "string") {
            const fieldsArray = fieldsParam
                ? fieldsParam.split(",").map((f) => f.trim())
                : [];
            this.selectFields = {};
            fieldsArray.forEach((field) => {
                if (this.selectFields) {
                    this.selectFields[field] = true;
                }
            });
            this.query.select = this.selectFields as Record<
                string,
                boolean | Record<string, unknown>
            >;
            delete this.query.include;
        }

        return this;
    }
    include(relation: TInclude): this {
        if (this.selectFields !== null) {
            return this;
        }
        // if fields method is use, include methos will be ignored. because select and include cannot be used together in Prisma queries
        this.query.include = {
            ...(this.query.include as Record<string, unknown>),
            ...(relation as Record<string, unknown>),
        };
        return this;
    }
    dynamicInclude(
        includeConfig: Record<string, unknown>,
        defaultInclude?: string[],
    ): this {
        if (this.selectFields) {
            return this;
        }
        const result: Record<string, unknown> = {};
        defaultInclude?.forEach((f) => {
            if (includeConfig[f]) {
                result[f] = includeConfig[f];
            }
        });
        const includesParam = this.queryParams.includes as string | undefined;
        if (includesParam && typeof includesParam === "string") {
            const requestedRelation = includesParam
                .split(",")
                .map((r) => r.trim());
            requestedRelation.forEach((r) => {
                if (includeConfig[r]) {
                    result[r] = includeConfig[r];
                }
            });
        }
        this.query.include = {
            ...(this.query.include as Record<string, unknown>),
            ...result,
        };
        return this;
    }
    where(condition: TWhereInput): this {
        this.query.where = this.deepMerge(
            this.query.where as Record<string, unknown>,
            condition as Record<string, unknown>,
        );
        this.countQuery.where = this.deepMerge(
            this.countQuery.where as Record<string, unknown>,
            condition as Record<string, unknown>,
        );
        return this;
    }
    async execute(): Promise<IQueryResult<T>> {
        const [total, data] = await Promise.all([
            this.model.count(
                this.countQuery as Parameters<typeof this.model.count>[0],
            ),
            this.model.findMany(
                this.query as Parameters<typeof this.model.findMany>[0],
            ),
        ]);
        const totalPages = Math.ceil(total / this.limit);
        return {
            data: data as T[],
            meta: {
                page: this.page,
                limit: this.limit,
                total,
                totalPages,
            },
        };
    }
    async count(): Promise<number> {
        return await this.model.count(
            this.countQuery as Parameters<typeof this.model.count>[0],
        );
    }
    getQuery(): PrismaFindManyArgs {
        return this.query as PrismaFindManyArgs;
    }
    private deepMerge(
        target: Record<string, unknown>,
        source: Record<string, unknown>,
    ): Record<string, unknown> {
        const result = { ...target };
        for (const key in source) {
            if (
                source[key] &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
            ) {
                if (
                    result[key] &&
                    typeof result[key] === "object" &&
                    !Array.isArray(result[key])
                ) {
                    result[key] = this.deepMerge(
                        result[key] as Record<string, unknown>,
                        source[key] as Record<string, unknown>,
                    );
                } else {
                    result[key] = source[key];
                }
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }
    private parseFilterValue(value: unknown): unknown {
        if (value === "true") {
            return true;
        }
        if (value === "false") {
            return false;
        }
        if (
            typeof value === "string" &&
            !isNaN(Number(value)) &&
            value.trim() !== ""
        ) {
            return Number(value);
        }
        if (Array.isArray(value)) {
            return {
                in: value.map((v) => this.parseFilterValue(v)),
            };
        }
        return value;
    }
    private parseRangeFilterValue(
        value: Record<string, string | number>,
    ):
        | PrismaNumberFilterParms
        | PrismaStringFilterParms
        | Record<string, string | number> {
        const rangeFilter: Record<
            string,
            string | number | (string | number)[]
        > = {};
        Object.keys(value).forEach((operator) => {
            const operatorValue = value[operator];
            const parsedValue: string | number =
                typeof operatorValue === "string" &&
                !isNaN(Number(operatorValue))
                    ? Number(operatorValue)
                    : operatorValue;

            switch (operator) {
                case "equals":
                case "lte":
                case "gte":
                case "gt":
                case "lt":
                case "not":
                case "contains":
                case "startsWith":
                case "endsWith":
                    rangeFilter[operator] = parsedValue;
                    break;
                case "in":
                case "notIn":
                    if (Array.isArray(operatorValue)) {
                        rangeFilter[operator] = operatorValue;
                    } else {
                        rangeFilter[operator] = [parsedValue];
                    }
                    break;
                default:
                    break;
            }
        });
        return Object.keys(rangeFilter).length > 0 ? rangeFilter : value;
    }
}
