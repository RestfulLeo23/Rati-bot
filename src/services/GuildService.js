const Guild = require('../entities/Guild');
const BaseService = require('./BaseService');
const UserService = require('./UserService');
const User = require('../entities/User');
const logger = require('../log/logger');

/**
* DJRat personality. Can play audio from youtube videos.
*
* @class DJRatService
* @extends {BaseService}
*/
class DJRatService extends BaseService {

    constructor(_db, _client) {
        super(_db);
        this.db = _db
        this.client = _client;

        this.client.on('guildCreate', (guild) => {
            this.createGuild(guild);
        });
        this.client.on('guildUpdate', (oldGuild, newGuild) => {
            this.updateGuild(oldGuild, newGuild);
        });
    }

    createGuild(guild){
        logger.Debug(`guild createGuild`);
        const ratiGuild = new Guild();
        ratiGuild.DiscordId = guild.id
        ratiGuild.Name = guild.name;
        return super.getById(Guild, [[ratiGuild.DiscordId]], ["DiscordId"])
        .then(guildResult => {
            if(guildResult.length != 0){
                logger.Info(`Didn't add ${guild.name} because it is already in the system.`)
                return null;
            }
            logger.Info(`Added ${guild.name}`)
            return super.add(ratiGuild, null)
            .then(() => {
                return userService.addGuildOwner(guild.owner);
            })
        })
    }

    updateGuild(oldGuild, newGuild){
        logger.Debug(`guild updateGuild`);
        return super.getById(Guild, [[oldGuild.id]], ["DiscordId"])
        .then(guildResult => {
            if(guildResult.length != 0){
                logger.Info(`Didn't update ${oldGuild.name} because it is not in the system.`)
                return null;
            }

            const userService = new UserService(this.db, this.client);
            userService.addGuildOwner(newGuild.owner);
            guildResult.Name = newGuild.name;
            logger.Info(`Updated ${oldGuild.name}`)
            return super.updateById(guildResult.id, Guild);
        })
    }

    /**
     * Maps user input to birthdayrat commands.
     *
     * @readonly
     * @memberof BirthdayRatService
     */
    get commands() {
        return {
        }
    }
}

module.exports = DJRatService;
