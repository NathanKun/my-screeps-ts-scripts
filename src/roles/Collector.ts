import { BaseCreep } from "./BaseCreep";

export class Collector extends BaseCreep {
  private static IDLE_X = 14;
  private static IDLE_Y = 13;

  private static STATUS_IDLE = "idle";
  private static STATUS_COLLECTING_RESOURCE = "collectingResource";
  private static STATUS_COLLECTING_TOMBSTONE = "collectingTombstone";
  private static STATUS_TRANSFERING = "transfering";
  private static STATUS_WITHDRAWING = "withdrawing";

  public withdrawStorageMode: boolean = false;

  protected run() {
    if (this.withdrawStorageMode) {
      this.say('withdraw');
      if (this.carry.energy === this.carryCapacity) {
        this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
      } else if (this.carry.energy === 0) {
        this.memory.collectorStatus = Collector.STATUS_WITHDRAWING;
      }

      if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING) {
        const targets = this.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION ||
              structure.structureType === STRUCTURE_SPAWN) &&
              structure.energy < structure.energyCapacity;
          }
        }).sort((s1, s2) =>
          this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));

        if (targets.length) {
          if (this.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }
      } else if (this.memory.collectorStatus === Collector.STATUS_WITHDRAWING) {
        const storages = this.room.find(FIND_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_STORAGE
        });
        if (storages.length && this.withdraw(storages[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.moveTo(storages[0], { visualizePathStyle: { stroke: '#66ccff' } });
        }
      }
    } else {
      if (this.memory.collectorStatus === Collector.STATUS_WITHDRAWING) {
        this.memory.collectorStatus = Collector.STATUS_IDLE
      } else if (!this.memory.collectorStatus) {
        this.memory.collectorStatus = Collector.STATUS_IDLE;
      } else if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING && this.carry.energy === 0) {
        this.memory.collectorStatus = Collector.STATUS_IDLE;
      } else if (this.carry.energy === this.carryCapacity) {
        this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
      }

      // Idle
      if (this.memory.collectorStatus === Collector.STATUS_IDLE) {
        Collector.findCollectable(this);
      }

      // Collecting Resource
      else if (this.memory.collectorStatus === Collector.STATUS_COLLECTING_RESOURCE) {
        this.say('🏃💧');

        const resource = Game.getObjectById(this.memory.collectorTarget) as (Resource | null);
        if (resource === undefined || resource === null || resource.amount === 0) {
          this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
          return;
        }
        if (this.pickup(resource!!) === ERR_NOT_IN_RANGE) {
          this.moveTo(resource!!, { reusePath: 0, visualizePathStyle: { stroke: '#66ccff' } });
        }
      }

      // Collecting Tombstone
      else if (this.memory.collectorStatus === Collector.STATUS_COLLECTING_TOMBSTONE) {
        this.say('🏃💀');

        const tombstone = Game.getObjectById(this.memory.collectorTarget) as Tombstone;
        if (tombstone === undefined || tombstone === null || tombstone.store.energy === 0) {
          this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
          return;
        }
        if (this.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.moveTo(tombstone, { reusePath: 0, visualizePathStyle: { stroke: '#66ccff' } });
        }
      }

      // Transfering
      else if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING) {
        // if no more collectable, change role to maintainer
        if (!Collector.hasCollectable(this)) {
          this.memory.role = 'maintainer';
          return;
        }

        this.say('🚚');
        this.memory.collectorTarget = undefined;

        // Extensions
        let targets = this.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType === STRUCTURE_EXTENSION &&
              structure.energy < structure.energyCapacity;
          }
        }).sort((s1, s2) =>
          this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));

        // spwan
        if (targets.length === 0) {
          targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return structure.structureType === STRUCTURE_SPAWN &&
                structure.energy < structure.energyCapacity;
            }
          }).sort((s1, s2) =>
            this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));
        }

        // tower
        if (targets.length === 0) {
          targets = (this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return structure.structureType === STRUCTURE_TOWER &&
                structure.energy < structure.energyCapacity;
            }
          }) as StructureTower[]).sort((s1, s2) => s1.energy - s2.energy);
        }

        // storage
        if (targets.length === 0) {
          targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return structure.structureType === STRUCTURE_STORAGE &&
                structure.store.energy < structure.storeCapacity;
            }
          });
        }

        if (targets.length) {
          if (this.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }
      }
    }
  }

  // call by Collector and Maintainer
  public static findCollectable(creep: BaseCreep) {
    creep.memory.role = 'collector';

    // find resource
    const droppedResources = Collector.findDroppedResources(creep);

    if (droppedResources.length) {
      creep.memory.collectorTarget = droppedResources[0].id;
      creep.memory.collectorStatus = Collector.STATUS_COLLECTING_RESOURCE;
      return;
    }

    // find tombstone
    const tombstones = Collector.findTombstones(creep);

    if (tombstones.length) {
      creep.memory.collectorTarget = tombstones[0].id;
      creep.memory.collectorStatus = Collector.STATUS_COLLECTING_TOMBSTONE;
      return;
    }

    /*
    // move to idle location
    if (creep.pos.x !== Collector.IDLE_X || creep.pos.y !== Collector.IDLE_Y) {
      creep.moveTo(Collector.IDLE_X, Collector.IDLE_Y);
    }*/
    // idle, work as maintainer
    creep.memory.role = 'maintainer';
  }

  public static hasCollectable(creep: BaseCreep) {
    return Collector.findDroppedResources(creep).length || Collector.findTombstones(creep).length;
  }

  private static findDroppedResources(creep: BaseCreep) {
    return creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_ENERGY
    }).sort((r1, r2) => r2.amount - r1.amount);
  }

  private static findTombstones(creep: BaseCreep) {
    return creep.room.find(FIND_TOMBSTONES, {
      filter: t => t.store.energy > 0
    }).sort((t1, t2) => t1.ticksToDecay - t2.ticksToDecay);
  }
};
