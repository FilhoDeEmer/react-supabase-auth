import DashboardLayout from "../layout/DashboardLayout";
import TeamSlots from "../features/team/TeamSlots";

export default function Dashboard() {
  return <DashboardLayout title="Inicio">
    <TeamSlots />
    
  </DashboardLayout>;
}
