"use client";

import BreadCrumb from "../../../../components/admin/breadCrumb"; // Changed to PascalCase
import UploadMedia from "../../../../components/admin/UploadMedia";

export default function MediaPage() {
 

  return (
    <>
      <BreadCrumb /> {/* Changed to PascalCase */}
      <UploadMedia />
      
    </>
  );
}