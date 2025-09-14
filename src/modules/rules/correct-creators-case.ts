import { isFullLowerCase, isFullUpperCase } from "../../utils/str";
import { defineRule } from "./rule-base";

export const CorrectCreatorsCase = defineRule({
  id: "correct-creators-case",
  scope: "field",
  targetItemField: "creators",
  apply({ item }) {
    const creators = item.getCreators();

    for (const creator of creators) {
      creator.firstName
        = isFullUpperCase(creator.firstName!) || isFullLowerCase(creator.firstName!)
          ? Zotero.Utilities.capitalizeName(creator.firstName!.trim())
          : creator.firstName;
      creator.lastName
        = isFullUpperCase(creator.lastName!) || isFullLowerCase(creator.lastName!)
          ? Zotero.Utilities.capitalizeName(creator.lastName!.trim())
          : creator.lastName;
    }
    item.setCreators(creators);
  },
});
