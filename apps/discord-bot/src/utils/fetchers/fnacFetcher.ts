import axios from "axios";
import logger from "../logger";

type FnacResponse = {
  Selector: {
    PageCount: number;
    PageNumber: number;
    PageSize: number;
    TotalItems: number;
  };
  PageOfResults: Array<{
    DisplayName: string;
    InfosPrice: {
      MainOffer: {
        Price: number;
        CarriageCost: number;
        Seller: string;
        OfferState: string;
        IsBest: boolean;
        OfferType: number;
        OfferAvailibility: string;
        IsSellerPro: boolean;
        SellerComment: string;
        CountryDelivery: string;
        SellerRate: number;
        SellerSalesCount: number;
        UserPrice: number;
        EcoTax?: number;
        MemberPrice: number;
        IsFulfilled: boolean;
        IntermediaryBasketURL: string;
        ArticleOpcInfo?: {
          HasPromoToShow: boolean;
          PromoCssClass: string;
          Label: string;
          FlashSaleEndDate: string;
          UserPrice: number;
          OldPrice: number;
          EconomyDetails?: string;
        };
        IsMPOffer: boolean;
        Links: Array<any>;
        CityDelivery?: string;
        ZipCodeDelivery?: string;
        OfferId?: string;
        LinkURL?: string;
      };
      AlternateOffers?: Array<{
        Price: number;
        CarriageCost: number;
        Seller: string;
        OfferState: string;
        IsBest: boolean;
        OfferType: number;
        OfferAvailibility: string;
        IsSellerPro: boolean;
        SellerComment: string;
        CountryDelivery: string;
        CityDelivery: string;
        ZipCodeDelivery: string;
        SellerRate: number;
        SellerSalesCount: number;
        UserPrice: number;
        OfferId: string;
        LinkURL: string;
        MemberPrice: number;
        IsFulfilled: boolean;
        IntermediaryBasketURL: string;
        IsMPOffer: boolean;
        Links: Array<any>;
      }>;
      StandardPrice: number;
      BestUsedOffer?: {
        Price: number;
        CarriageCost: number;
        Seller: string;
        OfferState: string;
        IsBest: boolean;
        OfferType: number;
        OfferAvailibility: string;
        IsSellerPro: boolean;
        SellerComment: string;
        CountryDelivery: string;
        CityDelivery: string;
        ZipCodeDelivery: string;
        SellerRate: number;
        SellerSalesCount: number;
        UserPrice: number;
        OfferId: string;
        LinkURL: string;
        MemberPrice: number;
        IsFulfilled: boolean;
        IntermediaryBasketURL: string;
        IsMPOffer: boolean;
        Links: Array<any>;
      };
      BestNewOffer?: {
        Price: number;
        CarriageCost: number;
        Seller: string;
        OfferState: string;
        IsBest: boolean;
        OfferType: number;
        OfferAvailibility: string;
        IsSellerPro: boolean;
        SellerComment: string;
        CountryDelivery: string;
        CityDelivery: string;
        ZipCodeDelivery: string;
        SellerRate: number;
        SellerSalesCount: number;
        UserPrice: number;
        OfferId: string;
        LinkURL: string;
        MemberPrice: number;
        IsFulfilled: boolean;
        IntermediaryBasketURL: string;
        IsMPOffer: boolean;
        Links: Array<any>;
      };
    };
    IsTechnical: boolean;
    Prid: {
      Id: number;
      Prid: number;
      Catalog: number;
    };
    Title: string;
    ReleaseDate: string;
    FnacAvailable: boolean;
    HasOffers: boolean;
    HasRelatedItems: boolean;
    HasTracks: boolean;
    IsActive: boolean;
    IsEbook: boolean;
    Links: Array<any>;
  }>;
  Filters: Array<{
    Id: string;
    Label: string;
    Values: Array<{
      Id: string;
      Label: string;
      Count: number;
    }>;
  }>;
  Categories: Array<{
    Id: number;
    Label: string;
    Level: number;
    Count: number;
    Children: Array<any>;
  }>;
};

export const getFnacProduct = async (keywords: string) => {
  try {
    const response = await axios<FnacResponse>({
      method: "post",
      url: "https://api.fnac.com/api/commerce/rest/v2/search/items/small",
      headers: {
        Accept: "application/json",
        "Accept-Language": "fr;q=1.0",
        Authorization: "Basic 867E57BD062C7169995DC03CC",
        Connection: "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        Host: "api.fnac.com",
        "User-Agent":
          "Fnac.com+(iPhone;+iOS/18.0;+App/5.7.3;+iPhone13,2;+Mozilla/5.0;+AppleWebKit/0;+Mobile+Safari/0)",
      },
      data: new URLSearchParams({
        DispoOnLine: "false",
        GetNewPriceFacetting: "true",
        keywords,
        pageindex: "1",
        pagesize: "50",
        sort: "0a",
      }),
    });

    if (response.status !== 200 || response.data.Selector.TotalItems === 0) {
      logger.error(
        `Failed to fetch Fnac product: ${response.status} for ${keywords}`
      );
      return;
    }

    return {
      websiteName: "fnac",
      id: `${response.data.PageOfResults[0].Prid.Id}-1`,
      price: response.data.PageOfResults[0].InfosPrice.MainOffer.Price,
      name: response.data.PageOfResults[0].Title,
      link: `https://www.fnac.com//a${response.data.PageOfResults[0].Prid.Id}`,
    };
  } catch (error) {
    logger.error(`Failed to fetch Fnac product: ${error} for ${keywords}`);
    return;
  }
};
