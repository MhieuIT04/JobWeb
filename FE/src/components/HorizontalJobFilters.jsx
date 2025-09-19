// src/components/HorizontalJobFilters.jsx

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

import { Input } from "@/components/ui/input"; // Thêm Input

// Mảng các khoảng lương cố định
const salaryRanges = [
    { label: 'Dưới 10 triệu', value: '0-10' },
    { label: '10 - 20 triệu', value: '10-20' },
    { label: '20 - 30 triệu', value: '20-30' },
    { label: '30 - 50 triệu', value: '30-50' },
    { label: 'Trên 50 triệu', value: '50-999'},
];

function HorizontalJobFilters({
    // Dữ liệu từ component cha
    categories = [],
    cities = [],
    workTypes = [],
    // Các giá trị filter hiện tại từ cha
    initialFilters,
    // Hàm callback để thông báo cho cha khi có thay đổi
    onFilterChange
}) {
    // State cục bộ để quản lý các giá trị filter
    const [filters, setFilters] = useState(initialFilters || {});

    // useEffect để đồng bộ state cục bộ khi props từ cha thay đổi
    useEffect(() => {
        setFilters(initialFilters || {});
    }, [initialFilters]);

    // Hàm chung để cập nhật filter và gọi callback
    const handleFilterUpdate = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters); // Thông báo cho component cha
    };

    // Hàm để xóa tất cả các bộ lọc
    const handleClearFilters = () => {
        const clearedFilters = {};
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value => !!value).length;
    };

    // Hàm để lấy tên của lựa chọn hiện tại
    const getSelectedItemName = (items, id) => {
        const selected = items.find(item => item.id === id);
        return selected ? selected.name : '';
    };

    const getSelectedSalaryLabel = () => {
        const selected = salaryRanges.find(range => range.value === filters.salary);
        return selected ? selected.label : '';
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-16 z-30">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 py-3 overflow-x-auto">
                    <Input
                        placeholder="Tên công việc, vị trí, kỹ năng..."
                        className="w-full md:w-64"
                        value={filters.search || ''} // Dùng key 'search'
                        onChange={(e) => handleFilterUpdate('search', e.target.value)}
                    />
                    {/* Categories Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="min-w-[120px] flex justify-between">
                                <span>{getSelectedItemName(categories, filters.category) || 'Ngành nghề'}</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 max-h-60 overflow-y-auto">
                            <DropdownMenuItem onClick={() => handleFilterUpdate('category', '')}>Tất cả ngành nghề</DropdownMenuItem>
                            <DropdownMenuGroup>
                                {categories.map(category => (
                                    <DropdownMenuItem key={category.id} onClick={() => handleFilterUpdate('category', category.id)}>{category.name}</DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Cities Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="min-w-[120px] flex justify-between">
                                <span>{getSelectedItemName(cities, filters.city) || 'Địa điểm'}</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 max-h-60 overflow-y-auto">
                            <DropdownMenuItem onClick={() => handleFilterUpdate('city', '')}>Tất cả địa điểm</DropdownMenuItem>
                            <DropdownMenuGroup>
                                {cities.map(city => (
                                    <DropdownMenuItem key={city.id} onClick={() => handleFilterUpdate('city', city.id)}>{city.name}</DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Work Types Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="min-w-[120px] flex justify-between">
                                <span>{getSelectedItemName(workTypes, filters.work_type) || 'Loại công việc'}</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 max-h-60 overflow-y-auto">
                            <DropdownMenuItem onClick={() => handleFilterUpdate('work_type', '')}>Tất cả loại hình</DropdownMenuItem>
                            <DropdownMenuGroup>
                                {workTypes.map(type => (
                                    <DropdownMenuItem key={type.id} onClick={() => handleFilterUpdate('work_type', type.id)}>{type.name}</DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Salary Range Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="min-w-[150px] flex justify-between">
                                <span>{getSelectedSalaryLabel() || 'Tất cả mức lương'}</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem onClick={() => handleFilterUpdate('salary', '')}>Tất cả mức lương</DropdownMenuItem>
                            <DropdownMenuGroup>
                                {salaryRanges.map(range => (
                                    <DropdownMenuItem key={range.value} onClick={() => handleFilterUpdate('salary', range.value)}>{range.label}</DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-6" />

                    {/* All Filters Button & Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                Tất cả bộ lọc
                                {getActiveFiltersCount() > 0 && (
                                    <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Bộ lọc nâng cao</SheetTitle>
                                <SheetDescription>
                                    Tùy chỉnh tìm kiếm để tìm công việc phù hợp nhất
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                {/* Thêm các bộ lọc nâng cao ở đây */}
                                <p>Các bộ lọc nâng cao khác sẽ được thêm vào đây (ví dụ: kinh nghiệm, ...)</p>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Nút Xóa bộ lọc */}
                    {getActiveFiltersCount() > 0 && (
                        <Button
                            variant="ghost"
                            onClick={handleClearFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HorizontalJobFilters;