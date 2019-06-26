import { ErrorMapper } from "utils/ErrorMapper";

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

  private static internalSpawnOne(spawnParam: SpawnParam) {
    if (!spawnParam.spawns[0]) {
      return;
    }

    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.room.name === spawnParam.spawns[0].room.name);
    const harvesterExts = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvesterExt' && creep.memory.transferRoom === spawnParam.spawns[0].room.name);
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder' && creep.room.name === spawnParam.spawns[0].room.name);
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader' && creep.room.name === spawnParam.spawns[0].room.name);
    const maintainers = _.filter(Game.creeps, (creep) => creep.memory.role === 'maintainer' && creep.room.name === spawnParam.spawns[0].room.name);
    const collectors = _.filter(Game.creeps, (creep) => creep.memory.role === 'collector' && creep.room.name === spawnParam.spawns[0].room.name);
    const claimers = _.filter(Game.creeps, (creep) => creep.memory.role === 'claimer' && creep.memory.room === spawnParam.spawns[0].room.name);

    spawnParam.spawns[0].room.memory.harvester = harvesters.length;
    spawnParam.spawns[0].room.memory.harvesterExt = harvesterExts.length;
    spawnParam.spawns[0].room.memory.builder = builders.length;
    spawnParam.spawns[0].room.memory.upgrader = upgraders.length;
    spawnParam.spawns[0].room.memory.maintainer = maintainers.length;
    spawnParam.spawns[0].room.memory.collector = collectors.length;
    spawnParam.spawns[0].room.memory.claimer = claimers.length;

    /* Auto spawn builders if there is construction site */
    if (spawnParam.builder.count === -1) {
      if (spawnParam.spawns[0].room.find(FIND_CONSTRUCTION_SITES).length !== 0) {
        spawnParam.builder.count = 1;
      } else {
        spawnParam.builder.count = 0;
        spawnParam.upgrader.count += 1;
      }
    }

    /* Auto spawn maintainer */
    const spawnMaintainerRatio = 0.5
    if (spawnParam.maintainer.count === -1 && spawnParam.collector.count === -1) {
      if (maintainers.length + collectors.length >= 1) {
        spawnParam.maintainer.count = 0;
        spawnParam.collector.count = 0;
      } else {
        spawnParam.maintainer.count = 1;
        spawnParam.collector.count = 0;
      }
    }
    else if (spawnParam.maintainer.count === -1) {
      if (spawnParam.spawns[0].room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_ROAD && ((s.hits / s.hitsMax) < spawnMaintainerRatio)
      }).length !== 0) {
        spawnParam.maintainer.count = 1;
      } else {
        spawnParam.maintainer.count = 0;
      }
    }

    /* Find role most needed to spawn */
    let max = spawnParam.harvester.count - harvesters.length;
    let toSpawn = "harvester"; // prior harveste

    if (max <= 0) {
      max = 0;
      if (spawnParam.maintainer.count - maintainers.length > max) {
        max = spawnParam.maintainer.count - maintainers.length;
        toSpawn = "maintainer";
      }
      else if (spawnParam.harvesterExt.count - harvesterExts.length > max) {
        max = spawnParam.harvesterExt.count - harvesterExts.length;
        toSpawn = "harvesterExt";
      }
      else if (spawnParam.claimer.count - claimers.length > max) {
        max = spawnParam.claimer.count - claimers.length;
        toSpawn = "claimer";
      }
      else if (spawnParam.builder.count - builders.length > max) {
        max = spawnParam.builder.count - builders.length;
        toSpawn = "builder";
      }
      else if (spawnParam.upgrader.count - upgraders.length > max) {
        max = spawnParam.upgrader.count - upgraders.length;
        toSpawn = "upgrader";
      }
      else if (spawnParam.collector.count - collectors.length > max) {
        max = spawnParam.collector.count - collectors.length;
        toSpawn = "collector";
      }
    }

    const notSpawningSpawns = spawnParam.spawns.filter(s => !s.spawning);

    if (max <= 0) {
      spawnParam.spawns[0].room.memory.toSpawn = undefined;
      return;
    } else {
      spawnParam.spawns[0].room.memory.toSpawn = toSpawn;
    }

    if (notSpawningSpawns.length === 0) {
      return;
    }

    /* harvester */
    if (toSpawn === "harvester") {
      // spawn basic harvester
      if (harvesters.length + harvesterExts.length < 1) {
        notSpawningSpawns[0].spawnCreep(
          [WORK, CARRY, CARRY, MOVE],
          'Harvester' + Game.time,
          {
            memory: {
              role: 'harvester',
              room: spawnParam.spawns[0].room.name,
              preferTransferStructure: 'tower',
              harvestRoom: spawnParam.spawns[0].room.name,
              transferRoom: spawnParam.spawns[0].room.name,
              spawnTime: Game.time
            }
          });
        return;
      }
      // spawn advance harvester
      else {
        notSpawningSpawns[0].spawnCreep(
          spawnParam.harvester.parts,
          'Harvester' + Game.time,
          {
            memory: {
              role: 'harvester',
              room: spawnParam.spawns[0].room.name,
              preferTransferStructure: Game.time % 2 === 0 ? 'tower' : 'storage',
              spawnTime: Game.time
            }
          });
        return;
      }
    }

    /* harvester ext */
    else if (toSpawn === "harvesterExt") {
      notSpawningSpawns[0].spawnCreep(
        spawnParam.harvesterExt.parts,
        'HarvesterExt' + Game.time,
        {
          memory: {
            role: 'harvesterExt',
            room: spawnParam.spawns[0].room.name,
            preferTransferStructure: 'tower',
            harvestRoom: spawnParam.harvesterExt.harvestRoom,
            transferRoom: spawnParam.spawns[0].room.name,
            spawnTime: Game.time,
            canAttack: spawnParam.harvesterExt.canAttack
          }
        });
      return;
    }

    /* builder */
    else if (toSpawn === "builder") {
      notSpawningSpawns[0].spawnCreep(
        spawnParam.builder.parts,
        'Builder' + Game.time,
        {
          memory: {
            role: 'builder',
            room: spawnParam.spawns[0].room.name,
            spawnTime: Game.time
          }
        });
      return;
    }

    /* upgrader */
    else if (toSpawn === "upgrader") {
      notSpawningSpawns[0].spawnCreep(
        spawnParam.upgrader.parts,
        'Upgrader' + Game.time,
        {
          memory: {
            role: 'upgrader',
            room: spawnParam.spawns[0].room.name,
            spawnTime: Game.time,
            upgraderUseStorageMin: spawnParam.upgrader.upgraderUseStorageMin
          }
        });
      return;
    }

    /* maintainer */
    else if (toSpawn === "maintainer") {
      notSpawningSpawns[0].spawnCreep(
        spawnParam.maintainer.parts,
        'Maintainer' + Game.time,
        {
          memory: {
            role: 'maintainer',
            room: spawnParam.spawns[0].room.name,
            spawnTime: Game.time
          }
        });
      return;
    }

    /* collector */
    else if (toSpawn === "collector") {
      notSpawningSpawns[0].spawnCreep(
        spawnParam.collector.parts,
        'Collector' + Game.time,
        {
          memory: {
            role: 'collector',
            room: spawnParam.spawns[0].room.name,
            spawnTime: Game.time
          }
        });
      return;
    }

    /* claimer */
    else if (toSpawn === "claimer") {
      notSpawningSpawns[0].spawnCreep(
        spawnParam.claimer.parts,
        'Claimer' + Game.time,
        {
          memory: {
            role: 'claimer',
            spawnTime: Game.time,
            room: spawnParam.spawns[0].room.name,
            claimerRoom: spawnParam.claimer.claimerRoom,
            claimerAction: spawnParam.claimer.claimerAction
          }
        });
      return;
    }
  }

  private static printStat(spawnParams: SpawnParam[]) {
    let room = 'Room           \t';
    let spawning = 'Spawning      \t';
    let nextSpawn = 'Next Spawn    \t';
    let harvester = 'Harvesters:    \t';
    let harvesterExt = 'HarvesterExts: \t';
    let builder = 'Builders:      \t';
    let upgrader = 'Upgraders:     \t';
    let maintainer = 'Maintainers:   \t';
    let collector = 'Collectors:    \t';
    let claimer = 'Claimers:      \t';

    for (const spawnParam of spawnParams) {
      if (spawnParam.spawns[0] === undefined) {
        continue;
      }

      let spawningCount = 0;
      for (const spawn of spawnParam.spawns) {
        if (spawn.spawning) {
          spawning += Game.creeps[spawn.spawning.name].memory.role + ' ';
          spawningCount++;
        }
      }

      if (spawningCount === 0) {
        spawning += '\t\t\t|\t';
      } else if (spawningCount === 1) {
        spawning += '\t\t|\t';
      } else {
        spawning += '\t|\t';
      }

      nextSpawn += spawnParam.spawns[0].room.memory.toSpawn ? spawnParam.spawns[0].room.memory.toSpawn + '\t\t\t|\t' : '\t\t\t|\t';

      room += spawnParam.spawns[0].room.name + '\t\t\t|\t'
      harvester += spawnParam.spawns[0].room.memory.harvester + '\t' + (spawnParam.harvester.count - spawnParam.spawns[0].room.memory.harvester) + '\t\t|\t';
      harvesterExt += spawnParam.spawns[0].room.memory.harvesterExt + '\t' + (spawnParam.harvesterExt.count - spawnParam.spawns[0].room.memory.harvesterExt) + '\t\t|\t';
      builder += spawnParam.spawns[0].room.memory.builder + '\t' + (spawnParam.builder.count - spawnParam.spawns[0].room.memory.builder) + '\t\t|\t';
      upgrader += spawnParam.spawns[0].room.memory.upgrader + '\t' + (spawnParam.upgrader.count - spawnParam.spawns[0].room.memory.upgrader) + '\t\t|\t';
      maintainer += spawnParam.spawns[0].room.memory.maintainer + '\t' + (spawnParam.maintainer.count - spawnParam.spawns[0].room.memory.maintainer) + '\t\t|\t';
      collector += spawnParam.spawns[0].room.memory.collector + '\t' + (spawnParam.collector.count - spawnParam.spawns[0].room.memory.collector) + '\t\t|\t';
      claimer += spawnParam.spawns[0].room.memory.claimer + '\t' + (spawnParam.claimer.count - spawnParam.spawns[0].room.memory.claimer) + '\t\t|\t';
    }

    console.log(room);
    console.log(spawning);
    console.log(nextSpawn);
    console.log(harvester);
    console.log(harvesterExt);
    console.log(builder);
    console.log(upgrader);
    console.log(maintainer);
    console.log(collector);
    console.log(claimer);
  }

  private static internalSpawn(spawnParams: SpawnParam[]) {
    for (const spawnParam of spawnParams) {
      SpawnHelper.internalSpawnOne(spawnParam);
    }

    SpawnHelper.printStat(spawnParams);
  }

  public static spawn(spawnParams: SpawnParam[]) {
    try {
      SpawnHelper.internalSpawn(spawnParams);
    } catch (e) {
      console.log('Error in SpawnHelper.spwan: ' + e);
      const outText = ErrorMapper.sourceMappedStackTrace(e);
      Game.notify('Game.time = ' + Game.time + '\n' + 'Error in SpawnHelper.spwan' +
        '\n' + e + '\n' + outText);
    }
  }
}
