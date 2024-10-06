import { prisma } from "@repo/prisma-client";
import {
  CommandInteraction,
  Embed,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import logger from "../../utils/logger";
import { getLeclercProduct } from "../../utils/fetchers/leclercFetcher";
import { getFnacProduct } from "../../utils/fetchers/fnacFetcher";
import { getRakutenProduct } from "../../utils/fetchers/rakutenFetcher";
import { getCulturaProduct } from "../../utils/fetchers/culturaFetcher";
import { getAmazonProduct } from "../../utils/fetchers/amazonFetcher";
import { getLdlcProduct } from "../../utils/fetchers/ldlcFetcher";

function validateEAN13(ean: string): boolean {
  if (ean.length !== 13 || !/^\d{13}$/.test(ean)) {
    return false;
  }

  const digits = ean.split("").map(Number);

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === digits[12];
}

export const data = new SlashCommandBuilder()
  .setName("suivre")
  .setDescription("Ajouter un produit à suivre")
  .addStringOption((option) =>
    option
      .setName("nom")
      .setDescription("Nom du produit à suivre")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("id-rakuten").setDescription("ID du produit sur Rakuten")
  )
  .addStringOption((option) =>
    option.setName("id-amazon").setDescription("ID du produit sur Amazon")
  )
  .addStringOption((option) =>
    option.setName("id-cultura").setDescription("ID du produit sur cultura")
  )
  .addStringOption((option) =>
    option.setName("id-fnac").setDescription("ID du produit sur Fnac")
  )
  .addStringOption((option) =>
    option.setName("id-ldlc").setDescription("ID du produit sur Ldlc")
  )
  .addStringOption((option) =>
    option.setName("id-leclerc").setDescription("ID du produit sur Leclerc")
  );

const CAN_ACCESS_COMMAND = ["Admin", "Beta-testeur"];

export const execute = async (interaction: CommandInteraction) => {
  const guild = interaction.guild!;

  const member = guild.members.cache.get(interaction.user.id);

  if (!member) {
    await interaction.reply("⚠️ Vous n'êtes pas membre du serveur");
    return;
  }

  const roles = member.roles.cache.map((role) => role.name);

  if (!roles.some((role) => CAN_ACCESS_COMMAND.includes(role))) {
    await interaction.reply(
      "⚠️ Vous n'avez pas la permission d'utiliser cette commande"
    );
    return;
  }

  const ids: {
    name: string;
    id: string;
  }[] = [];
  const name = interaction.options.get("nom") as { value: string };
  const idRakuten = interaction.options.get("id-rakuten");
  const idAmazon = interaction.options.get("id-amazon");
  const idCultura = interaction.options.get("id-cultura");
  const idFnac = interaction.options.get("id-fnac");
  const idLdlc = interaction.options.get("id-ldlc");
  const idLeclerc = interaction.options.get("id-leclerc");

  if (
    !idRakuten?.value &&
    !idAmazon?.value &&
    !idCultura?.value &&
    !idFnac?.value &&
    !idLdlc?.value &&
    !idLeclerc?.value
  ) {
    await interaction.deferReply();
    // we will search for the product on all websites then send a message to the user with the ids and tell him to verify them and then use the command again
    const [leclerc, fnac, rakuten, cultura, amazon, ldlc] = await Promise.all([
      getLeclercProduct(name.value),
      getFnacProduct(name.value),
      getRakutenProduct(name.value),
      getCulturaProduct(name.value),
      getAmazonProduct(name.value),
      getLdlcProduct(name.value),
    ]);

    // create an embed with all the products informations
    const embed = new EmbedBuilder();
    embed
      .setTitle(`Produit trouvé: ${name.value}`)
      .addFields({
        name: "Leclerc",
        value: leclerc
          ? `ID: ${leclerc.id}\nPrix: ${leclerc.price}€\nNom: ${leclerc.name}\nLien: ${leclerc.link}`
          : "Aucun produit trouvé",
      })
      .addFields({
        name: "Fnac",
        value: fnac
          ? `ID: ${fnac.id}\nPrix: ${fnac.price}€\nNom: ${fnac.name}\nLien: ${fnac.link}`
          : "Aucun produit trouvé",
      })
      .addFields({
        name: "Rakuten",
        value: rakuten
          ? `ID: ${rakuten.id}\nPrix: ${rakuten.price}€\nNom: ${rakuten.name}\nLien: ${rakuten.link}`
          : "Aucun produit trouvé",
      })
      .addFields({
        name: "Cultura",
        value: cultura
          ? `ID: ${cultura.id}\nPrix: ${cultura.price}€\nNom: ${cultura.name}\nLien: ${cultura.link}`
          : "Aucun produit trouvé",
      })
      .addFields({
        name: "Amazon",
        value: amazon
          ? `ID: ${amazon.id}\nPrix: ${amazon.price}€\nNom: ${amazon.name}\nLien: ${amazon.link}`
          : "Aucun produit trouvé",
      })
      .addFields({
        name: "Ldlc",
        value: ldlc
          ? `ID: ${ldlc.id}\nPrix: ${ldlc.price}€\nNom: ${ldlc.name}\nLien: ${ldlc.link}`
          : "Aucun produit trouvé",
      })
      .addFields({
        name: "Nouvelle commande",
        value:
          "Si les informations sont correctes, relancez la commande comme ceci:\n" +
          "```\n" +
          `/suivre nom:${name.value} ${leclerc?.id ? `id-leclerc:${leclerc.id}` : ""} ${fnac?.id ? `id-fnac:${fnac.id}` : ""} ${rakuten?.id ? `id-rakuten:${rakuten.id}` : ""} ${cultura?.id ? `id-cultura:${cultura.id}` : ""} ${amazon?.id ? `id-amazon:${amazon.id}` : ""} ${ldlc?.id ? `id-ldlc:${ldlc.id}` : ""}` +
          "\n" +
          "```\n" +
          "Copiez et collez cette commande pour suivre le produit.",
      });

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // 1. check using regex that ids are correct
  if (idLeclerc?.value) {
    const id = idLeclerc.value as string;
    if (!validateEAN13(id)) {
      await interaction.reply(`⚠️ L'ID Leclerc n'est pas valide`);
      return;
    }
    ids.push({ name: "leclerc", id });
  }
  if (idRakuten?.value) {
    const id = idRakuten.value as string;
    if (!/^\d+$/.test(id)) {
      await interaction.reply(`⚠️ L'ID Rakuten n'est pas valide`);
      return;
    }
    ids.push({ name: "rakuten", id });
  }
  if (idAmazon?.value) {
    const id = idAmazon.value as string;
    if (!/^\w{10}$/.test(id)) {
      await interaction.reply(`⚠️ L'ID Amazon n'est pas valide`);
      return;
    }
    ids.push({ name: "amazon", id });
  }
  if (idFnac?.value) {
    const id = idFnac.value as string;
    if (!/^a\d{8}$/i.test(id)) {
      await interaction.reply(`⚠️ L'ID Fnac n'est pas valide`);
      return;
    }
    ids.push({ name: "fnac", id: id.slice(1) + "-1" });
  }
  if (idCultura?.value) {
    const id = idCultura.value as string;
    if (!/^\d+$/.test(id)) {
      await interaction.reply(`⚠️ L'ID Cultura n'est pas valide`);
      return;
    }
    ids.push({ name: "cultura", id });
  }
  if (idLdlc?.value) {
    const id = idLdlc.value as string;
    if (!/^PB\d{8}$/.test(id)) {
      await interaction.reply(`⚠️ L'ID Ldlc n'est pas valide`);
      return;
    }
    ids.push({ name: "ldlc", id });
  }

  const author = interaction.user.username;

  try {
    const websites = await prisma.website.findMany({
      where: {
        name: {
          in: ids.map((id) => id.name),
        },
      },
    });

    const product = await prisma.product.create({
      data: {
        name: name.value,
        ExternalProduct: {
          create: websites.map((website) => ({
            externalId: ids.find((id) => id.name === website.name)!.id,
            website: {
              connect: {
                id: website.id,
              },
            },
          })),
        },
        createdBy: author,
      },
    });

    await interaction.reply(`✅ Produit ${product.name} ajouté au monitoring`);
  } catch (error) {
    logger.error(error);
    await interaction.reply("⚠️ Une erreur est survenue, veuillez réessayer");
  }
};
