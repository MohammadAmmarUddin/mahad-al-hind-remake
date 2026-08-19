const FeatureCard = ({ img, title, desc }) => {
  return (
    <div className="card-interactive p-6 text-center">
      {img && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <img src={img} alt={title || ""} className="h-8 w-8 object-contain" />
        </div>
      )}
      <h3 className="font-heading text-heading-sm font-semibold text-neutral-800">
        {title}
      </h3>
      {desc && (
        <p className="mt-2 text-body-sm leading-relaxed text-neutral-500">
          {desc}
        </p>
      )}
    </div>
  );
};

export default FeatureCard;
