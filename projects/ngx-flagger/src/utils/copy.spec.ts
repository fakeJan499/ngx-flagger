import {copy} from "./copy";

describe(`copy`, () => {
  it(`should create copy of an object`, () => {
    const toCopy = {
      a: {
        b: false,
        c: 'test',
        d: 123,
        f: [1, 'value']
      }
    };

    const copied = copy(toCopy);

    expect(copied).toEqual(toCopy);
    expect(copied).not.toBe(toCopy);
  });

  it(`should return null if null`, () => {
    const copied = copy(null);

    expect(copied).toBeNull();
  });
});
