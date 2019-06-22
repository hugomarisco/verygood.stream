exports.seed = function(knex) {
  return knex("categories")
    .del()
    .then(() => {
      return knex("categories").insert([
        { category_id: 1, name: "Football" },
        { category_id: 2, name: "Basketball" },
        { category_id: 3, name: "Gaming" }
      ]);
    });
};
