"use client";

import Link from "next/link";
import { Scissors, CreditCard, BarChart2, Users, Settings, Construction } from "lucide-react";
import toast from "react-hot-toast";

const modules = [
  { title: "Quản lý\ncông đoạn", icon: Scissors, href: "/stages", color: "#8B1A1A", ready: true },
  { title: "Quản lý\nlương", icon: CreditCard, href: "/salary", color: "#1A4A8B", ready: false },
  { title: "Báo cáo", icon: BarChart2, href: "/reports", color: "#1D6B3B", ready: false },
  { title: "Nhân viên", icon: Users, href: "/employees", color: "#7B3F9E", ready: false },
  { title: "Cài đặt", icon: Settings, href: "/settings", color: "#5F5E5A", ready: false },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="flex flex-wrap gap-6 justify-center">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const iconBox = (
            <div
              className="w-[110px] h-[110px] rounded-[24px] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              style={{ backgroundColor: mod.color }}
            >
              <Icon size={44} color="white" strokeWidth={1.8} />
            </div>
          );

          return (
            <div key={mod.href} className="flex flex-col items-center gap-2">
              {mod.ready ? (
                <Link href={mod.href} target="_blank" rel="noopener noreferrer">{iconBox}</Link>
              ) : (
                <div onClick={() => toast("Tính năng đang phát triển", {  icon: <Construction size={16} color="#F0B429" /> })} className="cursor-not-allowed">
                  {iconBox}
                </div>
              )}
              <span className="text-xs font-medium text-gray-700 text-center leading-tight whitespace-pre-line w-[110px]">
                {mod.title}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}