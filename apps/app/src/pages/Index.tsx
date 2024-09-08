import { Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/navbar";

export const Index = () => {
  return (
    <div className="w-screen">
      <Navbar />
      <div className="xl:ml-64">
        <Outlet />
      </div>
    </div>
  );
};
