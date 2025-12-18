/**
 * UI Components barrel export
 *
 * @module components/ui
 * @description Re-exports all UI components for cleaner imports.
 *
 * @example
 * ```tsx
 * import { Button, Card, Input } from "@/components/ui";
 * ```
 */

// Form elements
export { Button, buttonVariants } from "./button";
export { Input } from "./input";
export { default as PasswordInput } from "./password-input";
export { Label } from "./label";
export { Checkbox } from "./checkbox";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

// Layout
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
export { Separator } from "./separator";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

// Feedback
export { Badge, badgeVariants } from "./badge";
export { Skeleton } from "./skeleton";
export { Toaster } from "./sonner";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

// Overlay
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// Data display
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

// Toggle
export { Toggle, toggleVariants } from "./toggle";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";

// Collapsible
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

// OTP
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp";
