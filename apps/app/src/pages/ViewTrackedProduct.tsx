import { Route } from "../routes/_authenticated/suivi/$trackedProductId";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Switch,
} from "@repo/ui";
import { Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ReturnToDashboard } from "../components/ReturnToDashboard";

export const ViewTrackedProduct = () => {
  const trackedProduct = Route.useLoaderData();

  return (
    <div className="container mx-auto p-4 xl:w-4/5">
      <ReturnToDashboard />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Détails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Nom du produit</h3>
            <p>{trackedProduct.product.name}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Seuil d'alerte</h3>
            <p>{trackedProduct.threshold}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Neuf ou occasion</h3>
            <p>{trackedProduct.priceType === "NEW" ? "Neuf" : "Occasion"}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Type d'alerte</h3>
            <p>{trackedProduct.alertProvider.name}</p>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Activé</h3>
            <Switch checked={trackedProduct.isEnabled} />
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="outline" asChild>
              <Link to={`/suivi/${trackedProduct.id}/modifier`}>Modifier</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
