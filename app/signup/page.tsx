"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError("");
    }
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, accept any valid form data
      // In a real app, you would send this to your backend
      console.log("Creating account:", { username: formData.username });

      // Redirect to login page with success message
      router.push("/login?message=Account created successfully");
    } catch (error) {
      setSubmitError(
        "An error occurred while creating your account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#F1F5F9" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Account
          </h1>
          <p className="text-slate-600">
            Sign up for your ORB Dashboard account
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-slate-700"
                >
                  Username<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Choose a username"
                  className={`border-slate-200 focus:border-slate-300 focus:ring-slate-200 ${
                    errors.username
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : ""
                  }`}
                />
                {errors.username && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPasswords.password ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Create a password"
                    className={`border-slate-200 focus:border-slate-300 focus:ring-slate-200 pr-10 ${
                      errors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                        : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("password")}
                  >
                    {showPasswords.password ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirm Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm your password"
                    className={`border-slate-200 focus:border-slate-300 focus:ring-slate-200 pr-10 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                        : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {submitError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {submitError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white disabled:bg-slate-400 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#EC0040" }}
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium hover:text-slate-900 transition-colors"
                    style={{ color: "#EC0040" }}
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
