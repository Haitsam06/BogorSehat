"use client";

import { use } from "react";
import AdminSpesialisasiForm from "@/components/admin/AdminSpesialisasiForm";

export default function EditSpesialisasiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AdminSpesialisasiForm
      mode="edit"
      spesialisasiId={decodeURIComponent(id)}
    />
  );
}
