import { TrackedProductWithAllRelations } from "@repo/prisma-client";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ViewTrackedProduct } from "../../../../pages/ViewTrackedProduct";
import { NotFoundTrackedProduct } from "../../../../components/NotFoundTrackedProduct";
import { client } from "@repo/front-logic";

export const Route = createFileRoute(
  "/_authenticated/suivi/$trackedProductId/"
)({
  component: ViewTrackedProduct,
  loader: async ({
    params: { trackedProductId },
  }): Promise<TrackedProductWithAllRelations> => {
    const response = await client["tracked-products"][":id"].$get({
      param: {
        id: trackedProductId,
      },
    });

    if (!response.ok) {
      throw notFound();
    }

    const trackedProduct = await response.json();

    return { ...trackedProduct };
  },
  notFoundComponent: NotFoundTrackedProduct,
});
