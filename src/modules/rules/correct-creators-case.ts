import { isFullLowerCase, isFullUpperCase } from "../../utils/str";
import { defineRule } from "./rule-base";

export const CorrectCreatorsCase = defineRule({
  id: "correct-creators-case",
  scope: "field",
  targetItemField: "creators",
  apply({ item }) {
    const creators = item.getCreators();

    for (const creator of creators) {
      if (creator.fieldMode === 0) {
        creator.firstName
          = isFullUpperCase(creator.firstName!) || isFullLowerCase(creator.firstName!)
            ? Zotero.Utilities.capitalizeName(creator.firstName!.trim())
            : creator.firstName;
        creator.lastName
          = isFullUpperCase(creator.lastName!) || isFullLowerCase(creator.lastName!)
            ? Zotero.Utilities.capitalizeName(creator.lastName!.trim())
            : creator.lastName;
      }
      else {
        // For creators with single field, if it is already all uppercase,
        // it may be an abbreviation of an institutional name, keep it as is.
        // https://github.com/northword/zotero-format-metadata/issues/378
        creator.lastName = isFullUpperCase(creator.lastName)
          ? creator.lastName
          : Zotero.Utilities.capitalizeName(creator.lastName!.trim());
      }
    }
    item.setCreators(creators);
  },
});
