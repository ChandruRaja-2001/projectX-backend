import pool from "../config/Database.js";
import { User } from "../types/model/UserType.js";
import loggerUtil from "../utils/loggerUtil.js";

class UserModel {
  async findOneByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new Error("Email must be provided");
    }

    const sql = "SELECT * FROM users WHERE user_email=?";
    const params = [email];

    try {
      const [rows] = (await pool.query(sql, params)) as unknown as [User[]];
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      loggerUtil.error(`Database query error: ${errorMessage}`);
      return null;
    }
  }
  async getUserByIdOrUserId({
    id,
    userId,
  }: {
    id?: number;
    userId?: string;
  }): Promise<User | null> {
    if (!id && !userId) {
      throw new Error("Either id or userId must be provided");
    }

    let sql = "SELECT * FROM users WHERE ";
    const params: (number | string)[] = [];

    if (id) {
      sql += "id=?";
      params.push(id);
    } else if (userId) {
      sql += "userId=?";
      params.push(userId);
    }

    try {
      const [rows] = (await pool.query(sql, params)) as unknown as [User[]];
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      loggerUtil.error(`Database query error: ${errorMessage}`);
      return null;
    }
  }

  async getAllUsers(): Promise<User[] | null> {
    const sql = "SELECT * FROM users ORDER BY user_name ASC";
    try {
      const [rows] = (await pool.query(sql)) as unknown as [User[]];
      return rows.length > 0 ? rows : null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      loggerUtil.error(`Database query error: ${errorMessage}`);
      return null;
    }
  }
}

export default UserModel;
