import * as React from 'react';
import {
  // Aviation / flight
  Plane,
  Wind,
  Compass,
  Navigation,
  Mountain,
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
  Sunrise,
  Sunset,
  // Weather variants (for the WMO code mapping)
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  Snowflake,
  HelpCircle,
  CloudOff,
  // Trust / safety
  Shield,
  ShieldCheck,
  BadgeCheck,
  Award,
  CheckCircle2,
  Ear,
  HeartPulse,
  FileCheck,
  // Contact / actions
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  MessageCircle,
  Calendar,
  Clock,
  Send,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  // UI genel
  Menu,
  X,
  Plus,
  Minus,
  Search,
  Star,
  Heart,
  Users,
  User,
  Euro,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  Info,
  CalendarCheck,
  Thermometer,
  Eye,
  Gauge,
  Wifi,
  Droplet,
  Droplets,
  Lock,
  // Packages / clothing / transport
  Package,
  Shirt,
  Car,
  Coffee,
  Languages,
  // Media and gallery
  Image as ImageIcon,
  Camera,
  Play,
  Maximize2,
  Video,
  RefreshCw,
  // Admin panel
  LayoutDashboard,
  Settings,
  UserCog,
  LogOut,
  // Note: the brand icons (Instagram/Facebook/Youtube) were removed in
  // lucide-react v1. Use a separate approach for social media
  // (simple-icons veya inline SVG).
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Registry of the Lucide icons this site uses.
 *
 * Tree shaking: only the icons added here reach the bundle. When a new icon is
 * needed, add it to both the import above and the registry.
 */
export const iconRegistry = {
  Plane,
  Wind,
  Compass,
  Navigation,
  Mountain,
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
  Sunrise,
  Sunset,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  Snowflake,
  HelpCircle,
  CloudOff,
  Shield,
  ShieldCheck,
  BadgeCheck,
  Award,
  CheckCircle2,
  Ear,
  HeartPulse,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  MessageCircle,
  Calendar,
  Clock,
  Send,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Plus,
  Minus,
  Search,
  Star,
  Heart,
  Users,
  User,
  Euro,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  Info,
  CalendarCheck,
  Thermometer,
  Eye,
  Gauge,
  Wifi,
  Droplet,
  Droplets,
  Lock,
  Package,
  Shirt,
  Car,
  Coffee,
  Languages,
  Image: ImageIcon,
  Camera,
  Play,
  Maximize2,
  Video,
  RefreshCw,
  LayoutDashboard,
  Settings,
  UserCog,
  LogOut,
} satisfies Record<string, React.ComponentType<LucideProps>>;

/** Every valid icon name (a type-safe union). */
export type IconName = keyof typeof iconRegistry;

export interface IconProps extends LucideProps {
  /** Icon name (type safe, with autocomplete). */
  name: IconName;
  className?: string;
}

/**
 * Lucide React wrapper — type safe and tree-shakeable.
 *
 * Usage:
 *   <Icon name="Plane" className="h-5 w-5 text-sky-500" />
 *
 * Only icons registered in `iconRegistry` can be used, which keeps unnecessary
 * ones out of the bundle.
 */
export function Icon({ name, className, ...props }: IconProps) {
  const Cmp = iconRegistry[name];
  if (!Cmp) return null;
  return <Cmp className={cn(className)} {...props} />;
}

export default Icon;
