import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import InvoiceTemplate from "./template-1";
import ModernInvoiceTemplate from "./template-Modern";
import PremiumMinimalInvoice from "./template-minimal";

interface Template {
  id: string;
  name: string;
  preview: string;
  component: React.ComponentType<any>;
}

interface TemplateCarouselProps {
  templates: Template[];
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  invoiceData: any;
}

const TemplateCarousel: React.FC<TemplateCarouselProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  // @ts-ignore
  invoiceData,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === templates.length - 3 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? templates.length - 3 : prevIndex - 1
    );
  };

  const getTemplateComponent = (templateId: string) => {
    switch (templateId) {
      case "modern":
        return ModernInvoiceTemplate;
      case "classic":
        return InvoiceTemplate;
      case "minimal":
        return PremiumMinimalInvoice;
      default:
        return ModernInvoiceTemplate;
    }
  };

  return (
    <div className="w-full py-4 ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Select Template</h3>
        <div className="flex items-center gap-4 ">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {templates.length / 3}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden ">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-12"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {templates.map((template) => {
            // @ts-ignore
            const TemplateComponent = getTemplateComponent(template.id);
            return (
              <div
                key={template.id}
                className="w-72 flex-shrink-0 px-2 "
                onClick={() => onSelectTemplate(template.id)}
              >
                <Card
                  className={`h-72 cursor-pointer transition-all overflow-hidden group relative ${selectedTemplate === template.id
                    ? "border-2 border-primary shadow-lg"
                    : "hover:border-primary/50 hover:shadow-md"
                    }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <img src={template.preview} />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 border-2 border-primary pointer-events-none" />
                  )}
                </Card>
                <div className="mt-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">{template.name}</h4>
                  {selectedTemplate === template.id && (
                    <span className="text-xs text-primary font-medium">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplateCarousel;

