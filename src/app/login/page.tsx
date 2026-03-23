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
        <div className="flex min-h-svh items-center justify-center bg-muted/50 p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col items-center text-center">
                                        <h1 className="text-2xl font-bold">Welcome back</h1>
                                        <p className="text-balance text-muted-foreground">
                                            Login to your Admission Today account
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@admissiontoday.com"
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-destructive">{errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">Password</Label>
                                            <a
                                                href="#"
                                                className="ml-auto text-sm underline-offset-2 hover:underline"
                                            >
                                                Forgot your password?
                                            </a>
                                        </div>
                                        <Input id="password" type="password" {...register("password")} />
                                        {errors.password && (
                                            <p className="text-xs text-destructive">{errors.password.message}</p>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Logging in..." : "Login"}
                                    </Button>
                                </div>
                            </form>
                            <div className="relative hidden bg-muted md:block">
                                <div className="bg-primary h-full w-full flex flex-col items-center justify-center p-8 text-primary-foreground">
                                    <div className="w-full h-full rounded-2xl bg-white/10 backdrop-blur-md p-6 flex flex-col items-center justify-center space-y-4">
                                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-primary text-3xl font-bold">
                                            A
                                        </div>
                                        <h2 className="text-2xl font-bold text-center">Admission Today Admin Panel</h2>
                                        <p className="text-center text-sm opacity-80">
                                            Manage your colleges, blogs, and users in one centralized premium dashboard.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                        By clicking login, you agree to our <a href="#">Terms of Service</a>{" "}
                        and <a href="#">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    );
}
