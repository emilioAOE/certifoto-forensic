import { CompareView } from "@/components/comparison/CompareView";

export const metadata = {
  title: "Comparar acta",
};

export default function CompararPage({
  params,
}: {
  params: { id: string };
}) {
  return <CompareView actaId={params.id} />;
}
