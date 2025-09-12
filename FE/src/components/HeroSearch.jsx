import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

function HeroSearch({ onSearch, cities = [] }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ keyword, location });
  };

  const handleClear = () => {
    setKeyword('');
    setLocation('');
    onSearch({ keyword: '', location: '' });
  };

  return (
    <Card className="p-6 bg-white/95 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-7">
          {/* Keyword Search */}
          <div className="md:col-span-4 space-y-2">
            <Label htmlFor="keyword">Tìm kiếm công việc</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="keyword"
                className="pl-10"
                placeholder="Tên công việc, vị trí, kỹ năng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* Location Select */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="location">Địa điểm</Label>
            <Select value={location} onValueChange={(value) => setLocation(value)}>
              <SelectTrigger id="location" className="w-full">
                <SelectValue placeholder="Chọn địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả địa điểm</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          {/* Search Button */}
          <div className="md:col-span-1 flex items-end">
            <Button type="submit" className="w-full h-10">
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Clear Button - Only show if there are active filters */}
        {(keyword || location) && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}

export default HeroSearch;
