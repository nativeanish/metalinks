import {
  MessageCircle,
  AlignCenter,
  Users,
  Clapperboard,
  File,
  Repeat,
  BookCheck,
  Link,
  Image,
  Link2,
  Map,
  Calendar,
  Newspaper,
  Images,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { SiFarcaster } from "react-icons/si";
import Paragraph from "../Image/Paragraph";
import Odysee from "../Image/Odysee";
import Mirror from "../Image/Mirror";
import {
  FaDiscord,
  FaFacebook,
  FaFile,
  FaInstagram,
  FaMedium,
  FaReddit,
  FaRetweet,
  FaTelegram,
  FaTwitch,
  FaYoutube,
} from "react-icons/fa";
import social from "./social";
import { RiNftFill } from "react-icons/ri";
const node = {
  nav: [
    { name: "Social", icon: MessageCircle, node: social },
    {
      name: "General",
      icon: Link,
      node: [
        {
          name: "Image",
          alt: "Image-Card",
          icon: Image,
          description: "Upload and display images in your profile",
        },
        {
          name: "Url",
          alt: "Url-Card",
          icon: Link2,
          description: "Add custom links to any website or resource",
        },
        {
          name: "Maps",
          alt: "Maps-Card",
          icon: Map,
          description: "Add a map to your profile",
        },
        {
          name: "Calendar",
          alt: "Calendar-Card",
          icon: Calendar,
          description: "Add a calendar to your profile to schedule events",
        },
        {
          name: "NewsLetter",
          alt: "NewsLetter-Card",
          icon: Newspaper,
          description:
            "Add a newsletter subscription to your profile to grow your audience",
        },
        {
          name: "Email",
          alt: "Email-Card",
          icon: Mail,
          description:
            "Add your email address to your profile for direct contact",
        },
        {
          name: "Phone",
          alt: "Phone-Card",
          icon: Phone,
          description:
            "Add your phone number to your profile for direct contact",
        },
      ],
    },
    {
      name: "Text",
      icon: AlignCenter,
      node: [
        {
          name: "Text",
          alt: "Text-Card",
          icon: AlignCenter,
          description: "Add formatted text blocks and paragraphs",
        },
      ],
    },
    {
      name: "File",
      icon: File,
      node: [
        {
          name: "File",
          alt: "File",
          icon: FaFile,
          description: "Upload and share various file types",
        },
      ],
    },
    {
      name: "Publishing",
      icon: BookCheck,
      node: [
        {
          name: "Medium",
          alt: "Medium-Post",
          icon: FaMedium,
          description: "Feature your Medium articles and stories",
        },
        {
          name: "Paragraph",
          alt: "Paragraph-Post",
          icon: Paragraph,
          description: "Share your Paragraph blog posts",
        },
        {
          name: "Mirror",
          alt: "Mirror-Post",
          icon: Mirror,
          description: "Display your Mirror publications",
        },
      ],
    },
    {
      name: "Video",
      icon: Clapperboard,
      node: [
        {
          name: "Youtube Video",
          alt: "Youtube-Video",
          icon: FaYoutube,
          description: "Embed YouTube videos and playlists",
        },
        {
          name: "Odysee Video",
          alt: "Odysee-Video",
          icon: Odysee,
          description: "Share videos from Odysee platform",
        },
        {
          name: "Twitch-Video",
          alt: "Twitch",
          icon: FaTwitch,
          description: "Feature Twitch clips and highlights",
        },
      ],
    },
    {
      name: "Post",
      icon: Repeat,
      node: [
        {
          name: "Tweet",
          alt: "Twitter-Post",
          icon: FaRetweet,
          description: "Embed specific tweets and Twitter posts",
        },
        {
          name: "Facebook Post",
          alt: "Facebook-Post",
          icon: FaFacebook,
          description: "Share Facebook posts and updates",
        },
        {
          name: "Farcaster",
          alt: "Farcaster-Post",
          icon: SiFarcaster,
          description: "Display Farcaster casts and content",
        },
        {
          name: "Instagram Post",
          alt: "Instagram-Post",
          icon: FaInstagram,
          description: "Feature Instagram posts and reels",
        },
      ],
    },
    {
      name: "Community",
      icon: Users,
      node: [
        {
          name: "Telegram",
          alt: "Telegram-Community",
          icon: FaTelegram,
          description: "Link to Telegram groups and channels",
        },
        {
          name: "Discord",
          alt: "Discord-Community",
          icon: FaDiscord,
          description: "Connect Discord servers and communities",
        },
        {
          name: "Reddit",
          alt: "Reddit-Community",
          icon: FaReddit,
          description: "Share Reddit communities and discussions",
        },
      ],
    },
    {
      name: "NFT",
      icon: RiNftFill,
      node: [
        {
          name: "Bazar Collection",
          alt: "Bazar-Collection",
          icon: Images,
          description: "A collection of your unique digital assets",
        },
        {
          name: "Bazar Profile",
          alt: "Bazar-Profile",
          icon: User,
          description: "A profile showcasing your unique digital assets",
        },
      ],
    },
  ],
};
export default node;
