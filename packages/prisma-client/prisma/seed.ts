import { PrismaClient } from "../src/index";

const prisma = new PrismaClient();

async function main() {
  await prisma.website.upsert({
    where: { name: "fnac" },
    update: {
      baseUrl: "https://www.fnac.com/",
    },
    create: {
      name: "fnac",
      apiBaseurl: "https://api.fnac.com/api/commerce/rest/v2/items/",
      isEnabled: true,
      headers: {
        Authorization: "Basic 867E57BD062C7169995DC03CC",
        "User-Agent":
          "Fnac.com+(iPhone;+iOS/18.0;+App/5.7.3;+iPhone13,2;+Mozilla/5.0;+AppleWebKit/0;+Mobile+Safari/0)",
      },
      baseUrl: "https://www.fnac.com/",
    },
  });

  await prisma.website.upsert({
    where: { name: "rakuten" },
    update: {
      baseUrl: "https://fr.shopping.rakuten.com/offer/buy/",
    },
    create: {
      name: "rakuten",
      apiBaseurl:
        "https://apps.fr.shopping.rakuten.com/restpublic/vis-apps/products/",
      isEnabled: true,
      parameters:
        "advertType=ALL&channel=buyerapp&channelType=BUYER_SMARTPHONE_APP&cheapestAdvertInBuybox=false&loadAdverts=true&loadBuybox=true&loadProductDetails=true&loadRakuponDetails=true&loadRatingDetail=true&loadRefurbishedInfo=true&version=11",
      headers: {
        Host: "apps.fr.shopping.rakuten.com",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BuyerApp/9.31.0 (iOS; BuildNumber 615)",
        "Accept-Language": "fr-FR",
        Connection: "keep-alive",
      },
      baseUrl: "https://fr.shopping.rakuten.com/offer/buy/",
    },
  });

  await prisma.alertProvider.upsert({
    where: { name: "email" },
    update: {},
    create: {
      name: "email",
    },
  });
}

main()
  .then(() => {
    console.log("Seed completed");
  })
  .catch((error) => {
    console.error(error);
  });
