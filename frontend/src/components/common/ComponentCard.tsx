'use client'
import React from "react";
import { Button } from "lebify-ui";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  // Add button props
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonVariant?: "sea" | "primary" | "secondary";
  onAddClick?: () => void;
  addButtonIcon?: React.ReactNode;
  // Additional header actions
  headerActions?: React.ReactNode;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  showAddButton = false,
  addButtonText = "Add",
  addButtonVariant = "sea",
  onAddClick,
  addButtonIcon,
  headerActions,
}) => {
  const defaultAddIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-stone-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-5 flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{title}</h3>

        <div className="flex items-center gap-3">
          {/* Custom header actions */}
          {headerActions}

          {/* Add button */}
          {showAddButton && onAddClick && (
            <Button
              size="medium"
              hoverEffect="default"
              variant={addButtonVariant}
              onClick={onAddClick}
              icon={addButtonIcon || defaultAddIcon}
            >
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {desc && <p className="px-6 text-sm text-gray-500 dark:text-gray-400">{desc}</p>}

      {/* Card Body */}
      <div className="p-4 border-t border-gray-200 dark:border-stone-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;