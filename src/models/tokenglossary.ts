export interface TokenGlossaryResponse {
  tokenGlossary: TokenGlossary[];
}
export interface TokenGlossary {
  category: string;
  token: string;
  description: string;
}
