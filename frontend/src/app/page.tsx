import { redirect } from "next/navigation";

// Root page redirects to the citizen portal
export default function RootPage() {
  redirect("/citizen");
}
