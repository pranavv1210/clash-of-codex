import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { repositoryCityFor } from "@/lib/github";
import CityDashboard from "@/features/city/city-dashboard";

export default async function City({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/");
  const { repoId } = await params;
  let city;
  let error = "";
  try {
    city = await repositoryCityFor(user.id, repoId);
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "The repository scan failed.";
  }
  if (!city && !error) notFound();
  return <CityDashboard city={city || null} error={error} />;
}
