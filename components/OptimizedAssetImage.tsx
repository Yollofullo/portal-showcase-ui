import Image from "next/image";

export default function OptimizedAssetImage() {
  return (
    <div className="w-72 h-72 relative mx-auto">
      <Image
        src="/assets/responsive_sample.jpg"
        alt="Responsive Example"
        layout="fill"
        objectFit="cover"
        className="rounded-lg shadow"
        priority
      />
    </div>
  );
}