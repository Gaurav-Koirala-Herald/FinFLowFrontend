"use client"

import type React from "react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"
import { authService } from "../services/authService"
import { toast } from "sonner"

export default function VerifyOtp() {
    const navigate = useNavigate()
    const location = useLocation()
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const email = location.state?.email || ""

    const handleResendOtp = async () => {
        
        setError("")
        setLoading(true)
    }
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const response = await authService.verifyOtp({
                email: email, 
                otp,
            })
            if (response) {
                toast.success("OTP verified successfully! You can now log in.")
                navigate("/login")
            }
            else setError("Invalid or expired OTP")

            navigate("/dashboard")
        } catch (err: any) {
            setError("Invalid or expired OTP")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4">
            <div className="w-full max-w-md">
                <div className="bg-card rounded-lg shadow-lg border border-border p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Shield className="w-12 h-12 text-primary" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-2">
                        Verify OTP
                    </h1>
                    <p className="text-center text-muted-foreground mb-6">
                        Enter the 6-digit code sent to your email
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                One-Time Password
                            </label>
                            <input
                                type="text"
                                inputMode="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value)
                                }
                                className="w-full text-center tracking-widest text-lg px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary"
                                placeholder="••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Didn't receive the code?{" "}
                        <button className="text-primary hover:underline cursor-pointer" onClick={handleResendOtp}>
                            Resend OTP
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
