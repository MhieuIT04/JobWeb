import React from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed } from "lucide-react";

function JobFilters({
  categories = [],
  cities = [],
  workTypes = [],
  experienceLevels = ['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'],
  selectedFilters,
  onFilterChange,
}) {
  const handleSalaryChange = (values) => {
    onFilterChange('salary_range', values);
  };

  return (
    <Card className="p-4">
      <Accordion type="single" collapsible defaultValue="category">
        {/* Categories */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-lg font-semibold">
            Ngành nghề
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => onFilterChange('category', category.id)}
                >
                  {selectedFilters.category === category.id ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Work Types */}
        <AccordionItem value="workType">
          <AccordionTrigger className="text-lg font-semibold">
            Loại hình công việc
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {workTypes.map(type => (
                <div
                  key={type.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => onFilterChange('work_type', type.id)}
                >
                  {selectedFilters.work_type === type.id ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{type.name}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Experience Level */}
        <AccordionItem value="experience">
          <AccordionTrigger className="text-lg font-semibold">
            Kinh nghiệm
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {experienceLevels.map(level => (
                <div
                  key={level}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => onFilterChange('experience_level', level)}
                >
                  {selectedFilters.experience_level === level ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{level}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Salary Range */}
        <AccordionItem value="salary">
          <AccordionTrigger className="text-lg font-semibold">
            Mức lương
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4 px-2">
              <Slider
                defaultValue={[0, 100]}
                max={100}
                step={1}
                onValueChange={handleSalaryChange}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0 triệu</span>
                <span>100+ triệu</span>
              </div>
              {selectedFilters.salary_range && (
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {selectedFilters.salary_range[0]} - {selectedFilters.salary_range[1]} triệu
                  </Badge>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export default JobFilters;
