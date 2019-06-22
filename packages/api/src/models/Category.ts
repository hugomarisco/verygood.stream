import { BaseModel } from "./BaseModel";
import { Broadcast } from "./Broadcast";

export class Category extends BaseModel {
  public static get tableName() {
    return "categories";
  }

  public static get idColumn() {
    return "categoryId";
  }

  public static get relationMappings() {
    return {
      category: {
        join: {
          from: "categories.categoryId",
          to: "broadcasts.categoryId"
        },
        modelClass: Broadcast,
        relation: BaseModel.HasManyRelation
      }
    };
  }

  public static get jsonSchema() {
    return {
      properties: {
        categoryId: {
          type: "integer"
        },
        name: {
          type: "string"
        }
      },
      required: ["name"],
      type: "object"
    };
  }
}
