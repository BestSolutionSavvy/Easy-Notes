import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import type { User } from "../types/user";

axios.defaults.withCredentials = true;

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const isLoggedIn = computed(() => !!user.value);

  /**
   * Verifies the stored token's validity
   */
  async function verifyToken(): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await axios.get(`/api/users/verify`);
      user.value = response.data.user;
      return true;
    } catch (error) {
      user.value = null;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * User login
   * @param email User's email
   * @param password User's password
   */
  async function login(email: string, password: string) {
    isLoading.value = true;
    try {
      const response = await axios.post(`/api/users/login`, {
        email,
        password,
      });
      user.value = response.data.user;
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * User signup
   * @param email User's email
   * @param password User's password
   * @param role User's role
   * @param name User's name (optional)
   * @param surname User's surname (optional)
   */
  async function signup(
    email: string,
    password: string,
    role: string,
    name?: string,
    surname?: string,
  ) {
    isLoading.value = true;
    try {
      const response = await axios.post(`/api/users/signup?role=${role}`, {
        email,
        password,
        name,
        surname,
      });
      user.value = response.data.user;
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Signup failed";
      return { success: false, message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * User logout
   */
  async function logout() {
    try {
      await axios.post(`/api/users/logout`);
      user.value = null;
    } catch (error) {
      user.value = null;
    }
  }

  return {
    user,
    isLoading,
    isLoggedIn,
    verifyToken,
    login,
    signup,
    logout,
  };
});
