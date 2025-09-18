// import { ThemeProvider } from "@/components/themeProvider";

// export const metadata = {
//   title: 'Dashboard - My Next.js App',
//   description: 'Dashboard section of the application.',
// };

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   return (
   
       
//     <div className="dashboard-container">
//       <main>
//         {children}
//       </main>
//     </div>
    
//   );
// }
// src/app/(app)/layout.tsx
"use client";
import { ThemeProvider } from "@/components/themeProvider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}