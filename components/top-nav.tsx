"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/contexts/settings-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import React from "react";

export function TopNav() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const { settings } = useSettings();

  // Get user initials from full name
  const getUserInitials = (fullName: any) => {
    return fullName
      .split(" ")
      .map((name: any) => name.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2); // Limit to 2 characters max
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200"
      style={{ backgroundColor: "#EC0040" }}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="hidden md:block">
          <nav className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-sm font-medium text-white hover:text-pink-100"
            >
              Home
            </Link>
            {pathSegments.map((segment, index) => (
              <React.Fragment key={segment}>
                <span className="text-pink-200">/</span>
                <Link
                  href={`/${pathSegments.slice(0, index + 1).join("/")}`}
                  className="text-sm font-medium text-white hover:text-pink-100"
                >
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full bg-white hover:bg-gray-100 text-slate-900 font-semibold text-sm"
              >
                {getUserInitials(settings.fullName)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-900">
                    {settings.fullName}
                  </p>
                  <p className="text-xs leading-none text-slate-600">
                    {settings.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
