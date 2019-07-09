import { BaseCreep } from "./BaseCreep";

export class Collector extends BaseCreep {
  private static STATUS_IDLE = "idle";
  private static STATUS_COLLECTING_RESOURCE = "collectingResource";
  private static STATUS_COLLECTING_TOMBSTONE = "collectingTombstone";
  private static STATUS_COLLECTING_WITHDRAWABLE = "collectingWithdrawable";
  private static STATUS_TRANSFERING = "transfering";
  private static STATUS_WITHDRAWING = "withdrawing";

  private droppedResources: Resource[];
  private tombstones: Tombstone[];
  private withdrawableTarget: StructureLink | StructureContainer | null;

  constructor(creep: Creep) {
    super(creep);
    this.droppedResources = Collector.findDroppedResources(this);
    this.tombstones = Collector.findTombstones(this);
    this.withdrawableTarget = Collector.findWithdrawale(this);
  }

  protected run() {
    if (this.memory.withdrawStorageMode) {
      this.say('withdraw');
      if (this.carry.energy === this.carryCapacity) {
        this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
      } else if (this.carry.energy === 0) {
        this.memory.collectorStatus = Collector.STATUS_WITHDRAWING;
      } else {
        this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
      }

      if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING) {
        // spawns and extensions
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

      // Collecting withdrawable structure
      else if (this.memory.collectorStatus === Collector.STATUS_COLLECTING_WITHDRAWABLE) {
        this.say('🏃📦');

        if (this.withdrawableTarget === null) {
          this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
          return;
        }
        if (this.withdraw(this.withdrawableTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.moveTo(this.withdrawableTarget, { reusePath: 0, visualizePathStyle: { stroke: '#66ccff' } });
        }
      }

      // Transfering
      else if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING) {
        // if no more collectable, change role to maintainer
        if (!(this.droppedResources.length || this.tombstones.length || this.withdrawableTarget)) {
          this.memory.role = 'maintainer';
          return;
        }

        this.say('🚚');
        this.memory.collectorTarget = undefined;

        // Extensions or spawns
        let targets: AnyStructure[] = [...this.room.memory.notFullExtensions, ...this.room.memory.notFullSpawns]
          .sort((s1, s2) => this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));

        // tower
        if (targets.length === 0) {
          targets = this.room.memory.towers.filter(structure => {
            return structure.structureType === STRUCTURE_TOWER &&
              structure.energy < 850;
          }).sort((s1, s2) => s1.energy - s2.energy);
        }

        // storage
        if (targets.length === 0) {
          const storage = this.room.memory.storage;
          if (storage) {
            targets = [storage];
          }
        }

        // terminal
        if (targets.length === 0) {
          const terminal = this.room.memory.terminal;
          if (terminal) {
            targets = [terminal];
          }
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
  public static findCollectable(creep: Collector) {
    creep.memory.role = 'collector';

    // find resource
    if (creep.droppedResources.length) {
      creep.memory.collectorTarget = creep.droppedResources[0].id;
      creep.memory.collectorStatus = Collector.STATUS_COLLECTING_RESOURCE;
      return;
    }

    // find tombstone
    if (creep.tombstones.length) {
      creep.memory.collectorTarget = creep.tombstones[0].id;
      creep.memory.collectorStatus = Collector.STATUS_COLLECTING_TOMBSTONE;
      return;
    }

    if (creep.withdrawableTarget) {
      creep.memory.collectorStatus = Collector.STATUS_COLLECTING_WITHDRAWABLE;
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

  private static findDroppedResources(creep: BaseCreep): Resource[] {
    return creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 30
    }).sort((r1, r2) => r2.amount - r1.amount);
  }

  private static findTombstones(creep: BaseCreep): Tombstone[] {
    return creep.room.find(FIND_TOMBSTONES, {
      filter: t => t.store.energy > 0
    }).sort((t1, t2) => t1.ticksToDecay - t2.ticksToDecay);
  }

  private static findWithdrawale(creep: Collector): StructureLink | StructureContainer | null {
    const targets = creep.memory.collectorWithdrawTargets;
    if (targets) {
      if (targets.containers && targets.containers.length) {
        const target = Game.getObjectById(targets.containers[0]);
        /*
         * IMPORTANT: this look only StructureContainer.store.energy
         * But not other resources.
         */
        if (target != null && (target as StructureContainer).store.energy !== 0) {
          return target as StructureContainer;
        }
      }
      else if (targets.links && targets.links.length) {
        const target = Game.getObjectById(targets.links[0]);
        if (target != null && ((target as StructureLink).energy / (target as StructureLink).energyCapacity >= 0.3)) {
          return target as StructureLink;
        }
      }
    }

    return null;
  }
};
