import { ErrorMapper } from "utils/ErrorMapper";

export class PowerBankAction {
  public static do(bank: StructurePowerBank) {
    if (bank) {
      try {
        PowerBankAction.internalDo(bank);
      } catch (e) {
        const outText = ErrorMapper.sourceMappedStackTrace(e);
        Game.notify('Game.time = ' + Game.time + '\n' + 'Error in TowerTask ' + bank.id +
          '\n' + e + '\n' + outText);
      }
    }
  }

  private static internalDo(bank: StructurePowerBank) {

  }
}
