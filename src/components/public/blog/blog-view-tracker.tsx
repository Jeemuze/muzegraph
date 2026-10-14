"use client";

import { useEffect } from "react";

type Props = {
  postId: string;
};

export default function BlogViewTracker({
  postId,
}: Props) {
  useEffect(() => {
    fetch(`/api/blog/${postId}/view`, {
      method: "POST",
    });
  }, [postId]);

  return null;
}
