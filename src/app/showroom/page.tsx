import { notFound } from "next/navigation";
import Showroom from "@/features/showroom/showroom";
import { currentUser } from "@/lib/session";
import { canAccessProductionShowroom } from "@/lib/showroom-access";

export default async function ShowroomPage() {
  if (process.env.NODE_ENV === "production") {
    const user = await currentUser();
    if (
      !canAccessProductionShowroom(
        user?.login,
        process.env.SHOWROOM_OWNER_GITHUB_LOGIN,
      )
    )
      notFound();
  }
  return <Showroom />;
}
