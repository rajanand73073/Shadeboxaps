
import { Suspense } from "react";



import DashboardClient from "../dashboardClient/page";

export default function Page() {
   return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
