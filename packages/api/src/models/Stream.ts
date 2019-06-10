import { databasePool } from "../DatabasePool";

export class Stream {
  public static async all() {
    const { rows } = await databasePool.query(
      "SELECT stream_id, public_key, category_id, title, poster_path FROM streams"
    );

    return rows;
  }

  public static async findById(streamId: string) {
    const { rows } = await databasePool.query(
      "SELECT stream_id, public_key, category_id, title, poster_path FROM streams WHERE stream_id = $1",
      [streamId]
    );

    return rows[0];
  }

  public static async create(stream: any) {
    const { public_key, category_id, title, poster_path } = stream;

    const { rows } = await databasePool.query(
      "INSERT INTO streams (public_key, category_id, title, poster_path) VALUES ($1, $2, $3, $4) RETURNING stream_id, public_key, category_id, title, poster_path",
      [public_key, category_id, title, poster_path]
    );

    return rows[0];
  }
}
