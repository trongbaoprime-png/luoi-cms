"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CRMErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRM ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            <h3 className="font-bold text-sm text-rose-900">
              {this.props.fallbackTitle || "Đã xảy ra lỗi hiển thị ở phân hệ CRM"}
            </h3>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            {this.state.error?.message || "Hệ thống tiếp nhận Form của Lưới CMS vẫn đang chạy 100% bình thường. Vui lòng bấm Tải lại trang."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCwIcon className="w-3.5 h-3.5" />
            <span>Tải Lại Giao Diện</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
