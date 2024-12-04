import { useForm } from "react-hook-form"
import { z } from "zod";

const schema = z.object({
    name: z.string()
})

export default function EventForm() {
    const form = useForm<z.infer<typeof schema>>()

    return (
        <div>EventForm</div>
    )
}
