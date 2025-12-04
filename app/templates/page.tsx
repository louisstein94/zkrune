"use client";

import { Metadata } from 'next';
import Navigation from "@/components/Navigation";
import TemplateGallery from "@/components/TemplateGallery";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="pt-32 pb-16">
        <TemplateGallery />
      </div>
    </main>
  );
}
