import Chat from "@/app/components/Chat/Chat";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  return <Chat id={id} />;
}
