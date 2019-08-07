import { MyPowerCreep } from "roles/PowerCreep";

export class PowerCreepTask {
  private static regenSources = ["5bbcac639099fc012e63560e", "5bbcac639099fc012e63560f"];

  public static do(): void {
    const powerSpawn1 = Game.rooms['W9S7'].memory.powerSpawn;
    if (!powerSpawn1) {
      return;
    }

    const power1 = new MyPowerCreep('power_1');


    // spawn
    if (!power1.room) {
      power1.spawn(powerSpawn1);
      return;
    }

    // renew self
    if (power1.ticksToLive && power1.ticksToLive < 500) {
      if (power1.renew(powerSpawn1) === ERR_NOT_IN_RANGE) {
        power1.moveTo(powerSpawn1);
      }
      return;
    }

    let carryAmount = power1.carry.energy;
    carryAmount += power1.carry.ops ? power1.carry.ops : 0;
    carryAmount += power1.carry.power ? power1.carry.power : 0;

    // gen ops
    if (carryAmount + 10 <= power1.carryCapacity && (!power1.carry.ops || power1.carry.ops < 100)) {
      if (power1.canUsePower(PWR_GENERATE_OPS)) {
        power1.usePower(PWR_GENERATE_OPS);
        return;
      }
    }

    // transfer ops to container
    const opsContainer = Game.getObjectById('5d2ce61998788e62449d6113') as StructureContainer;
    if (opsContainer.store.ops && opsContainer.store.ops < opsContainer.storeCapacity) {
      if (power1.carry.ops && power1.carry.ops > 50) {
        if (power1.transfer(opsContainer, RESOURCE_OPS) === ERR_NOT_IN_RANGE) {
          power1.moveTo(opsContainer);
        }
        return;
      }
    }

    // gen source
    if (power1.canUsePower(PWR_REGEN_SOURCE)) {
      for (const id of PowerCreepTask.regenSources) {
        if (power1.canRegenSource(id)) {
          power1.regenSources(id);
          return;
        }
      }
    }

    // fill power to power spawn
    const containers = power1.room.memory.containers;
    if (!containers || !containers.length) {
      return;
    }

    if (powerSpawn1.power < 50) {
      // withdraw power from containers
      if (!power1.carry.power && carryAmount < power1.carryCapacity) {
        const targets = containers.filter(c => c.store.power);
        if (targets.length) {
          const container = targets[0];
          const withdrawRes = power1.withdraw(container, RESOURCE_POWER, 100);
          if (withdrawRes === ERR_NOT_IN_RANGE) {
            power1.moveTo(container);
          } else if (withdrawRes === ERR_NOT_ENOUGH_RESOURCES) {
            power1.withdraw(container, RESOURCE_POWER)
          } else if (withdrawRes === ERR_FULL) {
            power1.drop(RESOURCE_ENERGY, 110);
          }
        }
        return;
      }

      // transfer power to power spawn
      if (power1.carry.power) {
        if (power1.transfer(powerSpawn1, RESOURCE_POWER) === ERR_NOT_IN_RANGE) {
          power1.moveTo(powerSpawn1);
        }
        return;
      }
    }

    // fill energy to power spawn
    if (powerSpawn1.energy < 1500) {
      // withdraw energy from containers / storage
      if (!power1.carry.energy) {
        let target;
        const targets = containers.filter(c => c.store.energy);
        if (targets.length) {
          target = targets[0];
        }
        if (!target) {
          target = power1.room.storage;
        }
        if (target && target.store.energy) {
          const res = power1.withdraw(target, RESOURCE_ENERGY, power1.carryCapacity - carryAmount - 100);
          if (res === ERR_NOT_IN_RANGE) {
            power1.moveTo(target);
          } else if (res === ERR_NOT_ENOUGH_ENERGY) {
            power1.withdraw(target, RESOURCE_ENERGY);
          }
        }
        return;
      }

      // transfer energy to power spawn
      if (power1.carry.energy) {
        if (power1.transfer(powerSpawn1, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          power1.moveTo(powerSpawn1);
        }
        return;
      }
    }
  }
}
