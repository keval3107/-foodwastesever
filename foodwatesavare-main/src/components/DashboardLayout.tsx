import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-5 md:p-10 lg:p-12 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
