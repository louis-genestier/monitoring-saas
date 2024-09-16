import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import { fetcher } from "./fetcher";

type ItemResponse = {
  aisle: string;
  id: number;
  cluster: {
    clusterInfoDto: {
      metaTitle: string;
      metaDescription: string;
    };
  };
  isDigital: boolean;
  urlName: string;
  productScope: string;
  adverts: Array<{
    advertId: number;
    productId: number;
    salePrice: number;
    shippingAmount: number;
    seller: {
      id: number;
      login: string;
      type: string;
      isPreOrderGrant: boolean;
      isUserBuyer: boolean;
      userBirthDate: number;
      creationDate: number;
      lastLoginDate: number;
      isNewSeller: boolean;
      totalSaleCount?: number;
      isoCountryId: number;
      sellerAnswerTime?: number;
      isMicroCompagny: boolean;
      isGrantingForAdvertQuestions: boolean;
      saleCommitCount?: number;
      saleCount?: number;
      averageScore?: number;
    };
    imagesUrls: Array<string>;
    shippingTypes?: Array<string>;
    availableShippingTypes: Array<{
      id: number;
      label: string;
      isAllowedByPlatform: boolean;
      isAllowedForSeller: boolean;
      canBeModified: boolean;
      isMandatory: boolean;
      isPreselectedByDefault: boolean;
      isMandatoryForFreeShipping: boolean;
      isUnsupportedWithFreeShipping: boolean;
      description?: string;
    }>;
    isPickupAllowed: boolean;
    pickupDistance: number;
    isAdvertInCircleRange: boolean;
    isEligibleClickAndCollect: boolean;
    quality: string;
    type: string;
    sellerComment?: string;
    rspCampaignCoefficient: number;
    rspCoefficient: number;
    expressDeliveryDate: number;
    quantityAvailable: number;
    isUnlimitedQuantity: boolean;
    allowOnlyPickup: boolean;
    images: Array<{
      imagesUrls: {
        entry: Array<{
          size: string;
          url: string;
        }>;
      };
      id: number;
    }>;
    rspMinimumAmount: number;
    rspCampaignDiscount: number;
    refurbished: boolean;
    saleCrossedPrice?: number;
    saleCrossedPriceIsOriginPrice?: boolean;
    salePercentDiscount?: number;
    monthlyPayments: Array<{
      title: string;
      description: string;
      image: string;
      monthlyAmount: number;
    }>;
    isGrantingForAdvertNegotiation: boolean;
    isCrew: boolean;
    isKoboEbook: boolean;
    crewDetails?: {
      brand: {
        name: string;
        category: string;
        logo: string;
        illustration: string;
        isTopPartner: boolean;
        cashback: {
          value: number;
          type: string;
          multi: boolean;
          boost: boolean;
        };
        illustrationBackground: string;
        pointAttributionEstimated: number;
        clubrpay: {
          isActive: boolean;
          boostEnabled: boolean;
        };
      };
      access: {
        link: string;
        conditions: Array<string>;
        parameters: {
          userId: string;
        };
      };
    };
    shippingDelay?: string;
    hasFastShipping?: boolean;
  }>;
  buybox: {
    advertId: number;
    productId: number;
    salePrice: number;
    shippingAmount: number;
    shippingDelay: string;
    seller: {
      id: number;
      login: string;
      type: string;
      isPreOrderGrant: boolean;
      isUserBuyer: boolean;
      userBirthDate: number;
      creationDate: number;
      lastLoginDate: number;
      isNewSeller: boolean;
      saleCommitCount: number;
      totalSaleCount: number;
      saleCount: number;
      averageScore: number;
      isoCountryId: number;
      sellerAnswerTime: number;
      isMicroCompagny: boolean;
      isGrantingForAdvertQuestions: boolean;
    };
    imagesUrls: Array<string>;
    availableShippingTypes: Array<{
      id: number;
      label: string;
      description: string;
      isAllowedByPlatform: boolean;
      isAllowedForSeller: boolean;
      canBeModified: boolean;
      isMandatory: boolean;
      isPreselectedByDefault: boolean;
      isMandatoryForFreeShipping: boolean;
      isUnsupportedWithFreeShipping: boolean;
    }>;
    isPickupAllowed: boolean;
    pickupDistance: number;
    isAdvertInCircleRange: boolean;
    isEligibleClickAndCollect: boolean;
    quality: string;
    type: string;
    sellerComment: string;
    rspCampaignCoefficient: number;
    rspCoefficient: number;
    expressDeliveryDate: number;
    quantityAvailable: number;
    isUnlimitedQuantity: boolean;
    allowOnlyPickup: boolean;
    buyboxType: string;
    images: Array<{
      imagesUrls: {
        entry: Array<{
          size: string;
          url: string;
        }>;
      };
      id: number;
    }>;
    rspMinimumAmount: number;
    rspCampaignDiscount: number;
    refurbished: boolean;
    hasFastShipping: boolean;
    monthlyPayments: Array<{
      title: string;
      description: string;
      image: string;
      monthlyAmount: number;
    }>;
    isGrantingForAdvertNegotiation: boolean;
    isCrew: boolean;
    isKoboEbook: boolean;
  };
  bestPrice: number;
  newBestPrice: number;
  usedBestPrice: number;
  collectibleBestPrice: number;
  collapseBestPrice: string;
  priceList: string;
  summaryNewBestPrice: string;
  summaryBestPrice: string;
  summaryAvailableStock: boolean;
  summaryNew: boolean;
  advertsCountInfo: {
    total: number;
    new: number;
    used: {
      total: number;
    };
    refurbished: {
      total: number;
    };
  };
  headline: string;
  contributor: {
    caption: string;
    isBlurred: boolean;
    blurred: boolean;
  };
  topic: string;
  references: {
    ean: string;
  };
  breadcrumbs: Array<{
    label: string;
    url: string;
    isBlur: boolean;
  }>;
  globalRating: {
    score: number;
    nbReviews: number;
  };
  ratings: Array<{
    star: number;
    nbReviews: number;
  }>;
  imagesUrls: Array<string>;
  reviews: Array<{
    id: number;
    note: number;
    title: string;
    author: {
      firstName: string;
      isPreOrderGrant: boolean;
      isUserBuyer: boolean;
      userBirthDate: number;
      login?: string;
    };
    date: number;
    description: string;
    feedbackPositiveCount: number;
    feedbackNegativeCount: number;
  }>;
  productDetailTitle: string;
  description: string;
  edito: string;
  specifications: {
    sections: {
      entry: Array<{
        title: string;
        content: Array<{
          header: string;
          body: string;
        }>;
      }>;
    };
  };
  rspCampaignCoefficient: number;
  pickupAllowed: boolean;
  isPreOrder: boolean;
  isMemo: boolean;
  ownerId: number;
  isMevFormAvailable: boolean;
  isNotModifiedSinceLastCrawl: boolean;
  canonicalUrlWithoutDomain: string;
  isAvailable: boolean;
  isManuallySEOExcludedProduct: boolean;
  isAutomaticallySEOExcludedProduct: boolean;
  hasImages: boolean;
  isChangeDateModified: boolean;
  categories: Array<string>;
  pickUpSelected: boolean;
  hasOnlyPickupAdverts: boolean;
  prdTypeCode: number;
  prdCategory: string;
  blurSimilarCategoriesLink: boolean;
  similarCategoriesLink: string;
  images: Array<{
    imagesUrls: {
      entry: Array<{
        size: string;
        url: string;
      }>;
    };
    id: number;
  }>;
  rspMinimumAmount: number;
  googleRichCards: {
    title: string;
    imageUrl: string;
    description: string;
    ean: string;
    brand: string;
    averageRating: number;
    ratingCount: number;
    reviewNumber: string;
    bestPrice: string;
    deadlineDate: string;
    condition: string;
    availability: string;
    sellerType: string;
    sellerName: string;
  };
  rspCampaignDiscount: number;
  hasAlert: boolean;
  refurbishedInfo: {
    statesInfo: {
      title: string;
      description: Array<{
        iconUrl: string;
        advantage: string;
      }>;
      cmsLink: string;
      states: Array<{
        quality: string;
        description: string;
        price?: number;
        cmsLink: string;
        unavailable?: boolean;
      }>;
    };
  };
  usedStateInfo: {
    states: Array<any>;
    helpURL: string;
  };
};

export const fetchRakutenPrice = async ({
  id,
  apiBaseUrl,
  headers,
  parameters,
}: {
  id: string;
  apiBaseUrl: string;
  headers: JsonValue;
  parameters: string;
}) => {
  const item = await fetcher<ItemResponse>(apiBaseUrl, headers, id, parameters);

  return {
    new: item.newBestPrice,
    used: item.usedBestPrice,
  };
};
