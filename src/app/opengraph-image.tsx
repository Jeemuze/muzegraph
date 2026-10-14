import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OGImage() {
  const seo = await prisma.seo.findFirst();

  const siteName = seo?.siteName || "My Website";
  const description = seo?.ogDescription || seo?.description || "Website description";

  return new ImageResponse(
    (
      <div
        style={{
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <h1
          style={{
            fontSize: 64,
            color: "white",
            fontWeight: 700,
          }}
        >
          {siteName}
        </h1>

        <p
          style={{
            fontSize: 32,
            color: "#ccc",
            marginTop: 20,
          }}
        >
          {description}
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
