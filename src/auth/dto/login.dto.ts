export class LoginDto {
  username: string;
  passwordHash?: string; // bisa plaintext saat request, nanti kita ganti
  password?: string;
}
