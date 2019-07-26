import { Maintainer } from "roles/Maintainer";
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

    const harvesters: Creep[] = [];
    const harvesterExts: Creep[] = [];
    const builders: Creep[] = [];
    const upgraders: Creep[] = [];
    const claimers: Creep[] = [];
    const maintainers: Creep[] = [];
    const collectors: Creep[] = [];

    for (const n in Game.creeps) {
      const creep = Game.creeps[n];

      if (creep.memory.role === 'harvester' && creep.memory.room === spawnParam.spawns[0].room.name) {
        harvesters.push(creep);
      } else if (creep.memory.role === 'harvesterExt' && creep.memory.transferRoom === spawnParam.spawns[0].room.name) {
        harvesterExts.push(creep);
      } else if (creep.memory.role === 'builder' && creep.memory.room === spawnParam.spawns[0].room.name) {
        builders.push(creep);
      } else if (creep.memory.role === 'upgrader' && creep.memory.room === spawnParam.spawns[0].room.name) {
        upgraders.push(creep);
      } else if (creep.memory.role === 'claimer' && creep.memory.room === spawnParam.spawns[0].room.name) {
        claimers.push(creep);
      } else if (creep.memory.role === 'maintainer' && creep.memory.fullMaintainer && creep.room.name === spawnParam.spawns[0].room.name) {
        maintainers.push(creep);
      } else if ((creep.memory.role === 'collector' || creep.memory.role === 'maintainer') && creep.memory.fullMaintainer === false && creep.room.name === spawnParam.spawns[0].room.name) {
        collectors.push(creep);
      }
    }

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
        spawnParam.builder.count = 2;
      } else {
        spawnParam.builder.count = 0;
      }
    }

    /* Auto spawn maintainer */
    if (spawnParam.maintainer.count === -1) {
      const structures = spawnParam.spawns[0].room.find(FIND_STRUCTURES, {
        filter: s => {
          let hitsMax;

          switch (s.structureType) {
            case STRUCTURE_WALL:
              hitsMax = Maintainer.WALL_REPAIRE_MAX_HITS;
              break;
            case STRUCTURE_RAMPART:
              hitsMax = Maintainer.RAMPART_REPAIRE_MAX_HITS;
              break;
            default:
              hitsMax = s.hitsMax;
              break;
          }

          return s.hits < (hitsMax / 2);
        }
      });

      if (structures.length) {
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
      if (spawnParam.harvesterExt.count - harvesterExts.length > max) {
        max = spawnParam.harvesterExt.count - harvesterExts.length;
        toSpawn = "harvesterExt";
      }
      else if (spawnParam.collector.count - collectors.length > max) {
        max = spawnParam.collector.count - collectors.length;
        toSpawn = "collector";
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
      else if (spawnParam.maintainer.count - maintainers.length > max) {
        max = spawnParam.maintainer.count - maintainers.length;
        toSpawn = "maintainer";
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
            harvestRoom: spawnParam.harvesterExt.harvestRoom,
            transferRoom: spawnParam.spawns[0].room.name,
            spawnTime: Game.time,
            canAttack: spawnParam.harvesterExt.canAttack,
            harvesterExtPrimaryTransferTargets: spawnParam.harvesterExt.harvesterExtPrimaryTransferTargets
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
            spawnTime: Game.time,
            collectorWithdrawTargets: spawnParam.collector.collectorWithdrawTargets,
            fullMaintainer: true
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
            spawnTime: Game.time,
            collectorWithdrawTargets: spawnParam.collector.collectorWithdrawTargets,
            fullMaintainer: false
          }
        });
      return;
    }

    /* claimer */
    else if (toSpawn === "claimer") {
      let reservationTick = 0;
      if (spawnParam.claimer.claimerRoom && Game.rooms[spawnParam.claimer.claimerRoom]) {
        const ctrller = Game.rooms[spawnParam.claimer.claimerRoom].controller;
        if (ctrller && ctrller.reservation) {
          reservationTick = ctrller.reservation.ticksToEnd
        }
      }

      const parts = [...spawnParam.claimer.parts];
      if (spawnParam.claimer.claimerAction === 'reserve' && reservationTick < 4000) {
        parts.push(CLAIM);
      }

      notSpawningSpawns[0].spawnCreep(
        parts,
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
    let room = '<tr>' + td('Room');
    let spawning = '<tr>' + td('Spawning');
    let nextSpawn = '<tr>' + td('Next Spawn');
    let harvester = '<tr>' + td('Harvesters');
    let harvesterExt = '<tr>' + td('HarvesterExts');
    let builder = '<tr>' + td('Builders');
    let upgrader = '<tr>' + td('Upgraders');
    let maintainer = '<tr>' + td('Maintainers');
    let collector = '<tr>' + td('Collectors');
    let claimer = '<tr>' + td('Claimers');

    for (const spawnParam of spawnParams) {
      if (spawnParam.spawns[0] === undefined) {
        continue;
      }

      spawning += '<td style="padding: 5px; border:1px solid white;">';
      for (const spawn of spawnParam.spawns) {
        if (spawn.spawning) {
          spawning += Game.creeps[spawn.spawning.name].memory.role + '\t';
        }
      }
      spawning += '</td>';

      nextSpawn += spawnParam.spawns[0].room.memory.toSpawn ? td(spawnParam.spawns[0].room.memory.toSpawn!!) : td('');

      room += td(spawnParam.spawns[0].room.name);
      harvester += td(spawnParam.spawns[0].room.memory.harvester + '\t' + (spawnParam.harvester.count - spawnParam.spawns[0].room.memory.harvester));
      harvesterExt += td(spawnParam.spawns[0].room.memory.harvesterExt + '\t' + (spawnParam.harvesterExt.count - spawnParam.spawns[0].room.memory.harvesterExt));
      builder += td(spawnParam.spawns[0].room.memory.builder + '\t' + (spawnParam.builder.count - spawnParam.spawns[0].room.memory.builder));
      upgrader += td(spawnParam.spawns[0].room.memory.upgrader + '\t' + (spawnParam.upgrader.count - spawnParam.spawns[0].room.memory.upgrader));
      maintainer += td(spawnParam.spawns[0].room.memory.maintainer + '\t' + (spawnParam.maintainer.count - spawnParam.spawns[0].room.memory.maintainer));
      collector += td(spawnParam.spawns[0].room.memory.collector + '\t' + (spawnParam.collector.count - spawnParam.spawns[0].room.memory.collector));
      claimer += td(spawnParam.spawns[0].room.memory.claimer + '\t' + (spawnParam.claimer.count - spawnParam.spawns[0].room.memory.claimer));
    }

    room += '</tr>';
    spawning += '</tr>';
    nextSpawn += '</tr>';
    harvester += '</tr>';
    harvesterExt += '</tr>';
    builder += '</tr>';
    upgrader += '</tr>';
    maintainer += '</tr>';
    collector += '</tr>';
    claimer += '</tr>';

    const table =
      "<table><tbody>" +
      room + spawning + nextSpawn + harvester + harvesterExt + builder + upgrader + maintainer + collector + claimer +
      "</tbody></table>"

    console.log(table);

    function td(str: string): string {
      return '<td style="padding: 5px; border:1px solid white;">' + str + '</td>';
    }
  }

  public static spawn(spawnParams: SpawnParam[]) {
    for (const spawnParam of spawnParams) {
      try {
        SpawnHelper.internalSpawnOne(spawnParam);
      } catch (e) {
        console.log('Error in SpawnHelper.spwan: ' + e);
        const outText = ErrorMapper.sourceMappedStackTrace(e);
        Game.notify('Game.time = ' + Game.time + '\n' + 'Error in SpawnHelper.spwan' +
          '\n' + e + '\n' + outText);
      }
    }
    SpawnHelper.printStat(spawnParams);

  }
}
