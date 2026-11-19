"use client";

import { use } from "react";
import AdminFasilitasForm from "@/components/admin/AdminFasilitasForm";

export default function EditFasilitasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const fasilitasId = Number(id);

  return <AdminFasilitasForm mode="edit" fasilitasId={fasilitasId} />;
}
