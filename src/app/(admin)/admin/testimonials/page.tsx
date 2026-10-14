import TestimonialTable from "@/components/admin/testimonials/testimonial-table";
import { requirePermissionPage } from "@/lib/guards/auth";
import { getTestimonials } from "@/lib/services/testimonial.service";

export default async function TestimonialsPage() {
  await requirePermissionPage("manage_testimonial");

  const testimonials = await getTestimonials();

  return <TestimonialTable testimonials={testimonials} />;
}
