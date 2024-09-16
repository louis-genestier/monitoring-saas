import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import { fetcher } from "./fetcher";

type ItemResponse = {
  InfosPrice: {
    MainOffer: {
      Price: number;
      UserPrice: number;
      CarriageCost: number;
      IsBest: boolean;
      OfferState: string;
      OfferAvailibility: string;
      EcoTax: number;
      Seller: string;
      OfferType: number;
      IntermediaryBasketURL: string;
      IsSellerPro: boolean;
      SellerComment: string;
      CountryDelivery: string;
      SellerRate: number;
      SellerSalesCount: number;
      IsMPOffer: boolean;
      ArticleOpcInfo: {
        HasPromoToShow: boolean;
        PromoCssClass: string;
        Label: string;
        FlashSaleEndDate: string;
        UserPrice: number;
        EconomyDetails: string;
        OldPrice: number;
      };
      MemberPrice: number;
      Links: Array<any>;
    };
    AlternateOffers: Array<{
      Price: number;
      UserPrice: number;
      CarriageCost: number;
      IsBest: boolean;
      OfferState: string;
      OfferAvailibility: string;
      Seller: string;
      LinkURL: string;
      OfferType: number;
      IntermediaryBasketURL: string;
      OfferId: string;
      IsSellerPro: boolean;
      SellerComment: string;
      CityDelivery: string;
      ZipCodeDelivery: string;
      CountryDelivery: string;
      SellerRate: number;
      SellerSalesCount: number;
      IsMPOffer: boolean;
      MemberPrice: number;
      Links: Array<any>;
    }>;
    StandardPrice: number;
    BestUsedOffer?: {
      Price: number;
      UserPrice: number;
      CarriageCost: number;
      IsBest: boolean;
      OfferState: string;
      OfferAvailibility: string;
      Seller: string;
      LinkURL: string;
      OfferType: number;
      IntermediaryBasketURL: string;
      OfferId: string;
      IsSellerPro: boolean;
      SellerComment: string;
      CityDelivery: string;
      ZipCodeDelivery: string;
      CountryDelivery: string;
      SellerRate: number;
      SellerSalesCount: number;
      IsMPOffer: boolean;
      MemberPrice: number;
      Links: Array<any>;
    };
    BestNewOffer?: {
      Price: number;
      UserPrice: number;
      CarriageCost: number;
      IsBest: boolean;
      OfferState: string;
      OfferAvailibility: string;
      Seller: string;
      LinkURL: string;
      OfferType: number;
      IntermediaryBasketURL: string;
      OfferId: string;
      IsSellerPro: boolean;
      SellerComment: string;
      CityDelivery: string;
      ZipCodeDelivery: string;
      CountryDelivery: string;
      SellerRate: number;
      SellerSalesCount: number;
      IsMPOffer: boolean;
      MemberPrice: number;
      Links: Array<any>;
    };
  };
  DisplayName: string;
  IsTechnical: boolean;
  Prid: {
    Id: number;
    Prid: number;
    Catalog: number;
  };
  Title: string;
  Format: string;
  ReleaseDate: string;
  FnacAvailable: boolean;
  HasOffers: boolean;
  HasRelatedItems: boolean;
  HasTracks: boolean;
  IsActive: boolean;
  IsEbook: boolean;
  Links: Array<{
    Href: string;
    Rel: string;
  }>;
};

export const fetchFnacPrice = async ({
  id,
  apiBaseUrl,
  headers,
}: {
  id: string;
  apiBaseUrl: string;
  headers: JsonValue;
}) => {
  const item = await fetcher<ItemResponse>(apiBaseUrl, headers, id);

  const mainPrice = item.InfosPrice.MainOffer.UserPrice;
  const bestNewOffer = item.InfosPrice.BestNewOffer?.UserPrice;

  const newPrice = bestNewOffer ? Math.min(mainPrice, bestNewOffer) : mainPrice;

  return {
    new: newPrice,
    used: item.InfosPrice.BestUsedOffer?.Price,
  };
};
