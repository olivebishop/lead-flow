import { Dashboard } from "@/components/Dashboard";
import { ReminderRunner } from "@/components/ReminderRunner";

export default function Home() {
  return (
    <>
      <ReminderRunner />
      <Dashboard />
    </>
  );
}
