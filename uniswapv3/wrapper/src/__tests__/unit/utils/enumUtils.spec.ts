import { _getFeeAmount, getFeeAmountEnum, _getPermitV, _feeAmountToTickSpacing } from "../../../utils/enumUtils";
import { FeeAmount, PermitV } from "../../../query/w3";

describe('Enum utils', () => {

  it('getFeeAmount', () => {
    expect(_getFeeAmount(FeeAmount.LOWEST)).toStrictEqual(100);
    expect(_getFeeAmount(FeeAmount.LOW)).toStrictEqual(500);
    expect(_getFeeAmount(FeeAmount.MEDIUM)).toStrictEqual(3000);
    expect(_getFeeAmount(FeeAmount.HIGH)).toStrictEqual(10000);

    const error = (): void => { _getFeeAmount(7) };
    expect(error).toThrow();
  });

  it('getFeeAmountEnum', () => {
    expect(getFeeAmountEnum(100)).toStrictEqual(FeeAmount.LOWEST);
    expect(getFeeAmountEnum(500)).toStrictEqual(FeeAmount.LOW);
    expect(getFeeAmountEnum(3000)).toStrictEqual(FeeAmount.MEDIUM);
    expect(getFeeAmountEnum(10000)).toStrictEqual(FeeAmount.HIGH);
    const error = (): void => { getFeeAmountEnum(7) };
    expect(error).toThrow();
  });

  it('getTickSpacings', () => {
    expect(_feeAmountToTickSpacing(FeeAmount.LOWEST)).toStrictEqual(1);
    expect(_feeAmountToTickSpacing(FeeAmount.LOW)).toStrictEqual(10);
    expect(_feeAmountToTickSpacing(FeeAmount.MEDIUM)).toStrictEqual(60);
    expect(_feeAmountToTickSpacing(FeeAmount.HIGH)).toStrictEqual(200);

    const error = (): void => { _feeAmountToTickSpacing(7) };
    expect(error).toThrow();
  });

  it('getPermitV', () => {
    expect(_getPermitV(PermitV.v_0)).toStrictEqual(0);
    expect(_getPermitV(PermitV.v_1)).toStrictEqual(1);
    expect(_getPermitV(PermitV.v_27)).toStrictEqual(27);
    expect(_getPermitV(PermitV.v_28)).toStrictEqual(28);

    const error = (): void => { _getPermitV(7) };
    expect(error).toThrow();
  });
});