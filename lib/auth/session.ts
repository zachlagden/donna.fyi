import { redirect } from "next/navigation";
import { auth } from "./nextauth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}
