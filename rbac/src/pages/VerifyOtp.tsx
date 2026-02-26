"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import { authService } from "../services/authService"

export default function VerifyOtp() {
    const navigate = useNavigate()
    const location = useLocation()
    const { verifyOtp } = useAuth()
    const COOLDOWN_SECONDS = 30
    const email = location.state?.email
    const censoredEmail = email ? email.replace(/(.{2}).+(om+)/, "$1***********$2") : ""
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [resending, setResending] = useState(false)
    const [cooldown, setCooldown] = useState(() => {
        const expiresAt = localStorage.getItem("otpCooldownExpiresAt")
        if (!expiresAt) return 0
        const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
        return remaining > 0 ? remaining : 0
    })

    const startCooldown = () => {
        setCooldown(COOLDOWN_SECONDS)
        const expiresAt = new Date(Date.now() + COOLDOWN_SECONDS * 1000)
        localStorage.setItem("otpCooldownExpiresAt", expiresAt.toISOString())
    }
    useEffect(() => {
        if (!email) navigate("/login")
    }, [email, navigate])

    useEffect(() => {
        if (cooldown <= 0) {
            localStorage.removeItem("otpCooldownExpiresAt")
            return
        }

        const timer = setInterval(() => {
            setCooldown(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [cooldown])



    const handleResend = async () => {
        if (cooldown > 0 || resending) return
        setResending(true)
        try {
            await authService.resendOtp(email)
            startCooldown()
            toast.success("OTP resent successfully!")
        }
        catch (err: any) {
            toast.error(err.message || "Failed to resend OTP")
        }
        finally {
            setResending(false)
        }
    }
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await verifyOtp(email, otp)
            toast.success("OTP verified successfully!")
            navigate("/dashboard")
        } catch (err: any) {
            setError("Invalid OTP")
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
                        Enter the OTP sent to <br />
                        <span className="font-medium">{censoredEmail}</span>
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-4">
                        <input
                            type="text"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full text-center tracking-widest text-lg px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary"
                            placeholder="••••••"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Didn't receive the code? <br />
                        <button type="button" className="text-primary" onClick={handleResend} disabled={cooldown > 0 || resending}> Resend OTP </button>
                        {cooldown > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                                (after {cooldown}s)
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}
