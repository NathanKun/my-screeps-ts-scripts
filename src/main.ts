import { Builder } from "roles/Builder";
import { Harvester } from "roles/Harvester";
import { RoadMaintainer } from "roles/RoadMaintainer";
import { Upgrader } from "roles/Upgrader";
import { SpawnHelper } from "SpawnHelper";
import { ErrorMapper } from "utils/ErrorMapper";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }


  // spawn creeps
  SpawnHelper.spawn({ 'spawn': Game.spawns['Spawn1'], 'harvester': 5, 'builder': -1, 'upgrader': 3, 'roadMaintainer': 2 });

  // creeps work
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role === 'harvester') {
      Harvester.run(creep);
    }
    if (creep.memory.role === 'builder') {
      // Builder.run(creep);
      Upgrader.run(creep);
    }
    if (creep.memory.role === 'upgrader') {
      Upgrader.run(creep);
    }
    if (creep.memory.role === 'roadMaintainer') {
      RoadMaintainer.run(creep);
    }
  }
});
