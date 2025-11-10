
import { AuthResponse, LoginCredentials, RegisterCredentials } from "./types";

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/login`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Login failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/register`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Registration failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

export async function sendOtp(email: string): Promise<{ message: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/send-otp`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to send OTP');
        }

        return await response.json();
    } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
    }
}

export async function verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/verify-otp`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to verify OTP');
        }

        return await response.json();
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
}
