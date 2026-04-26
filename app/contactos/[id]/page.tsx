import { ContactDetail } from "@/components/contacts/ContactDetail";

export default function ContactoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ContactDetail contactId={params.id} />;
}
