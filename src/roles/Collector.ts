import { BaseCreep } from "./BaseCreep";

export class Collector extends BaseCreep {
  private static IDLE_X = 14;
  private static IDLE_Y = 13;

  private static STATUS_IDLE = "idle";
  private static STATUS_COLLECTING_RESOURCE = "collectingResource";
  private static STATUS_COLLECTING_TOMBSTONE = "collectingTombstone";
  private static STATUS_TRANSFERING = "transfering";

  public withdrawStorageMode: boolean = false;
  protected run() {
    if (this.withdrawStorageMode) {
      if (this.creep.carry.energy === this.creep.carryCapacity) {
        this.creep.memory.collectorStatus = 'transfering';
      } else if (this.creep.carry.energy === 0) {
        this.creep.memory.collectorStatus = 'withdrawing';
      }

      if (this.creep.memory.collectorStatus === 'transfering') {
        const targets = this.creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION ||
              structure.structureType === STRUCTURE_SPAWN) &&
              structure.energy < structure.energyCapacity;
          }
        }).sort((s1, s2) =>
          this.creep.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.creep.pos.getRangeTo(s2.pos.x, s2.pos.y));

        if (targets.length) {
          if (this.creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }
      } else if (this.creep.memory.collectorStatus === 'withdrawing') {
        const storage = Game.getObjectById('5ced749d7f5e00234025f1c3') as StructureStorage;
        if (this.creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(storage);
        }
      }
    } else {
      if (!this.creep.memory.collectorStatus) {
        this.creep.memory.collectorStatus = Collector.STATUS_IDLE;
      } else if (this.creep.memory.collectorStatus === Collector.STATUS_TRANSFERING && this.creep.carry.energy === 0) {
        this.creep.memory.collectorStatus = Collector.STATUS_IDLE;
      } else if (this.creep.carry.energy === this.creep.carryCapacity) {
        this.creep.memory.collectorStatus = Collector.STATUS_TRANSFERING;
      }

      // Idle
      if (this.creep.memory.collectorStatus === Collector.STATUS_IDLE) {
        // find resource
        const droppedResources = this.creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: r => r.resourceType === RESOURCE_ENERGY
        }).sort((r1, r2) => r2.amount - r1.amount);

        if (droppedResources.length) {
          this.creep.memory.collectorTarget = droppedResources[0].id;
          this.creep.memory.collectorStatus = Collector.STATUS_COLLECTING_RESOURCE;
          return;
        }

        // find tombstone
        const tombstones = this.creep.room.find(FIND_TOMBSTONES, {
          filter: t => t.store.energy > 0
        }).sort((t1, t2) => t1.ticksToDecay - t2.ticksToDecay);

        if (tombstones.length) {
          this.creep.memory.collectorTarget = tombstones[0].id;
          this.creep.memory.collectorStatus = Collector.STATUS_COLLECTING_TOMBSTONE;
          return;
        }

        // move to idle location
        if (this.creep.pos.x !== Collector.IDLE_X || this.creep.pos.y !== Collector.IDLE_Y) {
          this.creep.moveTo(Collector.IDLE_X, Collector.IDLE_Y);
        }
      }

      // Collecting Resource
      else if (this.creep.memory.collectorStatus === Collector.STATUS_COLLECTING_RESOURCE) {
        const resource = Game.getObjectById(this.creep.memory.collectorTarget) as (Resource | null);
        if (resource === undefined || resource === null || resource.amount === 0) {
          this.creep.memory.collectorStatus = Collector.STATUS_TRANSFERING;
          return;
        }
        if (this.creep.pickup(resource!!) === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(resource!!, { reusePath: 0 });
        }
      }

      // Collecting Tombstone
      else if (this.creep.memory.collectorStatus === Collector.STATUS_COLLECTING_TOMBSTONE) {
        const tombstone = Game.getObjectById(this.creep.memory.collectorTarget) as Tombstone;
        if (tombstone === undefined || tombstone === null || tombstone.store.energy === 0) {
          this.creep.memory.collectorStatus = Collector.STATUS_TRANSFERING;
          return;
        }
        if (this.creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(tombstone, { reusePath: 0 });
        }
      }

      // Transfering
      else if (this.creep.memory.collectorStatus === Collector.STATUS_TRANSFERING) {
        this.creep.memory.collectorTarget = undefined;

        // spwan and Extensions
        let targets = this.creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION ||
              structure.structureType === STRUCTURE_SPAWN) &&
              structure.energy < structure.energyCapacity;
          }
        }).sort((s1, s2) =>
          this.creep.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.creep.pos.getRangeTo(s2.pos.x, s2.pos.y));

        // tower
        if (targets.length === 0) {
          targets = (this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return structure.structureType === STRUCTURE_TOWER &&
                structure.energy < structure.energyCapacity;
            }
          }) as StructureTower[]).sort((s1, s2) => s1.energy - s2.energy);
        }

        // storage
        if (targets.length === 0) {
          targets = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return structure.structureType === STRUCTURE_STORAGE &&
                structure.store.energy < structure.storeCapacity;
            }
          });
        }

        if (targets.length) {
          if (this.creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }
      }
    }



  }
};
