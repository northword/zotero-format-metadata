import { universityPlaceLocalData } from "../../data";
import { RuleBase, RuleBaseOptions } from "./rule-base";

class updateUniversityPlaceOptions implements RuleBaseOptions {}

export class UpdateUniversityPlace extends RuleBase<updateUniversityPlaceOptions> {
    constructor(options: updateUniversityPlaceOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item {
        if (item.itemType !== "thesis") return item;

        const university = item.getField("university") as string;
        let place = this.getUniversityPlace(university);
        if (place == "") place = this.getUniversityPlace(university.replace(/[（(].*[)|）]/, ""));
        item.setField("place", place);
        return item;
    }

    /**
     * Get place of university from local dataset.
     *
     * @param university - The full name of university
     * @param dataBase - local dataset
     * @returns
     * - String of `place` when when this university exist in the local dataset
     * - `false` when this university does not exist in local dataset
     */
    getUniversityPlace(university: string, dataBase = universityPlaceLocalData) {
        const place = dataBase[university];
        if (place == "" || place == null || place == undefined) {
            ztoolkit.log(`[Place] ${university} do not have place in local data set`);
            return "";
        } else {
            return place;
        }
    }
}
