import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProfileData {
  name: string;
  description: string;
  profileImageUrl: string;
  coverImageUrl: string;
}

export function ProfileCard() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    description: "",
    profileImageUrl: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400",
    coverImageUrl: "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800"
  });

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfile(prev => ({ ...prev, profileImageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfile(prev => ({ ...prev, coverImageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden border-2 border-dashed border-border/50 hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-0">
        {/* Cover Image Section */}
        <div className="relative h-40 overflow-hidden group/cover">
          <img
            src={profile.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Cover Image Upload */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer">
            <div className="flex flex-col items-center gap-2 text-white">
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Change Cover</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />
          </label>

          {/* Cover Image Label */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-md px-3 py-1">
            <span className="text-white text-xs font-medium">Cover Image</span>
          </div>
        </div>

        {/* Profile Image - Overlapping */}
        <div className="relative -mt-16 flex justify-center mb-4 z-10">
          <div className="relative group/avatar">
            <div className="w-32 h-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted">
              <img
                src={profile.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
              />
            </div>
            
            {/* Profile Image Upload */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </label>

            {/* Profile Image Label */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-md px-2 py-1 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground">Profile</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 pb-8 space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Display Name
            </label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="text-center text-xl font-semibold border-dashed hover:border-primary/50 focus:border-primary transition-colors"
              placeholder="Enter your name"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Bio
            </label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-4 text-center text-muted-foreground border border-dashed border-border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-primary/50 transition-colors min-h-[100px]"
              placeholder="Tell people about yourself..."
              rows={4}
            />
          </div>

          {/* Preview Section */}
          <div className="pt-4 border-t border-dashed border-border/50">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {profile.name || "Your Name"}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {profile.description || "Your bio will appear here"}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-8 right-8 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
        <div className="absolute top-12 right-12 w-1 h-1 bg-accent/40 rounded-full animate-pulse delay-300" />
      </CardContent>
    </Card>
  );
}