type TokenFormat = string | {
  accessToken?: string;
  token?: string;
  jwt?: string;
  [key: string]: any;
};
export type LoginResponse = {
    token: string,
    userId: number
    username: string
}
