"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

type AuthResponse = {
  success: boolean;
  user?: User | null;
  message?: string;
};

type UserContextValue = {
  user: User | null;

  isLoaded: boolean;
  isLoading: boolean;

  isAuthenticated: boolean;

  error: string | null;

  refreshUser: () => Promise<void>;

  login: (
    input: LoginInput
  ) => Promise<User>;

  register: (
    input: RegisterInput
  ) => Promise<User>;

  logout: () => Promise<void>;

  clearError: () => void;
};

type UserProviderProps = {
  children: ReactNode;
};

const UserContext =
  createContext<UserContextValue | null>(
    null
  );

/*
 * =============================================================
 * HELPERS
 * =============================================================
 */

async function readJsonResponse(
  response: Response
): Promise<AuthResponse> {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      message:
        "Sunucudan geçersiz yanıt alındı.",
    };
  }
}

function getErrorMessage(
  data: AuthResponse,
  fallback: string
) {
  if (
    typeof data.message ===
      "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}

/*
 * =============================================================
 * PROVIDER
 * =============================================================
 */

export function UserProvider({
  children,
}: UserProviderProps) {
  const [
    user,
    setUser,
  ] = useState<User | null>(
    null
  );

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  /*
   * ===========================================================
   * REFRESH USER
   * ===========================================================
   */

  const refreshUser =
    useCallback(
      async () => {
        setIsLoading(true);

        setError(null);

        try {
          const response =
            await fetch(
              "/api/auth/me",
              {
                method: "GET",

                cache:
                  "no-store",

                credentials:
                  "same-origin",
              }
            );

          /*
           * 401 = kullanıcı giriş yapmamış.
           *
           * Bu normal bir durumdur.
           */
          if (
            response.status ===
            401
          ) {
            setUser(null);

            return;
          }

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            !data.success ||
            !data.user
          ) {
            throw new Error(
              getErrorMessage(
                data,
                "Kullanıcı bilgileri alınamadı."
              )
            );
          }

          setUser(
            data.user
          );
        } catch (requestError) {
          console.error(
            "Kullanıcı oturumu alınamadı:",
            requestError
          );

          setUser(null);

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Kullanıcı bilgileri alınamadı."
          );
        } finally {
          setIsLoading(false);

          setIsLoaded(true);
        }
      },
      []
    );

  /*
   * ===========================================================
   * INITIAL SESSION
   * ===========================================================
   */

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  /*
   * ===========================================================
   * LOGIN
   * ===========================================================
   */

  const login =
    useCallback(
      async (
        input: LoginInput
      ): Promise<User> => {
        setIsLoading(true);

        setError(null);

        try {
          const response =
            await fetch(
              "/api/auth/login",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                credentials:
                  "same-origin",

                body:
                  JSON.stringify({
                    email:
                      input.email,

                    password:
                      input.password,
                  }),
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            !data.success ||
            !data.user
          ) {
            throw new Error(
              getErrorMessage(
                data,
                "Giriş yapılamadı."
              )
            );
          }

          setUser(
            data.user
          );

          return data.user;
        } catch (requestError) {
          const message =
            requestError instanceof
              Error
              ? requestError.message
              : "Giriş yapılamadı.";

          setError(
            message
          );

          throw new Error(
            message
          );
        } finally {
          setIsLoading(false);
          setIsLoaded(true);
        }
      },
      []
    );

  /*
   * ===========================================================
   * REGISTER
   * ===========================================================
   */

  const register =
    useCallback(
      async (
        input: RegisterInput
      ): Promise<User> => {
        setIsLoading(true);

        setError(null);

        try {
          const response =
            await fetch(
              "/api/auth/register",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                credentials:
                  "same-origin",

                body:
                  JSON.stringify({
                    email:
                      input.email,

                    password:
                      input.password,

                    firstName:
                      input.firstName,

                    lastName:
                      input.lastName,

                    phone:
                      input.phone ?? "",
                  }),
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            !data.success ||
            !data.user
          ) {
            throw new Error(
              getErrorMessage(
                data,
                "Kayıt oluşturulamadı."
              )
            );
          }

          setUser(
            data.user
          );

          return data.user;
        } catch (requestError) {
          const message =
            requestError instanceof
              Error
              ? requestError.message
              : "Kayıt oluşturulamadı.";

          setError(
            message
          );

          throw new Error(
            message
          );
        } finally {
          setIsLoading(false);
          setIsLoaded(true);
        }
      },
      []
    );

  /*
   * ===========================================================
   * LOGOUT
   * ===========================================================
   */

  const logout =
    useCallback(
      async () => {
        setIsLoading(true);

        setError(null);

        try {
          const response =
            await fetch(
              "/api/auth/logout",
              {
                method: "POST",

                credentials:
                  "same-origin",
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              getErrorMessage(
                data,
                "Çıkış yapılamadı."
              )
            );
          }

          setUser(null);
        } catch (requestError) {
          const message =
            requestError instanceof
              Error
              ? requestError.message
              : "Çıkış yapılamadı.";

          setError(
            message
          );

          throw new Error(
            message
          );
        } finally {
          setIsLoading(false);
          setIsLoaded(true);
        }
      },
      []
    );

  /*
   * ===========================================================
   * CLEAR ERROR
   * ===========================================================
   */

  const clearError =
    useCallback(
      () => {
        setError(null);
      },
      []
    );

  /*
   * ===========================================================
   * VALUE
   * ===========================================================
   */

  const value =
    useMemo<UserContextValue>(
      () => ({
        user,

        isLoaded,

        isLoading,

        isAuthenticated:
          Boolean(user),

        error,

        refreshUser,

        login,

        register,

        logout,

        clearError,
      }),
      [
        user,
        isLoaded,
        isLoading,
        error,
        refreshUser,
        login,
        register,
        logout,
        clearError,
      ]
    );

  return (
    <UserContext.Provider
      value={value}
    >
      {children}
    </UserContext.Provider>
  );
}

/*
 * =============================================================
 * HOOK
 * =============================================================
 */

export function useUser() {
  const context =
    useContext(
      UserContext
    );

  if (!context) {
    throw new Error(
      "useUser, UserProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}