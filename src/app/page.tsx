import { redirect } from "next/navigation";

/** Always land on login so the shared demo URL shows the sign-in screen */
export default function Home() {
  redirect("/login");
}
