import type * as Rules from "./rules";
import type { RuleBase, RuleMetaData } from "./rules/rule-base";

type RuleConstructor<T extends RuleBase<any>> = new (...args: any[]) => T;

export type RuleName = keyof typeof Rules;
type ValueOf<T> = T[keyof T];
type RuleInstance = ValueOf<typeof Rules>;

class RuleRegistry {
  private rules: Map<RuleName, RuleConstructor<RuleBase<any>>> = new Map();
  private instances: Map<RuleName, RuleInstance> = new Map();

  register(name: RuleName, constructor: RuleConstructor<RuleBase<any>>) {
    this.rules.set(name, constructor);
  }

  getRuleInstance(name: RuleName, options?: any): RuleInstance {
    if (!this.instances.has(name)) {
      const RuleClass = this.rules.get(name);
      if (!RuleClass) {
        throw new Error(`Rule ${name} is not registered`);
      }
      const instance = new RuleClass(options);
      this.instances.set(name, instance);
    }
    return this.instances.get(name);
  }

  getAllRuleNames(): RuleName[] {
    return Array.from(this.rules.keys()) as RuleName[];
  }

  clearInstances() {
    this.instances.clear();
  }
}

export const ruleRegistry = new RuleRegistry();

export function Rule() {
  return function (constructor: RuleConstructor<RuleBase<any>>) {
    const ruleName = constructor.name as RuleName;
    ruleRegistry.register(ruleName, constructor);
    return constructor;
  };
}
