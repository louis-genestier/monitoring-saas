import { Eye, Loader2, Pencil, Plus } from "lucide-react";
import { useTrackedProducts } from "../queries/trackedProducts.queries";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { DeleteDialog } from "./DeleteDialog";
import { Link } from "@tanstack/react-router";

export const TrackedProductsTable = () => {
  const { data, isLoading } = useTrackedProducts({ page: 1, limit: 10 });
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4 mx-4 bg-white rounded-lg p-4 mt-4 xl:container xl:mx-auto">
      <div className="flex justify-between items-center">
        <p className="text-xl font-bold">Mes produits suivis</p>
        <Button className="bg-accent text-white hover:bg-accent/80 flex gap-1 items-center px-2 py-4 w-fit">
          <Plus size={20} />
          <Link to="/suivi/ajouter">Ajouter un produit</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead className="hidden md:table-cell">
              Seuil de prix
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex flex-col gap-2 justify-center items-center">
                  <Loader2 className="animate-spin" />
                  <p>Chargement des produits suivis...</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex flex-col gap-2 justify-center items-center">
                  <p>Aucun produit suivi trouvé</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {items.map((trackedProduct) => (
            <TableRow key={trackedProduct.id}>
              <TableCell>{trackedProduct.product.name}</TableCell>
              <TableCell>{trackedProduct.isEnabled ? "Oui" : "Non"}</TableCell>
              <TableCell className="hidden md:table-cell">
                {trackedProduct.threshold}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link to={`/suivi/${trackedProduct.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent hover:text-accent"
                    >
                      <Eye />
                    </Button>
                  </Link>
                  <Link to={`/suivi/${trackedProduct.id}/modifier`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent hover:text-accent"
                    >
                      <Pencil />
                    </Button>
                  </Link>
                  <DeleteDialog id={trackedProduct.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
