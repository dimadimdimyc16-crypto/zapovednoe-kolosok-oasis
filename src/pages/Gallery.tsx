import { Layout } from "@/components/Layout";

interface GalleryProps {
  settlement: "zapovednoe" | "kolosok";
}

const Gallery = ({ settlement }: GalleryProps) => {
  const images = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800",
    "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=800",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800",
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=800",
  ];

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Галерея</h1>
          <p className="text-lg text-muted-foreground">
            Фотографии поселка и окрестностей
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative h-64 rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-smooth cursor-pointer group"
            >
              <img
                src={src}
                alt={`Фото ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500"
              />
              <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-smooth" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
