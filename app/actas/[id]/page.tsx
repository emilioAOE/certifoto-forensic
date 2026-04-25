import { ActaDetail } from "@/components/acta-detail/ActaDetail";

export default function ActaDetailPage({ params }: { params: { id: string } }) {
  return <ActaDetail actaId={params.id} />;
}
