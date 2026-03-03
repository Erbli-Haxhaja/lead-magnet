import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HiddenGate } from "./hidden-gate";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/admin/documents");
  }
  return <HiddenGate />;
}
