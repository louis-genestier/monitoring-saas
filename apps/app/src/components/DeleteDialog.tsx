import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui";
import { Trash } from "lucide-react";
import { useDeleteTrackedProduct } from "../queries/trackedProducts.queries";

export const DeleteDialog = ({ id }: { id: string }) => {
  const { mutate } = useDeleteTrackedProduct();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-transparent hover:text-destructive/70"
        >
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-80 xl:max-w-md">
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce produit suivi ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => mutate(id)}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
