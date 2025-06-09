"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSettings } from "@/contexts/settings-context";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function AccountSettingsPage() {
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    username: settings.fullName,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
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
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update the username in settings context
      updateSettings({ fullName: formData.username });

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Account Settings
          </h1>
          <p className="text-slate-600 mt-2">
            Update your username and password
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
                  placeholder="Enter your username"
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

              {/* Current Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  Current Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    placeholder="Enter your current password"
                    className={`border-slate-200 focus:border-slate-300 focus:ring-slate-200 pr-10 ${
                      errors.currentPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                        : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  New Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="Enter your new password"
                    className={`border-slate-200 focus:border-slate-300 focus:ring-slate-200 pr-10 ${
                      errors.newPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                        : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirm New Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm your new password"
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
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
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

              {/* Submit Status Messages */}
              {submitStatus === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your account settings have been updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    There was an error updating your account settings. Please
                    try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-400 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    "Update Account Settings"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
