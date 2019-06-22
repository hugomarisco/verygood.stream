import Knex from "knex";
import { knexSnakeCaseMappers, Model } from "objection";
import { DBErrors } from "objection-db-errors";
import databaseConnectionConfig from "../../knexfile";

const knex = Knex({
  ...databaseConnectionConfig[process.env.NODE_ENV || "development"],
  ...knexSnakeCaseMappers()
});

Model.knex(knex);

export class BaseModel extends DBErrors(Model) {
  public updatedAt?: string;

  public $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}
