import { Landing } from "@/components/landing/Landing";
import { JsonLd } from "@/components/seo/JsonLd";
import { homeGraph } from "@/lib/structured-data";

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeGraph()} />
      <Landing />
    </>
  );
}
