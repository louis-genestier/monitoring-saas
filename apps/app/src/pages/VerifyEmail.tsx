import { Link } from "@tanstack/react-router";
import { Route } from "../routes/verifier-email.$verificationToken";
import { LogIn, CheckCircle, XCircle } from "lucide-react";

export const VerifyEmail = () => {
  const { success } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 flex items-center justify-center p-4 w-screen">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md min-h-[400px] flex flex-col items-center p-8 gap-6 text-center justify-center">
        <div
          className={`text-6xl ${success ? "text-green-500" : "text-red-500"}`}
        >
          {success ? (
            <CheckCircle className="w-10 h-10" />
          ) : (
            <XCircle className="w-10 h-10" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          Vérification de l'email
        </h1>
        <p className="text-lg text-gray-600">
          {success
            ? "Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter."
            : "Nous n'avons pas pu vérifier votre email. Veuillez réessayer ou contacter le support."}
        </p>
        <Link
          to="/login"
          className="mt-4 bg-accent text-white py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-accent/90 transition-colors duration-300"
        >
          <LogIn className="w-5 h-5" />
          Se connecter
        </Link>
      </div>
    </div>
  );
};
