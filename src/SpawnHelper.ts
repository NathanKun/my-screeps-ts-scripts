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
  public static spawn(spawnParam: SpawnParam) {

    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
    const roadReparers = _.filter(Game.creeps, (creep) => creep.memory.role === 'roadReparer');

    console.log('Harvesters: ' + harvesters.length);
    console.log('Builders: ' + builders.length);
    console.log('Upgraders: ' + upgraders.length);
    console.log('RoadRepairers: ' + roadReparers.length);

    if (Game.spawns['Spawn1'].spawning) {
      const spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning!!.name];
      Game.spawns['Spawn1'].room.visual.text(
        '🛠️' + spawningCreep.memory.role,
        Game.spawns['Spawn1'].pos.x + 1,
        Game.spawns['Spawn1'].pos.y,
        { align: 'left', opacity: 0.8 });
    }

    /* harvester */
    if (harvesters.length < spawnParam.harvester) {
      Game.spawns['Spawn1'].spawnCreep(
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        'Harvester' + Game.time,
        { memory: { role: 'harvester' } } as SpawnOptions);
      return;
    }

    /* builder */
    if (builders.length < spawnParam.builder) {
      Game.spawns['Spawn1'].spawnCreep(
        [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        'Builder' + Game.time,
        { memory: { role: 'builder' } } as SpawnOptions);
      return;
    }

    /* upgrader */
    if (upgraders.length < spawnParam.upgrader) {
      Game.spawns['Spawn1'].spawnCreep(
        [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        'Upgrader' + Game.time,
        { memory: { role: 'upgrader' } } as SpawnOptions);
      return;
    }

    /* road reparer */
    if (roadReparers.length < spawnParam.roadReparer) {
      Game.spawns['Spawn1'].spawnCreep(
        [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
        'RoadRepairer' + Game.time,
        { memory: { role: 'roadReparer' } } as SpawnOptions);
      return;
    }
  }
}
