import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react"

export default async function AuthLayout(props: PropsWithChildren) {
    const { userId } = await auth();

    if (userId !== null) redirect("/")

    return (
        <div className="flex min-h-screen flex-col justify-center items-center">
            {props.children}
        </div>
    )
}
