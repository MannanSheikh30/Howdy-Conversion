import ImageReveal from "@/components/ui/image-tiles";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f0e7]">
      <section className="w-full bg-[#f7f0e7] py-20">
        <div className="mx-auto max-w-[1440px] px-[70px] max-md:px-4">
          <h1 className="text-4xl font-bold">Wildest Section</h1>
          <p className="mt-2 text-sm opacity-70">
            This replaces the old mouse-trail animation with the ImageReveal tiles animation.
          </p>
          <div className="mt-8 flex justify-center">
            <ImageReveal
              leftImage="https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=60"
              middleImage="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60"
              rightImage="https://images.unsplash.com/photo-1550547660-0d6b4f13ed90?auto=format&fit=crop&w=800&q=60"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

