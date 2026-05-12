/**
 * The raw response from the `/avatar/hashes` endpoint.
 */
export interface AvatarHashesResponse {
  /**
   * The requested avatars.
   */
  list: AvatarResponse[];
}

export interface AvatarResponse {
  /**
   * The user's ID.
   */
  userID: number;

  /**
   * The SHA-512 hash of the avatar.
   */
  hash: string;
}
