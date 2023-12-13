import { universityPlaceLocalData } from "../../data";

/* 学校地点 */

export { updateUniversityPlace };

async function updateUniversityPlace(item: Zotero.Item) {
    if (item.itemType == "thesis") {
        const university = item.getField("university") as string;
        const place = getUniversityPlace(university);
        item.setField("place", place);
        // await item.saveTx();
    } else {
        ztoolkit.log(`[Place] Item type ${item.itemType} is not thesis, skip it.`);
    }
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
function getUniversityPlace(university: string, dataBase = universityPlaceLocalData) {
    const place = dataBase[university];
    if (place == "" || place == null || place == undefined) {
        ztoolkit.log(`[Place] ${university} do not have place in local data set`);
        return "";
    } else {
        return place;
    }
}
