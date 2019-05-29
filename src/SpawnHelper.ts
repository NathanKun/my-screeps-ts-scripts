/*
MOVE            50      Moves the creep. Reduces creep fatigue by 2/tick. See movement.
WORK            100     Harvests energy from target source. Gathers 2 energy/tick.
                        Constructs a target structure. Builds the designated structure at a construction site, at 5 points/tick, consuming 1 energy/point. See building Costs.
                        Repairs a target structure. Repairs a structure for 20 hits/tick. Consumes 0.1 energy/hit repaired, rounded up to the nearest whole number.
CARRY           50      Stores energy. Contains up to 50 energy units. Weighs nothing when empty.
ATTACK          80      Attacks a target creep/structure. Deals 30 damage/tick. Short-ranged attack (1 tile).
RANGED_ATTACK	150     Attacks a target creep/structure. Deals 10 damage/tick. Long-ranged attack (1 to 3 tiles).
HEAL            250     Heals a target creep. Restores 12 hit points/tick at short range (1 tile) or 4 hits/tick at a distance (up to 3 tiles).
TOUGH           10      No effect other than the 100 hit points all body parts add. This provides a cheap way to add hit points to a creep.
CLAIM	600
*/

export class SpawnHelper {
  public static spawn(spawnParam: SpawnParam) {

    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
    const maintainers = _.filter(Game.creeps, (creep) => creep.memory.role === 'maintainer');
    const collectors = _.filter(Game.creeps, (creep) => creep.memory.role === 'collector');
    const claimers = _.filter(Game.creeps, (creep) => creep.memory.role === 'claimer');

    /* Auto spawn builders if there is construction site */
    if (spawnParam.builder === -1) {
      if (spawnParam.spawn.room.find(FIND_CONSTRUCTION_SITES).length !== 0) {
        spawnParam.builder = 3;
      } else {
        spawnParam.builder = 0;
        spawnParam.upgrader += 3;
      }
    }

    const spawnParamHarvester = spawnParam.harvesterConfig.base + spawnParam.harvesterConfig.W9S6;

    /* Find role most needed to spawn */
    let max = spawnParamHarvester - harvesters.length;
    let toSpawn = "harvester";

    if (max <= 0) { // prior harvester
      if (spawnParam.builder - builders.length > max) {
        max = spawnParam.builder - builders.length;
        toSpawn = "builder";
      }
      if (spawnParam.upgrader - upgraders.length > max) {
        max = spawnParam.upgrader - upgraders.length;
        toSpawn = "upgrader";
      }
      if (spawnParam.maintainer - maintainers.length > max) {
        max = spawnParam.maintainer - maintainers.length;
        toSpawn = "maintainer";
      }
      if (spawnParam.collector - collectors.length > max) {
        max = spawnParam.collector - collectors.length;
        toSpawn = "collector";
      }
      if (spawnParam.claimer - claimers.length > max) {
        max = spawnParam.claimer - claimers.length;
        toSpawn = "claimer";
      }
    }


    /* Logs */
    console.log('Harvesters:  \t' + harvesters.length + " Missing: \t" + (spawnParamHarvester - harvesters.length));
    console.log('Builders:    \t' + builders.length + " Missing: \t" + (spawnParam.builder - builders.length));
    console.log('Upgraders:   \t' + upgraders.length + " Missing: \t" + (spawnParam.upgrader - upgraders.length));
    console.log('Maintainers: \t' + maintainers.length + " Missing: \t" + (spawnParam.maintainer - maintainers.length));
    console.log('Collectors: \t' + collectors.length + " Missing: \t" + (spawnParam.collector - collectors.length));
    console.log('Claimers: \t' + claimers.length + " Missing: \t" + (spawnParam.claimer - claimers.length));

    if (Game.spawns['Spawn1'].spawning) {
      const spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning!!.name];
      console.log("Spawning: " + spawningCreep.memory.role);
    }
    if (max <= 0) {
      return;
    }
    console.log('Next spawn: ' + toSpawn);

    /* harvester */
    if (toSpawn === "harvester") {
      // spawn basic harvester
      if (harvesters.length < 1) {
        Game.spawns['Spawn1'].spawnCreep(
          [WORK, CARRY, MOVE],
          'Harvester' + Game.time,
          {
            memory: {
              role: 'harvester',
              preferTransferStructure: 'tower',
              harvesterRoom: 'base'
            }
          } as SpawnOptions);
        return;
      }
      // spawn advance harvester
      else {
        // define harvest room
        const config = spawnParam.harvesterConfig;
        let baseCount = 0;
        let w9s6Count = 0;

        for (const name in Game.creeps) {
          const creep = Game.creeps[name];
          if (creep.memory.role === 'harvester') {
            if (creep.memory.harvesterRoom === undefined || creep.memory.harvesterRoom === 'base') {
              baseCount++;
            } else if (creep.memory.harvesterRoom === 'W9S6') {
              w9s6Count++;
            }
          }
        }

        let room;
        if (baseCount < config.base) {
          room = 'base';
        } else if (w9s6Count < config.W9S6) {
          room = 'W9S6';
        }

        // spawn
        Game.spawns['Spawn1'].spawnCreep(
          [WORK, WORK,
            CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
          'Harvester' + Game.time,
          {
            memory: {
              role: 'harvester',
              preferTransferStructure: Game.time % 2 === 0 ? 'tower' : 'storage',
              harvesterRoom: room
            }
          } as SpawnOptions);
        return;
      }
    }

    /* builder */
    else if (toSpawn === "builder") {
      Game.spawns['Spawn1'].spawnCreep(
        [WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        'Builder' + Game.time,
        { memory: { role: 'builder' } } as SpawnOptions);
      return;
    }

    /* upgrader */
    else if (toSpawn === "upgrader") {
      Game.spawns['Spawn1'].spawnCreep(
        [WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        'Upgrader' + Game.time,
        { memory: { role: 'upgrader' } } as SpawnOptions);
      return;
    }

    /* maintainer */
    else if (toSpawn === "maintainer") {
      Game.spawns['Spawn1'].spawnCreep(
        [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        'Maintainer' + Game.time,
        { memory: { role: 'maintainer' } } as SpawnOptions);
      return;
    }

    /* collector */
    else if (toSpawn === "collector") {
      Game.spawns['Spawn1'].spawnCreep(
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        'Collector' + Game.time,
        { memory: { role: 'collector' } } as SpawnOptions);
      return;
    }

    /* claimer */
    else if (toSpawn === "claimer") {
      Game.spawns['Spawn1'].spawnCreep(
        [CLAIM, CLAIM, MOVE],
        'Claimer' + Game.time,
        { memory: { role: 'claimer' } } as SpawnOptions);
      return;
    }
  }
}
