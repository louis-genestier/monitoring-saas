import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const ReturnToDashboard = () => (
  <Link
    to="/"
    className="inline-flex items-center text-accent hover:text-accent/80 mb-4 "
  >
    <ArrowLeft className="w-4 h-4 mr-2" />
    Retour au tableau de bord
  </Link>
);
