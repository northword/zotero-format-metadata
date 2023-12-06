import { CrossrefClient, QueryWorksParams } from "@jamesgopsill/crossref-client";

async function getDOIFromCrossrefByTitle(title: string) {
    // const doi = await getDOI(item);
    const client = new CrossrefClient();

    const search: QueryWorksParams = {
        queryTitle: title,
    };
    const r = await client.works(search);
    if (r.ok && r.status == 200) console.log(r.content);
}
getDOIFromCrossrefByTitle(
    "Thermodynamic stability, redox properties, and reactivity of Mn3O4, Fe3O4, and Co3O4 model catalysts for N2O decomposition: resolving the origins of steady turnover",
);
