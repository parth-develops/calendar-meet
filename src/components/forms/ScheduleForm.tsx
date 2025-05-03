"use client"

import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { createEvent, updateEvent } from "@/server/actions/events";
import { Fragment } from "react";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { timeToInt } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { formatTimezoneOffset } from "@/lib/formatters";
import { scheduleFormSchema } from "@/schema/schedule";
import { Plus } from "lucide-react";

type Availability = {
    startTime: string,
    endTime: string,
    dayOfWeek: typeof DAYS_OF_WEEK_IN_ORDER[number]
}

type ScheduleType = { timezone: string, availabilities: Availability[] }

export default function ScheduleForm({ schedule }: { schedule?: ScheduleType }) {

    const form = useForm<z.infer<typeof scheduleFormSchema>>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            timezone: schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            availabilities: schedule?.availabilities.toSorted((a, b) => {
                return timeToInt(a.startTime) - timeToInt(b.startTime)
            })
        }
    })

    async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
        const action = event == null ? createEvent : updateEvent.bind(null, event.id)
        const data = await action(values);

        if (data?.error) {
            form.setError("root", {
                message: "There was an error saving the event"
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6 flex-col">
                {form.formState.errors.root && (
                    <div className="text-destructive text-sm">
                        {form.formState.errors.root.message}
                    </div>
                )}
                <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>TImezone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {
                                        Intl.supportedValuesOf("timeZone").map(timezone => (
                                            <SelectItem key={timezone} value={timezone}>
                                                {timezone}
                                                {`(${formatTimezoneOffset(timezone)})`}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4">
                    {
                        DAYS_OF_WEEK_IN_ORDER.map(dayOfWeek => (
                            <Fragment key={dayOfWeek}>
                                <div className="capitalize text-sm font-semibold">{dayOfWeek.substring(0, 3)}</div>
                                <div className="flex flex-col gap-2">
                                    <Button type="button" className="size-6 p-1" variant="outline" onClick={() => {}}>
                                        <Plus className="size-full"/>
                                    </Button>
                                </div>
                            </Fragment>
                        ))
                    }
                </div>
                <div className="flex gap-2 justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
