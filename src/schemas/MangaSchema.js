let lovefield = require('lovefield')
let { Type } = lovefield

let MangaSchema = lovefield.schema.create('manga', 1)

MangaSchema.createTable('Mangas')
  .addColumn('id', Type.INTEGER)
  .addColumn('title', Type.STRING)
  .addColumn('lastChapter', Type.NUMBER)
  .addColumn
