/**
 * Authentication Provider Service
 *
 * Centralized service for detecting authentication providers with caching
 * and fallback logic. Provides a single source of truth for provider detection.
 */

import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

interface ProviderCacheEntry {
  providers: string[];
  timestamp: number;
}

export class AuthProviderService {
  private cache = new Map<string, ProviderCacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get authentication providers for an email address
   * Uses cache and fallback logic for reliability
   */
  async getProviders(email: string): Promise<string[]> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check cache first
    const cached = this.cache.get(normalizedEmail);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log("[AuthProviderService] Cache hit for", normalizedEmail);
      return cached.providers;
    }

    console.log(
      "[AuthProviderService] Fetching providers for",
      normalizedEmail
    );

    // Try Firebase first (faster, authoritative for Firebase Auth)
    try {
      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);

      if (methods.length > 0) {
        console.log(
          "[AuthProviderService] Firebase returned providers:",
          methods
        );
        this.cache.set(normalizedEmail, {
          providers: methods,
          timestamp: Date.now(),
        });
        return methods;
      }
    } catch (error) {
      console.warn(
        "[AuthProviderService] Firebase provider check failed:",
        error
      );
      // Don't return yet - fallback to backend
    }

    // Fallback to backend (checks Supabase for users not yet in Firebase)
    try {
      const res = await fetch(
        `/api/auth/check-email?email=${encodeURIComponent(normalizedEmail)}`
      );

      if (!res.ok) {
        throw new Error(`Backend check failed: ${res.status}`);
      }

      const data = await res.json();
      const providers = Array.isArray(data.providers) ? data.providers : [];

      console.log(
        "[AuthProviderService] Backend returned providers:",
        providers
      );

      this.cache.set(normalizedEmail, {
        providers,
        timestamp: Date.now(),
      });

      return providers;
    } catch (error) {
      console.error(
        "[AuthProviderService] Backend provider check failed:",
        error
      );

      // Return empty array as safe default (allows signup flow)
      return [];
    }
  }

  /**
   * Check if email has specific provider
   */
  async hasProvider(email: string, provider: string): Promise<boolean> {
    const providers = await this.getProviders(email);
    return providers.includes(provider);
  }

  /**
   * Check if email has Google provider
   */
  async hasGoogleProvider(email: string): Promise<boolean> {
    return this.hasProvider(email, "google.com");
  }

  /**
   * Check if email has password provider
   */
  async hasPasswordProvider(email: string): Promise<boolean> {
    return this.hasProvider(email, "password");
  }

  /**
   * Check if email exists (has any provider)
   */
  async emailExists(email: string): Promise<boolean> {
    const providers = await this.getProviders(email);
    return providers.length > 0;
  }

  /**
   * Clear cache for specific email or entire cache
   */
  clearCache(email?: string): void {
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      this.cache.delete(normalizedEmail);
      console.log("[AuthProviderService] Cleared cache for", normalizedEmail);
    } else {
      this.cache.clear();
      console.log("[AuthProviderService] Cleared entire cache");
    }
  }

  /**
   * Get cache statistics (for debugging)
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ email: string; providers: string[]; age: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([email, entry]) => ({
      email,
      providers: entry.providers,
      age: Math.floor((now - entry.timestamp) / 1000), // seconds
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupExpiredEntries(): number {
    const now = Date.now();
    let removed = 0;

    for (const [email, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(email);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(
        `[AuthProviderService] Cleaned up ${removed} expired cache entries`
      );
    }

    return removed;
  }
}

// Export singleton instance
export const authProviderService = new AuthProviderService();

// Cleanup expired entries every 10 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    authProviderService.cleanupExpiredEntries();
  }, 10 * 60 * 1000);
}
