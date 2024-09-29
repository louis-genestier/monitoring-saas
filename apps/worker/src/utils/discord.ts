import {
  Client,
  TextChannel,
  GatewayIntentBits,
  EmbedBuilder,
} from "discord.js";
import { DISCORD_CHANNEL_ID, DISCORD_BOT_TOKEN } from "./env";
import logger from "./logger";
import {
  Alert,
  AlertWithPricepoint,
  ExternalProduct,
  Product,
  Website,
} from "@repo/prisma-client";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  logger.info(`Logged in as ${client.user?.tag}!`);
});

client.login(DISCORD_BOT_TOKEN);

const formatPrice = (price: number): string => {
  return price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

const getProductUrl = (
  website: Website,
  externalProduct: ExternalProduct,
  ean?: string
) => {
  let productUrl = `${website.baseUrl}${externalProduct.externalId}`;

  if (website.name === "fnac") {
    // product for api is 1234-1 but for website is a1234
    const id = `a${externalProduct.externalId.split("-")[0]}`;
    productUrl = `${website.baseUrl}${id}`;
  }

  if (website.name === "cultura") {
    // not using externalId because we need to use ean from the response
    productUrl = `${website.baseUrl}a-${ean}.html`;
  }

  if (website.name === "ldlc") {
    productUrl = `${website.baseUrl}${externalProduct.externalId}.html`;
  }

  return productUrl;
};

const sendDiscordMessage = async ({
  product,
  website,
  alert,
  externalProduct,
  ean,
}: {
  product: Product;
  website: Website;
  alert: AlertWithPricepoint;
  externalProduct: ExternalProduct;
  ean?: string;
}) => {
  try {
    while (!client.isReady()) {
      logger.info("Waiting for client to be ready");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    logger.info("Client is ready");
    let channel = await client.channels.fetch(DISCORD_CHANNEL_ID);

    if (!channel?.isTextBased()) {
      logger.error("Channel is not existing or not a text channel");
      return;
    }

    channel = channel as TextChannel;

    const productUrl = getProductUrl(website, externalProduct, ean);

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`🚨 Alerte Prix : ${product.name} 🚨`)
      .setURL(productUrl)
      .addFields(
        { name: "Site Web", value: website.name, inline: true },
        {
          name: "Nouveau Prix",
          value: formatPrice(alert.pricePoint.price),
          inline: true,
        },
        {
          name: "Prix Moyen",
          value: formatPrice(product.averagePrice!),
          inline: true,
        },
        {
          name: "Réduction",
          value: `${alert.discount.toFixed(2)}%`,
          inline: true,
        },
        {
          name: "Économies",
          value: formatPrice(product.averagePrice! - alert.pricePoint.price),
          inline: true,
        }
      )
      .setFooter({
        text: "Cliquez sur le titre pour aller sur la page du produit",
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    logger.error(`Failed to send Discord message: ${error}`);
  }
};

export { sendDiscordMessage };
