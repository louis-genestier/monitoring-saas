import { ReturnToDashboard } from "./ReturnToDashboard";

export const NotFoundTrackedProduct = () => {
  return (
    <div className="p-4">
      <ReturnToDashboard />
      <p className="text-xl font-bold">Aucun produit trouvé</p>
    </div>
  );
};
