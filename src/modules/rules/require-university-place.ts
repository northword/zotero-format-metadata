import { DataLoader } from "../../utils/data-loader";
import { defineRule } from "./rule-base";

export const RequireUniversityPlace = defineRule({
  id: "require-university-place",
  scope: "field",

  targetItemTypes: ["thesis"],
  targetItemField: "place",
  fieldMenu: {
    l10nID: "rule-require-university-place-menu-field",
  },
  async apply({ item, debug }) {
    const university = item.getField("university") as string;
    const place = await getUniversityPlace(university)
      || await getUniversityPlace(university.replace(/[（(].*[)|）]/, ""));

    if (!place && item.getField("place"))
      debug(`${university} not existed in dataset, and original place not empty, skip it.`);
    else
      item.setField("place", place);
  },
});

async function getUniversityPlace(university: string) {
  const data = await DataLoader.load("universityPlace");
  const place = data[university];
  if (place === "" || place === null || place === undefined) {
    return "";
  }
  else {
    return place;
  }
}
