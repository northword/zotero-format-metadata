import type { RuleBaseOptions } from "./rule-base";
import { useData } from "../../utils/data-loader";
import { RuleBase } from "./rule-base";

class updateUniversityPlaceOptions implements RuleBaseOptions {}

export class UpdateUniversityPlace extends RuleBase<updateUniversityPlaceOptions> {
  constructor(options: updateUniversityPlaceOptions) {
    super(options);
  }

  async apply(item: Zotero.Item) {
    if (item.itemType !== "thesis")
      return item;

    const university = item.getField("university") as string;
    const place = await this.getUniversityPlace(university)
      || await this.getUniversityPlace(university.replace(/[（(].*[)|）]/, ""));

    if (!place && item.getField("place"))
      ztoolkit.log(`[place] ${university} not existed in dataset, and original place not empty, skip it.`);
    else
      item.setField("place", place);

    return item;
  }

  async getUniversityPlace(university: string) {
    const data = await useData("universityPlace");
    const place = data[university];
    if (place === "" || place === null || place === undefined) {
      ztoolkit.log(`[Place] ${university} do not have place in local data set`);
      return "";
    }
    else {
      return place;
    }
  }
}
