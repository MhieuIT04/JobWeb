import React from 'react';

function HomeFooter() {
  return (
    <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">JobBoard</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Nền tảng kết nối ứng viên và nhà tuyển dụng. Tìm việc nhanh, ứng tuyển dễ dàng.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Người tìm việc</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li><a href="/jobs" className="hover:underline">Tìm việc</a></li>
            <li><a href="/favorites" className="hover:underline">Việc đã lưu</a></li>
            <li><a href="/register" className="hover:underline">Tạo hồ sơ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Nhà tuyển dụng</h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li><a href="/employer/dashboard" className="hover:underline">Quản lý tuyển dụng</a></li>
            <li><a href="/employer/jobs/new" className="hover:underline">Đăng tin</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Liên hệ</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">Email: support@jobboard.local</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">© {new Date().getFullYear()} JobBoard</p>
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
