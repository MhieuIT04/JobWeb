# BÁO CÁO PHÂN TÍCH FRONTEND - HỆ THỐNG TUYỂN DỤNG TRỰC TUYẾN

## PHẦN I: TỔNG QUAN KIẾN TRÚC FRONTEND

### 1.1. Mô hình kiến trúc tổng thể

Hệ thống Frontend được xây dựng theo mô hình **Single Page Application (SPA)**, sử dụng React.js làm framework chính. Kiến trúc này mang lại trải nghiệm người dùng mượt mà, không cần tải lại trang khi điều hướng giữa các chức năng khác nhau.

Ứng dụng tuân theo nguyên tắc **Component-Based Architecture** (Kiến trúc dựa trên thành phần), trong đó giao diện được chia nhỏ thành các component độc lập, có thể tái sử dụng và dễ dàng bảo trì. Mỗi component đảm nhận một chức năng cụ thể và có thể kết hợp với nhau để tạo nên giao diện hoàn chỉnh.

### 1.2. Cấu trúc thư mục dự án

```
FE/
├── public/                 # Tài nguyên tĩnh
│   ├── images/            # Hình ảnh trang trí, logo
│   ├── index.html         # HTML template chính
│   └── manifest.json      # PWA manifest
├── src/                   # Mã nguồn chính
│   ├── api/              # Cấu hình API client
│   ├── components/       # Các component tái sử dụng
│   │   ├── ui/          # UI components cơ bản
│   │   └── home/        # Components cho trang chủ
│   ├── contexts/        # Context API cho state management
│   ├── pages/           # Các trang chính của ứng dụng
│   ├── lib/             # Utilities và helper functions
│   ├── App.js           # Component gốc
│   ├── index.js         # Entry point
│   └── index.css        # Global styles
├── package.json          # Dependencies và scripts
└── tailwind.config.js   # Cấu hình Tailwind CSS
```

### 1.3. Luồng hoạt động của ứng dụng

Khi người dùng truy cập ứng dụng, React sẽ render component App.js, bao bọc bởi các Provider (AuthProvider, ThemeProvider) để cung cấp state toàn cục. React Router DOM xử lý điều hướng giữa các trang mà không cần tải lại trình duyệt. Mọi tương tác với Backend đều thông qua Axios Client, tự động gắn JWT token vào header để xác thực.


## PHẦN II: CÔNG NGHỆ VÀ THƯ VIỆN SỬ DỤNG

### 2.1. Framework và thư viện cốt lõi

**React 18.2.0** - Framework JavaScript chính
React là thư viện JavaScript mã nguồn mở do Facebook phát triển, được sử dụng để xây dựng giao diện người dùng tương tác. Trong dự án này, React 18.2.0 cung cấp các tính năng hiện đại như Concurrent Rendering, Automatic Batching giúp tối ưu hiệu suất render. React sử dụng Virtual DOM để cập nhật giao diện một cách hiệu quả, chỉ re-render những phần thay đổi thay vì toàn bộ trang.

**React Router DOM 7.7.0** - Quản lý điều hướng
React Router DOM là thư viện routing chuẩn cho React, cho phép tạo các ứng dụng SPA với nhiều trang mà không cần tải lại trình duyệt. Phiên bản 7.7.0 cung cấp các tính năng như nested routes, lazy loading, và data loading. Trong dự án, nó được sử dụng để định nghĩa các route cho candidate, employer, và public pages.

**Axios 1.10.0** - HTTP Client
Axios là thư viện HTTP client dựa trên Promise, được sử dụng để giao tiếp với Backend API. Dự án đã cấu hình một axiosClient tùy chỉnh với các interceptor để tự động gắn JWT token vào mọi request, xử lý FormData cho upload file, và xử lý lỗi một cách thống nhất. Timeout được đặt ở 30 giây để đảm bảo không bị treo khi server phản hồi chậm.

### 2.2. UI Framework và Component Library

**Tailwind CSS 3.4.18** - Utility-First CSS Framework
Tailwind CSS là framework CSS utility-first, cho phép xây dựng giao diện nhanh chóng bằng cách kết hợp các class có sẵn. Thay vì viết CSS tùy chỉnh, developer sử dụng các class như `flex`, `pt-4`, `text-center` trực tiếp trong JSX. Dự án đã cấu hình Tailwind với dark mode support, custom color palette dựa trên HSL variables, và responsive breakpoints.

**Radix UI** - Headless UI Components
Radix UI cung cấp các component không có style (headless), tập trung vào accessibility và functionality. Dự án sử dụng nhiều component từ Radix UI:
- Dialog: Modal và popup windows
- Dropdown Menu: Menu ngữ cảnh cho user actions
- Select: Dropdown selection với keyboard navigation
- Avatar: Hiển thị ảnh đại diện với fallback
- Tooltip: Gợi ý khi hover
- Progress: Thanh tiến trình

Các component này đảm bảo tuân thủ WAI-ARIA standards, hỗ trợ keyboard navigation và screen reader.


**Lucide React 0.542.0** - Icon Library
Lucide là thư viện icon mã nguồn mở với hơn 1000 icons được thiết kế đẹp mắt và nhất quán. Dự án sử dụng các icon như Heart (favorite), MapPin (location), Briefcase (work type), User (profile), Sun/Moon (theme toggle). Các icon này có thể tùy chỉnh size, color và stroke width dễ dàng.

**Framer Motion 12.23.12** - Animation Library
Framer Motion là thư viện animation mạnh mẽ cho React, cung cấp các API đơn giản để tạo animation phức tạp. Dự án sử dụng cho:
- Page transitions: Hiệu ứng chuyển trang mượt mà
- Hover effects: Animation khi hover vào job cards
- Modal animations: Fade in/out cho dialogs
- Micro-interactions: Các animation nhỏ tăng trải nghiệm người dùng

### 2.3. State Management và Context API

**React Context API** - Quản lý state toàn cục
Thay vì sử dụng Redux hay MobX, dự án sử dụng Context API có sẵn của React để quản lý state toàn cục. Hai context chính:

1. **AuthContext**: Quản lý authentication state
   - User information (email, role, id)
   - JWT tokens (access và refresh)
   - Login/logout functions
   - Favorites management
   - Notifications management
   - Protected route logic

2. **ThemeContext**: Quản lý theme (dark/light mode)
   - Current theme state
   - Toggle theme function
   - Persist theme preference trong localStorage
   - Apply theme class vào document root

Context API giúp tránh prop drilling (truyền props qua nhiều cấp component) và cung cấp một cách đơn giản để chia sẻ state giữa các component.

### 2.4. Thư viện hỗ trợ khác

**React Toastify 11.0.5** - Notification System
Thư viện hiển thị toast notifications (thông báo nổi) cho các action như login success, error messages, form submission. Được cấu hình với position bottom-right, auto-close sau 5 giây, và themed colors.

**Recharts 2.5.0** - Data Visualization
Thư viện biểu đồ dựa trên D3.js, được sử dụng trong EmployerAnalytics page để hiển thị:
- Line charts: Xu hướng ứng tuyển theo thời gian
- Bar charts: So sánh số lượng ứng viên giữa các job
- Pie charts: Phân bố ứng viên theo trạng thái

**JWT Decode 4.0.0** - Token Parsing
Thư viện decode JWT token để lấy thông tin user (id, email, role, exp) mà không cần gọi API. Được sử dụng trong AuthContext để extract user info từ access token.

**Class Variance Authority (CVA)** - Component Variants
Utility để tạo component variants với Tailwind CSS. Giúp định nghĩa các biến thể của component (size, color, variant) một cách type-safe và dễ maintain.


## PHẦN III: HỆ THỐNG THIẾT KẾ UI/UX

### 3.1. Design System và Color Palette

Ứng dụng áp dụng một Design System nhất quán dựa trên HSL (Hue, Saturation, Lightness) color model. Các màu được định nghĩa bằng CSS Custom Properties trong file index.css, cho phép dễ dàng chuyển đổi giữa light và dark mode.

**Light Mode Color Palette:**
- Background: Trắng sáng (HSL 0 0% 100%)
- Foreground: Xám đậm (HSL 222 84% 4.9%)
- Primary: Xanh dương (HSL 217 91% 60%)
- Secondary: Xám nhạt (HSL 210 40% 96.1%)
- Accent: Xanh nhạt (HSL 210 40% 96.1%)

**Dark Mode Color Palette:**
- Background: Xám đen (HSL 220 26% 14%)
- Foreground: Vàng nhạt (HSL 45 100% 85%)
- Primary: Giữ nguyên xanh dương
- Card: Xám đậm hơn background một chút

Việc sử dụng HSL thay vì RGB/HEX giúp dễ dàng điều chỉnh độ sáng và độ bão hòa màu, tạo ra các biến thể màu hài hòa.

### 3.2. Typography System

Hệ thống typography được xây dựng dựa trên scale chuẩn:
- Heading 1: text-2xl (24px) - font-bold
- Heading 2: text-xl (20px) - font-semibold
- Body: text-base (16px) - font-normal
- Small: text-sm (14px)
- Extra Small: text-xs (12px)

Font family mặc định sử dụng system fonts để đảm bảo hiển thị nhanh và native trên mọi platform:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### 3.3. Spacing System

Tailwind CSS sử dụng spacing scale dựa trên base unit 4px:
- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- 12 = 48px
- 16 = 64px

Dự án áp dụng spacing nhất quán:
- Card padding: p-4 hoặc p-6
- Section spacing: mb-8, mt-8
- Component gap: gap-2, gap-4
- Container padding: px-4 (mobile), px-8 (desktop)

### 3.4. Responsive Design Strategy

Ứng dụng được thiết kế theo nguyên tắc **Mobile-First**, nghĩa là CSS mặc định dành cho mobile, sau đó sử dụng breakpoints để điều chỉnh cho màn hình lớn hơn.

**Breakpoints:**
- sm: 640px (Mobile landscape)
- md: 768px (Tablet)
- lg: 1024px (Desktop)
- xl: 1280px (Large desktop)
- 2xl: 1400px (Extra large - custom)

**Responsive Patterns:**
- Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Hide/show elements: `hidden md:block`
- Flexible spacing: `px-4 md:px-8 lg:px-12`
- Font sizes: `text-sm md:text-base lg:text-lg`


### 3.5. Component Design Patterns

**Card Pattern:**
Sử dụng Card component từ Shadcn/ui làm container chính cho nội dung. Card có:
- Border radius: rounded-xl (12px)
- Shadow: Subtle shadow, tăng lên khi hover
- Padding: Consistent padding trong CardContent và CardFooter
- Border: Thin border với màu subtle

**Button Variants:**
- Primary: Background màu primary, text trắng
- Secondary: Background xám nhạt, text đen
- Ghost: Transparent background, chỉ có text
- Outline: Border với background transparent

**Badge Variants:**
- Default: Background màu primary
- Secondary: Background xám
- Outline: Chỉ có border, transparent background
- Destructive: Background đỏ cho error/warning

### 3.6. Accessibility (A11y) Implementation

Ứng dụng tuân thủ **WCAG 2.1 Level AA** standards:

**Keyboard Navigation:**
- Tất cả interactive elements có thể truy cập bằng Tab
- Dropdown menus hỗ trợ Arrow keys
- Modal có focus trap (không thể tab ra ngoài)
- Escape key để đóng modals

**Screen Reader Support:**
- Semantic HTML: Sử dụng đúng tags (nav, main, article, section)
- ARIA labels: aria-label cho icons và buttons không có text
- ARIA roles: role="button", role="dialog"
- Alt text: Tất cả images có alt text mô tả

**Color Contrast:**
- Text trên background: Tối thiểu 4.5:1 ratio
- Large text: Tối thiểu 3:1 ratio
- Interactive elements: Rõ ràng và dễ phân biệt

**Focus Indicators:**
- Visible focus ring cho tất cả interactive elements
- Custom focus styles với Tailwind: `focus:ring-2 focus:ring-primary`

### 3.7. Dark Mode Implementation

Dark mode được implement sử dụng Tailwind CSS class-based approach:

**Theme Toggle Mechanism:**
1. ThemeContext lưu trữ current theme state
2. Theme được persist trong localStorage
3. Khi toggle, class "dark" được thêm/xóa khỏi document.documentElement
4. Tailwind CSS tự động apply dark: variants

**Dark Mode Styling:**
```jsx
// Example: Card với dark mode support
<Card className="bg-white dark:bg-[hsl(var(--card))]">
  <h2 className="text-gray-900 dark:text-amber-100">Title</h2>
  <p className="text-gray-600 dark:text-amber-200">Content</p>
</Card>
```

**System Preference Detection:**
```javascript
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
  ? 'dark' 
  : 'light';
```


## PHẦN IV: CẤU TRÚC COMPONENTS

### 4.1. Layout Components

**Navbar Component:**
Navigation bar cố định ở top của trang, hiển thị:
- Logo và tên ứng dụng (JobBoard)
- Quick search input (ẩn trên mobile)
- Navigation links dựa trên authentication state
- User dropdown menu với avatar
- Notification bell với unread count badge
- Theme toggle button (Sun/Moon icon)

Navbar sử dụng conditional rendering để hiển thị menu khác nhau cho:
- Guest users: Login và Register buttons
- Authenticated candidates: Profile, Applications, Favorites
- Authenticated employers: Dashboard, Analytics, Job Management

**PrivateRoute Component:**
Higher-Order Component (HOC) bảo vệ các route yêu cầu authentication. Nếu user chưa đăng nhập, redirect về /login. Sử dụng useAuth hook để check authentication state.

**EmployerRoute Component:**
Tương tự PrivateRoute nhưng thêm check role === 'employer'. Bảo vệ các route chỉ dành cho nhà tuyển dụng như Dashboard, Analytics, Job Management.

### 4.2. UI Components (Shadcn/ui)

Dự án sử dụng Shadcn/ui - một collection của các component được build trên Radix UI và styled với Tailwind CSS. Các component này không phải là npm package mà được copy trực tiếp vào project, cho phép tùy chỉnh hoàn toàn.

**Button Component (components/ui/button.jsx):**
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Sử dụng Class Variance Authority (CVA) để manage variants
- Hỗ trợ asChild prop để render as different element

**Card Component (components/ui/card.jsx):**
Bao gồm các sub-components:
- Card: Container chính
- CardHeader: Phần header với title
- CardContent: Nội dung chính
- CardFooter: Phần footer với actions

**Input Component (components/ui/input.jsx):**
- Styled input field với focus states
- Error states với border đỏ
- Disabled states
- Placeholder styling

**Select Component (components/ui/select.jsx):**
Dropdown select dựa trên Radix UI Select:
- Keyboard navigation support
- Search functionality
- Custom trigger và content styling
- Portal rendering để tránh z-index issues

**Dialog Component (components/ui/dialog.jsx):**
Modal dialog với:
- Backdrop overlay
- Focus trap
- Escape key to close
- Scroll lock khi mở
- Animation với Radix UI

**Badge Component (components/ui/badge.jsx):**
Small labels cho status, tags:
- Variants: default, secondary, destructive, outline
- Compact size
- Rounded corners

**Avatar Component (components/ui/avatar.jsx):**
Hiển thị user avatar:
- Image với fallback
- Initials fallback
- Rounded shape
- Multiple sizes


### 4.3. Business Components

**JobCard Component:**
Component hiển thị thông tin job trong grid/list view:
- Company logo với fallback (chữ cái đầu)
- Job title và company name
- "Mới" badge cho jobs posted trong 3 ngày
- Work type và experience level badges
- Location với MapPin icon
- Salary range hoặc "Thương lượng"
- "Xem chi tiết" button
- Favorite heart icon (filled nếu đã favorite)
- Hover effect: Lift up với shadow tăng
- Dark mode support với conditional classes

**JobGrid Component:**
Container hiển thị danh sách JobCard:
- Responsive grid: 1 column (mobile), 2 (tablet), 3 (desktop)
- Gap spacing nhất quán
- Loading skeleton khi fetch data
- Empty state khi không có jobs

**JobFilters Component:**
Sidebar filters cho job search:
- Category select dropdown
- City select dropdown
- Work type checkboxes
- Experience level checkboxes
- Salary range slider
- "Áp dụng" và "Reset" buttons
- Collapsible trên mobile

**ApplyModal Component:**
Modal để ứng tuyển job:
- Job information summary
- CV upload field (file input)
- Cover letter textarea
- Submit button với loading state
- Success/error toast notifications
- Form validation

**NotificationBell Component:**
Icon bell với unread count badge:
- Dropdown menu hiển thị notifications
- Mark as read functionality
- Delete notification
- Mark all as read
- Real-time updates (polling hoặc WebSocket)
- Notification types: application_status, new_message, job_match

**RatingStars Component:**
Hiển thị rating dạng stars:
- Filled và empty stars
- Half star support
- Read-only hoặc interactive mode
- Customizable size và color

### 4.4. Home Page Components

**HeroBanner Component:**
Banner lớn ở top của homepage:
- Background image với overlay
- Heading text với animation
- Search bar nổi bật
- Call-to-action buttons
- Responsive layout

**HotJobs Component:**
Section hiển thị jobs nổi bật:
- Horizontal scrollable carousel
- Featured jobs với special styling
- "Xem tất cả" link
- Auto-scroll functionality

**TopCompanies Component:**
Showcase các công ty hàng đầu:
- Company logos grid
- Hover effects
- Link to company detail page
- Responsive columns

**PopularCategories Component:**
Grid các categories phổ biến:
- Category cards với icon
- Job count per category
- Click to filter jobs by category
- Colorful và eye-catching design


## PHẦN V: CẤU TRÚC PAGES

### 5.1. Authentication Pages

**Login Page (Login.jsx):**
Trang đăng nhập với form gồm:
- Email input field với validation
- Password input field với show/hide toggle
- "Remember me" checkbox
- Submit button với loading state
- Link to Register page
- Error messages hiển thị dưới form
- Redirect về homepage sau khi login thành công

**Register Page (Register.jsx):**
Trang đăng ký tài khoản:
- Email input với email format validation
- Password input với strength indicator
- Confirm password field
- Role selection: Radio buttons cho Candidate/Employer
- Terms and conditions checkbox
- Submit button
- Link to Login page
- Success message và auto-redirect

### 5.2. Job-Related Pages

**JobList Page (JobList.jsx):**
Trang danh sách công việc - trang chính của ứng dụng:
- Search bar ở top
- Filters sidebar (collapsible trên mobile)
- Job grid với pagination
- Sort options: Mới nhất, Lương cao nhất, Phù hợp nhất
- Loading skeletons khi fetch data
- Empty state với illustration
- Infinite scroll hoặc pagination buttons

**JobDetail Page (JobDetail.jsx):**
Trang chi tiết công việc:
- Job title và company info
- Salary, location, work type
- Full job description với HTML rendering
- Requirements list
- Benefits list
- Company information section
- Similar jobs section
- "Ứng tuyển" button (mở ApplyModal)
- "Lưu việc" button
- Share buttons (Facebook, LinkedIn, Copy link)
- Breadcrumb navigation

**JobForm Page (JobForm.jsx):**
Form tạo/sửa job posting (chỉ cho employer):
- Title input
- Category select
- City select
- Work type select
- Experience level select
- Salary range inputs
- Description rich text editor
- Requirements textarea
- Benefits textarea
- Application deadline date picker
- "Đăng tin" hoặc "Cập nhật" button
- Form validation với error messages
- Draft save functionality


### 5.3. User Management Pages

**Profile Page (Profile.jsx):**
Trang quản lý thông tin cá nhân:
- Avatar upload với preview
- Personal information form:
  - Full name
  - Phone number
  - Date of birth
  - Address
- Professional information (cho candidate):
  - Current position
  - Years of experience
  - Skills tags
  - Education history
  - Work experience
- Company information (cho employer):
  - Company name
  - Company size
  - Industry
  - Website
  - Company description
- "Cập nhật" button
- Success/error notifications

**MyApplications Page (MyApplications.jsx):**
Trang lịch sử ứng tuyển (candidate only):
- List các jobs đã apply
- Application status badges:
  - Pending: Màu vàng
  - Reviewing: Màu xanh
  - Accepted: Màu xanh lá
  - Rejected: Màu đỏ
- Applied date
- Link to job detail
- Withdraw application button (nếu pending)
- Filter by status
- Sort by date

**FavoriteJobs Page (FavoriteJobs.jsx):**
Trang việc làm đã lưu:
- Grid hiển thị saved jobs
- Remove from favorites button
- Quick apply button
- Empty state khi chưa có favorites
- Sync với favorites state trong AuthContext

### 5.4. Employer Pages

**EmployerDashboard Page (EmployerDashboard.jsx):**
Dashboard quản lý tuyển dụng:
- Statistics cards:
  - Total jobs posted
  - Total applications received
  - Pending applications
  - Accepted candidates
- Recent applications table
- Quick actions:
  - "Đăng tin mới" button
  - "Xem thống kê" button
- Jobs list với actions:
  - Edit job
  - View applicants
  - Delete job
  - Toggle active/inactive status

**JobApplicants Page (JobApplicants.jsx):**
Trang quản lý ứng viên cho một job:
- Job information header
- Applicants table với columns:
  - Candidate name
  - Email
  - Phone
  - Applied date
  - Status
  - Actions
- Filter by status
- Sort by date/name
- Bulk actions: Accept/Reject multiple
- View CV button (download hoặc preview)
- Change status dropdown
- Send message button

**EmployerAnalytics Page (EmployerAnalytics.jsx):**
Trang thống kê và báo cáo:
- Date range picker
- Charts sử dụng Recharts:
  - Applications over time (Line chart)
  - Applications by job (Bar chart)
  - Application status distribution (Pie chart)
  - Top performing jobs (Bar chart)
- Export to PDF/Excel buttons
- Key metrics cards
- Comparison với previous period


### 5.5. Company Pages

**Companies Page (Companies.jsx):**
Trang danh sách tất cả công ty:
- Company cards grid
- Company logo, name, industry
- Number of active jobs
- Company rating
- "Xem công ty" button
- Search companies by name
- Filter by industry
- Sort by: Name, Jobs count, Rating

**Company Page (Company.jsx):**
Trang chi tiết công ty:
- Company banner image
- Company logo và basic info
- About company section
- Company culture và values
- Benefits và perks
- Office locations với map
- Active jobs list
- Company reviews và ratings
- "Follow company" button
- Contact information

### 5.6. Advanced Features Pages

**CVMatch Page (CVMatch.jsx):**
Trang phân tích CV và gợi ý việc làm:
- CV upload area (drag & drop hoặc click)
- File format support: PDF, DOC, DOCX
- Upload progress bar
- CV parsing results:
  - Extracted skills
  - Experience level detected
  - Education background
  - Contact information
- Matched jobs list với similarity score
- "Ứng tuyển nhanh" cho matched jobs
- Save CV to profile option
- Tips để improve CV

**Messages Page (Messages.jsx):**
Hệ thống chat/messaging (nếu có):
- Conversations list sidebar
- Chat window với message history
- Send message input
- File attachment support
- Read receipts
- Typing indicators
- Real-time updates với WebSocket
- Search conversations
- Archive/delete conversations

## PHẦN VI: XỬ LÝ CSS VÀ STYLING

### 6.1. Tailwind CSS Configuration

File `tailwind.config.js` định nghĩa cấu hình tùy chỉnh:

**Content Paths:**
```javascript
content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"]
```
Tailwind sẽ scan tất cả files trong src để detect các class được sử dụng, loại bỏ unused CSS trong production build.

**Dark Mode:**
```javascript
darkMode: "class"
```
Sử dụng class-based dark mode, nghĩa là dark mode được activate khi class "dark" có trên root element.

**Container Configuration:**
```javascript
container: {
  center: true,
  padding: "2rem",
  screens: { "2xl": "1400px" }
}
```
Container tự động center, có padding 2rem, và max-width 1400px trên màn hình 2xl.

**Extended Colors:**
Extend default Tailwind colors với custom color system dựa trên CSS variables:
```javascript
colors: {
  border: "hsl(var(--border))",
  background: "hsl(var(--background))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))"
  }
}
```


### 6.2. CSS Custom Properties (CSS Variables)

File `index.css` định nghĩa CSS variables cho color system:

**Light Mode Variables:**
```css
:root {
  --background: 0 0% 100%;           /* White */
  --foreground: 222 84% 4.9%;        /* Dark gray */
  --primary: 217 91% 60%;            /* Blue */
  --primary-foreground: 210 40% 98%; /* Almost white */
  --secondary: 210 40% 96.1%;        /* Light gray */
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 217 91% 60%;
  --radius: 0.5rem;                  /* Border radius */
}
```

**Dark Mode Variables:**
```css
.dark {
  --background: 220 26% 14%;         /* Dark gray */
  --foreground: 45 100% 85%;         /* Light yellow */
  --primary: 217 91% 60%;            /* Same blue */
  --card: 224 71% 4%;                /* Very dark */
  --muted: 223 47% 11%;
  --accent: 216 34% 17%;
  --border: 216 34% 17%;
}
```

**Lợi ích của CSS Variables:**
- Dễ dàng switch theme chỉ bằng cách toggle class "dark"
- Consistent colors across toàn bộ app
- Dễ maintain và update color scheme
- Performance tốt hơn so với inline styles

### 6.3. Utility Classes và Custom CSS

**Commonly Used Utility Classes:**

Layout và Flexbox:
```css
.flex .items-center .justify-between
.grid .grid-cols-1 .md:grid-cols-3
.container .mx-auto
```

Spacing:
```css
.p-4 .px-6 .py-8 .m-4 .mt-8 .mb-12
.gap-4 .space-y-4 .space-x-2
```

Typography:
```css
.text-sm .text-base .text-lg .text-2xl
.font-normal .font-semibold .font-bold
.text-gray-600 .text-primary
```

Colors và Backgrounds:
```css
.bg-white .bg-slate-50 .bg-primary
.text-gray-900 .text-white
.border .border-gray-200
```

Effects:
```css
.shadow-sm .shadow-md .shadow-xl
.hover:shadow-xl .hover:-translate-y-2
.transition-all .duration-200
.rounded-lg .rounded-xl
```

**Custom CSS Classes:**
Một số custom classes được định nghĩa trong index.css:
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity;
}
```

### 6.4. Responsive Design Implementation

**Mobile-First Approach:**
CSS mặc định được viết cho mobile, sau đó sử dụng breakpoint modifiers:

```jsx
// Example: JobGrid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>

// Example: Hide on mobile, show on desktop
<div className="hidden md:block">
  {/* Sidebar filters */}
</div>

// Example: Responsive padding
<div className="px-4 md:px-8 lg:px-12">
  {/* Content */}
</div>
```

**Touch-Friendly Design:**
- Button minimum size: 44x44px (Apple HIG recommendation)
- Adequate spacing giữa clickable elements
- Swipe gestures cho carousel
- Pull-to-refresh trên mobile (nếu có)

