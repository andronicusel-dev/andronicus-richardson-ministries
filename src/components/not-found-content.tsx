import Link from "next/link";
import { PageHero } from "@/components/ui";

export function NotFoundContent() {
  return (
    <PageHero
      eyebrow="Page not found"
      title="We could not find that page."
      lead="It may have been moved or taken down. Here is where most people are headed."
    >
      <div className="rise rise-3 mt-10 flex flex-col gap-4 sm:flex-row">
        <Link href="/" className="btn btn-brass">
          Back to the home page
        </Link>
        <Link href="/sermons" className="btn btn-light">
          Sermons
        </Link>
        <Link href="/contact" className="btn btn-light">
          Visit & contact
        </Link>
      </div>
    </PageHero>
  );
}
