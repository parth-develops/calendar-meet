"use client"

import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { createEvent, deleteEvent, updateEvent } from "@/server/actions/events";
import { AlertDialogTrigger, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogDescription, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { useTransition } from "react";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { timeToInt } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Availability = {
    startTime: string,
    endTime: string,
    dayOfWeek: typeof DAYS_OF_WEEK_IN_ORDER[number]
}

type ScheduleType = { timezone: string, availabilities: Availability[] }

export default function ScheduleForm({ schedule }: { schedule?: ScheduleType }) {
    const [isDeletePending, startDeleteTransition] = useTransition();

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
                            <FormLabel>Event Name</FormLabel>
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
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <FormDescription>The name users will see when booking</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="durationInMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>In minutes</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea className="resize-none h-32" {...field} />
                            </FormControl>
                            <FormDescription>Optional description of the event</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormLabel>Active</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormDescription>Inactive events will not be visible for users to book</FormDescription>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <div className="flex gap-2 justify-end">
                    {
                        event && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant={"destructiveGhost"} disabled={isDeletePending || form.formState.isSubmitting}>
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogDescription>
                                        This action can{"'"}t be undone. It will permanently delete this event.
                                    </AlertDialogDescription>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="text-destructive border border-destructive bg-white hover:bg-destructive hover:text-white" disabled={isDeletePending || form.formState.isSubmitting}
                                            onClick={() => {
                                                startDeleteTransition(async () => {
                                                    const data = await deleteEvent(event.id);

                                                    if (data?.error) {
                                                        form.setError("root", {
                                                            message: "There was an error deleting your event"
                                                        })
                                                    }
                                                })
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )
                    }
                    <Button type="button" asChild variant="outline">
                        <Link href="/events">Cancel</Link>
                    </Button>
                    <Button type="submit">
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
