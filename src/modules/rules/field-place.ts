import type { Rule } from "./rule-base";
import { useData } from "../../utils/data-loader";

export const updateUniversityPlace: Rule = {
  id: "no-empty-university-place",
  type: "field",
  targetItemTypes: ["thesis"],
  targetItemFields: ["place"],

  async apply({ item }) {
    const university = item.getField("university") as string;
    const place = await getUniversityPlace(university)
      || await getUniversityPlace(university.replace(/[（(].*[)|）]/, ""));

    if (!place && item.getField("place"))
      ztoolkit.log(`[place] ${university} not existed in dataset, and original place not empty, skip it.`);
    else
      item.setField("place", place);

    return item;
  },
};

async function getUniversityPlace(university: string) {
  const data = await useData("universityPlace");
  const place = data[university];
  if (place === "" || place === null || place === undefined) {
    return "";
  }
  else {
    return place;
  }
}
