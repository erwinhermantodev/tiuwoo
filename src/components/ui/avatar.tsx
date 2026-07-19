import { cn } from "@/lib/utils";

const gradients: Record<string, string> = {
  blush: "radial-gradient(circle at 32% 28%, #D98C93 0%, #8E4A50 78%)",
  sage: "radial-gradient(circle at 32% 28%, #8A9A7E 0%, #4E5C43 80%)",
  clay: "radial-gradient(circle at 32% 28%, #C97B4E 0%, #8A4E27 80%)",
  taupe: "radial-gradient(circle at 32% 28%, #B8ABA0 0%, #4A4038 80%)",
};

function Avatar({
  initials,
  color = "blush",
  size = "sm",
  className,
}: {
  initials: string;
  color?: keyof typeof gradients;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 font-[family-name:var(--font-display)] italic font-semibold text-[#FBF3F1]",
        size === "sm" ? "size-[30px] text-[13px]" : "size-[38px] text-[16px]",
        className
      )}
      style={{ background: gradients[color] || gradients.blush }}
    >
      {initials.charAt(0).toUpperCase()}
    </div>
  );
}

export { Avatar, gradients };
