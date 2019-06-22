exports.up = function(knex) {
  return knex.schema.createTable("categories", table => {
    table.increments("category_id");
    table
      .string("name")
      .unique()
      .notNull();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("categories");
};
