import type { AuthUser, LoginCredentials } from "../types";

const AUTH_TOKEN_KEY = "authToken";
const USER_KEY = "user";

class AuthService {
  // Mock login - replace with actual API call
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock student login
    if (credentials.email === "student@test.com") {
      const user: AuthUser = {
        id: "1",
        name: "John Doe",
        className: "Class 10",
        email: credentials.email,
        role: "student",
      };
      this.setToken("mock-token-student");
      this.setUser(user);
      return user;
    }

    // Mock teacher login
    if (credentials.email === "teacher@test.com") {
      const user: AuthUser = {
        id: "2",
        name: "Ms. Smith",
        email: credentials.email,
        role: "teacher",
      };
      this.setToken("mock-token-teacher");
      this.setUser(user);
      return user;
    }

    throw new Error("Invalid credentials");
  }

  async loginWithGoogle(googleToken: string): Promise<AuthUser> {
    // Mock Google login
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const user: AuthUser = {
      id: "3",
      name: "Google User",
      className: "Class 10",
      email: "user@gmail.com",
      role: "student",
    };

    this.setToken(googleToken);
    this.setUser(user);
    return user;
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  getUser(): AuthUser | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }
}

export default new AuthService();
