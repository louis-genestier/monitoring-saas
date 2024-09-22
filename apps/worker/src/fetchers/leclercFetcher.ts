import { fetcher } from "./fetcher";

type ItemResponse = {
  lastUpdateDate: string;
  logisticClassCode: string;
  label: string;
  variants: Array<{
    attributes: Array<{
      code: string;
      label: string;
      type: string;
      value: any;
      priority: number;
      tags?: Array<string>;
    }>;
    label: string;
    offers: Array<{
      id: string;
      externalId: string;
      sourceCode: string;
      locale: string;
      basePrice: {
        threshold: number;
        price: {
          price: number;
          priceWithAllTaxes: number;
        };
        minShippingPrice: {
          price: number;
        };
        minShippingType: string;
        totalPrice: {
          price: number;
        };
        leadTimeToShip?: number;
        discountPrice?: {
          minShippingPrice: {
            price: number;
          };
          price: {
            price: number;
          };
          totalPrice: {
            price: number;
          };
          endDate?: string;
          startDate?: string;
        };
      };
      currency: {
        code: string;
        symbol: string;
      };
      startDate: string;
      shop: {
        id: string;
        label: string;
        signCode: string;
      };
      stock: number;
      minOrderQuantity: number;
      allowQuotation: boolean;
      isDefault: boolean;
      additionalFields: Array<{
        label?: string;
        code: string;
        type: string;
        value: any;
      }>;
      matching: {
        isMatch: boolean;
        score: number;
        position: number;
      };
      ranges: Array<{
        threshold: number;
        price: {
          price: number;
          priceWithAllTaxes: number;
        };
        minShippingPrice: {
          price: number;
        };
        totalPrice: {
          price: number;
        };
        leadTimeToShip?: number;
        discountPrice?: {
          price: {
            price: number;
          };
          minShippingPrice: {
            price: number;
          };
          totalPrice: {
            price: number;
          };
          startDate?: string;
          endDate?: string;
        };
      }>;
      description?: string;
    }>;
    offersTotal: number;
    merchandisingData: {
      content_enableCnet: {
        code: string;
        label: string;
        type: string;
        value: boolean;
      };
      content_enableIcecat: {
        code: string;
        label: string;
        type: string;
        value: boolean;
      };
      content_enableFlixMedia: {
        code: string;
        label: string;
        type: string;
        value: boolean;
      };
      content_totalReviewCount: {
        code: string;
        label: string;
        type: string;
        value: number;
      };
      content_averageOverallRating: {
        code: string;
        label: string;
        type: string;
        value: number;
      };
    };
    sku: string;
    slug: string;
    id: string;
  }>;
  families: Array<{
    code: string;
    label: string;
  }>;
  creationDate: string;
  id: string;
  categories: Array<{
    parentCategories: Array<{
      id: string;
      slug: string;
      label: string;
      code: string;
      attributes: Array<{
        code: string;
        label: string;
        type: string;
        value: {
          text?: string;
          boolean?: boolean;
          number?: number;
        };
      }>;
    }>;
    id: string;
    slug: string;
    label: string;
    code: string;
    attributes: Array<{
      code: string;
      label: string;
      type: string;
      value: {
        text?: string;
        boolean?: boolean;
        number?: number;
      };
    }>;
  }>;
  sku: string;
  family: {
    code: string;
    label: string;
    logisticClassCode: string;
  };
  publicationDate: string;
  slug: string;
  attributeGroups: Array<{
    attributes: Array<{
      code: string;
      label: string;
      type: string;
      value: any;
      priority: number;
      tags?: Array<string>;
    }>;
    code: string;
    label: string;
  }>;
  hasCnCoffersInAnyStore: {
    "0195949048616": boolean;
  };
};

export const fetchLeclercPrice = async ({
  id,
  apiBaseUrl,
}: {
  id: string;
  apiBaseUrl: string;
}) => {
  const item = await fetcher<ItemResponse>(apiBaseUrl, {}, id);

  let bestNewPrice = undefined;
  let bestUsedPrice = undefined;

  const newOffers = item.variants[0].offers.filter(
    (offer) =>
      offer.additionalFields.find((field) => field.code === "state-code")
        ?.value === 11
  );

  const usedOffers = item.variants[0].offers.filter(
    (offer) =>
      offer.additionalFields.find((field) => field.code === "state-code")
        ?.value !== 11
  );

  if (newOffers.length > 0) {
    bestNewPrice =
      Math.min(...newOffers.map((offer) => offer.basePrice.totalPrice.price)) /
      100;
  }

  if (usedOffers.length > 0) {
    bestUsedPrice =
      Math.min(...usedOffers.map((offer) => offer.basePrice.totalPrice.price)) /
      100;
  }

  return {
    new: bestNewPrice,
    used: bestUsedPrice,
  };
};
