import { prisma } from "@repo/prisma-client";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import logger from "../../utils/logger";

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

export const execute = async (interaction: CommandInteraction) => {
  // const ids = {
  //   rakuten: "",
  //   amazon: "",
  //   cultura: "",
  //   fnac: "",
  //   ldlc: "",
  //   leclerc: "",
  // };
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
    await interaction.reply("⚠️ Vous devez renseigner au moins un ID");
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
