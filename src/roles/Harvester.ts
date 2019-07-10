import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Harvester extends BaseCreep {
  public hasHostile: boolean = false;
  public roomLinks: RoomLinks[];

  constructor(creep: Creep, hasHostile: boolean, roomLinks: RoomLinks[]) {
    super(creep);
    this.hasHostile = hasHostile;
    this.roomLinks = roomLinks;
  }

  protected run() {
    if (this.memory.transfering && this.carry.energy === 0) {
      this.memory.transfering = false;
      this.memory.transferTarget = undefined;
      this.say('🔄 harvest');
    }
    if (!this.memory.transfering && this.carry.energy === this.carryCapacity) {
      this.memory.transfering = true;
      FindSourceUtil.clear(this);
      this.say('🚧 transfer');
    }

    // attack near by hostile creep
    if (this.memory.canAttack) {
      const hostileCreeps = this.pos.findInRange(FIND_HOSTILE_CREEPS, 5);

      if (hostileCreeps.length) {
        if (this.attack(hostileCreeps[0]) === ERR_NOT_IN_RANGE) {
          this.moveTo(hostileCreeps[0]);
        }
        return;
      }
    }

    // transfer
    if (this.memory.transfering) {
      // if harvested in another room
      if (this.memory.transferRoom && this.room.name !== this.memory.transferRoom) {
        const flag = this.room.find(FIND_FLAGS, {
          filter: f => f.name.startsWith('harvesterExt_')
        });

        if (flag.length) {
          this.moveTo(flag[0]);
        } else {
          const exitDir = this.room.findExitTo(this.memory.transferRoom) as (FIND_EXIT_TOP | FIND_EXIT_RIGHT | FIND_EXIT_BOTTOM | FIND_EXIT_LEFT);
          const exit = this.pos.findClosestByRange(exitDir);
          this.moveTo(exit!!, { reusePath: 15, visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
      }

      // has hostile: charge towers
      if (this.hasHostile) {
        if (this.memory.transferTarget === undefined) {
          const towers = this.findTowers(1000).sort((t1, t2) => t1.energy - t2.energy);
          if (towers.length) {
            this.memory.transferTarget = towers[0].id;
          }
        }
        const tower = Game.getObjectById(this.memory.transferTarget) as (StructureTower | null);
        if (tower && this.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.moveTo(tower, { reusePath: 3, visualizePathStyle: { stroke: '#ff0000' } });
        }
      }
      // no hostile
      else {
        let target: StructureSpawn | StructureExtension | StructureTower | StructureLink | StructureStorage | StructureContainer | Structure | null | undefined;

        // if has cache
        if (this.memory.transferTarget && this.memory.cacheTime) {
          // invalidate old cache > 3 tick
          if (Game.time - this.memory.cacheTime > 3) {
            this.memory.transferTarget = undefined;
            this.memory.cacheTime = undefined;
          } else {
            target = Game.getObjectById(this.memory.transferTarget);
          }
        }

        // no cache or cache invalidated
        if (!target) {
          let targets: AnyStructure[] = [];

          // harvester ext link which close to the exit
          if (this.memory.role === "harvesterExt") {
            const mem = this.memory.harvesterExtPrimaryTransferTargets;
            if (mem) {
              if (mem.containers && mem.containers.length) {
                targets = mem.containers.map(id => Game.getObjectById(id) as (null | StructureContainer))
                  .filter(s => s !== null && (s.storeCapacity - s.store.energy) > this.carry.energy && this.pos.getRangeTo(s) < 10) as StructureContainer[];
              }
              if (targets.length === 0 && mem.links && mem.links.length) {
                targets = mem.links.map(id => Game.getObjectById(id) as (null | StructureLink))
                  .filter(s => s !== null && (s.energyCapacity - s.energy) > this.carry.energy && this.pos.getRangeTo(s) < 10) as StructureLink[];
              }
            }
          }

          // find extensions
          if (targets.length === 0) {
            targets = this.findExtensions();
          }

          // find spawns
          if (targets.length === 0) {
            targets = this.findSpawns();
          }

          // find low energy towers
          if (targets.length === 0) {
            targets = this.findTowers(500);
          }

          // find links
          if (targets.length === 0) {
            targets = this.findCityCenterSenderLinks();
          }

          // find high energy towers
          if (targets.length === 0) {
            targets = this.findTowers(850);
          }

          // find power spawn
          if (targets.length === 0) {
            targets = this.findPowerSpawn();
          }

          // find storages
          if (targets.length === 0) {
            targets = this.findStorage();
          }

          // find terminal
          if (targets.length === 0) {
            targets = this.findTerminal();
          }

          // find nuker
          if (targets.length === 0) {
            targets = this.findNuker();
          }

          if (targets.length > 0) {
            target = targets[0];
            // cache
            this.memory.transferTarget = target.id;
            this.memory.cacheTime = Game.time;
          }
        }

        if (target) {
          const res = this.transfer(target, RESOURCE_ENERGY);
          if (res === ERR_NOT_IN_RANGE) {
            this.moveTo(target, { reusePath: 3, visualizePathStyle: { stroke: '#ffaa00' } });
          } else if (res === OK) {
            this.memory.transferTarget = undefined;
            this.memory.cacheTime = undefined;
          }
        }
        // nothing to do, upgrade room controller
        else {
          if (this.upgradeController(this.room.controller!!) === ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller!!, { maxRooms: 1, visualizePathStyle: { stroke: '#66ccff' } });
          }
        }
      }
    }
    // harvest
    else {
      // if harvest in another room
      if (this.memory.harvestRoom && this.room.name !== this.memory.harvestRoom) {
        const flag = this.room.find(FIND_FLAGS, {
          filter: f => f.name.startsWith('harvesterExt_')
        });

        if (flag.length) {
          this.moveTo(flag[0]);
        } else {
          const exitDir = this.room.findExitTo(this.memory.harvestRoom) as (FIND_EXIT_TOP | FIND_EXIT_RIGHT | FIND_EXIT_BOTTOM | FIND_EXIT_LEFT);
          const exit = this.pos.findClosestByRange(exitDir);
          this.moveTo(exit!!, { reusePath: 15, visualizePathStyle: { stroke: '#ffffff' } });
        }
        return;
      }

      const source = FindSourceUtil.findSource(this);
      if (this.harvest(source) === ERR_NOT_IN_RANGE) {
        this.moveTo(source, { reusePath: 3, visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }

  protected findCityCenterSenderLinks(): StructureLink[] {
    const res: StructureLink[] = []

    for (const roomLinks of this.roomLinks) {
      if (roomLinks.room.name === this.room.name) {
        for (const links of roomLinks.links) {
          if (links.sender && links.senderType && links.senderType === "cityCenter" && (links.sender.energy / links.sender.energyCapacity) < 0.8) {
            res.push(links.sender);
          }
        }
      }
    }

    return res.sort((l1, l2) => l1.cooldown - l2.cooldown);
  }
};
