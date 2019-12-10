import { IScriptSnapshot, TextChangeRange } from "typescript";

const text1 = "con";
const scriptSnapshot1: IScriptSnapshot = {
  getChangeRange: oldSnapshot => {
    return undefined;
  },
  getLength: () => text1.length,
  getText: (start, end) => {
    return text1.slice(start, end);
  }
};

const text2 = "cons";
const scriptSnapshot2: IScriptSnapshot = {
  getChangeRange: oldSnapshot => {
    const textChangeRange: TextChangeRange = {
      newLength: 1,
      span: {
        start: 3,
        length: 0
      }
    };
    return textChangeRange;
  },
  getLength: () => text2.length,
  getText: (start, end) => text2.slice(start, end)
};

scriptSnapshot2.getChangeRange(scriptSnapshot1); //?
