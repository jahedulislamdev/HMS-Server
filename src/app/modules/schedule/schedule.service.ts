import { addHours, addMinutes, format } from "date-fns";
import {
    ICreateSchedulePayload,
    IUpdateSchedulePayload,
} from "./schedule.interface";
import { convertDateTime } from "./schedule.utils";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import { IQueryParams } from "../../interface/query.Interface";
import {
    scheduleFilterableFields,
    scheduleIncludeConfig,
    scheduleSearchableFields,
} from "./schedule.constant";
import AppError from "../../helper/AppError";
import { StatusCodes } from "http-status-codes";

const createSchedules = async (payload: ICreateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;
    const interval = 30;
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    const schedules = [];

    while (currentDate <= lastDate) {
        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0]),
                ),
                Number(startTime.split(":")[1]),
            ),
        );
        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0]),
                ),
                Number(endTime.split(":")[1]),
            ),
        );
        while (startDateTime < endDateTime) {
            const s = await convertDateTime(startDateTime);
            const e = await convertDateTime(
                addMinutes(startDateTime, interval),
            );

            const scheduleData = {
                startDateTime: s,
                endDateTime: e,
            };
            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime,
                },
            });
            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData,
                });
                schedules.push(result);
                startDateTime.setMinutes(startDateTime.getMinutes() + interval);
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedules;
};
const getAllSchedules = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        Schedule,
        Prisma.ScheduleWhereInput,
        Prisma.ScheduleInclude
    >(prisma.schedule, query, {
        searchableFields: scheduleSearchableFields,
        filterableFields: scheduleFilterableFields,
    });
    const result = await queryBuilder
        .search()
        .filter()
        .sort()
        .paginate()
        .dynamicInclude(scheduleIncludeConfig)
        .fields()
        .execute();

    return result;
};
const getSchedule = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: {
            id: id,
        },
    });
    if (!schedule) {
        throw new AppError(StatusCodes.NOT_FOUND, "Schedule not found");
    }
    return schedule;
};

const updateSchedules = async ({
    id,
    payload,
}: {
    id: string;
    payload: IUpdateSchedulePayload;
}) => {
    const schedule = await prisma.schedule.findUnique({
        where: {
            id: id,
        },
    });
    if (!schedule) {
        throw new AppError(StatusCodes.NOT_FOUND, "Schedule not found");
    }
    const { startDate, endDate, startTime, endTime } = payload;
    const startDateTime = new Date(
        addMinutes(
            addHours(
                `${format(new Date(startDate), "yyyy-MM-dd")}`,
                Number(startTime.split(":")[0]),
            ),
            Number(startTime.split(":")[1]),
        ),
    );

    const endDateTime = new Date(
        addMinutes(
            addHours(
                `${format(new Date(endDate), "yyyy-MM-dd")}`,
                Number(endTime.split(":")[0]),
            ),
            Number(endTime.split(":")[1]),
        ),
    );
    const result = await prisma.schedule.update({
        where: {
            id: id,
        },
        data: {
            startDateTime,
            endDateTime,
        },
    });
    return result;
};
const deleteSchedules = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: {
            id: id,
        },
    });
    if (!schedule) {
        throw new AppError(StatusCodes.NOT_FOUND, "Schedule not found");
    }
    const result = await prisma.schedule.delete({
        where: {
            id: id,
        },
    });
    return result;
};

export const scheduleService = {
    createSchedules,
    getSchedule,
    getAllSchedules,
    updateSchedules,
    deleteSchedules,
};
