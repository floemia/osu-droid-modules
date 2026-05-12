/**
 * Parameters for the `/profile-uid/` and `/profile-username/` endpoints.
 */
export interface UserParameters {
  /**
   * The user's id.
   */
  id?: number;

  /**
   * The user's username.
   */
  username?: string;
}
