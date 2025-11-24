import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Briefcase } from 'lucide-react';

function HomeFooter() {
  return (
    <footer className="mt-12 bg-slate-900 dark:bg-slate-950 text-gray-100 w-full">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Về JobBoard */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">JobBoard</h3>
            </div>
            <p className="text-sm text-gray-300 dark:text-gray-400 leading-relaxed mb-4">
              Nền tảng kết nối ứng viên và nhà tuyển dụng. 
              Tìm việc nhanh, ứng tuyển dễ dàng.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-300 dark:text-gray-400">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>support@jobboard.local</span>
            </div>
          </div>

          {/* Người tìm việc */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Người tìm việc</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Tìm việc
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Việc đã lưu
                </Link>
              </li>
              <li>
                <Link to="/my-applications" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Lịch sử ứng tuyển
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Tạo hồ sơ
                </Link>
              </li>
            </ul>
          </div>

          {/* Nhà tuyển dụng */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Nhà tuyển dụng</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/employer/dashboard" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Quản lý tuyển dụng
                </Link>
              </li>
              <li>
                <Link to="/employer/jobs/new" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Đăng tin
                </Link>
              </li>
              <li>
                <Link to="/employer/analytics" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Liên hệ</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 dark:border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} Recruitment Project. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-blue-400 dark:hover:text-blue-300 transition-colors">Điều khoản sử dụng</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-400 dark:hover:text-blue-300 transition-colors">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
