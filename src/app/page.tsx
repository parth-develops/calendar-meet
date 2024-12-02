import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId != null) redirect("/events");

  return (
    <div className="text-center container my-4 mx-auto">
      <h1 className="text-3xl">Fancy asjk</h1>
      <div className="flex gap-2 justify-center">
        <Button asChild>
          <SignInButton />
        </Button>
        <Button>
          <SignUpButton />
        </Button>
        <UserButton />
      </div>
    </div>
  );
}
