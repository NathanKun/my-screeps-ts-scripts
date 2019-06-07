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

  private static internalSpawn(spawnParam: SpawnParam) {

    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.room.name === spawnParam.spawn.room.name);
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder' && creep.room.name === spawnParam.spawn.room.name);
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader' && creep.room.name === spawnParam.spawn.room.name);
    const maintainers = _.filter(Game.creeps, (creep) => creep.memory.role === 'maintainer' && creep.room.name === spawnParam.spawn.room.name);
    const collectors = _.filter(Game.creeps, (creep) => creep.memory.role === 'collector' && creep.room.name === spawnParam.spawn.room.name);
    // count claimer globally
    const claimers = _.filter(Game.creeps, (creep) => creep.memory.role === 'claimer');

    /* Auto spawn builders if there is construction site */
    if (spawnParam.builder.count === -1) {
      if (spawnParam.spawn.room.find(FIND_CONSTRUCTION_SITES).length !== 0) {
        spawnParam.builder.count = 1;
      } else {
        spawnParam.builder.count = 0;
        spawnParam.upgrader.count += 1;
      }
    }

    /* Auto spawn maintainer */
    const spawnMaintainerRatio = 0.5
    if (spawnParam.maintainer.count === -1) {
      if (spawnParam.spawn.room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_ROAD && ((s.hits / s.hitsMax) < spawnMaintainerRatio)
      }).length !== 0) {
        spawnParam.maintainer.count = 1;
      } else {
        spawnParam.maintainer.count = 0;
      }
    }

    /* Find role most needed to spawn */
    let max = spawnParam.harvester.count - harvesters.length;
    let toSpawn = "harvester";

    if (max <= 0) { // prior harvester
      if (spawnParam.builder.count - builders.length > max) {
        max = spawnParam.builder.count - builders.length;
        toSpawn = "builder";
      }
      if (spawnParam.upgrader.count - upgraders.length > max) {
        max = spawnParam.upgrader.count - upgraders.length;
        toSpawn = "upgrader";
      }
      if (spawnParam.maintainer.count - maintainers.length > max) {
        max = spawnParam.maintainer.count - maintainers.length;
        toSpawn = "maintainer";
      }
      if (spawnParam.collector.count - collectors.length > max) {
        max = spawnParam.collector.count - collectors.length;
        toSpawn = "collector";
      }
      if (spawnParam.claimer.count - claimers.length > max) {
        max = spawnParam.claimer.count - claimers.length;
        toSpawn = "claimer";
      }
    }


    /* Logs */
    console.log('Harvesters:  \t' + harvesters.length + " Missing: \t" + (spawnParam.harvester.count - harvesters.length));
    console.log('Builders:    \t' + builders.length + " Missing: \t" + (spawnParam.builder.count - builders.length));
    console.log('Upgraders:   \t' + upgraders.length + " Missing: \t" + (spawnParam.upgrader.count - upgraders.length));
    console.log('Maintainers: \t' + maintainers.length + " Missing: \t" + (spawnParam.maintainer.count - maintainers.length));
    console.log('Collectors: \t' + collectors.length + " Missing: \t" + (spawnParam.collector.count - collectors.length));
    console.log('Claimers: \t' + claimers.length + " Missing: \t" + (spawnParam.claimer.count - claimers.length));

    if (spawnParam.spawn.spawning) {
      const spawningCreep = Game.creeps[spawnParam.spawn.spawning!!.name];
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
        spawnParam.spawn.spawnCreep(
          [WORK, CARRY, CARRY, MOVE],
          'Harvester' + Game.time,
          {
            memory: {
              role: 'harvester',
              preferTransferStructure: 'tower',
              harvesterRoom: 'base',
              spawnTime: Game.time
            }
          });
        return;
      }
      // spawn advance harvester
      else {
        spawnParam.spawn.spawnCreep(
          spawnParam.harvester.parts,
          'Harvester' + Game.time,
          {
            memory: {
              role: 'harvester',
              preferTransferStructure: Game.time % 2 === 0 ? 'tower' : 'storage',
              spawnTime: Game.time
            }
          });
        return;
      }
    }

    /* builder */
    else if (toSpawn === "builder") {
      spawnParam.spawn.spawnCreep(
        spawnParam.builder.parts,
        'Builder' + Game.time,
        {
          memory: {
            role: 'builder',
            spawnTime: Game.time
          }
        });
      return;
    }

    /* upgrader */
    else if (toSpawn === "upgrader") {
      spawnParam.spawn.spawnCreep(
        spawnParam.upgrader.parts,
        'Upgrader' + Game.time,
        {
          memory: {
            role: 'upgrader',
            spawnTime: Game.time
          }
        });
      return;
    }

    /* maintainer */
    else if (toSpawn === "maintainer") {
      spawnParam.spawn.spawnCreep(
        spawnParam.maintainer.parts,
        'Maintainer' + Game.time,
        {
          memory: {
            role: 'maintainer',
            spawnTime: Game.time
          }
        });
      return;
    }

    /* collector */
    else if (toSpawn === "collector") {
      spawnParam.spawn.spawnCreep(
        spawnParam.collector.parts,
        'Collector' + Game.time,
        {
          memory: {
            role: 'collector',
            spawnTime: Game.time
          }
        });
      return;
    }

    /* claimer */
    else if (toSpawn === "claimer") {
      spawnParam.spawn.spawnCreep(
        spawnParam.claimer.parts,
        'Claimer' + Game.time,
        {
          memory: {
            role: 'claimer',
            spawnTime: Game.time
          }
        });
      return;
    }
  }

  public static spawn(spawnParam: SpawnParam) {
    try {
      SpawnHelper.internalSpawn(spawnParam);
    } catch (e) {
      Game.notify('Game.time = ' + Game.time + '\n' + 'Error in SpawnHelper.spwan' + '\n' + e);
    }
  }
}
