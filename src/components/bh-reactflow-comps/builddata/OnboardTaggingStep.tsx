
"use client";

import React from "react";
import { PlusCircle } from "lucide-react"; // lucide icon

import TagDialog from "@/components/shared/TagDialog";

type Tag = {
  tagKey: string;
  tagValue: string;
};

function OnboardTaggingStep() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tags, setTags] = React.useState<Tag[]>([]);

  const handleTagDelete = (i: number) => {
    const updatedTags = [...tags];
    updatedTags.splice(i, 1);
    setTags(updatedTags);
  };

  return (
    <div className="max-w-4xl p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Add Tags</h2>
        <p className="text-gray-600">
          List of tags given below will be added automatically for all the
          delivery products configured for the customer.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 px-3 py-1 rounded-md"
            >
              <span className="text-sm">
                {tag.tagKey} &raquo; {tag.tagValue}
              </span>
              <button
                onClick={() => handleTagDelete(index)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <TagDialog
        isOpen={isOpen}
        closeDialog={() => setIsOpen(false)}
        tags={tags}
        setTags={setTags}
      />

      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center text-green-600 hover:text-green-700 mb-8"
      >
        <PlusCircle className="mr-2" />
        <span className="font-semibold">Add a Tag</span>
      </button>

      <div className="flex justify-center gap-4">
        <button className="px-8 py-2 border border-gray-900 rounded-md hover:bg-gray-50 transition-colors">
          Close
        </button>
        <button className="px-8 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}

export default OnboardTaggingStep;
