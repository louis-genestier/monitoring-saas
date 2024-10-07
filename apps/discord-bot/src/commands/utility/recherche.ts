import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import logger from "../../utils/logger";
import { prisma } from "../../utils/prisma";

export const data = new SlashCommandBuilder()
  .setName("recherche")
  .setDescription("Chercher parmis les produits suivis, 10 produits par page")
  .addStringOption((option) =>
    option
      .setName("nom")
      .setDescription("Nom du produit à rechercher")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("page").setDescription("Page de la recherche")
  );

export const execute = async (interaction: CommandInteraction) => {
  const page = (interaction.options.get("page")?.value as string) || "1";
  const nom = interaction.options.get("nom")?.value as string;

  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: nom,
          mode: "insensitive",
        },
      },
      include: {
        ExternalProduct: {
          include: {
            website: true,
          },
        },
      },
      take: 10,
      skip: (parseInt(page) - 1) * 10,
    });

    const totalCount = await prisma.product.count({
      where: {
        name: {
          contains: nom,
          mode: "insensitive",
        },
      },
    });

    if (products.length === 0) {
      await interaction.reply("Aucun produit trouvé");
      return;
    }

    const totalPages = Math.ceil(totalCount / 10);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Résultats de recherche pour "${nom}"`)
      .setDescription(
        `Page ${page} sur ${totalPages} (${totalCount} produits trouvés)`
      );

    products.forEach((product, index) => {
      const websitesString = product.ExternalProduct.map(
        (ep) => ep.website.name
      ).join(", ");
      embed.addFields({
        name: `${index + 1}. ${product.name}`,
        value: `Prix moyen: ${product.averagePrice}€\nSites: ${websitesString || "Aucun site"}`,
      });
    });

    // const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    //   new ButtonBuilder()
    //     .setCustomId("previous")
    //     .setLabel("Précédent")
    //     .setStyle(ButtonStyle.Primary)
    //     .setDisabled(+page === 1),
    //   new ButtonBuilder()
    //     .setCustomId("next")
    //     .setLabel("Suivant")
    //     .setStyle(ButtonStyle.Primary)
    //     .setDisabled(+page === totalPages)
    // );

    await interaction.reply({
      embeds: [embed],
      //  components: [row]
    });
  } catch (error) {
    logger.error(error);
    await interaction.reply("⚠️ Une erreur est survenue, veuillez réessayer");
  }
};
