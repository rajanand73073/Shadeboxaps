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
"use client";

import { ThemeProvider } from "@/components/themeProvider";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard - My Next.js App",
  description: "Dashboard section of the application.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <div className="dashboard-container">
          <main>
            <Suspense fallback={<div>Loading dashboard...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </SessionProvider>
    </ThemeProvider>
  );
}
