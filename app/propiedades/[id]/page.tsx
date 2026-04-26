import { PropertyDetail } from "@/components/properties/PropertyDetail";

export default function PropiedadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <PropertyDetail propertyId={params.id} />;
}
