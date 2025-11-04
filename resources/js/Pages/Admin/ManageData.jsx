import React from "react";
import AdminLayout from "./Layout/AdminLayout";

export default function ManageData() {
  return (
    <AdminLayout title="Manage Data">
      <p className="text-gray-600">
        Manage patient records, ANC data, and delivery outcomes here.
      </p>
    </AdminLayout>
  );
}
