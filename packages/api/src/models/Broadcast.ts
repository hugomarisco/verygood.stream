import { BroadcastSchema } from "@bitstreamy/commons";
import { Pojo } from "objection";
import { hashIds } from "../hashIds";
import { BaseModel } from "./BaseModel";
import { Category } from "./Category";

export class Broadcast extends BaseModel {
  static get tableName() {
    return "broadcasts";
  }

  static get idColumn() {
    return "broadcastId";
  }

  static get relationMappings() {
    return {
      category: {
        join: {
          from: "broadcasts.categoryId",
          to: "categories.categoryId"
        },
        modelClass: Category,
        relation: BaseModel.BelongsToOneRelation
      }
    };
  }

  static get jsonSchema() {
    return BroadcastSchema;
  }

  public title?: string;
  public categoryId?: number;
  public swarmId?: string;

  public $formatJson(json: Pojo) {
    json = super.$formatJson(json);

    if (json.broadcastId) {
      json.broadcastId = hashIds.encode(json.broadcastId);
    }

    if (json.chunkSize) {
      json.chunkSize = parseInt(json.chunkSize, 10);
    }

    return json;
  }
}
