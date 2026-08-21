"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, ChevronRight, Camera, Shield, Lock, Bell, Globe, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { useLocation } from "@/context/LocationContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const { location: sharedLocation, setLocation: setSharedLocation } = useLocation();

  // Local Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Hydrate local states once user object & location context are available
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (sharedLocation) {
      setCity(sharedLocation.city || "");
      setState(sharedLocation.state || "");
    }
  }, [sharedLocation]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast("Name and Email are required fields.", "error");
      return;
    }

    if (!city.trim() || !state.trim()) {
      toast("Both City and State are required for Default Location.", "error");
      return;
    }

    // Update location in shared LocationContext (and persisted profile)
    await setSharedLocation({ city: city.trim(), state: state.trim() });

    // Update user profile fields
    updateProfile({
      name,
      email,
      phone,
      location: `${city.trim()}, ${state.trim()}`,
    });

    toast("Profile details & location updated successfully!", "success");
  };

  const handleSettingClick = (setting: string) => {
    toast(`Configuration window for "${setting}" is currently locked in demo mode.`, "error");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-display">
          Profile & Account Settings
        </h1>
        <p className="text-xs text-slate-500">Manage your credentials, preferences, and personal details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Profile Information (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 dash-card space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-55 pb-5">
            <div className="relative group shrink-0">
              {/* Profile Avatar */}
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary text-white font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-md select-none">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
              >
                <Camera className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">{user?.name || "Civic User"}</h2>
              <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary-tint px-2 py-0.5 rounded-pill mt-1 border border-primary/20">
                VERIFIED {user?.role ? user.role.toUpperCase() : "USER"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative flex items-center w-full">

                <input
                  type="text"
                  required
                  className="civic-input px-4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative flex items-center w-full">

                <input
                  type="email"
                  required
                  className="civic-input px-4 "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative flex items-center w-full">

                <input
                  type="text"
                  className="civic-input px-4 "
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Location (City & State) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  City
                </label>
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhubaneswar"
                    className="civic-input px-4"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  State
                </label>
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Odisha"
                    className="civic-input px-4"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-50 flex justify-end">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>

        {/* Right Column: Account Settings (5 cols) */}
        <div className="lg:col-span-5 dash-card space-y-4">
          <div className="border-b border-slate-50 pb-4">
            <h2 className="text-sm font-bold text-slate-800">Account Preferences</h2>
            <p className="text-[11px] text-slate-400">Configure notifications, security, and credentials</p>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Change Password */}
            <div
              onClick={() => handleSettingClick("Change Password")}
              className="py-3.5 flex items-center justify-between cursor-pointer hover:text-primary group transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="h-4.5 w-4.5 text-slate-400 group-hover:text-primary" />
                <span className="text-xs font-bold text-slate-700">Change Password</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>

            {/* Notification Preferences */}
            <div
              onClick={() => handleSettingClick("Notification Preferences")}
              className="py-3.5 flex items-center justify-between cursor-pointer hover:text-primary group transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4.5 w-4.5 text-slate-400 group-hover:text-primary" />
                <span className="text-xs font-bold text-slate-700">Notification Preferences</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>

            {/* Language */}
            <div
              onClick={() => handleSettingClick("Language")}
              className="py-3.5 flex items-center justify-between cursor-pointer hover:text-primary group transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-4.5 w-4.5 text-slate-400 group-hover:text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">System Language</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">English</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>

            {/* Privacy Settings */}
            <div
              onClick={() => handleSettingClick("Privacy Settings")}
              className="py-3.5 flex items-center justify-between cursor-pointer hover:text-primary group transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4.5 w-4.5 text-slate-400 group-hover:text-primary" />
                <span className="text-xs font-bold text-slate-700">Privacy & Data Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>

            {/* Delete Account */}
            <div
              onClick={() => handleSettingClick("Delete Account")}
              className="py-4 flex items-center justify-between cursor-pointer hover:bg-red-50/50 group transition-colors border-t border-slate-100 mt-4 rounded-control px-2"
            >
              <div className="flex items-center gap-3 text-red-600">
                <Trash2 className="h-4.5 w-4.5" />
                <span className="text-xs font-bold">Delete Account</span>
              </div>
              <ChevronRight className="h-4 w-4 text-red-300" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
