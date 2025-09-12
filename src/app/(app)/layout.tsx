import { ThemeProvider } from "@/components/themeProvider";

export const metadata = {
  title: 'Dashboard - My Next.js App',
  description: 'Dashboard section of the application.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
   
       
    <div className="dashboard-container">
      <main>
        {children}
      </main>
    </div>
    
  );
}
