import React from 'react';
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

function HorizontalJobFilters({
  categories = [],
  cities = [],
  workTypes = [],
  filters,
  onFilterChange,
  onClearFilters
}) {
  const formatSalaryRange = (range) => {
    if (!range) return 'Tất cả mức lương';
    return `${range[0]} - ${range[1]} triệu`;
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  return (
    <div className="bg-white border-b sticky top-16 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-4 overflow-x-auto">
          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                Ngành nghề <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                {categories.map(category => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => onFilterChange('category', category.id)}
                    className="cursor-pointer"
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cities Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                Địa điểm <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                {cities.map(city => (
                  <DropdownMenuItem
                    key={city.id}
                    onClick={() => onFilterChange('city', city.id)}
                    className="cursor-pointer"
                  >
                    {city.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Work Types Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                Loại công việc <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                {workTypes.map(type => (
                  <DropdownMenuItem
                    key={type.id}
                    onClick={() => onFilterChange('work_type', type.id)}
                    className="cursor-pointer"
                  >
                    {type.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Salary Range Button */}
          <Button
            variant="outline"
            onClick={() => {/* Open salary range dialog */}}
            className="min-w-[150px]"
          >
            {formatSalaryRange(filters.salary_range)}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* All Filters Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Tất cả bộ lọc
                {getActiveFiltersCount() > 0 && (
                  <span className="ml-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
              {/* Advanced filters content */}
            </SheetContent>
          </Sheet>

          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700"
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
