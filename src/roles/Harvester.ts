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
        const exitDir = this.room.findExitTo(this.memory.transferRoom) as (FIND_EXIT_TOP | FIND_EXIT_RIGHT | FIND_EXIT_BOTTOM | FIND_EXIT_LEFT);
        const exit = this.pos.findClosestByRange(exitDir);
        this.moveTo(exit!!, { reusePath: 15, visualizePathStyle: { stroke: '#ffaa00' } });
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
          let targets: AnyStructure[];

          // prior find extensions
          targets = this.findExtensions();

          // prior find spawns
          if (targets.length === 0) {
            targets = this.findSpawns();
          }

          // find low energy towers
          if (targets.length === 0) {
            targets = this.findTowers(500);
          }

          // find links
          if (targets.length === 0) {
            targets = this.findLinks();
          }

          // find prefer transfer structure
          if (targets.length === 0) {
            if (this.memory.preferTransferStructure === 'tower') {
              targets = this.findTowers(850);
            } else if (this.memory.preferTransferStructure === 'storage') {
              targets = this.findStorage();
            }
          }

          // find high energy towers
          if (targets.length === 0) {
            targets = this.findTowers(850);
          }

          // find storages
          if (targets.length === 0) {
            targets = this.findStorage();
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
        const exitDir = this.room.findExitTo(this.memory.harvestRoom) as (FIND_EXIT_TOP | FIND_EXIT_RIGHT | FIND_EXIT_BOTTOM | FIND_EXIT_LEFT);
        const exit = this.pos.findClosestByRange(exitDir);
        this.moveTo(exit!!, { reusePath: 15, visualizePathStyle: { stroke: '#ffffff' } });
        return;
      }

      const source = FindSourceUtil.findSource(this);
      if (this.harvest(source) === ERR_NOT_IN_RANGE) {
        this.moveTo(source, { reusePath: 3, visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }

  private findExtensions() {
    return this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_EXTENSION &&
          structure.energy < structure.energyCapacity;
      }
    }).sort((s1, s2) =>
      this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));
  }

  private findSpawns() {
    return this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_SPAWN &&
          structure.energy < structure.energyCapacity;
      }
    }).sort((s1, s2) =>
      this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));
  }

  private findStorage() {
    return this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_STORAGE &&
          structure.store.energy < structure.storeCapacity;
      }
    });
  }

  private findTowers(maxEnergy: number): StructureTower[] {
    return (this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_TOWER &&
          structure.energy <= maxEnergy;
      }
    }) as StructureTower[]).sort((t1, t2) => t1.energy - t2.energy);
  }

  private findLinks(): StructureLink[] {
    const res: StructureLink[] = []

    for (const roomLinks of this.roomLinks) {
      if (roomLinks.room.name === this.room.name) {
        for (const links of roomLinks.links) {
          if (links.sender && links.sender.energy < links.sender.energyCapacity) {
            res.push(links.sender);
          }
        }
      }
    }

    return res.sort((l1, l2) => l1.cooldown - l2.cooldown);
  }
};
