"use client";

import { use } from "react";
import AdminFaskesForm from "@/components/admin/AdminFaskesForm";

export default function EditFaskesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const faskesId = Number(id);

  return <AdminFaskesForm mode="edit" faskesId={faskesId} />;
}
