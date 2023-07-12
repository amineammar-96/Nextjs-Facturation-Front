"use client";
import Image from "next/image";
import '../globals.css'
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import InvoicesList from "../components/InvoicesList";
// import { useRouter } from 'next/router';
import { useRouter } from 'next/navigation';

import React, { useEffect } from "react";

export default function GenerateInvoicesComponent() {

 


  return (
    <main className="mainFitst mt-5 mainFacturation">
      
      <InvoicesList></InvoicesList>
    </main>
  );
}
