const GalleryCard = ({ image, name }) => {
  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-[0_22px_60px_rgba(16,24,40,0.12)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(16,24,40,0.16)]">
      <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-700 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
      </div>
      <div className="px-4 py-4 text-center sm:px-5">
        <h3 className="line-clamp-2 min-h-12 text-base font-semibold text-emerald-800 sm:text-lg">
          {name || " "}
        </h3>
      </div>
    </article>
  );
};

export default GalleryCard;
