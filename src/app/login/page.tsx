"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth-service";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginFormValues) {
        setIsLoading(true);
        try {
            await authService.login(values);
            toast.success("Login successful!");
            router.push("/");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-svh bg-background">
            {/* Left Side: Form */}
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    <div className="flex flex-col gap-2">
                        <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl font-bold text-xl mb-4">
                            A
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
                        <p className="text-sm text-muted-foreground">
                            Login to your Admission Today admin dashboard
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@admissiontoday.com"
                                    className="h-12 px-4 shadow-xs"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 px-4 shadow-xs"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold shadow-md" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>

                        <p className="mt-10 text-center text-xs text-muted-foreground">
                            By signing in, you agree to our{" "}
                            <a href="#" className="font-medium text-foreground hover:text-primary">Terms of Service</a>{" "}
                            and{" "}
                            <a href="#" className="font-medium text-foreground hover:text-primary">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Showcase */}
            <div className="relative hidden w-0 flex-1 lg:block bg-zinc-950 overflow-hidden">
                {/* Decorative background gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-zinc-950 to-zinc-950"></div>
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-primary/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/2"></div>
                
                <div className="absolute inset-0 flex flex-col justify-center items-center p-12 lg:p-20">
                    <div className="relative w-full max-w-lg">
                        {/* Glassmorphic card */}
                        <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-3xl font-bold shadow-xl">
                                    A
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">Admission Today</h2>
                                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mt-0.5">Admin Panel</p>
                                </div>
                            </div>
                            
                            <p className="text-base leading-relaxed text-zinc-300">
                                "The central hub for managing complete admission lifecycles, engaging leads seamlessly, and controlling application ecosystems securely."
                            </p>
                            
                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-semibold shadow-md">
                                            U{i}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-medium text-zinc-400">
                                    Trusted by thousands of counselors
                                </div>
                            </div>
                        </div>

                        {/* Abstract decoration rings */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 border border-white/5 rounded-full pointer-events-none"></div>
                        <div className="absolute -bottom-16 -left-16 w-64 h-64 border border-white/5 rounded-full pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
