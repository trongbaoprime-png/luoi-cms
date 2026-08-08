import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="my-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link
            href="/"
            className="flex items-center text-gray-400 hover:text-[#0d9488] transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            <span>Trang chủ</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            {index === items.length - 1 ? (
              <span className="font-medium text-gray-800">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[#0d9488] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
