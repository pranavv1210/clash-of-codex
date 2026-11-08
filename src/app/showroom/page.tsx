import { notFound } from "next/navigation";
import Showroom from "@/features/showroom/showroom";
export default function ShowroomPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Showroom />;
}
