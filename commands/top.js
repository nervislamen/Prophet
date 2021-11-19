const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const client = new Discord.Client();

module.exports = {
    name: 'leveltop',
    aliases: ['topseviye','leveltop','ltop','stop'],
    description: "En çok xp ve en yüksek seviyeye sahip ilk 10 kullanıcıyı kontrol eder",
    cooldown: 3,
    category: "Leveling",
    execute(message, args) {

        const currentPage = parseInt(args[0]) || 1;
        const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP DESC;").all(message.guild.id);
        if (parseFloat(args[0]) > Math.ceil(top10.length / 10)) {
            return message.reply(`Geçersiz sayfa numarası! Sadece ${Math.ceil(top10.length / 10)} Sayfa Var.`)
        }
      
        const embed = new Discord.MessageEmbed()
            .setTitle(`${message.guild.name} SEVİYE LİDER TABLOSU`)
            .setColor("RANDOM")
            .setTimestamp()
            .setDescription('<a:upup:910993920878592091> **Sunucumuz da Level Top 10 Listesi Aşağıda Gosterilmektedir.**\n ```\nKonuşarak Seviye Atlayabilir ve Yeni Rollere Erişimi Açabilirsiniz. ``` \n > Diğer Sayfaları Görmek İçin __Örn: .ltop 2__ Yazabilirsiniz.');


        if (top10.length < 1) {
            embed.setDescription(`Liderlik tablosunda kullanıcı yok.`)
        }
        var state = {
            'querySet': top10,
            'page': currentPage,
            'rows': 10
        }

        buildTable()

        function pagination(querySet, page, rows) {
            var trimStart = (page - 1) * rows
            var trimEnd = trimStart + rows

            var trimmedData = querySet.slice(trimStart, trimEnd)

            var pages = Math.ceil(querySet.length / rows)

            return {
                'querySet': trimmedData,
                'pages': pages
            }
        }

        function buildTable() {
        
            var pagesData = pagination(state.querySet, state.page, state.rows)
            var myList = pagesData.querySet 
            for (var i = 1 in myList) {
                let nextXP = myList[i].level * 2 * 250 + 250
                let totalXP = myList[i].totalXP
                let rank = top10.sort((a, b) => {
                    return b.totalXP - a.totalXP
                });
                let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
                let users;
                if (typeof message.client.users.cache.get(myList[i].user) == "undefined") {
                    users = `<@!${myList[i].user}>`
                } else {
                    users = message.client.users.cache.get(myList[i].user).tag
                }
                embed.addFields({ name: `      __Anlık Sıralaması__ **${ranking}.** Sırada | __Üye Adı__: **@${users}** `, value: `> <a:yildizyil:911009493767290931> __**Şuanki Seviyesi**__: \`${myList[i].level}. Seviyede \`\n> <a:tres:911009114358943814>__**Anlık XP Oranı**__: __**${myList[i].xp}**__ <- Sohbet Ederek Kazandığı XP Oranı \n Yeni Seviyeye Geçişi İçin Toplaması Gereken XP Oranı __**${nextXP}**__\`` });
            }
            embed.setFooter(`Şu anki Sayfa ${currentPage} / ${Math.ceil(top10.length / 10)}`)
        }

            
        return message.channel.send({ embed });

    
}
}
