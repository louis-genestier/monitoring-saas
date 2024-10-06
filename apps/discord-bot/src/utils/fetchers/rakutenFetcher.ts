import axios from "axios";
import logger from "../logger";

type RakutenResponse = {
  totalResultProductsCount: number;
  resultProductsCount: number;
  sortTypeIndex: number;
  pageNumber: number;
  title: string;
  maxProductsPerPage: number;
  maxPageNumber: number;
  products: Array<{
    id: number;
    productScope: string;
    newBestPrice: number;
    usedBestPrice: number;
    headline: string;
    caption: string;
    topic: string;
    reviewsAverageNote: number;
    nbReviews: number;
    isPreOrder: boolean;
    isMemo: boolean;
    imagesUrls: Array<string>;
    buybox?: {
      salePrice: number;
      advertType: string;
      advertQuality: string;
      isCrew: boolean;
      saleCrossedPrice?: number;
      salePercentDiscount?: number;
      isRefurbished?: boolean;
    };
  }>;
  selectedFilters: Array<any>;
  categories: Array<{
    label: string;
    name: string;
    productsCount: number;
  }>;
  filters: Array<any>;
  sortsType: Array<{
    label: string;
    isDescending: boolean;
    name?: string;
  }>;
  shippingMethods: {
    name: string;
    key: string;
    shippingValues: Array<{
      label: string;
      name: string;
      value: string;
    }>;
  };
  ratingFilter: {
    name: string;
    key: string;
    ratingValues: Array<{
      label: string;
      name: string;
      value: string;
    }>;
  };
  sellersHighlight: Array<any>;
  partnersHighlight: Array<any>;
};

export const getRakutenProduct = async (keywords: string) => {
  try {
    const rakutenResponse = await axios<RakutenResponse>({
      method: "get",
      url: "https://apps.fr.shopping.rakuten.com/restpublic/vis-apps/productsSearch",
      params: {
        advertType: "ALL",
        channel: "buyerapp",
        channelType: "BUYER_SMARTPHONE_APP",
        disableAlternativeResults: "true",
        kw: keywords,
        loadMemos: "true",
        loadProductDetails: "true",
        loadSuggestedFilters: "false",
        pageNumber: "1",
        sortTypeIndex: "0",
        version: "3",
        withoutStock: "false",
        maxProductsPerPage: "100",
      },
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-FR;q=1.0, ar-FR;q=0.9, fr-FR;q=0.8",
        Connection: "keep-alive",
        Host: "apps.fr.shopping.rakuten.com",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BuyerApp/9.31.0 (iOS; BuildNumber 615)",
      },
    });

    if (
      rakutenResponse.status !== 200 ||
      rakutenResponse.data.totalResultProductsCount === 0
    ) {
      logger.error(
        `Failed to fetch Rakuten product: ${rakutenResponse.status} for ${keywords}`
      );
      return undefined;
    }

    return {
      websiteName: "rakuten",
      id: rakutenResponse.data.products[0].id,
      price: rakutenResponse.data.products[0].newBestPrice,
      name: rakutenResponse.data.products[0].headline,
      link: `https://fr.shopping.rakuten.com/offer/buy/${rakutenResponse.data.products[0].id}`,
    };
  } catch (error) {
    logger.error(`Failed to fetch Rakuten product: ${error} for ${keywords}`);
    return undefined;
  }
};
