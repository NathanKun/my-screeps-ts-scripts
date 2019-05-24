export class Collector {
  private static IDLE_X = 14;
  private static IDLE_Y = 13;

  private static STATUS_IDLE = "idle";
  private static STATUS_COLLECTING_RESOURCE = "collectingResource";
  private static STATUS_COLLECTING_TOMBSTONE = "collectingTombstone";
  private static STATUS_TRANSFERING = "transfering";

  /** @param {Creep} creep */
  public static run(creep: Creep) {
    if (!creep.memory.collectorStatus) {
      creep.memory.collectorStatus = Collector.STATUS_IDLE;
    } else if (creep.memory.collectorStatus === Collector.STATUS_TRANSFERING && creep.carry.energy === 0) {
      creep.memory.collectorStatus = Collector.STATUS_IDLE;
    }

    // Idle
    if (creep.memory.collectorStatus === Collector.STATUS_IDLE) {
      // find resource
      const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: r => r.resourceType === RESOURCE_ENERGY
      }).sort((r1, r2) => r2.amount - r1.amount);

      if (droppedResources.length) {
        creep.memory.collectorTarget = droppedResources[0].id;
        creep.memory.collectorStatus = Collector.STATUS_COLLECTING_RESOURCE;
        return;
      }

      // find tombstone
      const tombstones = creep.room.find(FIND_TOMBSTONES, {
        filter: t => t.store.energy > 0
      }).sort((t1, t2) => t1.ticksToDecay - t2.ticksToDecay);

      if (tombstones.length) {
        creep.memory.collectorTarget = tombstones[0].id;
        creep.memory.collectorStatus = Collector.STATUS_COLLECTING_TOMBSTONE;
        return;
      }

      // move to idle location
      if (creep.pos.x !== Collector.IDLE_X || creep.pos.y !== Collector.IDLE_Y) {
        creep.moveTo(Collector.IDLE_X, Collector.IDLE_Y);
      }
    }

    // Collecting Resource
    else if (creep.memory.collectorStatus === Collector.STATUS_COLLECTING_RESOURCE) {
      const resource = Game.getObjectById(creep.memory.collectorTarget) as Resource | undefined;
      if (resource === undefined || resource === null || resource.amount === 0) {
        creep.memory.collectorStatus = Collector.STATUS_TRANSFERING;
        return;
      }
      if (creep.pickup(resource!!) === ERR_NOT_IN_RANGE) {
        creep.moveTo(resource!!, { reusePath: 0 });
      }
    }

    // Collecting Tombstone
    else if (creep.memory.collectorStatus === Collector.STATUS_COLLECTING_TOMBSTONE) {
      const tombstone = Game.getObjectById(creep.memory.collectorTarget) as Tombstone;
      if (tombstone === undefined || tombstone === null || tombstone.store.energy === 0) {
        creep.memory.collectorStatus = Collector.STATUS_TRANSFERING;
        return;
      }
      if (creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(tombstone, { reusePath: 0 });
      }
    }

    // Transfering
    else if (creep.memory.collectorStatus === Collector.STATUS_TRANSFERING) {
      creep.memory.collectorTarget = undefined;

      // spwan and Extensions
      let targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN) &&
            structure.energy < structure.energyCapacity;
        }
      });

      // tower
      if (targets.length === 0) {
        targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER &&
              structure.energy < structure.energyCapacity;
          }
        });
      }

      if (targets.length) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
      }

      // controller
      // no work body part
      /*if (creep.upgradeController(creep.room.controller!!) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller!!, { reusePath: 2, visualizePathStyle: { stroke: '#66ccff' } });
      }*/
    }
  }
};
