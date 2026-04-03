import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[130px] h-8 text-xs font-mono">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en" className="text-xs font-mono">English</SelectItem>
          <SelectItem value="zh" className="text-xs font-mono">中文</SelectItem>
          <SelectItem value="ms" className="text-xs font-mono">Bahasa Melayu</SelectItem>
          <SelectItem value="ta" className="text-xs font-mono">தமிழ்</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
