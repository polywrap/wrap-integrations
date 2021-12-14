import { getFeeAmount, getFeeAmountEnum, getPermitV, getTickSpacings } from "../../../utils/enumUtils";
import { FeeAmount, PermitV } from "../../../query/w3";

describe('Enum utils', () => {

  it('getFeeAmount', () => {
    expect(getFeeAmount(FeeAmount.LOWEST)).toStrictEqual(100);
    expect(getFeeAmount(FeeAmount.LOW)).toStrictEqual(500);
    expect(getFeeAmount(FeeAmount.MEDIUM)).toStrictEqual(3000);
    expect(getFeeAmount(FeeAmount.HIGH)).toStrictEqual(10000);

    const error = (): void => { getFeeAmount(7) };
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
    expect(getTickSpacings(FeeAmount.LOWEST)).toStrictEqual(1);
    expect(getTickSpacings(FeeAmount.LOW)).toStrictEqual(10);
    expect(getTickSpacings(FeeAmount.MEDIUM)).toStrictEqual(60);
    expect(getTickSpacings(FeeAmount.HIGH)).toStrictEqual(200);

    const error = (): void => { getTickSpacings(7) };
    expect(error).toThrow();
  });

  it('getPermitV', () => {
    expect(getPermitV(PermitV.v_0)).toStrictEqual(0);
    expect(getPermitV(PermitV.v_1)).toStrictEqual(1);
    expect(getPermitV(PermitV.v_27)).toStrictEqual(27);
    expect(getPermitV(PermitV.v_28)).toStrictEqual(28);

    const error = (): void => { getPermitV(7) };
    expect(error).toThrow();
  });
});