exports.up = function(knex) {
  return knex.schema.createTable("broadcasts", table => {
    table.increments("broadcast_id");
    table
      .string("swarm_id")
      .unique()
      .notNull();
    table.integer("category_id").references("categories.category_id");
    table.biginteger("chunk_size").notNull();
    table.integer("chunk_addressing_method").notNull();
    table.integer("content_integrity_protection_method").notNull();
    table.integer("live_signature_algorithm");
    table.string("title").notNull();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("broadcasts");
};
