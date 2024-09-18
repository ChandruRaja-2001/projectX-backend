/**
 * Base interface for the table User
 */

export interface User {
  user_id: number;
  user_ref_id: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
  // profile_image: string;
  user_password: string;
  user_created_at: Date;
}
