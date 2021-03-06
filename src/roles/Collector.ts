import { BaseCreep } from "./BaseCreep";

export class Collector extends BaseCreep {
  private static STATUS_IDLE = "idle";
  private static STATUS_COLLECTING_RESOURCE = "collectingResource";
  private static STATUS_COLLECTING_TOMBSTONE = "collectingTombstone";
  private static STATUS_COLLECTING_WITHDRAWABLE = "collectingWithdrawable";
  private static STATUS_TRANSFERING = "transfering";
  private static STATUS_TRANSFERING_POWER = "transferingPower";
  private static STATUS_WITHDRAWING = "withdrawing";

  private droppedResources: Resource[] = [];
  private tombstones: Tombstone[] = [];
  private withdrawableTarget: StructureLink | StructureContainer | StructureTerminal | null = null;

  constructor(creep: Creep) {
    super(creep);
  }

  protected run() {
    if (this.room.name !== this.memory.room) {
      this.moveTo(new RoomPosition(20, 20, this.memory.room));
      return;
    }

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
        // spawns, extensions, and power spawn
        const targets = [...this.findNotFullExtensions(), ...this.findNotFullSpawns(), ...this.findNotFullPowerSpawn()].sort((s1, s2) =>
          this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));

        if (targets.length) {
          if (this.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }
      } else if (this.memory.collectorStatus === Collector.STATUS_WITHDRAWING) {
        const storages = this.findStorage();
        if (storages.length && this.withdraw(storages[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.moveTo(storages[0], { visualizePathStyle: { stroke: '#66ccff' } });
        }
      }
    } else {
      if (this.carry.power && this.carry.power > 0) {
        this.memory.collectorStatus = Collector.STATUS_TRANSFERING_POWER;
      } else if (this.memory.collectorStatus === Collector.STATUS_WITHDRAWING) {
        this.memory.collectorStatus = Collector.STATUS_IDLE;
      } else if (!this.memory.collectorStatus) {
        this.memory.collectorStatus = Collector.STATUS_IDLE;
      } else if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING && this.carry.energy === 0) {
        this.memory.collectorStatus = Collector.STATUS_IDLE;
      } else if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING_POWER && !this.carry.power) {
        this.memory.collectorStatus = Collector.STATUS_IDLE;
      } else if (this.carry.energy === this.carryCapacity) {
        this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
      }

      // Idle
      if (this.memory.collectorStatus === Collector.STATUS_IDLE) {
        if (this.carry.energy) {
          this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
        } else {
          Collector.findCollectable(this);
        }
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
        const withdrawableTarget = Game.getObjectById(this.memory.collectorTarget) as (StructureContainer | StructureLink | StructureTerminal | null);
        if (withdrawableTarget === null) {
          this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
          return;
        }
        if (withdrawableTarget.structureType === STRUCTURE_CONTAINER) {
          const resourceType = (withdrawableTarget as StructureContainer).store.energy > 0 ? RESOURCE_ENERGY : RESOURCE_POWER;
          if (this.withdraw(withdrawableTarget, resourceType) === ERR_NOT_IN_RANGE) {
            this.moveTo(withdrawableTarget, { reusePath: 0, visualizePathStyle: { stroke: '#66ccff' } });
          }
        } else {
          const res = this.withdraw(withdrawableTarget, RESOURCE_ENERGY);
          if (res === ERR_NOT_IN_RANGE) {
            this.moveTo(withdrawableTarget, { reusePath: 0, visualizePathStyle: { stroke: '#66ccff' } });
          } else if (res === ERR_NOT_ENOUGH_RESOURCES) {
            this.memory.collectorStatus = Collector.STATUS_TRANSFERING;
            return;
          }
        }
      }

      // Transfering
      else if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING) {
        // if no more collectable, change role to maintainer
        if (this.room.memory.energyPercentage < 0.5) {
          this.droppedResources = this.findDroppedResources();
          this.tombstones = this.findTombstones();
          this.withdrawableTarget = this.findWithdrawale();
          if (!(this.droppedResources.length || this.tombstones.length || this.withdrawableTarget)) {
            this.memory.role = 'maintainer';
            return;
          }
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
          targets = this.findNotFullStorage();
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
      else if (this.memory.collectorStatus === Collector.STATUS_TRANSFERING_POWER) {
        const powerSpawn = this.room.memory.powerSpawn;
        let target;
        if (powerSpawn && powerSpawn.power === 0) {
          target = powerSpawn;
        } else {
          const containers = this.findContainers().filter(
            c => {
              let total = c.store.energy;
              if (c.store.power) {
                total += c.store.power;
              }
              if (c.store.ops) {
                total += c.store.ops;
              }
              return total < c.storeCapacity;
            });
          target = containers[0];
        }

        if (target) {
          if (this.transfer(target, RESOURCE_POWER) === ERR_NOT_IN_RANGE) {
            this.moveTo(target, { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
        } else {
          console.log("Collector has power but no where to transfer. room = " + this.room.name);
        }
      }
    }
  }

  // call by Collector and Maintainer
  public static findCollectable(creep: Collector) {
    creep.memory.role = 'collector';
    creep.droppedResources = creep.findDroppedResources();
    creep.tombstones = creep.findTombstones();
    creep.withdrawableTarget = creep.findWithdrawale();

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
      creep.memory.collectorTarget = creep.withdrawableTarget.id;
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
      filter: r => (r.resourceType === RESOURCE_ENERGY || r.resourceType === RESOURCE_POWER) && r.amount > 30
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
        const containers = targets.containers
          .map(id => Game.getObjectById(id) as (StructureContainer | null))
          .filter(
            s =>
              s !== null &&
              (s.store.energy > 0 ||
                (s.store.power && s.store.power > 0 && s.room.memory.powerSpawn && s.room.memory.powerSpawn.energy > 0 && s.room.memory.powerSpawn.power === 0)
              ) // container has energy, or, container has power and power spwan in room of container (has energy and has no power)
          );
        /*
         * IMPORTANT: this look only StructureContainer.store.power and .energy
         * But not other resources.
         */
        if (containers.length) {
          const target = containers[0];
          if (target != null && ((target as StructureContainer).store.power !== 0) || (target as StructureContainer).store.energy !== 0) {
            return target as StructureContainer;
          }
        }
      }
      // links
      if (targets.links && targets.links.length) {
        const links = targets.links
          .map(l => Game.getObjectById(l) as (StructureLink | null))
          .filter(l => l !== null && (l.energy / l.energyCapacity) >= 0.3) as StructureLink[];
        if (links.length) {
          return links[0];
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
