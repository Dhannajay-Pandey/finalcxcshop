"use client";

import BreadCrumb from "../../../../components/Admin/breadCrumb"; // Changed to PascalCase
import UploadMedia from "../../../../components/Admin/UploadMedia";

export default function MediaPage() {
 

  return (
    <>
      <BreadCrumb /> {/* Changed to PascalCase */}
      <UploadMedia />
      
    </>
  );
}