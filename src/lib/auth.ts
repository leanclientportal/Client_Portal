import { VerifyOtpResponseData } from "./types";


export async function sendOtp(email: string, type: 'registration' | 'login'): Promise<{ message: string, status: number }> {
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
            body: JSON.stringify({ email, type }),
        });

        const data = await response.json();
        return { ...data, status: response.status };
    } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
    }
}

export async function verifyOtp(email: string, otp: string, type: 'registration' | 'login', options?: { name?: string; phone?: string; activeProfile?: string; }): Promise<VerifyOtpResponseData> {
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
            body: JSON.stringify({ email, otp, type, ...options }),
        });

        const data = await response.json();
        return { ...data, status: response.status };
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
}


export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('clientverse_jwt');
        localStorage.removeItem('clientverse_user_id');
        localStorage.removeItem('user_activeProfile');
        localStorage.removeItem('user_activeProfileId');
        localStorage.removeItem('user_activeProfileImage');
        localStorage.removeItem('user_profileName');
    }
}
