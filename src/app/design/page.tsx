import { notFound } from "next/navigation";
import Gallery from "@/features/design/gallery";
export default function Design() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="shell">
      <div className="page">
        <div className="page-head">
          <span className="label">Internal component gallery</span>
          <h1>Design system</h1>
        </div>
        <Gallery />
      </div>
    </main>
  );
}
