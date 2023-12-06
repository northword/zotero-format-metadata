# update `src/date/` 

## src\data\journal-abbr\jabref-abbr\journal-list-dots.ts
cd src/data/journal-abbr/jabref-abbr/
python generate-journal-list-dot.py
cd -

# src/data/journal-abbr/library-ubc-ca/journalAbbrData.ts
cd src/data/journal-abbr/library-ubc-ca/
python get-data-from-ubc.py 
cd -

# merge
cd src/data/journal-abbr/
ts-node merge.ts
cd -