"use client"

import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema } from "@/schema/events";


export default function EventForm() {
    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            isActive: true,
            durationInMinutes: 30
        }
    })

    return (
        <div>EventForm</div>
    )
}
