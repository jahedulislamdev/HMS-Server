import {
    IQueryConfig,
    IQueryParams,
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
    private selectFields: Record<string, boolean | undefined> = {};

    constructor(
        private model: PrismaModelDelegate,
        private queryParams: IQueryParams,
        private config: IQueryConfig,
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
        if (searchTerm && searchableFields && searchableFields.length > 0) {
            const searchConditions: Record<string, unknown>[] =
                searchableFields.map((f) => {
                    if (f.includes(".")) {
                        const parts = f.split(".");
                        if (parts.length === 2) {
                            const [relation, nestedField] = parts;
                            const stringFilter: PrismaStringFilterParms = {
                                contains: searchTerm,
                                mode: "insensitive" as const,
                            };
                            return {
                                [relation]: {
                                    [nestedField]: stringFilter,
                                },
                            };
                        } else if (parts.length === 3) {
                            const [relation, nestedRelation, nestedField] =
                                parts;
                            const stringFilter: PrismaStringFilterParms = {
                                contains: searchTerm,
                                mode: "insensitive" as const,
                            };
                            return {
                                [relation]: {
                                    [nestedRelation]: {
                                        [nestedField]: stringFilter,
                                    },
                                },
                            };
                        }
                    }
                    // direct field
                    const stringFilter: PrismaStringFilterParms = {
                        contains: searchTerm,
                        mode: "insensitive" as const,
                    };
                    return {
                        [f]: stringFilter,
                    };
                });
            const whereCondition = this.query.where as PrismaWhereCondition;
            whereCondition.OR = searchConditions;
            const countWhereConditions = this.countQuery
                .where as PrismaWhereCondition;
            countWhereConditions.OR = searchConditions;
        }
        return this;
    }
    filter(): this {
        const { filterableFields } = this.config;
        const excludedFields = [
            "page",
            "limit",
            "sortBy",
            "sortOrder",
            "fields",
            "includes",
        ];
        const filterParams: Record<string, unknown> = {};

        Object.keys(this.queryParams).forEach((key) => {
            if (!excludedFields.includes(key)) {
                filterParams[key] = this.queryParams[key];
            }
        });

        const queryWhere = this.query.where as Record<string, unknown>;
        const countQueryWhere = this.countQuery.where as Record<
            string,
            unknown
        >;

        Object.keys(filterParams).forEach((key) => {
            const rawValue = filterParams[key];
            if (
                rawValue === undefined ||
                rawValue === null ||
                rawValue === ""
            ) {
                return;
            }

            const isAllowedField =
                !filterableFields ||
                filterableFields.length === 0 ||
                filterableFields.includes(key);
            if (!isAllowedField) {
                return;
            }

            const value = this.parseFilterValue(rawValue);

            if (key.includes(".")) {
                const parts = key.split(".");
                if (filterableFields && !filterableFields.includes(key)) {
                    return;
                }
                if (parts.length === 2) {
                    const [relation, nestedField] = parts;
                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {};
                        countQueryWhere[relation] = {};
                    }
                    queryWhere[relation] = {
                        [nestedField]: this.parseFilterValue(value),
                    };
                    countQueryWhere[relation] = {
                        [nestedField]: this.parseFilterValue(value),
                    };
                    return;
                }

                if (parts.length === 3) {
                    const [relation, nestedRelation, nestedField] = parts;
                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {};
                        countQueryWhere[relation] = {};
                    }
                    queryWhere[relation] = {
                        [nestedRelation]: {
                            [nestedField]: this.parseFilterValue(value),
                        },
                    };
                    countQueryWhere[relation] = {
                        [nestedRelation]: {
                            [nestedField]: this.parseFilterValue(value),
                        },
                    };
                    return;
                }
            }
            // Handle range filters for number and string fields
            if (
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value)
            ) {
                queryWhere[key] = this.parseRangeFilterValue(
                    value as Record<string, string | number>,
                );
                countQueryWhere[key] = this.parseRangeFilterValue(
                    value as Record<string, string | number>,
                );
                return;
            }
            // For simple values, we can directly assign them
            queryWhere[key] = this.parseFilterValue(value);
            countQueryWhere[key] = this.parseRangeFilterValue(
                value as Record<string, string | number>,
            );
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
