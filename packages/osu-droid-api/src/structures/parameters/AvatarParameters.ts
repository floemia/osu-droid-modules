/**
 * Parameters for the `/avatar` endpoint.
 */
export interface AvatarParameters {
  /**
   * The size in px of the avatar. Must be between 64 and 256. Defaults to 128.
   */
  size?: number;
}

/**
 * Parameters for the `/avatar/userid` endpoint.
 */
export interface AvatarByIDParameters extends AvatarParameters {
  /**
   * The id of the user.
   */
  id: number;
}

/**
 * Parameters for the `/avatar/hash` endpoint.
 */
export interface AvatarByHashParameters extends AvatarParameters {
  /**
   * The SHA-512 hash of the avatar.
   */
  hash: string;
}

export interface AvatarHashesByIDsParameters extends AvatarParameters {
  /**
   * The user IDs.
   */
  ids: number | number[];
}
