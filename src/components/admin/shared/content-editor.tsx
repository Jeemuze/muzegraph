"use client";

import { useState } from "react";
import contentData from "@/content/content.json";

export function ContentEditor() {
  const [json, setJson] = useState(JSON.stringify(contentData, null, 2));

  function handleSave() {
    console.log("Save nanti ke API", json);
    alert("Simulasi save ✅");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Content</h1>
      <textarea
        className="w-full h-[400px] border p-4 font-mono text-sm"
        value={json}
        onChange={(e) => setJson(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Save
      </button>
    </div>
  );
}
