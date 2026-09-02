// ==UserScript==
// @name         FlatMMO Manager
// @namespace    https://github.com/cskoghed
// @version      2025-10-30
// @description  try to take over the world!
// @author       cskoghed
// @match        https://flatmmo.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/cskoghed/FlatMMO-manager/main/flatMMO-manager.js
// @downloadURL  https://raw.githubusercontent.com/cskoghed/FlatMMO-manager/main/flatMMO-manager.js
// @grant        none
// ==/UserScript==

'use strict';

class AutoDoer {
    static get username() {
        return document.querySelector("#top-bar-entry-profile").textContent;
    }

    static maps = {
        'm0000_0000': null,
        'm1000_1000': null,
        'm1001_1001_inside1': null,
        'm1001_1000': null,
        'm1001_1001': null,
        'm1002_1001': null,
        'm1002_1001_inside2': null,
        'm1002_1001_sewers': null,
        'm1009_1001': null,
        'm1000_1109': null,
        'm1002_1000': null,
        'm1001_1000_inside': null,
        'm1001_1000_inside_basement': null,
        'm1001_999': null,
        'm1001_999_inside1': "cold_house_door"
    };

    // The energy level of the player
    static get energyLevel() {
        return parseInt(document.querySelector("#table-top-icons > tbody > tr:nth-child(1) > td:nth-child(4) > display-backend-value:nth-child(1)").textContent);
    }

    // The coords of the player
    static get playerCoords() {
        return [(players[this.username].client_x / 64), parseInt(players[this.username].client_y / 64)];
    }

    static websocketSend(message) {
        Globals.websocket.send(message);
    }

    static start(interval, timing = 2000) {
        this.stop(interval);

        let target = null;

        return setInterval(() => {
            target = this.getToWork(target);
        }, timing);
    }

    static stop(interval) {
        if (interval) {
            clearInterval(interval);
        }

        return null;
    }

    static getToWork() {
        console.error('This has not been implemented yet.');
    }

    // Todo: Finish
    // Only works when fighting in the chicken farm!!
    static async goToSleep() {

        // // Leave chicken area
        // Globals.websocket.send('CLICKED_TILE=0~11');
        // await new Promise(r => setTimeout(r, 4000));
        // // Enter fish supply shop
        // Globals.websocket.send('CLICKED_MAP_OBJECT=O_hcebqjczus');
        // await new Promise(r => setTimeout(r, 4000));

        // Go to bedd
        this.websocketSend('CLICKED_MAP_OBJECT=O_wvguegtfax');
    }

    static async waitForUpdate(condition, timeout = 20000) {
        return new Promise ((resolve, reject) => {
            const start = Date.now();

            const check = () => {
                if (condition()) {
                    resolve();
                } else if (Date.now() - start > timeout) {
                    reject();
                } else {
                    setTimeout(check, 1000);
                }
            };

            check();
        });
    }
};

class AutoMiner extends AutoDoer {
    static #interval = null;

static sleeping = false;

static get isRunning() {
    return this.#interval != null;
}

// TODO: Gör till en lista så det faktiskt kan vara fler än 1 targetOre
static #targetOres = null;

static set targetOres(ores) {
    this.#targetOres = ores;
}

static get targetOres() {
    return this.#targetOres;
}

/**
     * @returns {bool}
     */
static rockIsFinishedMining(targetId) {

    for (const item of map_objects) {
        if (item.uuid !== targetId) { continue; }

        return (item.filename === 'empty_rock') &&
            progress_bar_at === progress_bar_target;
    }
    // return progress_bar_active
}

/**
     * @returns {string} uuid of target ore
     */
static findNewTarget() {
    // TODO: Gör till en lista så det faktiskt kan vara fler än 1 targetOre
    let ore = this.targetOres;

    //if (Manager.numItems('coal') < Manager.numItems(ore) * ) {

    //}


    let targetId = null;
    let minDistanceSquared = Number.MAX_VALUE;

    const myCoords = this.playerCoords;

    // console.log(ore, myCoords);

    map_objects.forEach(item => {
        if (item.filename !== (ore + '_rock')) { return; }

        const distSqrd = (item.x - myCoords[0])**2 + (item.y - myCoords[1])**2;

        if (distSqrd < minDistanceSquared) {
            minDistanceSquared = distSqrd;
            targetId = item.uuid;
        }
    });

    return targetId;
}

static async goToSleep() {
    this.sleeping = true;

    // if (this.targetOres === 'iron'   ||
    //     this.targetOres === 'silver' ||
    //     this.targetOres === 'gold'
    const downTheLadder = current_map === 'm1002_1000_inside1';
    if (downTheLadder) {
        // Head up the ladder
        const ladderId = map_objects.find(item => item.name === 'ladder_m1002_1000_inside1').uuid;
        this.websocketSend('CLICKED_MAP_OBJECT=' + ladderId)
        await this.waitForUpdate(() => current_map === 'm1002_1000');
    }

    // Outside of general store
    this.websocketSend('CLICKED_TILE=0~10');
    await this.waitForUpdate(() => current_map === 'm1001_1000');

    // By the Barbarian
    this.websocketSend('CLICKED_TILE=13~13');
    await this.waitForUpdate(() => current_map === 'm1001_999');

    // Enter Minty's house
    const mintysHouse = "m1001_999_inside1";
    const mintysEntrance = map_objects.find(item => item.name === this.maps[mintysHouse]).uuid;
    this.websocketSend('CLICKED_MAP_OBJECT=' + mintysEntrance);
    await this.waitForUpdate(() => current_map === mintysHouse);

    // Sleep
    const bed = map_objects.find(item => item.name === 'bed');
    this.websocketSend('CLICKED_MAP_OBJECT=' + bed.uuid); // Click the bed
    await this.waitForUpdate(() => players[this.username].client_pathing.length !== 0);
    await this.waitForUpdate(() => players[this.username].client_pathing.length === 0);

    console.log('Done sleeping - heading back!');

    // Return to mining
    // By the Barbarian
    this.websocketSend('CLICKED_TILE=13~13');
    await this.waitForUpdate(() => current_map === 'm1001_999');

    // Outside of general store
    this.websocketSend('CLICKED_TILE=13~0');
    await this.waitForUpdate(() => current_map === 'm1001_1000');

    // Back to mine
    this.websocketSend('CLICKED_TILE=23~10');
    await this.waitForUpdate(() => current_map === 'm1002_1000');

    // if (this.targetOres === 'iron'   ||
    //     this.targetOres === 'silver' ||
    //     this.targetOres === 'gold'
    if (downTheLadder) {
        // Climb down the ladder
        const ladderId = map_objects.find(item => item.name === 'ladder_m1002_1000').uuid;
        this.websocketSend('CLICKED_MAP_OBJECT=' + ladderId)
        await this.waitForUpdate(() => current_map === 'm1002_1000_inside1');
    }
    this.sleeping = false;

}

static getToWork(targetId) {
    if (this.sleeping) { return; }

    if (this.energyLevel < 1) {
        console.log('No energy. Time to sleep.')
        this.goToSleep();
        return;
    }

    if (!targetId || this.rockIsFinishedMining(targetId)) {
        targetId = this.findNewTarget();
        if (targetId) {
            this.websocketSend(`CLICKED_MAP_OBJECT=${targetId}`);
        }
    }

    return targetId;
}

static start(targetOres) {
    if (targetOres) {
        this.targetOres = targetOres;
    }

    if (!this.targetOres) {
        console.error("No target ore set to be mined.");
        return;
    }

    this.#interval = super.start(this.#interval, 500);
}

static stop() {
    this.#interval = super.stop(this.#interval);
}

}

class AutoBot {
    static #interval = null;
static #actionQueue = [];

static stop() {
    if (this.#interval) {
        clearInterval(this.#interval);
        this.#interval = null;
    }
}
}

function autoSteal(target) {
    if (!['citizen', 'farmer', 'mage'].includes(target)) {console.error('Invalid target'); return; }

    let wasJustActive = false;
    return setInterval(() => {
        if (progress_bar_active) { wasJustActive = true; return; }

        if (wasJustActive) {wasJustActive = false; return; }

        if (items.length >= inventory_size - 1) {
            Manager.depositAll();
        }

        // const citizenId = Object.values(npcs).find(npc => npc.name === 'citizen').uuid;
        const targetNpc = Object.values(npcs).find(npc => (npc.name === target) && (npc.is_pickpocket_able === true));
        if (!targetNpc) {
            return;
        }
        Globals.websocket.send('CLICKS_NPC='+ targetNpc.uuid);
    }, 2000);
};


class Manager {

    /**
     * The total amount of an item in the inventory.
     */
    static numItems(itemName) {
        let numItems = 0;
        items.forEach(item => {
            if (item.item === 'coal'){
                numItems += parseInt(item.amount);
            }
        })
        return numItems;
    }

    static async depositAll() {
        if (!map_objects.find(obj => obj.name.includes('bank'))) { return; }

        for (const item of items) {
            Globals.websocket.send(`DEPOSIT_TO_BANK=${item.item}~${item.amount}`);
            await new Promise(r => setTimeout(r, 500));
        };
    }

}

function login() {
    if (document.location.pathname === '/dashboard.php') {
        document.querySelector("#character-select > center > div > div").click();
    }
}

function loadSettings() {
    // TODO: Faktiskt fixa den här, genom att spara i localStorage
    if (document.location.pathname === '/play.php') {
        // const answer =
        // AutoMiner.start('silver');
        // AutoFisher.start('shrimp');
        let stealInterval = autoSteal('farmer');
        // console.log('stealing...');
    }
}

await new Promise(r => setTimeout(r, 2000));
login();
loadSettings();