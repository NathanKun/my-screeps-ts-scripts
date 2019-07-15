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
  private withdrawableTarget: StructureLink | StructureContainer | StructureTerminal | null;

  constructor(creep: Creep) {
    super(creep);
    this.droppedResources = this.findDroppedResources();
    this.tombstones = this.findTombstones();
    this.withdrawableTarget = this.findWithdrawale();
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

        // find low energy towers
        if (targets.length === 0) {
          targets = this.findTowers(500);
        }

        // find high energy towers
        if (targets.length === 0) {
          targets = this.findTowers(850);
        }

        // find power spawn
        if (targets.length === 0) {
          targets = this.findNotFullPowerSpawn();
        }

        // find storages
        if (targets.length === 0) {
          targets = this.findStorage();
        }

        // find terminal
        if (targets.length === 0) {
          targets = this.findNotFullTerminal();
        }

        // find nuker
        if (targets.length === 0) {
          targets = this.findNotFullNuker();
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

  private findDroppedResources(): Resource[] {
    return this.room.find(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 30
    }).sort((r1, r2) => r2.amount - r1.amount);
  }

  private findTombstones(): Tombstone[] {
    return this.room.find(FIND_TOMBSTONES, {
      filter: t => t.store.energy > 0
    }).sort((t1, t2) => t1.ticksToDecay - t2.ticksToDecay);
  }

  private findWithdrawale(): StructureLink | StructureContainer | StructureTerminal | null {
    const targets = this.memory.collectorWithdrawTargets;
    if (targets) {
      // containers
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
      // links
      if (targets.links && targets.links.length) {
        const target = Game.getObjectById(targets.links[0]);
        if (target != null && ((target as StructureLink).energy / (target as StructureLink).energyCapacity >= 0.3)) {
          return target as StructureLink;
        }
      }
      // terminal
      if (targets.terminal) {
        const target = Game.getObjectById(targets.terminal);
        if (target != null && ((target as StructureTerminal).store.energy > 0)) {
          return target as StructureTerminal;
        }
      }
    }

    return null;
  }
};
